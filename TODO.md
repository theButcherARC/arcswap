# TODO — VibeFlow

Tasks are ordered by dependency. Complete them top-to-bottom for the smoothest build.

---

## Phase 0 — Environment Setup ✅ (Complete)

- [x] Project structure created
- [x] Config files generated
- [x] Types defined
- [x] Constants defined (USDC + EURC)
- [x] Hooks implemented
- [x] Services implemented
- [x] Components built

---

## Phase 1 — Chain + Wallet Foundation ✅ (Complete)

- [x] Arc Testnet chain ID (5042002) and RPC URL configured in `src/constants/chains.ts`
- [x] Token contract addresses in `.env.local` (USDC + EURC)
- [x] MetaMask connector configured in `src/lib/wagmi.ts`
- [x] `ConnectButton` functional
- [x] `NetworkGuard` enforces Arc Testnet
- [x] `useTokenBalance` returns correct USDC/EURC balance

---

## Phase 2 — Bulk Pay Engine ✅ (Complete)

- [x] `bulkPayService.ts` builds Multicall3From transfer sequences
- [x] `useBulkPay.ts` handles simulate → submit → confirm flow
- [x] `BulkPayForm.tsx` UI with recipient rows
- [x] `RecipientRow.tsx` address + amount input
- [x] Max 100 recipients enforced
- [x] Address validation on input
- [x] Real-time gas estimation
- [x] Transaction status feedback

---

## Phase 3 — AI Payment Agent ✅ (Complete)

- [x] Groq API integration for natural language parsing
- [x] `agentService.ts` LLM parsing → recipient list conversion
- [x] `AgentInput.tsx` natural language input box
- [x] Auto-populate recipient rows from AI output
- [x] Fallback to manual input if parsing fails
- [x] Character limits and input validation

---

## Phase 4 — Stablecoin Support ✅ (Complete)

- [x] USDC toggle (USD stablecoin, native gas asset)
- [x] EURC toggle (EUR stablecoin)
- [x] Token selector pills with visual indicators
- [x] Gas estimation in selected token
- [x] UI reflects selected token symbol throughout

---

## Phase 5 — Advanced Features ✅ (Complete)

- [x] Onchain memo labels via Memo contract
- [x] Social Pay (pay by @handle)
- [x] Payroll label storage onchain
- [x] Live settlement badge (sub-second finality display)
- [x] ArcScan transaction linking

---

## Phase 6 — Polish + Deployment ✅ (Complete)

- [x] Micro-interactions (slide-in rows, button pulses, value flashes)
- [x] Animated AI card with flowing gradient border
- [x] Loading states and error messages
- [x] Responsive layout (mobile to desktop)
- [x] Environment variables configured in Vercel
- [x] Production build + deployment to Vercel
- [x] Smoke testing on live URL

---

## Backlog (Future Phases)

- [ ] CSV/spreadsheet import for recipient lists
- [ ] Recurring payment scheduling
- [ ] Multi-sig approval for large batches
- [ ] Webhook notifications on settlement
- [ ] Team workspaces with role-based access
- [ ] Payroll history export (PDF/CSV)
- [ ] Base Mainnet support via CCTP
- [ ] @vibeflow/sdk npm package for programmatic access
