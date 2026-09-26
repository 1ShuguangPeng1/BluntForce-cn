"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Loader2, MessageCircle, UserMinus, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  acceptFriendRequest,
  cancelFriendRequest,
  getFriendRelationship,
  rejectFriendRequest,
  removeFriend,
  sendFriendRequest,
} from "@/lib/actions/social";

type RelationshipState = Awaited<ReturnType<typeof getFriendRelationship>>;

type Props = {
  targetUserId: string;
  state: RelationshipState;
};

export function FriendProfileActions({ targetUserId, state }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  if (state.kind === "anonymous" || state.kind === "self") return null;

  function run(action: () => Promise<void>) {
    setError("");
    startTransition(async () => {
      try {
        await action();
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "操作失败");
      }
    });
  }

  const relationshipId = state.relationship?.id;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex flex-wrap justify-center gap-2">
        {state.kind === "none" && (
          <Button onClick={() => run(() => sendFriendRequest(targetUserId))} disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : <UserPlus />}
            添加好友
          </Button>
        )}
        {state.kind === "outgoing" && relationshipId && (
          <Button variant="outline" onClick={() => run(() => cancelFriendRequest(relationshipId))} disabled={pending}>
            <X />取消申请
          </Button>
        )}
        {state.kind === "incoming" && relationshipId && (
          <>
            <Button onClick={() => run(() => acceptFriendRequest(relationshipId))} disabled={pending}>
              <Check />接受好友
            </Button>
            <Button variant="outline" onClick={() => run(() => rejectFriendRequest(relationshipId))} disabled={pending}>
              <X />拒绝
            </Button>
          </>
        )}
        {state.kind === "friend" && relationshipId && (
          <>
            <Link href={`/messages/${targetUserId}`}>
              <Button><MessageCircle />发送消息</Button>
            </Link>
            <Button variant="outline" onClick={() => run(() => removeFriend(relationshipId))} disabled={pending}>
              <UserMinus />删除好友
            </Button>
          </>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
