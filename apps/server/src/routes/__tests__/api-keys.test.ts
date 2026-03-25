import { beforeEach, describe, expect, it } from 'bun:test'
import { Elysia, t } from 'elysia'

interface MockApiKey {
	id: string
	userId: string
	name: string
	keyPrefix: string
	lastUsedAt: Date | null
	createdAt: Date
	revokedAt: Date | null
}

let store: MockApiKey[] = []
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

const app = new Elysia({ prefix: '/api-keys' })
	.use(fakeSessionAuth)
	.get('/', ({ user }) => {
		return store
			.filter(k => k.userId === user.id && !k.revokedAt)
			.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
			.map(k => ({
				id: k.id,
				name: k.name,
				keyPrefix: k.keyPrefix,
				lastUsedAt: k.lastUsedAt,
				createdAt: k.createdAt
			}))
	})
	.post(
		'/',
		({ body, user }) => {
			const rawKey = `sk_live_${crypto.randomUUID().replace(/-/g, '')}`
			const keyPrefix = rawKey.slice(0, 12)
			const id = `key-${nextId++}`
			const now = new Date()
			store.push({
				id,
				userId: user.id,
				name: body.name,
				keyPrefix,
				lastUsedAt: null,
				createdAt: now,
				revokedAt: null
			})
			return {
				id,
				name: body.name,
				key: rawKey,
				keyPrefix,
				createdAt: now
			}
		},
		{
			body: t.Object({
				name: t.String({ minLength: 1, maxLength: 100 })
			})
		}
	)
	.delete(
		'/:id',
		({ params, user, set }) => {
			const key = store.find(
				k => k.id === params.id && k.userId === user.id
			)
			if (!key) {
				set.status = 404
				return { error: 'API key not found' }
			}
			key.revokedAt = new Date()
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

describe('API key routes', () => {
	beforeEach(() => {
		store = []
		nextId = 1
	})

	describe('GET /api-keys', () => {
		it('returns empty list when no keys exist', async () => {
			const res = await app.handle(
				new Request('http://localhost/api-keys', { headers: AUTH })
			)
			expect(res.status).toBe(200)
			expect(await res.json()).toEqual([])
		})

		it('returns keys for authenticated user', async () => {
			store.push({
				id: 'key-1',
				userId: 'user-123',
				name: 'Production',
				keyPrefix: 'sk_live_abcd',
				lastUsedAt: null,
				createdAt: new Date(),
				revokedAt: null
			})
			const res = await app.handle(
				new Request('http://localhost/api-keys', { headers: AUTH })
			)
			const body = await res.json()
			expect(body).toHaveLength(1)
			expect(body[0].name).toBe('Production')
			expect(body[0].id).toBe('key-1')
		})

		it('returns 401 without auth', async () => {
			const res = await app.handle(
				new Request('http://localhost/api-keys')
			)
			expect(res.status).toBe(401)
		})
	})

	describe('POST /api-keys', () => {
		it('creates a key with valid name', async () => {
			const res = await app.handle(
				jsonPost('/api-keys', { name: 'Production' }, AUTH)
			)
			expect(res.status).toBe(200)
			const body = await res.json()
			expect(body.id).toBeDefined()
			expect(body.name).toBe('Production')
			expect(body.key).toBeDefined()
			expect(body.keyPrefix).toBeDefined()
		})

		it('generated key starts with sk_live_', async () => {
			const res = await app.handle(
				jsonPost('/api-keys', { name: 'Test' }, AUTH)
			)
			const body = await res.json()
			expect(body.key.startsWith('sk_live_')).toBe(true)
		})

		it('returns 422 for empty name', async () => {
			const res = await app.handle(
				jsonPost('/api-keys', { name: '' }, AUTH)
			)
			expect(res.status).toBe(422)
		})

		it('returns 401 without auth', async () => {
			const res = await app.handle(
				jsonPost('/api-keys', { name: 'Test' })
			)
			expect(res.status).toBe(401)
		})
	})

	describe('DELETE /api-keys/:id', () => {
		it('revokes own key', async () => {
			store.push({
				id: 'key-1',
				userId: 'user-123',
				name: 'My Key',
				keyPrefix: 'sk_live_abcd',
				lastUsedAt: null,
				createdAt: new Date(),
				revokedAt: null
			})
			const res = await app.handle(
				new Request('http://localhost/api-keys/key-1', {
					method: 'DELETE',
					headers: AUTH
				})
			)
			expect(res.status).toBe(200)
			expect(await res.json()).toEqual({ success: true })
		})

		it('returns 404 for non-existent key', async () => {
			const res = await app.handle(
				new Request('http://localhost/api-keys/nonexistent', {
					method: 'DELETE',
					headers: AUTH
				})
			)
			expect(res.status).toBe(404)
		})

		it('returns 401 without auth', async () => {
			const res = await app.handle(
				new Request('http://localhost/api-keys/key-1', {
					method: 'DELETE'
				})
			)
			expect(res.status).toBe(401)
		})
	})
})
