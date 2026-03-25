import { describe, expect, it } from 'bun:test'
import { Elysia } from 'elysia'

const app = new Elysia({ prefix: '/api' }).get('/health', () => ({
	status: 'ok',
	timestamp: new Date().toISOString()
}))

describe('GET /api/health', () => {
	it('returns 200', async () => {
		const res = await app.handle(new Request('http://localhost/api/health'))
		expect(res.status).toBe(200)
	})

	it('returns ok status and timestamp', async () => {
		const res = await app.handle(new Request('http://localhost/api/health'))
		const body = await res.json()
		expect(body.status).toBe('ok')
		expect(body.timestamp).toBeDefined()
	})

	it('returns a valid ISO 8601 timestamp', async () => {
		const res = await app.handle(new Request('http://localhost/api/health'))
		const body: { timestamp: string } = await res.json()
		const parsed = new Date(body.timestamp)
		expect(parsed.toISOString()).toBe(body.timestamp)
	})
})
