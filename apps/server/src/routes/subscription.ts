import {
	SUBSCRIPTION_PLANS,
	type SubscriptionPlan
} from '@screenshot-saas/config'
import { Elysia, t } from 'elysia'
import { sessionAuth } from '../middleware/session-auth'
import { polar } from '../services/polar'
import { getOrCreateSubscription } from '../services/subscription'

export const subscriptionRoutes = new Elysia({
	name: 'subscription-routes',
	prefix: '/subscription'
})
	.get('/plans', () => {
		return Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => ({
			id: key,
			name: plan.name,
			screenshotsPerMonth: plan.screenshotsPerMonth,
			monthlyPriceCents: plan.monthlyPriceCents,
			annualPriceCents: plan.annualPriceCents,
			perScreenshot: plan.perScreenshot,
			overageRateCents: plan.overageRateCents,
			features: plan.features
		}))
	})
	.use(sessionAuth)
	.get('/', async ({ user }) => {
		const subscription = await getOrCreateSubscription(user.id)
		return {
			id: subscription.id,
			plan: subscription.plan,
			status: subscription.status,
			billingCycle: subscription.billingCycle,
			screenshotsPerMonth: subscription.screenshotsPerMonth,
			screenshotsUsedThisMonth: subscription.screenshotsUsedThisMonth,
			overageScreenshots: subscription.overageScreenshots,
			overageRateCents: subscription.overageRateCents,
			currentPeriodStart: subscription.currentPeriodStart,
			currentPeriodEnd: subscription.currentPeriodEnd,
			polarSubscriptionId: subscription.polarSubscriptionId,
			polarCustomerId: subscription.polarCustomerId,
			canceledAt: subscription.canceledAt,
			createdAt: subscription.createdAt
		}
	})
	.post(
		'/checkout',
		async ({ body, user, set }) => {
			const plan = body.plan as SubscriptionPlan
			const billingCycle = body.billingCycle ?? 'monthly'

			const planConfig = SUBSCRIPTION_PLANS[plan]
			if (!planConfig) {
				set.status = 400
				return { error: 'Invalid plan' }
			}

			if (plan === 'free') {
				set.status = 400
				return { error: 'Cannot checkout for the free plan' }
			}

			if (!body.polarProductId) {
				set.status = 400
				return {
					error: 'Product ID required for paid plans. Configure Polar products in your dashboard.'
				}
			}

			const appUrl =
				process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

			const checkout = await polar.createSubscriptionCheckout({
				userId: user.id,
				plan,
				billingCycle,
				productId: body.polarProductId,
				successUrl: `${appUrl}/dashboard/billing?success=true`
			})

			return { checkoutUrl: checkout.url }
		},
		{
			body: t.Object({
				plan: t.String(),
				billingCycle: t.Optional(
					t.Union([t.Literal('monthly'), t.Literal('annual')])
				),
				polarProductId: t.Optional(t.String())
			})
		}
	)
	.post(
		'/upgrade',
		async ({ body, user, set }) => {
			const subscription = await getOrCreateSubscription(user.id)

			if (!subscription.polarSubscriptionId) {
				set.status = 400
				return {
					error: 'No active Polar subscription found. Use /checkout to subscribe first.'
				}
			}

			const plan = body.plan as SubscriptionPlan
			const planConfig = SUBSCRIPTION_PLANS[plan]
			if (!planConfig) {
				set.status = 400
				return { error: 'Invalid plan' }
			}

			if (plan === 'free') {
				set.status = 400
				return {
					error: 'Cannot upgrade to free plan. Use /cancel instead.'
				}
			}

			await polar.upgradeSubscription({
				polarSubscriptionId: subscription.polarSubscriptionId,
				newProductId: body.polarProductId,
				proration: body.proration
			})

			return {
				success: true,
				message: `Plan change to ${planConfig.name} initiated. Your subscription will be updated shortly.`
			}
		},
		{
			body: t.Object({
				plan: t.String(),
				billingCycle: t.Optional(
					t.Union([t.Literal('monthly'), t.Literal('annual')])
				),
				polarProductId: t.String(),
				proration: t.Optional(
					t.Union([
						t.Literal('invoice'),
						t.Literal('prorate'),
						t.Literal('next_period')
					])
				)
			})
		}
	)
	.post('/cancel', async ({ user, set }) => {
		const subscription = await getOrCreateSubscription(user.id)

		if (!subscription.polarSubscriptionId) {
			set.status = 400
			return {
				error: 'No active Polar subscription to cancel.'
			}
		}

		await polar.cancelSubscription(subscription.polarSubscriptionId)

		return {
			success: true,
			message:
				'Cancellation requested. Your subscription will remain active until the end of the current billing period.'
		}
	})
	.get('/portal', async ({ user, set }) => {
		const subscription = await getOrCreateSubscription(user.id)

		if (!subscription.polarCustomerId) {
			set.status = 400
			return {
				error: 'No Polar customer record found. Subscribe to a paid plan first.'
			}
		}

		const session = await polar.createCustomerPortalSession(
			subscription.polarCustomerId
		)

		return { portalUrl: session.customerPortalUrl }
	})
