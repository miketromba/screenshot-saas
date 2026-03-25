import { Polar } from '@polar-sh/sdk'
import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks'

function getPolar(): Polar {
	const accessToken = process.env.POLAR_ACCESS_TOKEN
	if (!accessToken) throw new Error('POLAR_ACCESS_TOKEN is not set')
	return new Polar({ accessToken })
}

export { WebhookVerificationError }

export const polar = {
	get client() {
		return getPolar()
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
				packName
			},
			successUrl,
			externalCustomerId: userId
		})
	},

	verifyWebhookSignature({
		body,
		headers
	}: {
		body: string
		headers: Record<string, string>
	}) {
		const secret = process.env.POLAR_WEBHOOK_SECRET
		if (!secret) throw new Error('POLAR_WEBHOOK_SECRET is not set')
		return validateEvent(body, headers, secret)
	}
}
