"use client";

import { CommentItem } from "@/components/comment/comment-item";

type Comment = {
  id: string;
  author_id: string;
  content: string;
  parent_id: string | null;
  created_at: Date;
  author?: { id: string; username: string; avatar_url: string | null } | null;
};

type Props = {
  comments: Comment[];
  currentUserId?: string;
  onReply: (postId: string, content: string, parentId?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  postId: string;
};

export function CommentList({ comments, currentUserId, onReply, onDelete, postId }: Props) {
  // Build tree: top-level comments with nested replies
  const topLevel = comments.filter((c) => !c.parent_id);
  const replies = comments.filter((c) => c.parent_id);

  const tree = topLevel.map((c) => ({
    ...c,
    replies: replies.filter((r) => r.parent_id === c.id),
  }));

  return (
    <div className="divide-y divide-border/40">
      {tree.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          level={0}
          currentUserId={currentUserId}
          onReply={onReply}
          onDelete={onDelete}
          postId={postId}
        />
      ))}
    </div>
  );
}
