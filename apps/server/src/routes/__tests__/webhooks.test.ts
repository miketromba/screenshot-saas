import { beforeEach, describe, expect, it } from 'bun:test'
import { Elysia } from 'elysia'

let addedCredits: Array<{
	userId: string
	amount: number
	type: string
}> = []

function mockVerifyWebhook(body: string, headers: Record<string, string>) {
	if (headers['webhook-id'] !== 'valid') throw new Error('Invalid signature')
	return JSON.parse(body) as {
		type: string
		data: Record<string, unknown>
	}
}

const app = new Elysia({ prefix: '/webhooks' }).post(
	'/polar',
	async ({ request, set }) => {
		const body = await request.text()
		const headers: Record<string, string> = {}
		request.headers.forEach((value, key) => {
			headers[key] = value
		})

		let event: ReturnType<typeof mockVerifyWebhook>
		try {
			event = mockVerifyWebhook(body, headers)
		} catch {
			set.status = 403
			return { error: 'Invalid webhook signature' }
		}

		if (event.type === 'checkout.updated') {
			const checkout = event.data
			if (checkout.status === 'succeeded') {
				const metadata = checkout.metadata as
					| Record<string, string>
					| undefined
				const userId = metadata?.userId
				const credits = Number(metadata?.credits)
				if (userId && credits > 0) {
					addedCredits.push({
						userId,
						amount: credits,
						type: 'purchase'
					})
				}
			}
		}

		return { received: true }
	}
)

function webhookRequest(event: unknown, headers: Record<string, string> = {}) {
	return new Request('http://localhost/webhooks/polar', {
		method: 'POST',
		body: JSON.stringify(event),
		headers: {
			'content-type': 'application/json',
			...headers
		}
	})
}

describe('Polar webhook routes', () => {
	beforeEach(() => {
		addedCredits = []
	})

	it('returns 403 when webhook signature is invalid', async () => {
		const res = await app.handle(
			webhookRequest({ type: 'test' }, { 'webhook-id': 'invalid' })
		)
		expect(res.status).toBe(403)
		const body = await res.json()
		expect(body.error).toBe('Invalid webhook signature')
	})

	it('handles checkout.updated with succeeded status and adds credits', async () => {
		const event = {
			type: 'checkout.updated',
			data: {
				id: 'checkout_test_123',
				status: 'succeeded',
				metadata: {
					userId: 'user-123',
					credits: '500',
					packId: 'pack-growth'
				}
			}
		}
		const res = await app.handle(
			webhookRequest(event, { 'webhook-id': 'valid' })
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

	it('ignores checkout.updated with non-succeeded status', async () => {
		const event = {
			type: 'checkout.updated',
			data: {
				id: 'checkout_test_456',
				status: 'pending',
				metadata: {
					userId: 'user-123',
					credits: '500'
				}
			}
		}
		const res = await app.handle(
			webhookRequest(event, { 'webhook-id': 'valid' })
		)
		expect(res.status).toBe(200)
		expect(await res.json()).toEqual({ received: true })
		expect(addedCredits).toHaveLength(0)
	})

	it('returns received:true for unknown event types', async () => {
		const event = {
			type: 'order.created',
			data: { id: 'order_test' }
		}
		const res = await app.handle(
			webhookRequest(event, { 'webhook-id': 'valid' })
		)
		expect(res.status).toBe(200)
		expect(await res.json()).toEqual({ received: true })
		expect(addedCredits).toHaveLength(0)
	})
})
