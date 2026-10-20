import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { scheduledBatches } from '@/lib/db/schema'
import { and, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json().catch(() => null)
  const status = body?.status
  if (status !== 'sent' && status !== 'cancelled') {
    return NextResponse.json(
      { error: 'Status must be sent or cancelled' },
      { status: 400 },
    )
  }

  const [row] = await db
    .select({ id: scheduledBatches.id })
    .from(scheduledBatches)
    .where(
      and(
        eq(scheduledBatches.id, id),
        eq(scheduledBatches.userId, session.user.id),
      ),
    )
    .limit(1)

  if (!row) {
    return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
  }

  await db
    .update(scheduledBatches)
    .set({
      status,
      txHash:
        status === 'sent' && typeof body?.txHash === 'string'
          ? body.txHash
          : undefined,
      updatedAt: new Date(),
    })
    .where(eq(scheduledBatches.id, id))

  return NextResponse.json({ success: true })
}
