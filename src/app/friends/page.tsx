import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { getServerUser } from "@/lib/auth-server";
import { getFriendOverview } from "@/lib/actions/social";
import { FriendsDashboard } from "@/components/social/friends-dashboard";

export default async function FriendsPage() {
  const user = await getServerUser();
  if (!user) redirect("/auth/login?redirect=/friends");

  const overview = await getFriendOverview();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Users className="h-5 w-5" />
          好友
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">添加好友并开始一对一聊天</p>
      </div>
      <FriendsDashboard initialOverview={overview} />
    </div>
  );
}
