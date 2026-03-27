import { and, db, eq, gt, lte, schema, sql } from '@screenshot-saas/db'

export async function getCachedScreenshot(
	cacheKey: string
): Promise<{ imageData: string; contentType: string } | null> {
	const row = await db.query.screenshotCache.findFirst({
		where: and(
			eq(schema.screenshotCache.cacheKey, cacheKey),
			gt(schema.screenshotCache.expiresAt, sql`now()`)
		)
	})
	if (!row) {
		return null
	}
	return { imageData: row.imageData, contentType: row.contentType }
}

export async function setCachedScreenshot({
	cacheKey,
	imageData,
	contentType,
	url,
	optionsHash,
	ttlSeconds
}: {
	cacheKey: string
	imageData: string
	contentType: string
	url: string
	optionsHash: string
	ttlSeconds?: number
}): Promise<void> {
	const ttl = ttlSeconds ?? 86400
	const expiresAt = new Date(Date.now() + ttl * 1000)

	await db
		.insert(schema.screenshotCache)
		.values({
			cacheKey,
			imageData,
			contentType,
			url,
			optionsHash,
			ttlSeconds: ttl,
			expiresAt
		})
		.onConflictDoUpdate({
			target: schema.screenshotCache.cacheKey,
			set: {
				imageData,
				contentType,
				url,
				optionsHash,
				ttlSeconds: ttl,
				expiresAt
			}
		})
}

export async function cleanExpiredCache(): Promise<number> {
	const deleted = await db
		.delete(schema.screenshotCache)
		.where(lte(schema.screenshotCache.expiresAt, sql`now()`))
		.returning({ id: schema.screenshotCache.id })

	return deleted.length
}
