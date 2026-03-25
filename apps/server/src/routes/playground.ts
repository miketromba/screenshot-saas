import { db, eq, schema } from '@screenshot-saas/db'
import { Elysia, t } from 'elysia'
import { sessionAuth } from '../middleware/session-auth'
import { deductCredit, getBalance } from '../services/credits'
import { type ScreenshotOptions, takeScreenshot } from '../services/screenshot'

export const playgroundRoutes = new Elysia({
	name: 'playground-routes',
	prefix: '/playground'
})
	.use(sessionAuth)
	.get(
		'/screenshot',
		async ({ query, user, set }) => {
			const balance = await getBalance(user.id)
			if (balance <= 0) {
				set.status = 402
				return {
					error: 'Insufficient credits',
					balance: 0,
					message: 'Purchase more credits to continue'
				}
			}

			const startTime = Date.now()
			const options: ScreenshotOptions = {
				url: query.url,
				width: query.width ? Number(query.width) : undefined,
				height: query.height ? Number(query.height) : undefined,
				fullPage: query.fullPage === 'true',
				type: (query.type as 'png' | 'webp' | 'jpeg') ?? undefined,
				quality: query.quality ? Number(query.quality) : undefined,
				colorScheme: query.colorScheme as 'light' | 'dark' | undefined,
				waitUntil: query.waitUntil as ScreenshotOptions['waitUntil'],
				waitForSelector: query.waitForSelector ?? undefined,
				delay: query.delay ? Number(query.delay) : undefined
			}

			let screenshotId: string | undefined

			try {
				const [insertResult] = await db
					.insert(schema.screenshots)
					.values({
						userId: user.id,
						url: options.url,
						options,
						status: 'completed'
					})
					.returning({ id: schema.screenshots.id })
				screenshotId = insertResult?.id

				const { buffer, contentType } = await takeScreenshot(options)
				const durationMs = Date.now() - startTime

				if (screenshotId) {
					await db
						.update(schema.screenshots)
						.set({ durationMs, status: 'completed' })
						.where(eq(schema.screenshots.id, screenshotId))
				}

				const deduction = await deductCredit({
					userId: user.id,
					screenshotId: screenshotId ?? 'unknown'
				})

				if (screenshotId) {
					db.update(schema.screenshots)
						.set({ creditDeducted: true })
						.where(eq(schema.screenshots.id, screenshotId))
						.execute()
				}

				set.headers['content-type'] = contentType
				set.headers['x-credits-remaining'] = String(
					deduction.newBalance
				)
				set.headers['x-screenshot-id'] = screenshotId ?? ''
				set.headers['x-duration-ms'] = String(durationMs)

				return new Response(new Uint8Array(buffer))
			} catch (err) {
				const durationMs = Date.now() - startTime
				const errorMessage =
					err instanceof Error ? err.message : 'Unknown error'

				if (screenshotId) {
					db.update(schema.screenshots)
						.set({ status: 'failed', errorMessage, durationMs })
						.where(eq(schema.screenshots.id, screenshotId))
						.execute()
				}

				set.status = 500
				return { error: 'Screenshot failed', message: errorMessage }
			}
		},
		{
			query: t.Object({
				url: t.String({ format: 'uri' }),
				width: t.Optional(t.String()),
				height: t.Optional(t.String()),
				fullPage: t.Optional(t.String()),
				type: t.Optional(t.String()),
				quality: t.Optional(t.String()),
				colorScheme: t.Optional(t.String()),
				waitUntil: t.Optional(t.String()),
				waitForSelector: t.Optional(t.String()),
				delay: t.Optional(t.String())
			})
		}
	)
