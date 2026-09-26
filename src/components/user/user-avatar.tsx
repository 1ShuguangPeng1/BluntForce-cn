"use client";

import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";

type Props = {
  url: string | null;
  fallback: string;
  editable?: boolean;
  size?: "sm" | "md" | "lg";
};

const sizeMap = { sm: "h-10 w-10", md: "h-16 w-16", lg: "h-24 w-24" };
const iconMap = { sm: "h-3.5 w-3.5", md: "h-5 w-5", lg: "h-7 w-7" };

export function UserAvatar({ url, fallback, editable = false, size = "md" }: Props) {
  const [avatarUrl, setAvatarUrl] = useState(url);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload-avatar", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setAvatarUrl(data.url);

        // 动态导入 Server Action 更新 profile
        const { updateProfile } = await import("@/lib/actions/user");
        await updateProfile({ avatar_url: data.url });
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative inline-block">
      <Avatar className={`${sizeMap[size]} ${editable ? "cursor-pointer" : ""}`}>
        <AvatarImage src={avatarUrl ?? undefined} />
        <AvatarFallback className="text-lg">{fallback}</AvatarFallback>
      </Avatar>
      {editable && (
        <>
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-apple transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ width: "1.75rem", height: "1.75rem" }}
          >
            <Camera className={iconMap[size]} />
          </button>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </>
      )}
    </div>
  );
}
