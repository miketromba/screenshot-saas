import { db, eq, schema } from '@screenshot-saas/db'
import { Elysia, t } from 'elysia'
import { validateAndNormalizeScreenshotOptions } from '../lib/screenshot-options'
import { apiKeyAuth } from '../middleware/api-key-auth'
import { getCachedScreenshot, setCachedScreenshot } from '../services/cache'
import { isE2ERequest } from '../services/e2e'
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

function invalidScreenshotOptions(message: string) {
	return {
		error: 'Invalid screenshot options',
		message
	}
}

function parseBooleanQuery(
	value: string | undefined,
	field: string
): { ok: true; value: boolean | undefined } | { ok: false; error: string } {
	if (value === undefined) {
		return { ok: true, value: undefined }
	}
	if (value === 'true') {
		return { ok: true, value: true }
	}
	if (value === 'false') {
		return { ok: true, value: false }
	}
	return {
		ok: false,
		error: `${field} must be "true" or "false".`
	}
}

function parseNumberQuery(
	value: string | undefined,
	field: string
): { ok: true; value: number | undefined } | { ok: false; error: string } {
	if (value === undefined) {
		return { ok: true, value: undefined }
	}
	const parsed = Number(value)
	if (!Number.isFinite(parsed)) {
		return {
			ok: false,
			error: `${field} must be a valid number.`
		}
	}
	return { ok: true, value: parsed }
}

