"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getPostById, updatePost, deletePost } from "@/lib/actions/post";
import { PostForm } from "@/components/post/post-form";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function EditPostPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  const [defaults, setDefaults] = useState<{
    title: string; content: string; category: string; tags: string[]; image_urls: string[];
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!loading && !user) { router.push("/auth/login"); return; }
    if (user && postId) {
      getPostById(postId).then((post) => {
        if (!post) { router.push("/"); return; }
        if (post.author_id !== user.id) { router.push(`/post/${postId}`); return; }
        setDefaults({
          title: post.title,
          content: post.content,
          category: post.category,
          tags: post.tags ?? [],
          image_urls: post.image_urls ?? [],
        });
      });
    }
  }, [user, loading, postId, router]);

  const handleUpdate = (data: {
    title: string; content: string; category: string; tags: string[]; image_urls: string[];
  }) => updatePost(postId, data);

  const handleDelete = async () => {
    if (!confirm("确定删除这篇帖子吗？")) return;
    setDeleting(true);
    try {
      await deletePost(postId);
      router.push("/");
      router.refresh();
    } catch {
      setDeleting(false);
    }
  };

  if (!defaults) {
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
          <h1 className="text-xl font-semibold tracking-tight">编辑帖子</h1>
          <p className="text-sm text-muted-foreground">修改 {defaults.title}</p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-apple space-y-6">
          <PostForm
            defaultValues={defaults}
            onSubmit={handleUpdate}
            submitLabel="保存修改"
            backHref={`/post/${postId}`}
          />

          <div className="border-t border-border/60 pt-4">
            <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="w-full">
              <Trash2 className="mr-2 h-4 w-4" />
              {deleting ? "删除中..." : "删除帖子"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
