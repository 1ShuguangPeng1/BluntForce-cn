"use client";

import { LikeButton } from "@/components/post/like-button";
import { FavoriteButton } from "@/components/post/favorite-button";
import { togglePostLike } from "@/lib/actions/like";
import { toggleFavorite } from "@/lib/actions/favorite";

type Props = {
  postId: string;
  initialLiked: boolean;
  initialLikeCount: number;
  initialFavorited: boolean;
};

export function PostActions({ postId, initialLiked, initialLikeCount, initialFavorited }: Props) {
  return (
    <div className="flex items-center gap-4">
      <LikeButton
        count={initialLikeCount}
        liked={initialLiked}
        onToggle={() => togglePostLike(postId)}
      />
      <FavoriteButton
        favorited={initialFavorited}
        onToggle={() => toggleFavorite(postId)}
      />
    </div>
  );
}
