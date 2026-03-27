import { Polar } from '@polar-sh/sdk'

let polarInstance: Polar | null = null

export function getPolar(): Polar {
	if (!polarInstance) {
		const accessToken = process.env.POLAR_ACCESS_TOKEN
		if (!accessToken) throw new Error('POLAR_ACCESS_TOKEN is not set')
		polarInstance = new Polar({ accessToken })
	}
	return polarInstance
}

export const polar = {
	get client() {
		return getPolar()
	},

	async ensureCustomer({
		userId,
		email,
		name
	}: {
		userId: string
		email: string
		name?: string
	}) {
		const client = getPolar()
		try {
			return await client.customers.getExternal({ externalId: userId })
		} catch {
			return await client.customers.create({
				email,
				name: name ?? undefined,
				externalId: userId,
				organizationId: process.env.POLAR_ORGANIZATION_ID
			})
		}
	},

	async createCheckout({
		userId,
		packId,
		packName,
		credits,
		productId,
		successUrl
	}: {
		userId: string
		packId: string
		packName: string
		credits: number
		productId: string
		successUrl: string
	}) {
		return getPolar().checkouts.create({
			products: [productId],
			metadata: {
				userId,
				packId,
				credits: String(credits),
				packName,
				type: 'credit_pack'
			},
			successUrl,
			externalCustomerId: userId
		})
	},

	async createSubscriptionCheckout({
		userId,
		plan,
		billingCycle,
		productId,
		successUrl
	}: {
		userId: string
		plan: string
		billingCycle: 'monthly' | 'annual'
		productId: string
		successUrl: string
	}) {
		return getPolar().checkouts.create({
			products: [productId],
			metadata: {
				userId,
				plan,
				billingCycle,
				type: 'subscription'
			},
			successUrl,
			externalCustomerId: userId
		})
	},

	async cancelSubscription(polarSubscriptionId: string) {
		return getPolar().subscriptions.update({
			id: polarSubscriptionId,
			subscriptionUpdate: {
				cancelAtPeriodEnd: true
			}
		})
	},

	async upgradeSubscription({
		polarSubscriptionId,
		newProductId,
		proration
	}: {
		polarSubscriptionId: string
		newProductId: string
		proration?: 'invoice' | 'prorate' | 'next_period'
	}) {
		return getPolar().subscriptions.update({
			id: polarSubscriptionId,
			subscriptionUpdate: {
				productId: newProductId,
				prorationBehavior: proration ?? 'invoice'
			}
		})
	},

	async getCustomerState(userId: string) {
		return getPolar().customers.getStateExternal({
			externalId: userId
		})
	},

	async createCustomerPortalSession(polarCustomerId: string) {
		return getPolar().customerSessions.create({
			customerId: polarCustomerId
		})
	},

	async ingestScreenshotEvent({
		userId,
		screenshotId,
		url,
		cached
	}: {
		userId: string
		screenshotId?: string
		url: string
		cached?: boolean
	}) {
		try {
			await getPolar().events.ingest({
				events: [
					{
						name: 'screenshot',
						externalCustomerId: userId,
						metadata: {
							screenshots: cached ? 0 : 1,
							screenshot_id: screenshotId ?? '',
							url,
							cached: cached ? 'true' : 'false'
						}
					}
				]
			})
		} catch {
			// Fire-and-forget
		}
	}
}
