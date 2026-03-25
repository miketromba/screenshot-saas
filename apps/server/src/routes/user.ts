import { db, eq, schema } from '@screenshot-saas/db'
import { Elysia } from 'elysia'
import { sessionAuth } from '../middleware/session-auth'
import { getBalance, initializeCredits } from '../services/credits'

export const userRoutes = new Elysia({
	name: 'user-routes',
	prefix: '/user'
})
	.use(sessionAuth)
	.get('/me', async ({ user }) => {
		const profile = await db.query.profiles.findFirst({
			where: eq(schema.profiles.id, user.id)
		})

		const existingBalance = await db.query.creditBalances.findFirst({
			where: eq(schema.creditBalances.userId, user.id)
		})

		if (!existingBalance) {
			await initializeCredits(user.id)
		}

		const balance = await getBalance(user.id)

		return {
			id: user.id,
			email: user.email ?? profile?.email ?? '',
			displayName: profile?.displayName ?? null,
			balance,
			createdAt: profile?.created_at ?? null
		}
	})
