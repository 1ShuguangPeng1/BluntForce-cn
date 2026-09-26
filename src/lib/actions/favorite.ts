"use server";

import { db } from "@/lib/db";
import { favorites, posts, comments, likes } from "@/lib/db/schema";
import { getServerUser } from "@/lib/auth-server";
import { and, eq, desc, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function toggleFavorite(postId: string) {
  const user = await getServerUser();
  if (!user) throw new Error("请先登录");

  const existing = await db.query.favorites.findFirst({
    where: and(eq(favorites.user_id, user.id), eq(favorites.post_id, postId)),
  });

  if (existing) {
    await db.delete(favorites).where(eq(favorites.id, existing.id));
  } else {
    await db.insert(favorites).values({
      user_id: user.id,
      post_id: postId,
    });
  }

  revalidatePath(`/post/${postId}`);
}

export async function userFavoritedPost(postId: string) {
  const user = await getServerUser();
  if (!user) return false;

  const existing = await db.query.favorites.findFirst({
    where: and(eq(favorites.user_id, user.id), eq(favorites.post_id, postId)),
  });
  return !!existing;
}

export async function getMyFavorites() {
  const user = await getServerUser();
  if (!user) throw new Error("请先登录");

  const favs = await db.query.favorites.findMany({
    where: eq(favorites.user_id, user.id),
    orderBy: [desc(favorites.created_at)],
  });

  if (favs.length === 0) return [];

  const postIds = favs.map((f) => f.post_id);

  // Batch: posts only for favorited IDs
  const postsData = await db.query.posts.findMany({
    where: inArray(posts.id, postIds),
    orderBy: [desc(posts.created_at)],
  });

  if (postsData.length === 0) return [];

  // Batch: authors
  const authorIds = [...new Set(postsData.map((p) => p.author_id))];
  const usersData = await db.query.users.findMany({
    columns: { id: true, username: true, avatar_url: true },
  });
  const authorMap = new Map(usersData.filter((u) => authorIds.includes(u.id)).map((u) => [u.id, u]));

  // Batch: comment counts
  const commentCounts = await db
    .select({ post_id: comments.post_id, count: sql<number>`count(*)` })
    .from(comments)
    .where(inArray(comments.post_id, postIds))
    .groupBy(comments.post_id);
  const commentMap = new Map(commentCounts.map((c) => [c.post_id, c.count]));

  // Batch: like counts
  const likeCounts = await db
    .select({ post_id: likes.post_id, count: sql<number>`count(*)` })
    .from(likes)
    .where(inArray(likes.post_id, postIds))
    .groupBy(likes.post_id);
  const likeMap = new Map(likeCounts.map((l) => [l.post_id, l.count]));

  // Sort by favorited date
  const favDateMap = new Map(favs.map((f) => [f.post_id, f.created_at]));

  return postsData.map((p) => ({
    ...p,
    author: authorMap.get(p.author_id) ?? null,
    _count: {
      comments: commentMap.get(p.id) ?? 0,
      likes: likeMap.get(p.id) ?? 0,
    },
    favorited_at: favDateMap.get(p.id),
  }));
}
