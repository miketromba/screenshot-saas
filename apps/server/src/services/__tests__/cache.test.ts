import { beforeEach, describe, expect, it, mock } from 'bun:test'

const mockFindFirst = mock(() => null as unknown)
const mockOnConflictDoUpdate = mock(() => {})
const mockInsertValues = mock(() => ({
	onConflictDoUpdate: mockOnConflictDoUpdate
}))
const mockInsert = mock(() => ({ values: mockInsertValues }))
const mockReturning = mock(() => [] as { id: string; storagePath: string }[])
const mockDeleteWhere = mock(() => ({ returning: mockReturning }))
const mockDelete = mock(() => ({ where: mockDeleteWhere }))

const mockUpload = mock(() => Promise.resolve({ data: {}, error: null }))
const mockDownload = mock(() =>
	Promise.resolve({
		data: new Blob([new Uint8Array([137, 80, 78, 71])]),
		error: null as unknown
	})
)
const mockRemove = mock(() => Promise.resolve({ data: [], error: null }))
const mockFrom = mock(() => ({
	upload: mockUpload,
	download: mockDownload,
	remove: mockRemove
}))

mock.module('@screenshot-saas/db', () => ({
	db: {
		query: { screenshotCache: { findFirst: mockFindFirst } },
		insert: mockInsert,
		delete: mockDelete
	},
	schema: {
		screenshotCache: {
			cacheKey: 'cache_key',
			userId: 'user_id',
			expiresAt: 'expires_at',
			id: 'id',
			storagePath: 'storage_path'
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

const {
	getCachedScreenshot,
	setCachedScreenshot,
	cleanExpiredCache,
	setStorageClient
} = await import('../cache')

function resetStorageMock() {
	setStorageClient({ from: mockFrom } as unknown as Parameters<
		typeof setStorageClient
	>[0])
}

describe('getCachedScreenshot', () => {
	beforeEach(() => {
		resetStorageMock()
		mockFindFirst.mockReset()
		mockDownload.mockReset()
		mockFrom.mockReset()

		mockDownload.mockReturnValue(
			Promise.resolve({
				data: new Blob([new Uint8Array([137, 80, 78, 71])]),
				error: null as unknown
			})
		)
		mockFrom.mockReturnValue({
			upload: mockUpload,
			download: mockDownload,
			remove: mockRemove
		})
	})

	it('returns null when no cache entry found', async () => {
		mockFindFirst.mockReturnValue(null)
		const result = await getCachedScreenshot('missing-key', 'user-1')
		expect(result).toBeNull()
	})

	it('returns buffer and contentType on cache hit', async () => {
		mockFindFirst.mockReturnValue({
			storagePath: 'user-1/sc_abc123',
			contentType: 'image/png'
		})
		const result = await getCachedScreenshot('sc_abc123', 'user-1')
		expect(result).not.toBeNull()
		expect(result!.buffer).toBeInstanceOf(Buffer)
		expect(result!.contentType).toBe('image/png')
		expect(mockFrom).toHaveBeenCalledWith('screenshot-cache')
	})

	it('returns null when storage download fails', async () => {
		mockFindFirst.mockReturnValue({
			storagePath: 'user-1/sc_abc123',
			contentType: 'image/png'
		})
		mockDownload.mockReturnValue(
			Promise.resolve({ data: null, error: new Error('Not found') })
		)
		const result = await getCachedScreenshot('sc_abc123', 'user-1')
		expect(result).toBeNull()
	})
})

describe('setCachedScreenshot', () => {
	beforeEach(() => {
		resetStorageMock()
		mockInsert.mockReset()
		mockInsertValues.mockReset()
		mockOnConflictDoUpdate.mockReset()
		mockUpload.mockReset()
		mockFrom.mockReset()

		mockInsert.mockReturnValue({ values: mockInsertValues })
		mockInsertValues.mockReturnValue({
			onConflictDoUpdate: mockOnConflictDoUpdate
		})
		mockUpload.mockReturnValue(Promise.resolve({ data: {}, error: null }))
		mockFrom.mockReturnValue({
			upload: mockUpload,
			download: mockDownload,
			remove: mockRemove
		})
	})

	it('uploads to storage and inserts metadata', async () => {
		const buffer = Buffer.from('fake-image')
		await setCachedScreenshot({
			cacheKey: 'k1',
			userId: 'user-1',
			buffer,
			contentType: 'image/png',
			url: 'https://example.com',
			optionsHash: 'abc123',
			ttlSeconds: 3600
		})

		expect(mockUpload).toHaveBeenCalledWith(
			'user-1/k1',
			buffer,
			expect.objectContaining({
				contentType: 'image/png',
				upsert: true
			})
		)
		expect(mockInsert).toHaveBeenCalled()
	})

	it('throws when storage upload fails', async () => {
		mockUpload.mockReturnValue(
			Promise.resolve({
				data: null,
				error: new Error('Upload failed')
			})
		)

		await expect(
			setCachedScreenshot({
				cacheKey: 'k1',
				userId: 'user-1',
				buffer: Buffer.from('fake'),
				contentType: 'image/png',
				url: 'https://example.com',
				optionsHash: 'abc123'
			})
		).rejects.toThrow()
	})

	it('defaults TTL to 86400 when not provided', async () => {
		const before = Date.now()
		await setCachedScreenshot({
			cacheKey: 'k2',
			userId: 'user-1',
			buffer: Buffer.from('fake'),
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
		resetStorageMock()
		mockDelete.mockReset()
		mockDeleteWhere.mockReset()
		mockReturning.mockReset()
		mockRemove.mockReset()
		mockFrom.mockReset()

		mockDelete.mockReturnValue({ where: mockDeleteWhere })
		mockDeleteWhere.mockReturnValue({ returning: mockReturning })
		mockRemove.mockReturnValue(Promise.resolve({ data: [], error: null }))
		mockFrom.mockReturnValue({
			upload: mockUpload,
			download: mockDownload,
			remove: mockRemove
		})
	})

	it('deletes expired rows and removes files from storage', async () => {
		mockReturning.mockReturnValue([
			{ id: '1', storagePath: 'user-1/sc_a' },
			{ id: '2', storagePath: 'user-2/sc_b' }
		])
		const count = await cleanExpiredCache()
		expect(count).toBe(2)
		expect(mockRemove).toHaveBeenCalledWith(['user-1/sc_a', 'user-2/sc_b'])
	})

	it('returns 0 and skips storage call when no expired entries', async () => {
		mockReturning.mockReturnValue([])
		const count = await cleanExpiredCache()
		expect(count).toBe(0)
		expect(mockRemove).not.toHaveBeenCalled()
	})
})
