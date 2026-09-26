"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { createHealthRecord } from "@/lib/actions/health-record";
import { HealthRecordForm } from "@/components/pet/health-record-form";
import { Heart } from "lucide-react";

export default function NewHealthRecordPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const petId = params.id as string;

  useEffect(() => {
    if (!loading && !user) router.push("/auth/login");
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
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-500/10">
            <Heart className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">添加健康记录</h1>
            <p className="text-sm text-muted-foreground">疫苗、疾病、体检、用药记录</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-apple">
          <HealthRecordForm
            onSubmit={(data) => createHealthRecord({ ...data, pet_id: petId })}
            submitLabel="添加记录"
            backHref={`/pet/${petId}`}
          />
        </div>
      </div>
    </div>
  );
}
