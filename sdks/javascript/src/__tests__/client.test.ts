import { afterEach, beforeEach, describe, expect, mock, test } from 'bun:test'
import { ScreenshotAPI } from '../client'
import {
	AuthenticationError,
	InsufficientCreditsError,
	InvalidAPIKeyError,
	ScreenshotAPIError,
	ScreenshotFailedError
} from '../errors'

const TEST_KEY = 'sk_test_abc123'

const originalFetch = globalThis.fetch

function mockFetch(handler: (url: string, init?: RequestInit) => Response) {
	globalThis.fetch = mock(handler) as typeof fetch
}

function successResponse(opts?: {
	contentType?: string
	creditsRemaining?: number
	screenshotId?: string
	durationMs?: number
}): Response {
	const headers = new Headers({
		'content-type': opts?.contentType ?? 'image/png',
		'x-credits-remaining': String(opts?.creditsRemaining ?? 950),
		'x-screenshot-id': opts?.screenshotId ?? 'ss_abc',
		'x-duration-ms': String(opts?.durationMs ?? 1234)
	})
	return new Response(new ArrayBuffer(64), { status: 200, headers })
}

function errorResponse(
	status: number,
	body: Record<string, unknown>
): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'content-type': 'application/json' }
	})
}

beforeEach(() => {
	globalThis.fetch = originalFetch
})

afterEach(() => {
	globalThis.fetch = originalFetch
})

// ─── Constructor ────────────────────────────────────────────────────

describe('constructor', () => {
	test('throws if no apiKey provided', () => {
		expect(() => new ScreenshotAPI({ apiKey: '' })).toThrow(
			'API key is required'
		)
	})

	test('sets default baseUrl to https://screenshotapi.to', () => {
		mockFetch(() => successResponse())
		const client = new ScreenshotAPI({ apiKey: TEST_KEY })
		client.screenshot({ url: 'https://example.com' })
		const calledUrl = (globalThis.fetch as ReturnType<typeof mock>).mock
			.calls[0][0] as string
		expect(calledUrl).toStartWith('https://screenshotapi.to/')
	})

	test('strips trailing slashes from baseUrl', () => {
		mockFetch(() => successResponse())
		const client = new ScreenshotAPI({
			apiKey: TEST_KEY,
			baseUrl: 'https://custom.api///'
		})
		client.screenshot({ url: 'https://example.com' })
		const calledUrl = (globalThis.fetch as ReturnType<typeof mock>).mock
			.calls[0][0] as string
		expect(calledUrl).toStartWith('https://custom.api/api/v1/screenshot')
	})

	test('uses custom baseUrl when provided', () => {
		mockFetch(() => successResponse())
		const client = new ScreenshotAPI({
			apiKey: TEST_KEY,
			baseUrl: 'https://my-proxy.internal'
		})
		client.screenshot({ url: 'https://example.com' })
		const calledUrl = (globalThis.fetch as ReturnType<typeof mock>).mock
			.calls[0][0] as string
		expect(calledUrl).toStartWith(
			'https://my-proxy.internal/api/v1/screenshot'
		)
	})

	test('sets default timeout to 60000', async () => {
		let signalUsed: AbortSignal | undefined
		mockFetch((_url, init) => {
			signalUsed = init?.signal as AbortSignal | undefined
			return successResponse()
		})
		const client = new ScreenshotAPI({ apiKey: TEST_KEY })
		await client.screenshot({ url: 'https://example.com' })
		expect(signalUsed).toBeDefined()
		expect(signalUsed?.aborted).toBe(false)
	})
})

// ─── screenshot() ───────────────────────────────────────────────────

