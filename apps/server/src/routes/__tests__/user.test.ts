import { beforeEach, describe, expect, it } from 'bun:test'
import { Elysia } from 'elysia'

let balance = 0

const mockProfile = {
	id: 'user-123',
	email: 'test@example.com',
	displayName: null as string | null,
	createdAt: null as string | null
}

const mockSubscription = {
	plan: 'free',
	status: 'active',
	billingCycle: 'monthly',
	screenshotsPerMonth: 200,
	screenshotsUsedThisMonth: 0,
	overageScreenshots: 0,
	currentPeriodEnd: new Date().toISOString()
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
		subscription: mockSubscription,
		createdAt: mockProfile.createdAt
	}))

const AUTH = { 'x-test-auth': 'true' }

describe('User routes', () => {
	beforeEach(() => {
		balance = 42
	})

	it('returns user profile with correct shape', async () => {
		const res = await app.handle(
			new Request('http://localhost/user/me', { headers: AUTH })
		)
		expect(res.status).toBe(200)
		const body = await res.json()
		expect(body.id).toBe('user-123')
		expect(body.email).toBe('test@example.com')
		expect(body.displayName).toBeNull()
		expect(body.createdAt).toBeNull()
	})

	it('includes credit balance', async () => {
		const res = await app.handle(
			new Request('http://localhost/user/me', { headers: AUTH })
		)
		const body = await res.json()
		expect(body.balance).toBe(42)
	})

	it('includes subscription info', async () => {
		const res = await app.handle(
			new Request('http://localhost/user/me', { headers: AUTH })
		)
		const body = await res.json()
		expect(body.subscription).toEqual({
			plan: 'free',
			status: 'active',
			billingCycle: 'monthly',
			screenshotsPerMonth: 200,
			screenshotsUsedThisMonth: 0,
			overageScreenshots: 0,
			currentPeriodEnd: expect.any(String)
		})
	})

	it('returns 401 without auth', async () => {
		const res = await app.handle(new Request('http://localhost/user/me'))
		expect(res.status).toBe(401)
	})
})
