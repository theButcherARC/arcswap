import { db } from "@/lib/db";
import { socialProfiles, squarePosts } from "@/lib/db/schema";
import { desc, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { verifyMessage } from "viem";

// The square_posts table is created on first use so this feature ships
// without a manual migration step. Column names are quoted to match the
// camelCase convention Drizzle uses everywhere else in this schema.
let tableReady: Promise<void> | null = null;
function ensureTable(): Promise<void> {
  if (!tableReady) {
    tableReady = db
      .execute(
        sql`CREATE TABLE IF NOT EXISTS square_posts (
          id text PRIMARY KEY,
          "walletAddress" text NOT NULL,
          handle text,
          content text NOT NULL,
          "createdAt" timestamp NOT NULL DEFAULT now()
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

const MAX_CONTENT = 500;
const SIGN_WINDOW_MS = 10 * 60 * 1000;

export async function GET() {
  try {
    await ensureTable();
    const rows = await db
      .select({
        id: squarePosts.id,
        walletAddress: squarePosts.walletAddress,
        handle: squarePosts.handle,
        content: squarePosts.content,
        createdAt: squarePosts.createdAt,
      })
      .from(squarePosts)
      .orderBy(desc(squarePosts.createdAt))
      .limit(50);
    return NextResponse.json({ posts: rows });
  } catch {
    return NextResponse.json(
      { error: "Feed unavailable right now" },
      { status: 502 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureTable();
    const body = await req.json();
    const address: string = body.address ?? "";
    const content: string = (body.content ?? "").trim();
    const signature: string = body.signature ?? "";
    const timestamp: number = body.timestamp ?? 0;

    if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
      return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
    }
    if (!content || content.length > MAX_CONTENT) {
      return NextResponse.json(
        { error: "Post must be between 1 and 500 characters" },
        { status: 400 },
      );
    }
    if (!timestamp || Math.abs(Date.now() - timestamp) > SIGN_WINDOW_MS) {
      return NextResponse.json(
        { error: "Signature expired, please try again" },
        { status: 400 },
      );
    }

    const message = "VibeSquare post\n" + timestamp + "\n" + content;
    const valid = await verifyMessage({
      address: address as `0x${string}`,
      message,
      signature: signature as `0x${string}`,
    }).catch(() => false);
    if (!valid) {
      return NextResponse.json({ error: "Signature check failed" }, { status: 401 });
    }

    // If this wallet has a linked VibeID (social profile), show its handle.
    const [profile] = await db
      .select({ username: socialProfiles.username })
      .from(socialProfiles)
      .where(
        sql`lower(${socialProfiles.walletAddress}) = ${address.toLowerCase()}`,
      )
      .limit(1);

    const post = {
      id: randomUUID(),
      walletAddress: address,
      handle: profile?.username ?? null,
      content,
      createdAt: new Date(),
    };
    await db.insert(squarePosts).values(post);
    return NextResponse.json({ post });
  } catch {
    return NextResponse.json({ error: "Could not post right now" }, { status: 502 });
  }
}
