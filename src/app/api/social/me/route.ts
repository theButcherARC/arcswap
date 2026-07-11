import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user as userTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch the user row directly — additionalFields like username live here
  const rows = await db
    .select({ username: userTable.username, name: userTable.name, image: userTable.image })
    .from(userTable)
    .where(eq(userTable.id, session.user.id))
    .limit(1)

  const dbUser = rows[0]
  if (!dbUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  return NextResponse.json({
    username: dbUser.username ?? '',
    name: dbUser.name ?? '',
    image: dbUser.image ?? '',
  })
}
