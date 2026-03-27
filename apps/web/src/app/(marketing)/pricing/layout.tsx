import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
	title: 'Pricing',
	description:
		'Subscription plans and credit packs for ScreenshotAPI. Start free with 200 screenshots/month, or scale with flexible pay-as-you-go credits.'
}

export default function PricingLayout({ children }: { children: ReactNode }) {
	return children
}
