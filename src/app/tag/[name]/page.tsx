import { getPosts, getAllTags } from "@/lib/actions/post";
import { PostList } from "@/components/post/post-list";
import { TagCloud } from "@/components/tag/tag-cloud";
import { Hash, ArrowLeft } from "lucide-react";
import Link from "next/link";

type Props = {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ page?: string }>;
};

export default async function TagPage({ params, searchParams }: Props) {
  const [{ name }, sp] = await Promise.all([params, searchParams]);
  const page = Number(sp.page) || 1;

  const [{ items: posts, total }, allTags] = await Promise.all([
    getPosts({ tag: name, page, limit: 10 }),
    getAllTags(),
  ]);

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <Link
          href="/explore"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          返回发现
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Hash className="h-5 w-5 text-primary" />
          {name}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          共 {total} 篇相关帖子
        </p>
      </div>

      <div className="flex gap-8">
        <div className="flex-1 min-w-0 space-y-4">
          {posts.length === 0 ? (
            <div className="rounded-2xl border border-border/60 bg-card p-12 text-center">
              <Hash className="h-8 w-8 mx-auto text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground mt-3">暂无相关帖子</p>
            </div>
          ) : (
            <>
              <PostList posts={posts} />

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <a
                      key={p}
                      href={`/tag/${encodeURIComponent(name)}?page=${p}`}
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
            </>
          )}
        </div>

        <aside className="hidden lg:block w-64 shrink-0">
          <TagCloud tags={allTags} />
        </aside>
      </div>
    </div>
  );
}
