import { getHealthRecordsByPet } from "@/lib/actions/health-record";
import { getServerUser } from "@/lib/auth-server";
import { HealthRecordCard } from "@/components/pet/health-record-card";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { petId: string; ownerId: string };

export async function HealthTimeline({ petId, ownerId }: Props) {
  const user = await getServerUser();
  const records = await getHealthRecordsByPet(petId);
  const isOwner = user?.id === ownerId;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-foreground">健康记录</h2>
        {isOwner && (
          <Link href={`/pet/${petId}/health/new`}>
            <Button variant="outline" size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              添加记录
            </Button>
          </Link>
        )}
      </div>

      {records.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-apple text-center">
          <p className="text-sm text-muted-foreground">暂无健康记录</p>
          {isOwner && (
            <Link href={`/pet/${petId}/health/new`} className="inline-block mt-2 text-sm text-primary hover:underline">
              添加第一条记录
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <HealthRecordCard
              key={record.id}
              id={record.id}
              petId={petId}
              recordType={record.record_type}
              title={record.title}
              description={record.description}
              recordDate={record.record_date}
              nextDue={record.next_due}
              isOwner={isOwner}
            />
          ))}
        </div>
      )}
    </div>
  );
}
