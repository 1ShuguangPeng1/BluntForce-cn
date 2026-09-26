"use server";

import { db } from "@/lib/db";
import { healthRecords, pets } from "@/lib/db/schema";
import { getServerUser } from "@/lib/auth-server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type HealthRecordInput = {
  pet_id: string;
  record_type: string;
  title: string;
  description?: string;
  record_date: string;
  next_due?: string;
};

async function verifyOwnership(petId: string) {
  const user = await getServerUser();
  if (!user) throw new Error("请先登录");
  const pet = await db.query.pets.findFirst({ where: eq(pets.id, petId) });
  if (!pet || pet.owner_id !== user.id) throw new Error("无权操作");
  return user;
}

export async function createHealthRecord(data: HealthRecordInput) {
  await verifyOwnership(data.pet_id);

  const [record] = await db
    .insert(healthRecords)
    .values({
      pet_id: data.pet_id,
      record_type: data.record_type,
      title: data.title,
      description: data.description ?? "",
      record_date: data.record_date,
      next_due: data.next_due || null,
    })
    .returning();

  revalidatePath(`/pet/${data.pet_id}`);
  return record;
}

export async function updateHealthRecord(id: string, data: Omit<HealthRecordInput, "pet_id">) {
  const existing = await db.query.healthRecords.findFirst({
    where: eq(healthRecords.id, id),
  });
  if (!existing) throw new Error("记录不存在");

  await verifyOwnership(existing.pet_id);

  await db
    .update(healthRecords)
    .set({
      record_type: data.record_type,
      title: data.title,
      description: data.description ?? "",
      record_date: data.record_date,
      next_due: data.next_due || null,
    })
    .where(eq(healthRecords.id, id));

  revalidatePath(`/pet/${existing.pet_id}`);
}

export async function deleteHealthRecord(id: string) {
  const existing = await db.query.healthRecords.findFirst({
    where: eq(healthRecords.id, id),
  });
  if (!existing) throw new Error("记录不存在");

  await verifyOwnership(existing.pet_id);

  await db.delete(healthRecords).where(eq(healthRecords.id, id));
  revalidatePath(`/pet/${existing.pet_id}`);
}

export async function getHealthRecordsByPet(petId: string) {
  return db.query.healthRecords.findMany({
    where: eq(healthRecords.pet_id, petId),
    orderBy: (hr, { desc }) => [desc(hr.record_date)],
  });
}

export async function getHealthRecordById(id: string) {
  return db.query.healthRecords.findFirst({
    where: eq(healthRecords.id, id),
  });
}