describe('screenshot()', () => {
	test('throws if no url provided', async () => {
		const client = new ScreenshotAPI({ apiKey: TEST_KEY })
		expect(client.screenshot({ url: '' })).rejects.toThrow(
			'URL is required'
		)
	})

	test('builds correct URL with all query params', async () => {
		let capturedUrl = ''
		mockFetch(url => {
			capturedUrl = url
			return successResponse()
		})

		const client = new ScreenshotAPI({ apiKey: TEST_KEY })
		await client.screenshot({
			url: 'https://example.com',
			width: 1280,
			height: 720,
			fullPage: true,
			type: 'jpeg',
			quality: 80,
			colorScheme: 'dark',
			waitUntil: 'networkidle0',
			waitForSelector: '#main',
			delay: 500
		})

		const parsed = new URL(capturedUrl)
		expect(parsed.pathname).toBe('/api/v1/screenshot')
		expect(parsed.searchParams.get('url')).toBe('https://example.com')
		expect(parsed.searchParams.get('width')).toBe('1280')
		expect(parsed.searchParams.get('height')).toBe('720')
		expect(parsed.searchParams.get('fullPage')).toBe('true')
		expect(parsed.searchParams.get('type')).toBe('jpeg')
		expect(parsed.searchParams.get('quality')).toBe('80')
		expect(parsed.searchParams.get('colorScheme')).toBe('dark')
		expect(parsed.searchParams.get('waitUntil')).toBe('networkidle0')
		expect(parsed.searchParams.get('waitForSelector')).toBe('#main')
		expect(parsed.searchParams.get('delay')).toBe('500')
	})

	test('omits optional params when not provided', async () => {
		let capturedUrl = ''
		mockFetch(url => {
			capturedUrl = url
			return successResponse()
		})

		const client = new ScreenshotAPI({ apiKey: TEST_KEY })
		await client.screenshot({ url: 'https://example.com' })

		const parsed = new URL(capturedUrl)
		expect(parsed.searchParams.get('url')).toBe('https://example.com')
		expect(parsed.searchParams.has('width')).toBe(false)
		expect(parsed.searchParams.has('height')).toBe(false)
		expect(parsed.searchParams.has('fullPage')).toBe(false)
		expect(parsed.searchParams.has('type')).toBe(false)
		expect(parsed.searchParams.has('quality')).toBe(false)
	})

	test('sends x-api-key header', async () => {
		let capturedHeaders: HeadersInit | undefined
		mockFetch((_url, init) => {
			capturedHeaders = init?.headers
			return successResponse()
		})

		const client = new ScreenshotAPI({ apiKey: TEST_KEY })
		await client.screenshot({ url: 'https://example.com' })

		expect(capturedHeaders).toEqual({ 'x-api-key': TEST_KEY })
	})

	test('returns image buffer, metadata, and contentType on success', async () => {
		mockFetch(() =>
			successResponse({
				contentType: 'image/webp',
				creditsRemaining: 800,
				screenshotId: 'ss_xyz',
				durationMs: 2345
			})
		)

		const client = new ScreenshotAPI({ apiKey: TEST_KEY })
		const result = await client.screenshot({ url: 'https://example.com' })

		expect(result.image).toBeInstanceOf(ArrayBuffer)
		expect(result.image.byteLength).toBe(64)
		expect(result.contentType).toBe('image/webp')
		expect(result.metadata).toEqual({
			creditsRemaining: 800,
			screenshotId: 'ss_xyz',
			durationMs: 2345
		})
	})

	test('defaults contentType to image/png when header missing', async () => {
		const response = new Response(new ArrayBuffer(8), {
			status: 200,
			headers: {
				'x-credits-remaining': '100',
				'x-screenshot-id': 'ss_1',
				'x-duration-ms': '100'
			}
		})
		mockFetch(() => response)

		const client = new ScreenshotAPI({ apiKey: TEST_KEY })
		const result = await client.screenshot({ url: 'https://example.com' })
		expect(result.contentType).toBe('image/png')
	})

	test('defaults metadata fields to 0 / empty when headers missing', async () => {
		const response = new Response(new ArrayBuffer(8), { status: 200 })
		mockFetch(() => response)

		const client = new ScreenshotAPI({ apiKey: TEST_KEY })
		const result = await client.screenshot({ url: 'https://example.com' })
		expect(result.metadata.creditsRemaining).toBe(0)
		expect(result.metadata.screenshotId).toBe('')
		expect(result.metadata.durationMs).toBe(0)
	})

	// ─── Error handling ───────────────────────────────────────────────

	test('handles 401 → AuthenticationError', async () => {
		mockFetch(() => errorResponse(401, { error: 'Invalid authentication' }))

		const client = new ScreenshotAPI({ apiKey: TEST_KEY })
		try {
			await client.screenshot({ url: 'https://example.com' })
			expect.unreachable('should have thrown')
		} catch (err) {
			expect(err).toBeInstanceOf(AuthenticationError)
			expect((err as AuthenticationError).status).toBe(401)
			expect((err as AuthenticationError).code).toBe(
				'authentication_error'
			)
			expect((err as AuthenticationError).message).toBe(
				'Invalid authentication'
			)
		}
	})

	test('handles 402 → InsufficientCreditsError with balance', async () => {
		mockFetch(() =>
			errorResponse(402, {
				error: 'Not enough credits',
				balance: 5
			})
		)

		const client = new ScreenshotAPI({ apiKey: TEST_KEY })
		try {
			await client.screenshot({ url: 'https://example.com' })
			expect.unreachable('should have thrown')
		} catch (err) {
			expect(err).toBeInstanceOf(InsufficientCreditsError)
			expect((err as InsufficientCreditsError).status).toBe(402)
			expect((err as InsufficientCreditsError).balance).toBe(5)
			expect((err as InsufficientCreditsError).message).toBe(
				'Not enough credits'
			)
		}
	})

	test('handles 402 → defaults balance to 0 when not in body', async () => {
		mockFetch(() => errorResponse(402, { error: 'No credits' }))

		const client = new ScreenshotAPI({ apiKey: TEST_KEY })
		try {
			await client.screenshot({ url: 'https://example.com' })
			expect.unreachable('should have thrown')
		} catch (err) {
			expect((err as InsufficientCreditsError).balance).toBe(0)
		}
	})

	test('handles 403 → InvalidAPIKeyError', async () => {
		mockFetch(() => errorResponse(403, { error: 'API key is invalid' }))

		const client = new ScreenshotAPI({ apiKey: TEST_KEY })
		try {
			await client.screenshot({ url: 'https://example.com' })
			expect.unreachable('should have thrown')
		} catch (err) {
			expect(err).toBeInstanceOf(InvalidAPIKeyError)
			expect((err as InvalidAPIKeyError).status).toBe(403)
			expect((err as InvalidAPIKeyError).code).toBe('invalid_api_key')
		}
	})

	test('handles 500 → ScreenshotFailedError', async () => {
		mockFetch(() => errorResponse(500, { message: 'Render timed out' }))

		const client = new ScreenshotAPI({ apiKey: TEST_KEY })
		try {
			await client.screenshot({ url: 'https://example.com' })
			expect.unreachable('should have thrown')
		} catch (err) {
			expect(err).toBeInstanceOf(ScreenshotFailedError)
			expect((err as ScreenshotFailedError).status).toBe(500)
			expect((err as ScreenshotFailedError).message).toBe(
				'Render timed out'
			)
		}
	})

	test('handles 500 → defaults message to Screenshot failed', async () => {
		mockFetch(() => errorResponse(500, {}))

		const client = new ScreenshotAPI({ apiKey: TEST_KEY })
		try {
			await client.screenshot({ url: 'https://example.com' })
			expect.unreachable('should have thrown')
		} catch (err) {
			expect((err as ScreenshotFailedError).message).toBe(
				'Screenshot failed'
			)
		}
	})

	test('handles unknown error codes → ScreenshotAPIError', async () => {
		mockFetch(() => errorResponse(429, { error: 'Rate limited' }))

		const client = new ScreenshotAPI({ apiKey: TEST_KEY })
		try {
			await client.screenshot({ url: 'https://example.com' })
			expect.unreachable('should have thrown')
		} catch (err) {
			expect(err).toBeInstanceOf(ScreenshotAPIError)
			expect(err).not.toBeInstanceOf(AuthenticationError)
			expect((err as ScreenshotAPIError).status).toBe(429)
			expect((err as ScreenshotAPIError).code).toBe('unknown_error')
			expect((err as ScreenshotAPIError).message).toBe('Rate limited')
		}
	})

	test('handles non-JSON error response body', async () => {
		const response = new Response('Bad Gateway', {
			status: 502,
			statusText: 'Bad Gateway'
		})
		mockFetch(() => response)

		const client = new ScreenshotAPI({ apiKey: TEST_KEY })
		try {
			await client.screenshot({ url: 'https://example.com' })
			expect.unreachable('should have thrown')
		} catch (err) {
			expect(err).toBeInstanceOf(ScreenshotAPIError)
			expect((err as ScreenshotAPIError).status).toBe(502)
			expect((err as ScreenshotAPIError).code).toBe('unknown_error')
			expect((err as ScreenshotAPIError).message).toContain('502')
		}
	})

	test('uses error field then falls back to message field', async () => {
		mockFetch(() => errorResponse(400, { message: 'fallback msg' }))

		const client = new ScreenshotAPI({ apiKey: TEST_KEY })
		try {
			await client.screenshot({ url: 'https://example.com' })
			expect.unreachable('should have thrown')
		} catch (err) {
			expect((err as ScreenshotAPIError).message).toBe('fallback msg')
		}
	})

	// ─── Abort / timeout ─────────────────────────────────────────────

	test('respects timeout via AbortController', async () => {
		mockFetch((_url, init) => {
			const signal = init?.signal
			expect(signal).toBeDefined()
			expect(signal).toBeInstanceOf(AbortSignal)
			return successResponse()
		})

		const client = new ScreenshotAPI({
			apiKey: TEST_KEY,
			timeout: 5000
		})
		await client.screenshot({ url: 'https://example.com' })
		expect(globalThis.fetch).toHaveBeenCalledTimes(1)
	})

	test('uses GET method', async () => {
		let capturedMethod = ''
		mockFetch((_url, init) => {
			capturedMethod = init?.method ?? ''
			return successResponse()
		})

		const client = new ScreenshotAPI({ apiKey: TEST_KEY })
		await client.screenshot({ url: 'https://example.com' })
		expect(capturedMethod).toBe('GET')
	})
})
