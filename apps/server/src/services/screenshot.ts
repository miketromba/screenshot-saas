import { createHash } from 'node:crypto'
import 'is-plain-object'
import type { Browser, Page } from 'puppeteer-core'
import {
	assertSafeTargetUrl,
	shouldAllowPrivateNetworkAccess,
	UnsafeTargetError
} from '../lib/network-safety'
import { buildAcceptLanguageHeader } from '../lib/screenshot-options'

export interface GeoLocationOptions {
	latitude: number
	longitude: number
	accuracy?: number
}

export interface ScreenshotOptions {
	url: string
	width?: number
	height?: number
	fullPage?: boolean
	type?: 'png' | 'webp' | 'jpeg' | 'pdf'
	quality?: number
	colorScheme?: 'light' | 'dark'
	waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2'
	waitForSelector?: string
	delay?: number
	blockAds?: boolean
	removeCookieBanners?: boolean
	html?: string
	cssInject?: string
	jsInject?: string
	stealthMode?: boolean
	devicePixelRatio?: number
	timezone?: string
	locale?: string
	cacheTtl?: number
	preloadFonts?: boolean
	removeElements?: string[]
	removePopups?: boolean
	mockupDevice?: 'browser' | 'iphone' | 'macbook'
	geoLocation?: GeoLocationOptions
}

const STEALTH_CHROME_ARG = '--disable-blink-features=AutomationControlled'

const COOKIE_BANNER_HIDE_CSS = `#onetrust-banner-sdk, #onetrust-consent-sdk,
.onetrust-pc-dark-filter, #CybotCookiebotDialog,
#CybotCookiebotDialogBodyUnderlay, .cc-window, .cc-banner,
.cookieConsent, [data-cookiebanner], [data-consent-banner],
[aria-label*="cookie"], [aria-label*="consent"],
[class*="cookie-banner"], [class*="cookie-consent"],
[class*="consent-banner"], [id*="cookie-banner"],
[id*="cookie-consent"], [id*="consent-banner"]
{ display: none !important; visibility: hidden !important; }`

const COOKIE_ACCEPT_SELECTORS = [
	'#onetrust-accept-btn-handler',
	'#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll',
	'button[data-cookieconsent="accept"]',
	'.cc-btn.cc-dismiss',
	'[data-testid*="accept"]',
	'[aria-label*="accept"]',
	'[class*="cookie"] button[class*="accept"]',
	'[class*="cookie"] button[class*="agree"]',
	'[id*="cookie"] button',
	'[class*="consent"] button[class*="accept"]',
	'[class*="consent"] button[class*="agree"]'
]

const COOKIE_ACCEPT_TEXT_PATTERNS = [
	'accept',
	'accept all',
	'agree',
	'allow all',
	'allow cookies',
	'got it',
	'ok',
	'continue',
	'aceptar',
	'aceitar',
	'akzeptieren',
	'alle akzeptieren',
	'tout accepter',
	'j accepte',
	'accepter'
] as const

interface LaunchOptions {
	stealth?: boolean
	blockAds?: boolean
}

const POPUP_HIDE_CSS = `[role="dialog"], [role="alertdialog"],
[class*="modal-overlay"], [class*="modal-backdrop"],
[class*="popup-overlay"], [class*="overlay-backdrop"],
[class*="interstitial"], [class*="exit-intent"],
[class*="lightbox-overlay"], [class*="newsletter-popup"],
[class*="subscribe-popup"], [class*="email-capture"]
{ display: none !important; visibility: hidden !important; }`

const POPUP_REMOVE_SELECTORS = [
	'[role="dialog"]',
	'[role="alertdialog"]',
	'[class*="modal"]',
	'[class*="popup"]',
	'[class*="overlay"]',
	'[class*="lightbox"]',
	'[class*="interstitial"]',
	'[class*="exit-intent"]',
	'[class*="newsletter-popup"]',
	'[class*="subscribe-popup"]'
]

