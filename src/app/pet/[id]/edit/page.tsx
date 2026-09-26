"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getPetById, updatePet, deletePet } from "@/lib/actions/pet";
import { PetForm } from "@/components/pet/pet-form";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function EditPetPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [defaults, setDefaults] = useState<{
    name: string; species: string; breed: string; gender: string; birth_date: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
      return;
    }
    if (user && id) {
      getPetById(id).then((pet) => {
        if (!pet || pet.owner_id !== user.id) {
          router.push("/profile/me/pets");
          return;
        }
        setDefaults({
          name: pet.name,
          species: pet.species,
          breed: pet.breed ?? "",
          gender: pet.gender ?? "",
          birth_date: pet.birth_date ?? "",
        });
      });
    }
  }, [user, loading, id, router]);

  const handleUpdate = async (data: {
    name: string; species: string; breed: string; gender: string; birth_date: string;
  }) => {
    await updatePet(id, data);
  };

  const handleDelete = async () => {
    if (!confirm("确定删除这个宠物档案吗？所有健康记录也将被删除。")) return;
    setDeleting(true);
    try {
      await deletePet(id);
      router.push("/profile/me/pets");
      router.refresh();
    } catch {
      setDeleting(false);
    }
  };

  if (!defaults) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <div className="h-96 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <div className="space-y-8">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">编辑宠物信息</h1>
          <p className="text-sm text-muted-foreground">修改 {defaults.name} 的资料</p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-apple space-y-6">
          <PetForm defaultValues={defaults} onSubmit={handleUpdate} submitLabel="保存修改" />

          <div className="border-t border-border/60 pt-4">
            <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="w-full">
              <Trash2 className="mr-2 h-4 w-4" />
              {deleting ? "删除中..." : "删除宠物档案"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
