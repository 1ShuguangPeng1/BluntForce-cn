import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostById, recordPostView } from "@/lib/actions/post";
import { getCommentsByPostId } from "@/lib/actions/comment";
import { getPostLikeCount, userLikedPost } from "@/lib/actions/like";
import { userFavoritedPost } from "@/lib/actions/favorite";
import { getServerUser } from "@/lib/auth-server";
import { PostDetail } from "@/components/post/post-detail";
import { PostActions } from "@/components/post/post-actions";
import { PostAdminActions } from "@/components/post/post-admin-actions";
import { CommentSection } from "@/components/comment/comment-section";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit } from "lucide-react";
import { isAdminUser } from "@/lib/admin";

type Props = { params: Promise<{ id: string }> };

export default async function PostDetailPage({ params }: Props) {
  const { id } = await params;
  const [post, comments, user, likeData, liked, favorited] = await Promise.all([
    getPostById(id),
    getCommentsByPostId(id),
    getServerUser(),
    getPostLikeCount(id),
    userLikedPost(id),
    userFavoritedPost(id),
  ]);

  if (!post) notFound();

  // View count with cookie dedup — same user won't re-count within 30min
  recordPostView(id);

  const isAuthor = user?.id === post.author_id;
  const isAdmin = isAdminUser(user);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          返回首页
        </Link>

        <div className="rounded-2xl border border-border/60 bg-card p-6 sm:p-8 shadow-apple">
          <PostDetail post={post} />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <PostActions
            postId={post.id}
            initialLiked={liked}
            initialLikeCount={likeData.count}
            initialFavorited={favorited}
          />
          <div className="flex flex-wrap items-start gap-2">
            {isAdmin && (
              <PostAdminActions postId={post.id} initiallyPinned={Boolean(post.is_pinned)} />
            )}
            {isAuthor && (
              <Link href={`/post/${post.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  编辑
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-apple">
          <CommentSection postId={post.id} comments={comments} />
        </div>
      </div>
    </div>
  );
}
