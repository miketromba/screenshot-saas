import { beforeEach, describe, expect, it, mock } from 'bun:test'

const MOCK_API_KEY_ROW = {
	id: 'e2e-key-uuid',
	userId: '00000000-0000-0000-0000-e2e000000001',
	name: 'E2E Test Key',
	keyPrefix: 'sk_live_e2e_',
	keyHash: 'e2e_test_hash',
	lastUsedAt: null,
	revokedAt: null,
	createdAt: new Date()
}

const mockOnConflictDoNothing = mock(() => Promise.resolve())
const mockOnConflictDoUpdate = mock(() => Promise.resolve())
const mockReturning = mock(() => Promise.resolve([MOCK_API_KEY_ROW]))
const mockValues = mock(() => ({
	onConflictDoNothing: mockOnConflictDoNothing,
	onConflictDoUpdate: mockOnConflictDoUpdate,
	returning: mockReturning
}))
const mockInsert = mock(() => ({ values: mockValues }))
const mockApiFindFirst = mock(() => MOCK_API_KEY_ROW)
const mockCreditFindFirst = mock(() => ({
	userId: '00000000-0000-0000-0000-e2e000000001',
	balance: 10000
}))

mock.module('@screenshot-saas/db', () => ({
	db: {
		insert: mockInsert,
		query: {
			apiKeys: { findFirst: mockApiFindFirst },
			creditBalances: { findFirst: mockCreditFindFirst }
		}
	},
	schema: {
		profiles: {},
		subscriptions: { userId: 'user_id' },
		creditBalances: { userId: 'user_id' },
		apiKeys: {
			userId: 'user_id',
			name: 'name',
			revokedAt: 'revoked_at'
		}
	},
	eq: mock(() => true),
	and: mock((...args: unknown[]) => args),
	isNull: mock(() => true)
}))

mock.module('../../lib/crypto', () => ({
	generateApiKey: () => 'sk_live_e2e_test_key_abc123',
	hashApiKey: async () => 'e2e_test_hash',
	getKeyPrefix: () => 'sk_live_e2e_'
}))

const { resolveE2EAuth, isE2ERequest, resetE2ECache } = await import('../e2e')

describe('E2E Service', () => {
	beforeEach(() => {
		resetE2ECache()
		delete process.env.E2E_TEST_SECRET
	})

	describe('isE2ERequest', () => {
		it('returns false when E2E_TEST_SECRET is not set', () => {
			const req = new Request('http://localhost', {
				headers: { 'x-e2e-token': 'some-token' }
			})
			expect(isE2ERequest(req)).toBe(false)
		})

		it('returns false when x-e2e-token header is missing', () => {
			process.env.E2E_TEST_SECRET = 'test-secret'
			const req = new Request('http://localhost')
			expect(isE2ERequest(req)).toBe(false)
		})

		it('returns false when token does not match secret', () => {
			process.env.E2E_TEST_SECRET = 'correct-secret'
			const req = new Request('http://localhost', {
				headers: { 'x-e2e-token': 'wrong-secret' }
			})
			expect(isE2ERequest(req)).toBe(false)
		})

		it('returns true when token matches secret', () => {
			process.env.E2E_TEST_SECRET = 'correct-secret'
			const req = new Request('http://localhost', {
				headers: { 'x-e2e-token': 'correct-secret' }
			})
			expect(isE2ERequest(req)).toBe(true)
		})
	})

	describe('resolveE2EAuth', () => {
		it('returns null when E2E_TEST_SECRET is not set', async () => {
			const req = new Request('http://localhost', {
				headers: { 'x-e2e-token': 'any-value' }
			})
			expect(await resolveE2EAuth(req)).toBeNull()
		})

		it('returns null when x-e2e-token is missing', async () => {
			process.env.E2E_TEST_SECRET = 'test-secret'
			const req = new Request('http://localhost')
			expect(await resolveE2EAuth(req)).toBeNull()
		})

		it('returns null when token does not match', async () => {
			process.env.E2E_TEST_SECRET = 'correct-secret'
			const req = new Request('http://localhost', {
				headers: { 'x-e2e-token': 'wrong-secret' }
			})
			expect(await resolveE2EAuth(req)).toBeNull()
		})

		it('returns E2E context when token matches', async () => {
			process.env.E2E_TEST_SECRET = 'correct-secret'
			const req = new Request('http://localhost', {
				headers: { 'x-e2e-token': 'correct-secret' }
			})
			const result = await resolveE2EAuth(req)

			expect(result).not.toBeNull()
			expect(result!.userId).toBe('00000000-0000-0000-0000-e2e000000001')
			expect(result!.email).toBe('e2e-test@internal.screenshotapi.dev')
			expect(result!.apiKey).toBeDefined()
			expect(result!.apiKey.id).toBe('e2e-key-uuid')
		})

		it('provisions DB rows on first call', async () => {
			process.env.E2E_TEST_SECRET = 'correct-secret'
			const req = new Request('http://localhost', {
				headers: { 'x-e2e-token': 'correct-secret' }
			})
			await resolveE2EAuth(req)

			expect(mockInsert).toHaveBeenCalled()
		})

		it('returns cached result on subsequent calls', async () => {
			process.env.E2E_TEST_SECRET = 'correct-secret'
			const makeReq = () =>
				new Request('http://localhost', {
					headers: { 'x-e2e-token': 'correct-secret' }
				})

			const first = await resolveE2EAuth(makeReq())
			const callCountAfterFirst = mockInsert.mock.calls.length

			const second = await resolveE2EAuth(makeReq())
			expect(mockInsert.mock.calls.length).toBe(callCountAfterFirst)
			expect(second).toBe(first)
		})
	})
})
