"use client";

import { useRouter, useSearchParams } from "next/navigation";

const categories = [
  { value: "all", label: "全部" },
  { value: "experience", label: "经验分享" },
  { value: "knowledge", label: "健康知识" },
  { value: "question", label: "提问求助" },
  { value: "daily", label: "日常分享" },
];

export function CategoryTabs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("category") ?? "all";

  function handleTab(value: string) {
    if (value === "all") {
      router.push("/");
    } else {
      router.push(`/?category=${value}`);
    }
  }

  return (
    <div className="flex gap-1 overflow-x-auto pb-1">
      {categories.map((c) => (
        <button
          key={c.value}
          onClick={() => handleTab(c.value)}
          className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            current === c.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
