import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth-server";
import { imageExtension, uploadPublicImage } from "@/lib/storage/oss";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  try {
    const file = (await request.formData()).get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "未选择文件" }, { status: 400 });
    if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "图片大小不能超过 5MB" }, { status: 400 });
    const extension = imageExtension(file.type);
    if (!extension) return NextResponse.json({ error: "仅支持 JPG、PNG 或 WebP 图片" }, { status: 400 });

    const url = await uploadPublicImage(`posts/${user.id}/${randomUUID()}.${extension}`, file);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("post image upload failed", error);
    return NextResponse.json({ error: "上传失败，请稍后重试" }, { status: 500 });
  }
}
