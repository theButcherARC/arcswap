# VibeFlow — Project Structure

```
vibeflow/
├── contracts/                          # (Deprecated) Solidity contracts directory
│   └── [legacy files from scaffolding]
│
├── src/
│   ├── app/                            # Next.js 14 App Router
│   │   ├── layout.tsx                  # Root layout (providers, fonts, metadata)
│   │   ├── page.tsx                    # Landing page + features overview
│   │   ├── globals.css                 # Global styles + animations
│   │   ├── bulk-pay/
│   │   │   └── page.tsx               # Core bulk payment interface
│   │   ├── dashboard/
│   │   │   └── page.tsx               # Transaction history
│   │   ├── social-profile/
│   │   │   └── page.tsx               # Username → address registry
│   │   ├── roadmap/
│   │   │   └── page.tsx               # Public development roadmap
│   │   ├── architecture/
│   │   │   └── page.tsx               # Technical architecture diagram
│   │   └── api/
│   │       ├── agent/
│   │       │   └── route.ts            # Groq AI payment parsing endpoint
│   │       └── social/
│   │           └── route.ts            # Username resolution API
│   │
│   ├── components/
│   │   ├── landing/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── FeaturesGrid.tsx
│   │   │   ├── StatsBar.tsx
│   │   │   ├── PoweredBySection.tsx    # Tech stack marquee with pill badges
│   │   │   └── CTABanner.tsx
│   │   ├── wallet/
│   │   │   ├── ConnectButton.tsx       # MetaMask connect / account display
│   │   │   └── NetworkGuard.tsx        # Arc Testnet enforcement
│   │   ├── architecture/
│   │   │   └── ArchitectureDiagram.tsx # 5-layer diagram with animated arrows
│   │   └── bulk-pay/
│   │       ├── BulkPayForm.tsx         # Main form: token selector, recipients, memo, gas bar
│   │       ├── AgentInput.tsx          # Natural language input for AI parsing
│   │       ├── RecipientRow.tsx        # Address + amount input with slide-in animation
│   │       └── BulkPaySuccess.tsx      # Success screen with settlement badge
│   │
│   ├── hooks/
│   │   ├── useArcNetwork.ts            # Chain detection + network switch helper
│   │   ├── useTokenBalance.ts          # ERC20 balance fetcher for USDC/EURC
│   │   ├── useBulkPay.ts               # Bulk pay execution: simulate → Multicall3From → memo
│   │   └── useGasEstimate.ts           # Real-time gas price from Arc RPC
│   │
│   ├── services/
│   │   ├── bulkPayService.ts           # Multicall3From sequence builder, memo encoding
│   │   └── agentService.ts             # Groq AI LLM integration for payment parsing
│   │
│   ├── contracts/
│   │   ├── abis/
│   │   │   ├── erc20.abi.ts            # ERC20 ABI (approve, transfer, transferFrom, balanceOf)
│   │   │   ├── multicall3From.abi.ts   # Multicall3From batch execution ABI
│   │   │   └── memo.abi.ts             # Memo contract ABI (sendMemo function)
│   │   └── config.ts                   # Contract addresses (hardcoded for Arc Testnet)
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
│   │   ├── token.ts                    # Token metadata, balance types
│   │   ├── bulkPay.ts                  # Recipient, BulkPayParams, BulkPayStatus types
│   │   └── agent.ts                    # AgentParseResult, ParsedPayment types
│   │
│   └── utils/
│       ├── format.ts                   # Token amount formatting (parseUnits, formatUnits)
│       ├── address.ts                  # Address validation, ENS resolution, truncation
│       └── errors.ts                   # Typed error handling and user-friendly messages
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
