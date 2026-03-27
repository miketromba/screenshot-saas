import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'bun:test'
import { createHmac } from 'node:crypto'

let webhookServer: ReturnType<typeof Bun.serve>
let webhookUrl: string
let receivedRequests: Array<{
	body: string
	headers: Record<string, string>
	timestamp: number
}>

beforeAll(() => {
	receivedRequests = []
	webhookServer = Bun.serve({
		port: 0,
		async fetch(req) {
			const body = await req.text()
			const headers: Record<string, string> = {}
			req.headers.forEach((v, k) => {
				headers[k] = v
			})
			receivedRequests.push({ body, headers, timestamp: Date.now() })
			return new Response('OK', { status: 200 })
		}
	})
	webhookUrl = `http://localhost:${webhookServer.port}`
})

beforeEach(() => {
	receivedRequests = []
})

afterAll(() => {
	webhookServer?.stop()
})

describe('HMAC webhook signing', () => {
	it('produces a deterministic hex signature for a known payload', () => {
		const secret = 'test-webhook-secret-123'
		const payload = JSON.stringify({
			event: 'screenshot.completed',
			data: { id: 'sc-1', url: 'https://example.com' },
			timestamp: '2025-01-01T00:00:00.000Z'
		})

		const sig1 = createHmac('sha256', secret).update(payload).digest('hex')
		const sig2 = createHmac('sha256', secret).update(payload).digest('hex')

		expect(sig1).toBe(sig2)
		expect(sig1).toMatch(/^[0-9a-f]{64}$/)
	})

	it('different secrets produce different signatures', () => {
		const payload = JSON.stringify({ event: 'screenshot.completed' })

		const sig1 = createHmac('sha256', 'secret-one')
			.update(payload)
			.digest('hex')
		const sig2 = createHmac('sha256', 'secret-two')
			.update(payload)
			.digest('hex')

		expect(sig1).not.toBe(sig2)
	})

	it('different payloads with same secret produce different signatures', () => {
		const secret = 'shared-secret'

		const sig1 = createHmac('sha256', secret)
			.update(JSON.stringify({ event: 'screenshot.completed' }))
			.digest('hex')
		const sig2 = createHmac('sha256', secret)
			.update(JSON.stringify({ event: 'screenshot.failed' }))
			.digest('hex')

		expect(sig1).not.toBe(sig2)
	})
})

describe('webhook delivery HTTP', () => {
	it('delivers a signed JSON payload to the test server', async () => {
		const secret = 'delivery-test-secret'
		const bodyObj = {
			event: 'screenshot.completed',
			data: { id: 'sc-42', url: 'https://example.com', status: 'done' },
			timestamp: new Date().toISOString()
		}
		const bodyString = JSON.stringify(bodyObj)
		const signature = createHmac('sha256', secret)
			.update(bodyString)
			.digest('hex')

		const res = await fetch(webhookUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-webhook-signature': signature
			},
			body: bodyString
		})

		expect(res.status).toBe(200)
		expect(receivedRequests).toHaveLength(1)

		const req = receivedRequests[0]!
		const parsed = JSON.parse(req.body)

		expect(parsed.event).toBe('screenshot.completed')
		expect(parsed.data).toEqual(bodyObj.data)
		expect(parsed.timestamp).toBe(bodyObj.timestamp)

		expect(req.headers['x-webhook-signature']).toBe(signature)
		expect(req.headers['content-type']).toBe('application/json')
	})

	it('delivers payloads with all expected fields', async () => {
		const bodyObj = {
			event: 'screenshot.failed',
			data: { id: 'sc-99', error: 'timeout' },
			timestamp: new Date().toISOString()
		}
		const bodyString = JSON.stringify(bodyObj)
		const signature = createHmac('sha256', 'any-secret')
			.update(bodyString)
			.digest('hex')

		await fetch(webhookUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-webhook-signature': signature
			},
			body: bodyString
		})

		expect(receivedRequests).toHaveLength(1)

		const parsed = JSON.parse(receivedRequests[0]!.body)
		expect(parsed).toHaveProperty('event')
		expect(parsed).toHaveProperty('data')
		expect(parsed).toHaveProperty('timestamp')
	})

	it('signature header is present on every delivery', async () => {
		const payloads = [
			{
				event: 'screenshot.completed',
				data: { id: '1' },
				timestamp: 'a'
			},
			{ event: 'screenshot.failed', data: { id: '2' }, timestamp: 'b' },
			{ event: 'screenshot.completed', data: { id: '3' }, timestamp: 'c' }
		]

		for (const bodyObj of payloads) {
			const bodyString = JSON.stringify(bodyObj)
			const signature = createHmac('sha256', 'batch-secret')
				.update(bodyString)
				.digest('hex')

			await fetch(webhookUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-webhook-signature': signature
				},
				body: bodyString
			})
		}

		expect(receivedRequests).toHaveLength(3)

		for (const req of receivedRequests) {
			expect(req.headers['x-webhook-signature']).toBeDefined()
			expect(req.headers['x-webhook-signature']).toMatch(/^[0-9a-f]{64}$/)
		}
	})
})

describe('webhook signature verification round-trip', () => {
	it('server-received signature matches recomputed signature', async () => {
		const secret = 'roundtrip-secret-xyz'
		const bodyObj = {
			event: 'screenshot.completed',
			data: { screenshotId: 'sc-100', url: 'https://example.com/page' },
			timestamp: new Date().toISOString()
		}
		const bodyString = JSON.stringify(bodyObj)
		const signature = createHmac('sha256', secret)
			.update(bodyString)
			.digest('hex')

		await fetch(webhookUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-webhook-signature': signature
			},
			body: bodyString
		})

		expect(receivedRequests).toHaveLength(1)

		const req = receivedRequests[0]!
		const receivedSig = req.headers['x-webhook-signature']
		const recomputed = createHmac('sha256', secret)
			.update(req.body)
			.digest('hex')

		expect(receivedSig).toBe(recomputed)
	})

	it('wrong secret fails signature verification on the receiver side', async () => {
		const senderSecret = 'sender-secret'
		const receiverSecret = 'receiver-secret'
		const bodyObj = {
			event: 'screenshot.completed',
			data: { id: 'sc-200' },
			timestamp: new Date().toISOString()
		}
		const bodyString = JSON.stringify(bodyObj)
		const signature = createHmac('sha256', senderSecret)
			.update(bodyString)
			.digest('hex')

		await fetch(webhookUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-webhook-signature': signature
			},
			body: bodyString
		})

		const req = receivedRequests[0]!
		const receivedSig = req.headers['x-webhook-signature']
		const recomputedWithWrongSecret = createHmac('sha256', receiverSecret)
			.update(req.body)
			.digest('hex')

		expect(receivedSig).not.toBe(recomputedWithWrongSecret)
	})

	it('tampered body fails signature verification', async () => {
		const secret = 'tamper-test-secret'
		const bodyObj = {
			event: 'screenshot.completed',
			data: { credits: 5 },
			timestamp: new Date().toISOString()
		}
		const bodyString = JSON.stringify(bodyObj)
		const signature = createHmac('sha256', secret)
			.update(bodyString)
			.digest('hex')

		await fetch(webhookUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-webhook-signature': signature
			},
			body: bodyString
		})

		const req = receivedRequests[0]!

		const tamperedBody = JSON.stringify({
			...JSON.parse(req.body),
			data: { credits: 999 }
		})
		const recomputed = createHmac('sha256', secret)
			.update(tamperedBody)
			.digest('hex')

		expect(req.headers['x-webhook-signature']).not.toBe(recomputed)
	})
})
