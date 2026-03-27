import { and, db, eq, isNull, schema } from '@screenshot-saas/db'
import { generateApiKey, getKeyPrefix, hashApiKey } from '../lib/crypto'

const E2E_USER_ID = '00000000-0000-0000-0000-e2e000000001'
const E2E_USER_EMAIL = 'e2e-test@internal.screenshotapi.dev'
const E2E_API_KEY_NAME = 'E2E Test Key'

export interface E2EResolution {
	userId: string
	email: string
	apiKey: typeof schema.apiKeys.$inferSelect
}

let cachedResolution: E2EResolution | null = null

export async function resolveE2EAuth(
	request: Request
): Promise<E2EResolution | null> {
	const secret = process.env.E2E_TEST_SECRET
	if (!secret) return null

	const token = request.headers.get('x-e2e-token')
	if (!token || token !== secret) return null

	if (cachedResolution) return cachedResolution

	await provisionTestUser()
	await provisionTestSubscription()
	await provisionTestCredits()
	const apiKey = await provisionTestApiKey()

	cachedResolution = {
		userId: E2E_USER_ID,
		email: E2E_USER_EMAIL,
		apiKey
	}

	return cachedResolution
}

export function isE2ERequest(request: Request): boolean {
	const secret = process.env.E2E_TEST_SECRET
	if (!secret) return false
	const token = request.headers.get('x-e2e-token')
	return !!token && token === secret
}

async function provisionTestUser(): Promise<void> {
	await db
		.insert(schema.profiles)
		.values({
			id: E2E_USER_ID,
			email: E2E_USER_EMAIL,
			displayName: 'E2E Test User'
		})
		.onConflictDoNothing()
}

async function provisionTestSubscription(): Promise<void> {
	const periodEnd = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)

	await db
		.insert(schema.subscriptions)
		.values({
			userId: E2E_USER_ID,
			plan: 'scale',
			status: 'active',
			billingCycle: 'monthly',
			screenshotsPerMonth: 999999,
			currentPeriodStart: new Date(),
			currentPeriodEnd: periodEnd,
			overageRateCents: 0
		})
		.onConflictDoUpdate({
			target: schema.subscriptions.userId,
			set: {
				plan: 'scale',
				status: 'active',
				screenshotsPerMonth: 999999,
				overageRateCents: 0,
				currentPeriodEnd: periodEnd,
				updatedAt: new Date()
			}
		})
}

async function provisionTestCredits(): Promise<void> {
	await db
		.insert(schema.creditBalances)
		.values({ userId: E2E_USER_ID, balance: 10000 })
		.onConflictDoNothing()
}

async function provisionTestApiKey(): Promise<
	typeof schema.apiKeys.$inferSelect
> {
	const existing = await db.query.apiKeys.findFirst({
		where: and(
			eq(schema.apiKeys.userId, E2E_USER_ID),
			eq(schema.apiKeys.name, E2E_API_KEY_NAME),
			isNull(schema.apiKeys.revokedAt)
		)
	})

	if (existing) return existing

	const rawKey = generateApiKey()
	const keyHash = await hashApiKey(rawKey)
	const keyPrefix = getKeyPrefix(rawKey)

	const [created] = await db
		.insert(schema.apiKeys)
		.values({
			userId: E2E_USER_ID,
			name: E2E_API_KEY_NAME,
			keyPrefix,
			keyHash
		})
		.returning()

	return created!
}

export function resetE2ECache(): void {
	cachedResolution = null
}
