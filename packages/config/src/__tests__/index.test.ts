import { describe, expect, it } from 'bun:test'
import {
	CREDIT_PACKS,
	FREE_MONTHLY_SCREENSHOTS,
	PRODUCT_NAME,
	SUBSCRIPTION_PLANS,
	SUPPORT_EMAIL
} from '../index'

describe('config', () => {
	it('should have a product name', () => {
		expect(PRODUCT_NAME).toBe('ScreenshotAPI')
	})

	it('should have a valid support email', () => {
		expect(SUPPORT_EMAIL).toContain('@')
	})

	it('should provide 200 free monthly screenshots', () => {
		expect(FREE_MONTHLY_SCREENSHOTS).toBe(200)
	})
})

describe('subscription plans', () => {
	it('should have 4 plans', () => {
		expect(Object.keys(SUBSCRIPTION_PLANS)).toHaveLength(4)
	})

	it('should have free plan with 200 screenshots', () => {
		expect(SUBSCRIPTION_PLANS.free.screenshotsPerMonth).toBe(200)
		expect(SUBSCRIPTION_PLANS.free.monthlyPriceCents).toBe(0)
	})

	it('should have increasing screenshots per tier', () => {
		const plans = ['free', 'starter', 'growth', 'scale'] as const
		for (let i = 1; i < plans.length; i++) {
			expect(
				SUBSCRIPTION_PLANS[plans[i]!].screenshotsPerMonth
			).toBeGreaterThan(
				SUBSCRIPTION_PLANS[plans[i - 1]!].screenshotsPerMonth
			)
		}
	})

	it('should have annual prices lower than monthly', () => {
		for (const plan of ['starter', 'growth', 'scale'] as const) {
			expect(SUBSCRIPTION_PLANS[plan].annualPriceCents).toBeLessThan(
				SUBSCRIPTION_PLANS[plan].monthlyPriceCents
			)
		}
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
