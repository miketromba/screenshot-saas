import type { MetadataRoute } from 'next'
import { getAllSlugs } from '@/lib/content'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://screenshotapi.to'

const sections = ['compare', 'blog', 'use-cases', 'integrations'] as const

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
		...sections.map(s => ({
			url: `${BASE_URL}/${s}`,
			lastModified: now,
			changeFrequency: 'weekly' as const,
			priority: 0.8
		}))
	]

	const contentPages: MetadataRoute.Sitemap = sections.flatMap(section =>
		getAllSlugs(section).map(slug => ({
			url: `${BASE_URL}/${section}/${slug}`,
			lastModified: now,
			changeFrequency: 'monthly' as const,
			priority: section === 'compare' ? 0.8 : 0.7
		}))
	)

	return [...staticPages, ...contentPages]
}
