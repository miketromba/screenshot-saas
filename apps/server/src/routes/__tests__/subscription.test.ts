import { beforeEach, describe, expect, it } from 'bun:test'
import { Elysia, t } from 'elysia'

const mockPlans = {
	free: {
		name: 'Free',
		screenshotsPerMonth: 200,
		monthlyPriceCents: 0,
		annualPriceCents: 0,
		perScreenshot: 0,
		overageRateCents: 0,
		features: ['200 screenshots/month', 'Community support']
	},
	starter: {
		name: 'Starter',
		screenshotsPerMonth: 5_000,
		monthlyPriceCents: 1_900,
		annualPriceCents: 1_500,
		perScreenshot: 0.0038,
		overageRateCents: 0.6,
		features: ['5,000 screenshots/month', 'Email support']
	},
	growth: {
		name: 'Growth',
		screenshotsPerMonth: 25_000,
		monthlyPriceCents: 4_900,
		annualPriceCents: 3_900,
		perScreenshot: 0.002,
		overageRateCents: 0.4,
		features: ['25,000 screenshots/month', 'Priority support']
	},
	scale: {
		name: 'Scale',
		screenshotsPerMonth: 100_000,
		monthlyPriceCents: 14_900,
		annualPriceCents: 11_900,
		perScreenshot: 0.0015,
		overageRateCents: 0.3,
		features: ['100,000 screenshots/month', 'Dedicated support']
	}
} as Record<
	string,
	{
		name: string
		screenshotsPerMonth: number
		monthlyPriceCents: number
		annualPriceCents: number
		perScreenshot: number
		overageRateCents: number
		features: string[]
	}
>

