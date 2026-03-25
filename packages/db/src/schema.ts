import {
	boolean,
	index,
	integer,
	jsonb,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid
} from 'drizzle-orm/pg-core'

export const profiles = pgTable(
	'profiles',
	{
		id: uuid('id').primaryKey(),
		email: text('email'),
		displayName: text('display_name'),
		email_confirmed_at: timestamp('email_confirmed_at', {
			mode: 'date',
			withTimezone: true
		}),
		last_sign_in_at: timestamp('last_sign_in_at', {
			mode: 'date',
			withTimezone: true
		}),
		created_at: timestamp('created_at', {
			mode: 'date',
			withTimezone: true
		})
			.defaultNow()
			.notNull(),
		updated_at: timestamp('updated_at', {
			mode: 'date',
			withTimezone: true
		})
			.defaultNow()
			.notNull()
	},
	table => [
		index('profiles_id_idx').on(table.id),
		index('profiles_email_idx').on(table.email)
	]
)

export const apiKeys = pgTable(
	'api_keys',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: uuid('user_id')
			.notNull()
			.references(() => profiles.id, { onDelete: 'cascade' }),
		name: text('name').notNull(),
		keyPrefix: text('key_prefix').notNull(),
		keyHash: text('key_hash').notNull(),
		lastUsedAt: timestamp('last_used_at', {
			mode: 'date',
			withTimezone: true
		}),
		revokedAt: timestamp('revoked_at', {
			mode: 'date',
			withTimezone: true
		}),
		createdAt: timestamp('created_at', {
			mode: 'date',
			withTimezone: true
		})
			.defaultNow()
			.notNull()
	},
	table => [
		index('api_keys_user_id_idx').on(table.userId),
		uniqueIndex('api_keys_key_hash_idx').on(table.keyHash)
	]
)

export const creditBalances = pgTable('credit_balances', {
	userId: uuid('user_id')
		.primaryKey()
		.references(() => profiles.id, { onDelete: 'cascade' }),
	balance: integer('balance').notNull().default(5),
	updatedAt: timestamp('updated_at', {
		mode: 'date',
		withTimezone: true
	})
		.defaultNow()
		.notNull()
})

export const creditTransactions = pgTable(
	'credit_transactions',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: uuid('user_id')
			.notNull()
			.references(() => profiles.id, { onDelete: 'cascade' }),
		amount: integer('amount').notNull(),
		type: text('type', {
			enum: ['signup_bonus', 'purchase', 'usage', 'auto_topup', 'refund']
		}).notNull(),
		description: text('description'),
		referenceId: text('reference_id'),
		createdAt: timestamp('created_at', {
			mode: 'date',
			withTimezone: true
		})
			.defaultNow()
			.notNull()
	},
	table => [
		index('credit_transactions_user_id_idx').on(table.userId),
		index('credit_transactions_created_at_idx').on(table.createdAt)
	]
)

export const creditPacks = pgTable('credit_packs', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: text('name').notNull(),
	credits: integer('credits').notNull(),
	priceCents: integer('price_cents').notNull(),
	stripePriceId: text('stripe_price_id'),
	isPopular: boolean('is_popular').default(false),
	isActive: boolean('is_active').default(true),
	sortOrder: integer('sort_order').default(0),
	createdAt: timestamp('created_at', {
		mode: 'date',
		withTimezone: true
	})
		.defaultNow()
		.notNull()
})

export const autoTopupConfigs = pgTable('auto_topup_configs', {
	userId: uuid('user_id')
		.primaryKey()
		.references(() => profiles.id, { onDelete: 'cascade' }),
	enabled: boolean('enabled').notNull().default(false),
	threshold: integer('threshold').notNull().default(10),
	packId: uuid('pack_id').references(() => creditPacks.id),
	stripeCustomerId: text('stripe_customer_id'),
	stripePaymentMethodId: text('stripe_payment_method_id'),
	updatedAt: timestamp('updated_at', {
		mode: 'date',
		withTimezone: true
	})
		.defaultNow()
		.notNull()
})

export const screenshots = pgTable(
	'screenshots',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: uuid('user_id')
			.notNull()
			.references(() => profiles.id, { onDelete: 'cascade' }),
		apiKeyId: uuid('api_key_id').references(() => apiKeys.id),
		url: text('url').notNull(),
		options: jsonb('options'),
		status: text('status', {
			enum: ['completed', 'failed']
		}).notNull(),
		errorMessage: text('error_message'),
		durationMs: integer('duration_ms'),
		creditDeducted: boolean('credit_deducted').default(false),
		createdAt: timestamp('created_at', {
			mode: 'date',
			withTimezone: true
		})
			.defaultNow()
			.notNull()
	},
	table => [
		index('screenshots_user_id_idx').on(table.userId),
		index('screenshots_created_at_idx').on(table.createdAt)
	]
)
