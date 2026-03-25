import Stripe from 'stripe'

function getStripe(): Stripe {
	const key = process.env.STRIPE_SECRET_KEY
	if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
	return new Stripe(key)
}

export const stripe = {
	get client() {
		return getStripe()
	},

	async createCheckoutSession({
		userId,
		packId,
		packName,
		credits,
		priceCents,
		successUrl,
		cancelUrl
	}: {
		userId: string
		packId: string
		packName: string
		credits: number
		priceCents: number
		successUrl: string
		cancelUrl: string
	}) {
		return getStripe().checkout.sessions.create({
			mode: 'payment',
			line_items: [
				{
					price_data: {
						currency: 'usd',
						product_data: {
							name: `${packName} — ${credits.toLocaleString()} credits`
						},
						unit_amount: priceCents
					},
					quantity: 1
				}
			],
			metadata: { userId, packId, credits: String(credits) },
			success_url: successUrl,
			cancel_url: cancelUrl
		})
	},

	async createSetupIntent({ customerId }: { customerId: string }) {
		return getStripe().setupIntents.create({
			customer: customerId,
			payment_method_types: ['card']
		})
	},

	async getOrCreateCustomer({
		userId,
		email
	}: {
		userId: string
		email: string
	}) {
		const existing = await getStripe().customers.search({
			query: `metadata["userId"]:"${userId}"`
		})
		if (existing.data.length > 0) return existing.data[0]!

		return getStripe().customers.create({
			email,
			metadata: { userId }
		})
	},

	async chargePaymentMethod({
		customerId,
		paymentMethodId,
		amount,
		metadata
	}: {
		customerId: string
		paymentMethodId: string
		amount: number
		metadata: Record<string, string>
	}) {
		return getStripe().paymentIntents.create({
			amount,
			currency: 'usd',
			customer: customerId,
			payment_method: paymentMethodId,
			off_session: true,
			confirm: true,
			metadata
		})
	},

	async constructWebhookEvent(
		body: string,
		signature: string
	): Promise<Stripe.Event> {
		const secret = process.env.STRIPE_WEBHOOK_SECRET
		if (!secret) throw new Error('STRIPE_WEBHOOK_SECRET is not set')
		return getStripe().webhooks.constructEvent(body, signature, secret)
	}
}
