import Link from "next/link";
import { db } from "@/lib/db";

export async function Sidebar() {
  // Hot posts (by view count)
  const hotPosts = await db.query.posts.findMany({
    orderBy: (posts, { desc }) => [desc(posts.view_count)],
    limit: 5,
    columns: { id: true, title: true, view_count: true },
  });

  // Tag cloud
  const allPosts = await db.query.posts.findMany({
    columns: { tags: true },
    limit: 50,
  });

  const tagCounts: Record<string, number> = {};
  for (const p of allPosts) {
    if (p.tags) {
      for (const t of p.tags) {
        tagCounts[t] = (tagCounts[t] ?? 0) + 1;
      }
    }
  }
  const topTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Hot posts */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-apple-sm">
        <h3 className="text-sm font-semibold tracking-tight mb-4">热门帖子</h3>
        {hotPosts.length === 0 ? (
          <p className="text-xs text-muted-foreground">暂无内容</p>
        ) : (
          <div className="space-y-2">
            {hotPosts.map((p, i) => (
              <Link
                key={p.id}
                href={`/post/${p.id}`}
                className="flex items-start gap-2 group"
              >
                <span className="text-xs font-medium text-muted-foreground min-w-[1.25rem] pt-0.5">
                  {i + 1}.
                </span>
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors line-clamp-1 leading-relaxed">
                  {p.title}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground/50">
                  {p.view_count ?? 0}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Tag cloud */}
      {topTags.length > 0 && (
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-apple-sm">
          <h3 className="text-sm font-semibold tracking-tight mb-4">热门标签</h3>
          <div className="flex flex-wrap gap-1.5">
            {topTags.map(([tag, count]) => (
              <Link
                key={tag}
                href={`/search?q=${encodeURIComponent(tag)}`}
                className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {tag}
                <span className="ml-1 text-muted-foreground/50">{count}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
