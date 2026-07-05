/**
 * Centralised route definitions.
 * Import from here — never hardcode paths in components.
 */
export const ROUTES = {
  HOME: "/",
  BULK_PAY: "/bulk-pay",
  DASHBOARD: "/dashboard",
  ROADMAP: "/roadmap",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
