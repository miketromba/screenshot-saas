import { beforeEach, describe, expect, it, mock } from 'bun:test'

const mockFindFirst = mock(() => null as unknown)
const mockFindMany = mock(() => [] as unknown[])
const mockOnConflictDoNothing = mock(() => {})
const mockOnConflictDoUpdate = mock(() => {})
const mockReturning = mock(() => [] as unknown[])
const mockInsertValues = mock(() => ({
	onConflictDoNothing: mockOnConflictDoNothing,
	onConflictDoUpdate: mockOnConflictDoUpdate
}))
const mockInsert = mock(() => ({ values: mockInsertValues }))
const mockUpdateWhere = mock(() => ({ returning: mockReturning }))
const mockUpdateSet = mock(() => ({ where: mockUpdateWhere }))
const mockUpdate = mock(() => ({ set: mockUpdateSet }))
const mockCreditBalanceFindFirst = mock(() => null as unknown)

mock.module('@screenshot-saas/db', () => ({
	db: {
		query: {
			subscriptions: { findFirst: mockFindFirst, findMany: mockFindMany },
			creditBalances: { findFirst: mockCreditBalanceFindFirst }
		},
		insert: mockInsert,
		update: mockUpdate
	},
	schema: {
		subscriptions: {
			userId: 'user_id',
			id: 'id',
			status: 'status',
			screenshotsUsedThisMonth: 'screenshots_used_this_month',
			overageScreenshots: 'overage_screenshots',
			currentPeriodEnd: 'current_period_end'
		},
		creditBalances: {
			userId: 'user_id',
			balance: 'balance',
			updatedAt: 'updated_at'
		},
		creditTransactions: {}
	},
	eq: mock((a: unknown, b: unknown) => ({ op: 'eq', a, b })),
	sql: mock((strings: TemplateStringsArray, ...values: unknown[]) => ({
		strings,
		values
	})),
	and: mock((...args: unknown[]) => ({ op: 'and', args })),
	lte: mock((a: unknown, b: unknown) => ({ op: 'lte', a, b }))
}))

mock.module('@screenshot-saas/config', () => ({
	FREE_MONTHLY_SCREENSHOTS: 200,
	SUBSCRIPTION_PLANS: {
		free: { screenshotsPerMonth: 200, overageRateCents: 0 },
		starter: { screenshotsPerMonth: 5000, overageRateCents: 0.6 },
		growth: { screenshotsPerMonth: 25000, overageRateCents: 0.4 },
		scale: { screenshotsPerMonth: 100000, overageRateCents: 0.3 }
	}
}))

const {
	getSubscription,
	getOrCreateSubscription,
	checkScreenshotAllowance,
	recordScreenshotUsage,
	updateSubscriptionPlan,
	cancelSubscription
} = await import('../subscription')

function makeSubscription(overrides: Record<string, unknown> = {}) {
	return {
		id: 'sub-1',
		userId: 'user-1',
		plan: 'free',
		status: 'active',
		billingCycle: 'monthly',
		screenshotsPerMonth: 200,
		screenshotsUsedThisMonth: 0,
		overageScreenshots: 0,
		overageRateCents: 0,
		currentPeriodStart: new Date('2026-03-01T00:00:00Z'),
		currentPeriodEnd: new Date('2026-04-01T00:00:00Z'),
		polarSubscriptionId: null,
		polarCustomerId: null,
		canceledAt: null,
		createdAt: new Date('2026-03-01T00:00:00Z'),
		updatedAt: new Date('2026-03-01T00:00:00Z'),
		...overrides
	}
}

function resetAllMocks() {
	mockFindFirst.mockReset()
	mockFindMany.mockReset()
	mockOnConflictDoNothing.mockReset()
	mockOnConflictDoUpdate.mockReset()
	mockReturning.mockReset()
	mockInsertValues.mockReset()
	mockInsert.mockReset()
	mockUpdateWhere.mockReset()
	mockUpdateSet.mockReset()
	mockUpdate.mockReset()
	mockCreditBalanceFindFirst.mockReset()

	mockInsert.mockReturnValue({ values: mockInsertValues })
	mockInsertValues.mockReturnValue({
		onConflictDoNothing: mockOnConflictDoNothing,
		onConflictDoUpdate: mockOnConflictDoUpdate
	})
	mockUpdate.mockReturnValue({ set: mockUpdateSet })
	mockUpdateSet.mockReturnValue({ where: mockUpdateWhere })
	mockUpdateWhere.mockReturnValue({ returning: mockReturning })
	mockReturning.mockReturnValue([])
	mockCreditBalanceFindFirst.mockReturnValue(null)
}

describe('getSubscription', () => {
	beforeEach(resetAllMocks)

	it('returns null when no subscription exists', async () => {
		mockFindFirst.mockReturnValue(undefined)
		const result = await getSubscription('user-1')
		expect(result).toBeNull()
	})

	it('returns subscription row when exists', async () => {
		const sub = makeSubscription()
		mockFindFirst.mockReturnValue(sub)
		const result = await getSubscription('user-1')
		expect(result).toEqual(sub)
	})
})

