# ArcSwap

A decentralized exchange interface built on the Arc Testnet. ArcSwap provides token swapping and bulk payment functionality using existing Arc Testnet liquidity infrastructure.

## Features

- **MetaMask Wallet Connect** — connect and disconnect with one click
- **Token Swap** — swap between USDC, EURC, and VIBE using Arc Testnet liquidity
- **Bulk Pay** — send tokens to up to 10 recipients in a single flow

## Supported Tokens

| Token | Type | Notes |
|-------|------|-------|
| USDC | ERC20 | Existing Arc Testnet deployment |
| EURC | ERC20 | Existing Arc Testnet deployment |
| VIBE | ERC20 | Custom token, deployed by this project |

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Wallet**: Wagmi + Viem + MetaMask
- **Contracts**: Solidity via Hardhat
- **Deployment**: Vercel

---

## Prerequisites

- Node.js >= 20
- pnpm >= 9
- MetaMask browser extension
- Arc Testnet added to MetaMask (see chain config in `src/constants/chains.ts`)

---

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in all required values. See `.env.example` for descriptions.

### 3. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Contract Development

```bash
cd contracts
pnpm install
pnpm compile
pnpm test
pnpm deploy:testnet
```

After deploying, update `NEXT_PUBLIC_VIBE_TOKEN_ADDRESS` in `.env.local`.

---

## Project Structure

See `PROJECT_STRUCTURE.md` for a full annotated tree.

## Architecture Notes

See `MASTER_CONTEXT.md` for design decisions, contract addresses, and context needed to continue development.

---

## Deployment (Vercel)

1. Connect your GitHub repo to Vercel.
2. Add all `NEXT_PUBLIC_*` environment variables in the Vercel dashboard.
3. Set framework preset to **Next.js**.
4. Deploy.

> Note: `PRIVATE_KEY` and any server-side secrets must be added as Vercel Environment Variables and must **not** have the `NEXT_PUBLIC_` prefix.
