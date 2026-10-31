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

// Known addresses get human labels in the transfers list. Only addresses
// verified from our own production code or the chain itself belong here.
const ZERO = "0x0000000000000000000000000000000000000000";
const LABELS: Record<string, string> = {
  "0x522faf9a91c41c443c66765030741e4aace147d0": "VibeFlow batch contract",
  "0x5294e9927c3306dcbadb03fe70b92e01ccede505": "VibeFlow memo contract",
  "0x3600000000000000000000000000000000000000": "USDC contract",
};
function labelFor(addr: string, side: "from" | "to"): string | null {
  const a = addr.toLowerCase();
  if (a === ZERO) return side === "from" ? "New USDC (mint)" : "USDC (burn)";
  return LABELS[a] ?? null;
}

// Global USDC total (all chains) from DefiLlama's public stablecoin data,
// used only for the share-of-total framing on the issued panel. Started in
// parallel with the RPC work and time-boxed; any failure just omits it.
async function globalUsdcTotal(): Promise<number | null> {
  try {
    const res = await fetch(
      "https://stablecoins.llama.fi/stablecoins?includePrices=true",
      { signal: AbortSignal.timeout(3000), cache: "no-store" },
    );
    if (!res.ok) return null;
    const d: any = await res.json();
    const usdc = (d?.peggedAssets ?? []).find((a: any) => a.symbol === "USDC");
    const total = usdc?.circulating?.peggedUSD;
    return typeof total === "number" && total > 0 ? total : null;
  } catch {
    return null;
  }
}
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
  const globalPromise = globalUsdcTotal();
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
    calls.push(["eth_call", [{ to: USDC, data: "0x18160ddd" }, "latest"]]);
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
    const supplyHex: string | null = results[BLOCKS_SHOWN] ?? null;
    const logs: any[] = results[BLOCKS_SHOWN + 1] ?? [];

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
      .map((l: any) => {
        const from = "0x" + l.topics[1].slice(26);
        const to = "0x" + l.topics[2].slice(26);
        return {
          from,
          to,
          fromLabel: labelFor(from, "from"),
          toLabel: labelFor(to, "to"),
          amount: parseInt(l.data, 16) / 1e6,
          blockNumber: parseInt(l.blockNumber, 16),
          txHash: l.transactionHash as string,
        };
      })
      .sort((a, b) => b.blockNumber - a.blockNumber);

    const totalMoved = transfers.reduce((s, t) => s + t.amount, 0);
    const largest = transfers.reduce((m, t) => Math.max(m, t.amount), 0);

    // USDC issued on Arc: total supply of the native USDC contract,
    // read live. Growth windows compare against the supply at the block
    // closest to that many seconds ago (timestamp-targeted, corrected
    // once), so the percentages mean what they say. Any failure here
    // degrades to fewer windows, never to wrong numbers.
    let issued: any = null;
    try {
      if (supplyHex) {
        const total = Number(BigInt(supplyHex)) / 1e6;
        const nowTs = blocks.length ? blocks[0].timestamp : Math.floor(Date.now() / 1000);
        const [fromBlock] = await rpcBatch([
          ["eth_getBlockByNumber", ["0x" + from.toString(16), false]],
        ]);
        const avgBlockTime =
          fromBlock && blocks.length
            ? (nowTs - parseInt(fromBlock.timestamp, 16)) / WINDOW_BLOCKS
            : 0.5;
        const supplyAt = async (secondsAgo: number) => {
          const target = nowTs - secondsAgo;
          let guess = Math.max(0, latest - Math.round(secondsAgo / avgBlockTime));
          for (let i = 0; i < 2; i++) {
            const [b] = await rpcBatch([
              ["eth_getBlockByNumber", ["0x" + guess.toString(16), false]],
            ]);
            if (!b) return null;
            const diff = target - parseInt(b.timestamp, 16);
            if (Math.abs(diff) <= 2 || i === 1) {
              const [s] = await rpcBatch([
                ["eth_call", [{ to: USDC, data: "0x18160ddd" }, "0x" + guess.toString(16)]],
              ]);
              return s ? Number(BigInt(s)) / 1e6 : null;
            }
            guess = Math.max(0, guess + Math.round(diff / avgBlockTime));
          }
          return null;
        };
        const win = async (secondsAgo: number) => {
          const past = await supplyAt(secondsAgo);
          if (past === null || past <= 0) return null;
          const delta = total - past;
          return {
            delta: Math.round(delta * 100) / 100,
            pct: Math.round((delta / past) * 10000) / 100,
          };
        };
        const globalTotal = await globalPromise;
        issued = {
          total: Math.round(total * 100) / 100,
          sharePct:
            globalTotal !== null
              ? Math.round((total / globalTotal) * 10000) / 100
              : null,
          hour: await win(3600),
          day: await win(86400),
          week: await win(604800),
          month: await win(2592000),
        };
      }
    } catch {
      issued = null;
    }

    return NextResponse.json({
      latestBlock: latest,
      issued,
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
