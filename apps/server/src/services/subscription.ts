import {
	FREE_MONTHLY_SCREENSHOTS,
	SUBSCRIPTION_PLANS,
	type SubscriptionPlan
} from '@screenshot-saas/config'
import { db, eq, lte, schema, sql } from '@screenshot-saas/db'

export type SubscriptionRow = typeof schema.subscriptions.$inferSelect

const NO_SCREENSHOTS_REASON =
	'No screenshots remaining. Upgrade your plan or purchase credit packs.'

function startOfMonthUtc(d: Date): Date {
	return new Date(
		Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1, 0, 0, 0, 0)
	)
}

function startOfNextMonthUtc(d: Date): Date {
	return new Date(
		Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1, 0, 0, 0, 0)
	)
}

function addBillingPeriod(
	from: Date,
	billingCycle: 'monthly' | 'annual'
): Date {
	const d = new Date(from.getTime())
	if (billingCycle === 'monthly') {
		d.setUTCMonth(d.getUTCMonth() + 1)
	} else {
		d.setUTCFullYear(d.getUTCFullYear() + 1)
	}
	return d
}

function isSubscriptionEntitled(sub: SubscriptionRow): boolean {
	const now = Date.now()
	if (sub.status === 'canceled') {
		return sub.currentPeriodEnd.getTime() > now
	}
	return (
		sub.status === 'active' ||
		sub.status === 'trialing' ||
		sub.status === 'past_due'
	)
}

export async function getSubscription(
	userId: string
): Promise<SubscriptionRow | null> {
	const row = await db.query.subscriptions.findFirst({
		where: eq(schema.subscriptions.userId, userId)
	})
	return row ?? null
}

export async function getOrCreateSubscription(
	userId: string
): Promise<SubscriptionRow> {
	const periodStart = startOfMonthUtc(new Date())
	const periodEnd = startOfNextMonthUtc(new Date())

	await db
		.insert(schema.subscriptions)
		.values({
			userId,
			plan: 'free',
			status: 'active',
			billingCycle: 'monthly',
			screenshotsPerMonth: FREE_MONTHLY_SCREENSHOTS,
			currentPeriodStart: periodStart,
			currentPeriodEnd: periodEnd,
			overageRateCents: Math.round(
				SUBSCRIPTION_PLANS.free.overageRateCents * 100
			)
		})
		.onConflictDoNothing({ target: schema.subscriptions.userId })

	const row = await getSubscription(userId)
	if (!row) {
		throw new Error(`Failed to load subscription for user ${userId}`)
	}
	return row
}

export type ScreenshotAllowance = {
	allowed: boolean
	reason?: string
	remainingInPlan: number
	creditBalance: number
	source: 'subscription' | 'credits'
}

export async function checkScreenshotAllowance(
	userId: string
): Promise<ScreenshotAllowance> {
	const subscription = await getOrCreateSubscription(userId)
	const creditRow = await db.query.creditBalances.findFirst({
		where: eq(schema.creditBalances.userId, userId)
	})
	const creditBalance = creditRow?.balance ?? 0

	const entitled = isSubscriptionEntitled(subscription)
	const withinPlan =
		entitled &&
		subscription.screenshotsUsedThisMonth < subscription.screenshotsPerMonth

	if (withinPlan) {
		return {
			allowed: true,
			remainingInPlan:
				subscription.screenshotsPerMonth -
				subscription.screenshotsUsedThisMonth,
			creditBalance,
			source: 'subscription'
		}
	}

	if (creditBalance > 0) {
		return {
			allowed: true,
			remainingInPlan: 0,
			creditBalance,
			source: 'credits'
		}
	}

	if (entitled && subscription.plan !== 'free') {
		return {
			allowed: true,
			remainingInPlan: 0,
			creditBalance,
			source: 'subscription'
		}
	}

	return {
		allowed: false,
		reason: NO_SCREENSHOTS_REASON,
		remainingInPlan: 0,
		creditBalance,
		source: 'subscription'
	}
}

export type ScreenshotUsageResult = {
	source: 'subscription' | 'credits' | 'overage'
	overageCount?: number
}

