import {
  boolean,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

// ── Better Auth tables ──────────────────────────────────────────────────────

export const user = pgTable('user', {
  id:            text('id').primaryKey(),
  name:          text('name').notNull(),
  email:         text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image:         text('image'),
  username:      text('username'),
  createdAt:     timestamp('createdAt').notNull().defaultNow(),
  updatedAt:     timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id:         text('id').primaryKey(),
  expiresAt:  timestamp('expiresAt').notNull(),
  token:      text('token').notNull().unique(),
  createdAt:  timestamp('createdAt').notNull().defaultNow(),
  updatedAt:  timestamp('updatedAt').notNull().defaultNow(),
  ipAddress:  text('ipAddress'),
  userAgent:  text('userAgent'),
  userId:     text('userId').notNull().references(() => user.id),
})

export const account = pgTable('account', {
  id:                     text('id').primaryKey(),
  accountId:              text('accountId').notNull(),
  providerId:             text('providerId').notNull(),
  userId:                 text('userId').notNull().references(() => user.id),
  accessToken:            text('accessToken'),
  refreshToken:           text('refreshToken'),
  idToken:                text('idToken'),
  accessTokenExpiresAt:   timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt:  timestamp('refreshTokenExpiresAt'),
  scope:                  text('scope'),
  password:               text('password'),
  createdAt:              timestamp('createdAt').notNull().defaultNow(),
  updatedAt:              timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id:          text('id').primaryKey(),
  identifier:  text('identifier').notNull(),
  value:       text('value').notNull(),
  expiresAt:   timestamp('expiresAt').notNull(),
  createdAt:   timestamp('createdAt').notNull().defaultNow(),
  updatedAt:   timestamp('updatedAt').notNull().defaultNow(),
})

// ── Social Pay table ────────────────────────────────────────────────────────

export const socialProfiles = pgTable('social_profiles', {
  id:            text('id').primaryKey(),
  username:      text('username').notNull().unique(), // X username (unique identifier)
  xUserId:       text('xUserId'),                       // X user ID for future use
  walletAddress: text('walletAddress').notNull(),
  userId:        text('userId'),
  verified:      boolean('verified').notNull().default(false),
  addedByAdmin:  boolean('addedByAdmin').notNull().default(false),
  createdAt:     timestamp('createdAt').notNull().defaultNow(),
  updatedAt:     timestamp('updatedAt').notNull().defaultNow(),
})
