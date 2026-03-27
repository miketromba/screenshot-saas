import type { Browser } from 'puppeteer-core'

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

const STEALTH_USER_AGENT =
	'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

const COOKIE_BANNER_HIDE_CSS = `[class*="cookie"], [id*="cookie"], [class*="consent"], [id*="consent"],
[class*="CookieBanner"], [class*="cookie-banner"], [class*="gdpr"],
[id*="gdpr"], .cc-banner, .cc-window, #onetrust-banner-sdk,
.onetrust-pc-dark-filter, #CybotCookiebotDialog, .cookieConsent,
[aria-label*="cookie"], [aria-label*="consent"]
{ display: none !important; visibility: hidden !important; }`

const COOKIE_ACCEPT_SELECTORS = [
	'[class*="cookie"] button[class*="accept"]',
	'[class*="cookie"] button[class*="agree"]',
	'[id*="cookie"] button',
	'#onetrust-accept-btn-handler',
	'.cc-btn.cc-dismiss',
	'button[data-cookieconsent="accept"]',
	'#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll'
]

const AD_URL_BLOCK_SUBSTRINGS = [
	'doubleclick.net',
	'googlesyndication.com',
	'googleadservices.com',
	'google-analytics.com',
	'facebook.net/tr',
	'analytics',
	'adservice',
	'pagead',
	'ads'
] as const

function isBlockedAdUrl(url: string): boolean {
	const lower = url.toLowerCase()
	return AD_URL_BLOCK_SUBSTRINGS.some(sub => lower.includes(sub))
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

function getBrowserMockupHtml(dataUri: string, w: number, h: number): string {
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
<div class="chrome"><div class="dots"><div class="dot r"></div><div class="dot y"></div><div class="dot g"></div></div><div class="bar">example.com</div></div>
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
.screen img{display:block;width:${w}px;height:${h}px;object-fit:cover}
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
	device: 'browser' | 'iphone' | 'macbook',
	width: number,
	height: number
): Promise<{ buffer: Buffer; contentType: string }> {
	const base64 = screenshotBuffer.toString('base64')
	const dataUri = `data:image/png;base64,${base64}`

	let html: string
	switch (device) {
		case 'browser':
			html = getBrowserMockupHtml(dataUri, width, height)
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

async function launchBrowser(): Promise<Browser> {
	if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
		const chromium = (await import('@sparticuz/chromium')).default
		const puppeteer = (await import('puppeteer-core')).default
		return puppeteer.launch({
			args: chromium.args,
			defaultViewport: null,
			executablePath: await chromium.executablePath(),
			headless: chromium.headless
		})
	}

	const puppeteer = (await import('puppeteer-core')).default
	const possiblePaths = [
		'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
		'/usr/bin/google-chrome-stable',
		'/usr/bin/google-chrome',
		'/usr/bin/chromium-browser',
		'/usr/bin/chromium'
	]

	for (const path of possiblePaths) {
		try {
			return await puppeteer.launch({
				executablePath: path,
				headless: true,
				args: ['--no-sandbox', '--disable-setuid-sandbox']
			})
		} catch {}
	}

	throw new Error(
		'No Chrome/Chromium found. Install Chrome or set VERCEL env.'
	)
}

async function launchBrowserStealth(): Promise<Browser> {
	if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
		const chromium = (await import('@sparticuz/chromium')).default
		const puppeteer = (await import('puppeteer-core')).default
		return puppeteer.launch({
			args: [...chromium.args, STEALTH_CHROME_ARG],
			defaultViewport: null,
			executablePath: await chromium.executablePath(),
			headless: chromium.headless
		})
	}

	const puppeteer = (await import('puppeteer-core')).default
	const possiblePaths = [
		'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
		'/usr/bin/google-chrome-stable',
		'/usr/bin/google-chrome',
		'/usr/bin/chromium-browser',
		'/usr/bin/chromium'
	]

	for (const path of possiblePaths) {
		try {
			return await puppeteer.launch({
				executablePath: path,
				headless: true,
				args: [
					'--no-sandbox',
					'--disable-setuid-sandbox',
					STEALTH_CHROME_ARG
				]
			})
		} catch {}
	}

	throw new Error(
		'No Chrome/Chromium found. Install Chrome or set VERCEL env.'
	)
}

export function generateCacheKey(options: ScreenshotOptions): string {
	const { cacheTtl, ...rest } = options
	void cacheTtl
	const sorted = JSON.stringify(rest, Object.keys(rest).sort())
	let hash = 0
	for (let i = 0; i < sorted.length; i++) {
		const char = sorted.charCodeAt(i)
		hash = (hash << 5) - hash + char
		hash |= 0
	}
	return `sc_${Math.abs(hash).toString(36)}`
}

export async function takeScreenshot(
	options: ScreenshotOptions
): Promise<{ buffer: Buffer; contentType: string }> {
	const browser = await (options.stealthMode
		? launchBrowserStealth()
		: launchBrowser())

	try {
		const page = await browser.newPage()

		if (options.stealthMode) {
			await page.evaluateOnNewDocument(() => {
				Object.defineProperty(navigator, 'webdriver', {
					get: () => false
				})
			})
			await page.setUserAgent(STEALTH_USER_AGENT)
		}

		if (options.blockAds) {
			await page.setRequestInterception(true)
			page.on('request', request => {
				const url = request.url()
				const blocked = isBlockedAdUrl(url)
				if (blocked) {
					void request.abort()
				} else {
					void request.continue()
				}
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
			} catch {}
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
			await page.setExtraHTTPHeaders({
				'Accept-Language': options.locale
			})
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
			await page.addStyleTag({ content: COOKIE_BANNER_HIDE_CSS })
			await page.evaluate(selectors => {
				for (const sel of selectors) {
					const el = document.querySelector(sel)
					if (el instanceof HTMLElement) {
						el.click()
						return
					}
				}
			}, COOKIE_ACCEPT_SELECTORS)
			await new Promise(resolve => setTimeout(resolve, 500))
		}

		if (options.removePopups) {
			await page.addStyleTag({ content: POPUP_HIDE_CSS })
			await page.evaluate(selectors => {
				for (const sel of selectors) {
					for (const el of document.querySelectorAll(sel)) {
						const style = window.getComputedStyle(el)
						const zIndex = Number.parseInt(style.zIndex, 10)
						if (
							style.position === 'fixed' ||
							style.position === 'sticky' ||
							(!Number.isNaN(zIndex) && zIndex > 999)
						) {
							el.remove()
						}
					}
				}
			}, POPUP_REMOVE_SELECTORS)
		}

		if (options.removeElements?.length) {
			await page.evaluate(selectors => {
				for (const sel of selectors) {
					for (const el of document.querySelectorAll(sel)) {
						el.remove()
					}
				}
			}, options.removeElements)
		}

		if (options.cssInject) {
			await page.addStyleTag({ content: options.cssInject })
		}

		if (options.jsInject) {
			try {
				await page.evaluate(options.jsInject)
			} catch {}
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
				options.mockupDevice,
				width,
				height
			)
			buffer = mockup.buffer
			contentType = mockup.contentType
		}

		return { buffer, contentType }
	} finally {
		await browser.close()
	}
}
