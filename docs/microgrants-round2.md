# Arc Microgrants Round 2: Built with Arc Studio - VibeFlow Submission Copy

Paste-ready text for the DoraHacks Round 2 build page. Placeholders in [BRACKETS] get filled the day Haroon runs the real mainnet batch and records the video. Every other claim below is verified against the production code.

## Short description (form field)

VibeFlow is bulk payment infrastructure on Arc, built with Arc Studio. Describe a payment run in plain words, or type it in, or upload a CSV: VibeFlow pays up to 100 people USDC or EURC in one transaction, with one wallet signature and zero token approvals. Batches are simulated before signing, reviewed line by line, labelled onchain, and can be scheduled for later.

## The problem

Paying a team in crypto still means one transaction per person, one token approval per wallet, and a spreadsheet nobody trusts. For DAOs, hackathon teams, and remote companies paying in stablecoins, a 20-person payroll run is 20 chances to paste a wrong address, and no clean record afterwards of who was paid what, or why.

## What VibeFlow does

- Bulk payments: up to 100 recipients per batch, USDC or EURC, settled in one transaction on Arc mainnet.
- AI payment agent: type "pay Alice 500, Bob 300" and the form fills itself. Manual entry and CSV upload are there when you want them.
- Review step: before the wallet opens, you see every recipient, the total, and the 0.2% fee. Rows that would fail are named, not silently dropped. The batch is simulated onchain first; if one payment would fail, nothing is sent.
- Scheduled payments: save a batch with a date, review and sign when it is due. Non-custodial, so nothing moves until you sign.
- VibeID: pay people by @handle or VibeID instead of a raw address.
- Onchain memo labels: every batch can carry a label like "October Salary", stored on Arc permanently.
- Dashboard: balances, recent batches, and 7-day volume, read from the chain.

## How it works

1. Add recipients (AI prompt, manual rows, or CSV).
2. Review the batch: full list, total, fee.
3. Sign once. A Multicall3From contract executes every transfer atomically and preserves the sender, so no ERC20 approval step exists anywhere in the flow.

## Why it has to be Arc

- USDC is native: gas is paid in USDC, so a payroll operator never holds a volatile gas token.
- Sub-second finality: a 100-person batch confirms faster than a card payment, which makes the review-then-sign UX feel instant.
- Cheap execution: a full batch costs cents, not dollars, so small recurring payrolls stay viable.
- Circle stablecoins end to end: USDC and EURC are both first-class in the app.

## Built with Arc Studio

For this round we also built a new contract with Arc Studio itself: VibeIDRegistry, the onchain identity registry for the VibeFlow hub (it maps a unique VibeID handle to a wallet address). Arc Studio wrote the contract, ran two security reviews with zero findings, a Slither scan with zero findings, and a Forge test suite that passes 62 of 62 tests. Studio project: https://studio.arc.io/app/10877ef3-5217-451b-b888-ffc21a5846e8 ; deployed on Arc Testnet at 0x6ac5cb9a51e2d994ef564b7033525d75bbc1b488. PRESENTATION POINT: say this out loud in the demo, we had a contract built through Arc Studio for this submission, it is not a claim, the project link and the test results are the proof.

VibeFlow was built with Arc Studio and is iterated in public inside Arc House, where the builder is a Tier 1 Architect. The current feature set is literally shaped by that community: Arc House members asked how failed payments are handled (shipped: simulation, named failures, all-or-nothing batches), asked for a review before signing (shipped), said onboarding confused non-technical users (shipped: plain-language steps and hints), and asked for scheduled payments (shipped). Round 1 feedback became Round 2 product.

## Proven on mainnet

- Batch contract (Multicall3From) on Arc mainnet, chain 5042: 0x522fAf9A91c41c443c66765030741e4AaCe147D0
  https://explorer.arc.io/address/0x522fAf9A91c41c443c66765030741e4AaCe147D0
- Memo contract on Arc mainnet: 0x5294E9927c3306DcBaDb03fe70b92e01cCede505
  https://explorer.arc.io/address/0x5294E9927c3306DcBaDb03fe70b92e01cCede505
- First public payroll batch: [BATCH: amount, recipient count, date]
  [BATCH_TX_URL]
- Demo video: [VIDEO_URL]

## What is new since Round 1

Review step before signing, clearer onboarding for non-technical users, scheduled payments, a full minimal redesign of the app (focused single-column payment flow, sidebar app shell with every feature in its own section), all driven by Round 1 and Arc House feedback.

## What is next

Fiat on-ramp for payroll funding, recurring scheduled batches that prepare themselves for one-tap signing, and team roles for multi-person finance teams.

## Links

- Live app: https://arcswap-lac.vercel.app
- Repo: https://github.com/theButcherARC/arcswap
- Builder: https://x.com/The_last_dip

## Demo video shot list (about 2 minutes, screen recording)

| Time | Shot | Say |
|---|---|---|
| 0:00-0:20 | Bulk Pay page | "This is VibeFlow, bulk USDC payments on Arc, built with Arc Studio." |
| 0:20-0:45 | AI prompt: pay three people | "I describe the payroll in plain words. The agent fills the form." |
| 0:45-1:10 | Review step | "Before signing, I review every recipient, the total and the fee. The batch is simulated first, so a failing payment stops everything and names the address." |
| 1:10-1:30 | Sign, then explorer page for the real batch | "One signature. Settled on Arc mainnet in under a second. Here is the real transaction." |
| 1:30-1:50 | Scheduled payments + dashboard | "Batches can be scheduled for payday, and everything is tracked on the dashboard." |
| 1:50-2:00 | VibeID | "And you can pay people by handle, not just addresses." |
| 2:00-2:15 | Arc Studio project page, Contracts panel open | "For this round we built a new contract with Arc Studio itself: VibeIDRegistry, our onchain identity registry. Studio wrote it, reviewed it, and its tests pass 62 out of 62. The project link is in this submission." |

## Submission checklist

- [ ] Haroon registered for Round 2 on DoraHacks
- [ ] Real mainnet batch done, tx hash pasted above
- [ ] Demo video recorded and linked above
- [ ] Live app field set to https://arcswap-lac.vercel.app (NOT the old v0 link)
- [ ] Every claim in this copy re-checked against the live app on submission day
