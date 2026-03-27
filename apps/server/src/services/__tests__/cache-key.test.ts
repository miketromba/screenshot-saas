import { describe, expect, it } from 'bun:test'
import { generateCacheKey } from '../screenshot'

describe('generateCacheKey', () => {
	it('same options produce same cache key', () => {
		const opts = {
			url: 'https://example.com',
			width: 1280,
			type: 'png' as const
		}
		expect(generateCacheKey(opts)).toBe(generateCacheKey(opts))
	})

	it('different URLs produce different keys', () => {
		const key1 = generateCacheKey({ url: 'https://example.com' })
		const key2 = generateCacheKey({ url: 'https://other.com' })
		expect(key1).not.toBe(key2)
	})

	it('different width produces different keys', () => {
		const key1 = generateCacheKey({
			url: 'https://example.com',
			width: 1280
		})
		const key2 = generateCacheKey({
			url: 'https://example.com',
			width: 800
		})
		expect(key1).not.toBe(key2)
	})

	it('different type produces different keys', () => {
		const key1 = generateCacheKey({
			url: 'https://example.com',
			type: 'png'
		})
		const key2 = generateCacheKey({
			url: 'https://example.com',
			type: 'webp'
		})
		expect(key1).not.toBe(key2)
	})

	it('cacheTtl is excluded from the key', () => {
		const key1 = generateCacheKey({
			url: 'https://example.com',
			cacheTtl: 60
		})
		const key2 = generateCacheKey({
			url: 'https://example.com',
			cacheTtl: 3600
		})
		const key3 = generateCacheKey({ url: 'https://example.com' })
		expect(key1).toBe(key2)
		expect(key1).toBe(key3)
	})

	it('key format starts with sc_', () => {
		const key = generateCacheKey({ url: 'https://example.com' })
		expect(key.startsWith('sc_')).toBe(true)
	})

	it('is deterministic', () => {
		const opts = {
			url: 'https://example.com',
			width: 1440,
			height: 900,
			fullPage: true,
			type: 'jpeg' as const,
			quality: 80
		}
		const results = Array.from({ length: 10 }, () => generateCacheKey(opts))
		const unique = new Set(results)
		expect(unique.size).toBe(1)
	})
})
