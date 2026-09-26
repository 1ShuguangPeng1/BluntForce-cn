import OSS from "ali-oss";

const allowedImages = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

type AllowedImageType = keyof typeof allowedImages;

function getClient() {
  const region = process.env.OSS_REGION;
  const accessKeyId = process.env.OSS_ACCESS_KEY_ID;
  const accessKeySecret = process.env.OSS_ACCESS_KEY_SECRET;
  const bucket = process.env.OSS_BUCKET;
  if (!region || !accessKeyId || !accessKeySecret || !bucket) {
    throw new Error("OSS credentials are not configured");
  }
  return new OSS({ region, accessKeyId, accessKeySecret, bucket, secure: true });
}

export function imageExtension(contentType: string): string | null {
  return contentType in allowedImages ? allowedImages[contentType as AllowedImageType] : null;
}

function hasExpectedImageSignature(bytes: Uint8Array, contentType: string) {
  if (contentType === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (contentType === "image/png") return bytes.slice(0, 8).every((value, index) => value === [137, 80, 78, 71, 13, 10, 26, 10][index]);
  if (contentType === "image/webp") {
    return new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" && new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
  }
  return false;
}

export async function uploadPublicImage(key: string, file: File) {
  const extension = imageExtension(file.type);
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!extension || !hasExpectedImageSignature(bytes, file.type)) {
    throw new Error("图片格式不受支持或文件内容异常");
  }

  const publicBaseUrl = process.env.OSS_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (!publicBaseUrl) throw new Error("OSS_PUBLIC_BASE_URL is not configured");

  await getClient().put(key, Buffer.from(bytes), {
    headers: { "Content-Type": file.type, "Cache-Control": "public, max-age=31536000, immutable" },
  });
  return `${publicBaseUrl}/${key}`;
}

export function isOwnedStorageUrl(value: string) {
  const base = process.env.OSS_PUBLIC_BASE_URL?.replace(/\/$/, "");
  return Boolean(base && value.startsWith(`${base}/`));
}
