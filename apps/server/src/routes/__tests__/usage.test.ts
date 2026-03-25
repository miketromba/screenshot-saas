import { beforeEach, describe, expect, it } from 'bun:test'
import { Elysia, t } from 'elysia'

interface MockScreenshot {
	id: string
	userId: string
	url: string
	status: 'completed' | 'failed'
	durationMs: number | null
	errorMessage: string | null
	createdAt: Date
}

let screenshots: MockScreenshot[] = []

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

const app = new Elysia({ prefix: '/usage' })
	.use(fakeSessionAuth)
	.get(
		'/',
		({ user, query }) => {
			const limit = query.limit ? Number(query.limit) : 50
			const offset = query.offset ? Number(query.offset) : 0
			return screenshots
				.filter(s => s.userId === user.id)
				.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
				.slice(offset, offset + limit)
				.map(s => ({
					id: s.id,
					url: s.url,
					status: s.status,
					durationMs: s.durationMs,
					errorMessage: s.errorMessage,
					createdAt: s.createdAt
				}))
		},
		{
			query: t.Object({
				limit: t.Optional(t.String()),
				offset: t.Optional(t.String())
			})
		}
	)
	.get('/stats', ({ user }) => {
		const userScreenshots = screenshots.filter(s => s.userId === user.id)
		const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
		const total = userScreenshots.length
		const recent = userScreenshots.filter(
			s => s.createdAt >= thirtyDaysAgo
		).length
		const failed = userScreenshots.filter(s => s.status === 'failed').length
		const completed = userScreenshots.filter(
			s => s.status === 'completed' && s.durationMs != null
		)
		const avgDuration =
			completed.length > 0
				? Math.round(
						completed.reduce(
							(sum, s) => sum + (s.durationMs ?? 0),
							0
						) / completed.length
					)
				: 0
		return {
			totalScreenshots: total,
			last30Days: recent,
			failedScreenshots: failed,
			avgDurationMs: avgDuration
		}
	})

const AUTH = { 'x-test-auth': 'true' }

function seedScreenshots() {
	const now = Date.now()
	screenshots = [
		{
			id: 'ss-1',
			userId: 'user-123',
			url: 'https://example.com',
			status: 'completed',
			durationMs: 120,
			errorMessage: null,
			createdAt: new Date(now - 1000)
		},
		{
			id: 'ss-2',
			userId: 'user-123',
			url: 'https://example.org',
			status: 'completed',
			durationMs: 200,
			errorMessage: null,
			createdAt: new Date(now - 2000)
		},
		{
			id: 'ss-3',
			userId: 'user-123',
			url: 'https://bad-site.test',
			status: 'failed',
			durationMs: 50,
			errorMessage: 'Navigation timeout',
			createdAt: new Date(now - 3000)
		},
		{
			id: 'ss-4',
			userId: 'user-123',
			url: 'https://another.test',
			status: 'completed',
			durationMs: 180,
			errorMessage: null,
			createdAt: new Date(now - 4000)
		}
	]
}

describe('Usage routes', () => {
	beforeEach(() => {
		seedScreenshots()
	})

	describe('GET /usage', () => {
		it('returns screenshot log list', async () => {
			const res = await app.handle(
				new Request('http://localhost/usage', { headers: AUTH })
			)
			expect(res.status).toBe(200)
			const body = await res.json()
			expect(body).toHaveLength(4)
			expect(body[0].id).toBe('ss-1')
			expect(body[0].url).toBeDefined()
			expect(body[0].status).toBeDefined()
		})

		it('respects limit parameter', async () => {
			const res = await app.handle(
				new Request('http://localhost/usage?limit=2', {
					headers: AUTH
				})
			)
			const body = await res.json()
			expect(body).toHaveLength(2)
		})

		it('respects offset parameter', async () => {
			const res = await app.handle(
				new Request('http://localhost/usage?offset=2', {
					headers: AUTH
				})
			)
			const body = await res.json()
			expect(body).toHaveLength(2)
			expect(body[0].id).toBe('ss-3')
		})

		it('returns 401 without auth', async () => {
			const res = await app.handle(new Request('http://localhost/usage'))
			expect(res.status).toBe(401)
		})
	})

	describe('GET /usage/stats', () => {
		it('returns stats with correct shape', async () => {
			const res = await app.handle(
				new Request('http://localhost/usage/stats', {
					headers: AUTH
				})
			)
			expect(res.status).toBe(200)
			const body = await res.json()
			expect(typeof body.totalScreenshots).toBe('number')
			expect(typeof body.last30Days).toBe('number')
			expect(typeof body.failedScreenshots).toBe('number')
			expect(typeof body.avgDurationMs).toBe('number')
		})

		it('returns correct computed values', async () => {
			const res = await app.handle(
				new Request('http://localhost/usage/stats', {
					headers: AUTH
				})
			)
			const body = await res.json()
			expect(body.totalScreenshots).toBe(4)
			expect(body.last30Days).toBe(4)
			expect(body.failedScreenshots).toBe(1)
			expect(body.avgDurationMs).toBe(Math.round((120 + 200 + 180) / 3))
		})
	})
})
