import { PostCard } from "@/components/post/post-card";

type PostListProps = {
  posts: Array<{
    id: string;
    title: string;
    content: string;
    category: string;
    tags: string[] | null;
    is_pinned?: boolean | null;
    view_count: number | null;
    created_at: Date | string;
    author?: { id: string; username: string; avatar_url: string | null } | null;
    _count?: { comments: number; likes: number } | null;
  }>;
};

export function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-12 text-center">
        <p className="text-sm text-muted-foreground">暂无帖子</p>
        <p className="text-xs text-muted-foreground/60 mt-1">成为第一个分享的人吧</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
