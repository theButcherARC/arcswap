/**
 * Centralised route definitions.
 * Import from here — never hardcode paths in components.
 */
export const ROUTES = {
  HOME: "/",
  SWAP: "/swap",
  BULK_PAY: "/bulk-pay",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
