delete process.env.VERCEL
delete process.env.AWS_LAMBDA_FUNCTION_NAME

import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { generateCacheKey, takeScreenshot } from '../src/services/screenshot'

const CHROME_TIMEOUT = 30_000

let testServer: ReturnType<typeof Bun.serve>
let testUrl: string

beforeAll(() => {
	testServer = Bun.serve({
		port: 0,
		fetch(req) {
			const url = new URL(req.url)
			if (url.pathname === '/') {
				return new Response(
					`<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>Test Page</title>
<style>body { font-family: sans-serif; background: white; color: black; padding: 40px; }
.cookie-banner { position: fixed; bottom: 0; left: 0; right: 0; background: #333; color: white; padding: 20px; z-index: 9999; }
.cookie-banner button { background: green; color: white; border: none; padding: 8px 16px; cursor: pointer; }
.ad-container { background: #ff0; padding: 20px; margin: 20px 0; }
#injected { display: none; }
</style>
</head>
<body>
<h1 id="main-heading">Test Page</h1>
<p>This is a test page for screenshot integration tests.</p>
<div class="ad-container" id="ad-block">This is a simulated ad</div>
<div class="cookie-banner" id="cookie-consent">
    <p>We use cookies</p>
    <button class="cc-btn cc-dismiss" onclick="this.parentElement.style.display='none'">Accept</button>
</div>
<div id="injected">Hidden element</div>
<div id="timezone-display"></div>
<div id="locale-display"></div>
<script>
document.getElementById('timezone-display').textContent = Intl.DateTimeFormat().resolvedOptions().timeZone;
document.getElementById('locale-display').textContent = navigator.language;
</script>
</body></html>`,
					{ headers: { 'Content-Type': 'text/html' } }
				)
			}
			if (
				url.pathname.includes('googlesyndication') ||
				url.pathname.includes('doubleclick')
			) {
				return new Response('ad content', { status: 200 })
			}
			return new Response('Not found', { status: 404 })
		}
	})
	testUrl = `http://localhost:${testServer.port}`
})

afterAll(() => {
	testServer?.stop()
})

describe('basic screenshot', () => {
	it(
		'takes a PNG screenshot',
		async () => {
			const result = await takeScreenshot({ url: testUrl, type: 'png' })
			expect(result.buffer).toBeInstanceOf(Buffer)
			expect(result.buffer.length).toBeGreaterThan(0)
			expect(result.contentType).toBe('image/png')
		},
		CHROME_TIMEOUT
	)

	it(
		'takes a JPEG screenshot',
		async () => {
			const result = await takeScreenshot({
				url: testUrl,
				type: 'jpeg'
			})
			expect(result.buffer).toBeInstanceOf(Buffer)
			expect(result.buffer.length).toBeGreaterThan(0)
			expect(result.contentType).toBe('image/jpeg')
		},
		CHROME_TIMEOUT
	)

	it(
		'takes a WebP screenshot',
		async () => {
			const result = await takeScreenshot({
				url: testUrl,
				type: 'webp'
			})
			expect(result.buffer).toBeInstanceOf(Buffer)
			expect(result.buffer.length).toBeGreaterThan(0)
			expect(result.contentType).toBe('image/webp')
		},
		CHROME_TIMEOUT
	)

	it(
		'takes a screenshot with custom viewport',
		async () => {
			const result = await takeScreenshot({
				url: testUrl,
				width: 800,
				height: 600
			})
			expect(result.buffer).toBeInstanceOf(Buffer)
			expect(result.buffer.length).toBeGreaterThan(0)
		},
		CHROME_TIMEOUT
	)
})

describe('PDF export', () => {
	it(
		'returns a PDF buffer with correct content type',
		async () => {
			const result = await takeScreenshot({
				url: testUrl,
				type: 'pdf'
			})
			expect(result.buffer).toBeInstanceOf(Buffer)
			expect(result.buffer.length).toBeGreaterThan(0)
			expect(result.contentType).toBe('application/pdf')
		},
		CHROME_TIMEOUT
	)

	it(
		'buffer starts with PDF magic bytes',
		async () => {
			const result = await takeScreenshot({
				url: testUrl,
				type: 'pdf'
			})
			const header = result.buffer.subarray(0, 4).toString('ascii')
			expect(header).toBe('%PDF')
		},
		CHROME_TIMEOUT
	)
})

describe('HTML rendering', () => {
	it(
		'renders provided HTML as a screenshot',
		async () => {
			const result = await takeScreenshot({
				url: 'about:blank',
				html: '<h1>Hello</h1>'
			})
			expect(result.buffer).toBeInstanceOf(Buffer)
			expect(result.buffer.length).toBeGreaterThan(0)
		},
		CHROME_TIMEOUT
	)
})

