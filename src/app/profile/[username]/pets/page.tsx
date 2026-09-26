import { notFound } from "next/navigation";
import Link from "next/link";
import { getProfileByUsername, getCurrentUserProfile } from "@/lib/actions/user";
import { getPetsByOwner } from "@/lib/actions/pet";
import { PetCard } from "@/components/pet/pet-card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, PlusCircle, PawPrint } from "lucide-react";

type Props = { params: Promise<{ username: string }> };

export default async function UserPetsPage({ params }: Props) {
  const { username } = await params;
  const profile = username === "me"
    ? await getCurrentUserProfile()
    : await getProfileByUsername(username);
  if (!profile) notFound();

  const pets = await getPetsByOwner(profile.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Link href={`/profile/${username}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              {username} 的主页
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight">宠物档案</h1>
          </div>
          {username === "me" && (
            <Link href="/pet/new">
              <Button size="sm">
                <PlusCircle className="mr-2 h-4 w-4" />
                添加宠物
              </Button>
            </Link>
          )}
        </div>

        {/* Pet list */}
        {pets.length === 0 ? (
          <div className="rounded-2xl border border-border/60 bg-card p-12 shadow-apple text-center">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/10 mb-4">
              <PawPrint className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">还没有宠物档案</p>
            <Link href="/pet/new" className="inline-block mt-3 text-sm text-primary hover:underline">
              添加第一只宠物 →
            </Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {pets.map((pet) => (
              <PetCard
                key={pet.id}
                id={pet.id}
                name={pet.name}
                species={pet.species}
                breed={pet.breed}
                gender={pet.gender}
                birthDate={pet.birth_date}
                avatarUrl={pet.avatar_url}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
