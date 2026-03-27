import { describe, expect, it } from 'bun:test'
import { generateSignedUrl, verifySignedUrl } from '../src/services/signed-urls'

const BASE_URL = 'https://api.screenshotapi.to/v1/screenshot'
const SECRET = 'integration-test-secret-key-abc123'

describe('signed URLs integration', () => {
	it('round-trips: generate → verify → extract params match originals', () => {
		const originalParams = {
			url: 'https://example.com',
			width: '1280',
			height: '720',
			type: 'webp',
			fullPage: 'true'
		}

		const signedUrl = generateSignedUrl({
			baseUrl: BASE_URL,
			apiKeySecret: SECRET,
			params: originalParams
		})

		const result = verifySignedUrl({ url: signedUrl, apiKeySecret: SECRET })

		expect(result.valid).toBe(true)
		expect(result.reason).toBeUndefined()
		expect(result.params).toEqual(originalParams)
	})

	it('different API keys produce mutually invalid signatures', () => {
		const params = { url: 'https://example.com', width: '1024' }

		const urlFromKeyA = generateSignedUrl({
			baseUrl: BASE_URL,
			apiKeySecret: 'key-alpha',
			params
		})
		const urlFromKeyB = generateSignedUrl({
			baseUrl: BASE_URL,
			apiKeySecret: 'key-beta',
			params
		})

		const sigA = new URL(urlFromKeyA).searchParams.get('sig')
		const sigB = new URL(urlFromKeyB).searchParams.get('sig')
		expect(sigA).not.toBe(sigB)

		expect(
			verifySignedUrl({ url: urlFromKeyA, apiKeySecret: 'key-beta' })
				.valid
		).toBe(false)
		expect(
			verifySignedUrl({ url: urlFromKeyB, apiKeySecret: 'key-alpha' })
				.valid
		).toBe(false)
	})

	it('expired URL fails verification', () => {
		const signedUrl = generateSignedUrl({
			baseUrl: BASE_URL,
			apiKeySecret: SECRET,
			params: { url: 'https://example.com' },
			expiresInSeconds: -1
		})

		const result = verifySignedUrl({ url: signedUrl, apiKeySecret: SECRET })

		expect(result.valid).toBe(false)
		expect(result.reason).toBe('Signed URL has expired')
	})

	it('adding extra params after signing invalidates the URL', () => {
		const signedUrl = generateSignedUrl({
			baseUrl: BASE_URL,
			apiKeySecret: SECRET,
			params: { url: 'https://example.com' }
		})

		const tampered = new URL(signedUrl)
		tampered.searchParams.set('width', '9999')

		const result = verifySignedUrl({
			url: tampered.toString(),
			apiKeySecret: SECRET
		})

		expect(result.valid).toBe(false)
		expect(result.reason).toBe('Invalid signature')
	})

	it('removing params after signing invalidates the URL', () => {
		const signedUrl = generateSignedUrl({
			baseUrl: BASE_URL,
			apiKeySecret: SECRET,
			params: { url: 'https://example.com', width: '1280', type: 'png' }
		})

		const tampered = new URL(signedUrl)
		tampered.searchParams.delete('width')

		const result = verifySignedUrl({
			url: tampered.toString(),
			apiKeySecret: SECRET
		})

		expect(result.valid).toBe(false)
		expect(result.reason).toBe('Invalid signature')
	})

	it('handles very long URLs with many params', () => {
		const params: Record<string, string> = {
			url: 'https://example.com/very/long/path?existing=query'
		}
		for (let i = 0; i < 50; i++) {
			params[`param${i}`] = `value-${i}-${'x'.repeat(20)}`
		}

		const signedUrl = generateSignedUrl({
			baseUrl: BASE_URL,
			apiKeySecret: SECRET,
			params
		})

		expect(signedUrl.length).toBeGreaterThan(2000)

		const result = verifySignedUrl({ url: signedUrl, apiKeySecret: SECRET })

		expect(result.valid).toBe(true)
		expect(result.params).toEqual(params)
	})

	it('handles special characters in param values correctly', () => {
		const params = {
			url: 'https://example.com/path?foo=bar&baz=qux#fragment',
			selector: '#main > div.content[data-id="123"]',
			emoji: '🚀✨',
			unicode: 'café résumé naïve',
			encoded: 'hello%20world&key=val',
			spaces: 'hello world foo bar'
		}

		const signedUrl = generateSignedUrl({
			baseUrl: BASE_URL,
			apiKeySecret: SECRET,
			params
		})

		const result = verifySignedUrl({ url: signedUrl, apiKeySecret: SECRET })

		expect(result.valid).toBe(true)
		expect(result.params).toEqual(params)
	})
})