function getMockupSourceMime(contentType: string): string {
	switch (contentType) {
		case 'image/jpeg':
			return 'image/jpeg'
		case 'image/webp':
			return 'image/webp'
		default:
			return 'image/png'
	}
}

function getBrowserMockupHtml(
	dataUri: string,
	w: number,
	h: number,
	label: string
): string {
	return `<!DOCTYPE html><html><head><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#f0f0f0;display:flex;justify-content:center;padding:32px;font-family:-apple-system,BlinkMacSystemFont,sans-serif}
.frame{background:#fff;border-radius:12px;box-shadow:0 8px 40px rgba(0,0,0,.18);overflow:hidden;display:inline-block}
.chrome{background:linear-gradient(to bottom,#e8e8e8,#ddd);padding:12px 16px;display:flex;align-items:center;gap:8px}
.dots{display:flex;gap:6px}
.dot{width:12px;height:12px;border-radius:50%}
.r{background:#ff5f56}.y{background:#ffbd2e}.g{background:#27c93f}
.bar{flex:1;background:#fff;border-radius:6px;padding:6px 12px;font-size:13px;color:#888;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.content img{display:block;width:${w}px;height:${h}px}
</style></head><body>
<div id="device-mockup" class="frame">
<div class="chrome"><div class="dots"><div class="dot r"></div><div class="dot y"></div><div class="dot g"></div></div><div class="bar">${label}</div></div>
<div class="content"><img src="${dataUri}"/></div>
</div></body></html>`
}

function getIphoneMockupHtml(dataUri: string, w: number, h: number): string {
	return `<!DOCTYPE html><html><head><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#f0f0f0;display:flex;justify-content:center;padding:32px}
.phone{background:#1a1a1a;border-radius:44px;padding:12px;box-shadow:0 12px 48px rgba(0,0,0,.3);display:inline-block}
.inner{position:relative;border-radius:32px;overflow:hidden;background:#000}
.island{position:absolute;top:10px;left:50%;transform:translateX(-50%);width:90px;height:24px;background:#1a1a1a;border-radius:12px;z-index:1}
.screen img{display:block;width:${w}px;height:${h}px;object-fit:contain;background:#000}
.home{display:flex;justify-content:center;padding:8px 0 4px}
.indicator{width:100px;height:4px;background:#666;border-radius:2px}
</style></head><body>
<div id="device-mockup" class="phone">
<div class="inner"><div class="island"></div><div class="screen"><img src="${dataUri}"/></div></div>
<div class="home"><div class="indicator"></div></div>
</div></body></html>`
}

function getMacbookMockupHtml(dataUri: string, w: number, h: number): string {
	return `<!DOCTYPE html><html><head><style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#f0f0f0;display:flex;justify-content:center;align-items:center;padding:32px}
.laptop{display:inline-block}
.screen-bezel{background:#222;border-radius:12px 12px 0 0;padding:8px 8px 0}
.cam{width:6px;height:6px;background:#555;border-radius:50%;margin:0 auto 4px}
.display img{display:block;width:${w}px;height:${h}px;border-radius:2px}
.hinge{background:linear-gradient(to bottom,#ccc,#999);height:10px;border-radius:0 0 2px 2px;width:${w + 16}px}
.base{background:#c0c0c0;height:8px;border-radius:0 0 8px 8px;width:${w + 60}px;margin:-1px auto 0;box-shadow:0 2px 4px rgba(0,0,0,.1)}
</style></head><body>
<div id="device-mockup" class="laptop">
<div class="screen-bezel"><div class="cam"></div><div class="display"><img src="${dataUri}"/></div></div>
<div class="hinge"></div>
<div class="base"></div>
</div></body></html>`
}

