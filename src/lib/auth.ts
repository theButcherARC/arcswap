import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db, pool } from './db'
import * as schema from './db/schema'

const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? 'https://' + process.env.VERCEL_PROJECT_PRODUCTION_URL
  : undefined
const deploymentUrl = process.env.VERCEL_URL
  ? 'https://' + process.env.VERCEL_URL
  : undefined
const runtimeUrl = process.env.V0_RUNTIME_URL ?? undefined

const baseURL =
  process.env.BETTER_AUTH_URL ??
  productionUrl ??
  deploymentUrl ??
  runtimeUrl ??
  'http://localhost:3000'

const trustedOrigins = [
  productionUrl,
  deploymentUrl,
  runtimeUrl,
  process.env.BETTER_AUTH_URL,
  'http://localhost:3000',
].filter(Boolean) as string[]

export const auth = betterAuth({
  baseURL,
  trustedOrigins,
  secret: process.env.BETTER_AUTH_SECRET!,
  database: pool,
  socialProviders: {
    twitter: {
      clientId:     process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    },
  },
  ...(process.env.NODE_ENV === 'development'
    ? {
        advanced: {
          defaultCookieAttributes: {
            sameSite: 'none' as const,
            secure: true,
          },
        },
      }
    : {}),
})
