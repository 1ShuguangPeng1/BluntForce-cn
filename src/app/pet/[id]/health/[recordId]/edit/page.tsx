"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { getHealthRecordById, updateHealthRecord, deleteHealthRecord } from "@/lib/actions/health-record";
import { HealthRecordForm } from "@/components/pet/health-record-form";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export default function EditHealthRecordPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const petId = params.id as string;
  const recordId = params.recordId as string;

  const [defaults, setDefaults] = useState<{
    record_type: string; title: string; description: string; record_date: string; next_due: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!loading && !user) { router.push("/auth/login"); return; }
    if (user && recordId) {
      getHealthRecordById(recordId).then((rec) => {
        if (!rec) { router.push(`/pet/${petId}`); return; }
        setDefaults({
          record_type: rec.record_type,
          title: rec.title,
          description: rec.description ?? "",
          record_date: rec.record_date,
          next_due: rec.next_due ?? "",
        });
      });
    }
  }, [user, loading, recordId, petId, router]);

  const handleUpdate = async (data: {
    record_type: string; title: string; description: string; record_date: string; next_due: string;
  }) => {
    await updateHealthRecord(recordId, data);
  };

  const handleDelete = async () => {
    if (!confirm("确定删除这条健康记录吗？")) return;
    setDeleting(true);
    try {
      await deleteHealthRecord(recordId);
      router.push(`/pet/${petId}`);
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
          <h1 className="text-xl font-semibold tracking-tight">编辑健康记录</h1>
          <p className="text-sm text-muted-foreground">修改 {defaults.title}</p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-apple space-y-6">
          <HealthRecordForm
            defaultValues={defaults}
            onSubmit={handleUpdate}
            submitLabel="保存修改"
            backHref={`/pet/${petId}`}
          />

          <div className="border-t border-border/60 pt-4">
            <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="w-full">
              <Trash2 className="mr-2 h-4 w-4" />
              {deleting ? "删除中..." : "删除记录"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
