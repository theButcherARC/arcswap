/**
 * Centralised route definitions.
 * Import from here - never hardcode paths in components.
 */
export const ROUTES = {
  HOME: "/",
  BULK_PAY: "/bulk-pay",
  BULK_PAY_UPLOAD: "/bulk-pay/upload",
  SCHEDULED: "/scheduled",
  DASHBOARD: "/dashboard",
  SOCIAL_PROFILE: "/social-profile",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
