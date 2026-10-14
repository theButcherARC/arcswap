# VibeFlow

### Agentic Payroll Infrastructure on Arc

> Tell an AI who to pay. It settles thousands of USDC/EURC payments in a single transaction — with sub-second finality and gas paid in stablecoins. Built for payroll, rewards, vendor payouts, and agent-to-agent disbursements.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-vibeflow.vercel.app-6d28d9?style=for-the-badge&logo=vercel)](https://vibeflow.vercel.app)
[![Built on Arc](https://img.shields.io/badge/Built%20on-Arc%20Mainnet-0ea5e9?style=for-the-badge)](https://arc.network)
[![Powered by Circle](https://img.shields.io/badge/Powered%20by-Circle%20USDC-00ac6b?style=for-the-badge)](https://circle.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)

---

## What is VibeFlow?

VibeFlow is programmable USDC batch payroll infrastructure on Arc. Describe a payment run in natural language — "pay Alice $50, Bob $100" — and an AI agent parses it, resolves recipients (wallet addresses or social handles), and settles the entire batch in **one on-chain transaction** with gas paid entirely in stablecoins.

It is built around three ideas:

1. **Agentic economic activity** — payments initiated by natural language, not forms. The AI agent is the interface; the chain is the settlement layer.
2. **One transaction, thousands of recipients** — Arc's `Multicall3From` batches every transfer atomically while preserving `msg.sender`, so users sign once with zero token approvals.
3. **Identity beyond addresses** — pay `@handles` via VibeID social resolution, and label every batch with an on-chain payroll memo (e.g. "July Salary") that lives on the chain forever.

---

## Features

| Feature | Description |
|---|---|
| **AI Payment Agent** | Groq-powered natural-language parsing — type "pay 3 people $50 each" and recipient rows auto-populate. Runs server-side so keys never touch the client |
| **Bulk Pay** | Batch USDC/EURC transfers to 100+ recipients in a single transaction via Multicall3From |
| **CSV Upload** | Upload a recipient/amount CSV instead of entering rows manually |
| **USDC + EURC Toggle** | Switch between Circle USD and EUR stablecoins before sending |
| **Onchain Memo Labels** | Attach payroll tags (e.g. "July Salary") stored permanently onchain via the Memo contract |
| **Social Pay / VibeID** | Pay by @handle or VibeID instead of copying wallet addresses |
| **X (Twitter) Linking** | Link an X account to a wallet; handles, names, and avatars resolve for payments |
| **Dashboard** | Transaction history, balances, and explorer links pulled from the Arc explorer API |
| **Sub-second Finality** | Arc settles in under 1 second — orders of magnitude faster than L1s or L2s |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router), TypeScript 5, Tailwind CSS 3 |
| Wallet / Chain | Wagmi v2 + Viem, MetaMask, Circle App Kit adapter |
| AI | Groq (`llama-3.3-70b-versatile`), server-side only |
| Auth | Better Auth + X OAuth for social linking |
| Database | Neon Postgres + Drizzle ORM |
| Contracts | Solidity 0.8.24 + Hardhat (`/contracts`) |
| Hosting | Vercel |

---

## Circle / Arc Contracts Used

| Contract | Address | Purpose |
|---|---|---|
| **Multicall3From** | `0x522fAf9A91c41c443c66765030741e4AaCe147D0` | Batches all ERC-20 transfers into a single tx, preserving `msg.sender` |
| **Memo Contract** | `0x5294E9927c3306DcBaDb03fe70b92e01cCede505` | Stores payroll labels onchain alongside each payment batch |
| **USDC** | `0x3600000000000000000000000000000000000000` | Circle USD stablecoin (Arc native precompile) |
| **EURC** | `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a` | Circle EUR stablecoin on Arc |

### Why Multicall3From?

Standard `Multicall3` changes `msg.sender` to the contract itself, breaking ERC-20 `transferFrom` flows. Arc's `Multicall3From` is a custom extension that **preserves the original caller as `msg.sender`**, enabling a zero-approval, single-popup experience: the user signs once and all transfers execute atomically.

---

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                        VibeFlow                             │
│                                                             │
│  1. Operator connects MetaMask → Arc detected               │
│                                                             │
│  2. Selects token: USDC or EURC                             │
│                                                             │
│  3. Enters recipients:                                      │
│     a. Manual: paste address + amount per row               │
│     b. AI Agent: type "pay Alice $50, Bob $100"             │
│        → Groq LLM parses → rows auto-populated              │
│     c. CSV upload for large payroll runs                    │
│                                                             │
│  4. (Optional) adds Payroll Label                           │
│                                                             │
│  5. Signs once → Multicall3From executes all transfers       │
│     atomically → Memo contract stores the payroll label     │
│                                                             │
│  6. Sub-second finality → explorer confirmation             │
└─────────────────────────────────────────────────────────────┘
```

---

## Getting Started

```bash
pnpm install
pnpm dev          # app at http://localhost:3000
```

Contracts:

```bash
cd contracts
pnpm install
pnpm deploy:mainnet          # VibeToken → Arc Mainnet
pnpm deploy:disperse:mainnet # Disperse  → Arc Mainnet
```

Set `PRIVATE_KEY` in `contracts/.env` (never committed). The deployer needs a small amount of mainnet USDC for gas.

---

## Repository

- `src/app` — pages (landing, dashboard, bulk pay, roadmap, architecture, admin)
- `src/components` — bulk-pay flow, wallet, architecture diagram
- `src/app/api/agent` — server-side Groq natural-language payment parsing
- `src/app/api/social` — VibeID handle resolution and X account linking
- `src/lib/db` — Drizzle schema (users, sessions, accounts, social identities)
- `contracts/` — Solidity sources, deploy scripts, Hardhat config

---

## License

MIT
