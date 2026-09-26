import postgres from "postgres";

export async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured");

  const sql = postgres(connectionString, {
    prepare: false,
    max: 1,
    connect_timeout: 10,
  });

  try {
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS friendships (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        addressee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CHECK (requester_id <> addressee_id)
      )
    `);
    await sql.unsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS friendships_pair_unique
      ON friendships (LEAST(requester_id, addressee_id), GREATEST(requester_id, addressee_id))
    `);
    await sql.unsafe("CREATE INDEX IF NOT EXISTS friendships_requester_idx ON friendships(requester_id)");
    await sql.unsafe("CREATE INDEX IF NOT EXISTS friendships_addressee_idx ON friendships(addressee_id)");

    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
        is_read BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        CHECK (sender_id <> receiver_id)
      )
    `);
    await sql.unsafe(`
      CREATE INDEX IF NOT EXISTS messages_conversation_idx
      ON messages(sender_id, receiver_id, created_at DESC)
    `);
    await sql.unsafe("CREATE INDEX IF NOT EXISTS messages_unread_idx ON messages(receiver_id, is_read)");
  } finally {
    await sql.end();
  }
}
