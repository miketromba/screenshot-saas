import { Elysia } from 'elysia'
import { addCredits } from '../services/credits'
import { polar, WebhookVerificationError } from '../services/polar'

export const webhookRoutes = new Elysia({
	name: 'webhook-routes',
	prefix: '/webhooks'
}).post('/polar', async ({ request, set }) => {
	const body = await request.text()
	const headers: Record<string, string> = {}
	request.headers.forEach((value, key) => {
		headers[key] = value
	})

	let event: ReturnType<typeof polar.verifyWebhookSignature>
	try {
		event = polar.verifyWebhookSignature({ body, headers })
	} catch (error) {
		if (error instanceof WebhookVerificationError) {
			set.status = 403
			return { error: 'Invalid webhook signature' }
		}
		throw error
	}

	if (event.type === 'checkout.updated') {
		const checkout = event.data
		if (checkout.status === 'succeeded') {
			const userId = checkout.metadata?.userId as string | undefined
			const credits = Number(checkout.metadata?.credits)

			if (userId && credits > 0) {
				await addCredits({
					userId,
					amount: credits,
					type: 'purchase',
					description: `Purchased ${credits.toLocaleString()} credits`,
					referenceId: checkout.id
				})
			}
		}
	}

	return { received: true }
})
