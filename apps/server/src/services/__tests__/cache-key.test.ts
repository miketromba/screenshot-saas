import { describe, expect, it } from 'bun:test'
import { generateCacheKey } from '../screenshot'

const USER_A = 'user-aaa-111'
const USER_B = 'user-bbb-222'

describe('generateCacheKey', () => {
	it('same user and options produce same cache key', () => {
		const options = {
			url: 'https://example.com',
			width: 1280,
			type: 'png' as const
		}
		expect(generateCacheKey({ userId: USER_A, options })).toBe(
			generateCacheKey({ userId: USER_A, options })
		)
	})

	it('different users produce different keys for same options', () => {
		const options = { url: 'https://example.com' }
		const key1 = generateCacheKey({ userId: USER_A, options })
		const key2 = generateCacheKey({ userId: USER_B, options })
		expect(key1).not.toBe(key2)
	})

	it('different URLs produce different keys', () => {
		const key1 = generateCacheKey({
			userId: USER_A,
			options: { url: 'https://example.com' }
		})
		const key2 = generateCacheKey({
			userId: USER_A,
			options: { url: 'https://other.com' }
		})
		expect(key1).not.toBe(key2)
	})

	it('different width produces different keys', () => {
		const key1 = generateCacheKey({
			userId: USER_A,
			options: { url: 'https://example.com', width: 1280 }
		})
		const key2 = generateCacheKey({
			userId: USER_A,
			options: { url: 'https://example.com', width: 800 }
		})
		expect(key1).not.toBe(key2)
	})

	it('different type produces different keys', () => {
		const key1 = generateCacheKey({
			userId: USER_A,
			options: { url: 'https://example.com', type: 'png' }
		})
		const key2 = generateCacheKey({
			userId: USER_A,
			options: { url: 'https://example.com', type: 'webp' }
		})
		expect(key1).not.toBe(key2)
	})

	it('cacheTtl is excluded from the key', () => {
		const key1 = generateCacheKey({
			userId: USER_A,
			options: { url: 'https://example.com', cacheTtl: 60 }
		})
		const key2 = generateCacheKey({
			userId: USER_A,
			options: { url: 'https://example.com', cacheTtl: 3600 }
		})
		const key3 = generateCacheKey({
			userId: USER_A,
			options: { url: 'https://example.com' }
		})
		expect(key1).toBe(key2)
		expect(key1).toBe(key3)
	})

	it('key format starts with sc_', () => {
		const key = generateCacheKey({
			userId: USER_A,
			options: { url: 'https://example.com' }
		})
		expect(key.startsWith('sc_')).toBe(true)
	})

	it('is deterministic', () => {
		const options = {
			url: 'https://example.com',
			width: 1440,
			height: 900,
			fullPage: true,
			type: 'jpeg' as const,
			quality: 80
		}
		const results = Array.from({ length: 10 }, () =>
			generateCacheKey({ userId: USER_A, options })
		)
		const unique = new Set(results)
		expect(unique.size).toBe(1)
	})

	it('normalizes nested object key order', () => {
		const key1 = generateCacheKey({
			userId: USER_A,
			options: {
				url: 'https://example.com',
				geoLocation: {
					latitude: 40.7128,
					longitude: -74.006,
					accuracy: 50
				}
			}
		})

		const key2 = generateCacheKey({
			userId: USER_A,
			options: {
				url: 'https://example.com',
				geoLocation: {
					accuracy: 50,
					longitude: -74.006,
					latitude: 40.7128
				}
			}
		})

		expect(key1).toBe(key2)
	})
})
