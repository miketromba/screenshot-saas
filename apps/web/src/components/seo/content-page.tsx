import type { ContentPage } from '@/lib/content'
import { ArticleLayout } from './article-layout'
import { MarkdownRenderer } from './markdown-renderer'

export function ContentPageView({ page }: { page: ContentPage }) {
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
		>
			<MarkdownRenderer content={content} />
		</ArticleLayout>
	)
}
