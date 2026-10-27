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
  vibeId:        text('vibeId').unique(),
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

// ── Scheduled payments table ───────────────────────────────────────────────

export const scheduledBatches = pgTable('scheduled_batches', {
  id:           text('id').primaryKey(),
  userId:       text('userId').notNull().references(() => user.id),
  tokenSymbol:  text('tokenSymbol').notNull(),              // USDC or EURC
  totalAmount:  text('totalAmount').notNull(),              // total as decimal string
  recipients:   text('recipients').notNull(),               // JSON: [{ name, address, amount }]
  memo:         text('memo'),
  scheduledFor: timestamp('scheduledFor').notNull(),
  status:       text('status').notNull().default('pending'), // pending | sent | cancelled
  txHash:       text('txHash'),
  createdAt:    timestamp('createdAt').notNull().defaultNow(),
  updatedAt:    timestamp('updatedAt').notNull().defaultNow(),
})

// ── VibeSquare feed table ───────────────────────────────────────────────────

export const squarePosts = pgTable('square_posts', {
  id:            text('id').primaryKey(),
  walletAddress: text('walletAddress').notNull(),
  handle:        text('handle'),                            // linked X handle, when known
  content:       text('content').notNull(),
  createdAt:     timestamp('createdAt').notNull().defaultNow(),
})

export const squareRequests = pgTable('square_requests', {
  id:            text('id').primaryKey(),
  walletAddress: text('walletAddress').notNull(),
  handle:        text('handle'),                            // linked X handle, when known
  amount:        text('amount').notNull(),                   // USDC amount, decimal string
  note:          text('note').notNull(),                     // what the request is for
  status:        text('status').notNull().default('open'),   // open | closed
  createdAt:     timestamp('createdAt').notNull().defaultNow(),
})
