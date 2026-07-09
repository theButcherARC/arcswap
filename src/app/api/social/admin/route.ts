import { db } from '@/lib/db'
import { socialProfiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

const ADMIN_WALLET = '0xa04C24A33Dd54cE8142319FEccDd9602C5D1AAaE'

function isAdmin(req: NextRequest): boolean {
  const wallet = req.headers.get('x-wallet-address') ?? ''
  return wallet.toLowerCase() === ADMIN_WALLET.toLowerCase()
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const rows = await db.select().from(socialProfiles)
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const username: string = body.username
  const walletAddress: string = body.walletAddress

  if (!username || !walletAddress) {
    return NextResponse.json({ error: 'username and walletAddress required' }, { status: 400 })
  }

  if (!/^0x[0-9a-fA-F]{40}$/.test(walletAddress)) {
    return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 })
  }

  const clean = username.replace(/^@/, '').toLowerCase()

  const existing = await db
    .select()
    .from(socialProfiles)
    .where(eq(socialProfiles.username, clean))
    .limit(1)

  if (existing.length > 0) {
    await db
      .update(socialProfiles)
      .set({ walletAddress, addedByAdmin: true, updatedAt: new Date() })
      .where(eq(socialProfiles.username, clean))
  } else {
    await db.insert(socialProfiles).values({
      id:           randomUUID(),
      username:     clean,
      walletAddress,
      verified:     false,
      addedByAdmin: true,
      createdAt:    new Date(),
      updatedAt:    new Date(),
    })
  }

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const username: string = body.username
  if (!username) {
    return NextResponse.json({ error: 'username required' }, { status: 400 })
  }

  const clean = username.replace(/^@/, '').toLowerCase()
  await db.delete(socialProfiles).where(eq(socialProfiles.username, clean))
  return NextResponse.json({ success: true })
}
