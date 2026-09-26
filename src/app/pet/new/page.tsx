"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { createPet } from "@/lib/actions/pet";
import { PetForm } from "@/components/pet/pet-form";
import { PawPrint } from "lucide-react";

export default function NewPetPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login?redirect=/pet/new");
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <div className="h-96 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <div className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-primary/10">
            <PawPrint className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">添加宠物</h1>
            <p className="text-sm text-muted-foreground">记录你的毛孩子信息</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-apple">
          <PetForm onSubmit={createPet} submitLabel="添加宠物" />
        </div>
      </div>
    </div>
  );
}
