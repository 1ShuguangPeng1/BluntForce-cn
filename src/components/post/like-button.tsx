"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";

type Props = {
  count: number;
  liked: boolean;
  onToggle: () => Promise<void>;
  size?: "sm" | "default";
};

export function LikeButton({ count, liked, onToggle, size = "default" }: Props) {
  const [pending, startTransition] = useTransition();
  const [optimisticLiked, setOptimisticLiked] = useState(liked);
  const [optimisticCount, setOptimisticCount] = useState(count);

  // Sync external state changes (e.g., page revalidation)
  if (liked !== optimisticLiked && !pending) {
    setOptimisticLiked(liked);
    setOptimisticCount(count);
  }

  function handleToggle() {
    startTransition(async () => {
      setOptimisticLiked(!optimisticLiked);
      setOptimisticCount(optimisticCount + (optimisticLiked ? -1 : 1));
      try {
        await onToggle();
      } catch {
        setOptimisticLiked(optimisticLiked);
        setOptimisticCount(optimisticCount);
      }
    });
  }

  const iconSize = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const textSize = size === "sm" ? "text-xs" : "text-sm";

  return (
    <button
      onClick={handleToggle}
      disabled={pending}
      className={`inline-flex items-center gap-1 transition-colors ${textSize} ${
        optimisticLiked
          ? "text-red-500 hover:text-red-600"
          : "text-muted-foreground hover:text-red-500"
      }`}
    >
      <Heart
        className={`${iconSize} transition-all ${optimisticLiked ? "fill-current scale-110" : ""}`}
      />
      <span>{optimisticCount}</span>
    </button>
  );
}
