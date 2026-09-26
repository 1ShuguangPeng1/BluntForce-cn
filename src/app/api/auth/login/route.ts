import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createSession, sessionCookie } from "@/lib/session";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  if (!email || !password) {
    return NextResponse.json({ error: "请输入邮箱和密码" }, { status: 400 });
  }

  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user || !(await compare(password, user.password_hash))) {
    return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
  }

  const token = await createSession({ sub: user.id, email: user.email, username: user.username });
  const response = NextResponse.json({ user: { id: user.id, email: user.email, username: user.username } });
  response.cookies.set("bluntforce_session", token, sessionCookie);
  return response;
}
