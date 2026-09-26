"use server";

import { db } from "@/lib/db";
import { posts, comments, likes } from "@/lib/db/schema";
import { getServerUser } from "@/lib/auth-server";
import { eq, desc, and, or, ilike, sql, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { isOwnedStorageUrl } from "@/lib/storage/oss";

type PostInput = {
  title: string;
  content: string;
  category: string;
  tags?: string[];
  image_urls?: string[];
};

function validatePostInput(data: PostInput) {
  const title = data.title?.trim();
  const content = data.content?.trim();
  const categories = new Set(["experience", "knowledge", "question", "daily"]);
  const tags = (data.tags ?? []).map((tag) => tag.trim()).filter(Boolean);
  const imageUrls = data.image_urls ?? [];

  if (!title || title.length > 120) throw new Error("标题不能为空且不能超过 120 个字符");
  if (!content || content.length > 20_000) throw new Error("正文不能为空且不能超过 20000 个字符");
  if (!categories.has(data.category)) throw new Error("帖子分类无效");
  if (tags.length > 8 || tags.some((tag) => tag.length > 24)) throw new Error("标签最多 8 个，每个不超过 24 个字符");
  if (imageUrls.length > 9 || imageUrls.some((url) => !isOwnedStorageUrl(url))) {
    throw new Error("图片来源无效");
  }
  return { title, content, tags, imageUrls };
}

export async function createPost(data: PostInput) {
  const user = await getServerUser();
  if (!user) throw new Error("请先登录");
  const input = validatePostInput(data);

  const [post] = await db
    .insert(posts)
    .values({
      author_id: user.id,
      title: input.title,
      content: input.content,
      category: data.category,
      tags: input.tags,
      image_urls: input.imageUrls,
    })
    .returning();

  revalidatePath("/");
  return post;
}

export async function updatePost(id: string, data: PostInput) {
  const user = await getServerUser();
  if (!user) throw new Error("请先登录");

  const existing = await db.query.posts.findFirst({ where: eq(posts.id, id) });
  if (!existing || existing.author_id !== user.id) throw new Error("无权操作");
  const input = validatePostInput(data);

  await db
    .update(posts)
    .set({
      title: input.title,
      content: input.content,
      category: data.category,
      tags: input.tags,
      image_urls: input.imageUrls,
      updated_at: new Date(),
    })
    .where(eq(posts.id, id));

  revalidatePath(`/post/${id}`);
}

export async function deletePost(id: string) {
  const user = await getServerUser();
  if (!user) throw new Error("请先登录");

  const existing = await db.query.posts.findFirst({ where: eq(posts.id, id) });
  if (!existing || existing.author_id !== user.id) throw new Error("无权操作");

  await db.delete(posts).where(eq(posts.id, id));
  revalidatePath("/");
}

export async function getPostById(id: string) {
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, id),
  });
  if (post) {
    const author = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, post.author_id),
      columns: { id: true, username: true, avatar_url: true },
    });
    return { ...post, author };
  }
  return post;
}

export async function getPosts(options?: {
  category?: string;
  authorId?: string;
  tag?: string;
  sort?: "latest" | "hot" | "most_liked";
  page?: number;
  limit?: number;
}) {
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 10;
  const offset = (page - 1) * limit;
  const sort = options?.sort ?? "latest";

  const conditions = [];

  if (options?.category && options.category !== "all") {
    conditions.push(eq(posts.category, options.category));
  }
  if (options?.authorId) {
    conditions.push(eq(posts.author_id, options.authorId));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const orderFn = sort === "hot"
    ? [desc(posts.view_count), desc(posts.created_at)]
    : [desc(posts.is_pinned), desc(posts.created_at)];

  const all = await db.query.posts.findMany({ where, orderBy: orderFn });

  // Tag filter in-memory
  const filtered = options?.tag
    ? all.filter((p) => p.tags?.includes(options.tag!))
    : all;

  const total = filtered.length;
  const items = filtered.slice(offset, offset + limit);

  if (items.length === 0) return { items: [], total };

  // Batch: authors
  const authorIds = [...new Set(items.map((p) => p.author_id))];
  const usersData = await db.query.users.findMany({
    columns: { id: true, username: true, avatar_url: true },
  });
  const authorMap = new Map(usersData.filter((u) => authorIds.includes(u.id)).map((u) => [u.id, u]));

  // Batch: comment counts
  const postIds = items.map((p) => p.id);
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

  const itemsWithMeta = items.map((post) => ({
    ...post,
    author: authorMap.get(post.author_id) ?? null,
    _count: {
      comments: commentMap.get(post.id) ?? 0,
      likes: likeMap.get(post.id) ?? 0,
    },
  }));

  return { items: itemsWithMeta, total };
}

export async function searchPosts(query: string, page = 1, limit = 10) {
  const offset = (page - 1) * limit;
  const pattern = `%${query}%`;

  const results = await db.query.posts.findMany({
    where: or(
      ilike(posts.title, pattern),
      ilike(posts.content, pattern)
    ),
    orderBy: [desc(posts.created_at)],
  });

  const total = results.length;
  const items = results.slice(offset, offset + limit);

  if (items.length === 0) return { items: [], total };

  const authorIds = [...new Set(items.map((p) => p.author_id))];
  const usersData = await db.query.users.findMany({
    columns: { id: true, username: true, avatar_url: true },
  });
  const authorMap = new Map(usersData.filter((u) => authorIds.includes(u.id)).map((u) => [u.id, u]));

  const postIds = items.map((p) => p.id);
  const commentCounts = await db
    .select({ post_id: comments.post_id, count: sql<number>`count(*)` })
    .from(comments)
    .where(inArray(comments.post_id, postIds))
    .groupBy(comments.post_id);
  const commentMap = new Map(commentCounts.map((c) => [c.post_id, c.count]));

  const likeCounts = await db
    .select({ post_id: likes.post_id, count: sql<number>`count(*)` })
    .from(likes)
    .where(inArray(likes.post_id, postIds))
    .groupBy(likes.post_id);
  const likeMap = new Map(likeCounts.map((l) => [l.post_id, l.count]));

  const itemsWithMeta = items.map((post) => ({
    ...post,
    author: authorMap.get(post.author_id) ?? null,
    _count: {
      comments: commentMap.get(post.id) ?? 0,
      likes: likeMap.get(post.id) ?? 0,
    },
  }));

  return { items: itemsWithMeta, total };
}

export async function recordPostView(id: string) {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  if (cookieStore.get(`pv_${id}`)) return;
  cookieStore.set(`pv_${id}`, "1", { maxAge: 1800, path: "/" });
  await db
    .update(posts)
    .set({ view_count: sql`${posts.view_count} + 1` })
    .where(eq(posts.id, id));
}

export async function incrementViewCount(id: string) {
  await db
    .update(posts)
    .set({ view_count: sql`${posts.view_count} + 1` })
    .where(eq(posts.id, id));
}

export async function getAllTags() {
  const all = await db.query.posts.findMany({
    columns: { tags: true },
    limit: 100,
  });

  const tagCounts: Record<string, number> = {};
  for (const p of all) {
    if (p.tags) {
      for (const t of p.tags) {
        tagCounts[t] = (tagCounts[t] ?? 0) + 1;
      }
    }
  }

  return Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([name, count]) => ({ name, count }));
}
