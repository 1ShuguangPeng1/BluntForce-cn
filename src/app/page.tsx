import { Suspense } from "react";
import { getPosts } from "@/lib/actions/post";
import { PostList } from "@/components/post/post-list";
import { PostCardSkeleton } from "@/components/post/post-card";
import { CategoryTabs } from "@/components/home/category-tabs";
import { Sidebar } from "@/components/home/sidebar";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type Props = {
  searchParams: Promise<{ category?: string; page?: string }>;
};

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const category = params.category ?? "all";
  const page = Number(params.page) || 1;

  const { items: posts, total } = await getPosts({
    category: category !== "all" ? category : undefined,
    page,
    limit: 10,
  });

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
          {/* Category tabs + new post button */}
          <div className="flex items-center justify-between">
            <Suspense fallback={<div className="h-8 w-64 rounded-full bg-muted animate-pulse" />}>
              <CategoryTabs />
            </Suspense>
            <Link href="/post/new">
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                发帖
              </Button>
            </Link>
          </div>

          {/* Post list */}
          <Suspense
            key={`${category}-${page}`}
            fallback={
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <PostCardSkeleton key={i} />
                ))}
              </div>
            }
          >
            <PostList posts={posts} />
          </Suspense>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/?category=${category !== "all" ? category : "all"}&page=${p}`}
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
          <Suspense fallback={<div className="h-48 rounded-2xl bg-muted animate-pulse" />}>
            <Sidebar />
          </Suspense>
        </aside>
      </div>
    </div>
  );
}
