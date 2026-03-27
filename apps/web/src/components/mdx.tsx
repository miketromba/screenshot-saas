import defaultMdxComponents from 'fumadocs-ui/mdx'
import type { MDXComponents } from 'mdx/types'
import { ApiExplorer } from '@/components/api-explorer'
import {
	CompetitorComparison,
	CreditPackTable,
	FeatureList,
	FreeTierBanner,
	PricingSummary,
	ScreenshotAPIPricing
} from '@/components/content/marketing-blocks'

const marketingComponents = {
	ScreenshotAPIPricing,
	CreditPackTable,
	FreeTierBanner,
	FeatureList,
	CompetitorComparison,
	PricingSummary,
	ApiExplorer
} satisfies MDXComponents

export function getMDXComponents(components?: MDXComponents) {
	return {
		...defaultMdxComponents,
		...marketingComponents,
		...components
	} satisfies MDXComponents
}

export const useMDXComponents = getMDXComponents

declare global {
	type MDXProvidedComponents = ReturnType<typeof getMDXComponents>
}
