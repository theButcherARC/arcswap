import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { scheduledBatches } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

const MAX_RECIPIENTS = 100

interface ScheduledRecipient {
  name: string
  address: string
  amount: number
}

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rows = await db
    .select()
    .from(scheduledBatches)
    .where(eq(scheduledBatches.userId, session.user.id))
    .orderBy(desc(scheduledBatches.scheduledFor))

  return NextResponse.json({
    schedules: rows.map((r) => ({
      id: r.id,
      tokenSymbol: r.tokenSymbol,
      totalAmount: r.totalAmount,
      recipients: JSON.parse(r.recipients) as ScheduledRecipient[],
      memo: r.memo ?? '',
      scheduledFor: r.scheduledFor.toISOString(),
      status: r.status,
      txHash: r.txHash ?? '',
      createdAt: r.createdAt.toISOString(),
    })),
  })
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const tokenSymbol: string = body.tokenSymbol === 'EURC' ? 'EURC' : 'USDC'
  const recipients: ScheduledRecipient[] = Array.isArray(body.recipients)
    ? body.recipients
    : []

  if (recipients.length === 0 || recipients.length > MAX_RECIPIENTS) {
    return NextResponse.json(
      { error: `Add between 1 and ${MAX_RECIPIENTS} recipients` },
      { status: 400 },
    )
  }

  for (const r of recipients) {
    if (
      !r ||
      typeof r.address !== 'string' ||
      !/^0x[0-9a-fA-F]{40}$/.test(r.address)
    ) {
      return NextResponse.json(
        { error: 'Every recipient needs a valid wallet address' },
        { status: 400 },
      )
    }
    if (typeof r.amount !== 'number' || !(r.amount > 0)) {
      return NextResponse.json(
        { error: 'Every recipient needs an amount above 0' },
        { status: 400 },
      )
    }
  }

  const scheduledFor = new Date(body.scheduledFor)
  if (
    Number.isNaN(scheduledFor.getTime()) ||
    scheduledFor.getTime() <= Date.now()
  ) {
    return NextResponse.json(
      { error: 'Pick a date and time in the future' },
      { status: 400 },
    )
  }

  const totalAmount = recipients.reduce((sum, r) => sum + r.amount, 0)
  const memo = typeof body.memo === 'string' ? body.memo.slice(0, 100) : ''

  const id = randomUUID()
  await db.insert(scheduledBatches).values({
    id,
    userId: session.user.id,
    tokenSymbol,
    totalAmount: totalAmount.toFixed(2),
    recipients: JSON.stringify(
      recipients.map((r) => ({
        name: String(r.name || '').slice(0, 60),
        address: r.address,
        amount: r.amount,
      })),
    ),
    memo,
    scheduledFor,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  return NextResponse.json({ success: true, id })
}
