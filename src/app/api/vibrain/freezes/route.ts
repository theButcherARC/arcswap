import { NextResponse } from "next/server";
import { FREEZE_ARC } from "../../../data/freeze-arc";
import { FREEZE_ETH_A } from "../../../data/freeze-ethereum-a";
import { FREEZE_ETH_B } from "../../../data/freeze-ethereum-b";

export const dynamic = "force-dynamic";

// Vibrain USDC freeze watch. Circle can freeze USDC at any address; the
// USDC contract records each act as a Blacklisted / UnBlacklisted event.
// Live coverage is Arc and Ethereum: each chain's full history sits in a
// scanned snapshot (src/data/freeze-*.ts) and this route adds a live tail
// from the snapshot block to the chain tip on every request, so a freeze
// shows here minutes after it lands. All-chains totals come from the
// Eagle freeze tracker's public record and are labeled with their date.
const BL =
  "0xffa4e6181777692565cf28528fc88fd1516ea86b56da075235fa575af6a4b855";
const UN =
  "0x117e3210bb9aa7d9baff172026820255c6f6c30ba8999d1c2fd88e2848137c4e";

type RawEvent = [number, string, string, string, number];
type FreezeEvent = {
  block: number;
  kind: "freeze" | "unfreeze";
  address: string;
  tx: string;
  logIndex: number;
};

type ChainCfg = {
  id: "arc" | "ethereum";
  name: string;
  rpc: string;
  usdc: string;
  span: number;
  explorer: string;
  snapshot: { throughBlock: number; events: FreezeEvent[] };
};

function toEvents(raw: RawEvent[]): FreezeEvent[] {
  return raw.map(([block, k, address, tx, logIndex]) => ({
    block,
    kind: k === "f" ? "freeze" : "unfreeze",
    address,
    tx,
    logIndex,
  }));
}

const CHAINS: ChainCfg[] = [
  {
    id: "arc",
    name: "Arc",
    rpc: "https://rpc.mainnet.arc.io",
    usdc: "0x3600000000000000000000000000000000000000",
    span: 9000, // the Arc public RPC rejects wider getLogs ranges
    explorer: "https://explorer.arc.io",
    snapshot: {
      throughBlock: FREEZE_ARC.throughBlock,
      events: toEvents(FREEZE_ARC.events),
    },
  },
  {
    id: "ethereum",
    name: "Ethereum",
    rpc: "https://gateway.tenderly.co/public/mainnet",
    usdc: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    span: 9999,
    explorer: "https://etherscan.io",
    snapshot: {
      throughBlock: 26311304,
      events: toEvents([...FREEZE_ETH_A, ...FREEZE_ETH_B]),
    },
  },
];

async function rpc(
  url: string,
  calls: [string, unknown[]][],
): Promise<any[]> {
  const single = calls.length === 1;
  const payload = single
    ? { jsonrpc: "2.0", id: 1, method: calls[0][0], params: calls[0][1] }
    : calls.map(([method, params], i) => ({
        jsonrpc: "2.0",
        id: i + 1,
        method,
        params,
      }));
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  if (!res.ok) throw new Error("RPC status " + res.status);
  const out = await res.json();
  const arr = Array.isArray(out) ? out : [out];
  arr.sort((a: any, b: any) => a.id - b.id);
  return arr.map((r: any) => {
    if (r.error) throw new Error(r.error.message ?? "RPC error");
    return r.result;
  });
}

function padAddr(a: string): string {
  return a.toLowerCase().replace("0x", "").padStart(64, "0");
}

