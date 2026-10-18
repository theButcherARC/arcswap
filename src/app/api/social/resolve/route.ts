import { db } from '@/lib/db'
import { socialProfiles, user as userTable } from '@/lib/db/schema'
import { eq, ilike } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const identifier = req.nextUrl.searchParams.get('username') ?? req.nextUrl.searchParams.get('identifier')
  if (!identifier) {
    return NextResponse.json({ error: 'identifier is required' }, { status: 400 })
  }

  const clean = identifier.replace(/^@/, '').trim()

  // 1. Try VibeID resolution (VIBE-XXXXXX → wallet via user table or social_profiles)
  if (/^VIBE-/i.test(clean)) {
    const vibeId = clean.toUpperCase()
    
    // Look up user by VibeID (case-insensitive exact match)
    const userRows = await db
      .select({ id: userTable.id, vibeId: userTable.vibeId })
      .from(userTable)
      .where(eq(userTable.vibeId, vibeId))
      .limit(1)

    if (userRows.length > 0 && userRows[0].vibeId) {
      // User has this VibeID - find their wallet from social_profiles
      const profileRows = await db
        .select()
        .from(socialProfiles)
        .where(eq(socialProfiles.userId, userRows[0].id))
        .limit(1)

      if (profileRows.length > 0) {
        return NextResponse.json({
          vibeId:   userRows[0].vibeId,
          username: profileRows[0].username,
          address:  profileRows[0].walletAddress,
          verified: profileRows[0].verified,
        })
      } else {
        // User has VibeID but no profile yet - return error with helpful message
        return NextResponse.json({ error: 'VibeID found but no wallet linked yet' }, { status: 404 })
      }
    }
    return NextResponse.json({ error: 'VibeID not found' }, { status: 404 })
  }

  // 2. Try X username resolution
  const rows = await db
    .select()
    .from(socialProfiles)
    .where(eq(socialProfiles.username, clean.toLowerCase()))
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
