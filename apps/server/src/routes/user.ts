import { db, eq, schema } from '@screenshot-saas/db'
import { Elysia } from 'elysia'
import { sessionAuth } from '../middleware/session-auth'
import { getBalance, initializeCredits } from '../services/credits'
import { polar } from '../services/polar'
import { getOrCreateSubscription } from '../services/subscription'

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

		polar
			.ensureCustomer({
				userId: user.id,
				email: user.email ?? profile?.email ?? '',
				name: profile?.displayName ?? undefined
			})
			.catch(() => {})

		const balance = await getBalance(user.id)
		const subscription = await getOrCreateSubscription(user.id)

		return {
			id: user.id,
			email: user.email ?? profile?.email ?? '',
			displayName: profile?.displayName ?? null,
			balance,
			subscription: {
				plan: subscription.plan,
				status: subscription.status,
				billingCycle: subscription.billingCycle,
				screenshotsPerMonth: subscription.screenshotsPerMonth,
				screenshotsUsedThisMonth: subscription.screenshotsUsedThisMonth,
				overageScreenshots: subscription.overageScreenshots,
				currentPeriodEnd: subscription.currentPeriodEnd
			},
			createdAt: profile?.created_at ?? null
		}
	})
