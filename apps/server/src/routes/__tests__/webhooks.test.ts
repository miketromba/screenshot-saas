import { beforeEach, describe, expect, it } from 'bun:test'
import { Elysia } from 'elysia'

const VALID_SIG = 'whsec_test_valid_signature'

let addedCredits: Array<{
	userId: string
	amount: number
	type: string
}> = []

async function mockConstructWebhookEvent(body: string, signature: string) {
	if (signature !== VALID_SIG) throw new Error('Invalid signature')
	return JSON.parse(body) as {
		type: string
		data: { object: Record<string, unknown> }
	}
}

const app = new Elysia({ prefix: '/webhooks' }).post(
	'/stripe',
	async ({ request, set }) => {
		const body = await request.text()
		const signature = request.headers.get('stripe-signature')

		if (!signature) {
			set.status = 400
			return { error: 'Missing stripe-signature header' }
		}

		let event: Awaited<ReturnType<typeof mockConstructWebhookEvent>>
		try {
			event = await mockConstructWebhookEvent(body, signature)
		} catch {
			set.status = 400
			return { error: 'Invalid webhook signature' }
		}

		switch (event.type) {
			case 'checkout.session.completed': {
				const session = event.data.object as Record<string, unknown>
				const meta = session.metadata as
					| Record<string, string>
					| undefined
				const userId = meta?.userId
				const credits = Number(meta?.credits)
				if (userId && credits > 0) {
					addedCredits.push({
						userId,
						amount: credits,
						type: 'purchase'
					})
				}
				break
			}
			case 'payment_intent.succeeded': {
				const intent = event.data.object as Record<string, unknown>
				const meta = intent.metadata as
					| Record<string, string>
					| undefined
				if (meta?.type === 'auto_topup') {
					const userId = meta.userId
					const credits = Number(meta.credits)
					if (userId && credits > 0) {
						addedCredits.push({
							userId,
							amount: credits,
							type: 'auto_topup'
						})
					}
				}
				break
			}
		}

		return { received: true }
	}
)

function webhookRequest(event: unknown, headers: Record<string, string> = {}) {
	return new Request('http://localhost/webhooks/stripe', {
		method: 'POST',
		body: JSON.stringify(event),
		headers: {
			'content-type': 'application/json',
			...headers
		}
	})
}

describe('Stripe webhook routes', () => {
	beforeEach(() => {
		addedCredits = []
	})

	it('returns 400 when stripe-signature is missing', async () => {
		const res = await app.handle(webhookRequest({ type: 'test' }))
		expect(res.status).toBe(400)
		const body = await res.json()
		expect(body.error).toBe('Missing stripe-signature header')
	})

	it('returns 400 for invalid signature', async () => {
		const res = await app.handle(
			webhookRequest(
				{ type: 'test' },
				{ 'stripe-signature': 'invalid_sig' }
			)
		)
		expect(res.status).toBe(400)
		const body = await res.json()
		expect(body.error).toBe('Invalid webhook signature')
	})

	it('handles checkout.session.completed and adds credits', async () => {
		const event = {
			type: 'checkout.session.completed',
			data: {
				object: {
					id: 'cs_test_123',
					metadata: {
						userId: 'user-123',
						credits: '500',
						packId: 'pack-growth'
					}
				}
			}
		}
		const res = await app.handle(
			webhookRequest(event, { 'stripe-signature': VALID_SIG })
		)
		expect(res.status).toBe(200)
		expect(await res.json()).toEqual({ received: true })
		expect(addedCredits).toHaveLength(1)
		expect(addedCredits[0]).toEqual({
			userId: 'user-123',
			amount: 500,
			type: 'purchase'
		})
	})

	it('handles payment_intent.succeeded with auto_topup', async () => {
		const event = {
			type: 'payment_intent.succeeded',
			data: {
				object: {
					id: 'pi_test_456',
					metadata: {
						type: 'auto_topup',
						userId: 'user-456',
						credits: '100'
					}
				}
			}
		}
		const res = await app.handle(
			webhookRequest(event, { 'stripe-signature': VALID_SIG })
		)
		expect(res.status).toBe(200)
		expect(await res.json()).toEqual({ received: true })
		expect(addedCredits).toHaveLength(1)
		expect(addedCredits[0]).toEqual({
			userId: 'user-456',
			amount: 100,
			type: 'auto_topup'
		})
	})

	it('returns received:true for unknown event types', async () => {
		const event = {
			type: 'customer.subscription.created',
			data: { object: { id: 'sub_test' } }
		}
		const res = await app.handle(
			webhookRequest(event, { 'stripe-signature': VALID_SIG })
		)
		expect(res.status).toBe(200)
		expect(await res.json()).toEqual({ received: true })
		expect(addedCredits).toHaveLength(0)
	})
})