async function processChain(cfg: ChainCfg) {
  const [latestHex] = await rpc(cfg.rpc, [["eth_blockNumber", []]]);
  const latest = parseInt(latestHex, 16);

  // Live tail, sequential single getLogs calls (both RPCs throttle
  // batched getLogs hard).
  const tail: FreezeEvent[] = [];
  for (let s = cfg.snapshot.throughBlock + 1; s <= latest; s += cfg.span) {
    const e = Math.min(s + cfg.span - 1, latest);
    const [logs] = await rpc(cfg.rpc, [
      [
        "eth_getLogs",
        [
          {
            address: cfg.usdc,
            topics: [[BL, UN]],
            fromBlock: "0x" + s.toString(16),
            toBlock: "0x" + e.toString(16),
          },
        ],
      ],
    ]);
    for (const lg of logs ?? []) {
      tail.push({
        block: parseInt(lg.blockNumber, 16),
        kind:
          (lg.topics[0] as string).toLowerCase() === BL
            ? "freeze"
            : "unfreeze",
        address: "0x" + (lg.topics[1] as string).slice(-40),
        tx: lg.transactionHash,
        logIndex: parseInt(lg.logIndex, 16),
      });
    }
  }

  const events = [...cfg.snapshot.events, ...tail].sort(
    (a, b) => a.block - b.block || a.logIndex - b.logIndex,
  );
  const state = new Map<string, "freeze" | "unfreeze">();
  for (const ev of events) state.set(ev.address.toLowerCase(), ev.kind);
  const frozenNow = [...state.entries()]
    .filter(([, k]) => k === "freeze")
    .map(([a]) => a);

  let locked = 0;
  for (let i = 0; i < frozenNow.length; i += 40) {
    const chunk = frozenNow.slice(i, i + 40);
    const bals = await rpc(
      cfg.rpc,
      chunk.map(
        (a) =>
          [
            "eth_call",
            [{ to: cfg.usdc, data: "0x70a08231" + padAddr(a) }, "latest"],
          ] as [string, unknown[]],
      ),
    );
    for (const b of bals) if (b) locked += Number(BigInt(b)) / 1e6;
  }

  const latestEvents = [...events].slice(-10).reverse();
  const blocks = [...new Set(latestEvents.map((e) => e.block))];
  const tsByBlock = new Map<number, number>();
  if (blocks.length) {
    const bres = await rpc(
      cfg.rpc,
      blocks.map(
        (b) =>
          [
            "eth_getBlockByNumber",
            ["0x" + b.toString(16), false],
          ] as [string, unknown[]],
      ),
    );
    blocks.forEach((b, i) => {
      if (bres[i]) tsByBlock.set(b, parseInt(bres[i].timestamp, 16));
    });
  }

  const lastFreezeEvent = [...events]
    .reverse()
    .find((e) => e.kind === "freeze");
  let lastFreeze: any = null;
  if (lastFreezeEvent) {
    if (!tsByBlock.has(lastFreezeEvent.block)) {
      const [b] = await rpc(cfg.rpc, [
        [
          "eth_getBlockByNumber",
          ["0x" + lastFreezeEvent.block.toString(16), false],
        ],
      ]);
      if (b) tsByBlock.set(lastFreezeEvent.block, parseInt(b.timestamp, 16));
    }
    const [bal] = await rpc(cfg.rpc, [
      [
        "eth_call",
        [
          {
            to: cfg.usdc,
            data: "0x70a08231" + padAddr(lastFreezeEvent.address),
          },
          "latest",
        ],
      ],
    ]);
    lastFreeze = {
      chain: cfg.id,
      chainName: cfg.name,
      explorer: cfg.explorer,
      address: lastFreezeEvent.address,
      tx: lastFreezeEvent.tx,
      block: lastFreezeEvent.block,
      ts: tsByBlock.get(lastFreezeEvent.block) ?? null,
      balance: bal ? Math.round((Number(BigInt(bal)) / 1e6) * 100) / 100 : 0,
    };
  }

  return {
    id: cfg.id,
    name: cfg.name,
    explorer: cfg.explorer,
    frozenCount: frozenNow.length,
    lockedUsdc: Math.round(locked * 100) / 100,
    totalFreezes: events.filter((e) => e.kind === "freeze").length,
    totalUnfreezes: events.filter((e) => e.kind === "unfreeze").length,
    events: latestEvents.map((e) => ({
      ...e,
      ts: tsByBlock.get(e.block) ?? null,
    })),
    throughBlock: latest,
    lastFreeze,
  };
}

export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const check = params.get("check");
  if (check) {
    const cfg =
      CHAINS.find((c) => c.id === params.get("chain")) ?? CHAINS[0];
    if (!/^0x[0-9a-fA-F]{40}$/.test(check)) {
      return NextResponse.json(
        { error: "That does not look like an address" },
        { status: 400 },
      );
    }
    try {
      const [bl, bal] = await rpc(cfg.rpc, [
        [
          "eth_call",
          [{ to: cfg.usdc, data: "0xfe575a87" + padAddr(check) }, "latest"],
        ],
        [
          "eth_call",
          [{ to: cfg.usdc, data: "0x70a08231" + padAddr(check) }, "latest"],
        ],
      ]);
      return NextResponse.json({
        address: check.toLowerCase(),
        chain: cfg.id,
        frozen: bl ? BigInt(bl) === BigInt(1) : false,
        balance: bal ? Math.round((Number(BigInt(bal)) / 1e6) * 100) / 100 : 0,
      });
    } catch {
      return NextResponse.json(
        { error: "Check unavailable right now" },
        { status: 502 },
      );
    }
  }

  const results = await Promise.all(
    CHAINS.map(async (cfg) => {
      try {
        return await processChain(cfg);
      } catch {
        return null;
      }
    }),
  );
  const chains = results.filter(Boolean) as any[];
  if (!chains.length) {
    return NextResponse.json(
      { error: "Freeze data unavailable right now" },
      { status: 502 },
    );
  }
  const lastFreeze =
    chains
      .map((c) => c.lastFreeze)
      .filter(Boolean)
      .sort((a, b) => (b.ts ?? 0) - (a.ts ?? 0))[0] ?? null;

  return NextResponse.json({
    global: {
      // All-chains USDC freeze record, from the Eagle freeze tracker's
      // public USDC page. A dated third-party snapshot, labeled as such
      // in the UI; the live figures are our own contract reads.
      asOf: "Oct 30, 2026",
      source: "Eagle freeze tracker",
      sourceUrl: "https://eaglevirtual.com/usdc-blacklist",
      freezes: 12797,
      unfreezes: 1736,
      wallets: 2072,
      chains: 28,
      frozenUsd: 1396074721.68,
      monthFreezes: 229,
      monthLabel: "October 2026 so far",
      biggest: {
        amount: 823000000,
        chain: "Ethereum",
        date: "Oct 29, 2026",
        note: "one address, after the Binance hack",
      },
    },
    chains: Object.fromEntries(chains.map((c) => [c.id, c])),
    lastFreeze,
  });
}
