import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PawPrint, Calendar } from "lucide-react";

type Props = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  gender: string | null;
  birthDate: string | null;
  avatarUrl: string | null;
};

const speciesLabels: Record<string, string> = {
  dog: "狗", cat: "猫", rabbit: "兔", bird: "鸟", hamster: "仓鼠", other: "其他",
};

export function PetCard({ id, name, species, breed, birthDate, avatarUrl }: Props) {
  return (
    <Link
      href={`/pet/${id}`}
      className="group block rounded-2xl border border-border/60 bg-card p-5 shadow-apple transition-all hover:shadow-apple-md hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-4">
        <Avatar className="h-14 w-14 rounded-xl">
          <AvatarImage src={avatarUrl ?? undefined} />
          <AvatarFallback className="rounded-xl bg-primary/10 text-primary">
            <PawPrint className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {speciesLabels[species] ?? species}
            {breed ? ` · ${breed}` : ""}
          </p>
        </div>

        {birthDate && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground/70">
            <Calendar className="h-3 w-3" />
            <span>{birthDate}</span>
          </div>
        )}
      </div>
    </Link>
  );
}

export function PetCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-apple animate-pulse">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-xl bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-24 rounded bg-muted" />
          <div className="h-3 w-16 rounded bg-muted" />
        </div>
      </div>
    </div>
  );
}
