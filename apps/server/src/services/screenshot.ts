import type { Browser } from 'puppeteer-core'

export interface ScreenshotOptions {
	url: string
	width?: number
	height?: number
	fullPage?: boolean
	type?: 'png' | 'webp' | 'jpeg'
	quality?: number
	colorScheme?: 'light' | 'dark'
	waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2'
	waitForSelector?: string
	delay?: number
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

export async function takeScreenshot(
	options: ScreenshotOptions
): Promise<{ buffer: Buffer; contentType: string }> {
	const browser = await launchBrowser()

	try {
		const page = await browser.newPage()
		await page.setViewport({
			width: options.width ?? 1440,
			height: options.height ?? 900
		})

		if (options.colorScheme) {
			await page.emulateMediaFeatures([
				{ name: 'prefers-color-scheme', value: options.colorScheme }
			])
		}

		await page.goto(options.url, {
			waitUntil: options.waitUntil ?? 'networkidle2',
			timeout: 30_000
		})

		if (options.waitForSelector) {
			await page.waitForSelector(options.waitForSelector, {
				timeout: 30_000
			})
		}

		await page.evaluate(() => document.fonts.ready)

		if (options.delay && options.delay > 0) {
			await new Promise(resolve => setTimeout(resolve, options.delay))
		}

		const imageType = options.type ?? 'png'
		const screenshot = await page.screenshot({
			type: imageType,
			quality: imageType !== 'png' ? (options.quality ?? 100) : undefined,
			fullPage: options.fullPage ?? false
		})

		return {
			buffer: Buffer.from(screenshot),
			contentType: `image/${imageType}`
		}
	} finally {
		await browser.close()
	}
}
