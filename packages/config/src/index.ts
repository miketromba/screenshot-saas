export const PRODUCT_NAME = 'ScreenshotAPI'
export const PRODUCT_TAGLINE = 'Website screenshots via API, in seconds'
export const PRODUCT_DESCRIPTION =
	'A fast, reliable API for generating web page screenshots on demand. Pay per screenshot with simple credit-based pricing.'

export const SUPPORT_EMAIL = 'support@screenshotapi.dev'

export const FREE_CREDITS = 5
export const DEFAULT_AUTO_TOPUP_THRESHOLD = 10

export const CREDIT_PACKS = [
	{
		name: 'Starter',
		credits: 100,
		priceCents: 500,
		isPopular: false,
		sortOrder: 0
	},
	{
		name: 'Growth',
		credits: 500,
		priceCents: 2000,
		isPopular: true,
		sortOrder: 1
	},
	{
		name: 'Pro',
		credits: 2_000,
		priceCents: 6000,
		isPopular: false,
		sortOrder: 2
	},
	{
		name: 'Scale',
		credits: 10_000,
		priceCents: 20_000,
		isPopular: false,
		sortOrder: 3
	}
] as const

export type CreditPack = (typeof CREDIT_PACKS)[number]
