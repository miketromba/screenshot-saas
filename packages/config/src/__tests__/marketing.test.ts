import { describe, expect, it } from 'bun:test'
import {
	ALL_FEATURES,
	COMPETITORS,
	CREDIT_PACK_TIERS,
	FREE_TIER_SCREENSHOTS,
	SUBSCRIPTION_TIERS
} from '../marketing'

describe('SUBSCRIPTION_TIERS', () => {
	it('has 4 tiers', () => {
		expect(SUBSCRIPTION_TIERS).toHaveLength(4)
	})

	it('free tier has 200 screenshots and $0 price', () => {
		const free = SUBSCRIPTION_TIERS[0]
		expect(free.name).toBe('Free')
		expect(free.screenshotsPerMonth).toBe(200)
		expect(free.monthlyPrice).toBe(0)
		expect(free.annualPrice).toBe(0)
	})

	it('tiers are in ascending monthly price order', () => {
		for (let i = 1; i < SUBSCRIPTION_TIERS.length; i++) {
			expect(SUBSCRIPTION_TIERS[i].monthlyPrice).toBeGreaterThanOrEqual(
				SUBSCRIPTION_TIERS[i - 1].monthlyPrice
			)
		}
	})

	it('annual prices are lower than monthly for paid tiers', () => {
		const paidTiers = SUBSCRIPTION_TIERS.filter(t => t.monthlyPrice > 0)
		expect(paidTiers.length).toBeGreaterThan(0)
		for (const tier of paidTiers) {
			expect(tier.annualPrice).toBeLessThan(tier.monthlyPrice)
		}
	})

	it('each tier has a features array with at least 1 entry', () => {
		for (const tier of SUBSCRIPTION_TIERS) {
			expect(tier.features.length).toBeGreaterThanOrEqual(1)
		}
	})
})

describe('CREDIT_PACK_TIERS', () => {
	it('has 4 packs', () => {
		expect(CREDIT_PACK_TIERS).toHaveLength(4)
	})

	it('packs are in ascending credit order', () => {
		for (let i = 1; i < CREDIT_PACK_TIERS.length; i++) {
			expect(CREDIT_PACK_TIERS[i].credits).toBeGreaterThan(
				CREDIT_PACK_TIERS[i - 1].credits
			)
		}
	})

	it('per-screenshot cost decreases with higher packs', () => {
		const costs = CREDIT_PACK_TIERS.map(p =>
			Number.parseFloat(p.perScreenshot.replace('$', ''))
		)
		for (let i = 1; i < costs.length; i++) {
			expect(costs[i]).toBeLessThan(costs[i - 1])
		}
	})

	it('exactly one pack is marked popular', () => {
		const popular = CREDIT_PACK_TIERS.filter(
			p => 'popular' in p && p.popular === true
		)
		expect(popular).toHaveLength(1)
	})
})

describe('ALL_FEATURES', () => {
	it('has at least 15 features', () => {
		expect(ALL_FEATURES.length).toBeGreaterThanOrEqual(15)
	})
})

describe('COMPETITORS', () => {
	const entries = Object.values(COMPETITORS)

	it('has at least 5 competitors', () => {
		expect(entries.length).toBeGreaterThanOrEqual(5)
	})

	it('each competitor has name, url, and plans array', () => {
		for (const competitor of entries) {
			expect(typeof competitor.name).toBe('string')
			expect(competitor.name.length).toBeGreaterThan(0)
			expect(typeof competitor.url).toBe('string')
			expect(competitor.url.length).toBeGreaterThan(0)
			expect(Array.isArray(competitor.plans)).toBe(true)
		}
	})
})

describe('FREE_TIER_SCREENSHOTS', () => {
	it('equals 200', () => {
		expect(FREE_TIER_SCREENSHOTS).toBe(200)
	})
})
