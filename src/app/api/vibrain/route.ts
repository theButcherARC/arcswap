import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Vibrain data source: Arc mainnet public RPC (the explorer API is behind a
// bot wall, the RPC is not). Everything returned here is read live from the
// chain on every request, nothing is stored or faked.
const RPC = "https://rpc.mainnet.arc.io";
const USDC = "0x3600000000000000000000000000000000000000";
const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
const WINDOW_BLOCKS = 1200; // about 10 minutes of Arc activity
const BLOCKS_SHOWN = 12;
const TRANSFERS_SHOWN = 25;

type Call = [string, unknown[]];

async function rpcBatch(calls: Call[]): Promise<any[]> {
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
    const from = latest - WINDOW_BLOCKS;

    const calls: Call[] = [];
    for (let i = 0; i < BLOCKS_SHOWN; i++) {
      calls.push([
        "eth_getBlockByNumber",
        ["0x" + (latest - i).toString(16), false],
      ]);
    }
    calls.push([
      "eth_getLogs",
      [
        {
          fromBlock: "0x" + from.toString(16),
          toBlock: "0x" + latest.toString(16),
          address: USDC,
          topics: [TRANSFER_TOPIC],
        },
      ],
    ]);

    const results = await rpcBatch(calls);
    const rawBlocks = results.slice(0, BLOCKS_SHOWN);
    const logs: any[] = results[BLOCKS_SHOWN] ?? [];

    const blocks = rawBlocks
      .filter(Boolean)
      .map((b: any) => ({
        number: parseInt(b.number, 16),
        timestamp: parseInt(b.timestamp, 16),
        txCount: b.transactions.length,
      }));

    const blockTimeSec =
      blocks.length > 1
        ? (blocks[0].timestamp - blocks[blocks.length - 1].timestamp) /
          (blocks.length - 1)
        : 0;

    const transfers = logs
      .map((l: any) => ({
        from: "0x" + l.topics[1].slice(26),
        to: "0x" + l.topics[2].slice(26),
        amount: parseInt(l.data, 16) / 1e6,
        blockNumber: parseInt(l.blockNumber, 16),
        txHash: l.transactionHash as string,
      }))
      .sort((a, b) => b.blockNumber - a.blockNumber);

    const totalMoved = transfers.reduce((s, t) => s + t.amount, 0);
    const largest = transfers.reduce((m, t) => Math.max(m, t.amount), 0);

    return NextResponse.json({
      latestBlock: latest,
      blockTimeSec: Math.round(blockTimeSec * 100) / 100,
      windowBlocks: WINDOW_BLOCKS,
      blocks,
      transfers: transfers.slice(0, TRANSFERS_SHOWN),
      stats: {
        transferCount: transfers.length,
        totalMoved: Math.round(totalMoved * 100) / 100,
        largest: Math.round(largest * 100) / 100,
      },
      fetchedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { error: "Live data unavailable right now" },
      { status: 502 },
    );
  }
}
