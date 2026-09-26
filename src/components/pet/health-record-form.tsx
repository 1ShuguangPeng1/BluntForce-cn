"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, ArrowLeft } from "lucide-react";

const recordTypes = [
  { value: "vaccine", label: "疫苗" },
  { value: "illness", label: "疾病" },
  { value: "checkup", label: "体检" },
  { value: "medication", label: "用药" },
];

type Props = {
  defaultValues?: {
    record_type: string;
    title: string;
    description: string;
    record_date: string;
    next_due: string;
  };
  onSubmit: (data: {
    record_type: string;
    title: string;
    description: string;
    record_date: string;
    next_due: string;
  }) => Promise<unknown>;
  submitLabel: string;
  backHref: string;
};

export function HealthRecordForm({ defaultValues, onSubmit, submitLabel, backHref }: Props) {
  const router = useRouter();
  const [recordType, setRecordType] = useState(defaultValues?.record_type ?? "");
  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [description, setDescription] = useState(defaultValues?.description ?? "");
  const [recordDate, setRecordDate] = useState(defaultValues?.record_date ?? "");
  const [nextDue, setNextDue] = useState(defaultValues?.next_due ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectClass =
    "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) { setError("请输入记录标题"); return; }
    if (!recordType) { setError("请选择记录类型"); return; }
    if (!recordDate) { setError("请选择日期"); return; }

    setLoading(true);
    try {
      await onSubmit({ record_type: recordType, title: title.trim(), description, record_date: recordDate, next_due: nextDue });
      router.push(backHref);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "操作失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">记录类型 *</label>
        <select value={recordType} onChange={(e) => setRecordType(e.target.value)} className={selectClass} required>
          <option value="">请选择</option>
          {recordTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">标题 *</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="如：狂犬疫苗、年度体检" required />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">描述</label>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="详细说明..." />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">日期 *</label>
          <Input type="date" value={recordDate} onChange={(e) => setRecordDate(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">下次到期</label>
          <Input type="date" value={nextDue} onChange={(e) => setNextDue(e.target.value)} />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={() => router.push(backHref)} className="flex-1">
          <ArrowLeft className="mr-2 h-4 w-4" />取消
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          <Save className="mr-2 h-4 w-4" />{loading ? "保存中..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