async function applyDeviceMockup(
	browser: Browser,
	screenshotBuffer: Buffer,
	contentType: string,
	device: 'browser' | 'iphone' | 'macbook',
	width: number,
	height: number,
	label: string
): Promise<{ buffer: Buffer; contentType: string }> {
	const base64 = screenshotBuffer.toString('base64')
	const dataUri = `data:${getMockupSourceMime(contentType)};base64,${base64}`

	let html: string
	switch (device) {
		case 'browser':
			html = getBrowserMockupHtml(dataUri, width, height, label)
			break
		case 'iphone':
			html = getIphoneMockupHtml(dataUri, width, height)
			break
		case 'macbook':
			html = getMacbookMockupHtml(dataUri, width, height)
			break
	}

	const page = await browser.newPage()
	await page.setViewport({
		width: width + 200,
		height: height + 200,
		deviceScaleFactor: 2
	})
	await page.setContent(html, { waitUntil: 'load', timeout: 10_000 })

	await page.evaluate(() => {
		return new Promise<void>(resolve => {
			const img = document.querySelector('img')
			if (!img || img.complete) return resolve()
			img.onload = () => resolve()
			img.onerror = () => resolve()
		})
	})

	const element = await page.$('#device-mockup')
	const raw = element
		? await element.screenshot({ type: 'png' })
		: await page.screenshot({ type: 'png' })

	await page.close()

	const buf = Buffer.from(new Uint8Array(raw))
	return { buffer: buf, contentType: 'image/png' }
}

function getBrowserLabel(url: string): string {
	try {
		const parsed = new URL(url)
		return parsed.hostname
	} catch {
		return 'Rendered capture'
	}
}

function stableSerialize(value: unknown): string {
	if (value === null || value === undefined) {
		return JSON.stringify(value)
	}
	if (Array.isArray(value)) {
		return `[${value.map(item => stableSerialize(item)).join(',')}]`
	}
	if (typeof value === 'object') {
		const entries = Object.entries(value as Record<string, unknown>)
			.sort(([a], [b]) => a.localeCompare(b))
			.map(
				([key, nestedValue]) =>
					`${JSON.stringify(key)}:${stableSerialize(nestedValue)}`
			)

		return `{${entries.join(',')}}`
	}
	return JSON.stringify(value)
}

async function applyLocale(page: Page, locale: string): Promise<void> {
	await page.setExtraHTTPHeaders({
		'Accept-Language': buildAcceptLanguageHeader(locale)
	})

	try {
		const session = await page.createCDPSession()
		await session.send('Emulation.setLocaleOverride', { locale })
		await page.evaluateOnNewDocument(currentLocale => {
			Object.defineProperty(navigator, 'language', {
				get: () => currentLocale
			})

			Object.defineProperty(navigator, 'languages', {
				get: () => {
					const baseLanguage = currentLocale.split('-')[0]
					return baseLanguage && baseLanguage !== currentLocale
						? [currentLocale, baseLanguage]
						: [currentLocale]
				}
			})
		}, locale)
	} catch (error) {
		console.error('Failed to apply locale override', error)
	}
}

