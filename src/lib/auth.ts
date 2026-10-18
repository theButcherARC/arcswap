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
      // Twitter OAuth v2 returns profile in various shapes - handle all of them
      mapProfileToUser: (profile: Record<string, unknown>) => {
        // Twitter API v2 wraps user object under 'data'
        const data = (profile.data ?? profile) as Record<string, unknown>

        // username is the @handle (screen_name equivalent in v2)
        const username =
          (data.username as string) ??
          (profile.username as string) ??
          (profile.screen_name as string) ??
          ''

        const name =
          (data.name as string) ??
          (profile.name as string) ??
          ''

        // profile_image_url is Twitter v2 field; remove _normal suffix for higher res
        const rawImage =
          (data.profile_image_url as string) ??
          (profile.profile_image_url as string) ??
          (profile.image as string) ??
          ''
        const image = rawImage.replace('_normal.', '_400x400.')

        return { name, image, username }
      },
    },
  },
  user: {
    additionalFields: {
      username: {
        type: 'string',
        required: false,
        defaultValue: '',
        input: false,
      },
    },
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: 'none' as const,
      secure: true,
    },
  },
})
