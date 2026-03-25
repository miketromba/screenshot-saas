import { db, eq, schema } from '@screenshot-saas/db'
import { Elysia, t } from 'elysia'
import { sessionAuth } from '../middleware/session-auth'
import {
	getBalance,
	getTransactions,
	initializeCredits
} from '../services/credits'
import { stripe as stripeService } from '../services/stripe'

export const creditRoutes = new Elysia({
	name: 'credit-routes',
	prefix: '/credits'
})
	.get('/packs', async () => {
		const packs = await db.query.creditPacks.findMany({
			where: eq(schema.creditPacks.isActive, true),
			orderBy: (t, { asc }) => [asc(t.sortOrder)]
		})
		return packs.map(p => ({
			id: p.id,
			name: p.name,
			credits: p.credits,
			priceCents: p.priceCents,
			isPopular: p.isPopular
		}))
	})
	.use(sessionAuth)
	.get('/', async ({ user }) => {
		const balance = await getBalance(user.id)
		return { balance }
	})
	.get(
		'/transactions',
		async ({ user, query }) => {
			const limit = query.limit ? Number(query.limit) : 50
			const offset = query.offset ? Number(query.offset) : 0
			const transactions = await getTransactions({
				userId: user.id,
				limit,
				offset
			})
			return transactions
		},
		{
			query: t.Object({
				limit: t.Optional(t.String()),
				offset: t.Optional(t.String())
			})
		}
	)
	.post(
		'/purchase',
		async ({ body, user, set }) => {
			const pack = await db.query.creditPacks.findFirst({
				where: eq(schema.creditPacks.id, body.packId)
			})

			if (!pack || !pack.isActive) {
				set.status = 404
				return { error: 'Credit pack not found' }
			}

			const appUrl =
				process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

			const session = await stripeService.createCheckoutSession({
				userId: user.id,
				packId: pack.id,
				packName: pack.name,
				credits: pack.credits,
				priceCents: pack.priceCents,
				successUrl: `${appUrl}/dashboard/credits?success=true`,
				cancelUrl: `${appUrl}/dashboard/credits?canceled=true`
			})

			return { checkoutUrl: session.url }
		},
		{
			body: t.Object({
				packId: t.String()
			})
		}
	)
	.post('/initialize', async ({ user }) => {
		await initializeCredits(user.id)
		const balance = await getBalance(user.id)
		return { balance }
	})
