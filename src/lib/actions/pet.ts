"use server";

import { db } from "@/lib/db";
import { pets } from "@/lib/db/schema";
import { getServerUser } from "@/lib/auth-server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type PetInput = {
  name: string;
  species: string;
  breed?: string;
  gender?: string;
  birth_date?: string;
  avatar_url?: string;
};

export async function createPet(data: PetInput) {
  const user = await getServerUser();
  if (!user) throw new Error("请先登录");

  const [pet] = await db
    .insert(pets)
    .values({
      owner_id: user.id,
      name: data.name,
      species: data.species,
      breed: data.breed ?? "",
      gender: data.gender ?? "",
      birth_date: data.birth_date ?? null,
      avatar_url: data.avatar_url ?? null,
    })
    .returning();

  revalidatePath("/profile");
  return pet;
}

export async function updatePet(id: string, data: PetInput) {
  const user = await getServerUser();
  if (!user) throw new Error("请先登录");

  const existing = await db.query.pets.findFirst({ where: eq(pets.id, id) });
  if (!existing || existing.owner_id !== user.id) throw new Error("无权操作");

  await db
    .update(pets)
    .set({
      name: data.name,
      species: data.species,
      breed: data.breed ?? "",
      gender: data.gender ?? "",
      birth_date: data.birth_date ?? null,
      avatar_url: data.avatar_url ?? null,
    })
    .where(eq(pets.id, id));

  revalidatePath(`/pet/${id}`);
}

export async function deletePet(id: string) {
  const user = await getServerUser();
  if (!user) throw new Error("请先登录");

  const existing = await db.query.pets.findFirst({ where: eq(pets.id, id) });
  if (!existing || existing.owner_id !== user.id) throw new Error("无权操作");

  await db.delete(pets).where(eq(pets.id, id));
  revalidatePath("/profile");
}

export async function getPetById(id: string) {
  return db.query.pets.findFirst({ where: eq(pets.id, id) });
}

export async function getPetsByOwner(ownerId: string) {
  return db.query.pets.findMany({
    where: eq(pets.owner_id, ownerId),
    orderBy: (pets, { desc }) => [desc(pets.created_at)],
  });
}