export const screenshotRoutes = new Elysia({
	name: 'screenshot-routes',
	prefix: '/screenshot'
})
	.use(apiKeyAuth)
	.get(
		'/',
		async ({ query, apiKey, apiKeyUserId, set, request }) => {
			const e2eTest = isE2ERequest(request)

			const fullPage = parseBooleanQuery(query.fullPage, 'fullPage')
			if (!fullPage.ok) {
				set.status = 400
				return invalidScreenshotOptions(fullPage.error)
			}

			const blockAds = parseBooleanQuery(query.blockAds, 'blockAds')
			if (!blockAds.ok) {
				set.status = 400
				return invalidScreenshotOptions(blockAds.error)
			}

			const removeCookieBanners = parseBooleanQuery(
				query.removeCookieBanners,
				'removeCookieBanners'
			)
			if (!removeCookieBanners.ok) {
				set.status = 400
				return invalidScreenshotOptions(removeCookieBanners.error)
			}

			const stealthMode = parseBooleanQuery(
				query.stealthMode,
				'stealthMode'
			)
			if (!stealthMode.ok) {
				set.status = 400
				return invalidScreenshotOptions(stealthMode.error)
			}

			const preloadFonts = parseBooleanQuery(
				query.preloadFonts,
				'preloadFonts'
			)
			if (!preloadFonts.ok) {
				set.status = 400
				return invalidScreenshotOptions(preloadFonts.error)
			}

			const removePopups = parseBooleanQuery(
				query.removePopups,
				'removePopups'
			)
			if (!removePopups.ok) {
				set.status = 400
				return invalidScreenshotOptions(removePopups.error)
			}

			const width = parseNumberQuery(query.width, 'width')
			if (!width.ok) {
				set.status = 400
				return invalidScreenshotOptions(width.error)
			}

			const height = parseNumberQuery(query.height, 'height')
			if (!height.ok) {
				set.status = 400
				return invalidScreenshotOptions(height.error)
			}

			const quality = parseNumberQuery(query.quality, 'quality')
			if (!quality.ok) {
				set.status = 400
				return invalidScreenshotOptions(quality.error)
			}

			const delay = parseNumberQuery(query.delay, 'delay')
			if (!delay.ok) {
				set.status = 400
				return invalidScreenshotOptions(delay.error)
			}

			const devicePixelRatio = parseNumberQuery(
				query.devicePixelRatio,
				'devicePixelRatio'
			)
			if (!devicePixelRatio.ok) {
				set.status = 400
				return invalidScreenshotOptions(devicePixelRatio.error)
			}

			const parsedCacheTtl = parseNumberQuery(query.cacheTtl, 'cacheTtl')
			if (!parsedCacheTtl.ok) {
				set.status = 400
				return invalidScreenshotOptions(parsedCacheTtl.error)
			}

			const geoLatitude = parseNumberQuery(
				query.geoLatitude,
				'geoLatitude'
			)
			if (!geoLatitude.ok) {
				set.status = 400
				return invalidScreenshotOptions(geoLatitude.error)
			}

			const geoLongitude = parseNumberQuery(
				query.geoLongitude,
				'geoLongitude'
			)
			if (!geoLongitude.ok) {
				set.status = 400
				return invalidScreenshotOptions(geoLongitude.error)
			}

			const geoAccuracy = parseNumberQuery(
				query.geoAccuracy,
				'geoAccuracy'
			)
			if (!geoAccuracy.ok) {
				set.status = 400
				return invalidScreenshotOptions(geoAccuracy.error)
			}

			let geoLocation: ScreenshotOptions['geoLocation']
			if (
				(query.geoLatitude !== undefined &&
					query.geoLongitude === undefined) ||
				(query.geoLatitude === undefined &&
					query.geoLongitude !== undefined)
			) {
				set.status = 400
				return invalidScreenshotOptions(
					'geoLatitude and geoLongitude must be provided together.'
				)
			}

			if (
				geoLatitude.value !== undefined &&
				geoLongitude.value !== undefined
			) {
				geoLocation = {
					latitude: geoLatitude.value,
					longitude: geoLongitude.value,
					accuracy: geoAccuracy.value
				}
			}

			const validated = validateAndNormalizeScreenshotOptions(
				{
					url: query.url,
					width: width.value,
					height: height.value,
					fullPage: fullPage.value,
					type: query.type as ScreenshotOptions['type'] | undefined,
					quality: quality.value,
					colorScheme: query.colorScheme as
						| ScreenshotOptions['colorScheme']
						| undefined,
					waitUntil: query.waitUntil as
						| ScreenshotOptions['waitUntil']
						| undefined,
					waitForSelector: query.waitForSelector,
					delay: delay.value,
					blockAds: blockAds.value,
					removeCookieBanners: removeCookieBanners.value,
					html: query.html,
					cssInject: query.cssInject,
					jsInject: query.jsInject,
					stealthMode: stealthMode.value,
					devicePixelRatio: devicePixelRatio.value,
					timezone: query.timezone,
					locale: query.locale,
					cacheTtl: parsedCacheTtl.value,
					preloadFonts: preloadFonts.value,
					removeElements: query.removeElements
						? query.removeElements.split(',').map(s => s.trim())
						: undefined,
					removePopups: removePopups.value,
					mockupDevice: query.mockupDevice as
						| ScreenshotOptions['mockupDevice']
						| undefined,
					geoLocation
				},
				'get'
			)

			if (!validated.ok) {
				set.status = 400
				return invalidScreenshotOptions(validated.error)
			}

			const options = validated.value
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

			const cacheKey = generateCacheKey({
				userId: apiKeyUserId,
				options
			})
			const cacheTtl = options.cacheTtl

			if (cacheTtl && cacheTtl > 0) {
				const cached = await getCachedScreenshot(cacheKey, apiKeyUserId)
				if (cached) {
					const [cachedInsert] = await db
						.insert(schema.screenshots)
						.values({
							userId: apiKeyUserId,
							apiKeyId: apiKey.id,
							url: options.url,
							options,
							status: 'completed',
							durationMs: 0,
							cachedResponse: true
						})
						.returning({ id: schema.screenshots.id })

					set.headers['content-type'] = cached.contentType
					set.headers['x-cache'] = 'HIT'
					set.headers['x-screenshot-id'] = cachedInsert?.id ?? ''
					set.headers['x-duration-ms'] = '0'
					set.headers['x-usage-source'] = 'cache'
					set.headers['x-credits-remaining'] = String(
						allowance.remainingInPlan + allowance.creditBalance
					)
					return new Response(new Uint8Array(cached.buffer))
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
						userId: apiKeyUserId,
						buffer,
						contentType,
						url: options.url,
						optionsHash: cacheKey,
						ttlSeconds: cacheTtl
					}).catch(error => {
						console.error(
							'Failed to cache screenshot response',
							error
						)
					})
				}

				if (!e2eTest) {
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
				}

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
				cacheTtl: t.Optional(t.String()),
				preloadFonts: t.Optional(t.String()),
				removeElements: t.Optional(t.String()),
				removePopups: t.Optional(t.String()),
				mockupDevice: t.Optional(t.String()),
				geoLatitude: t.Optional(t.String()),
				geoLongitude: t.Optional(t.String()),
				geoAccuracy: t.Optional(t.String())
			})
		}
	)
	.post(
		'/',
		async ({ body, apiKey, apiKeyUserId, set, request }) => {
			const e2eTest = isE2ERequest(request)

			const validated = validateAndNormalizeScreenshotOptions(
				{
					url: body.url,
					html: body.html,
					width: body.width,
					height: body.height,
					fullPage: body.fullPage,
					type: body.type as ScreenshotOptions['type'] | undefined,
					quality: body.quality,
					colorScheme: body.colorScheme as
						| ScreenshotOptions['colorScheme']
						| undefined,
					waitUntil: body.waitUntil as
						| ScreenshotOptions['waitUntil']
						| undefined,
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
					cacheTtl: body.cacheTtl,
					preloadFonts: body.preloadFonts,
					removeElements: body.removeElements,
					removePopups: body.removePopups,
					mockupDevice: body.mockupDevice as
						| ScreenshotOptions['mockupDevice']
						| undefined,
					geoLocation: body.geoLocation
				},
				'post'
			)

			if (!validated.ok) {
				set.status = 400
				return invalidScreenshotOptions(validated.error)
			}

			const options = validated.value
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

			const cacheKey = generateCacheKey({
				userId: apiKeyUserId,
				options
			})
			const cacheTtl = options.cacheTtl

			if (cacheTtl && cacheTtl > 0) {
				const cached = await getCachedScreenshot(cacheKey, apiKeyUserId)
				if (cached) {
					const [cachedInsert] = await db
						.insert(schema.screenshots)
						.values({
							userId: apiKeyUserId,
							apiKeyId: apiKey.id,
							url: options.url,
							options,
							status: 'completed',
							durationMs: 0,
							cachedResponse: true
						})
						.returning({ id: schema.screenshots.id })

					set.headers['content-type'] = cached.contentType
					set.headers['x-cache'] = 'HIT'
					set.headers['x-screenshot-id'] = cachedInsert?.id ?? ''
					set.headers['x-duration-ms'] = '0'
					set.headers['x-usage-source'] = 'cache'
					set.headers['x-credits-remaining'] = String(
						allowance.remainingInPlan + allowance.creditBalance
					)

					return new Response(new Uint8Array(cached.buffer))
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

				if (cacheTtl && cacheTtl > 0) {
					setCachedScreenshot({
						cacheKey,
						userId: apiKeyUserId,
						buffer,
						contentType,
						url: options.url,
						optionsHash: cacheKey,
						ttlSeconds: cacheTtl
					}).catch(error => {
						console.error(
							'Failed to cache screenshot response',
							error
						)
					})
				}

				if (!e2eTest) {
					polar
						.ingestScreenshotEvent({
							userId: apiKeyUserId,
							screenshotId,
							url: options.url || 'html-render'
						})
						.catch(() => {})
				}

				set.headers['content-type'] = contentType
				set.headers['x-screenshot-id'] = screenshotId ?? ''
				set.headers['x-duration-ms'] = String(durationMs)
				set.headers['x-cache'] = 'MISS'
				const newAllowance =
					await checkScreenshotAllowance(apiKeyUserId)
				set.headers['x-credits-remaining'] = String(
					newAllowance.remainingInPlan + newAllowance.creditBalance
				)

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
				cacheTtl: t.Optional(t.Number()),
				preloadFonts: t.Optional(t.Boolean()),
				removeElements: t.Optional(t.Array(t.String())),
				removePopups: t.Optional(t.Boolean()),
				mockupDevice: t.Optional(t.String()),
				geoLocation: t.Optional(
					t.Object({
						latitude: t.Number(),
						longitude: t.Number(),
						accuracy: t.Optional(t.Number())
					})
				)
			})
		}
	)
