"use client";
/* eslint-disable @next/next/no-img-element -- preview URLs are user-selected local/OSS images. */

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ImagePlus, X, Loader2 } from "lucide-react";
import Link from "next/link";

const categories = [
  { value: "experience", label: "经验分享" },
  { value: "knowledge", label: "健康知识" },
  { value: "question", label: "提问求助" },
  { value: "daily", label: "日常分享" },
];

type PostFormData = {
  title: string;
  content: string;
  category: string;
  tags: string[];
  image_urls: string[];
};

type Props = {
  defaultValues?: PostFormData;
  onSubmit: (data: PostFormData) => Promise<unknown>;
  submitLabel: string;
  backHref: string;
};

export function PostForm({ defaultValues, onSubmit, submitLabel, backHref }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [content, setContent] = useState(defaultValues?.content ?? "");
  const [category, setCategory] = useState(defaultValues?.category ?? "experience");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(defaultValues?.tags ?? []);
  const [imageUrls, setImageUrls] = useState<string[]>(defaultValues?.image_urls ?? []);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("图片大小不能超过 5MB");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload-image", { method: "POST", body: formData });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error ?? "上传失败");

      setImageUrls((prev) => [...prev, json.url]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "上传失败");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function addTag() {
    const t = tagInput.trim().replace(/\s+/g, "-").toLowerCase();
    if (t && !tags.includes(t) && tags.length < 5) {
      setTags([...tags, t]);
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  function removeImage(url: string) {
    setImageUrls(imageUrls.filter((u) => u !== url));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim()) { setError("请输入标题"); return; }
    if (!content.trim()) { setError("请输入内容"); return; }

    setSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), content, category, tags, image_urls: imageUrls });
      router.push(backHref === "/" || backHref.startsWith("/post/") ? backHref : "/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "提交失败");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Category */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">分类</label>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCategory(c.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                category === c.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border/60 hover:border-border"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">标题</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="输入帖子标题..."
          className="w-full rounded-xl border border-border/60 bg-card px-4 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-colors"
          maxLength={100}
        />
      </div>

      {/* Content */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">内容 (Markdown)</label>
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="支持 Markdown 语法…&#10;&#10;# 标题&#10;**粗体** *斜体*&#10;- 列表项&#10;[链接](url)&#10;![图片](url)"
            rows={15}
            className="w-full rounded-xl border border-border/60 bg-card px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-colors font-mono resize-y"
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="h-8 text-xs"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ImagePlus className="h-3.5 w-3.5" />
              )}
              <span className="ml-1">图片</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Image previews */}
      {imageUrls.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {imageUrls.map((url) => (
            <div key={url} className="relative group rounded-lg overflow-hidden border border-border/60 h-20 w-20">
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tags */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">标签 ({tags.length}/5)</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
            placeholder={tags.length >= 5 ? "最多 5 个标签" : "输入标签后按回车..."}
            disabled={tags.length >= 5}
            className="flex-1 rounded-xl border border-border/60 bg-card px-4 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-colors disabled:opacity-50"
          />
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary"
              >
                {t}
                <button type="button" onClick={() => removeTag(t)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-2.5">{error}</p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <Link href={backHref} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          返回
        </Link>
        <Button type="submit" disabled={submitting || uploading}>
          {submitting ? "提交中..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
