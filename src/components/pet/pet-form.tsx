"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, ArrowLeft } from "lucide-react";

const speciesOptions = [
  { value: "dog", label: "狗" },
  { value: "cat", label: "猫" },
  { value: "rabbit", label: "兔" },
  { value: "bird", label: "鸟" },
  { value: "hamster", label: "仓鼠" },
  { value: "other", label: "其他" },
];

const genderOptions = [
  { value: "male", label: "公" },
  { value: "female", label: "母" },
];

type Props = {
  defaultValues?: {
    name: string;
    species: string;
    breed: string;
    gender: string;
    birth_date: string;
  };
  onSubmit: (data: {
    name: string;
    species: string;
    breed: string;
    gender: string;
    birth_date: string;
  }) => Promise<unknown>;
  submitLabel: string;
};

export function PetForm({ defaultValues, onSubmit, submitLabel }: Props) {
  const router = useRouter();
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [species, setSpecies] = useState(defaultValues?.species ?? "");
  const [breed, setBreed] = useState(defaultValues?.breed ?? "");
  const [gender, setGender] = useState(defaultValues?.gender ?? "");
  const [birthDate, setBirthDate] = useState(defaultValues?.birth_date ?? "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("请输入宠物名字");
      return;
    }
    if (!species) {
      setError("请选择物种");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ name: name.trim(), species, breed, gender, birth_date: birthDate });
      router.push("/profile/me/pets");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "操作失败");
    } finally {
      setLoading(false);
    }
  };

  const selectClass =
    "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">名字 *</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="宠物名字" required />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">物种 *</label>
          <select value={species} onChange={(e) => setSpecies(e.target.value)} className={selectClass} required>
            <option value="">请选择</option>
            {speciesOptions.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">性别</label>
          <select value={gender} onChange={(e) => setGender(e.target.value)} className={selectClass}>
            <option value="">请选择</option>
            {genderOptions.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">品种</label>
        <Input value={breed} onChange={(e) => setBreed(e.target.value)} placeholder="如：金毛、暹罗" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">出生日期</label>
        <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={() => router.back()} className="flex-1">
          <ArrowLeft className="mr-2 h-4 w-4" />
          取消
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          <Save className="mr-2 h-4 w-4" />
          {loading ? "保存中..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
