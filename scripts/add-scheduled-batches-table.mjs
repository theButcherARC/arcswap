import pg from 'pg'
const { Pool } = pg

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function run() {
  const client = await pool.connect()
  try {
    // Create scheduled_batches table for Scheduled payments v1 (see PR #16)
    await client.query(`
      CREATE TABLE IF NOT EXISTS scheduled_batches (
        id text PRIMARY KEY,
        "userId" text NOT NULL REFERENCES "user"(id),
        "tokenSymbol" text NOT NULL,
        "totalAmount" text NOT NULL,
        recipients text NOT NULL,
        memo text,
        "scheduledFor" timestamp NOT NULL,
        status text NOT NULL DEFAULT 'pending',
        "txHash" text,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      );
    `)
    console.log('[v0] scheduled_batches table ready')

    const check = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'scheduled_batches' ORDER BY ordinal_position",
    )
    console.log(
      '[v0] Columns:',
      check.rows.map((r) => r.column_name),
    )
  } finally {
    client.release()
    await pool.end()
  }
}

run().catch(console.error)
