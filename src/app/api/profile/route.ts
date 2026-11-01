import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { userProfiles } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// The user_profiles table is created on first use so this feature ships
// without a manual migration step (same pattern as square_posts).
let tableReady: Promise<void> | null = null;
export function ensureProfilesTable(): Promise<void> {
  if (!tableReady) {
    tableReady = db
      .execute(
        sql`CREATE TABLE IF NOT EXISTS user_profiles (
          "userId" text PRIMARY KEY,
          "displayName" text,
          bio text,
          telegram text,
          "updatedAt" timestamp NOT NULL DEFAULT now()
        )`,
      )
      .then(() => undefined)
      .catch((e) => {
        tableReady = null;
        throw e;
      });
  }
  return tableReady;
}

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await ensureProfilesTable();
    const [row] = await db
      .select({
        displayName: userProfiles.displayName,
        bio: userProfiles.bio,
        telegram: userProfiles.telegram,
      })
      .from(userProfiles)
      .where(eq(userProfiles.userId, session.user.id))
      .limit(1);
    return NextResponse.json({
      displayName: row?.displayName ?? "",
      bio: row?.bio ?? "",
      telegram: row?.telegram ?? "",
    });
  } catch {
    return NextResponse.json({ error: "Profile unavailable right now" }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await ensureProfilesTable();
    const body = await req.json();
    const displayName = clean(body.displayName, 50);
    const bio = clean(body.bio, 160);
    const telegram = clean(body.telegram, 32)
      .replace(/^https?:\/\/t\.me\//, "")
      .replace(/^@/, "");
    const values = {
      userId: session.user.id,
      displayName: displayName || null,
      bio: bio || null,
      telegram: telegram || null,
      updatedAt: new Date(),
    };
    await db
      .insert(userProfiles)
      .values(values)
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: {
          displayName: values.displayName,
          bio: values.bio,
          telegram: values.telegram,
          updatedAt: values.updatedAt,
        },
      });
    return NextResponse.json({ ok: true, displayName, bio, telegram });
  } catch {
    return NextResponse.json({ error: "Could not save profile right now" }, { status: 502 });
  }
}
