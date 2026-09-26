"use client";

import { useRouter } from "next/navigation";

const categories = [
  { value: "all", label: "全部" },
  { value: "experience", label: "经验分享" },
  { value: "knowledge", label: "健康知识" },
  { value: "question", label: "提问求助" },
  { value: "daily", label: "日常分享" },
];

const sorts = [
  { value: "latest", label: "最新" },
  { value: "hot", label: "最热" },
];

type Props = {
  currentCategory: string;
  currentTag?: string;
  currentSort: string;
};

export function ExploreFilters({ currentCategory, currentTag, currentSort }: Props) {
  const router = useRouter();

  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    const cat = overrides.category ?? currentCategory;
    const tag = overrides.tag ?? currentTag;
    const sort = overrides.sort ?? currentSort;

    if (cat && cat !== "all") params.set("category", cat);
    if (tag) params.set("tag", tag);
    if (sort && sort !== "latest") params.set("sort", sort);

    const qs = params.toString();
    return `/explore${qs ? `?${qs}` : ""}`;
  }

  return (
    <div className="space-y-3">
      {/* Category tabs */}
      <div className="flex gap-1 overflow-x-auto">
        {categories.map((c) => (
          <button
            key={c.value}
            onClick={() => router.push(buildUrl({ category: c.value }))}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              currentCategory === c.value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Sort + active tag */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {sorts.map((s) => (
            <button
              key={s.value}
              onClick={() => router.push(buildUrl({ sort: s.value }))}
              className={`text-xs px-3 py-1 rounded-md transition-colors ${
                currentSort === s.value
                  ? "bg-muted text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {currentTag && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            标签:
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              #{currentTag}
            </span>
            <button
              onClick={() => router.push(buildUrl({ tag: undefined }))}
              className="text-muted-foreground/50 hover:text-foreground ml-1"
            >
              ×
            </button>
          </span>
        )}
      </div>
    </div>
  );
}
