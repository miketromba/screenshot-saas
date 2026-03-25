import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

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
