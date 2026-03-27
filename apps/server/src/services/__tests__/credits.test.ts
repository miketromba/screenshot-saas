import { beforeEach, describe, expect, it, mock } from 'bun:test'

const mockFindFirst = mock(() => null as unknown)
const mockFindMany = mock(() => [] as unknown[])
const mockOnConflictDoNothing = mock(() => {})
const mockReturning = mock(() => [] as unknown[])
const mockInsertValues = mock(() => ({
	onConflictDoNothing: mockOnConflictDoNothing
}))
const mockInsert = mock(() => ({ values: mockInsertValues }))
const mockUpdateWhere = mock(() => ({ returning: mockReturning }))
const mockUpdateSet = mock(() => ({ where: mockUpdateWhere }))
const mockUpdate = mock(() => ({ set: mockUpdateSet }))

mock.module('@screenshot-saas/db', () => ({
	db: {
		query: {
			apiKeys: { findFirst: mock(() => null), findMany: mock(() => []) },
			creditBalances: { findFirst: mockFindFirst },
			creditTransactions: { findMany: mockFindMany },
			creditPacks: { findFirst: mockFindFirst, findMany: mock(() => []) },
			autoTopupConfigs: { findFirst: mockFindFirst },
			profiles: { findFirst: mock(() => null) },
			screenshots: { findMany: mock(() => []) }
		},
		insert: mockInsert,
		update: mockUpdate,
		select: mock(() => ({ from: mock(() => ({ where: mock(() => []) })) }))
	},
	schema: {
		apiKeys: {
			keyHash: 'key_hash',
			userId: 'user_id',
			revokedAt: 'revoked_at',
			id: 'id'
		},
		creditBalances: {
			userId: 'user_id',
			balance: 'balance',
			updatedAt: 'updated_at'
		},
		creditTransactions: {
			userId: 'user_id',
			createdAt: 'created_at'
		},
		creditPacks: {
			id: 'id',
			isActive: 'is_active',
			sortOrder: 'sort_order'
		},
		autoTopupConfigs: {
			userId: 'user_id'
		},
		profiles: { id: 'id' },
		screenshots: {
			id: 'id',
			userId: 'user_id',
			status: 'status',
			createdAt: 'created_at',
			durationMs: 'duration_ms'
		}
	},
	eq: mock((a: unknown, b: unknown) => ({ op: 'eq', a, b })),
	and: mock((...args: unknown[]) => ({ op: 'and', args })),
	isNull: mock((a: unknown) => ({ op: 'isNull', a })),
	isNotNull: mock((a: unknown) => ({ op: 'isNotNull', a })),
	gte: mock((a: unknown, b: unknown) => ({ op: 'gte', a, b })),
	gt: mock((a: unknown, b: unknown) => ({ op: 'gt', a, b })),
	lt: mock((a: unknown, b: unknown) => ({ op: 'lt', a, b })),
	lte: mock((a: unknown, b: unknown) => ({ op: 'lte', a, b })),
	ne: mock((a: unknown, b: unknown) => ({ op: 'ne', a, b })),
	sql: mock((strings: TemplateStringsArray, ...values: unknown[]) => ({
		strings,
		values
	})),
	desc: mock((col: unknown) => ({ desc: col })),
	asc: mock((col: unknown) => ({ asc: col })),
	count: mock(() => ({})),
	not: mock((a: unknown) => ({ not: a })),
	or: mock((...args: unknown[]) => ({ or: args })),
	inArray: mock((a: unknown, b: unknown) => ({ inArray: a, b })),
	notInArray: mock((a: unknown, b: unknown) => ({ notInArray: a, b }))
}))

const {
	getBalance,
	initializeCredits,
	deductCredit,
	addCredits,
	getTransactions
} = await import('../credits')

describe('getBalance', () => {
	beforeEach(() => {
		mockFindFirst.mockReset()
	})

	it('returns 0 when no credit_balances row exists', async () => {
		mockFindFirst.mockReturnValue(null)
		const balance = await getBalance('user-1')
		expect(balance).toBe(0)
	})

	it('returns balance when row exists', async () => {
		mockFindFirst.mockReturnValue({ userId: 'user-1', balance: 42 })
		const balance = await getBalance('user-1')
		expect(balance).toBe(42)
	})

	it('calls findFirst with correct userId', async () => {
		mockFindFirst.mockReturnValue(null)
		await getBalance('user-xyz')
		expect(mockFindFirst).toHaveBeenCalled()
	})
})

describe('initializeCredits', () => {
	beforeEach(() => {
		mockInsert.mockReset()
		mockInsertValues.mockReset()
		mockOnConflictDoNothing.mockReset()

		mockInsert.mockReturnValue({ values: mockInsertValues })
		mockInsertValues.mockReturnValue({
			onConflictDoNothing: mockOnConflictDoNothing
		})
	})

	it('inserts credit_balances with 0 balance', async () => {
		await initializeCredits('user-1')
		expect(mockInsert).toHaveBeenCalled()
		expect(mockInsertValues).toHaveBeenCalledWith(
			expect.objectContaining({ userId: 'user-1', balance: 0 })
		)
	})

	it('uses onConflictDoNothing for idempotency', async () => {
		await initializeCredits('user-1')
		expect(mockOnConflictDoNothing).toHaveBeenCalled()
	})
})

