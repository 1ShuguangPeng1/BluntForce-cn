import { cache } from "react";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

export type ServerUser = {
  id: string;
  email: string;
  username: string;
};

export const getServerUser = cache(async (): Promise<ServerUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const payload = token ? await verifySession(token) : null;
  if (!payload) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.id, payload.sub),
    columns: { id: true, email: true, username: true },
  });

  return user ?? null;
});
