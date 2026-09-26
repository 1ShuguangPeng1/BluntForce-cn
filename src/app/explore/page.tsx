import { Suspense } from "react";
import { getPosts, getAllTags } from "@/lib/actions/post";
import { PostList } from "@/components/post/post-list";
import { PostCardSkeleton } from "@/components/post/post-card";
import { ExploreFilters } from "@/components/home/explore-filters";
import { TagCloud } from "@/components/tag/tag-cloud";
import { Search } from "lucide-react";

type Props = {
  searchParams: Promise<{
    category?: string;
    tag?: string;
    sort?: string;
    page?: string;
  }>;
};

export default async function ExplorePage({ searchParams }: Props) {
  const params = await searchParams;
  const category = params.category ?? "all";
  const tag = params.tag ?? undefined;
  const sort = (params.sort ?? "latest") as "latest" | "hot" | "most_liked";
  const page = Number(params.page) || 1;

  const [{ items: posts, total }, allTags] = await Promise.all([
    getPosts({ category: category !== "all" ? category : undefined, tag, sort, page, limit: 10 }),
    getAllTags(),
  ]);

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          <Search className="inline h-5 w-5 mr-2" />
          发现
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          浏览所有帖子，按分类和标签探索
        </p>
      </div>

      <div className="flex gap-8">
        <div className="flex-1 min-w-0 space-y-6">
          <Suspense fallback={<div className="h-10 rounded-xl bg-muted animate-pulse" />}>
            <ExploreFilters currentCategory={category} currentTag={tag} currentSort={sort} />
          </Suspense>

          <Suspense
            key={`${category}-${tag}-${sort}-${page}`}
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

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                const searchParams = new URLSearchParams();
                if (category !== "all") searchParams.set("category", category);
                if (tag) searchParams.set("tag", tag);
                if (sort !== "latest") searchParams.set("sort", sort);
                searchParams.set("page", String(p));
                return (
                  <a
                    key={p}
                    href={`/explore?${searchParams.toString()}`}
                    className={`inline-flex items-center justify-center h-8 w-8 rounded-lg text-sm transition-colors ${
                      p === page
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {p}
                  </a>
                );
              })}
            </div>
          )}
        </div>

        <aside className="hidden lg:block w-64 shrink-0">
          <TagCloud tags={allTags} />
        </aside>
      </div>
    </div>
  );
}
