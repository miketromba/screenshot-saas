import { and, db, eq, gt, lte, schema, sql } from '@screenshot-saas/db'

const BUCKET_NAME = 'screenshot-cache'

interface StorageBucket {
	upload(
		path: string,
		body: Buffer,
		options: {
			contentType: string
			upsert: boolean
			cacheControl: string
		}
	): Promise<{ data: unknown; error: unknown }>
	download(path: string): Promise<{ data: Blob | null; error: unknown }>
	remove(paths: string[]): Promise<{ data: unknown; error: unknown }>
}

interface StorageClientLike {
	from(bucket: string): StorageBucket
}

let _storageClient: StorageClientLike | null = null

export function setStorageClient(client: StorageClientLike | null): void {
	_storageClient = client
}

function getStorageClient(): StorageClientLike {
	if (_storageClient) return _storageClient
	const { createClient } = require('@supabase/supabase-js')
	_storageClient = createClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.SUPABASE_SERVICE_ROLE_KEY!
	).storage as StorageClientLike
	return _storageClient
}

function buildStoragePath(userId: string, cacheKey: string): string {
	return `${userId}/${cacheKey}`
}

export async function getCachedScreenshot(
	cacheKey: string,
	userId: string
): Promise<{ buffer: Buffer; contentType: string } | null> {
	const row = await db.query.screenshotCache.findFirst({
		where: and(
			eq(schema.screenshotCache.cacheKey, cacheKey),
			eq(schema.screenshotCache.userId, userId),
			gt(schema.screenshotCache.expiresAt, sql`now()`)
		)
	})
	if (!row) {
		return null
	}

	const storage = getStorageClient()
	const { data, error } = await storage
		.from(BUCKET_NAME)
		.download(row.storagePath)

	if (error || !data) {
		console.error(
			'Failed to download cached screenshot from storage',
			error
		)
		return null
	}

	const arrayBuffer = await data.arrayBuffer()
	return {
		buffer: Buffer.from(arrayBuffer),
		contentType: row.contentType
	}
}

export async function setCachedScreenshot({
	cacheKey,
	userId,
	buffer,
	contentType,
	url,
	optionsHash,
	ttlSeconds
}: {
	cacheKey: string
	userId: string
	buffer: Buffer
	contentType: string
	url: string
	optionsHash: string
	ttlSeconds?: number
}): Promise<void> {
	const ttl = ttlSeconds ?? 86400
	const expiresAt = new Date(Date.now() + ttl * 1000)
	const storagePath = buildStoragePath(userId, cacheKey)

	const storage = getStorageClient()
	const { error: uploadError } = await storage
		.from(BUCKET_NAME)
		.upload(storagePath, buffer, {
			contentType,
			upsert: true,
			cacheControl: `public, max-age=${ttl}`
		})

	if (uploadError) {
		console.error('Failed to upload screenshot to storage', uploadError)
		throw uploadError
	}

	await db
		.insert(schema.screenshotCache)
		.values({
			cacheKey,
			userId,
			storagePath,
			contentType,
			url,
			optionsHash,
			ttlSeconds: ttl,
			imageSizeBytes: buffer.length,
			expiresAt
		})
		.onConflictDoUpdate({
			target: schema.screenshotCache.cacheKey,
			set: {
				storagePath,
				contentType,
				url,
				optionsHash,
				ttlSeconds: ttl,
				imageSizeBytes: buffer.length,
				expiresAt
			}
		})
}

export async function cleanExpiredCache(): Promise<number> {
	const expired = await db
		.delete(schema.screenshotCache)
		.where(lte(schema.screenshotCache.expiresAt, sql`now()`))
		.returning({
			id: schema.screenshotCache.id,
			storagePath: schema.screenshotCache.storagePath
		})

	if (expired.length === 0) {
		return 0
	}

	const storage = getStorageClient()
	const paths = expired.map(row => row.storagePath)

	const BATCH_SIZE = 100
	for (let i = 0; i < paths.length; i += BATCH_SIZE) {
		const batch = paths.slice(i, i + BATCH_SIZE)
		const { error } = await storage.from(BUCKET_NAME).remove(batch)
		if (error) {
			console.error(
				`Failed to remove ${batch.length} cached files from storage`,
				error
			)
		}
	}

	return expired.length
}
