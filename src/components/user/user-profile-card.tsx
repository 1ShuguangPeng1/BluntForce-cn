import type { ReactNode } from "react";
import { UserAvatar } from "@/components/user/user-avatar";
import { CalendarDays } from "lucide-react";

type Props = {
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: Date;
  postCount?: number;
  petCount?: number;
  isOwner?: boolean;
  actions?: ReactNode;
};

export function UserProfileCard({
  username,
  avatarUrl,
  bio,
  createdAt,
  postCount = 0,
  petCount = 0,
  isOwner = false,
  actions,
}: Props) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-apple">
      <div className="flex flex-col items-center text-center gap-4">
        <UserAvatar
          url={avatarUrl}
          fallback={username.charAt(0).toUpperCase()}
          editable={isOwner}
          size="lg"
        />

        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {username}
          </h1>
          <p className="text-sm text-muted-foreground">
            {bio || "这个人很懒，什么都没写..."}
          </p>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground/70">
          <CalendarDays className="h-3 w-3" />
          <span>{new Date(createdAt).toLocaleDateString("zh-CN")} 加入</span>
        </div>

        <div className="flex gap-8 pt-2">
          <div className="text-center">
            <p className="text-lg font-semibold tabular-nums">{postCount}</p>
            <p className="text-xs text-muted-foreground">帖子</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold tabular-nums">{petCount}</p>
            <p className="text-xs text-muted-foreground">宠物</p>
          </div>
        </div>

        {actions}
      </div>
    </div>
  );
}
