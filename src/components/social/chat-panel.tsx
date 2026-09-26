"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getConversation, sendMessage } from "@/lib/actions/social";

type Conversation = Awaited<ReturnType<typeof getConversation>>;

export function ChatPanel({ initialConversation }: { initialConversation: Conversation }) {
  const [conversation, setConversation] = useState(initialConversation);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const otherUserId = initialConversation.otherUser.id;

  useEffect(() => {
    let active = true;
    const timer = window.setInterval(() => {
      void getConversation(otherUserId)
        .then((next) => {
          if (active) setConversation(next);
        })
        .catch(() => undefined);
    }, 4_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [otherUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation.messages.length]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    setError("");
    try {
      await sendMessage(otherUserId, content);
      setContent("");
      setConversation(await getConversation(otherUserId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "发送失败");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-apple">
      <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
        <Link href="/friends" className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <Avatar className="h-9 w-9">
          <AvatarImage src={conversation.otherUser.avatar_url ?? undefined} />
          <AvatarFallback>{conversation.otherUser.username.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{conversation.otherUser.username}</p>
          <p className="text-xs text-muted-foreground">好友私信</p>
        </div>
      </div>

      <div className="h-[min(60vh,32rem)] space-y-3 overflow-y-auto bg-muted/20 p-4">
        {conversation.messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            还没有消息，打个招呼吧
          </div>
        ) : conversation.messages.map((message) => {
          const mine = message.sender_id === conversation.currentUserId;
          return (
            <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[78%] rounded-2xl px-3.5 py-2 ${mine ? "bg-primary text-primary-foreground" : "border border-border/60 bg-card"}`}>
                <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
                <p className={`mt-1 text-[10px] ${mine ? "text-primary-foreground/65" : "text-muted-foreground"}`}>
                  {new Date(message.created_at).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-border/60 p-3">
        <div className="flex items-end gap-2">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            rows={2}
            maxLength={2_000}
            placeholder="输入消息，Enter 发送，Shift+Enter 换行"
            className="min-h-10 flex-1 resize-none rounded-xl border border-border/60 bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
          />
          <Button type="submit" size="icon-lg" disabled={sending || !content.trim()} aria-label="发送消息">
            {sending ? <Loader2 className="animate-spin" /> : <Send />}
          </Button>
        </div>
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      </form>
    </div>
  );
}
