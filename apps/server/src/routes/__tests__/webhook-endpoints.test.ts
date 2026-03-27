import { beforeEach, describe, expect, it } from 'bun:test'
import { Elysia, t } from 'elysia'

interface MockEndpoint {
	id: string
	userId: string
	url: string
	secret: string
	events: string[]
	isActive: boolean
	createdAt: Date
	updatedAt: Date
}

let endpoints: MockEndpoint[] = []
let nextId = 1

const fakeSessionAuth = new Elysia({ name: 'fake-session-auth' })
	.derive({ as: 'scoped' }, ({ request }) => {
		if (request.headers.get('x-test-auth') !== 'true') {
			throw new Error('UNAUTHORIZED')
		}
		return {
			user: { id: 'user-123', email: 'test@example.com' },
			supabase: {}
		}
	})
	.onError({ as: 'scoped' }, ({ error: err, set }) => {
		if (err instanceof Error && err.message === 'UNAUTHORIZED') {
			set.status = 401
			return { error: 'Unauthorized' }
		}
	})

const app = new Elysia({ prefix: '/webhooks' })
	.use(fakeSessionAuth)
	.get('/', ({ user }) => {
		return endpoints
			.filter(e => e.userId === user.id)
			.map(e => ({
				id: e.id,
				url: e.url,
				events: e.events,
				isActive: e.isActive,
				createdAt: e.createdAt,
				updatedAt: e.updatedAt
			}))
	})
	.post(
		'/',
		({ body, user }) => {
			const id = `whep-${nextId++}`
			const now = new Date()
			const endpoint: MockEndpoint = {
				id,
				userId: user.id,
				url: body.url,
				secret: `whsec_${crypto.randomUUID().replace(/-/g, '')}`,
				events: body.events,
				isActive: true,
				createdAt: now,
				updatedAt: now
			}
			endpoints.push(endpoint)
			return {
				id: endpoint.id,
				url: endpoint.url,
				secret: endpoint.secret,
				events: endpoint.events,
				createdAt: endpoint.createdAt
			}
		},
		{
			body: t.Object({
				url: t.String({ format: 'uri' }),
				events: t.Array(t.String())
			})
		}
	)
	.delete(
		'/:id',
		({ params, user, set }) => {
			const idx = endpoints.findIndex(
				e => e.id === params.id && e.userId === user.id
			)
			if (idx === -1) {
				set.status = 404
				return { error: 'Webhook endpoint not found' }
			}
			endpoints.splice(idx, 1)
			return { success: true }
		},
		{ params: t.Object({ id: t.String() }) }
	)

const AUTH = { 'x-test-auth': 'true' }

function jsonPost(
	path: string,
	body: unknown,
	headers: Record<string, string> = {}
) {
	return new Request(`http://localhost${path}`, {
		method: 'POST',
		headers: { 'content-type': 'application/json', ...headers },
		body: JSON.stringify(body)
	})
}

function jsonDelete(path: string, headers: Record<string, string> = {}) {
	return new Request(`http://localhost${path}`, {
		method: 'DELETE',
		headers
	})
}

describe('Webhook endpoint routes', () => {
	beforeEach(() => {
		endpoints = []
		nextId = 1
	})

	describe('GET /webhooks', () => {
		it('returns empty array initially', async () => {
			const res = await app.handle(
				new Request('http://localhost/webhooks', { headers: AUTH })
			)
			expect(res.status).toBe(200)
			const body = await res.json()
			expect(body).toEqual([])
		})

		it('returns 401 without auth', async () => {
			const res = await app.handle(
				new Request('http://localhost/webhooks')
			)
			expect(res.status).toBe(401)
		})

		it('returns created endpoints without secret', async () => {
			endpoints.push({
				id: 'whep-1',
				userId: 'user-123',
				url: 'https://example.com/hook',
				secret: 'whsec_supersecret',
				events: ['screenshot.completed'],
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date()
			})
			const res = await app.handle(
				new Request('http://localhost/webhooks', { headers: AUTH })
			)
			expect(res.status).toBe(200)
			const body = await res.json()
			expect(body).toHaveLength(1)
			expect(body[0].url).toBe('https://example.com/hook')
			expect(body[0].secret).toBeUndefined()
		})
	})

	describe('POST /webhooks', () => {
		it('creates endpoint with url and events', async () => {
			const res = await app.handle(
				jsonPost(
					'/webhooks',
					{
						url: 'https://example.com/webhook',
						events: ['screenshot.completed', 'screenshot.failed']
					},
					AUTH
				)
			)
			expect(res.status).toBe(200)
			const body = await res.json()
			expect(body.id).toBeDefined()
			expect(body.url).toBe('https://example.com/webhook')
			expect(body.events).toEqual([
				'screenshot.completed',
				'screenshot.failed'
			])
		})

		it('returns the secret in response', async () => {
			const res = await app.handle(
				jsonPost(
					'/webhooks',
					{
						url: 'https://example.com/webhook',
						events: ['screenshot.completed']
					},
					AUTH
				)
			)
			const body = await res.json()
			expect(body.secret).toBeDefined()
			expect(body.secret).toContain('whsec_')
		})

		it('returns 401 without auth', async () => {
			const res = await app.handle(
				jsonPost('/webhooks', {
					url: 'https://example.com/webhook',
					events: ['screenshot.completed']
				})
			)
			expect(res.status).toBe(401)
		})
	})

	describe('DELETE /webhooks/:id', () => {
		it('removes endpoint', async () => {
			endpoints.push({
				id: 'whep-1',
				userId: 'user-123',
				url: 'https://example.com/hook',
				secret: 'whsec_test',
				events: ['screenshot.completed'],
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date()
			})
			const res = await app.handle(jsonDelete('/webhooks/whep-1', AUTH))
			expect(res.status).toBe(200)
			const body = await res.json()
			expect(body.success).toBe(true)
			expect(endpoints).toHaveLength(0)
		})

		it('returns 404 for non-existent endpoint', async () => {
			const res = await app.handle(
				jsonDelete('/webhooks/whep-nonexistent', AUTH)
			)
			expect(res.status).toBe(404)
			const body = await res.json()
			expect(body.error).toContain('not found')
		})

		it('returns 401 without auth', async () => {
			const res = await app.handle(jsonDelete('/webhooks/whep-1'))
			expect(res.status).toBe(401)
		})
	})
})
