import { FREE_CREDITS } from '@screenshot-saas/config'
import { db, eq, schema, sql } from '@screenshot-saas/db'

export async function getBalance(userId: string): Promise<number> {
	const row = await db.query.creditBalances.findFirst({
		where: eq(schema.creditBalances.userId, userId)
	})
	return row?.balance ?? 0
}

export async function initializeCredits(userId: string): Promise<void> {
	await db
		.insert(schema.creditBalances)
		.values({ userId, balance: FREE_CREDITS })
		.onConflictDoNothing()

	await db.insert(schema.creditTransactions).values({
		userId,
		amount: FREE_CREDITS,
		type: 'signup_bonus',
		description: `Welcome bonus: ${FREE_CREDITS} free credits`
	})
}

export async function deductCredit({
	userId,
	screenshotId
}: {
	userId: string
	screenshotId: string
}): Promise<{ success: boolean; newBalance: number }> {
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
		return { success: false, newBalance: 0 }
	}

	await db.insert(schema.creditTransactions).values({
		userId,
		amount: -1,
		type: 'usage',
		description: 'Screenshot captured',
		referenceId: screenshotId
	})

	return { success: true, newBalance: result[0]!.balance }
}

export async function addCredits({
	userId,
	amount,
	type,
	description,
	referenceId
}: {
	userId: string
	amount: number
	type: 'purchase' | 'auto_topup' | 'refund'
	description: string
	referenceId?: string
}): Promise<number> {
	const result = await db
		.update(schema.creditBalances)
		.set({
			balance: sql`${schema.creditBalances.balance} + ${amount}`,
			updatedAt: new Date()
		})
		.where(eq(schema.creditBalances.userId, userId))
		.returning({ balance: schema.creditBalances.balance })

	if (result.length === 0) {
		await db
			.insert(schema.creditBalances)
			.values({ userId, balance: amount })
		const newResult = await db.query.creditBalances.findFirst({
			where: eq(schema.creditBalances.userId, userId)
		})
		await db.insert(schema.creditTransactions).values({
			userId,
			amount,
			type,
			description,
			referenceId
		})
		return newResult?.balance ?? amount
	}

	await db.insert(schema.creditTransactions).values({
		userId,
		amount,
		type,
		description,
		referenceId
	})

	return result[0]!.balance
}

export async function getTransactions({
	userId,
	limit = 50,
	offset = 0
}: {
	userId: string
	limit?: number
	offset?: number
}) {
	return db.query.creditTransactions.findMany({
		where: eq(schema.creditTransactions.userId, userId),
		orderBy: (t, { desc }) => [desc(t.createdAt)],
		limit,
		offset
	})
}

export async function checkAutoTopup(userId: string): Promise<void> {
	const config = await db.query.autoTopupConfigs.findFirst({
		where: eq(schema.autoTopupConfigs.userId, userId)
	})

	if (
		!config?.enabled ||
		!config.packId ||
		!config.stripeCustomerId ||
		!config.stripePaymentMethodId
	) {
		return
	}

	const balance = await getBalance(userId)
	if (balance >= config.threshold) return

	const pack = await db.query.creditPacks.findFirst({
		where: eq(schema.creditPacks.id, config.packId)
	})
	if (!pack) return

	const { stripe: stripeService } = await import('./stripe')

	try {
		const intent = await stripeService.chargePaymentMethod({
			customerId: config.stripeCustomerId,
			paymentMethodId: config.stripePaymentMethodId,
			amount: pack.priceCents,
			metadata: {
				userId,
				packId: pack.id,
				credits: String(pack.credits),
				type: 'auto_topup'
			}
		})

		if (intent.status === 'succeeded') {
			await addCredits({
				userId,
				amount: pack.credits,
				type: 'auto_topup',
				description: `Auto top-up: ${pack.credits.toLocaleString()} credits (${pack.name} pack)`,
				referenceId: intent.id
			})
		}
	} catch {
		console.error(`Auto top-up failed for user ${userId}`)
	}
}
