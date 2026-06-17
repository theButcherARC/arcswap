# TODO — ArcSwap

Tasks are ordered by dependency. Complete them top-to-bottom for the smoothest build.

---

## Phase 0 — Environment Setup ✅ (Scaffold Complete)

- [x] Project structure created
- [x] Config files generated
- [x] Types defined
- [x] Constants stubbed
- [x] Hooks stubbed
- [x] Services stubbed
- [x] Components stubbed

---

## Phase 1 — Chain + Wallet Foundation

- [ ] Confirm Arc Testnet chain ID and RPC URL → fill in `src/constants/chains.ts`
- [ ] Fill all token contract addresses in `.env.local`
- [ ] Fill `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` (get from cloud.walletconnect.com)
- [ ] Test MetaMask connect / disconnect via `ConnectButton`
- [ ] Test `NetworkGuard` — verify it shows warning on wrong chain
- [ ] Test `useTokenBalance` returns correct USDC balance

---

## Phase 2 — VIBE Token

- [ ] Confirm OpenZeppelin version in `contracts/package.json`
- [ ] Review `VibeToken.sol` — adjust initial supply if needed
- [ ] Run `pnpm test` in `/contracts`
- [ ] Deploy to Arc Testnet: `pnpm deploy:testnet`
- [ ] Record deployed address in `MASTER_CONTEXT.md` contract table
- [ ] Set `NEXT_PUBLIC_VIBE_TOKEN_ADDRESS` in `.env.local`
- [ ] Verify token appears correctly in `useTokenBalance`

---

## Phase 3 — Token Swap

- [ ] Identify the Uniswap-compatible router address on Arc Testnet
- [ ] Add router address + ABI to `src/contracts/`
- [ ] Implement `swapService.ts` — quote fetching from router
- [ ] Implement `useSwap.ts` — approve + swap call sequence
- [ ] Wire `SwapForm.tsx` to `useSwap` hook
- [ ] Add `TokenSelector` — confirm token list renders correctly
- [ ] Handle slippage with a hardcoded default (0.5%) for MVP
- [ ] Test swap USDC → EURC
- [ ] Test swap USDC → VIBE
- [ ] Add transaction status feedback (pending / success / failed)

---

## Phase 4 — Bulk Pay

- [ ] Implement `bulkPayService.ts` — build transfer sequence
- [ ] Implement `useBulkPay.ts` — sequence approval + transfers
- [ ] Wire `BulkPayForm.tsx` to `useBulkPay` hook
- [ ] Implement `RecipientRow` — address input + amount + token selector
- [ ] Enforce max 10 recipients in form state
- [ ] Validate all recipient addresses before submission
- [ ] Show per-transfer status during execution
- [ ] Test bulk pay with 2, 5, and 10 recipients

---

## Phase 5 — Polish + Deployment

- [ ] Add loading states to all async actions
- [ ] Add error messages for all known failure modes (wrong chain, insufficient balance, rejected tx)
- [ ] Responsive layout — test on 375px mobile
- [ ] Set `NEXT_PUBLIC_APP_URL` to Vercel preview URL
- [ ] Configure environment variables in Vercel dashboard
- [ ] Run `pnpm build` locally — fix any type errors
- [ ] Deploy to Vercel — confirm preview link works
- [ ] Smoke test all three features on deployed URL

---

## Backlog (Post-MVP)

- [ ] WalletConnect v2 support
- [ ] Multicall contract for atomic bulk pay
- [ ] Transaction history page
- [ ] Permit2 gasless approvals
- [ ] Swap routing aggregation
- [ ] Token price display (USD equivalent)