async function removeCookieBanners(page: Page): Promise<void> {
	await page.addStyleTag({ content: COOKIE_BANNER_HIDE_CSS })

	for (let attempt = 0; attempt < 2; attempt++) {
		await page.evaluate(
			(selectors, acceptTextPatterns) => {
				function normalizeText(
					value: string | null | undefined
				): string {
					return (value ?? '')
						.toLowerCase()
						.normalize('NFKD')
						.replace(/[^\w\s]/g, ' ')
						.replace(/\s+/g, ' ')
						.trim()
				}

				function getRoots(): (Document | ShadowRoot)[] {
					const roots: (Document | ShadowRoot)[] = [document]
					const seen = new Set<ShadowRoot>()

					for (const element of document.querySelectorAll('*')) {
						const shadowRoot = (element as HTMLElement).shadowRoot
						if (shadowRoot && !seen.has(shadowRoot)) {
							seen.add(shadowRoot)
							roots.push(shadowRoot)
						}
					}

					return roots
				}

				function isBannerCandidate(element: Element): boolean {
					const htmlElement =
						element instanceof HTMLElement ? element : null
					if (!htmlElement) return false

					const text = normalizeText(htmlElement.textContent)
					const attrs = normalizeText(
						[
							htmlElement.id,
							htmlElement.className,
							htmlElement.getAttribute('aria-label'),
							htmlElement.getAttribute('data-testid')
						]
							.filter(Boolean)
							.join(' ')
					)
					const style = window.getComputedStyle(htmlElement)
					const isOverlayLike =
						style.position === 'fixed' ||
						style.position === 'sticky' ||
						Number.parseInt(style.zIndex || '0', 10) > 999

					return (
						isOverlayLike &&
						(attrs.includes('cookie') ||
							attrs.includes('consent') ||
							attrs.includes('gdpr') ||
							text.includes('cookie') ||
							text.includes('consent'))
					)
				}

				function clickCandidate(element: Element) {
					if (element instanceof HTMLElement) {
						element.click()
					}
				}

				const roots = getRoots()
				for (const root of roots) {
					for (const selector of selectors) {
						for (const element of root.querySelectorAll(selector)) {
							clickCandidate(element)
						}
					}

					for (const element of root.querySelectorAll(
						'button, [role="button"], input[type="button"], input[type="submit"], a'
					)) {
						const text = normalizeText(
							element.textContent ??
								(element instanceof HTMLInputElement
									? element.value
									: '')
						)
						if (
							acceptTextPatterns.some(pattern =>
								text.includes(pattern)
							)
						) {
							const bannerAncestor = element.closest(
								'[id*="cookie"], [class*="cookie"], [id*="consent"], [class*="consent"], [id*="gdpr"], [class*="gdpr"], #onetrust-banner-sdk, #CybotCookiebotDialog'
							)

							if (bannerAncestor || isBannerCandidate(element)) {
								clickCandidate(element)
							}
						}
					}

					for (const element of root.querySelectorAll('*')) {
						if (
							isBannerCandidate(element) &&
							element instanceof HTMLElement
						) {
							element.style.setProperty(
								'display',
								'none',
								'important'
							)
							element.style.setProperty(
								'visibility',
								'hidden',
								'important'
							)
						}
					}
				}
			},
			COOKIE_ACCEPT_SELECTORS,
			COOKIE_ACCEPT_TEXT_PATTERNS
		)

		await new Promise(resolve => setTimeout(resolve, 250))
	}
}

async function removePopupElements(page: Page): Promise<void> {
	await page.addStyleTag({ content: POPUP_HIDE_CSS })
	await page.evaluate(selectors => {
		const viewportArea = window.innerWidth * window.innerHeight

		function shouldRemove(element: Element): boolean {
			if (!(element instanceof HTMLElement)) {
				return false
			}

			const style = window.getComputedStyle(element)
			if (style.display === 'none' || style.visibility === 'hidden') {
				return false
			}

			const rect = element.getBoundingClientRect()
			if (rect.width < 120 || rect.height < 80) {
				return false
			}

			const zIndex = Number.parseInt(style.zIndex || '0', 10)
			const area = rect.width * rect.height
			const coversViewport = area / viewportArea > 0.25
			const keywordSource =
				`${element.id} ${element.className} ${element.getAttribute('role') ?? ''}`.toLowerCase()
			const looksLikePopup =
				keywordSource.includes('modal') ||
				keywordSource.includes('popup') ||
				keywordSource.includes('overlay') ||
				keywordSource.includes('lightbox') ||
				keywordSource.includes('interstitial') ||
				keywordSource.includes('newsletter') ||
				keywordSource.includes('subscribe') ||
				element.getAttribute('role') === 'dialog' ||
				element.getAttribute('role') === 'alertdialog'

			const positioned =
				style.position === 'fixed' ||
				style.position === 'sticky' ||
				style.position === 'absolute'

			return (
				looksLikePopup && positioned && (coversViewport || zIndex > 999)
			)
		}

		for (const selector of selectors) {
			for (const element of document.querySelectorAll(selector)) {
				if (shouldRemove(element)) {
					element.remove()
				}
			}
		}
	}, POPUP_REMOVE_SELECTORS)
}