describe('getOrCreateSubscription', () => {
	beforeEach(resetAllMocks)

	it('creates free subscription when none exists', async () => {
		const sub = makeSubscription()
		mockFindFirst.mockReturnValue(sub)

		await getOrCreateSubscription('user-1')

		expect(mockInsert).toHaveBeenCalled()
		expect(mockInsertValues).toHaveBeenCalledWith(
			expect.objectContaining({
				userId: 'user-1',
				plan: 'free',
				screenshotsPerMonth: 200
			})
		)
	})

	it('returns existing subscription without creating duplicate', async () => {
		const sub = makeSubscription({
			plan: 'starter',
			screenshotsPerMonth: 5000
		})
		mockFindFirst.mockReturnValue(sub)

		const result = await getOrCreateSubscription('user-1')

		expect(result).toEqual(sub)
		expect(result.plan).toBe('starter')
	})

	it('uses onConflictDoNothing for idempotency', async () => {
		const sub = makeSubscription()
		mockFindFirst.mockReturnValue(sub)

		await getOrCreateSubscription('user-1')

		expect(mockOnConflictDoNothing).toHaveBeenCalled()
	})
})

describe('checkScreenshotAllowance', () => {
	beforeEach(resetAllMocks)

	it('returns allowed=true, source=subscription when within plan quota', async () => {
		const sub = makeSubscription({
			screenshotsUsedThisMonth: 50,
			screenshotsPerMonth: 200
		})
		mockFindFirst.mockReturnValue(sub)

		const result = await checkScreenshotAllowance('user-1')

		expect(result.allowed).toBe(true)
		expect(result.source).toBe('subscription')
	})

	it('returns correct remainingInPlan count', async () => {
		const sub = makeSubscription({
			screenshotsUsedThisMonth: 120,
			screenshotsPerMonth: 200
		})
		mockFindFirst.mockReturnValue(sub)

		const result = await checkScreenshotAllowance('user-1')

		expect(result.remainingInPlan).toBe(80)
	})

	it('returns allowed=true, source=credits when plan quota exhausted but credits available', async () => {
		const sub = makeSubscription({
			screenshotsUsedThisMonth: 200,
			screenshotsPerMonth: 200
		})
		mockFindFirst.mockReturnValue(sub)
		mockCreditBalanceFindFirst.mockReturnValue({
			userId: 'user-1',
			balance: 10
		})

		const result = await checkScreenshotAllowance('user-1')

		expect(result.allowed).toBe(true)
		expect(result.source).toBe('credits')
	})

	it('returns allowed=true, source=subscription for paid plan over quota (overage allowed)', async () => {
		const sub = makeSubscription({
			plan: 'starter',
			screenshotsUsedThisMonth: 5000,
			screenshotsPerMonth: 5000
		})
		mockFindFirst.mockReturnValue(sub)
		mockCreditBalanceFindFirst.mockReturnValue(null)

		const result = await checkScreenshotAllowance('user-1')

		expect(result.allowed).toBe(true)
		expect(result.source).toBe('subscription')
		expect(result.remainingInPlan).toBe(0)
	})

	it('returns allowed=false for free plan with no credits and quota exhausted', async () => {
		const sub = makeSubscription({
			plan: 'free',
			screenshotsUsedThisMonth: 200,
			screenshotsPerMonth: 200
		})
		mockFindFirst.mockReturnValue(sub)
		mockCreditBalanceFindFirst.mockReturnValue(null)

		const result = await checkScreenshotAllowance('user-1')

		expect(result.allowed).toBe(false)
		expect(result.remainingInPlan).toBe(0)
	})

	it('returns correct creditBalance in all cases', async () => {
		const sub = makeSubscription({
			screenshotsUsedThisMonth: 50,
			screenshotsPerMonth: 200
		})
		mockFindFirst.mockReturnValue(sub)
		mockCreditBalanceFindFirst.mockReturnValue({
			userId: 'user-1',
			balance: 42
		})

		const result = await checkScreenshotAllowance('user-1')

		expect(result.creditBalance).toBe(42)
	})
})

