// Free tier
export const FREE_TIER_SCREENSHOTS = 200
export const FREE_TIER_DESCRIPTION = '200 free screenshots per month'
export const FREE_TIER_CTA =
	'Get 200 free screenshots per month. No credit card required.'

// Subscription tiers for marketing copy
export const SUBSCRIPTION_TIERS = [
	{
		name: 'Free',
		slug: 'free',
		monthlyPrice: 0,
		annualPrice: 0,
		screenshotsPerMonth: 200,
		perScreenshot: null,
		overageRate: null,
		features: [
			'200 screenshots/month',
			'PNG, JPEG, WebP, PDF output',
			'Full-page capture',
			'Ad blocking',
			'Cookie banner removal',
			'Custom viewports',
			'Light & dark mode',
			'Smart wait strategies',
			'Community support'
		]
	},
	{
		name: 'Starter',
		slug: 'starter',
		monthlyPrice: 19,
		annualPrice: 15,
		screenshotsPerMonth: 5_000,
		perScreenshot: '$0.0038',
		overageRate: '$0.006',
		features: [
			'5,000 screenshots/month',
			'Everything in Free',
			'Response caching',
			'HTML rendering',
			'CSS/JS injection',
			'Email support'
		]
	},
	{
		name: 'Growth',
		slug: 'growth',
		monthlyPrice: 49,
		annualPrice: 39,
		screenshotsPerMonth: 25_000,
		perScreenshot: '$0.0020',
		overageRate: '$0.004',
		popular: true,
		features: [
			'25,000 screenshots/month',
			'Everything in Starter',
			'Webhooks',
			'S3 upload',
			'Signed URLs',
			'Stealth mode',
			'Priority support'
		]
	},
	{
		name: 'Scale',
		slug: 'scale',
		monthlyPrice: 149,
		annualPrice: 119,
		screenshotsPerMonth: 100_000,
		perScreenshot: '$0.0015',
		overageRate: '$0.003',
		features: [
			'100,000 screenshots/month',
			'Everything in Growth',
			'Retina/HiDPI capture',
			'Timezone emulation',
			'Locale emulation',
			'Dedicated support'
		]
	}
] as const

// Credit packs for marketing copy
export const CREDIT_PACK_TIERS = [
	{
		name: 'Starter',
		credits: 1_000,
		price: 9,
		perScreenshot: '$0.0090'
	},
	{
		name: 'Growth',
		credits: 5_000,
		price: 29,
		perScreenshot: '$0.0058',
		popular: true
	},
	{
		name: 'Pro',
		credits: 25_000,
		price: 99,
		perScreenshot: '$0.0040'
	},
	{
		name: 'Scale',
		credits: 100_000,
		price: 299,
		perScreenshot: '$0.0030'
	}
] as const

export const POLAR_PRODUCT_IDS = {
	starter: {
		monthly: 'f179a4ae-ba40-4fcb-bbd4-946312f5886a',
		annual: 'a4277d25-7b90-4ca4-9980-194d1cb971a5'
	},
	growth: {
		monthly: 'd9ed84db-6f4f-44f4-9ab9-140493ebca24',
		annual: '85b79aab-1ec9-4d08-a28f-9a10e5404cd4'
	},
	scale: {
		monthly: '7e917602-7f26-4d55-89d9-2a03df45de74',
		annual: '4c59d2f0-bd88-4c01-a289-b4986b7549fa'
	}
} as const

// Complete feature list for marketing
export const ALL_FEATURES = [
	'PNG, JPEG, WebP, PDF output',
	'Custom viewports',
	'Full-page capture',
	'Light & dark mode (colorScheme)',
	'Smart wait strategies',
	'Ad blocking',
	'Cookie banner removal',
	'Response caching',
	'HTML rendering',
	'CSS/JS injection',
	'Stealth mode',
	'Signed URLs',
	'Webhooks',
	'S3 upload',
	'Retina/HiDPI (2x, 3x)',
	'Timezone emulation',
	'Locale emulation',
	'PDF export',
	'5+ official SDKs',
	'Interactive playground'
] as const

