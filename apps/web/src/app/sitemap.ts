import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://screenshotapi.to'

const comparePages = [
	'screenshotapi-vs-puppeteer',
	'screenshotapi-vs-playwright',
	'screenshotapi-vs-urlbox',
	'screenshotapi-vs-screenshotlayer',
	'screenshotapi-vs-apiflash',
	'screenshotapi-vs-browserless',
	'screenshotapi-vs-scrapingbee',
	'screenshotapi-vs-screenshotmachine',
	'screenshotapi-vs-microlink',
	'best-screenshot-api',
	'free-screenshot-api',
	'urlbox-alternatives',
	'screenshotlayer-alternatives',
	'browserless-alternatives',
	'puppeteer-screenshot-alternatives',
	'apiflash-alternatives'
]

const blogPages = [
	'how-to-take-screenshots-with-python',
	'how-to-take-screenshots-with-javascript',
	'how-to-take-screenshots-with-go',
	'how-to-take-screenshots-with-ruby',
	'how-to-take-screenshots-with-php',
	'how-to-take-screenshots-with-curl',
	'how-to-take-screenshots-with-csharp',
	'how-to-take-screenshots-with-java',
	'how-to-generate-og-images-from-url',
	'how-to-take-full-page-screenshots',
	'how-to-capture-dark-mode-screenshots',
	'how-to-build-link-previews',
	'how-to-automate-website-screenshots',
	'how-to-take-mobile-screenshots-of-websites',
	'how-to-convert-html-to-image',
	'how-to-screenshot-single-page-applications',
	'how-to-build-visual-regression-testing-pipeline',
	'how-to-add-website-thumbnails-to-your-app',
	'best-screenshot-apis',
	'best-free-screenshot-apis',
	'best-og-image-generators',
	'best-url-to-image-apis',
	'best-html-to-image-apis',
	'migrate-from-puppeteer',
	'migrate-from-playwright',
	'migrate-from-urlbox',
	'migrate-from-screenshotlayer',
	'migrate-from-browserless'
]

const useCasePages = [
	'og-image-generation',
	'link-previews',
	'visual-regression-testing',
	'website-monitoring',
	'directory-thumbnails',
	'pdf-generation',
	'social-media-automation',
	'archiving',
	'competitor-monitoring',
	'reporting'
]

const integrationPages = [
	'nextjs',
	'react',
	'django',
	'flask',
	'rails',
	'laravel',
	'express',
	'fastapi',
	'wordpress',
	'vercel',
	'aws-lambda',
	'cloudflare-workers',
	'github-actions'
]

export default function sitemap(): MetadataRoute.Sitemap {
	const now = new Date().toISOString()

	const staticPages: MetadataRoute.Sitemap = [
		{
			url: BASE_URL,
			lastModified: now,
			changeFrequency: 'weekly',
			priority: 1
		},
		{
			url: `${BASE_URL}/pricing`,
			lastModified: now,
			changeFrequency: 'weekly',
			priority: 0.9
		},
		{
			url: `${BASE_URL}/docs`,
			lastModified: now,
			changeFrequency: 'weekly',
			priority: 0.8
		},
		{
			url: `${BASE_URL}/compare`,
			lastModified: now,
			changeFrequency: 'weekly',
			priority: 0.8
		},
		{
			url: `${BASE_URL}/use-cases`,
			lastModified: now,
			changeFrequency: 'weekly',
			priority: 0.8
		},
		{
			url: `${BASE_URL}/integrations`,
			lastModified: now,
			changeFrequency: 'weekly',
			priority: 0.8
		},
		{
			url: `${BASE_URL}/blog`,
			lastModified: now,
			changeFrequency: 'weekly',
			priority: 0.8
		}
	]

	const compare: MetadataRoute.Sitemap = comparePages.map(slug => ({
		url: `${BASE_URL}/compare/${slug}`,
		lastModified: now,
		changeFrequency: 'monthly',
		priority: 0.8
	}))

	const blog: MetadataRoute.Sitemap = blogPages.map(slug => ({
		url: `${BASE_URL}/blog/${slug}`,
		lastModified: now,
		changeFrequency: 'monthly',
		priority: 0.7
	}))

	const useCases: MetadataRoute.Sitemap = useCasePages.map(slug => ({
		url: `${BASE_URL}/use-cases/${slug}`,
		lastModified: now,
		changeFrequency: 'monthly',
		priority: 0.7
	}))

	const integrations: MetadataRoute.Sitemap = integrationPages.map(slug => ({
		url: `${BASE_URL}/integrations/${slug}`,
		lastModified: now,
		changeFrequency: 'monthly',
		priority: 0.7
	}))

	return [...staticPages, ...compare, ...blog, ...useCases, ...integrations]
}