async function launchBrowser(
	launchOptions: LaunchOptions = {}
): Promise<Browser> {
	const needsPlugins = launchOptions.stealth || launchOptions.blockAds

	if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
		const chromium = (await import('@sparticuz/chromium')).default
		const puppeteerCore = (await import('puppeteer-core')).default

		const args = [...chromium.args]
		if (launchOptions.stealth) {
			args.push(STEALTH_CHROME_ARG)
		}

		if (needsPlugins) {
			const { addExtra } = await import('puppeteer-extra')
			const puppeteer = addExtra(puppeteerCore)
			if (launchOptions.stealth) {
				const stealthPlugin = await import(
					'puppeteer-extra-plugin-stealth'
				)
				puppeteer.use(stealthPlugin.default())
			}
			if (launchOptions.blockAds) {
				const adblockerPlugin = await import(
					'puppeteer-extra-plugin-adblocker'
				)
				puppeteer.use(adblockerPlugin.default({ blockTrackers: true }))
			}
			return puppeteer.launch({
				args,
				defaultViewport: null,
				executablePath: await chromium.executablePath(),
				headless: chromium.headless
			})
		}

		return puppeteerCore.launch({
			args,
			defaultViewport: null,
			executablePath: await chromium.executablePath(),
			headless: chromium.headless
		})
	}

	const puppeteerCore = (await import('puppeteer-core')).default
	const possiblePaths = [
		'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
		'/usr/bin/google-chrome-stable',
		'/usr/bin/google-chrome',
		'/usr/bin/chromium-browser',
		'/usr/bin/chromium'
	]

	const baseArgs = ['--no-sandbox', '--disable-setuid-sandbox']
	if (launchOptions.stealth) {
		baseArgs.push(STEALTH_CHROME_ARG)
	}

	if (needsPlugins) {
		const { addExtra } = await import('puppeteer-extra')
		const puppeteer = addExtra(puppeteerCore)
		if (launchOptions.stealth) {
			const stealthPlugin = await import('puppeteer-extra-plugin-stealth')
			puppeteer.use(stealthPlugin.default())
		}
		if (launchOptions.blockAds) {
			const adblockerPlugin = await import(
				'puppeteer-extra-plugin-adblocker'
			)
			puppeteer.use(adblockerPlugin.default({ blockTrackers: true }))
		}

		for (const path of possiblePaths) {
			try {
				return await puppeteer.launch({
					executablePath: path,
					headless: true,
					args: baseArgs
				})
			} catch {}
		}
	} else {
		for (const path of possiblePaths) {
			try {
				return await puppeteerCore.launch({
					executablePath: path,
					headless: true,
					args: baseArgs
				})
			} catch {}
		}
	}

	throw new Error(
		'No Chrome/Chromium found. Install Chrome or set VERCEL env.'
	)
}

export function generateCacheKey({
	userId,
	options
}: {
	userId: string
	options: ScreenshotOptions
}): string {
	const { cacheTtl, ...rest } = options
	void cacheTtl
	const payload = stableSerialize({ userId, ...rest })
	return `sc_${createHash('sha256').update(payload).digest('hex')}`
}

