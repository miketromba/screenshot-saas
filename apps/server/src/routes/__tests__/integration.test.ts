import { describe, expect, it } from 'bun:test'
import { Elysia } from 'elysia'

const healthApp = new Elysia({ prefix: '/api' }).get('/health', () => ({
	status: 'ok',
	timestamp: new Date().toISOString()
}))

describe('health endpoint', () => {
	it('should return ok status', async () => {
		const res = await healthApp.handle(
			new Request('http://localhost/api/health')
		)
		const body = await res.json()
		expect(body.status).toBe('ok')
		expect(body.timestamp).toBeDefined()
	})

	it('should return 200', async () => {
		const res = await healthApp.handle(
			new Request('http://localhost/api/health')
		)
		expect(res.status).toBe(200)
	})
})

describe('screenshot route validation', () => {
	const screenshotApp = new Elysia({ prefix: '/api/v1' }).get(
		'/screenshot',
		({ query, set }) => {
			if (!query.url) {
				set.status = 400
				return { error: 'url is required' }
			}
			return { received: true, url: query.url }
		}
	)

	it('should accept valid URL parameter', async () => {
		const res = await screenshotApp.handle(
			new Request(
				'http://localhost/api/v1/screenshot?url=https://example.com'
			)
		)
		const body = await res.json()
		expect(body.received).toBe(true)
		expect(body.url).toBe('https://example.com')
	})
})
