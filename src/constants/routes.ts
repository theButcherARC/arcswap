/**
 * Centralised route definitions.
 * Import from here - never hardcode paths in components.
 */
export const ROUTES = {
  HOME: "/",
  VIBRAIN: "/vibrain",
  SQUARE: "/square",
  HOME_PAGE: "/home",
  EARN: "/earn",
  BULK_PAY: "/bulk-pay",
  BULK_PAY_UPLOAD: "/bulk-pay/upload",
  BULK_PAY_AI: "/bulk-pay/ai",
  SCHEDULED: "/scheduled",
  DASHBOARD: "/dashboard",
  SOCIAL_PROFILE: "/social-profile",
  ROADMAP: "/roadmap",
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
