import { describe, expect, it } from 'bun:test'
import { generateSignedUrl, verifySignedUrl } from '../signed-urls'

const BASE_URL = 'https://api.screenshotapi.to/v1/screenshot'
const SECRET = 'test-secret-key-abc123'

describe('generateSignedUrl', () => {
	it('returns a URL with sig and expires params', () => {
		const url = generateSignedUrl({
			baseUrl: BASE_URL,
			apiKeySecret: SECRET,
			params: { url: 'https://example.com' }
		})
		const parsed = new URL(url)
		expect(parsed.searchParams.has('sig')).toBe(true)
		expect(parsed.searchParams.has('expires')).toBe(true)
	})

	it('includes all provided params in the URL', () => {
		const url = generateSignedUrl({
			baseUrl: BASE_URL,
			apiKeySecret: SECRET,
			params: {
				url: 'https://example.com',
				width: '1280',
				type: 'webp'
			}
		})
		const parsed = new URL(url)
		expect(parsed.searchParams.get('url')).toBe('https://example.com')
		expect(parsed.searchParams.get('width')).toBe('1280')
		expect(parsed.searchParams.get('type')).toBe('webp')
	})

	it('is deterministic — same inputs produce same output', () => {
		const opts = {
			baseUrl: BASE_URL,
			apiKeySecret: SECRET,
			params: { url: 'https://example.com' },
			expiresInSeconds: 3600
		} as const

		const url1 = generateSignedUrl(opts)
		const url2 = generateSignedUrl(opts)
		expect(url1).toBe(url2)
	})

	it('produces different signatures for different apiKeySecret values', () => {
		const params = { url: 'https://example.com' }
		const url1 = generateSignedUrl({
			baseUrl: BASE_URL,
			apiKeySecret: 'secret-one',
			params
		})
		const url2 = generateSignedUrl({
			baseUrl: BASE_URL,
			apiKeySecret: 'secret-two',
			params
		})

		const sig1 = new URL(url1).searchParams.get('sig')
		const sig2 = new URL(url2).searchParams.get('sig')
		expect(sig1).not.toBe(sig2)
	})
})

describe('verifySignedUrl', () => {
	it('returns valid: true for a freshly generated URL', () => {
		const url = generateSignedUrl({
			baseUrl: BASE_URL,
			apiKeySecret: SECRET,
			params: { url: 'https://example.com' }
		})
		const result = verifySignedUrl({ url, apiKeySecret: SECRET })
		expect(result.valid).toBe(true)
		expect(result.reason).toBeUndefined()
	})

	it('returns the original params (minus sig/expires) on success', () => {
		const url = generateSignedUrl({
			baseUrl: BASE_URL,
			apiKeySecret: SECRET,
			params: {
				url: 'https://example.com',
				width: '1280',
				type: 'png'
			}
		})
		const result = verifySignedUrl({ url, apiKeySecret: SECRET })
		expect(result.valid).toBe(true)
		expect(result.params).toEqual({
			url: 'https://example.com',
			width: '1280',
			type: 'png'
		})
		expect(result.params).not.toHaveProperty('sig')
		expect(result.params).not.toHaveProperty('expires')
	})

	it('returns invalid with reason when URL has expired', () => {
		const url = generateSignedUrl({
			baseUrl: BASE_URL,
			apiKeySecret: SECRET,
			params: { url: 'https://example.com' },
			expiresInSeconds: -1
		})
		const result = verifySignedUrl({ url, apiKeySecret: SECRET })
		expect(result.valid).toBe(false)
		expect(result.reason).toBe('Signed URL has expired')
	})

	it('returns invalid when signature is tampered with', () => {
		const url = generateSignedUrl({
			baseUrl: BASE_URL,
			apiKeySecret: SECRET,
			params: { url: 'https://example.com' }
		})
		const parsed = new URL(url)
		parsed.searchParams.set('sig', 'a'.repeat(64))
		const result = verifySignedUrl({
			url: parsed.toString(),
			apiKeySecret: SECRET
		})
		expect(result.valid).toBe(false)
		expect(result.reason).toBe('Invalid signature')
	})

	it('returns invalid when sig param is removed', () => {
		const url = generateSignedUrl({
			baseUrl: BASE_URL,
			apiKeySecret: SECRET,
			params: { url: 'https://example.com' }
		})
		const parsed = new URL(url)
		parsed.searchParams.delete('sig')
		const result = verifySignedUrl({
			url: parsed.toString(),
			apiKeySecret: SECRET
		})
		expect(result.valid).toBe(false)
		expect(result.reason).toBe('Missing signature or expiration')
	})

	it('returns invalid when expires param is removed', () => {
		const url = generateSignedUrl({
			baseUrl: BASE_URL,
			apiKeySecret: SECRET,
			params: { url: 'https://example.com' }
		})
		const parsed = new URL(url)
		parsed.searchParams.delete('expires')
		const result = verifySignedUrl({
			url: parsed.toString(),
			apiKeySecret: SECRET
		})
		expect(result.valid).toBe(false)
		expect(result.reason).toBe('Missing signature or expiration')
	})

	it('returns invalid for signature length mismatch (timing-safe comparison)', () => {
		const url = generateSignedUrl({
			baseUrl: BASE_URL,
			apiKeySecret: SECRET,
			params: { url: 'https://example.com' }
		})
		const parsed = new URL(url)
		parsed.searchParams.set('sig', 'deadbeef')
		const result = verifySignedUrl({
			url: parsed.toString(),
			apiKeySecret: SECRET
		})
		expect(result.valid).toBe(false)
		expect(result.reason).toBe('Invalid signature')
	})
})
