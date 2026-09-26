"use client";
/* eslint-disable @next/next/no-img-element -- OSS images bypass Next's remote optimizer. */

import Markdown from "react-markdown";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Eye } from "lucide-react";

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

type PostDetailProps = {
  post: {
    title: string;
    content: string;
    category: string;
    tags: string[] | null;
    image_urls: string[] | null;
    view_count: number | null;
    created_at: string | Date;
    updated_at?: string | Date;
    author?: { id: string; username: string; avatar_url: string | null } | null;
  };
};

export function PostDetail({ post }: PostDetailProps) {
  const createdAt = new Date(post.created_at).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <span
          className={`inline-flex text-xs px-2.5 py-0.5 rounded-full font-medium ${
            categoryColors[post.category] ?? "bg-muted text-muted-foreground"
          }`}
        >
          {categoryLabels[post.category] ?? post.category}
        </span>

        {post.title && (
          <h1 className="text-2xl font-semibold tracking-tight leading-snug">
            {post.title}
          </h1>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 rounded-xl">
              <AvatarImage src={post.author?.avatar_url ?? undefined} />
              <AvatarFallback className="rounded-xl text-sm">
                {(post.author?.username ?? "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{post.author?.username ?? "Unknown"}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{createdAt}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Eye className="h-4 w-4" />
            <span>{post.view_count ?? 0}</span>
          </div>
        </div>
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {post.tags.map((t) => (
            <span
              key={t}
              className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground"
            >
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* Images gallery */}
      {post.image_urls && post.image_urls.length > 0 && (
        <div className={`grid gap-2 ${post.image_urls.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
          {post.image_urls.map((url) => (
            <a key={url} href={url} target="_blank" rel="noopener noreferrer">
              <img
                src={url}
                alt=""
                className="rounded-xl border border-border/60 w-full h-48 object-cover hover:opacity-90 transition-opacity"
                loading="lazy"
              />
            </a>
          ))}
        </div>
      )}

      {post.content && (
        <>
          <div className="border-t border-border/60" />

          <div className="prose prose-sm max-w-none prose-headings:tracking-tight prose-headings:font-semibold prose-a:text-primary prose-img:rounded-xl prose-img:border prose-img:border-border/60">
            <Markdown
              components={{
                img: ({ src, alt }) => (
                  <img
                    src={src}
                    alt={alt ?? ""}
                    className="rounded-xl border border-border/60 max-w-full my-4"
                    loading="lazy"
                  />
                ),
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                    {children}
                  </a>
                ),
                code: ({ className, children, ...props }) => {
                  const isInline = !className;
                  if (isInline) {
                    return (
                      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                        {children}
                      </code>
                    );
                  }
                  return (
                    <pre className="bg-muted rounded-xl p-4 overflow-x-auto text-sm font-mono">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  );
                },
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-primary/30 pl-4 italic text-muted-foreground">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {post.content}
            </Markdown>
          </div>
        </>
      )}
    </article>
  );
}
