import { notFound } from "next/navigation";
import Link from "next/link";
import { getPetById } from "@/lib/actions/pet";
import { getServerUser } from "@/lib/auth-server";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { PawPrint, Calendar, Edit, ArrowLeft } from "lucide-react";
import { HealthTimeline } from "@/components/pet/health-timeline";

const speciesLabels: Record<string, string> = {
  dog: "狗", cat: "猫", rabbit: "兔", bird: "鸟", hamster: "仓鼠", other: "其他",
};
const genderLabels: Record<string, string> = {
  male: "公", female: "母",
};

type Props = { params: Promise<{ id: string }> };

export default async function PetDetailPage({ params }: Props) {
  const { id } = await params;
  const pet = await getPetById(id);
  const user = await getServerUser();

  if (!pet) notFound();
  const isOwner = user?.id === pet.owner_id;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="space-y-8">
        {/* Back */}
        <Link href={isOwner ? "/profile/me/pets" : `/profile/${pet.owner_id}/pets`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          返回宠物列表
        </Link>

        {/* Pet info card */}
        <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-apple">
          <div className="flex flex-col items-center text-center gap-4">
            <Avatar className="h-24 w-24 rounded-2xl">
              <AvatarImage src={pet.avatar_url ?? undefined} />
              <AvatarFallback className="rounded-2xl bg-primary/10 text-primary text-2xl">
                <PawPrint className="h-10 w-10" />
              </AvatarFallback>
            </Avatar>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{pet.name}</h1>
              <p className="text-sm text-muted-foreground">
                {speciesLabels[pet.species] ?? pet.species}
                {pet.breed ? ` · ${pet.breed}` : ""}
                {pet.gender ? ` · ${genderLabels[pet.gender] ?? pet.gender}` : ""}
              </p>
            </div>

            {pet.birth_date && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>出生日期：{pet.birth_date}</span>
              </div>
            )}

            {isOwner && (
              <Link href={`/pet/${pet.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Edit className="mr-2 h-4 w-4" />
                  编辑信息
                </Button>
              </Link>
            )}
          </div>
        </div>

        <HealthTimeline petId={pet.id} ownerId={pet.owner_id} />
      </div>
    </div>
  );
}
