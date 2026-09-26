"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";

type Props = {
  favorited: boolean;
  onToggle: () => Promise<void>;
  size?: "sm" | "default";
};

export function FavoriteButton({ favorited, onToggle, size = "default" }: Props) {
  const [pending, startTransition] = useTransition();
  const [optimisticFav, setOptimisticFav] = useState(favorited);

  if (favorited !== optimisticFav && !pending) {
    setOptimisticFav(favorited);
  }

  function handleToggle() {
    startTransition(async () => {
      setOptimisticFav(!optimisticFav);
      try {
        await onToggle();
      } catch {
        setOptimisticFav(optimisticFav);
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
        optimisticFav
          ? "text-amber-500 hover:text-amber-600"
          : "text-muted-foreground hover:text-amber-500"
      }`}
    >
      <Bookmark
        className={`${iconSize} transition-all ${optimisticFav ? "fill-current" : ""}`}
      />
      <span>{optimisticFav ? "已收藏" : "收藏"}</span>
    </button>
  );
}
