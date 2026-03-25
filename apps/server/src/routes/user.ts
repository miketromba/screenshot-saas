import { db, eq, schema } from '@screenshot-saas/db'
import { Elysia } from 'elysia'
import { sessionAuth } from '../middleware/session-auth'
import { getBalance } from '../services/credits'

export const userRoutes = new Elysia({
	name: 'user-routes',
	prefix: '/user'
})
	.use(sessionAuth)
	.get('/me', async ({ user }) => {
		const profile = await db.query.profiles.findFirst({
			where: eq(schema.profiles.id, user.id)
		})

		const balance = await getBalance(user.id)

		const autoTopup = await db.query.autoTopupConfigs.findFirst({
			where: eq(schema.autoTopupConfigs.userId, user.id)
		})

		return {
			id: user.id,
			email: user.email ?? profile?.email ?? '',
			displayName: profile?.displayName ?? null,
			balance,
			autoTopup: autoTopup
				? {
						enabled: autoTopup.enabled,
						threshold: autoTopup.threshold,
						packId: autoTopup.packId
					}
				: null,
			createdAt: profile?.created_at ?? null
		}
	})
