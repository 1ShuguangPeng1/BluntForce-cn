import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server";

export async function GET() {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });
  return NextResponse.json({ user });
}
