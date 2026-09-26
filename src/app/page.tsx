import { getPosts } from "@/lib/actions/post";
import { PostList } from "@/components/post/post-list";
import { Sidebar } from "@/components/home/sidebar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pin, Plus, Sparkles } from "lucide-react";

type Props = {
  searchParams: Promise<{ page?: string }>;
};

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page) || 1;

  const [{ items: pinnedPosts }, { items: latestPosts, total }] = await Promise.all([
    getPosts({ pinned: true, page: 1, limit: 3 }),
    getPosts({ pinned: false, page, limit: 10 }),
  ]);

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-2xl font-semibold tracking-tight">
          欢迎来到 BluntForce
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          记录宠物健康点滴，分享养宠经验
        </p>
      </div>

      <div className="flex gap-8">
        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-6">
          {pinnedPosts.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center gap-2">
                <Pin className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold">置顶推荐</h2>
              </div>
              <PostList posts={pinnedPosts} />
            </section>
          )}

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold">最新动态</h2>
              </div>
              <Link href="/post/new">
                <Button size="sm">
                  <Plus className="mr-1 h-4 w-4" />
                  发帖
                </Button>
              </Link>
            </div>
            <PostList posts={latestPosts} />
          </section>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/?page=${p}`}
                  className={`inline-flex items-center justify-center h-8 w-8 rounded-lg text-sm transition-colors ${
                    p === page
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <Sidebar />
        </aside>
      </div>
    </div>
  );
}
