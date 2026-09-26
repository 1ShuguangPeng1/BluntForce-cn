import Link from "next/link";
import { searchPosts } from "@/lib/actions/post";
import { PostCard } from "@/components/post/post-card";
import { Search as SearchIcon, ArrowLeft } from "lucide-react";

type Props = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const query = params.q ?? "";
  const page = Number(params.page) || 1;

  let items: Awaited<ReturnType<typeof searchPosts>>["items"] = [];
  let total = 0;

  if (query.trim()) {
    const result = await searchPosts(query.trim(), page, 10);
    items = result.items;
    total = result.total;
  }

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="space-y-8">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          返回发现
        </Link>

        <div>
          <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <SearchIcon className="h-5 w-5" />
            搜索结果
          </h1>
          {query.trim() && (
            <p className="text-sm text-muted-foreground mt-1">
              关于 &ldquo;{query}&rdquo; 的搜索结果，共 {total} 条
            </p>
          )}
        </div>

        {/* Search bar */}
        <form action="/search" method="GET" className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="搜索帖子标题或内容..."
            className="flex-1 rounded-xl border border-border/60 bg-card px-4 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-colors"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <SearchIcon className="h-4 w-4" />
            搜索
          </button>
        </form>

        {/* Results */}
        {!query.trim() ? (
          <div className="rounded-2xl border border-border/60 bg-card p-12 text-center">
            <SearchIcon className="h-8 w-8 mx-auto text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground mt-3">输入关键词搜索帖子</p>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-card p-12 text-center">
            <SearchIcon className="h-8 w-8 mx-auto text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground mt-3">未找到相关帖子</p>
            <p className="text-xs text-muted-foreground/60 mt-1">尝试其他关键词</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <a
                key={p}
                href={`/search?q=${encodeURIComponent(query)}&page=${p}`}
                className={`inline-flex items-center justify-center h-8 w-8 rounded-lg text-sm transition-colors ${
                  p === page
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {p}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
