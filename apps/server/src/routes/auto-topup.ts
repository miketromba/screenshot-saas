import { db, eq, schema } from '@screenshot-saas/db'
import { Elysia, t } from 'elysia'
import { sessionAuth } from '../middleware/session-auth'

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
			packId: config?.packId ?? null
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
