import { db } from '@/lib/db'
import { socialProfiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get('username')
  if (!username) {
    return NextResponse.json({ error: 'username is required' }, { status: 400 })
  }

  const clean = username.replace(/^@/, '').toLowerCase()

  const rows = await db
    .select()
    .from(socialProfiles)
    .where(eq(socialProfiles.username, clean))
    .limit(1)

  if (rows.length === 0) {
    return NextResponse.json({ error: 'not_registered' }, { status: 404 })
  }

  return NextResponse.json({
    username: rows[0].username,
    address:  rows[0].walletAddress,
    verified: rows[0].verified,
  })
}
