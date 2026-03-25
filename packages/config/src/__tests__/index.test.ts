import { describe, expect, it } from 'bun:test'
import {
	CREDIT_PACKS,
	DEFAULT_AUTO_TOPUP_THRESHOLD,
	FREE_CREDITS,
	PRODUCT_NAME,
	SUPPORT_EMAIL
} from '../index'

describe('config', () => {
	it('should have a product name', () => {
		expect(PRODUCT_NAME).toBe('ScreenshotAPI')
	})

	it('should have a valid support email', () => {
		expect(SUPPORT_EMAIL).toContain('@')
	})

	it('should provide 5 free credits', () => {
		expect(FREE_CREDITS).toBe(5)
	})

	it('should have a default auto-topup threshold', () => {
		expect(DEFAULT_AUTO_TOPUP_THRESHOLD).toBeGreaterThan(0)
	})
})

describe('credit packs', () => {
	it('should have 4 packs', () => {
		expect(CREDIT_PACKS.length).toBe(4)
	})

	it('should be sorted by credits ascending', () => {
		for (let i = 1; i < CREDIT_PACKS.length; i++) {
			expect(CREDIT_PACKS[i]?.credits).toBeGreaterThan(
				CREDIT_PACKS[i - 1]?.credits
			)
		}
	})

	it('should have decreasing per-credit price', () => {
		for (let i = 1; i < CREDIT_PACKS.length; i++) {
			const prevRate =
				CREDIT_PACKS[i - 1]?.priceCents / CREDIT_PACKS[i - 1]?.credits
			const currRate =
				CREDIT_PACKS[i]?.priceCents / CREDIT_PACKS[i]?.credits
			expect(currRate).toBeLessThan(prevRate)
		}
	})

	it('should have exactly one popular pack', () => {
		const popular = CREDIT_PACKS.filter(p => p.isPopular)
		expect(popular.length).toBe(1)
	})

	it('should all have positive prices', () => {
		for (const pack of CREDIT_PACKS) {
			expect(pack.priceCents).toBeGreaterThan(0)
			expect(pack.credits).toBeGreaterThan(0)
		}
	})
})
