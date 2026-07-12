import pg from 'pg'
const { Pool } = pg

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function run() {
  const client = await pool.connect()
  try {
    // Add username column to user table if it doesn't exist
    await client.query(`
      ALTER TABLE "user"
      ADD COLUMN IF NOT EXISTS username text;
    `)
    console.log('[v0] Added username column to user table')

    // Show current social_profiles for debugging
    const rows = await client.query('SELECT username, "walletAddress" FROM social_profiles ORDER BY "createdAt" DESC LIMIT 10')
    console.log('[v0] Current social_profiles:', rows.rows)
  } finally {
    client.release()
    await pool.end()
  }
}

run().catch(console.error)
