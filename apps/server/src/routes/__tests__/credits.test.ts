import { beforeEach, describe, expect, it } from 'bun:test'
import { Elysia, t } from 'elysia'

const FREE_CREDITS = 5

interface MockTransaction {
	id: string
	userId: string
	amount: number
	type: string
	description: string
	createdAt: Date
}

let balance = 0
let transactions: MockTransaction[] = []

const mockPacks = [
	{
		id: 'pack-starter',
		name: 'Starter',
		credits: 100,
		priceCents: 500,
		isPopular: false,
		isActive: true,
		sortOrder: 0
	},
	{
		id: 'pack-growth',
		name: 'Growth',
		credits: 500,
		priceCents: 2000,
		isPopular: true,
		isActive: true,
		sortOrder: 1
	},
	{
		id: 'pack-pro',
		name: 'Pro',
		credits: 2000,
		priceCents: 6000,
		isPopular: false,
		isActive: true,
		sortOrder: 2
	}
]

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

const app = new Elysia({ prefix: '/credits' })
	.get('/packs', () => {
		return mockPacks
			.filter(p => p.isActive)
			.sort((a, b) => a.sortOrder - b.sortOrder)
			.map(p => ({
				id: p.id,
				name: p.name,
				credits: p.credits,
				priceCents: p.priceCents,
				isPopular: p.isPopular
			}))
	})
	.use(fakeSessionAuth)
	.get('/', () => ({ balance }))
	.get(
		'/transactions',
		({ query }) => {
			const limit = query.limit ? Number(query.limit) : 50
			const offset = query.offset ? Number(query.offset) : 0
			return transactions
				.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
				.slice(offset, offset + limit)
		},
		{
			query: t.Object({
				limit: t.Optional(t.String()),
				offset: t.Optional(t.String())
			})
		}
	)
	.post(
		'/purchase',
		({ body, set }) => {
			const pack = mockPacks.find(p => p.id === body.packId && p.isActive)
			if (!pack) {
				set.status = 404
				return { error: 'Credit pack not found' }
			}
			return {
				checkoutUrl: `https://polar.sh/checkout/${pack.id}`
			}
		},
		{ body: t.Object({ packId: t.String() }) }
	)
	.post('/initialize', () => {
		balance = FREE_CREDITS
		transactions.push({
			id: `txn-${Date.now()}`,
			userId: 'user-123',
			amount: FREE_CREDITS,
			type: 'signup_bonus',
			description: `Welcome bonus: ${FREE_CREDITS} free credits`,
			createdAt: new Date()
		})
		return { balance }
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

describe('Credit routes', () => {
	beforeEach(() => {
		balance = 0
		transactions = []
	})

	describe('GET /credits/packs', () => {
		it('returns packs without authentication', async () => {
			const res = await app.handle(
				new Request('http://localhost/credits/packs')
			)
			expect(res.status).toBe(200)
			const body = await res.json()
			expect(Array.isArray(body)).toBe(true)
			expect(body).toHaveLength(3)
		})

		it('packs have the correct shape', async () => {
			const res = await app.handle(
				new Request('http://localhost/credits/packs')
			)
			const body = await res.json()
			const pack = body[0]
			expect(pack.id).toBeDefined()
			expect(pack.name).toBeDefined()
			expect(typeof pack.credits).toBe('number')
			expect(typeof pack.priceCents).toBe('number')
			expect(typeof pack.isPopular).toBe('boolean')
		})
	})

	describe('GET /credits', () => {
		it('returns balance for authenticated user', async () => {
			balance = 42
			const res = await app.handle(
				new Request('http://localhost/credits', { headers: AUTH })
			)
			expect(res.status).toBe(200)
			const body = await res.json()
			expect(body.balance).toBe(42)
		})

		it('returns 401 without auth', async () => {
			const res = await app.handle(
				new Request('http://localhost/credits')
			)
			expect(res.status).toBe(401)
		})
	})

	describe('POST /credits/purchase', () => {
		it('returns checkout URL for valid pack', async () => {
			const res = await app.handle(
				jsonPost('/credits/purchase', { packId: 'pack-starter' }, AUTH)
			)
			expect(res.status).toBe(200)
			const body = await res.json()
			expect(body.checkoutUrl).toContain('https://polar.sh/checkout/')
		})

		it('returns 404 for invalid pack', async () => {
			const res = await app.handle(
				jsonPost('/credits/purchase', { packId: 'nonexistent' }, AUTH)
			)
			expect(res.status).toBe(404)
		})

		it('returns 401 without auth', async () => {
			const res = await app.handle(
				jsonPost('/credits/purchase', { packId: 'pack-starter' })
			)
			expect(res.status).toBe(401)
		})
	})

	describe('GET /credits/transactions', () => {
		it('returns transaction list', async () => {
			transactions.push(
				{
					id: 'txn-1',
					userId: 'user-123',
					amount: 100,
					type: 'purchase',
					description: 'Bought credits',
					createdAt: new Date('2025-01-01')
				},
				{
					id: 'txn-2',
					userId: 'user-123',
					amount: -1,
					type: 'usage',
					description: 'Screenshot',
					createdAt: new Date('2025-01-02')
				}
			)
			const res = await app.handle(
				new Request('http://localhost/credits/transactions', {
					headers: AUTH
				})
			)
			expect(res.status).toBe(200)
			const body = await res.json()
			expect(body).toHaveLength(2)
		})

		it('respects limit parameter', async () => {
			for (let i = 0; i < 5; i++) {
				transactions.push({
					id: `txn-${i}`,
					userId: 'user-123',
					amount: 1,
					type: 'purchase',
					description: 'test',
					createdAt: new Date(Date.now() + i)
				})
			}
			const res = await app.handle(
				new Request('http://localhost/credits/transactions?limit=2', {
					headers: AUTH
				})
			)
			const body = await res.json()
			expect(body).toHaveLength(2)
		})
	})

	describe('POST /credits/initialize', () => {
		it('initializes with free credits', async () => {
			const res = await app.handle(
				new Request('http://localhost/credits/initialize', {
					method: 'POST',
					headers: AUTH
				})
			)
			expect(res.status).toBe(200)
			const body = await res.json()
			expect(body.balance).toBe(FREE_CREDITS)
		})
	})
})
