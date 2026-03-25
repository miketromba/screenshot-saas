import { beforeEach, describe, expect, it } from 'bun:test'
import { Elysia } from 'elysia'

let balance = 0
let autoTopupConfig: {
	enabled: boolean
	threshold: number
	packId: string
} | null = null

const mockProfile = {
	id: 'user-123',
	email: 'test@example.com',
	displayName: 'Test User',
	createdAt: new Date('2025-01-01').toISOString()
}

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

const app = new Elysia({ prefix: '/user' })
	.use(fakeSessionAuth)
	.get('/me', ({ user }) => ({
		id: user.id,
		email: user.email ?? mockProfile.email,
		displayName: mockProfile.displayName,
		balance,
		autoTopup: autoTopupConfig
			? {
					enabled: autoTopupConfig.enabled,
					threshold: autoTopupConfig.threshold,
					packId: autoTopupConfig.packId
				}
			: null,
		createdAt: mockProfile.createdAt
	}))

const AUTH = { 'x-test-auth': 'true' }

describe('User routes', () => {
	beforeEach(() => {
		balance = 42
		autoTopupConfig = {
			enabled: true,
			threshold: 10,
			packId: 'pack-growth'
		}
	})

	it('returns user profile with correct shape', async () => {
		const res = await app.handle(
			new Request('http://localhost/user/me', { headers: AUTH })
		)
		expect(res.status).toBe(200)
		const body = await res.json()
		expect(body.id).toBe('user-123')
		expect(body.email).toBe('test@example.com')
		expect(body.displayName).toBe('Test User')
		expect(body.createdAt).toBeDefined()
	})

	it('includes credit balance', async () => {
		const res = await app.handle(
			new Request('http://localhost/user/me', { headers: AUTH })
		)
		const body = await res.json()
		expect(body.balance).toBe(42)
	})

	it('includes auto-topup config when set', async () => {
		const res = await app.handle(
			new Request('http://localhost/user/me', { headers: AUTH })
		)
		const body = await res.json()
		expect(body.autoTopup).toEqual({
			enabled: true,
			threshold: 10,
			packId: 'pack-growth'
		})
	})

	it('returns null autoTopup when not configured', async () => {
		autoTopupConfig = null
		const res = await app.handle(
			new Request('http://localhost/user/me', { headers: AUTH })
		)
		const body = await res.json()
		expect(body.autoTopup).toBeNull()
	})

	it('returns 401 without auth', async () => {
		const res = await app.handle(new Request('http://localhost/user/me'))
		expect(res.status).toBe(401)
	})
})