describe('recordScreenshotUsage', () => {
	beforeEach(resetAllMocks)

	it('increments screenshotsUsedThisMonth when within plan quota, returns source=subscription', async () => {
		const sub = makeSubscription({
			screenshotsUsedThisMonth: 10,
			screenshotsPerMonth: 200
		})
		mockFindFirst.mockReturnValue(sub)

		const result = await recordScreenshotUsage('user-1')

		expect(result.source).toBe('subscription')
		expect(mockUpdate).toHaveBeenCalled()
		expect(mockUpdateSet).toHaveBeenCalledWith(
			expect.objectContaining({ updatedAt: expect.any(Date) })
		)
	})

	it('deducts from credit balance when plan quota exhausted, returns source=credits', async () => {
		const sub = makeSubscription({
			screenshotsUsedThisMonth: 200,
			screenshotsPerMonth: 200
		})
		mockFindFirst.mockReturnValue(sub)
		mockCreditBalanceFindFirst.mockReturnValue({
			userId: 'user-1',
			balance: 5
		})
		mockReturning.mockReturnValue([{ balance: 4 }])

		const result = await recordScreenshotUsage('user-1')

		expect(result.source).toBe('credits')
	})

	it('tracks overage for paid plans over quota, returns source=overage', async () => {
		const sub = makeSubscription({
			plan: 'starter',
			screenshotsUsedThisMonth: 5000,
			screenshotsPerMonth: 5000,
			overageScreenshots: 3
		})
		mockFindFirst.mockReturnValue(sub)
		mockCreditBalanceFindFirst.mockReturnValue(null)

		const result = await recordScreenshotUsage('user-1')

		expect(result.source).toBe('overage')
		expect(result.overageCount).toBe(4)
	})

	it('creates usage transaction when deducting credits', async () => {
		const sub = makeSubscription({
			screenshotsUsedThisMonth: 200,
			screenshotsPerMonth: 200
		})
		mockFindFirst.mockReturnValue(sub)
		mockCreditBalanceFindFirst.mockReturnValue({
			userId: 'user-1',
			balance: 5
		})
		mockReturning.mockReturnValue([{ balance: 4 }])

		await recordScreenshotUsage('user-1')

		const txnCall = mockInsertValues.mock.calls.find(
			c => (c[0] as Record<string, unknown>)?.type === 'usage'
		)
		expect(txnCall).toBeDefined()
		expect((txnCall?.[0] as Record<string, unknown>).amount).toBe(-1)
		expect((txnCall?.[0] as Record<string, unknown>).description).toBe(
			'Screenshot captured'
		)
	})
})

describe('updateSubscriptionPlan', () => {
	beforeEach(resetAllMocks)

	it('creates new subscription for user without one', async () => {
		const sub = makeSubscription({
			plan: 'starter',
			screenshotsPerMonth: 5000
		})
		mockFindFirst.mockReturnValue(sub)

		await updateSubscriptionPlan({
			userId: 'user-1',
			plan: 'starter',
			billingCycle: 'monthly'
		})

		expect(mockInsert).toHaveBeenCalled()
		expect(mockInsertValues).toHaveBeenCalledWith(
			expect.objectContaining({
				userId: 'user-1',
				plan: 'starter',
				screenshotsPerMonth: 5000
			})
		)
	})

	it('updates existing subscription with upsert (onConflictDoUpdate)', async () => {
		const sub = makeSubscription({ plan: 'growth' })
		mockFindFirst.mockReturnValue(sub)

		await updateSubscriptionPlan({
			userId: 'user-1',
			plan: 'growth',
			billingCycle: 'monthly'
		})

		expect(mockOnConflictDoUpdate).toHaveBeenCalled()
	})

	it('sets correct screenshotsPerMonth from plan config', async () => {
		const sub = makeSubscription({
			plan: 'scale',
			screenshotsPerMonth: 100000
		})
		mockFindFirst.mockReturnValue(sub)

		await updateSubscriptionPlan({
			userId: 'user-1',
			plan: 'scale',
			billingCycle: 'annual'
		})

		expect(mockInsertValues).toHaveBeenCalledWith(
			expect.objectContaining({ screenshotsPerMonth: 100000 })
		)
	})

	it('sets polarSubscriptionId and polarCustomerId when provided', async () => {
		const sub = makeSubscription({
			polarSubscriptionId: 'polar-sub-1',
			polarCustomerId: 'polar-cust-1'
		})
		mockFindFirst.mockReturnValue(sub)

		await updateSubscriptionPlan({
			userId: 'user-1',
			plan: 'starter',
			billingCycle: 'monthly',
			polarSubscriptionId: 'polar-sub-1',
			polarCustomerId: 'polar-cust-1'
		})

		expect(mockInsertValues).toHaveBeenCalledWith(
			expect.objectContaining({
				polarSubscriptionId: 'polar-sub-1',
				polarCustomerId: 'polar-cust-1'
			})
		)
	})
})

describe('cancelSubscription', () => {
	beforeEach(resetAllMocks)

	it('sets status to canceled and canceledAt', async () => {
		const sub = makeSubscription()
		const canceledSub = makeSubscription({
			status: 'canceled',
			canceledAt: new Date()
		})

		let callCount = 0
		mockFindFirst.mockImplementation(() => {
			callCount++
			return callCount === 1 ? sub : canceledSub
		})

		const result = await cancelSubscription('user-1')

		expect(mockUpdate).toHaveBeenCalled()
		expect(mockUpdateSet).toHaveBeenCalledWith(
			expect.objectContaining({
				status: 'canceled',
				canceledAt: expect.any(Date)
			})
		)
		expect(result?.status).toBe('canceled')
		expect(result?.canceledAt).toBeDefined()
	})

	it('returns null when no subscription exists', async () => {
		mockFindFirst.mockReturnValue(undefined)

		const result = await cancelSubscription('user-1')

		expect(result).toBeNull()
		expect(mockUpdate).not.toHaveBeenCalled()
	})
})
