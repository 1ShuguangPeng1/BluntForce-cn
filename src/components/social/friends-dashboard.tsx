"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Loader2, MessageCircle, Search, UserMinus, UserPlus, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  acceptFriendRequest,
  cancelFriendRequest,
  getFriendOverview,
  rejectFriendRequest,
  removeFriend,
  searchPeople,
  sendFriendRequest,
} from "@/lib/actions/social";

type Overview = Awaited<ReturnType<typeof getFriendOverview>>;
type SearchResult = Awaited<ReturnType<typeof searchPeople>>[number];

export function FriendsDashboard({ initialOverview }: { initialOverview: Overview }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSearching(true);
    try {
      setResults(await searchPeople(query));
    } catch (err) {
      setError(err instanceof Error ? err.message : "搜索失败");
    } finally {
      setSearching(false);
    }
  }

  async function run(id: string, action: () => Promise<void>) {
    setBusyId(id);
    setError("");
    try {
      await action();
      if (query.trim().length >= 2) setResults(await searchPeople(query));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失败");
    } finally {
      setBusyId("");
    }
  }

  const personIdentity = (person: { username: string; avatar_url: string | null }) => (
    <>
      <Avatar className="h-10 w-10">
        <AvatarImage src={person.avatar_url ?? undefined} />
        <AvatarFallback>{person.username.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{person.username}</p>
        <p className="truncate text-xs text-muted-foreground">查看个人主页</p>
      </div>
    </>
  );

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-apple-sm">
        <h2 className="mb-4 text-sm font-semibold">查找用户</h2>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="输入至少 2 个用户名字符"
            className="min-w-0 flex-1 rounded-xl border border-border/60 bg-card px-4 py-2 text-sm outline-none transition-colors focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
          />
          <Button type="submit" disabled={searching || query.trim().length < 2}>
            {searching ? <Loader2 className="animate-spin" /> : <Search />}
            搜索
          </Button>
        </form>

        {results.length > 0 && (
          <div className="mt-4 divide-y divide-border/60">
            {results.map((person) => (
              <div key={person.id} className="flex items-center justify-between gap-3 py-3">
                <Link href={`/profile/${person.username}`} className="flex min-w-0 items-center gap-3">
                  {personIdentity(person)}
                </Link>
                {!person.relationship ? (
                  <Button
                    size="sm"
                    onClick={() => run(person.id, () => sendFriendRequest(person.id))}
                    disabled={busyId === person.id}
                  >
                    <UserPlus />
                    添加
                  </Button>
                ) : person.relationship.status === "accepted" ? (
                  <Link href={`/messages/${person.id}`}>
                    <Button size="sm" variant="outline"><MessageCircle />聊天</Button>
                  </Link>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {person.relationship.direction === "outgoing" ? "已发送申请" : "待你接受"}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {initialOverview.incoming.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold">收到的好友申请</h2>
          {initialOverview.incoming.map((item) => item.person && (
            <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card p-4">
              <Link href={`/profile/${item.person.username}`} className="flex min-w-0 items-center gap-3">
                {personIdentity(item.person)}
              </Link>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => run(item.id, () => acceptFriendRequest(item.id))} disabled={busyId === item.id}>
                  <Check />接受
                </Button>
                <Button size="sm" variant="outline" onClick={() => run(item.id, () => rejectFriendRequest(item.id))} disabled={busyId === item.id}>
                  <X />拒绝
                </Button>
              </div>
            </div>
          ))}
        </section>
      )}

      {initialOverview.outgoing.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold">已发送的申请</h2>
          {initialOverview.outgoing.map((item) => item.person && (
            <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card p-4">
              <Link href={`/profile/${item.person.username}`} className="flex min-w-0 items-center gap-3">
                {personIdentity(item.person)}
              </Link>
              <Button size="sm" variant="outline" onClick={() => run(item.id, () => cancelFriendRequest(item.id))} disabled={busyId === item.id}>
                取消申请
              </Button>
            </div>
          ))}
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold">我的好友</h2>
        {initialOverview.friends.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-card p-10 text-center text-sm text-muted-foreground">
            还没有好友，可以从上方搜索用户名添加
          </div>
        ) : initialOverview.friends.map((item) => item.person && (
          <div key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card p-4">
            <Link href={`/profile/${item.person.username}`} className="flex min-w-0 items-center gap-3">
              {personIdentity(item.person)}
            </Link>
            <div className="flex gap-2">
              <Link href={`/messages/${item.person.id}`}>
                <Button size="sm"><MessageCircle />聊天</Button>
              </Link>
              <Button
                size="sm"
                variant="outline"
                aria-label="删除好友"
                onClick={() => run(item.id, () => removeFriend(item.id))}
                disabled={busyId === item.id}
              >
                <UserMinus />
              </Button>
            </div>
          </div>
        ))}
      </section>

      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
