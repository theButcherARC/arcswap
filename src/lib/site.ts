// Single source of truth for public site metadata used by SEO tags,
// sitemap, robots.txt and share images.
//
// On Vercel this automatically resolves to the real production domain via
// VERCEL_PROJECT_PRODUCTION_URL. Set NEXT_PUBLIC_SITE_URL in the Vercel
// dashboard to override it with a custom domain.
const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : undefined

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? vercelProd ?? "https://arcswap-lac.vercel.app"

export const SITE_NAME = "VibeFlow"
export const SITE_TAGLINE = "Batch USDC payments. One signature."
export const SITE_DESCRIPTION =
  "Send USDC or EURC to your entire team in one transaction. AI-powered, zero approval, settled in under a second on Arc."
export const SITE_KEYWORDS = [
  "batch USDC payments",
  "bulk crypto payments",
  "USDC payroll",
  "stablecoin payroll",
  "crypto team payments",
  "onchain payments",
  "Arc blockchain",
  "EURC payments",
  "Web3 payroll",
  "mass payouts crypto",
]
