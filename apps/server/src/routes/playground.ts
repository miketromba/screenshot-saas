import { db, eq, schema } from '@screenshot-saas/db'
import { Elysia, t } from 'elysia'
import { sessionAuth } from '../middleware/session-auth'
import { isE2ERequest } from '../services/e2e'
import { polar } from '../services/polar'
import { type ScreenshotOptions, takeScreenshot } from '../services/screenshot'
import {
	checkScreenshotAllowance,
	recordScreenshotUsage
} from '../services/subscription'

export const playgroundRoutes = new Elysia({
	name: 'playground-routes',
	prefix: '/playground'
})
	.use(sessionAuth)
	.get(
		'/screenshot',
		async ({ query, user, set, request }) => {
			const e2eTest = isE2ERequest(request)
			const allowance = await checkScreenshotAllowance(user.id)
			if (!allowance.allowed) {
				set.status = 402
				return {
					error: 'Insufficient quota',
					balance: 0,
					message: allowance.reason
				}
			}

			const startTime = Date.now()
			const options: ScreenshotOptions = {
				url: query.url,
				width: query.width ? Number(query.width) : undefined,
				height: query.height ? Number(query.height) : undefined,
				fullPage: query.fullPage === 'true',
				type: (query.type as ScreenshotOptions['type']) ?? undefined,
				quality: query.quality ? Number(query.quality) : undefined,
				colorScheme: query.colorScheme as 'light' | 'dark' | undefined,
				waitUntil: query.waitUntil as ScreenshotOptions['waitUntil'],
				waitForSelector: query.waitForSelector ?? undefined,
				delay: query.delay ? Number(query.delay) : undefined,
				blockAds: query.blockAds === 'true',
				removeCookieBanners: query.removeCookieBanners === 'true',
				cssInject: query.cssInject ?? undefined,
				jsInject: query.jsInject ?? undefined,
				stealthMode: query.stealthMode === 'true',
				devicePixelRatio: query.devicePixelRatio
					? Number(query.devicePixelRatio)
					: undefined,
				timezone: query.timezone ?? undefined,
				locale: query.locale ?? undefined,
				preloadFonts: query.preloadFonts === 'true',
				removeElements: query.removeElements
					? query.removeElements.split(',').map(s => s.trim())
					: undefined,
				removePopups: query.removePopups === 'true',
				mockupDevice: query.mockupDevice as
					| 'browser'
					| 'iphone'
					| 'macbook'
					| undefined
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

				const usage = await recordScreenshotUsage(user.id)

				if (screenshotId) {
					db.update(schema.screenshots)
						.set({ creditDeducted: usage.source === 'credits' })
						.where(eq(schema.screenshots.id, screenshotId))
						.execute()
				}

				if (!e2eTest) {
					polar
						.ingestScreenshotEvent({
							userId: user.id,
							screenshotId,
							url: options.url
						})
						.catch(() => {})
				}

				const newAllowance = await checkScreenshotAllowance(user.id)

				set.headers['content-type'] = contentType
				set.headers['x-credits-remaining'] = String(
					newAllowance.remainingInPlan + newAllowance.creditBalance
				)
				set.headers['x-screenshot-id'] = screenshotId ?? ''
				set.headers['x-duration-ms'] = String(durationMs)
				set.headers['x-usage-source'] = usage.source

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
				delay: t.Optional(t.String()),
				blockAds: t.Optional(t.String()),
				removeCookieBanners: t.Optional(t.String()),
				cssInject: t.Optional(t.String()),
				jsInject: t.Optional(t.String()),
				stealthMode: t.Optional(t.String()),
				devicePixelRatio: t.Optional(t.String()),
				timezone: t.Optional(t.String()),
				locale: t.Optional(t.String()),
				preloadFonts: t.Optional(t.String()),
				removeElements: t.Optional(t.String()),
				removePopups: t.Optional(t.String()),
				mockupDevice: t.Optional(t.String())
			})
		}
	)
