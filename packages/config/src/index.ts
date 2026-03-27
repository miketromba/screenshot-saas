export const PRODUCT_NAME = 'ScreenshotAPI'
export const PRODUCT_TAGLINE = 'The screenshot API that respects your time'
export const PRODUCT_DESCRIPTION =
	'A fast, reliable API for generating web page screenshots on demand. Flexible pricing with subscriptions and credit packs.'

export const SUPPORT_EMAIL = 'support@screenshotapi.to'

export const FREE_MONTHLY_SCREENSHOTS = 200

export const SUBSCRIPTION_PLANS = {
	free: {
		name: 'Free',
		screenshotsPerMonth: 200,
		monthlyPriceCents: 0,
		annualPriceCents: 0,
		perScreenshot: 0,
		overageRateCents: 0,
		features: [
			'200 screenshots/month',
			'All output formats',
			'Full-page capture',
			'Ad blocking',
			'PDF export',
			'Community support'
		]
	},
	starter: {
		name: 'Starter',
		screenshotsPerMonth: 5_000,
		monthlyPriceCents: 1_900,
		annualPriceCents: 1_500,
		perScreenshot: 0.0038,
		overageRateCents: 0.6,
		features: [
			'5,000 screenshots/month',
			'All output formats',
			'Full-page capture',
			'Ad blocking & cookie removal',
			'PDF export',
			'Response caching',
			'HTML rendering',
			'CSS/JS injection',
			'Email support'
		]
	},
	growth: {
		name: 'Growth',
		screenshotsPerMonth: 25_000,
		monthlyPriceCents: 4_900,
		annualPriceCents: 3_900,
		perScreenshot: 0.002,
		overageRateCents: 0.4,
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
	scale: {
		name: 'Scale',
		screenshotsPerMonth: 100_000,
		monthlyPriceCents: 14_900,
		annualPriceCents: 11_900,
		perScreenshot: 0.0015,
		overageRateCents: 0.3,
		features: [
			'100,000 screenshots/month',
			'Everything in Growth',
			'Retina/HiDPI capture',
			'Timezone emulation',
			'Locale emulation',
			'Dedicated support'
		]
	}
} as const

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS

export const CREDIT_PACKS = [
	{
		name: 'Starter',
		credits: 1_000,
		priceCents: 900,
		isPopular: false,
		sortOrder: 0
	},
	{
		name: 'Growth',
		credits: 5_000,
		priceCents: 2_900,
		isPopular: true,
		sortOrder: 1
	},
	{
		name: 'Pro',
		credits: 25_000,
		priceCents: 9_900,
		isPopular: false,
		sortOrder: 2
	},
	{
		name: 'Scale',
		credits: 100_000,
		priceCents: 29_900,
		isPopular: false,
		sortOrder: 3
	}
] as const

export type CreditPack = (typeof CREDIT_PACKS)[number]

export * from './marketing'
