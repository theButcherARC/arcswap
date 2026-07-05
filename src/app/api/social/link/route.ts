import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { socialProfiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const walletAddress: string = body.walletAddress
  const xHandle: string = body.xHandle

  if (!walletAddress || !xHandle) {
    return NextResponse.json({ error: 'walletAddress and xHandle are required' }, { status: 400 })
  }

  if (!/^0x[0-9a-fA-F]{40}$/.test(walletAddress)) {
    return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 })
  }

  const clean = xHandle.replace(/^@/, '').toLowerCase()

  // Upsert: update if handle exists for this user, insert otherwise
  const existing = await db
    .select()
    .from(socialProfiles)
    .where(eq(socialProfiles.xHandle, clean))
    .limit(1)

  if (existing.length > 0) {
    await db
      .update(socialProfiles)
      .set({
        walletAddress,
        userId: session.user.id,
        verified: true,
        updatedAt: new Date(),
      })
      .where(eq(socialProfiles.xHandle, clean))
  } else {
    await db.insert(socialProfiles).values({
      id:            randomUUID(),
      xHandle:       clean,
      xUserId:       session.user.id,
      walletAddress,
      userId:        session.user.id,
      verified:      true,
      addedByAdmin:  false,
      createdAt:     new Date(),
      updatedAt:     new Date(),
    })
  }

  return NextResponse.json({ success: true, handle: clean, address: walletAddress })
}
