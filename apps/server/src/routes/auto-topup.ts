import { db, eq, schema } from '@screenshot-saas/db'
import { Elysia, t } from 'elysia'
import { sessionAuth } from '../middleware/session-auth'
import { stripe as stripeService } from '../services/stripe'

export const autoTopupRoutes = new Elysia({
	name: 'auto-topup-routes',
	prefix: '/auto-topup'
})
	.use(sessionAuth)
	.get('/', async ({ user }) => {
		const config = await db.query.autoTopupConfigs.findFirst({
			where: eq(schema.autoTopupConfigs.userId, user.id)
		})
		return {
			enabled: config?.enabled ?? false,
			threshold: config?.threshold ?? 10,
			packId: config?.packId ?? null,
			hasPaymentMethod: !!config?.stripePaymentMethodId
		}
	})
	.put(
		'/',
		async ({ body, user, set }) => {
			if (body.enabled && !body.packId) {
				set.status = 400
				return {
					error: 'A credit pack must be selected for auto top-up'
				}
			}

			const existing = await db.query.autoTopupConfigs.findFirst({
				where: eq(schema.autoTopupConfigs.userId, user.id)
			})

			if (existing) {
				await db
					.update(schema.autoTopupConfigs)
					.set({
						enabled: body.enabled,
						threshold: body.threshold ?? 10,
						packId: body.packId ?? existing.packId,
						updatedAt: new Date()
					})
					.where(eq(schema.autoTopupConfigs.userId, user.id))
			} else {
				await db.insert(schema.autoTopupConfigs).values({
					userId: user.id,
					enabled: body.enabled,
					threshold: body.threshold ?? 10,
					packId: body.packId
				})
			}

			return { success: true }
		},
		{
			body: t.Object({
				enabled: t.Boolean(),
				threshold: t.Optional(t.Number({ minimum: 1 })),
				packId: t.Optional(t.String())
			})
		}
	)
	.post('/setup-payment', async ({ user }) => {
		const profile = await db.query.profiles.findFirst({
			where: eq(schema.profiles.id, user.id)
		})

		const customer = await stripeService.getOrCreateCustomer({
			userId: user.id,
			email: user.email ?? profile?.email ?? ''
		})

		await db
			.update(schema.autoTopupConfigs)
			.set({
				stripeCustomerId: customer.id,
				updatedAt: new Date()
			})
			.where(eq(schema.autoTopupConfigs.userId, user.id))

		const setupIntent = await stripeService.createSetupIntent({
			customerId: customer.id
		})

		return { clientSecret: setupIntent.client_secret }
	})
