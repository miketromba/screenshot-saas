import { Elysia } from 'elysia'
import { addCredits } from '../services/credits'
import { stripe as stripeService } from '../services/stripe'

export const webhookRoutes = new Elysia({
	name: 'webhook-routes',
	prefix: '/webhooks'
}).post('/stripe', async ({ request, set }) => {
	const body = await request.text()
	const signature = request.headers.get('stripe-signature')

	if (!signature) {
		set.status = 400
		return { error: 'Missing stripe-signature header' }
	}

	let event: Awaited<ReturnType<typeof stripeService.constructWebhookEvent>>
	try {
		event = await stripeService.constructWebhookEvent(body, signature)
	} catch {
		set.status = 400
		return { error: 'Invalid webhook signature' }
	}

	switch (event.type) {
		case 'checkout.session.completed': {
			const session = event.data.object
			const userId = session.metadata?.userId
			const credits = Number(session.metadata?.credits)
			const _packName = session.metadata?.packId ?? 'Credit pack purchase'

			if (userId && credits > 0) {
				await addCredits({
					userId,
					amount: credits,
					type: 'purchase',
					description: `Purchased ${credits.toLocaleString()} credits`,
					referenceId: session.id
				})
			}
			break
		}
		case 'payment_intent.succeeded': {
			const intent = event.data.object
			if (intent.metadata?.type === 'auto_topup') {
				const userId = intent.metadata.userId
				const credits = Number(intent.metadata.credits)
				if (userId && credits > 0) {
					await addCredits({
						userId,
						amount: credits,
						type: 'auto_topup',
						description: `Auto top-up: ${credits.toLocaleString()} credits`,
						referenceId: intent.id
					})
				}
			}
			break
		}
	}

	return { received: true }
})
