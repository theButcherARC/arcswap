import pg from 'pg'
const { Pool } = pg

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function run() {
  const client = await pool.connect()
  try {
    // Remove malformed entries with @ prefix (resolve API strips @ itself)
    await client.query(`DELETE FROM social_profiles WHERE username LIKE '@%'`)
    console.log('[v0] Removed handles with @ prefix')

    // Upsert clean handles (lowercase, no @)
    // the_last_dip → your wallet
    const walletAddress = '0xa04C24A33Dd54cE8142319FEccDd9602C5D1AAaE'

    const handles = [
      'the_last_dip',
      'butchers.base.eth',
      'butchers',
    ]

    for (const h of handles) {
      await client.query(`
        INSERT INTO social_profiles (id, username, "walletAddress", verified, "addedByAdmin", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), $1, $2, true, false, NOW(), NOW())
        ON CONFLICT (username) DO UPDATE SET "walletAddress" = $2, "updatedAt" = NOW()
      `, [h, walletAddress])
      console.log('[v0] Upserted:', h, '->', walletAddress.slice(0, 8) + '...')
    }

    const rows = await client.query('SELECT username, "walletAddress" FROM social_profiles ORDER BY "createdAt" DESC')
    console.log('[v0] Final social_profiles:', rows.rows)
  } finally {
    client.release()
    await pool.end()
  }
}

run().catch(console.error)
