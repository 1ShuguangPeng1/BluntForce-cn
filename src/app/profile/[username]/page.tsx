import { notFound } from "next/navigation";
import { getProfileByUsername, getCurrentUserProfile } from "@/lib/actions/user";
import { UserProfileCard } from "@/components/user/user-profile-card";
import { FriendProfileActions } from "@/components/social/friend-profile-actions";
import { getFriendRelationship } from "@/lib/actions/social";

type Props = { params: Promise<{ username: string }> };

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;

  // "me" = current logged-in user
  const profile = username === "me"
    ? await getCurrentUserProfile()
    : await getProfileByUsername(username);

  if (!profile) notFound();
  const relationship = await getFriendRelationship(profile.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <UserProfileCard
        username={profile.username}
        avatarUrl={profile.avatar_url}
        bio={profile.bio}
        createdAt={profile.created_at}
        actions={<FriendProfileActions targetUserId={profile.id} state={relationship} />}
      />
    </div>
  );
}