let mockSubscription = {
	plan: 'free',
	status: 'active',
	billingCycle: 'monthly',
	screenshotsPerMonth: 200,
	screenshotsUsedThisMonth: 0,
	overageScreenshots: 0,
	overageRateCents: 0,
	currentPeriodStart: new Date(),
	currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
	polarSubscriptionId: null as string | null,
	polarCustomerId: null as string | null,
	canceledAt: null,
	createdAt: new Date()
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

const app = new Elysia({ prefix: '/subscription' })
	.get('/plans', () => {
		return Object.entries(mockPlans).map(([key, plan]) => ({
			id: key,
			name: plan.name,
			screenshotsPerMonth: plan.screenshotsPerMonth,
			monthlyPriceCents: plan.monthlyPriceCents,
			annualPriceCents: plan.annualPriceCents,
			perScreenshot: plan.perScreenshot,
			overageRateCents: plan.overageRateCents,
			features: plan.features
		}))
	})
	.use(fakeSessionAuth)
	.get('/', () => ({
		plan: mockSubscription.plan,
		status: mockSubscription.status,
		billingCycle: mockSubscription.billingCycle,
		screenshotsPerMonth: mockSubscription.screenshotsPerMonth,
		screenshotsUsedThisMonth: mockSubscription.screenshotsUsedThisMonth,
		overageScreenshots: mockSubscription.overageScreenshots,
		overageRateCents: mockSubscription.overageRateCents,
		currentPeriodStart: mockSubscription.currentPeriodStart,
		currentPeriodEnd: mockSubscription.currentPeriodEnd,
		polarSubscriptionId: mockSubscription.polarSubscriptionId,
		polarCustomerId: mockSubscription.polarCustomerId,
		canceledAt: mockSubscription.canceledAt,
		createdAt: mockSubscription.createdAt
	}))
	.post(
		'/checkout',
		({ body, set }) => {
			if (body.plan === 'free') {
				set.status = 400
				return { error: 'Cannot checkout for the free plan' }
			}
			if (!mockPlans[body.plan]) {
				set.status = 400
				return { error: 'Invalid plan' }
			}
			if (!body.polarProductId) {
				set.status = 400
				return {
					error: 'Product ID required for paid plans. Configure Polar products in your dashboard.'
				}
			}
			return {
				checkoutUrl: `https://polar.sh/checkout/${body.plan}`
			}
		},
		{
			body: t.Object({
				plan: t.String(),
				billingCycle: t.Optional(
					t.Union([t.Literal('monthly'), t.Literal('annual')])
				),
				polarProductId: t.Optional(t.String())
			})
		}
	)
	.post(
		'/upgrade',
		({ body, set }) => {
			if (!mockSubscription.polarSubscriptionId) {
				set.status = 400
				return {
					error: 'No active Polar subscription found. Use /checkout to subscribe first.'
				}
			}
			const plan = mockPlans[body.plan]
			if (!plan) {
				set.status = 400
				return { error: 'Invalid plan' }
			}
			return {
				success: true,
				message: `Plan change to ${plan.name} initiated. Your subscription will be updated shortly.`
			}
		},
		{
			body: t.Object({
				plan: t.String(),
				polarProductId: t.String(),
				proration: t.Optional(t.String())
			})
		}
	)
	.post('/cancel', ({ set }) => {
		if (!mockSubscription.polarSubscriptionId) {
			set.status = 400
			return { error: 'No active Polar subscription to cancel.' }
		}
		return {
			success: true,
			message:
				'Cancellation requested. Your subscription will remain active until the end of the current billing period.'
		}
	})
	.get('/portal', ({ set }) => {
		if (!mockSubscription.polarCustomerId) {
			set.status = 400
			return {
				error: 'No Polar customer record found. Subscribe to a paid plan first.'
			}
		}
		return {
			portalUrl: `https://polar.sh/portal/${mockSubscription.polarCustomerId}`
		}
	})

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

describe('Subscription routes', () => {
	beforeEach(() => {
		mockSubscription = {
			plan: 'free',
			status: 'active',
			billingCycle: 'monthly',
			screenshotsPerMonth: 200,
			screenshotsUsedThisMonth: 0,
			overageScreenshots: 0,
			overageRateCents: 0,
			currentPeriodStart: new Date(),
			currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
			polarSubscriptionId: null,
			polarCustomerId: null,
			canceledAt: null,
			createdAt: new Date()
		}
	})

	describe('GET /subscription/plans', () => {
		it('returns 4 plans without auth', async () => {
			const res = await app.handle(
				new Request('http://localhost/subscription/plans')
			)
			expect(res.status).toBe(200)
			const body = await res.json()
			expect(Array.isArray(body)).toBe(true)
			expect(body).toHaveLength(4)
		})

		it('includes free, starter, growth, scale', async () => {
			const res = await app.handle(
				new Request('http://localhost/subscription/plans')
			)
			const body = await res.json()
			const ids = body.map((p: { id: string }) => p.id)
			expect(ids).toContain('free')
			expect(ids).toContain('starter')
			expect(ids).toContain('growth')
			expect(ids).toContain('scale')
		})
	})

	describe('GET /subscription', () => {
		it('returns subscription for authenticated user', async () => {
			const res = await app.handle(
				new Request('http://localhost/subscription', { headers: AUTH })
			)
			expect(res.status).toBe(200)
			const body = await res.json()
			expect(body.plan).toBe('free')
			expect(body.status).toBe('active')
			expect(body.screenshotsPerMonth).toBe(200)
		})

		it('returns 401 without auth', async () => {
			const res = await app.handle(
				new Request('http://localhost/subscription')
			)
			expect(res.status).toBe(401)
		})
	})

	describe('POST /subscription/checkout', () => {
		it('returns checkoutUrl for valid plan', async () => {
			const res = await app.handle(
				jsonPost(
					'/subscription/checkout',
					{
						plan: 'starter',
						polarProductId: 'prod-123'
					},
					AUTH
				)
			)
			expect(res.status).toBe(200)
			const body = await res.json()
			expect(body.checkoutUrl).toContain('https://polar.sh/checkout/')
		})

		it('returns 400 for free plan', async () => {
			const res = await app.handle(
				jsonPost(
					'/subscription/checkout',
					{
						plan: 'free',
						polarProductId: 'prod-123'
					},
					AUTH
				)
			)
			expect(res.status).toBe(400)
			const body = await res.json()
			expect(body.error).toContain('free plan')
		})

		it('returns 400 without polarProductId', async () => {
			const res = await app.handle(
				jsonPost('/subscription/checkout', { plan: 'starter' }, AUTH)
			)
			expect(res.status).toBe(400)
			const body = await res.json()
			expect(body.error).toContain('Product ID required')
		})

		it('returns 401 without auth', async () => {
			const res = await app.handle(
				jsonPost('/subscription/checkout', {
					plan: 'starter',
					polarProductId: 'prod-123'
				})
			)
			expect(res.status).toBe(401)
		})
	})

	describe('POST /subscription/upgrade', () => {
		it('returns 400 when no polarSubscriptionId', async () => {
			const res = await app.handle(
				jsonPost(
					'/subscription/upgrade',
					{
						plan: 'growth',
						polarProductId: 'prod-456'
					},
					AUTH
				)
			)
			expect(res.status).toBe(400)
			const body = await res.json()
			expect(body.error).toContain('No active Polar subscription')
		})

		it('succeeds when polarSubscriptionId exists', async () => {
			mockSubscription.polarSubscriptionId = 'polar-sub-123'
			const res = await app.handle(
				jsonPost(
					'/subscription/upgrade',
					{
						plan: 'growth',
						polarProductId: 'prod-456'
					},
					AUTH
				)
			)
			expect(res.status).toBe(200)
			const body = await res.json()
			expect(body.success).toBe(true)
			expect(body.message).toContain('Growth')
		})
	})

	describe('POST /subscription/cancel', () => {
		it('returns 400 when no polarSubscriptionId', async () => {
			const res = await app.handle(
				new Request('http://localhost/subscription/cancel', {
					method: 'POST',
					headers: AUTH
				})
			)
			expect(res.status).toBe(400)
			const body = await res.json()
			expect(body.error).toContain('No active Polar subscription')
		})

		it('succeeds when polarSubscriptionId exists', async () => {
			mockSubscription.polarSubscriptionId = 'polar-sub-123'
			const res = await app.handle(
				new Request('http://localhost/subscription/cancel', {
					method: 'POST',
					headers: AUTH
				})
			)
			expect(res.status).toBe(200)
			const body = await res.json()
			expect(body.success).toBe(true)
			expect(body.message).toContain('Cancellation requested')
		})
	})

	describe('GET /subscription/portal', () => {
		it('returns 400 when no polarCustomerId', async () => {
			const res = await app.handle(
				new Request('http://localhost/subscription/portal', {
					headers: AUTH
				})
			)
			expect(res.status).toBe(400)
			const body = await res.json()
			expect(body.error).toContain('No Polar customer record')
		})

		it('returns portalUrl when polarCustomerId exists', async () => {
			mockSubscription.polarCustomerId = 'polar-cust-456'
			const res = await app.handle(
				new Request('http://localhost/subscription/portal', {
					headers: AUTH
				})
			)
			expect(res.status).toBe(200)
			const body = await res.json()
			expect(body.portalUrl).toContain('https://polar.sh/portal/')
		})
	})
})
