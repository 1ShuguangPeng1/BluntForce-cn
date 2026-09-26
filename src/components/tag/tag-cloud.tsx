import Link from "next/link";

type Props = {
  tags: { name: string; count: number }[];
};

export function TagCloud({ tags }: Props) {
  if (tags.length === 0) return null;

  const maxCount = tags[0]?.count ?? 1;

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-apple-sm">
      <h3 className="text-sm font-semibold tracking-tight mb-4">热门标签</h3>
      <div className="flex flex-wrap gap-1.5">
        {tags.map(({ name, count }) => {
          const size = 0.75 + (count / maxCount) * 0.5;
          return (
            <Link
              key={name}
              href={`/explore?tag=${encodeURIComponent(name)}`}
              className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              style={{ fontSize: `${size}rem` }}
            >
              {name}
              <span className="ml-1 text-muted-foreground/50">{count}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
