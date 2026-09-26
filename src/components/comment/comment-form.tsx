"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

type Props = {
  postId: string;
  parentId?: string;
  placeholder?: string;
  onSubmit: (postId: string, content: string, parentId?: string) => Promise<void>;
  onSubmitted?: () => void;
};

export function CommentForm({ postId, parentId, placeholder = "写下评论...", onSubmit, onSubmitted }: Props) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      await onSubmit(postId, content.trim(), parentId);
      setContent("");
      onSubmitted?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "评论失败");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          maxLength={500}
          className="flex-1 rounded-xl border border-border/60 bg-card px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-colors"
        />
        <Button type="submit" size="sm" disabled={submitting || !content.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </form>
  );
}
