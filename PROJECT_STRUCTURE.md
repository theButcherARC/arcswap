# ArcSwap — Project Structure

```
arcswap/
├── contracts/                          # Solidity smart contracts (Hardhat)
│   ├── src/
│   │   └── VibeToken.sol               # Custom ERC20 token
│   ├── test/
│   │   └── VibeToken.test.ts
│   ├── scripts/
│   │   └── deploy.ts
│   ├── hardhat.config.ts
│   └── package.json
│
├── src/
│   ├── app/                            # Next.js App Router
│   │   ├── layout.tsx                  # Root layout (providers, fonts)
│   │   ├── page.tsx                    # Landing / redirect
│   │   ├── globals.css
│   │   ├── swap/
│   │   │   └── page.tsx               # Token Swap page
│   │   ├── bulk-pay/
│   │   │   └── page.tsx               # Bulk Pay page
│   │   └── api/
│   │       └── health/
│   │           └── route.ts            # Health check endpoint
│   │
│   ├── components/
│   │   ├── ui/                         # Primitive / design-system components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── Spinner.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── PageWrapper.tsx
│   │   ├── wallet/
│   │   │   ├── ConnectButton.tsx       # MetaMask connect / account display
│   │   │   └── NetworkGuard.tsx        # Redirect if wrong chain
│   │   ├── swap/
│   │   │   ├── SwapForm.tsx            # Token swap UI shell
│   │   │   └── TokenSelector.tsx       # Dropdown: USDC / EURC / VIBE
│   │   └── bulk-pay/
│   │       ├── BulkPayForm.tsx         # Bulk pay UI shell
│   │       └── RecipientRow.tsx        # Single recipient input row
│   │
│   ├── hooks/
│   │   ├── useArcNetwork.ts            # Chain check + switch helper
│   │   ├── useTokenBalance.ts          # Read ERC20 balance for connected wallet
│   │   ├── useTokenAllowance.ts        # Read + approve ERC20 allowance
│   │   ├── useSwap.ts                  # Swap execution hook (stub)
│   │   └── useBulkPay.ts              # Bulk pay execution hook (stub)
│   │
│   ├── services/
│   │   ├── swapService.ts              # Swap route / quote logic (stub)
│   │   └── bulkPayService.ts           # Bulk transfer encoding (stub)
│   │
│   ├── contracts/
│   │   ├── abis/
│   │   │   ├── erc20.abi.ts            # Minimal ERC20 ABI
│   │   │   └── vibeToken.abi.ts        # VIBE token ABI (extends ERC20)
│   │   └── config.ts                   # Contract addresses per chain
│   │
│   ├── lib/
│   │   ├── wagmi.ts                    # Wagmi + viem config
│   │   └── providers.tsx              # React context providers tree
│   │
│   ├── constants/
│   │   ├── chains.ts                   # Arc Testnet chain definition
│   │   ├── tokens.ts                   # Token registry (USDC, EURC, VIBE)
│   │   └── routes.ts                   # App route constants
│   │
│   ├── types/
│   │   ├── token.ts                    # Token, TokenAmount types
│   │   ├── swap.ts                     # SwapQuote, SwapParams types
│   │   └── bulkPay.ts                 # Recipient, BulkPayParams types
│   │
│   └── utils/
│       ├── format.ts                   # Token amount formatting helpers
│       ├── address.ts                  # Address validation / truncation
│       └── errors.ts                   # Typed error handling utilities
│
├── public/
│   └── favicon.ico
│
├── .env.example
├── .env.local                          # gitignored
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── README.md
├── MASTER_CONTEXT.md
└── TODO.md
```
