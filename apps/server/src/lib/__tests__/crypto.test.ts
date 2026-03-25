import { describe, expect, it } from 'bun:test'
import { generateApiKey, getKeyPrefix, hashApiKey } from '../crypto'

describe('generateApiKey', () => {
	it('should start with sk_live_ prefix', () => {
		const key = generateApiKey()
		expect(key.startsWith('sk_live_')).toBe(true)
	})

	it('should be at least 72 characters', () => {
		const key = generateApiKey()
		expect(key.length).toBeGreaterThanOrEqual(72)
	})

	it('should generate unique keys', () => {
		const keys = new Set(Array.from({ length: 50 }, () => generateApiKey()))
		expect(keys.size).toBe(50)
	})
})

describe('hashApiKey', () => {
	it('should produce deterministic output', async () => {
		const key = 'sk_live_test123'
		const hash1 = await hashApiKey(key)
		const hash2 = await hashApiKey(key)
		expect(hash1).toBe(hash2)
	})

	it('should produce different hashes for different keys', async () => {
		const hash1 = await hashApiKey('sk_live_key1')
		const hash2 = await hashApiKey('sk_live_key2')
		expect(hash1).not.toBe(hash2)
	})

	it('should return a 64-char hex string', async () => {
		const hash = await hashApiKey('sk_live_test')
		expect(hash.length).toBe(64)
		expect(/^[0-9a-f]+$/.test(hash)).toBe(true)
	})
})

describe('getKeyPrefix', () => {
	it('should return first 12 characters', () => {
		const key = 'sk_live_abcdef1234567890'
		expect(getKeyPrefix(key)).toBe('sk_live_abcd')
	})
})
