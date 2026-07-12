import pg from 'pg';

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function addTestHandles() {
  try {
    await client.connect();
    console.log('[v0] Connected to database');

    // Test wallet address (from your screenshot)
    const testWalletAddress = '0xa04C...AaE'; // Using the one from screenshot
    
    // Test handles to add
    const testHandles = [
      {
        username: '@The_Last_Dip',
        walletAddress: testWalletAddress,
        verified: true,
        addedByAdmin: true
      },
      {
        username: '@butchers',
        walletAddress: testWalletAddress,
        verified: true,
        addedByAdmin: true
      }
    ];

    for (const handle of testHandles) {
      const result = await client.query(
        `INSERT INTO public.social_profiles (id, username, "walletAddress", verified, "addedByAdmin", "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1, $2, $3, $4, NOW(), NOW())
         ON CONFLICT (username) DO UPDATE 
         SET "walletAddress" = $2, verified = $3, "updatedAt" = NOW()
         RETURNING id, username, "walletAddress"`,
        [handle.username, handle.walletAddress, handle.verified, handle.addedByAdmin]
      );
      console.log(`[v0] Added/Updated handle: ${result.rows[0].username} → ${result.rows[0].walletAddress}`);
    }

    console.log('[v0] Test data added successfully!');
  } catch (error) {
    console.error('[v0] Error adding test data:', error);
  } finally {
    await client.end();
  }
}

addTestHandles();
