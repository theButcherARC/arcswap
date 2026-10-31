import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Vibrain history: total supply of native USDC at hourly points over the
// last 24 hours, read from the chain archive. Block targets are estimated
// from the chain's own average block time over the last 1,200 blocks; a
// sparkline tolerates the small drift, and the response says what it is.
const RPC = "https://rpc.mainnet.arc.io";
const USDC = "0x3600000000000000000000000000000000000000";
const POINTS = 25; // now plus the last 24 hours, hourly

async function rpcBatch(calls: [string, unknown[]][]): Promise<any[]> {
  const body = calls.map(([method, params], i) => ({
    jsonrpc: "2.0",
    id: i + 1,
    method,
    params,
  }));
  const res = await fetch(RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("RPC status " + res.status);
  const out = await res.json();
  const arr = Array.isArray(out) ? out : [out];
  arr.sort((a: any, b: any) => a.id - b.id);
  return arr.map((r: any) => r.result);
}

export async function GET() {
  try {
    const [latestHex] = await rpcBatch([["eth_blockNumber", []]]);
    const latest = parseInt(latestHex, 16);
    const from = latest - 1200;

    const [bNow, bFrom] = await rpcBatch([
      ["eth_getBlockByNumber", ["0x" + latest.toString(16), false]],
      ["eth_getBlockByNumber", ["0x" + from.toString(16), false]],
    ]);
    const nowTs = parseInt(bNow.timestamp, 16);
    const avgBt = (nowTs - parseInt(bFrom.timestamp, 16)) / 1200;

    const calls: [string, unknown[]][] = [];
    for (let i = POINTS - 1; i >= 0; i--) {
      const block = Math.max(0, latest - Math.round((i * 3600) / avgBt));
      calls.push([
        "eth_call",
        [{ to: USDC, data: "0x18160ddd" }, "0x" + block.toString(16)],
      ]);
    }
    const supplies = await rpcBatch(calls);
    const points = supplies.map((s: string | null, idx: number) => ({
      hoursAgo: POINTS - 1 - idx,
      supply: s ? Math.round((Number(BigInt(s)) / 1e6) * 100) / 100 : null,
    }));

    return NextResponse.json({
      points,
      latestBlock: latest,
      fetchedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "History unavailable right now" },
      { status: 502 },
    );
  }
}