export async function takeScreenshot(
	options: ScreenshotOptions
): Promise<{ buffer: Buffer; contentType: string }> {
	const browser = await launchBrowser({
		stealth: options.stealthMode,
		blockAds: options.blockAds
	})
	const resolutionCache = new Map<string, Promise<void>>()

	try {
		const page = await browser.newPage()

		if (options.html === undefined) {
			await assertSafeTargetUrl(options.url, resolutionCache)
		}

		if (!shouldAllowPrivateNetworkAccess()) {
			await page.setRequestInterception(true)
			page.on('request', request => {
				void (async () => {
					if (request.isInterceptResolutionHandled()) return

					const url = request.url()

					try {
						await assertSafeTargetUrl(url, resolutionCache)
					} catch (error) {
						if (error instanceof UnsafeTargetError) {
							if (!request.isInterceptResolutionHandled()) {
								await request.abort()
							}
							return
						}

						throw error
					}

					if (!request.isInterceptResolutionHandled()) {
						await request.continue()
					}
				})()
			})
		}

		const width = options.width ?? 1440
		const height = options.height ?? 900
		const deviceScaleFactor = options.devicePixelRatio ?? 1
		await page.setViewport({
			width,
			height,
			deviceScaleFactor
		})

		if (options.geoLocation) {
			try {
				const origin =
					options.html !== undefined
						? 'about:blank'
						: new URL(options.url).origin
				const context = browser.defaultBrowserContext()
				await context.overridePermissions(origin, ['geolocation'])
			} catch (error) {
				console.error(
					'Failed to override geolocation permissions',
					error
				)
			}
			await page.setGeolocation({
				latitude: options.geoLocation.latitude,
				longitude: options.geoLocation.longitude,
				accuracy: options.geoLocation.accuracy ?? 100
			})
		}

		if (options.timezone) {
			await page.emulateTimezone(options.timezone)
		}

		if (options.locale) {
			await applyLocale(page, options.locale)
		}

		if (options.colorScheme) {
			await page.emulateMediaFeatures([
				{ name: 'prefers-color-scheme', value: options.colorScheme }
			])
		}

		const waitUntil = options.waitUntil ?? 'networkidle2'

		if (options.html !== undefined) {
			await page.setContent(options.html, {
				waitUntil,
				timeout: 30_000
			})
		} else {
			await page.goto(options.url, {
				waitUntil,
				timeout: 30_000
			})
		}

		if (options.removeCookieBanners) {
			await removeCookieBanners(page)
		}

		if (options.removePopups) {
			await removePopupElements(page)
		}

		if (options.removeElements?.length) {
			const invalidSelectors = await page.evaluate(selectors => {
				const invalid: string[] = []

				for (const selector of selectors) {
					try {
						for (const element of document.querySelectorAll(
							selector
						)) {
							element.remove()
						}
					} catch {
						invalid.push(selector)
					}
				}

				return invalid
			}, options.removeElements)

			if ((invalidSelectors ?? []).length > 0) {
				throw new Error(
					`removeElements contains invalid selector: ${(invalidSelectors ?? [])[0]}`
				)
			}
		}

		if (options.cssInject) {
			await page.addStyleTag({ content: options.cssInject })
		}

		if (options.jsInject) {
			try {
				await page.evaluate(options.jsInject)
			} catch (error) {
				const message =
					error instanceof Error
						? error.message
						: 'Unknown jsInject error'
				throw new Error(`jsInject failed: ${message}`)
			}
		}

		if (options.waitForSelector) {
			await page.waitForSelector(options.waitForSelector, {
				timeout: 30_000
			})
		}

		if (options.preloadFonts) {
			await page.evaluate(async () => {
				const fonts = Array.from(document.fonts)
				await Promise.all(fonts.map(f => f.load().catch(() => {})))
				await document.fonts.ready
			})
		}

		await page.evaluate(() => document.fonts.ready)

		if (options.delay && options.delay > 0) {
			await new Promise(resolve => setTimeout(resolve, options.delay))
		}

		const captureType = options.type ?? 'png'

		if (captureType === 'pdf') {
			const pdf = await page.pdf({
				format: 'A4',
				printBackground: true
			})
			return {
				buffer: Buffer.from(pdf),
				contentType: 'application/pdf'
			}
		}

		const screenshot = await page.screenshot({
			type: captureType,
			quality:
				captureType !== 'png' ? (options.quality ?? 100) : undefined,
			fullPage: options.fullPage ?? false
		})

		let buffer: Buffer = Buffer.from(screenshot)
		let contentType = `image/${captureType}`

		if (options.mockupDevice) {
			const mockup = await applyDeviceMockup(
				browser,
				buffer,
				contentType,
				options.mockupDevice,
				width,
				height,
				getBrowserLabel(options.url)
			)
			buffer = mockup.buffer
			contentType = mockup.contentType
		}

		return { buffer, contentType }
	} finally {
		await browser.close()
	}
}
