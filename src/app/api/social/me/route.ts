import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { account, user as userTable } from '@/lib/db/schema'
import { generateVibeId } from '@/utils/vibeId'
import { and, eq, ne } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

interface XProfileResponse {
  data?: {
    id?: string
    username?: string
    name?: string
    profile_image_url?: string
  }
}

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const [dbUser] = await db
    .select({ username: userTable.username, name: userTable.name, image: userTable.image, vibeId: userTable.vibeId })
    .from(userTable)
    .where(eq(userTable.id, session.user.id))
    .limit(1)

  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Assign a unique VibeID if missing
  let vibeId = dbUser.vibeId
  if (!vibeId) {
    let candidate = ''
    for (let attempt = 0; attempt < 10; attempt++) {
      candidate = generateVibeId()
      const collision = await db
        .select({ id: userTable.id })
        .from(userTable)
        .where(and(eq(userTable.vibeId, candidate), ne(userTable.id, session.user.id)))
        .limit(1)
      if (collision.length === 0) break
    }
    vibeId = candidate
    await db.update(userTable).set({ vibeId, updatedAt: new Date() }).where(eq(userTable.id, session.user.id))
  }

  if (dbUser.username?.trim()) {
    return NextResponse.json({
      username: dbUser.username.trim(),
      name: dbUser.name ?? '',
      image: dbUser.image ?? '',
      vibeId,
    })
  }

  const [xAccount] = await db
    .select({ accessToken: account.accessToken })
    .from(account)
    .where(and(eq(account.userId, session.user.id), eq(account.providerId, 'twitter')))
    .limit(1)

  if (!xAccount?.accessToken) {
    return NextResponse.json(
      { error: 'X account token is unavailable. Please reconnect X.' },
      { status: 409 },
    )
  }

  const xResponse = await fetch(
    'https://api.x.com/2/users/me?user.fields=id,name,username,profile_image_url',
    {
      headers: { Authorization: `Bearer ${xAccount.accessToken}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    },
  )

  if (!xResponse.ok) {
    return NextResponse.json(
      { error: 'X profile could not be verified. Please reconnect X.' },
      { status: 502 },
    )
  }

  const xProfile = (await xResponse.json()) as XProfileResponse
  const username = xProfile.data?.username?.replace(/^@/, '').trim().toLowerCase()

  if (!username) {
    return NextResponse.json(
      { error: 'X did not return a username. Please reconnect X.' },
      { status: 502 },
    )
  }

  const name = xProfile.data?.name?.trim() || dbUser.name || ''
  const image = xProfile.data?.profile_image_url || dbUser.image || ''

  await db
    .update(userTable)
    .set({ username, name, image, updatedAt: new Date() })
    .where(eq(userTable.id, session.user.id))

  return NextResponse.json({ username, name, image, vibeId })
}
