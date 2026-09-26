"use server";

import { and, asc, desc, eq, ilike, inArray, ne, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getServerUser } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { friendships, messages, users } from "@/lib/db/schema";

async function relationshipBetween(userId: string, otherId: string) {
  return db.query.friendships.findFirst({
    where: or(
      and(eq(friendships.requester_id, userId), eq(friendships.addressee_id, otherId)),
      and(eq(friendships.requester_id, otherId), eq(friendships.addressee_id, userId)),
    ),
  });
}

async function requireAcceptedFriend(userId: string, otherId: string) {
  const relationship = await relationshipBetween(userId, otherId);
  if (!relationship || relationship.status !== "accepted") {
    throw new Error("只有好友之间可以发送私信");
  }
  return relationship;
}

function refreshSocialPages(usernames: string[] = []) {
  revalidatePath("/friends");
  for (const username of usernames) revalidatePath(`/profile/${username}`);
}

export async function getFriendOverview() {
  const user = await getServerUser();
  if (!user) throw new Error("请先登录");

  const relationships = await db.query.friendships.findMany({
    where: or(eq(friendships.requester_id, user.id), eq(friendships.addressee_id, user.id)),
    orderBy: [desc(friendships.updated_at)],
  });

  const otherIds = [...new Set(relationships.map((item) =>
    item.requester_id === user.id ? item.addressee_id : item.requester_id,
  ))];
  const people = otherIds.length > 0
    ? await db.query.users.findMany({
        where: inArray(users.id, otherIds),
        columns: { id: true, username: true, avatar_url: true, bio: true },
      })
    : [];
  const peopleMap = new Map(people.map((person) => [person.id, person]));

  const decorated = relationships.map((relationship) => {
    const otherId = relationship.requester_id === user.id
      ? relationship.addressee_id
      : relationship.requester_id;
    return { ...relationship, person: peopleMap.get(otherId) ?? null };
  });

  return {
    friends: decorated.filter((item) => item.status === "accepted"),
    incoming: decorated.filter((item) => item.status === "pending" && item.addressee_id === user.id),
    outgoing: decorated.filter((item) => item.status === "pending" && item.requester_id === user.id),
  };
}

export async function getFriendRelationship(otherUserId: string) {
  const user = await getServerUser();
  if (!user) return { kind: "anonymous" as const, relationship: null };
  if (user.id === otherUserId) return { kind: "self" as const, relationship: null };

  const relationship = await relationshipBetween(user.id, otherUserId);
  if (!relationship) return { kind: "none" as const, relationship: null };
  if (relationship.status === "accepted") {
    return { kind: "friend" as const, relationship };
  }
  return {
    kind: relationship.requester_id === user.id ? "outgoing" as const : "incoming" as const,
    relationship,
  };
}

export async function searchPeople(query: string) {
  const user = await getServerUser();
  if (!user) throw new Error("请先登录");

  const value = query.trim();
  if (value.length < 2) return [];

  const people = await db.query.users.findMany({
    where: and(ne(users.id, user.id), ilike(users.username, `%${value}%`)),
    columns: { id: true, username: true, avatar_url: true, bio: true },
    orderBy: [asc(users.username)],
    limit: 10,
  });

  if (people.length === 0) return [];
  const personIds = people.map((person) => person.id);
  const relationships = await db.query.friendships.findMany({
    where: and(
      or(eq(friendships.requester_id, user.id), eq(friendships.addressee_id, user.id)),
      or(inArray(friendships.requester_id, personIds), inArray(friendships.addressee_id, personIds)),
    ),
  });

  return people.map((person) => {
    const relationship = relationships.find((item) =>
      item.requester_id === person.id || item.addressee_id === person.id,
    );
    return {
      ...person,
      relationship: relationship
        ? {
            id: relationship.id,
            status: relationship.status,
            direction: relationship.requester_id === user.id ? "outgoing" as const : "incoming" as const,
          }
        : null,
    };
  });
}

