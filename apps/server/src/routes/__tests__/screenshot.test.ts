import { beforeEach, describe, expect, it } from 'bun:test'
import { Elysia, t } from 'elysia'

let creditBalance = 0
let screenshotCounter = 0

const fakeApiKeyAuth = new Elysia({ name: 'fake-api-key-auth' })
	.derive({ as: 'scoped' }, ({ request }) => {
		const key =
			request.headers.get('x-api-key') ??
			request.headers.get('authorization')?.replace('Bearer ', '')
		if (!key) throw new Error('API_KEY_REQUIRED')
		if (!key.startsWith('sk_live_')) throw new Error('INVALID_API_KEY')
		return {
			apiKey: { id: 'key-123', userId: 'user-123', name: 'Test Key' },
			apiKeyUserId: 'user-123'
		}
	})
	.onError({ as: 'scoped' }, ({ error: err, set }) => {
		if (!(err instanceof Error)) return
		if (err.message === 'API_KEY_REQUIRED') {
			set.status = 401
			return { error: 'API key required' }
		}
		if (err.message === 'INVALID_API_KEY') {
			set.status = 403
			return { error: 'Invalid or revoked API key' }
		}
	})

const FAKE_PNG = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])

const app = new Elysia({ prefix: '/screenshot' }).use(fakeApiKeyAuth).get(
	'/',
	({ set }) => {
		if (creditBalance <= 0) {
			set.status = 402
			return {
				error: 'Insufficient credits',
				balance: 0,
				message: 'Purchase more credits'
			}
		}

		const startTime = Date.now()
		const screenshotId = `ss-${++screenshotCounter}`
		const durationMs = Date.now() - startTime
		creditBalance -= 1

		return new Response(FAKE_PNG, {
			headers: {
				'content-type': 'image/png',
				'x-credits-remaining': String(creditBalance),
				'x-screenshot-id': screenshotId,
				'x-duration-ms': String(durationMs)
			}
		})
	},
	{
		query: t.Object({
			url: t.String({ format: 'uri' }),
			width: t.Optional(t.String()),
			height: t.Optional(t.String()),
			fullPage: t.Optional(t.String()),
			type: t.Optional(t.String()),
			quality: t.Optional(t.String()),
			colorScheme: t.Optional(t.String()),
			waitUntil: t.Optional(t.String()),
			waitForSelector: t.Optional(t.String()),
			delay: t.Optional(t.String())
		})
	}
)

const API_KEY = { 'x-api-key': 'sk_live_testkey123' }
const BASE = 'http://localhost/screenshot?url=https://example.com'

describe('Screenshot routes', () => {
	beforeEach(() => {
		creditBalance = 10
		screenshotCounter = 0
	})

	it('returns 401 without API key', async () => {
		const res = await app.handle(new Request(BASE))
		expect(res.status).toBe(401)
	})

	it('returns 403 with invalid API key', async () => {
		const res = await app.handle(
			new Request(BASE, { headers: { 'x-api-key': 'bad_key_123' } })
		)
		expect(res.status).toBe(403)
	})

	it('returns 402 when no credits remain', async () => {
		creditBalance = 0
		const res = await app.handle(new Request(BASE, { headers: API_KEY }))
		expect(res.status).toBe(402)
		const body = await res.json()
		expect(body.error).toBe('Insufficient credits')
		expect(body.balance).toBe(0)
	})

	it('returns 200 with image data for valid request', async () => {
		const res = await app.handle(new Request(BASE, { headers: API_KEY }))
		expect(res.status).toBe(200)
		const buffer = await res.arrayBuffer()
		expect(buffer.byteLength).toBeGreaterThan(0)
	})

	it('returns 422 when url parameter is missing', async () => {
		const res = await app.handle(
			new Request('http://localhost/screenshot', { headers: API_KEY })
		)
		expect(res.status).toBe(422)
	})

	it('includes x-credits-remaining header', async () => {
		const res = await app.handle(new Request(BASE, { headers: API_KEY }))
		expect(res.status).toBe(200)
		expect(res.headers.get('x-credits-remaining')).toBe('9')
	})

	it('includes x-screenshot-id header', async () => {
		const res = await app.handle(new Request(BASE, { headers: API_KEY }))
		expect(res.status).toBe(200)
		expect(res.headers.get('x-screenshot-id')).toBeTruthy()
		expect(res.headers.get('x-screenshot-id')).toStartWith('ss-')
	})

	it('includes x-duration-ms header', async () => {
		const res = await app.handle(new Request(BASE, { headers: API_KEY }))
		expect(res.status).toBe(200)
		const ms = res.headers.get('x-duration-ms')
		expect(ms).toBeDefined()
		expect(Number(ms)).toBeGreaterThanOrEqual(0)
	})
})