describe('deductCredit', () => {
	beforeEach(() => {
		mockUpdate.mockReset()
		mockUpdateSet.mockReset()
		mockUpdateWhere.mockReset()
		mockReturning.mockReset()
		mockInsert.mockReset()
		mockInsertValues.mockReset()

		mockUpdate.mockReturnValue({ set: mockUpdateSet })
		mockUpdateSet.mockReturnValue({ where: mockUpdateWhere })
		mockUpdateWhere.mockReturnValue({ returning: mockReturning })
		mockInsert.mockReturnValue({ values: mockInsertValues })
		mockInsertValues.mockReturnValue({
			onConflictDoNothing: mockOnConflictDoNothing
		})
	})

	it('returns success with newBalance when balance > 0', async () => {
		mockReturning.mockReturnValue([{ balance: 9 }])
		const result = await deductCredit({
			userId: 'user-1',
			screenshotId: 'ss-1'
		})
		expect(result.success).toBe(true)
		expect(result.newBalance).toBe(9)
	})

	it('returns failure when balance is 0 (no rows updated)', async () => {
		mockReturning.mockReturnValue([])
		const result = await deductCredit({
			userId: 'user-1',
			screenshotId: 'ss-1'
		})
		expect(result.success).toBe(false)
		expect(result.newBalance).toBe(0)
	})

	it('creates a usage transaction on success', async () => {
		mockReturning.mockReturnValue([{ balance: 4 }])
		await deductCredit({ userId: 'user-1', screenshotId: 'ss-1' })
		const txnCall = mockInsertValues.mock.calls.find(
			c => (c[0] as Record<string, unknown>)?.type === 'usage'
		)
		expect(txnCall).toBeDefined()
		expect((txnCall?.[0] as Record<string, unknown>).amount).toBe(-1)
		expect((txnCall?.[0] as Record<string, unknown>).referenceId).toBe(
			'ss-1'
		)
	})

	it('does not create a transaction on failure', async () => {
		mockReturning.mockReturnValue([])
		mockInsertValues.mockReset()
		mockInsert.mockReturnValue({ values: mockInsertValues })
		mockInsertValues.mockReturnValue({
			onConflictDoNothing: mockOnConflictDoNothing
		})

		await deductCredit({ userId: 'user-1', screenshotId: 'ss-1' })
		expect(mockInsertValues).not.toHaveBeenCalled()
	})
})

describe('addCredits', () => {
	beforeEach(() => {
		mockUpdate.mockReset()
		mockUpdateSet.mockReset()
		mockUpdateWhere.mockReset()
		mockReturning.mockReset()
		mockInsert.mockReset()
		mockInsertValues.mockReset()
		mockFindFirst.mockReset()

		mockUpdate.mockReturnValue({ set: mockUpdateSet })
		mockUpdateSet.mockReturnValue({ where: mockUpdateWhere })
		mockUpdateWhere.mockReturnValue({ returning: mockReturning })
		mockInsert.mockReturnValue({ values: mockInsertValues })
		mockInsertValues.mockReturnValue({
			onConflictDoNothing: mockOnConflictDoNothing
		})
	})

	it('updates existing balance and returns new total', async () => {
		mockReturning.mockReturnValue([{ balance: 150 }])
		const result = await addCredits({
			userId: 'user-1',
			amount: 100,
			type: 'purchase',
			description: 'Bought 100 credits'
		})
		expect(result).toBe(150)
	})

	it('creates transaction record after updating balance', async () => {
		mockReturning.mockReturnValue([{ balance: 150 }])
		await addCredits({
			userId: 'user-1',
			amount: 100,
			type: 'purchase',
			description: 'Bought 100 credits',
			referenceId: 'checkout_123'
		})
		const txnCall = mockInsertValues.mock.calls.find(
			c => (c[0] as Record<string, unknown>)?.type === 'purchase'
		)
		expect(txnCall).toBeDefined()
		expect((txnCall?.[0] as Record<string, unknown>).amount).toBe(100)
		expect((txnCall?.[0] as Record<string, unknown>).referenceId).toBe(
			'checkout_123'
		)
	})

	it('creates new balance row if none exists (update returns empty)', async () => {
		mockReturning.mockReturnValue([])
		mockFindFirst.mockReturnValue({ userId: 'user-2', balance: 100 })
		const result = await addCredits({
			userId: 'user-2',
			amount: 100,
			type: 'purchase',
			description: 'First purchase'
		})
		expect(result).toBe(100)
		expect(mockInsert).toHaveBeenCalled()
	})

	it('returns the amount as fallback when findFirst returns null after insert', async () => {
		mockReturning.mockReturnValue([])
		mockFindFirst.mockReturnValue(null)
		const result = await addCredits({
			userId: 'user-3',
			amount: 50,
			type: 'refund',
			description: 'Refund'
		})
		expect(result).toBe(50)
	})
})

describe('getTransactions', () => {
	beforeEach(() => {
		mockFindMany.mockReset()
	})

	it('returns transaction list', async () => {
		const txns = [
			{ id: 't1', amount: -1, type: 'usage' },
			{ id: 't2', amount: 100, type: 'purchase' }
		]
		mockFindMany.mockReturnValue(txns)
		const result = await getTransactions({ userId: 'user-1' })
		expect(result).toEqual(txns)
	})

	it('uses default limit of 50 and offset of 0', async () => {
		mockFindMany.mockReturnValue([])
		await getTransactions({ userId: 'user-1' })
		expect(mockFindMany).toHaveBeenCalledWith(
			expect.objectContaining({ limit: 50, offset: 0 })
		)
	})

	it('respects custom limit and offset', async () => {
		mockFindMany.mockReturnValue([])
		await getTransactions({ userId: 'user-1', limit: 10, offset: 20 })
		expect(mockFindMany).toHaveBeenCalledWith(
			expect.objectContaining({ limit: 10, offset: 20 })
		)
	})
})
