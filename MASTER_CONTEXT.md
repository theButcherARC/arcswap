# MASTER_CONTEXT — VibeFlow

> This file is the single source of truth for any AI or developer continuing this project.
> Update it whenever a significant decision is made, a contract is deployed, or an integration changes.

---

## Project Identity

- **Name**: VibeFlow
- **Network**: Arc Testnet
- **Purpose**: Programmable USDC batch payroll infrastructure. Send USDC/EURC to 100+ recipients in one transaction with AI-powered payment parsing.
- **Deployment target**: Vercel (Next.js 14 App Router, no custom server)

---

## Architecture Decisions

### Frontend
- **Next.js App Router** (not Pages Router). All routes live under `src/app/`.
- **No server components for wallet/web3 logic** — all wagmi hooks are client-side. Components that use hooks must be marked `'use client'`.
- **Providers tree** is assembled in `src/lib/providers.tsx` and injected in `src/app/layout.tsx`. This keeps layout.tsx clean.
- **Tailwind CSS** for all styling. No CSS Modules. No styled-components.
- **No Redux / Zustand** at this stage — wagmi's built-in state is sufficient for MVP.

### Wallet
- **Wagmi v2 + Viem** for all on-chain reads and writes.
- **MetaMask only** for MVP. The connector is configured in `src/lib/wagmi.ts`.
- **Chain enforcement** is handled by `NetworkGuard` component — it wraps pages that require Arc Testnet and redirects/warns if the user is on the wrong chain.

### Contracts
- **USDC** and **EURC** are Circle stablecoins pre-existing on Arc Testnet. Both have 6 decimals.
- **Multicall3From** (0x522fAf9A91c41c443c66765030741e4AaCe147D0) batches all ERC-20 transfers in a single transaction while preserving the original caller's `msg.sender`.
- **Memo Contract** (0x5294E9927c3306DcBaDb03fe70b92e01cCede505) stores onchain payroll labels and batch metadata.

### Services
- `bulkPayService.ts` — encodes ERC-20 transfers and builds Multicall3From call sequences. Supports 100+ recipients.
- `agentService.ts` — uses Groq AI (llama-3.3-70b-versatile) to parse natural language payment instructions into structured recipient lists.

---

## Chain Configuration

```
Chain Name:   Arc Testnet ✅
Chain ID:     5042002 ✅
RPC URL:      https://rpc.testnet.arc.network ✅
Block Explorer: https://explorer.testnet.arc.network ✅
Native Token: USDC (6 decimals) — Arc L1 native gas asset ✅
```

Update `src/constants/chains.ts` once confirmed.

---

## Stablecoin Registry

| Symbol | Address | Decimals | Source | Status |
|--------|---------|----------|--------|--------|
| USDC | `0x3600000000000000000000000000000000000000` | 6 | Circle (Arc native precompile, gas asset) | ✅ Live |
| EURC | `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a` | 6 | Circle (Arc Testnet) | ✅ Live |

---

## Key Contract Addresses

| Contract | Address | Purpose | Status |
|----------|---------|---------|--------|
| Multicall3From | `0x522fAf9A91c41c443c66765030741e4AaCe147D0` | Batch ERC-20 transfers, preserves msg.sender | ✅ Live |
| Memo Contract | `0x5294E9927c3306DcBaDb03fe70b92e01cCede505` | Stores onchain payroll labels and metadata | ✅ Live |

---

## Environment Variables

See `.env.example` for the full list and descriptions.
Critical variables: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`, all token addresses, RPC URL.

---

## Key File Map

| File | What it does |
|------|-------------|
| `src/lib/wagmi.ts` | Wagmi client config — chains, connectors, transports |
| `src/lib/providers.tsx` | Wraps app in WagmiProvider, QueryClientProvider |
| `src/constants/chains.ts` | Arc Testnet chain object for viem |
| `src/constants/tokens.ts` | Token list with addresses, decimals, logos |
| `src/contracts/config.ts` | Contract addresses keyed by chainId |
| `src/contracts/abis/erc20.abi.ts` | Minimal ERC20 ABI (approve, transfer, balanceOf, allowance) |
| `src/hooks/useArcNetwork.ts` | Checks current chain, exposes switch helper |
| `src/hooks/useTokenBalance.ts` | Reads ERC20 balance for connected account |
| `src/hooks/useTokenAllowance.ts` | Reads allowance and triggers approve |
| `src/hooks/useSwap.ts` | Swap execution — delegates to swapService |
| `src/hooks/useBulkPay.ts` | Bulk pay execution — delegates to bulkPayService |
| `src/services/swapService.ts` | Quote + calldata for DEX router |
| `src/services/bulkPayService.ts` | Builds transfer sequence for bulk pay |
| `src/components/wallet/ConnectButton.tsx` | MetaMask connect / address display |
| `src/components/wallet/NetworkGuard.tsx` | Gate for Arc Testnet enforcement |
| `src/components/swap/SwapForm.tsx` | Swap UI shell |
| `src/components/bulk-pay/BulkPayForm.tsx` | Bulk pay UI shell |

---

## Patterns to Follow

- All wagmi reads use `useReadContract`. All writes use `useWriteContract`.
- Use `viem`'s `parseUnits` / `formatUnits` for all token math. Never use raw `BigInt` arithmetic directly in components.
- Addresses are always typed as `Address` (viem) — never plain `string`.
- All user-facing errors should go through `src/utils/errors.ts`.
- Forms do NOT submit to a server. All actions are on-chain.

---

## Post-MVP Considerations (Phase 2+)

- CSV/spreadsheet import for recipient lists
- Recurring payment scheduling (cron-based orchestration)
- Multi-sig approval flow for large batches
- Webhook notifications on settlement
- Team workspaces with role-based access control
- Payroll history export (PDF, CSV) with compliance metadata
- Cross-chain support (Base Mainnet, Ethereum L1 via CCTP)
- @vibeflow/sdk npm package for programmatic batch payment access

