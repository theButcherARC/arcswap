import { db } from "@/lib/db";
import { socialProfiles, squareRequests } from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { verifyMessage } from "viem";

// The square_requests table is created on first use, same pattern as
// square_posts: no manual migration step. A pay request is a public
// ask for an exact USDC amount. Payment itself is a plain wallet to
// wallet transfer done in the browser; this API only stores the ask.
// The requester closes the request once the money has arrived, so the
// API never claims a payment happened on chain.
let tableReady: Promise<void> | null = null;
function ensureTable(): Promise<void> {
  if (!tableReady) {
    tableReady = db
      .execute(
        sql`CREATE TABLE IF NOT EXISTS square_requests (
          id text PRIMARY KEY,
          "walletAddress" text NOT NULL,
          handle text,
          amount text NOT NULL,
          note text NOT NULL,
          status text NOT NULL DEFAULT 'open',
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

const MAX_NOTE = 140;
const MAX_AMOUNT = 1000000;
const SIGN_WINDOW_MS = 10 * 60 * 1000;

function validAmount(raw: string): boolean {
  if (!/^\d+(\.\d{1,6})?$/.test(raw)) return false;
  const n = Number(raw);
  return n > 0 && n <= MAX_AMOUNT;
}

function freshTimestamp(timestamp: number): boolean {
  return !!timestamp && Math.abs(Date.now() - timestamp) <= SIGN_WINDOW_MS;
}

async function signatureOk(
  address: string,
  message: string,
  signature: string,
): Promise<boolean> {
  return verifyMessage({
    address: address as `0x${string}`,
    message,
    signature: signature as `0x${string}`,
  }).catch(() => false);
}

export async function GET() {
  try {
    await ensureTable();
    const rows = await db
      .select({
        id: squareRequests.id,
        walletAddress: squareRequests.walletAddress,
        handle: squareRequests.handle,
        amount: squareRequests.amount,
        note: squareRequests.note,
        status: squareRequests.status,
        createdAt: squareRequests.createdAt,
      })
      .from(squareRequests)
      .orderBy(desc(squareRequests.createdAt))
      .limit(50);
    return NextResponse.json({ requests: rows });
  } catch {
    return NextResponse.json(
      { error: "Requests unavailable right now" },
      { status: 502 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureTable();
    const body = await req.json();
    const address: string = body.address ?? "";
    const amount: string = (body.amount ?? "").trim();
    const note: string = (body.note ?? "").trim();
    const signature: string = body.signature ?? "";
    const timestamp: number = body.timestamp ?? 0;

    if (!/^0x[0-9a-fA-F]{40}$/.test(address)) {
      return NextResponse.json({ error: "Invalid wallet address" }, { status: 400 });
    }
    if (!validAmount(amount)) {
      return NextResponse.json(
        { error: "Amount must be more than 0 and up to 1,000,000 USDC" },
        { status: 400 },
      );
    }
    if (!note || note.length > MAX_NOTE) {
      return NextResponse.json(
        { error: "Say what the request is for, in up to 140 characters" },
        { status: 400 },
      );
    }
    if (!freshTimestamp(timestamp)) {
      return NextResponse.json(
        { error: "Signature expired, please try again" },
        { status: 400 },
      );
    }

    const message =
      "VibeSquare request\n" + timestamp + "\n" + amount + "\n" + note;
    if (!(await signatureOk(address, message, signature))) {
      return NextResponse.json({ error: "Signature check failed" }, { status: 401 });
    }

    const [profile] = await db
      .select({ username: socialProfiles.username })
      .from(socialProfiles)
      .where(
        sql`lower(${socialProfiles.walletAddress}) = ${address.toLowerCase()}`,
      )
      .limit(1);

    const request = {
      id: randomUUID(),
      walletAddress: address,
      handle: profile?.username ?? null,
      amount,
      note,
      status: "open",
      createdAt: new Date(),
    };
    await db.insert(squareRequests).values(request);
    return NextResponse.json({ request });
  } catch {
    return NextResponse.json(
      { error: "Could not create the request right now" },
      { status: 502 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await ensureTable();
    const body = await req.json();
    const id: string = body.id ?? "";
    const address: string = body.address ?? "";
    const signature: string = body.signature ?? "";
    const timestamp: number = body.timestamp ?? 0;

    if (!id || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
      return NextResponse.json({ error: "Invalid close request" }, { status: 400 });
    }
    if (!freshTimestamp(timestamp)) {
      return NextResponse.json(
        { error: "Signature expired, please try again" },
        { status: 400 },
      );
    }

    const message = "VibeSquare close request\n" + timestamp + "\n" + id;
    if (!(await signatureOk(address, message, signature))) {
      return NextResponse.json({ error: "Signature check failed" }, { status: 401 });
    }

    const [existing] = await db
      .select({
        id: squareRequests.id,
        walletAddress: squareRequests.walletAddress,
        status: squareRequests.status,
      })
      .from(squareRequests)
      .where(eq(squareRequests.id, id))
      .limit(1);
    if (!existing) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }
    if (existing.walletAddress.toLowerCase() !== address.toLowerCase()) {
      return NextResponse.json(
        { error: "Only the requester can close this request" },
        { status: 403 },
      );
    }
    if (existing.status !== "open") {
      return NextResponse.json({ request: existing });
    }

    await db
      .update(squareRequests)
      .set({ status: "closed" })
      .where(eq(squareRequests.id, id));
    return NextResponse.json({
      request: { ...existing, status: "closed" },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not close the request right now" },
      { status: 502 },
    );
  }
}
