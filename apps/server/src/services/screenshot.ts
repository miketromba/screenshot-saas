import type { Browser } from 'puppeteer-core'

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

		return {
			buffer: Buffer.from(screenshot),
			contentType: `image/${captureType}`
		}
	} finally {
		await browser.close()
	}
}
