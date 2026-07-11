import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user, account } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const userId = session.user.id

  // Fetch the Twitter account row to get the accessToken
  const twitterAccount = await db
    .select()
    .from(account)
    .where(eq(account.userId, userId))
    .then(rows => rows.find(r => r.providerId === 'twitter'))

  if (!twitterAccount?.accessToken) {
    return NextResponse.json({ error: 'No Twitter account linked or no access token' }, { status: 400 })
  }

  // Call Twitter API v2 to get the authenticated user's username
  const twitterRes = await fetch('https://api.twitter.com/2/users/me?user.fields=username,name,profile_image_url', {
    headers: {
      Authorization: 'Bearer ' + twitterAccount.accessToken,
    },
  })

  if (!twitterRes.ok) {
    const errText = await twitterRes.text()
    return NextResponse.json({ error: 'Twitter API error: ' + twitterRes.status + ' ' + errText }, { status: 502 })
  }

  const twitterJson = await twitterRes.json()
  const username = twitterJson?.data?.username ?? ''
  const name = twitterJson?.data?.name ?? ''
  const rawImage = twitterJson?.data?.profile_image_url ?? ''
  const image = rawImage.replace('_normal.', '_400x400.')

  if (!username) {
    return NextResponse.json({ error: 'Could not get username from Twitter API' }, { status: 502 })
  }

  // Update user row in DB
  await db
    .update(user)
    .set({ username, name: name || undefined, image: image || undefined, updatedAt: new Date() })
    .where(eq(user.id, userId))

  return NextResponse.json({ username, name, image })
}