// Competitor pricing data (for comparison pages)
export const COMPETITORS = {
	screenshotone: {
		name: 'ScreenshotOne',
		url: 'screenshotone.com',
		freeCredits: '100/month',
		plans: [
			{ name: 'Basic', price: 17, screenshots: 2_000 },
			{ name: 'Growth', price: 79, screenshots: 10_000 },
			{ name: 'Scale', price: 259, screenshots: 50_000 }
		],
		strengths: [
			'Custom feature development',
			'Strong documentation',
			'GPU rendering on Scale'
		],
		weaknesses: ['Higher per-screenshot cost', 'Features gated by tier']
	},
	urlbox: {
		name: 'Urlbox',
		url: 'urlbox.io',
		freeCredits: '7-day trial',
		plans: [
			{ name: 'Lo-Fi', price: 19, screenshots: 2_000 },
			{ name: 'Hi-Fi', price: 49, screenshots: 5_000 },
			{ name: 'Ultra', price: 99, screenshots: 15_000 }
		],
		strengths: [
			'Stealth rendering',
			'Most comprehensive features',
			'Enterprise SLAs'
		],
		weaknesses: ['Most expensive', 'Strict tier-gating', 'No free tier']
	},
	apiflash: {
		name: 'ApiFlash',
		url: 'apiflash.com',
		freeCredits: '100/month',
		plans: [
			{ name: 'Lite', price: 7, screenshots: 1_000 },
			{ name: 'Medium', price: 35, screenshots: 10_000 },
			{ name: 'Large', price: 180, screenshots: 100_000 }
		],
		strengths: ['AWS Lambda-based', 'Very stable', 'Simple API'],
		weaknesses: ['Fewer features', 'No ad blocking', 'No stealth mode']
	},
	screenshotmachine: {
		name: 'ScreenshotMachine',
		url: 'screenshotmachine.com',
		freeCredits: '100/month',
		plans: [
			{ name: 'Basic', price: 9, screenshots: 2_500 },
			{ name: 'Pro', price: 59, screenshots: 20_000 },
			{ name: 'Enterprise', price: 99, screenshots: 50_000 }
		],
		strengths: ['Longest track record', 'GIF support', 'EUR pricing'],
		weaknesses: ['Dated interface', 'Limited SDK support']
	},
	scrapingbee: {
		name: 'ScrapingBee',
		url: 'scrapingbee.com',
		freeCredits: '1,000 credits',
		plans: [
			{ name: 'Freelance', price: 49, screenshots: null },
			{ name: 'Startup', price: 99, screenshots: null },
			{ name: 'Business', price: 599, screenshots: null }
		],
		strengths: [
			'Full scraping suite',
			'Residential proxies',
			'JS rendering'
		],
		weaknesses: [
			'Screenshots are secondary feature',
			'5+ credits per JS request'
		]
	},
	microlink: {
		name: 'Microlink',
		url: 'microlink.io',
		freeCredits: '50 req/day',
		plans: [{ name: 'Pro', price: 39, screenshots: 46_000 }],
		strengths: ['Metadata extraction', 'Link previews', '240+ CDN edges'],
		weaknesses: [
			'Complex pricing',
			'Broadest scope (not screenshot-focused)'
		]
	},
	screenshotlayer: {
		name: 'Screenshotlayer',
		url: 'screenshotlayer.com',
		freeCredits: '100/month',
		plans: [
			{ name: 'Basic', price: 20, screenshots: 5_000 },
			{ name: 'Pro', price: 40, screenshots: 15_000 },
			{ name: 'Business', price: 80, screenshots: 50_000 }
		],
		strengths: ['S3/FTP export', 'CSS injection'],
		weaknesses: ['Part of APILayer marketplace', 'Fewer modern features']
	},
	browshot: {
		name: 'Browshot',
		url: 'browshot.com',
		freeCredits: '100/month',
		plans: [],
		strengths: ['Pay-as-you-go', 'Desktop browser instances'],
		weaknesses: ['Credit-based only', 'No subscription option', 'Dated UI']
	}
} as const

export type CompetitorKey = keyof typeof COMPETITORS

// Standard marketing copy blocks
export const SIGNUP_CTA =
	'Sign up and get 200 free screenshots per month. No credit card required.'
export const PRICING_CTA =
	'Start free with 200 screenshots/month. Scale with flexible subscriptions or credit packs.'
export const PRICING_SUMMARY =
	'Subscriptions from $19/month for 5,000 screenshots. Credit packs from $9 for 1,000 screenshots. 200 free screenshots/month on signup.'
