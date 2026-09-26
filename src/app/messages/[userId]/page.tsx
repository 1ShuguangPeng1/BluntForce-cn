import { notFound, redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth-server";
import { getConversation } from "@/lib/actions/social";
import { ChatPanel } from "@/components/social/chat-panel";

type Props = { params: Promise<{ userId: string }> };

export default async function ConversationPage({ params }: Props) {
  const currentUser = await getServerUser();
  if (!currentUser) redirect("/auth/login?redirect=/friends");

  const { userId } = await params;
  const conversation = await getConversation(userId).catch(() => null);
  if (!conversation) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <ChatPanel initialConversation={conversation} />
    </div>
  );
}
