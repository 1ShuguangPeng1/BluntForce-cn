import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerUser } from "@/lib/auth-server";
import { getMyFavorites } from "@/lib/actions/favorite";
import { PostCard } from "@/components/post/post-card";
import { ArrowLeft, Bookmark } from "lucide-react";

export default async function FavoritesPage() {
  const user = await getServerUser();
  if (!user) notFound();

  const favorites = await getMyFavorites();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="space-y-8">
        <Link
          href="/settings"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          返回设置
        </Link>

        <div>
          <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <Bookmark className="h-5 w-5" />
            我的收藏
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            共 {favorites.length} 篇收藏的帖子
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-card p-12 text-center">
            <Bookmark className="h-8 w-8 mx-auto text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground mt-3">还没有收藏任何帖子</p>
            <Link
              href="/"
              className="text-sm text-primary hover:underline mt-1 inline-block"
            >
              去发现好内容 →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
