import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ContentPageView } from '@/components/seo/content-page'
import { getAllSlugs, getContentPage } from '@/lib/content'

const SECTION = 'blog'

export function generateStaticParams() {
	return getAllSlugs(SECTION).map(slug => ({ slug }))
}

export async function generateMetadata({
	params
}: {
	params: Promise<{ slug: string }>
}): Promise<Metadata> {
	const { slug } = await params
	const page = getContentPage(SECTION, slug)
	if (!page) return {}

	return {
		title: page.frontmatter.title,
		description: page.frontmatter.description,
		alternates: {
			canonical: `https://screenshotapi.to/${SECTION}/${slug}`
		}
	}
}

export default async function BlogPostPage({
	params
}: {
	params: Promise<{ slug: string }>
}) {
	const { slug } = await params
	const page = getContentPage(SECTION, slug)
	if (!page) notFound()

	return <ContentPageView page={page} />
}
