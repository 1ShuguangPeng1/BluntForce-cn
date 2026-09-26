import { randomUUID } from "crypto";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createSession, sessionCookie } from "@/lib/session";

export const runtime = "nodejs";

function validUsername(value: unknown): value is string {
  return typeof value === "string" && /^[\p{L}\p{N}_-]{2,24}$/u.test(value);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const username = typeof body?.username === "string" ? body.username.trim() : "";

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "请输入有效的邮箱地址" }, { status: 400 });
  }
  if (!validUsername(username)) {
    return NextResponse.json({ error: "用户名需为 2 至 24 个字符，只能包含文字、数字、下划线或连字符" }, { status: 400 });
  }
  if (password.length < 8 || password.length > 128) {
    return NextResponse.json({ error: "密码长度应为 8 至 128 位" }, { status: 400 });
  }

  try {
    const user = {
      id: randomUUID(),
      email,
      username,
      password_hash: await hash(password, 12),
    };
    await db.insert(users).values(user);
    const token = await createSession({ sub: user.id, email, username });
    const response = NextResponse.json({ user: { id: user.id, email, username } }, { status: 201 });
    response.cookies.set("bluntforce_session", token, sessionCookie);
    return response;
  } catch (error) {
    if ((error as { code?: string }).code === "23505") {
      return NextResponse.json({ error: "邮箱或用户名已被使用" }, { status: 409 });
    }
    console.error("register failed", error);
    return NextResponse.json({ error: "注册失败，请稍后重试" }, { status: 500 });
  }
}
