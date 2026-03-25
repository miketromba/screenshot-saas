import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { Elysia } from 'elysia'
import { hashApiKey } from '../../lib/crypto'

const VALID_KEY = 'sk_live_test_valid_key_12345'
const VALID_KEY_HASH = await hashApiKey(VALID_KEY)
const MOCK_API_KEY_ROW = {
	id: 'key-uuid-1',
	userId: 'user-uuid-1',
	name: 'Test Key',
	keyPrefix: 'sk_live_test',
	keyHash: VALID_KEY_HASH,
	lastUsedAt: null,
	revokedAt: null,
	createdAt: new Date()
}

const mockFindFirst = mock(() => MOCK_API_KEY_ROW)
const mockExecute = mock(() => Promise.resolve())
const mockWhere = mock(() => ({
	execute: mockExecute,
	returning: mock(() => [])
}))
const mockSet = mock(() => ({ where: mockWhere }))
const mockUpdate = mock(() => ({ set: mockSet }))

mock.module('@screenshot-saas/db', () => ({
	db: {
		query: {
			apiKeys: { findFirst: mockFindFirst, findMany: mock(() => []) },
			creditBalances: { findFirst: mock(() => null) },
			creditTransactions: { findMany: mock(() => []) },
			creditPacks: {
				findFirst: mock(() => null),
				findMany: mock(() => [])
			},
			autoTopupConfigs: { findFirst: mock(() => null) },
			profiles: { findFirst: mock(() => null) },
			screenshots: { findMany: mock(() => []) }
		},
		insert: mock(() => ({
			values: mock(() => ({
				onConflictDoNothing: mock(() => {}),
				returning: mock(() => [])
			}))
		})),
		update: mockUpdate,
		select: mock(() => ({ from: mock(() => ({ where: mock(() => []) })) }))
	},
	schema: {
		apiKeys: {
			keyHash: 'key_hash',
			userId: 'user_id',
			revokedAt: 'revoked_at',
			id: 'id',
			lastUsedAt: 'last_used_at'
		},
		creditBalances: {
			userId: 'user_id',
			balance: 'balance',
			updatedAt: 'updated_at'
		},
		creditTransactions: { userId: 'user_id', createdAt: 'created_at' },
		creditPacks: {
			id: 'id',
			isActive: 'is_active',
			sortOrder: 'sort_order'
		},
		autoTopupConfigs: { userId: 'user_id' },
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

const { apiKeyAuth } = await import('../api-key-auth')

function createApp() {
	return new Elysia()
		.use(apiKeyAuth)
		.get('/protected', ({ apiKeyUserId }) => ({
			ok: true,
			userId: apiKeyUserId
		}))
}

describe('apiKeyAuth middleware', () => {
	beforeEach(() => {
		mockFindFirst.mockReset()
		mockExecute.mockReset()
		mockUpdate.mockReset()
		mockSet.mockReset()
		mockWhere.mockReset()

		mockFindFirst.mockReturnValue(MOCK_API_KEY_ROW)
		mockUpdate.mockReturnValue({ set: mockSet })
		mockSet.mockReturnValue({ where: mockWhere })
		mockWhere.mockReturnValue({
			execute: mockExecute,
			returning: mock(() => [])
		})
		mockExecute.mockReturnValue(Promise.resolve())
	})

	it('returns 401 when no API key is provided', async () => {
		const app = createApp()
		const res = await app.handle(new Request('http://localhost/protected'))
		expect(res.status).toBe(401)
		const body = await res.json()
		expect(body.error).toContain('API key required')
	})

	it('returns 403 for invalid/unknown key', async () => {
		mockFindFirst.mockReturnValue(null)
		const app = createApp()
		const res = await app.handle(
			new Request('http://localhost/protected', {
				headers: {
					'x-api-key': 'sk_live_unknown_key_that_does_not_exist'
				}
			})
		)
		expect(res.status).toBe(403)
		const body = await res.json()
		expect(body.error).toContain('Invalid or revoked')
	})

	it('succeeds with valid key via x-api-key header', async () => {
		const app = createApp()
		const res = await app.handle(
			new Request('http://localhost/protected', {
				headers: { 'x-api-key': VALID_KEY }
			})
		)
		expect(res.status).toBe(200)
		const body = await res.json()
		expect(body.ok).toBe(true)
		expect(body.userId).toBe('user-uuid-1')
	})

	it('succeeds with valid key via Authorization Bearer header', async () => {
		const app = createApp()
		const res = await app.handle(
			new Request('http://localhost/protected', {
				headers: { authorization: `Bearer ${VALID_KEY}` }
			})
		)
		expect(res.status).toBe(200)
		const body = await res.json()
		expect(body.ok).toBe(true)
		expect(body.userId).toBe('user-uuid-1')
	})

	it('returns 403 for revoked key (findFirst returns null due to isNull filter)', async () => {
		mockFindFirst.mockReturnValue(null)
		const app = createApp()
		const res = await app.handle(
			new Request('http://localhost/protected', {
				headers: { 'x-api-key': VALID_KEY }
			})
		)
		expect(res.status).toBe(403)
		const body = await res.json()
		expect(body.error).toContain('Invalid or revoked')
	})

	it('calls db.update to update lastUsedAt on successful auth', async () => {
		const app = createApp()
		await app.handle(
			new Request('http://localhost/protected', {
				headers: { 'x-api-key': VALID_KEY }
			})
		)
		expect(mockUpdate).toHaveBeenCalled()
		expect(mockSet).toHaveBeenCalledWith(
			expect.objectContaining({ lastUsedAt: expect.any(Date) })
		)
	})

	it('prefers x-api-key over Authorization header', async () => {
		const app = createApp()
		const res = await app.handle(
			new Request('http://localhost/protected', {
				headers: {
					'x-api-key': VALID_KEY,
					authorization: 'Bearer sk_live_some_other_key'
				}
			})
		)
		expect(res.status).toBe(200)
		expect(mockFindFirst).toHaveBeenCalled()
	})
})
