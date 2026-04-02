import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { Elysia } from 'elysia'

const mockCleanExpiredCache = mock(() => Promise.resolve(5))

mock.module('../../services/cache', () => ({
	cleanExpiredCache: mockCleanExpiredCache
}))

const { cleanExpiredCache } = await import('../../services/cache')

const app = new Elysia({ prefix: '/api' }).post(
	'/cache/cleanup',
	async ({ set, request }) => {
		const secret = process.env.CACHE_CLEANUP_SECRET
		const token = request.headers
			.get('authorization')
			?.replace('Bearer ', '')
		if (!secret || token !== secret) {
			set.status = 401
			return { error: 'Unauthorized' }
		}

		const deleted = await cleanExpiredCache()
		return { deleted, timestamp: new Date().toISOString() }
	}
)

const CLEANUP_URL = 'http://localhost/api/cache/cleanup'

describe('POST /api/cache/cleanup', () => {
	beforeEach(() => {
		mockCleanExpiredCache.mockReset()
		mockCleanExpiredCache.mockReturnValue(Promise.resolve(5))
		process.env.CACHE_CLEANUP_SECRET = 'test-cleanup-secret'
	})

	it('returns 401 without authorization header', async () => {
		const res = await app.handle(
			new Request(CLEANUP_URL, { method: 'POST' })
		)
		expect(res.status).toBe(401)
		const body = await res.json()
		expect(body.error).toBe('Unauthorized')
	})

	it('returns 401 with wrong token', async () => {
		const res = await app.handle(
			new Request(CLEANUP_URL, {
				method: 'POST',
				headers: { authorization: 'Bearer wrong-secret' }
			})
		)
		expect(res.status).toBe(401)
	})

	it('returns 401 when CACHE_CLEANUP_SECRET is not set', async () => {
		delete process.env.CACHE_CLEANUP_SECRET
		const res = await app.handle(
			new Request(CLEANUP_URL, {
				method: 'POST',
				headers: { authorization: 'Bearer anything' }
			})
		)
		expect(res.status).toBe(401)
	})

	it('returns deleted count with valid token', async () => {
		const res = await app.handle(
			new Request(CLEANUP_URL, {
				method: 'POST',
				headers: {
					authorization: 'Bearer test-cleanup-secret'
				}
			})
		)
		expect(res.status).toBe(200)
		const body = await res.json()
		expect(body.deleted).toBe(5)
		expect(body.timestamp).toBeDefined()
		expect(mockCleanExpiredCache).toHaveBeenCalledTimes(1)
	})

	it('returns 0 when no expired entries exist', async () => {
		mockCleanExpiredCache.mockReturnValue(Promise.resolve(0))
		const res = await app.handle(
			new Request(CLEANUP_URL, {
				method: 'POST',
				headers: {
					authorization: 'Bearer test-cleanup-secret'
				}
			})
		)
		expect(res.status).toBe(200)
		const body = await res.json()
		expect(body.deleted).toBe(0)
	})
})