describe('ad blocking', () => {
	it(
		'completes successfully with blockAds enabled',
		async () => {
			const result = await takeScreenshot({
				url: testUrl,
				blockAds: true
			})
			expect(result.buffer).toBeInstanceOf(Buffer)
			expect(result.buffer.length).toBeGreaterThan(0)
		},
		CHROME_TIMEOUT
	)
})

describe('cookie banner removal', () => {
	it(
		'completes successfully with removeCookieBanners enabled',
		async () => {
			const result = await takeScreenshot({
				url: testUrl,
				removeCookieBanners: true
			})
			expect(result.buffer).toBeInstanceOf(Buffer)
			expect(result.buffer.length).toBeGreaterThan(0)
		},
		CHROME_TIMEOUT
	)
})

describe('CSS injection', () => {
	it(
		'completes successfully with injected CSS',
		async () => {
			const result = await takeScreenshot({
				url: testUrl,
				cssInject: 'body { background: red !important; }'
			})
			expect(result.buffer).toBeInstanceOf(Buffer)
			expect(result.buffer.length).toBeGreaterThan(0)
		},
		CHROME_TIMEOUT
	)
})

describe('JS injection', () => {
	it(
		'completes successfully with injected JS',
		async () => {
			const result = await takeScreenshot({
				url: testUrl,
				jsInject:
					"document.getElementById('injected').style.display = 'block'"
			})
			expect(result.buffer).toBeInstanceOf(Buffer)
			expect(result.buffer.length).toBeGreaterThan(0)
		},
		CHROME_TIMEOUT
	)
})

describe('stealth mode', () => {
	it(
		'completes successfully with stealth mode enabled',
		async () => {
			const result = await takeScreenshot({
				url: testUrl,
				stealthMode: true
			})
			expect(result.buffer).toBeInstanceOf(Buffer)
			expect(result.buffer.length).toBeGreaterThan(0)
		},
		CHROME_TIMEOUT
	)
})

describe('device pixel ratio', () => {
	it(
		'completes successfully with 2x device pixel ratio',
		async () => {
			const result = await takeScreenshot({
				url: testUrl,
				width: 400,
				height: 300,
				devicePixelRatio: 2
			})
			expect(result.buffer).toBeInstanceOf(Buffer)
			expect(result.buffer.length).toBeGreaterThan(0)
		},
		CHROME_TIMEOUT
	)
})

describe('timezone emulation', () => {
	it(
		'completes successfully with timezone set',
		async () => {
			const result = await takeScreenshot({
				url: testUrl,
				timezone: 'America/New_York'
			})
			expect(result.buffer).toBeInstanceOf(Buffer)
			expect(result.buffer.length).toBeGreaterThan(0)
		},
		CHROME_TIMEOUT
	)
})

describe('locale emulation', () => {
	it(
		'completes successfully with locale set',
		async () => {
			const result = await takeScreenshot({
				url: testUrl,
				locale: 'fr-FR'
			})
			expect(result.buffer).toBeInstanceOf(Buffer)
			expect(result.buffer.length).toBeGreaterThan(0)
		},
		CHROME_TIMEOUT
	)
})

describe('full page capture', () => {
	it(
		'completes successfully with fullPage enabled',
		async () => {
			const result = await takeScreenshot({
				url: testUrl,
				fullPage: true
			})
			expect(result.buffer).toBeInstanceOf(Buffer)
			expect(result.buffer.length).toBeGreaterThan(0)
		},
		CHROME_TIMEOUT
	)
})

describe('color scheme', () => {
	it(
		'completes successfully with dark color scheme',
		async () => {
			const result = await takeScreenshot({
				url: testUrl,
				colorScheme: 'dark'
			})
			expect(result.buffer).toBeInstanceOf(Buffer)
			expect(result.buffer.length).toBeGreaterThan(0)
		},
		CHROME_TIMEOUT
	)

	it(
		'completes successfully with light color scheme',
		async () => {
			const result = await takeScreenshot({
				url: testUrl,
				colorScheme: 'light'
			})
			expect(result.buffer).toBeInstanceOf(Buffer)
			expect(result.buffer.length).toBeGreaterThan(0)
		},
		CHROME_TIMEOUT
	)
})

describe('generateCacheKey', () => {
	it('produces the same key for identical options', () => {
		const opts = { url: 'https://example.com', width: 800, height: 600 }
		const key1 = generateCacheKey(opts)
		const key2 = generateCacheKey(opts)
		expect(key1).toBe(key2)
	})

	it('produces different keys for different options', () => {
		const key1 = generateCacheKey({
			url: 'https://example.com',
			width: 800
		})
		const key2 = generateCacheKey({
			url: 'https://example.com',
			width: 1024
		})
		expect(key1).not.toBe(key2)
	})
})
