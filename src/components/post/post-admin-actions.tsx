"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pin, PinOff } from "lucide-react";
import { setPostPinned } from "@/lib/actions/post";
import { Button } from "@/components/ui/button";

type Props = {
  postId: string;
  initiallyPinned: boolean;
};

export function PostAdminActions({ postId, initiallyPinned }: Props) {
  const router = useRouter();
  const [pinned, setPinned] = useState(initiallyPinned);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function togglePinned() {
    const nextPinned = !pinned;
    setSaving(true);
    setError("");
    try {
      await setPostPinned(postId, nextPinned);
      setPinned(nextPinned);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <Button type="button" variant="outline" size="sm" onClick={togglePinned} disabled={saving}>
        {saving ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : pinned ? (
          <PinOff className="mr-2 h-4 w-4" />
        ) : (
          <Pin className="mr-2 h-4 w-4" />
        )}
        {pinned ? "取消置顶" : "置顶到首页"}
      </Button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
