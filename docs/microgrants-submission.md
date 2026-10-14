# Arc Microgrants — Submission Package

Everything needed to submit VibeFlow to the Arc Microgrants program (and reuse for the Circle Developer Grant later).

## 1. Short description (form field, ~2 sentences)

VibeFlow is agentic payroll infrastructure on Arc: describe a payment run in natural language ("pay Alice $50, Bob $100") and an AI agent parses it, resolves recipients by wallet or social handle, and settles the entire batch in a single on-chain transaction — with gas paid in USDC and sub-second finality.

## 2. What it uses Arc for

- **Native USDC as gas and settlement** — the entire payment flow runs on Circle stablecoins; operators never touch a volatile gas token.
- **Multicall3From** — a custom batch contract deployed on Arc that preserves `msg.sender`, enabling zero-approval, single-signature bulk transfers to 100+ recipients.
- **Sub-second finality** — payroll batches confirm in under a second, making the UX feel like a web2 payroll tool.
- **On-chain memos** — payroll labels ("July Salary") are stored permanently on Arc via the Memo contract.
- **Arc explorer API** — the dashboard reads transaction history and balances directly from the chain's explorer.

## 3. Links

- Live app: https://vibeflow.vercel.app
- Repo: https://github.com/theButcherARC/arcswap
- Builder profile: (add your GitHub / X / Farcaster link)
- Payout wallet: (add the wallet address that can receive USDC on Arc)

## 4. Demo video script (2 minutes, screen recording)

| Time | Shot | Narration |
|---|---|---|
| 0:00–0:15 | Landing page | "This is VibeFlow — agentic payroll on Arc. Instead of forms, you just say who to pay." |
| 0:15–0:45 | Bulk Pay page, type "pay Alice $50, Bob $100, Carol $75" | "The AI agent parses natural language and fills every recipient row automatically — amounts, addresses, everything." |
| 0:45–1:10 | Show social-handle resolution + CSV upload | "Recipients can be wallet addresses or social handles via VibeID. For large runs, upload a CSV." |
| 1:10–1:35 | Add payroll label "October Salary", sign once | "One signature. Arc's Multicall3From executes every transfer atomically — no token approvals, no per-recipient transactions." |
| 1:35–2:00 | Explorer confirmation + dashboard | "Sub-second finality, gas paid in USDC, and the payroll label lives on-chain forever. That's payroll infrastructure built for the stablecoin era." |

Record with OBS (free) or Loom at 1080p. Do one real take end-to-end before the final recording.

## 5. Differentiators (use in any written pitch)

1. **Agentic interface, not a dapp form** — natural language is the primary input; the AI agent is a stated priority vertical for Arc/Circle grants.
2. **Identity layer** — pay @handles via VibeID + X linking; no other visible Arc payroll project does this.
3. **On-chain payroll memos** — permanent, queryable payment labels; useful for accounting and compliance.
4. **Zero-approval UX** — Multicall3From means one signature for the entire batch.

## 6. Brief compliance map (from the official Arc Microgrants page)

| Brief requirement | Status |
|---|---|
| Live deployment on Arc mainnet, openable link | App is live on Vercel; mainnet contract deploy pending (below) |
| Public repo | https://github.com/theButcherARC/arcswap |
| Short description + what it uses Arc for | Sections 1–2 above, ready to paste |
| Public builder profile (GitHub / X / Farcaster) | Pending — add link in section 3 |
| Wallet that can receive USDC on Arc | Pending — add address in section 3 |
| Not testnet-only | App code defaults to Arc Mainnet (chain 5042); contracts must be deployed to match |
| One submission per project | Submit once, after the pending items are done |

Note from the brief: "Program dates and microgrant counts may be adjusted" and "If your project is further along than this program is built for, submit anyway and we will point you toward the right one." The stated Oct 14 deadline has passed, but the brief itself invites out-of-window submissions — worth submitting once mainnet-ready, and asking the Arc team about the next batch.

## 7. Status checklist

- [x] Live deployment on Vercel
- [x] Public GitHub repo
- [x] Uses Arc core (native USDC, Multicall3From, sub-second finality)
- [x] App code switched to Arc Mainnet (chain 5042)
- [ ] Deploy Disperse + VibeToken to mainnet (`pnpm deploy:mainnet` in `/contracts`) — needs funded wallet
- [ ] Set `NEXT_PUBLIC_DISPERSE_ADDRESS` / `NEXT_PUBLIC_VIBE_TOKEN_ADDRESS` in Vercel after deploy
- [ ] One real mainnet bulk-pay transaction + explorer link
- [ ] Demo video recorded
- [ ] Builder profile + payout wallet added above
