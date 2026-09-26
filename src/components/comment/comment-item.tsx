"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trash2, Reply, ChevronUp } from "lucide-react";
import { CommentForm } from "@/components/comment/comment-form";

type Comment = {
  id: string;
  author_id: string;
  content: string;
  created_at: Date;
  author?: { id: string; username: string; avatar_url: string | null } | null;
  replies?: Comment[];
};

type Props = {
  comment: Comment;
  level: number;
  currentUserId?: string;
  onReply: (postId: string, content: string, parentId?: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  postId: string;
};

export function CommentItem({ comment, level, currentUserId, onReply, onDelete, postId }: Props) {
  const [showReply, setShowReply] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isAuthor = currentUserId === comment.author_id;
  const createdAt = new Date(comment.created_at).toLocaleDateString("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  async function handleDelete() {
    if (!confirm("确定删除这条评论吗？")) return;
    setDeleting(true);
    try {
      await onDelete(comment.id);
    } catch {
      setDeleting(false);
    }
  }

  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <div className={`${level > 0 ? "ml-6 pl-3 border-l-2 border-border/40" : ""}`}>
      <div className="space-y-2 py-3">
        <div className="flex items-start gap-2.5">
          <Avatar className="h-7 w-7 rounded-lg shrink-0">
            <AvatarImage src={comment.author?.avatar_url ?? undefined} />
            <AvatarFallback className="rounded-lg text-xs">
              {(comment.author?.username ?? "U").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium">
                {comment.author?.username ?? "Unknown"}
              </span>
              <span className="text-xs text-muted-foreground">{createdAt}</span>
            </div>

            {collapsed ? (
              <button
                onClick={() => setCollapsed(false)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                已折叠 — 展开
              </button>
            ) : (
              <>
                <p className="text-sm leading-relaxed">{comment.content}</p>

                <div className="flex items-center gap-1 mt-1.5">
                  {level === 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowReply(!showReply)}
                      className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Reply className="h-3 w-3 mr-1" />
                      回复
                    </Button>
                  )}

                  {isAuthor && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDelete}
                      disabled={deleting}
                      className="h-7 text-xs text-muted-foreground hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      {deleting ? "删除中" : "删除"}
                    </Button>
                  )}

                  {hasReplies && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCollapsed(true)}
                      className="h-7 text-xs text-muted-foreground"
                    >
                      <ChevronUp className="h-3 w-3 mr-1" />
                      折叠回复 ({comment.replies!.length})
                    </Button>
                  )}
                </div>

                {showReply && (
                  <div className="pt-2">
                    <CommentForm
                      postId={postId}
                      parentId={comment.id}
                      placeholder={`回复 ${comment.author?.username ?? "..."}...`}
                      onSubmit={onReply}
                      onSubmitted={() => setShowReply(false)}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {!collapsed && hasReplies && (
        <div>
          {comment.replies!.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              level={level + 1}
              currentUserId={currentUserId}
              onReply={onReply}
              onDelete={onDelete}
              postId={postId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
