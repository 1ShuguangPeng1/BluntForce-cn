"use client";

import { useAuth } from "@/lib/auth-context";
import { createPost } from "@/lib/actions/post";
import { PostForm } from "@/components/post/post-form";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewPostPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <div className="h-96 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <div className="space-y-8">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">发布新帖</h1>
          <p className="text-sm text-muted-foreground">分享你的宠物健康经验</p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-apple">
          <PostForm
            onSubmit={createPost}
            submitLabel="发布帖子"
            backHref="/"
          />
        </div>
      </div>
    </div>
  );
}
