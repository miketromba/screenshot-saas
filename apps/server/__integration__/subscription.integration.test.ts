process.env.DATABASE_URL =
	'postgresql://postgres:postgres@localhost:5432/screenshot-saas-test'

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'bun:test'
import { eq, sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const { schema } = await import('@screenshot-saas/db')

const testClient = postgres(process.env.DATABASE_URL!)
const testDb = drizzle(testClient, { schema })

const {
	getSubscription,
	getOrCreateSubscription,
	checkScreenshotAllowance,
	recordScreenshotUsage,
	updateSubscriptionPlan,
	cancelSubscription,
	resetMonthlyUsage
} = await import('../src/services/subscription')
const { getBalance, initializeCredits, addCredits } = await import(
	'../src/services/credits'
)
const { getCachedScreenshot, setCachedScreenshot, cleanExpiredCache } =
	await import('../src/services/cache')

const testUserId = crypto.randomUUID()

beforeAll(async () => {
	await testDb.insert(schema.profiles).values({
		id: testUserId,
		email: 'test@example.com',
		displayName: 'Test User'
	})
})

beforeEach(async () => {
	await testDb
		.delete(schema.subscriptions)
		.where(sql`user_id = ${testUserId}`)
	await testDb
		.delete(schema.creditBalances)
		.where(sql`user_id = ${testUserId}`)
	await testDb
		.delete(schema.creditTransactions)
		.where(sql`user_id = ${testUserId}`)
	await testDb.delete(schema.screenshotCache)
})

afterAll(async () => {
	await testDb.delete(schema.screenshots).where(sql`user_id = ${testUserId}`)
	await testDb
		.delete(schema.subscriptions)
		.where(sql`user_id = ${testUserId}`)
	await testDb
		.delete(schema.creditBalances)
		.where(sql`user_id = ${testUserId}`)
	await testDb
		.delete(schema.creditTransactions)
		.where(sql`user_id = ${testUserId}`)
	await testDb.delete(schema.profiles).where(sql`id = ${testUserId}`)
	await testDb.delete(schema.screenshotCache)
	await testClient.end()
})

describe(
	'subscription lifecycle',
	() => {
		it('getOrCreateSubscription creates a free plan with 200 screenshots/month', async () => {
			const sub = await getOrCreateSubscription(testUserId)

			expect(sub.plan).toBe('free')
			expect(sub.status).toBe('active')
			expect(sub.screenshotsPerMonth).toBe(200)
			expect(sub.screenshotsUsedThisMonth).toBe(0)
			expect(sub.billingCycle).toBe('monthly')
		})

		it('getSubscription returns the created subscription', async () => {
			await getOrCreateSubscription(testUserId)

			const sub = await getSubscription(testUserId)

			expect(sub).not.toBeNull()
			expect(sub!.userId).toBe(testUserId)
			expect(sub!.plan).toBe('free')
		})

		it('checkScreenshotAllowance returns allowed with 200 remaining for fresh free plan', async () => {
			await getOrCreateSubscription(testUserId)

			const allowance = await checkScreenshotAllowance(testUserId)

			expect(allowance.allowed).toBe(true)
			expect(allowance.remainingInPlan).toBe(200)
			expect(allowance.source).toBe('subscription')
		})

		it('recordScreenshotUsage increments screenshotsUsedThisMonth', async () => {
			await getOrCreateSubscription(testUserId)

			const result = await recordScreenshotUsage(testUserId)
			expect(result.source).toBe('subscription')

			const row = await testDb.query.subscriptions.findFirst({
				where: eq(schema.subscriptions.userId, testUserId)
			})
			expect(row!.screenshotsUsedThisMonth).toBe(1)
		})

		it('free plan blocks when quota is exhausted', async () => {
			await getOrCreateSubscription(testUserId)

			await testDb
				.update(schema.subscriptions)
				.set({ screenshotsUsedThisMonth: 200 })
				.where(eq(schema.subscriptions.userId, testUserId))

			const allowance = await checkScreenshotAllowance(testUserId)

			expect(allowance.allowed).toBe(false)
			expect(allowance.remainingInPlan).toBe(0)
		})

		it('updateSubscriptionPlan upgrades to starter with 5000 screenshots', async () => {
			const sub = await updateSubscriptionPlan({
				userId: testUserId,
				plan: 'starter',
				billingCycle: 'monthly'
			})

			expect(sub.plan).toBe('starter')
			expect(sub.screenshotsPerMonth).toBe(5000)
			expect(sub.status).toBe('active')

			const row = await testDb.query.subscriptions.findFirst({
				where: eq(schema.subscriptions.userId, testUserId)
			})
			expect(row!.plan).toBe('starter')
			expect(row!.screenshotsPerMonth).toBe(5000)
		})

		it('after upgrade checkScreenshotAllowance returns allowed with 5000 remaining', async () => {
			await updateSubscriptionPlan({
				userId: testUserId,
				plan: 'starter',
				billingCycle: 'monthly'
			})

			const allowance = await checkScreenshotAllowance(testUserId)

			expect(allowance.allowed).toBe(true)
			expect(allowance.remainingInPlan).toBe(5000)
			expect(allowance.source).toBe('subscription')
		})

		it('cancelSubscription sets status to canceled', async () => {
			await getOrCreateSubscription(testUserId)

			const canceled = await cancelSubscription(testUserId)

			expect(canceled).not.toBeNull()
			expect(canceled!.status).toBe('canceled')
			expect(canceled!.canceledAt).toBeInstanceOf(Date)

			const row = await testDb.query.subscriptions.findFirst({
				where: eq(schema.subscriptions.userId, testUserId)
			})
			expect(row!.status).toBe('canceled')
		})
	},
	{ timeout: 30_000 }
)

describe(
	'credit system',
	() => {
		it('initializeCredits creates a balance row with 0', async () => {
			await initializeCredits(testUserId)

			const row = await testDb.query.creditBalances.findFirst({
				where: eq(schema.creditBalances.userId, testUserId)
			})
			expect(row).not.toBeUndefined()
			expect(row!.balance).toBe(0)
		})

		it('addCredits adds credits and creates a transaction record', async () => {
			await initializeCredits(testUserId)

			const newBalance = await addCredits({
				userId: testUserId,
				amount: 50,
				type: 'purchase',
				description: 'Test credit purchase'
			})

			expect(newBalance).toBe(50)

			const txns = await testDb.query.creditTransactions.findMany({
				where: eq(schema.creditTransactions.userId, testUserId)
			})
			const purchaseTxn = txns.find(t => t.type === 'purchase')
			expect(purchaseTxn).toBeDefined()
			expect(purchaseTxn!.amount).toBe(50)
			expect(purchaseTxn!.description).toBe('Test credit purchase')
		})

		it('getBalance returns the correct amount after adding credits', async () => {
			await initializeCredits(testUserId)
			await addCredits({
				userId: testUserId,
				amount: 25,
				type: 'purchase',
				description: 'First batch'
			})
			await addCredits({
				userId: testUserId,
				amount: 15,
				type: 'purchase',
				description: 'Second batch'
			})

			const balance = await getBalance(testUserId)

			expect(balance).toBe(40)
		})

		it('credits are consumed when plan quota is exhausted', async () => {
			await getOrCreateSubscription(testUserId)
			await initializeCredits(testUserId)
			await addCredits({
				userId: testUserId,
				amount: 5,
				type: 'purchase',
				description: 'Test credits'
			})

			await testDb
				.update(schema.subscriptions)
				.set({ screenshotsUsedThisMonth: 200 })
				.where(eq(schema.subscriptions.userId, testUserId))

			const result = await recordScreenshotUsage(testUserId)
			expect(result.source).toBe('credits')

			const row = await testDb.query.creditBalances.findFirst({
				where: eq(schema.creditBalances.userId, testUserId)
			})
			expect(row!.balance).toBe(4)
		})
	},
	{ timeout: 30_000 }
)

describe(
	'subscription + credits interaction',
	() => {
		it('uses credits when free plan quota is exhausted', async () => {
			await getOrCreateSubscription(testUserId)
			await initializeCredits(testUserId)

			await testDb
				.update(schema.subscriptions)
				.set({ screenshotsUsedThisMonth: 200 })
				.where(eq(schema.subscriptions.userId, testUserId))

			await addCredits({
				userId: testUserId,
				amount: 10,
				type: 'purchase',
				description: 'Credit pack'
			})

			const allowance = await checkScreenshotAllowance(testUserId)
			expect(allowance.allowed).toBe(true)
			expect(allowance.source).toBe('credits')
			expect(allowance.remainingInPlan).toBe(0)
			expect(allowance.creditBalance).toBe(10)

			const result = await recordScreenshotUsage(testUserId)
			expect(result.source).toBe('credits')

			const balance = await getBalance(testUserId)
			expect(balance).toBe(9)
		})
	},
	{ timeout: 30_000 }
)

describe(
	'overage on paid plans',
	() => {
		it('paid plan allows overage when quota is exhausted', async () => {
			await updateSubscriptionPlan({
				userId: testUserId,
				plan: 'starter',
				billingCycle: 'monthly'
			})

			await testDb
				.update(schema.subscriptions)
				.set({ screenshotsUsedThisMonth: 5000 })
				.where(eq(schema.subscriptions.userId, testUserId))

			const allowance = await checkScreenshotAllowance(testUserId)
			expect(allowance.allowed).toBe(true)
			expect(allowance.remainingInPlan).toBe(0)
			expect(allowance.source).toBe('subscription')
		})

		it('recordScreenshotUsage increments overageScreenshots on paid plan', async () => {
			await updateSubscriptionPlan({
				userId: testUserId,
				plan: 'starter',
				billingCycle: 'monthly'
			})

			await testDb
				.update(schema.subscriptions)
				.set({ screenshotsUsedThisMonth: 5000 })
				.where(eq(schema.subscriptions.userId, testUserId))

			const result = await recordScreenshotUsage(testUserId)
			expect(result.source).toBe('overage')
			expect(result.overageCount).toBe(1)

			const row = await testDb.query.subscriptions.findFirst({
				where: eq(schema.subscriptions.userId, testUserId)
			})
			expect(row!.overageScreenshots).toBe(1)
			expect(row!.screenshotsUsedThisMonth).toBe(5001)
		})
	},
	{ timeout: 30_000 }
)

describe(
	'cache service',
	() => {
		it('getCachedScreenshot returns null for non-existent key', async () => {
			const result = await getCachedScreenshot('nonexistent-key')
			expect(result).toBeNull()
		})

		it('setCachedScreenshot stores data and getCachedScreenshot retrieves it', async () => {
			await setCachedScreenshot({
				cacheKey: 'test-cache-key',
				imageData: 'base64-image-data',
				contentType: 'image/png',
				url: 'https://example.com',
				optionsHash: 'hash123',
				ttlSeconds: 3600
			})

			const result = await getCachedScreenshot('test-cache-key')
			expect(result).not.toBeNull()
			expect(result!.imageData).toBe('base64-image-data')
			expect(result!.contentType).toBe('image/png')
		})

		it('expired cache entries are not returned', async () => {
			await setCachedScreenshot({
				cacheKey: 'expiring-key',
				imageData: 'ephemeral-data',
				contentType: 'image/png',
				url: 'https://example.com',
				optionsHash: 'hash456',
				ttlSeconds: 1
			})

			const before = await getCachedScreenshot('expiring-key')
			expect(before).not.toBeNull()

			await new Promise(resolve => setTimeout(resolve, 2000))

			const after = await getCachedScreenshot('expiring-key')
			expect(after).toBeNull()
		})

		it('cleanExpiredCache removes expired entries', async () => {
			await testDb.insert(schema.screenshotCache).values({
				cacheKey: 'expired-clean-key',
				imageData: 'old-data',
				contentType: 'image/png',
				url: 'https://example.com',
				optionsHash: 'hash789',
				ttlSeconds: 1,
				expiresAt: new Date(Date.now() - 60_000)
			})

			const count = await cleanExpiredCache()
			expect(count).toBeGreaterThanOrEqual(1)

			const row = await testDb.query.screenshotCache.findFirst({
				where: eq(schema.screenshotCache.cacheKey, 'expired-clean-key')
			})
			expect(row).toBeUndefined()
		})
	},
	{ timeout: 30_000 }
)

describe(
	'monthly usage reset',
	() => {
		it('resets screenshotsUsedThisMonth and advances period dates', async () => {
			await getOrCreateSubscription(testUserId)

			const pastPeriodStart = new Date('2026-02-01T00:00:00Z')
			const pastPeriodEnd = new Date('2026-03-01T00:00:00Z')

			await testDb
				.update(schema.subscriptions)
				.set({
					screenshotsUsedThisMonth: 100,
					overageScreenshots: 5,
					currentPeriodStart: pastPeriodStart,
					currentPeriodEnd: pastPeriodEnd
				})
				.where(eq(schema.subscriptions.userId, testUserId))

			await resetMonthlyUsage()

			const row = await testDb.query.subscriptions.findFirst({
				where: eq(schema.subscriptions.userId, testUserId)
			})

			expect(row!.screenshotsUsedThisMonth).toBe(0)
			expect(row!.overageScreenshots).toBe(0)
			expect(row!.currentPeriodEnd.getTime()).toBeGreaterThan(Date.now())
			expect(row!.currentPeriodStart.getTime()).toBeGreaterThan(
				pastPeriodStart.getTime()
			)
		})
	},
	{ timeout: 30_000 }
)