export async function sendFriendRequest(targetUserId: string) {
  const user = await getServerUser();
  if (!user) throw new Error("请先登录");
  if (targetUserId === user.id) throw new Error("不能添加自己为好友");

  const target = await db.query.users.findFirst({
    where: eq(users.id, targetUserId),
    columns: { id: true, username: true },
  });
  if (!target) throw new Error("用户不存在");

  const existing = await relationshipBetween(user.id, targetUserId);
  if (existing?.status === "accepted") throw new Error("你们已经是好友");
  if (existing?.requester_id === targetUserId) throw new Error("对方已向你发送申请，请先接受");
  if (existing) throw new Error("好友申请已经发送");

  try {
    await db.insert(friendships).values({ requester_id: user.id, addressee_id: targetUserId });
  } catch (error) {
    if ((error as { code?: string }).code === "23505") throw new Error("好友关系已经存在");
    throw error;
  }

  refreshSocialPages([target.username]);
}

export async function acceptFriendRequest(requestId: string) {
  const user = await getServerUser();
  if (!user) throw new Error("请先登录");

  const request = await db.query.friendships.findFirst({ where: eq(friendships.id, requestId) });
  if (!request || request.addressee_id !== user.id || request.status !== "pending") {
    throw new Error("好友申请不存在或无权操作");
  }

  await db
    .update(friendships)
    .set({ status: "accepted", updated_at: new Date() })
    .where(eq(friendships.id, requestId));
  refreshSocialPages();
}

export async function rejectFriendRequest(requestId: string) {
  const user = await getServerUser();
  if (!user) throw new Error("请先登录");

  const request = await db.query.friendships.findFirst({ where: eq(friendships.id, requestId) });
  if (!request || request.addressee_id !== user.id || request.status !== "pending") {
    throw new Error("好友申请不存在或无权操作");
  }
  await db.delete(friendships).where(eq(friendships.id, requestId));
  refreshSocialPages();
}

export async function cancelFriendRequest(requestId: string) {
  const user = await getServerUser();
  if (!user) throw new Error("请先登录");

  const request = await db.query.friendships.findFirst({ where: eq(friendships.id, requestId) });
  if (!request || request.requester_id !== user.id || request.status !== "pending") {
    throw new Error("好友申请不存在或无权操作");
  }
  await db.delete(friendships).where(eq(friendships.id, requestId));
  refreshSocialPages();
}

export async function removeFriend(friendshipId: string) {
  const user = await getServerUser();
  if (!user) throw new Error("请先登录");

  const friendship = await db.query.friendships.findFirst({ where: eq(friendships.id, friendshipId) });
  if (
    !friendship ||
    friendship.status !== "accepted" ||
    (friendship.requester_id !== user.id && friendship.addressee_id !== user.id)
  ) {
    throw new Error("好友关系不存在或无权操作");
  }
  await db.delete(friendships).where(eq(friendships.id, friendshipId));
  refreshSocialPages();
}

export async function getConversation(otherUserId: string) {
  const user = await getServerUser();
  if (!user) throw new Error("请先登录");
  await requireAcceptedFriend(user.id, otherUserId);

  const otherUser = await db.query.users.findFirst({
    where: eq(users.id, otherUserId),
    columns: { id: true, username: true, avatar_url: true },
  });
  if (!otherUser) throw new Error("用户不存在");

  const latest = await db.query.messages.findMany({
    where: or(
      and(eq(messages.sender_id, user.id), eq(messages.receiver_id, otherUserId)),
      and(eq(messages.sender_id, otherUserId), eq(messages.receiver_id, user.id)),
    ),
    orderBy: [desc(messages.created_at)],
    limit: 100,
  });

  await db
    .update(messages)
    .set({ is_read: true })
    .where(and(
      eq(messages.sender_id, otherUserId),
      eq(messages.receiver_id, user.id),
      eq(messages.is_read, false),
    ));

  return { currentUserId: user.id, otherUser, messages: latest.reverse() };
}

export async function sendMessage(receiverId: string, content: string) {
  const user = await getServerUser();
  if (!user) throw new Error("请先登录");
  const value = content.trim();
  if (!value || value.length > 2_000) throw new Error("消息应为 1 至 2000 个字符");
  await requireAcceptedFriend(user.id, receiverId);

  const [message] = await db
    .insert(messages)
    .values({ sender_id: user.id, receiver_id: receiverId, content: value })
    .returning();
  return message;
}
