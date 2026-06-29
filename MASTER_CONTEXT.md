# MASTER_CONTEXT — ArcSwap

> This file is the single source of truth for any AI or developer continuing this project.
> Update it whenever a significant decision is made, a contract is deployed, or an integration changes.

---

## Project Identity

- **Name**: ArcSwap
- **Network**: Arc Testnet
- **Purpose**: DEX interface — swap tokens and bulk-pay up to 10 recipients
- **Deployment target**: Vercel (Next.js App Router, no custom server)

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
- **VIBE token** is a standard OpenZeppelin ERC20 deployed by this project.
- **USDC and EURC** are pre-existing on Arc Testnet. Addresses go in `.env.local` and `src/contracts/config.ts`.
- **No custom AMM** — swap routing uses existing Uniswap-compatible infrastructure on Arc Testnet or Centra liquidity. The `swapService.ts` is the integration point.
- **Bulk Pay** sends individual ERC20 transfers in sequence (MVP). A multicall contract upgrade is a post-MVP consideration.

### Services
- `swapService.ts` — responsible for quote fetching and building swap calldata. Wraps whatever DEX router is available on Arc Testnet.
- `bulkPayService.ts` — encodes and sequences up to 10 ERC20 `transfer` calls.

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

## Token Registry

| Symbol | Address | Decimals | Source |
|--------|---------|----------|--------|
| USDC | `0x3600000000000000000000000000000000000000` | 6 | Arc native precompile (hardcoded) ✅ |
| EURC | `NEXT_PUBLIC_EURC_ADDRESS` | 6 | Arc Testnet existing |
| VIBE | `NEXT_PUBLIC_VIBE_TOKEN_ADDRESS` | 18 | Deployed by this project |

---

## Contract Deployments

| Contract | Address | Deployer | Tx Hash | Notes |
|----------|---------|----------|---------|-------|
| VibeToken | TBD | TBD | TBD | Deploy with `pnpm deploy:testnet` in /contracts |

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

## Post-MVP Considerations (do not implement now)

- WalletConnect v2 for mobile wallets
- Multicall contract for atomic bulk pay
- Swap routing aggregator (1inch style)
- Slippage tolerance UI
- Transaction history via indexer
- Permit2 for gasless approvals
## Token Registry

| Symbol | Address | Decimals | Source |
|--------|---------|----------|--------|
| USDC | `0x3600000000000000000000000000000000000000` | 6 | Arc native precompile (hardcoded) ✅ |
| EURC | `0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a` | 6 | Arc Testnet existing (hardcoded) ✅ |
| cirBTC | `0xf0C4a4CE82A5746AbAAd9425360Ab04fbBA432BF` | 8 | Arc Testnet existing (hardcoded) ✅ — confirm decimals |
| VIBE | `NEXT_PUBLIC_VIBE_TOKEN_ADDRESS` | 18 | Deployed by this project |

---