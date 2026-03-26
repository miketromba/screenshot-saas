import type { ReactNode } from 'react'
import type { ContentPage } from '@/lib/content'
import { ArticleLayout } from './article-layout'
import { MarkdownRenderer } from './markdown-renderer'

export function ContentPageView({
	page,
	icon
}: {
	page: ContentPage
	icon?: ReactNode
}) {
	const { frontmatter, content } = page

	return (
		<ArticleLayout
			breadcrumbs={frontmatter.breadcrumbs}
			title={frontmatter.title}
			description={frontmatter.description}
			lastUpdated={frontmatter.lastUpdated}
			relatedPages={frontmatter.relatedPages}
			faq={frontmatter.faq}
			jsonLd={frontmatter.jsonLd}
			icon={icon}
		>
			<MarkdownRenderer content={content} />
		</ArticleLayout>
	)
}
