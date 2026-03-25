import { and, db, eq, isNull, schema } from '@screenshot-saas/db'
import { Elysia } from 'elysia'
import { hashApiKey } from '../lib/crypto'

export const apiKeyAuth = new Elysia({ name: 'api-key-auth' })
	.derive({ as: 'scoped' }, async ({ request }) => {
		const authHeader = request.headers.get('authorization')
		const xApiKey = request.headers.get('x-api-key')
		const rawKey = xApiKey ?? authHeader?.replace('Bearer ', '')

		if (!rawKey) throw new Error('API_KEY_REQUIRED')

		const keyHash = await hashApiKey(rawKey)
		const apiKey = await db.query.apiKeys.findFirst({
			where: and(
				eq(schema.apiKeys.keyHash, keyHash),
				isNull(schema.apiKeys.revokedAt)
			)
		})

		if (!apiKey) throw new Error('INVALID_API_KEY')

		db.update(schema.apiKeys)
			.set({ lastUsedAt: new Date() })
			.where(eq(schema.apiKeys.id, apiKey.id))
			.execute()

		return { apiKey, apiKeyUserId: apiKey.userId }
	})
	.onError({ as: 'scoped' }, ({ error: err, set }) => {
		if (!(err instanceof Error)) return
		if (err.message === 'API_KEY_REQUIRED') {
			set.status = 401
			return {
				error: 'API key required. Pass via x-api-key header or Authorization: Bearer <key>'
			}
		}
		if (err.message === 'INVALID_API_KEY') {
			set.status = 403
			return { error: 'Invalid or revoked API key' }
		}
	})
