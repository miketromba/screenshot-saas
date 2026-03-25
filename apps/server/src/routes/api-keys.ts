import { and, db, eq, isNull, schema } from '@screenshot-saas/db'
import { Elysia, t } from 'elysia'
import { generateApiKey, getKeyPrefix, hashApiKey } from '../lib/crypto'
import { sessionAuth } from '../middleware/session-auth'

export const apiKeyRoutes = new Elysia({
	name: 'api-key-routes',
	prefix: '/api-keys'
})
	.use(sessionAuth)
	.get('/', async ({ user }) => {
		const keys = await db.query.apiKeys.findMany({
			where: and(
				eq(schema.apiKeys.userId, user.id),
				isNull(schema.apiKeys.revokedAt)
			),
			orderBy: (t, { desc }) => [desc(t.createdAt)]
		})
		return keys.map(k => ({
			id: k.id,
			name: k.name,
			keyPrefix: k.keyPrefix,
			lastUsedAt: k.lastUsedAt,
			createdAt: k.createdAt
		}))
	})
	.post(
		'/',
		async ({ body, user }) => {
			const rawKey = generateApiKey()
			const keyHash = await hashApiKey(rawKey)
			const keyPrefix = getKeyPrefix(rawKey)

			const [created] = await db
				.insert(schema.apiKeys)
				.values({
					userId: user.id,
					name: body.name,
					keyPrefix,
					keyHash
				})
				.returning()

			return {
				id: created?.id,
				name: created?.name,
				key: rawKey,
				keyPrefix,
				createdAt: created?.createdAt
			}
		},
		{
			body: t.Object({
				name: t.String({ minLength: 1, maxLength: 100 })
			})
		}
	)
	.delete(
		'/:id',
		async ({ params, user, set }) => {
			const key = await db.query.apiKeys.findFirst({
				where: and(
					eq(schema.apiKeys.id, params.id),
					eq(schema.apiKeys.userId, user.id)
				)
			})

			if (!key) {
				set.status = 404
				return { error: 'API key not found' }
			}

			await db
				.update(schema.apiKeys)
				.set({ revokedAt: new Date() })
				.where(eq(schema.apiKeys.id, params.id))

			return { success: true }
		},
		{
			params: t.Object({ id: t.String() })
		}
	)
