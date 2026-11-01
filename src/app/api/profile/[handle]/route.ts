import { db } from "@/lib/db";
import { socialProfiles, user as userTable, userProfiles } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Public profile lookup by X handle (the VibeID). Returns only what the
// public profile page shows: name, photo, bio, telegram, VibeID code and
// the linked wallet, never email or session data.
export async function GET(
  _req: NextRequest,
  { params }: { params: { handle: string } },
) {
  const handle = (params.handle ?? "").replace(/^@/, "").trim().toLowerCase();
  if (!/^[a-z0-9_]{1,30}$/.test(handle)) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }
  try {
    const [u] = await db
      .select({
        id: userTable.id,
        username: userTable.username,
        name: userTable.name,
        image: userTable.image,
        vibeId: userTable.vibeId,
      })
      .from(userTable)
      .where(sql`lower(${userTable.username}) = ${handle}`)
      .limit(1);
    if (!u) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // user_profiles may not exist until the owner first saves; the catch
    // below then simply yields no extras and the X data carries the page.
    const [extras] = await db
      .select({
        displayName: userProfiles.displayName,
        bio: userProfiles.bio,
        telegram: userProfiles.telegram,
      })
      .from(userProfiles)
      .where(eq(userProfiles.userId, u.id))
      .limit(1)
      .catch(() => []);

    const [link] = await db
      .select({ walletAddress: socialProfiles.walletAddress, verified: socialProfiles.verified })
      .from(socialProfiles)
      .where(sql`lower(${socialProfiles.username}) = ${handle}`)
      .limit(1);

    return NextResponse.json({
      username: u.username,
      name: extras?.displayName || u.name || "",
      image: u.image ?? "",
      vibeId: u.vibeId ?? "",
      bio: extras?.bio ?? "",
      telegram: extras?.telegram ?? "",
      walletAddress: link?.walletAddress ?? "",
      verified: link?.verified ?? false,
    });
  } catch {
    return NextResponse.json({ error: "Profile unavailable right now" }, { status: 502 });
  }
}
