# VibeFlow

### Global Payroll Infrastructure on Arc

> Send thousands of USDC/EURC payments in a single transaction. Built for payroll, rewards, vendor payouts, and mass disbursements — powered by Arc's sub-second finality and Circle stablecoins.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-vibeflow.vercel.app-6d28d9?style=for-the-badge&logo=vercel)](https://vibeflow.vercel.app)
[![Built on Arc](https://img.shields.io/badge/Built%20on-Arc%20Testnet-0ea5e9?style=for-the-badge)](https://arc.network)
[![Powered by Circle](https://img.shields.io/badge/Powered%20by-Circle%20USDC-00ac6b?style=for-the-badge)](https://circle.com)
[![Hackathon](https://img.shields.io/badge/Hackathon-Stablecoins%20Commerce%20Stack-f59e0b?style=for-the-badge)](https://arc.network)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript)](https://typescriptlang.org)

---

## What is VibeFlow?

VibeFlow is programmable USDC batch payroll infrastructure on Arc Blockchain. Send USDC or EURC to 100+ recipients in one transaction with AI-powered payment parsing. Type "pay Alice $50, Bob $100" and watch it settle in under a second — with gas paid entirely in stablecoins.

---

## Features

| Feature | Description |
|---|---|
| **Bulk Pay** | Batch USDC/EURC transfers to 100+ recipients in a single transaction via Multicall3From |
| **AI Payment Agent** | Groq AI natural language parsing — type "pay 3 people $50 each" and it auto-fills recipient rows |
| **USDC + EURC Toggle** | Switch between Circle USD and EUR stablecoins before sending |
| **Onchain Memo Labels** | Attach payroll tags (e.g. "July Salary") stored permanently onchain via Memo contract |
| **Social Pay** | Pay by @handle instead of copying wallet addresses |
| **Sub-second Finality** | Arc blockchain settles in under 1 second — orders of magnitude faster than L1 or L2s |

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 14 |
| Language | TypeScript | 5 |
| Styling | Tailwind CSS | 3 |
| Wallet | Wagmi | v2 |
| Chain interaction | Viem | latest |
| AI parsing | Groq (`llama-3.3-70b-versatile`) | — |
| Database | Neon (PostgreSQL) | — |
| Auth | Better Auth | — |
| Deployment | Vercel | — |

---

## Circle / Arc Contracts Used

| Contract | Address | Purpose |
|---|---|---|
| **Multicall3From** | `0x522fAf9A91c41c443c66765030741e4AaCe147D0` | Batches all ERC-20 transfers into a single tx, preserving `msg.sender` |
| **Memo Contract** | `0x5294E9927c3306DcBaDb03fe70b92e01cCede505` | Stores payroll labels onchain alongside each payment batch |
| **USDC** | `0x3600000000000000000000000000000000000000` | Circle USD stablecoin (Arc native precompile) |
| **EURC** | `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a` | Circle EUR stablecoin on Arc Testnet |

### Why Multicall3From?

Standard `Multicall3` changes `msg.sender` to the contract itself, breaking ERC-20 `transferFrom` flows. Arc's `Multicall3From` is a custom extension that **preserves the original caller as `msg.sender`**, enabling a zero-approval, single-popup experience: the user signs once and all transfers execute atomically.

---

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                        VibeFlow                             │
│                                                             │
│  1. Operator connects MetaMask → Arc Testnet detected       │
│                                                             │
│  2. Selects token: USDC or EURC                             │
│                                                             │
│  3. Enters recipients:                                      │
│     a. Manual: paste address + amount per row               │
│     b. AI Agent: type "pay Alice $50, Bob $100"             │
│        → Groq LLM parses → rows auto-populated              │
│                                                             │
│  4. (Optional) adds Payroll Label                           │
│     → encoded as sendMemo() call prepended to batch         │
│                                                             │
│  5. Gas estimate fetched live from Arc RPC                  │
│     → displayed as "~$0.0006 USDC" before submit            │
│                                                             │
│  6. Click "Send Payments" → one MetaMask popup              │
│     → Multicall3From executes all transfers atomically      │
│     → Memo stored onchain (if provided)                     │
│                                                             │
│  7. Success screen: "Settled in <1s"                        │
│     → ArcScan tx link                                       │
│     → Compare: ETH L1 ~13 min | L2s up to 7 days           │
└─────────────────────────────────────────────────────────────┘
```

---

## Local Setup

### Prerequisites

- Node.js >= 20
- pnpm >= 9
- MetaMask browser extension
- Arc Testnet configured in MetaMask (Chain ID: `5042002`, RPC: `https://rpc.testnet.arc.network`)

### 1. Clone and install

```bash
git clone https://github.com/theButcherARC/VibeFlow.git
cd VibeFlow
pnpm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|---|---|---|
| `GROQ_API_KEY` | Yes | Groq API key for AI payment parsing — free at [console.groq.com](https://console.groq.com) |
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | Yes | Random 32-byte secret (`openssl rand -base64 32`) |
| `BETTER_AUTH_URL` | Yes | App base URL (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_APP_URL` | Yes | Same as above, exposed to client |

### 3. Run the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Architecture Overview

```
src/
├── app/                        # Next.js App Router pages
│   ├── page.tsx                # Landing page
│   ├── bulk-pay/               # Core payment flow
│   ├── dashboard/              # Transaction history
│   ├── social-profile/         # Username → address registry
│   ├── roadmap/                # Public protocol roadmap
│   └── api/
│       ├── agent/route.ts      # Groq AI parsing endpoint
│       └── social/             # Social registry API
│
├── components/
│   ├── bulk-pay/
│   │   ├── BulkPayForm.tsx     # Main form: token select, recipients, memo, gas bar
│   │   ├── BulkPaySuccess.tsx  # Success screen with settlement badge
│   │   ├── AgentInput.tsx      # AI natural language input
│   │   └── RecipientRow.tsx    # Individual recipient row component
│   └── wallet/
│       ├── ConnectButton.tsx   # MetaMask connect / network switch
│       └── NetworkGuard.tsx    # Arc Testnet enforcement guard
│
├── hooks/
│   ├── useBulkPay.ts           # Core tx builder: simulate → Multicall3From → memo
│   ├── useArcNetwork.ts        # Chain detection and switch helper
│   ├���─ useTokenBalance.ts      # ERC-20 balance fetching
│   └── useTokenAllowance.ts    # ERC-20 allowance checking
│
├── services/
│   ├── bulkPayService.ts       # buildTransfers(), buildMulticallCalls()
│   └── agentService.ts         # Groq API call + response parser
│
└── constants/
    ├── chains.ts               # Arc Testnet chain definition (viem)
    └── tokens.ts               # USDC, EURC token metadata + addresses
```

### Transaction Flow (`useBulkPay.ts`)

```
handleSend()
  └─ buildTransfers(params)              // validate + parse recipient list
  └─ buildMulticallCalls(transfers)      // encode ERC-20 transferFrom per recipient
  └─ encodeFunctionData(sendMemo)        // encode memo call (if provided)
  └─ calls = [memoCall, ...transfers]    // prepend memo to batch
  └─ simulateContract(Multicall3From)    // dry-run to catch failures early
  └─ writeContractAsync(Multicall3From)  // one MetaMask popup, atomic execution
  └─ waitForTransactionReceipt()         // confirmed <1s on Arc
```

---

## Circle Product Feedback

> This section reflects genuine developer experience building on Arc and Circle stablecoins during the hackathon.

### Why We Chose USDC + Arc

Arc's decision to use USDC as the native gas asset is a breakthrough for payroll use cases. In traditional crypto payroll, operators must hold ETH (or the native gas token) separately, convert fiat to ETH just to pay fees, and explain to finance teams why "gas" is a separate line item.

On Arc, **gas is paid in USDC**. This collapses the operational complexity to zero. A payroll operator holds one asset, pays in that asset, and the transaction fee is a predictable fraction of a cent. This is the first time crypto payroll has felt as simple as a bank transfer.

### What Worked Well

- **Multicall3From preserves `msg.sender`** — this is the killer feature. Standard Multicall3 breaks ERC-20 flows because the multicall contract becomes the sender. Multicall3From solves this cleanly, enabling the zero-approval UX where the user signs once and 100 transfers execute atomically.

- **Sub-second finality** — `waitForTransactionReceipt` returns in under 1 second consistently. Operators know money has arrived before they close the browser tab — a genuine differentiator for payroll.

- **USDC as native gas** — no ETH mental model, no separate wallet funding, no faucet for a different token. USDC in = USDC used for gas and payments.

- **Arc Testnet RPC reliability** — `https://rpc.testnet.arc.network` was stable and rate-limit-free throughout development.

### What Could Improve

- **Testnet faucet limits** — daily limits slow down development when testing with many recipient addresses. A higher-limit faucet for verified hackathon participants would significantly improve DX.

- **Multicall3From documentation** — this contract is the most important primitive we used, but documentation is sparse. A dedicated page with the ABI, addresses per environment, and a viem TypeScript example would save future builders significant time.

- **EURC testnet liquidity** — EURC on Arc Testnet has limited faucet availability compared to USDC. For apps supporting both stablecoins, parity in testnet funding would help.

- **ArcScan API** — a programmatic API would allow showing transaction details (recipient count, amounts transferred) directly in the app success screen without scraping the explorer UI.

---

## Hackathon Submission

**Challenge: Stablecoins Commerce Stack**

| Track | Description | VibeFlow Implementation |
|---|---|---|
| **Track 1** — Payments Infrastructure | Build tools that make USDC payments programmable | Multicall3From batch engine, AI parser, onchain memo labels |
| **Track 4** — Developer Tooling | Build developer-facing primitives | Gas estimator hook, `useBulkPay` with memo offset handling, reusable payroll components |

**Submitted by:** theButcherARC  
**Live URL:** [https://vibeflow.vercel.app](https://vibeflow.vercel.app)  
**Repository:** [https://github.com/theButcherARC/VibeFlow](https://github.com/theButcherARC/VibeFlow)

---

## Roadmap

### Phase 1 — Foundation ✓ Complete
- [x] Bulk Pay with Multicall3From (USDC + EURC)
- [x] AI natural language agent (Groq llama-3.3-70b)
- [x] Onchain memo / payroll labels
- [x] Live gas estimator (real-time Arc RPC)
- [x] Social username registry
- [x] Sub-second settlement UX with ArcScan link

### Phase 2 — Payroll Engine
- [ ] CSV / spreadsheet import for recipient lists
- [ ] Recurring payment scheduling (cron-based)
- [ ] Multi-sig approval flow for large batches
- [ ] Webhook notifications on settlement

### Phase 3 — Enterprise Features
- [ ] Team workspaces with role-based access
- [ ] Payroll history export (CSV, PDF)
- [ ] Compliance metadata fields (employee ID, department, cost center)
- [ ] Circle Compliance API integration for KYC-gated payouts

### Phase 4 — Cross-chain
- [ ] Base Mainnet support (USDC via CCTP)
- [ ] Ethereum Mainnet bridge for large treasury movements
- [ ] Cross-chain recipient resolution (pay an Arc address from Base)

### Phase 5 — Protocol
- [ ] `@vibeflow/sdk` npm package for batch payments
- [ ] Webhooks API for payment event subscriptions
- [ ] White-label UI for payroll platforms

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

```bash
pnpm type-check   # run TypeScript checks
pnpm lint         # run ESLint
pnpm build        # production build
```

---

## License

MIT

---

<div align="center">

Built at the Circle Stablecoins Hackathon &nbsp;·&nbsp; Arc Testnet &nbsp;·&nbsp; Circle USDC &nbsp;·&nbsp; Circle EURC

</div>
