"use client";

import { useAuth } from "@/lib/auth-context";
import { CommentForm } from "@/components/comment/comment-form";
import { CommentList } from "@/components/comment/comment-list";
import { createComment, deleteComment } from "@/lib/actions/comment";

type Comment = {
  id: string;
  author_id: string;
  content: string;
  parent_id: string | null;
  created_at: Date;
  author?: { id: string; username: string; avatar_url: string | null } | null;
};

type Props = {
  postId: string;
  comments: Comment[];
};

export function CommentSection({ postId, comments }: Props) {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold tracking-tight">
        评论 ({comments.length})
      </h2>

      {user ? (
        <CommentForm postId={postId} onSubmit={createComment} />
      ) : (
        <p className="text-sm text-muted-foreground py-2 text-center rounded-xl bg-muted/50">
          请先登录后评论
        </p>
      )}

      {comments.length > 0 ? (
        <CommentList
          comments={comments}
          currentUserId={user?.id}
          onReply={createComment}
          onDelete={deleteComment}
          postId={postId}
        />
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">
          还没有评论，来说点什么吧
        </p>
      )}
    </div>
  );
}
