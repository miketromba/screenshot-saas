import { and, db, eq, gte, schema, sql } from '@screenshot-saas/db'
import { Elysia, t } from 'elysia'
import { sessionAuth } from '../middleware/session-auth'

export const usageRoutes = new Elysia({
	name: 'usage-routes',
	prefix: '/usage'
})
	.use(sessionAuth)
	.get(
		'/',
		async ({ user, query }) => {
			const limit = query.limit ? Number(query.limit) : 50
			const offset = query.offset ? Number(query.offset) : 0

			const logs = await db.query.screenshots.findMany({
				where: eq(schema.screenshots.userId, user.id),
				orderBy: (t, { desc }) => [desc(t.createdAt)],
				limit,
				offset
			})

			return logs.map(l => ({
				id: l.id,
				url: l.url,
				status: l.status,
				durationMs: l.durationMs,
				errorMessage: l.errorMessage,
				createdAt: l.createdAt
			}))
		},
		{
			query: t.Object({
				limit: t.Optional(t.String()),
				offset: t.Optional(t.String())
			})
		}
	)
	.get('/stats', async ({ user }) => {
		const now = new Date()
		const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

		const [totalResult] = await db
			.select({ count: sql<number>`count(*)::int` })
			.from(schema.screenshots)
			.where(eq(schema.screenshots.userId, user.id))

		const [recentResult] = await db
			.select({ count: sql<number>`count(*)::int` })
			.from(schema.screenshots)
			.where(
				and(
					eq(schema.screenshots.userId, user.id),
					gte(schema.screenshots.createdAt, thirtyDaysAgo)
				)
			)

		const [failedResult] = await db
			.select({ count: sql<number>`count(*)::int` })
			.from(schema.screenshots)
			.where(
				and(
					eq(schema.screenshots.userId, user.id),
					eq(schema.screenshots.status, 'failed')
				)
			)

		const [avgDuration] = await db
			.select({
				avg: sql<number>`coalesce(avg(${schema.screenshots.durationMs}), 0)::int`
			})
			.from(schema.screenshots)
			.where(
				and(
					eq(schema.screenshots.userId, user.id),
					eq(schema.screenshots.status, 'completed')
				)
			)

		return {
			totalScreenshots: totalResult?.count ?? 0,
			last30Days: recentResult?.count ?? 0,
			failedScreenshots: failedResult?.count ?? 0,
			avgDurationMs: avgDuration?.avg ?? 0
		}
	})
