import Link from "next/link";
import { Syringe, Stethoscope, Pill, Heart, Edit } from "lucide-react";

type Props = {
  id: string;
  petId: string;
  recordType: string;
  title: string;
  description: string | null;
  recordDate: string;
  nextDue: string | null;
  isOwner: boolean;
};

const typeConfig: Record<string, { label: string; icon: typeof Syringe; color: string; bg: string }> = {
  vaccine:  { label: "疫苗",  icon: Syringe,     color: "text-emerald-600", bg: "bg-emerald-500/10" },
  illness:  { label: "疾病",  icon: Heart,        color: "text-red-500",     bg: "bg-red-500/10" },
  checkup:  { label: "体检",  icon: Stethoscope,  color: "text-blue-500",    bg: "bg-blue-500/10" },
  medication:{ label: "用药",  icon: Pill,         color: "text-amber-500",   bg: "bg-amber-500/10" },
};

export function HealthRecordCard({ id, petId, recordType, title, description, recordDate, nextDue, isOwner }: Props) {
  const cfg = typeConfig[recordType] ?? typeConfig.checkup;
  const Icon = cfg.icon;

  const now = new Date();
  const dueDate = nextDue ? new Date(nextDue) : null;
  const isOverdue = dueDate && dueDate <= now;
  const isUpcoming = dueDate && !isOverdue && dueDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return (
    <div className="relative rounded-xl border border-border/60 bg-card p-5 shadow-apple-sm">
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}>
          <Icon className={`h-5 w-5 ${cfg.color}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium text-muted-foreground">{cfg.label}</p>
            {isOverdue && <span className="text-[10px] font-medium text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-full">已过期</span>}
            {isUpcoming && <span className="text-[10px] font-medium text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-full">即将到期</span>}
          </div>
          <h4 className="font-medium text-foreground mt-0.5">{title}</h4>
          {description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>}
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground/70">
            <span>{recordDate}</span>
            {nextDue && <span>下次：{nextDue}</span>}
          </div>
        </div>
        {isOwner && (
          <Link href={`/pet/${petId}/health/${id}/edit`} className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
            <Edit className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
