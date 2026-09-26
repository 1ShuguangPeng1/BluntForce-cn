export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs" || process.env.NEXT_PHASE === "phase-production-build") {
    return;
  }

  const { runMigrations } = await import("@/lib/db/migrate");
  await runMigrations();
}
