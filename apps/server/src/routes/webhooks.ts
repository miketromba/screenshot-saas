import { Webhooks } from '@polar-sh/elysia'
import {
	POLAR_PRODUCT_IDS,
	type SubscriptionPlan
} from '@screenshot-saas/config'
import { Elysia } from 'elysia'
import { addCredits } from '../services/credits'
import {
	cancelSubscription,
	updateSubscriptionPlan
} from '../services/subscription'

function getPlanFromProductId(
	productId: string
): { plan: SubscriptionPlan; billingCycle: 'monthly' | 'annual' } | null {
	for (const [plan, ids] of Object.entries(POLAR_PRODUCT_IDS)) {
		if (ids.monthly === productId) {
			return { plan: plan as SubscriptionPlan, billingCycle: 'monthly' }
		}
		if (ids.annual === productId) {
			return { plan: plan as SubscriptionPlan, billingCycle: 'annual' }
		}
	}
	return null
}

export const webhookRoutes = new Elysia({
	name: 'webhook-routes',
	prefix: '/webhooks'
}).post(
	'/polar',
	Webhooks({
		webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,
		onOrderPaid: async payload => {
			const order = payload.data
			const userId = order.customer.externalId ?? order.metadata.userId
			if (typeof userId !== 'string' || !userId) return

			if (order.metadata.type === 'credit_pack') {
				const credits = Number(order.metadata.credits)
				if (credits > 0) {
					await addCredits({
						userId,
						amount: credits,
						type: 'purchase',
						description: `Purchased ${credits.toLocaleString()} credits`,
						referenceId: order.id
					})
				}
			}
		},
		onSubscriptionActive: async payload => {
			const subscription = payload.data
			const externalId = subscription.customer.externalId
			if (!externalId) return

			const planInfo = getPlanFromProductId(subscription.productId)
			if (!planInfo) return

			await updateSubscriptionPlan({
				userId: externalId,
				plan: planInfo.plan,
				billingCycle: planInfo.billingCycle,
				polarSubscriptionId: subscription.id,
				polarCustomerId: subscription.customerId
			})
		},
		onSubscriptionCanceled: async payload => {
			const subscription = payload.data
			const externalId = subscription.customer.externalId
			if (!externalId) return

			await cancelSubscription(externalId)
		},
		onSubscriptionRevoked: async payload => {
			const subscription = payload.data
			const externalId = subscription.customer.externalId
			if (!externalId) return

			await updateSubscriptionPlan({
				userId: externalId,
				plan: 'free',
				billingCycle: 'monthly'
			})
		},
		onSubscriptionUncanceled: async payload => {
			const subscription = payload.data
			const externalId = subscription.customer.externalId
			if (!externalId) return

			const planInfo = getPlanFromProductId(subscription.productId)
			if (!planInfo) return

			await updateSubscriptionPlan({
				userId: externalId,
				plan: planInfo.plan,
				billingCycle: planInfo.billingCycle,
				polarSubscriptionId: subscription.id,
				polarCustomerId: subscription.customerId
			})
		}
	})
)
