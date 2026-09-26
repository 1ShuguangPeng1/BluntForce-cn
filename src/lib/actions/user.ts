"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getServerUser } from "@/lib/auth-server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { isOwnedStorageUrl } from "@/lib/storage/oss";

export async function updateProfile(data: {
  username?: string;
  bio?: string;
  avatar_url?: string;
}) {
  const user = await getServerUser();
  if (!user) throw new Error("请先登录");
  if (data.username && !/^[\p{L}\p{N}_-]{2,24}$/u.test(data.username)) {
    throw new Error("用户名需为 2 至 24 个字符，只能包含文字、数字、下划线或连字符");
  }
  if (data.bio && data.bio.length > 500) throw new Error("简介不能超过 500 个字符");
  if (data.avatar_url && !isOwnedStorageUrl(data.avatar_url)) throw new Error("头像来源无效");

  await db.update(users).set({ ...data, updated_at: new Date() }).where(eq(users.id, user.id));

  revalidatePath("/profile");
  revalidatePath("/settings");
}

export async function getProfileByUsername(username: string) {
  const profile = await db.query.users.findFirst({
    where: eq(users.username, username),
  });
  return profile ?? null;
}

export async function getCurrentUserProfile() {
  const user = await getServerUser();
  if (!user) return null;

  const profile = await db.query.users.findFirst({
    where: eq(users.id, user.id),
  });
  return profile ?? null;
}
