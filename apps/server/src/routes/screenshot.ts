import { db, eq, schema } from '@screenshot-saas/db'
import { Elysia, t } from 'elysia'
import { apiKeyAuth } from '../middleware/api-key-auth'
import { getCachedScreenshot, setCachedScreenshot } from '../services/cache'
import { polar } from '../services/polar'
import {
	generateCacheKey,
	type ScreenshotOptions,
	takeScreenshot
} from '../services/screenshot'
import {
	checkScreenshotAllowance,
	recordScreenshotUsage
} from '../services/subscription'
import { dispatchWebhookEvent } from '../services/webhook'

export const screenshotRoutes = new Elysia({
	name: 'screenshot-routes',
	prefix: '/screenshot'
})
	.use(apiKeyAuth)
	.get(
		'/',
		async ({ query, apiKey, apiKeyUserId, set }) => {
			const allowance = await checkScreenshotAllowance(apiKeyUserId)
			if (!allowance.allowed) {
				set.status = 402
				return {
					error: 'Insufficient quota',
					message: allowance.reason,
					remainingInPlan: 0,
					creditBalance: allowance.creditBalance
				}
			}

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
				html: query.html ?? undefined,
				cssInject: query.cssInject ?? undefined,
				jsInject: query.jsInject ?? undefined,
				stealthMode: query.stealthMode === 'true',
				devicePixelRatio: query.devicePixelRatio
					? Number(query.devicePixelRatio)
					: undefined,
				timezone: query.timezone ?? undefined,
				locale: query.locale ?? undefined,
				cacheTtl: query.cacheTtl ? Number(query.cacheTtl) : undefined
			}

			const cacheKey = generateCacheKey(options)
			const cacheTtl = options.cacheTtl

			if (cacheTtl && cacheTtl > 0) {
				const cached = await getCachedScreenshot(cacheKey)
				if (cached) {
					const buffer = Buffer.from(cached.imageData, 'base64')

					await db.insert(schema.screenshots).values({
						userId: apiKeyUserId,
						apiKeyId: apiKey.id,
						url: options.url,
						options,
						status: 'completed',
						durationMs: 0,
						cachedResponse: true
					})

					set.headers['content-type'] = cached.contentType
					set.headers['x-cache'] = 'HIT'
					set.headers['x-credits-remaining'] = String(
						allowance.remainingInPlan + allowance.creditBalance
					)
					return new Response(new Uint8Array(buffer))
				}
			}

			const startTime = Date.now()
			let screenshotId: string | undefined

			try {
				const [insertResult] = await db
					.insert(schema.screenshots)
					.values({
						userId: apiKeyUserId,
						apiKeyId: apiKey.id,
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

				const usage = await recordScreenshotUsage(apiKeyUserId)

				if (screenshotId) {
					db.update(schema.screenshots)
						.set({ creditDeducted: usage.source === 'credits' })
						.where(eq(schema.screenshots.id, screenshotId))
						.execute()
				}

				if (cacheTtl && cacheTtl > 0) {
					setCachedScreenshot({
						cacheKey,
						imageData: buffer.toString('base64'),
						contentType,
						url: options.url,
						optionsHash: cacheKey,
						ttlSeconds: cacheTtl
					}).catch(() => {})
				}

				polar
					.ingestScreenshotEvent({
						userId: apiKeyUserId,
						screenshotId,
						url: options.url
					})
					.catch(() => {})

				dispatchWebhookEvent({
					userId: apiKeyUserId,
					event: 'screenshot.completed',
					payload: {
						screenshotId,
						url: options.url,
						durationMs,
						source: usage.source
					}
				}).catch(() => {})

				const newAllowance =
					await checkScreenshotAllowance(apiKeyUserId)

				set.headers['content-type'] = contentType
				set.headers['x-credits-remaining'] = String(
					newAllowance.remainingInPlan + newAllowance.creditBalance
				)
				set.headers['x-screenshot-id'] = screenshotId ?? ''
				set.headers['x-duration-ms'] = String(durationMs)
				set.headers['x-cache'] = 'MISS'
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
				return {
					error: 'Screenshot failed',
					message: errorMessage,
					fix: 'Check that the URL is accessible and try again. If the site requires JavaScript, try waitUntil=networkidle0. For bot-protected sites, enable stealthMode=true.'
				}
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
				html: t.Optional(t.String()),
				cssInject: t.Optional(t.String()),
				jsInject: t.Optional(t.String()),
				stealthMode: t.Optional(t.String()),
				devicePixelRatio: t.Optional(t.String()),
				timezone: t.Optional(t.String()),
				locale: t.Optional(t.String()),
				cacheTtl: t.Optional(t.String())
			})
		}
	)
	.post(
		'/',
		async ({ body, apiKey, apiKeyUserId, set }) => {
			const allowance = await checkScreenshotAllowance(apiKeyUserId)
			if (!allowance.allowed) {
				set.status = 402
				return {
					error: 'Insufficient quota',
					message: allowance.reason,
					remainingInPlan: 0,
					creditBalance: allowance.creditBalance
				}
			}

			const options: ScreenshotOptions = {
				url: body.url ?? '',
				html: body.html,
				width: body.width,
				height: body.height,
				fullPage: body.fullPage,
				type: body.type as ScreenshotOptions['type'],
				quality: body.quality,
				colorScheme: body.colorScheme as 'light' | 'dark' | undefined,
				waitUntil: body.waitUntil as ScreenshotOptions['waitUntil'],
				waitForSelector: body.waitForSelector,
				delay: body.delay,
				blockAds: body.blockAds,
				removeCookieBanners: body.removeCookieBanners,
				cssInject: body.cssInject,
				jsInject: body.jsInject,
				stealthMode: body.stealthMode,
				devicePixelRatio: body.devicePixelRatio,
				timezone: body.timezone,
				locale: body.locale,
				cacheTtl: body.cacheTtl
			}

			const startTime = Date.now()
			let screenshotId: string | undefined

			try {
				const [insertResult] = await db
					.insert(schema.screenshots)
					.values({
						userId: apiKeyUserId,
						apiKeyId: apiKey.id,
						url:
							options.url ||
							options.html?.slice(0, 100) ||
							'html',
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

				await recordScreenshotUsage(apiKeyUserId)

				polar
					.ingestScreenshotEvent({
						userId: apiKeyUserId,
						screenshotId,
						url: options.url || 'html-render'
					})
					.catch(() => {})

				set.headers['content-type'] = contentType
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
				return {
					error: 'Screenshot failed',
					message: errorMessage,
					fix: 'For HTML rendering, ensure the HTML is valid and complete.'
				}
			}
		},
		{
			body: t.Object({
				url: t.Optional(t.String()),
				html: t.Optional(t.String()),
				width: t.Optional(t.Number()),
				height: t.Optional(t.Number()),
				fullPage: t.Optional(t.Boolean()),
				type: t.Optional(t.String()),
				quality: t.Optional(t.Number()),
				colorScheme: t.Optional(t.String()),
				waitUntil: t.Optional(t.String()),
				waitForSelector: t.Optional(t.String()),
				delay: t.Optional(t.Number()),
				blockAds: t.Optional(t.Boolean()),
				removeCookieBanners: t.Optional(t.Boolean()),
				cssInject: t.Optional(t.String()),
				jsInject: t.Optional(t.String()),
				stealthMode: t.Optional(t.Boolean()),
				devicePixelRatio: t.Optional(t.Number()),
				timezone: t.Optional(t.String()),
				locale: t.Optional(t.String()),
				cacheTtl: t.Optional(t.Number())
			})
		}
	)
