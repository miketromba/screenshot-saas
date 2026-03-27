import { and, db, eq, ne, schema, sql } from '@screenshot-saas/db'

export async function getBalance(userId: string): Promise<number> {
	const row = await db.query.creditBalances.findFirst({
		where: eq(schema.creditBalances.userId, userId)
	})
	return row?.balance ?? 0
}

export async function initializeCredits(userId: string): Promise<void> {
	await db
		.insert(schema.creditBalances)
		.values({ userId, balance: 0 })
		.onConflictDoNothing()
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
	type: 'purchase' | 'auto_topup' | 'refund' | 'subscription'
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
		where: and(
			eq(schema.creditTransactions.userId, userId),
			ne(schema.creditTransactions.type, 'usage')
		),
		orderBy: (t, { desc }) => [desc(t.createdAt)],
		limit,
		offset
	})
}
