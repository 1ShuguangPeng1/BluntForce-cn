"use server";

import { db } from "@/lib/db";
import { comments } from "@/lib/db/schema";
import { getServerUser } from "@/lib/auth-server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createComment(postId: string, content: string, parentId?: string) {
  const user = await getServerUser();
  if (!user) throw new Error("请先登录");
  if (!content.trim()) throw new Error("评论内容不能为空");
  if (content.trim().length > 2_000) throw new Error("评论不能超过 2000 个字符");

  await db.insert(comments).values({
    post_id: postId,
    author_id: user.id,
    parent_id: parentId ?? null,
    content: content.trim(),
  });

  revalidatePath(`/post/${postId}`);
}

export async function deleteComment(id: string) {
  const user = await getServerUser();
  if (!user) throw new Error("请先登录");

  const existing = await db.query.comments.findFirst({
    where: eq(comments.id, id),
  });

  if (!existing || existing.author_id !== user.id) throw new Error("无权操作");

  await db.delete(comments).where(eq(comments.id, id));
  revalidatePath(`/post/${existing.post_id}`);
}

export async function getCommentsByPostId(postId: string) {
  const all = await db.query.comments.findMany({
    where: eq(comments.post_id, postId),
    orderBy: (comments, { asc }) => [asc(comments.created_at)],
  });

  const authors = await Promise.all(
    [...new Set(all.map((c) => c.author_id))].map(async (userId) => {
      const u = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.id, userId),
        columns: { id: true, username: true, avatar_url: true },
      });
      return { userId, author: u };
    })
  );

  const authorMap = new Map(authors.map((a) => [a.userId, a.author]));

  return all.map((c) => ({
    ...c,
    author: authorMap.get(c.author_id) ?? null,
  }));
}
