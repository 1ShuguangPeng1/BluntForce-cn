/* eslint-disable @next/next/no-img-element -- uploaded images are served by the configured storage origin. */

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Heart, Eye, Pin } from "lucide-react";

const categoryLabels: Record<string, string> = {
  experience: "经验分享",
  knowledge: "健康知识",
  question: "提问求助",
  daily: "日常分享",
};

const categoryColors: Record<string, string> = {
  experience: "bg-blue-50 text-blue-700",
  knowledge: "bg-emerald-50 text-emerald-700",
  question: "bg-amber-50 text-amber-700",
  daily: "bg-purple-50 text-purple-700",
};

type PostCardProps = {
  post: {
    id: string;
    title: string;
    content: string;
    image_urls: string[] | null;
    category: string;
    tags: string[] | null;
    is_pinned?: boolean | null;
    view_count: number | null;
    created_at: string | Date;
    author?: { id: string; username: string; avatar_url: string | null } | null;
    _count?: { comments: number; likes: number } | null;
  };
};

export function PostCard({ post }: PostCardProps) {
  return (
    <Link
      href={`/post/${post.id}`}
      className="block group rounded-2xl border border-border/60 bg-card p-6 shadow-apple-sm hover:shadow-apple-md transition-all duration-200"
    >
      <div className="space-y-3">
        {/* Category + pinned */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex text-xs px-2.5 py-0.5 rounded-full font-medium ${
              categoryColors[post.category] ?? "bg-muted text-muted-foreground"
            }`}
          >
            {categoryLabels[post.category] ?? post.category}
          </span>
          {post.is_pinned && (
            <span className="inline-flex items-center gap-0.5 text-xs text-red-500">
              <Pin className="h-3 w-3" />
              置顶
            </span>
          )}
        </div>

        {/* Title */}
        {post.title && (
          <h3 className="text-lg font-semibold tracking-tight group-hover:text-primary transition-colors line-clamp-2">
            {post.title}
          </h3>
        )}

        {/* Excerpt */}
        {post.content && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {post.content.replace(/[#*`>\[\]!\-]/g, "").substring(0, 200)}
          </p>
        )}

        {post.image_urls && post.image_urls.length > 0 && (
          <div className={`grid gap-2 overflow-hidden rounded-xl ${post.image_urls.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
            {post.image_urls.slice(0, 2).map((url, index) => (
              <div key={url} className="relative">
                <img
                  src={url}
                  alt={post.title || "帖子图片"}
                  className="h-44 w-full object-cover"
                  loading="lazy"
                />
                {index === 1 && post.image_urls && post.image_urls.length > 2 && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-sm font-medium text-white">
                    +{post.image_urls.length - 2}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.slice(0, 4).map((t) => (
              <span
                key={t}
                className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Bottom: author + stats */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6 rounded-md">
              <AvatarImage src={post.author?.avatar_url ?? undefined} />
              <AvatarFallback className="rounded-md text-xs">
                {(post.author?.username ?? "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              {post.author?.username ?? "Unknown"}
            </span>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {post.view_count ?? 0}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              {post._count?.comments ?? 0}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" />
              {post._count?.likes ?? 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function PostCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 animate-pulse">
      <div className="space-y-3">
        <div className="h-5 w-20 rounded-full bg-muted" />
        <div className="h-6 w-3/4 rounded bg-muted" />
        <div className="h-4 w-full rounded bg-muted" />
        <div className="flex gap-1.5">
          <div className="h-5 w-12 rounded-md bg-muted" />
          <div className="h-5 w-16 rounded-md bg-muted" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-muted" />
            <div className="h-4 w-16 rounded bg-muted" />
          </div>
          <div className="flex gap-3">
            <div className="h-4 w-10 rounded bg-muted" />
            <div className="h-4 w-10 rounded bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
