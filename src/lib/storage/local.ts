import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";

const allowedImages = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

type AllowedImageType = keyof typeof allowedImages;

export function imageExtension(contentType: string): string | null {
  return contentType in allowedImages ? allowedImages[contentType as AllowedImageType] : null;
}

function hasExpectedImageSignature(bytes: Uint8Array, contentType: string) {
  if (contentType === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (contentType === "image/png") {
    const signature = [137, 80, 78, 71, 13, 10, 26, 10];
    return bytes.slice(0, 8).every((value, index) => value === signature[index]);
  }
  if (contentType === "image/webp") {
    return new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
  }
  return false;
}

function resolveUploadPath(key: string) {
  const uploadRoot = path.resolve("/app/uploads");
  const target = path.resolve(uploadRoot, key);
  if (!target.startsWith(`${uploadRoot}${path.sep}`)) throw new Error("Invalid upload path");
  return target;
}

export async function uploadPublicImage(key: string, file: File) {
  const extension = imageExtension(file.type);
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!extension || !hasExpectedImageSignature(bytes, file.type)) {
    throw new Error("图片格式不受支持或文件内容异常");
  }

  const target = resolveUploadPath(key);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, bytes, { flag: "w" });

  const baseUrl = process.env.UPLOAD_PUBLIC_BASE_URL?.replace(/\/$/, "") ?? "";
  return `${baseUrl}/uploads/${key}`;
}

export function isOwnedStorageUrl(value: string) {
  const baseUrl = process.env.UPLOAD_PUBLIC_BASE_URL?.replace(/\/$/, "") ?? "";
  return value.startsWith(`${baseUrl}/uploads/`);
}