export async function recordScreenshotUsage(
	userId: string
): Promise<ScreenshotUsageResult> {
	const subscription = await getSubscription(userId)
	if (!subscription) {
		return { source: 'subscription' }
	}

	const creditRow = await db.query.creditBalances.findFirst({
		where: eq(schema.creditBalances.userId, userId)
	})
	const creditBalance = creditRow?.balance ?? 0

	const entitled = isSubscriptionEntitled(subscription)
	const withinPlan =
		entitled &&
		subscription.screenshotsUsedThisMonth < subscription.screenshotsPerMonth

	if (withinPlan) {
		await db
			.update(schema.subscriptions)
			.set({
				screenshotsUsedThisMonth: sql`${schema.subscriptions.screenshotsUsedThisMonth} + 1`,
				updatedAt: new Date()
			})
			.where(eq(schema.subscriptions.userId, userId))
		return { source: 'subscription' }
	}

	if (creditBalance > 0) {
		const result = await db
			.update(schema.creditBalances)
			.set({
				balance: sql`${schema.creditBalances.balance} - 1`,
				updatedAt: new Date()
			})
			.where(
				sql`${schema.creditBalances.userId} = ${userId} AND ${schema.creditBalances.balance} > 0`
			)
			.returning({ balance: schema.creditBalances.balance })

		if (result.length === 0) {
			return { source: 'subscription' }
		}

		await db.insert(schema.creditTransactions).values({
			userId,
			amount: -1,
			type: 'usage',
			description: 'Screenshot captured'
		})

		return { source: 'credits' }
	}

	if (entitled && subscription.plan !== 'free') {
		const newUsed = subscription.screenshotsUsedThisMonth + 1
		const overIncrement = newUsed > subscription.screenshotsPerMonth ? 1 : 0

		await db
			.update(schema.subscriptions)
			.set({
				screenshotsUsedThisMonth: sql`${schema.subscriptions.screenshotsUsedThisMonth} + 1`,
				overageScreenshots: sql`${schema.subscriptions.overageScreenshots} + ${overIncrement}`,
				updatedAt: new Date()
			})
			.where(eq(schema.subscriptions.userId, userId))

		return {
			source: 'overage',
			overageCount:
				overIncrement > 0
					? subscription.overageScreenshots + overIncrement
					: undefined
		}
	}

	return { source: 'subscription' }
}

export async function resetMonthlyUsage(): Promise<void> {
	const now = new Date()
	const rows = await db.query.subscriptions.findMany({
		where: lte(schema.subscriptions.currentPeriodEnd, now)
	})

	for (const row of rows) {
		let periodStart = row.currentPeriodStart
		let periodEnd = row.currentPeriodEnd
		while (periodEnd.getTime() <= now.getTime()) {
			periodStart = periodEnd
			periodEnd = addBillingPeriod(periodEnd, row.billingCycle)
		}

		await db
			.update(schema.subscriptions)
			.set({
				screenshotsUsedThisMonth: 0,
				overageScreenshots: 0,
				currentPeriodStart: periodStart,
				currentPeriodEnd: periodEnd,
				updatedAt: new Date()
			})
			.where(eq(schema.subscriptions.id, row.id))
	}
}

export async function updateSubscriptionPlan({
	userId,
	plan,
	billingCycle,
	polarSubscriptionId,
	polarCustomerId
}: {
	userId: string
	plan: SubscriptionPlan
	billingCycle: 'monthly' | 'annual'
	polarSubscriptionId?: string
	polarCustomerId?: string
}): Promise<SubscriptionRow> {
	const planConfig = SUBSCRIPTION_PLANS[plan]
	const screenshotsPerMonth = planConfig.screenshotsPerMonth
	const overageRateCents = Math.round(planConfig.overageRateCents * 100)
	const periodStart = new Date()
	const periodEnd = addBillingPeriod(periodStart, billingCycle)

	await db
		.insert(schema.subscriptions)
		.values({
			userId,
			plan,
			billingCycle,
			screenshotsPerMonth,
			status: 'active',
			currentPeriodStart: periodStart,
			currentPeriodEnd: periodEnd,
			polarSubscriptionId: polarSubscriptionId ?? null,
			polarCustomerId: polarCustomerId ?? null,
			overageRateCents
		})
		.onConflictDoUpdate({
			target: schema.subscriptions.userId,
			set: {
				plan,
				billingCycle,
				screenshotsPerMonth,
				overageRateCents,
				status: 'active',
				canceledAt: null,
				...(polarSubscriptionId !== undefined && {
					polarSubscriptionId
				}),
				...(polarCustomerId !== undefined && { polarCustomerId }),
				updatedAt: new Date()
			}
		})

	const updated = await getSubscription(userId)
	if (!updated) {
		throw new Error(`Failed to load subscription for user ${userId}`)
	}
	return updated
}

export async function cancelSubscription(
	userId: string
): Promise<SubscriptionRow | null> {
	const existing = await getSubscription(userId)
	if (!existing) {
		return null
	}

	await db
		.update(schema.subscriptions)
		.set({
			status: 'canceled',
			canceledAt: new Date(),
			updatedAt: new Date()
		})
		.where(eq(schema.subscriptions.userId, userId))

	return getSubscription(userId)
}
