"use server";

import { db } from "@/lib/db";
import { likes } from "@/lib/db/schema";
import { getServerUser } from "@/lib/auth-server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function togglePostLike(postId: string) {
  const user = await getServerUser();
  if (!user) throw new Error("请先登录");

  const existing = await db.query.likes.findFirst({
    where: and(eq(likes.user_id, user.id), eq(likes.post_id, postId)),
  });

  if (existing) {
    await db.delete(likes).where(eq(likes.id, existing.id));
  } else {
    await db.insert(likes).values({
      user_id: user.id,
      post_id: postId,
    });
  }

  revalidatePath(`/post/${postId}`);
}

export async function toggleCommentLike(commentId: string, postId: string) {
  const user = await getServerUser();
  if (!user) throw new Error("请先登录");

  const existing = await db.query.likes.findFirst({
    where: and(eq(likes.user_id, user.id), eq(likes.comment_id, commentId)),
  });

  if (existing) {
    await db.delete(likes).where(eq(likes.id, existing.id));
  } else {
    await db.insert(likes).values({
      user_id: user.id,
      comment_id: commentId,
    });
  }

  revalidatePath(`/post/${postId}`);
}

export async function getPostLikeCount(postId: string) {
  const result = await db.query.likes.findMany({
    where: eq(likes.post_id, postId),
    columns: { id: true, user_id: true },
  });
  return { count: result.length, userIds: result.map((l) => l.user_id) };
}

export async function getCommentLikeCounts(commentIds: string[]) {
  if (commentIds.length === 0) return new Map<string, { count: number }>();

  const all = await db.query.likes.findMany({
    columns: { comment_id: true, user_id: true },
  });

  const map = new Map<string, { count: number; userIds: string[] }>();
  for (const l of all) {
    if (!l.comment_id) continue;
    const entry = map.get(l.comment_id) ?? { count: 0, userIds: [] };
    entry.count++;
    entry.userIds.push(l.user_id);
    map.set(l.comment_id, entry);
  }
  return map;
}

export async function userLikedPost(postId: string) {
  const user = await getServerUser();
  if (!user) return false;

  const existing = await db.query.likes.findFirst({
    where: and(eq(likes.user_id, user.id), eq(likes.post_id, postId)),
  });
  return !!existing;
}
