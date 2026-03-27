import { beforeEach, describe, expect, it, mock } from 'bun:test'

const mockFindFirst = mock(() => null as unknown)
const mockOnConflictDoUpdate = mock(() => {})
const mockInsertValues = mock(() => ({
	onConflictDoUpdate: mockOnConflictDoUpdate
}))
const mockInsert = mock(() => ({ values: mockInsertValues }))
const mockReturning = mock(() => [] as unknown[])
const mockDeleteWhere = mock(() => ({ returning: mockReturning }))
const mockDelete = mock(() => ({ where: mockDeleteWhere }))

mock.module('@screenshot-saas/db', () => ({
	db: {
		query: { screenshotCache: { findFirst: mockFindFirst } },
		insert: mockInsert,
		delete: mockDelete
	},
	schema: {
		screenshotCache: {
			cacheKey: 'cache_key',
			expiresAt: 'expires_at',
			id: 'id'
		}
	},
	eq: mock((a: unknown, b: unknown) => ({ op: 'eq', a, b })),
	and: mock((...args: unknown[]) => ({ op: 'and', args })),
	gt: mock((a: unknown, b: unknown) => ({ op: 'gt', a, b })),
	lte: mock((a: unknown, b: unknown) => ({ op: 'lte', a, b })),
	sql: mock((strings: TemplateStringsArray, ...values: unknown[]) => ({
		strings,
		values
	}))
}))

const { getCachedScreenshot, setCachedScreenshot, cleanExpiredCache } =
	await import('../cache')

describe('getCachedScreenshot', () => {
	beforeEach(() => {
		mockFindFirst.mockReset()
	})

	it('returns null when no cache entry found', async () => {
		mockFindFirst.mockReturnValue(null)
		const result = await getCachedScreenshot('missing-key')
		expect(result).toBeNull()
	})

	it('returns imageData and contentType on cache hit', async () => {
		mockFindFirst.mockReturnValue({
			imageData: 'base64data==',
			contentType: 'image/png'
		})
		const result = await getCachedScreenshot('hit-key')
		expect(result).toEqual({
			imageData: 'base64data==',
			contentType: 'image/png'
		})
	})
})

describe('setCachedScreenshot', () => {
	beforeEach(() => {
		mockInsert.mockReset()
		mockInsertValues.mockReset()
		mockOnConflictDoUpdate.mockReset()

		mockInsert.mockReturnValue({ values: mockInsertValues })
		mockInsertValues.mockReturnValue({
			onConflictDoUpdate: mockOnConflictDoUpdate
		})
	})

	it('inserts with correct values including computed expiresAt', async () => {
		const before = Date.now()
		await setCachedScreenshot({
			cacheKey: 'k1',
			imageData: 'img',
			contentType: 'image/png',
			url: 'https://example.com',
			optionsHash: 'abc123',
			ttlSeconds: 3600
		})

		expect(mockInsert).toHaveBeenCalled()
		expect(mockInsertValues).toHaveBeenCalledWith(
			expect.objectContaining({
				cacheKey: 'k1',
				imageData: 'img',
				contentType: 'image/png',
				url: 'https://example.com',
				optionsHash: 'abc123',
				ttlSeconds: 3600
			})
		)

		const valuesArg = mockInsertValues.mock.calls[0]?.[0] as Record<
			string,
			unknown
		>
		const expiresAt = valuesArg.expiresAt as Date
		expect(expiresAt).toBeInstanceOf(Date)
		const delta = expiresAt.getTime() - before
		expect(delta).toBeGreaterThanOrEqual(3600 * 1000 - 100)
		expect(delta).toBeLessThanOrEqual(3600 * 1000 + 500)
	})

	it('uses onConflictDoUpdate to refresh existing entries', async () => {
		await setCachedScreenshot({
			cacheKey: 'k1',
			imageData: 'img',
			contentType: 'image/png',
			url: 'https://example.com',
			optionsHash: 'abc123',
			ttlSeconds: 3600
		})

		expect(mockOnConflictDoUpdate).toHaveBeenCalledWith(
			expect.objectContaining({
				target: 'cache_key',
				set: expect.objectContaining({
					imageData: 'img',
					contentType: 'image/png'
				})
			})
		)
	})

	it('defaults TTL to 86400 when not provided', async () => {
		const before = Date.now()
		await setCachedScreenshot({
			cacheKey: 'k2',
			imageData: 'img',
			contentType: 'image/webp',
			url: 'https://example.com',
			optionsHash: 'def456'
		})

		const valuesArg = mockInsertValues.mock.calls[0]?.[0] as Record<
			string,
			unknown
		>
		expect(valuesArg.ttlSeconds).toBe(86400)

		const expiresAt = valuesArg.expiresAt as Date
		const delta = expiresAt.getTime() - before
		expect(delta).toBeGreaterThanOrEqual(86400 * 1000 - 100)
		expect(delta).toBeLessThanOrEqual(86400 * 1000 + 500)
	})
})

describe('cleanExpiredCache', () => {
	beforeEach(() => {
		mockDelete.mockReset()
		mockDeleteWhere.mockReset()
		mockReturning.mockReset()

		mockDelete.mockReturnValue({ where: mockDeleteWhere })
		mockDeleteWhere.mockReturnValue({ returning: mockReturning })
	})

	it('returns count of deleted rows', async () => {
		mockReturning.mockReturnValue([{ id: '1' }, { id: '2' }, { id: '3' }])
		const count = await cleanExpiredCache()
		expect(count).toBe(3)
	})

	it('returns 0 when no expired entries', async () => {
		mockReturning.mockReturnValue([])
		const count = await cleanExpiredCache()
		expect(count).toBe(0)
	})
})
