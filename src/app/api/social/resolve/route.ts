import { db } from '@/lib/db'
import { socialProfiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const handle = req.nextUrl.searchParams.get('handle')
  if (!handle) {
    return NextResponse.json({ error: 'handle is required' }, { status: 400 })
  }

  const clean = handle.replace(/^@/, '').toLowerCase()

  const rows = await db
    .select()
    .from(socialProfiles)
    .where(eq(socialProfiles.xHandle, clean))
    .limit(1)

  if (rows.length === 0) {
    return NextResponse.json({ error: 'not_registered' }, { status: 404 })
  }

  return NextResponse.json({
    handle:  rows[0].xHandle,
    address: rows[0].walletAddress,
    verified: rows[0].verified,
  })
}
