import type { ReactNode } from 'react'
import { Breadcrumbs } from './breadcrumbs'
import { CTABlock } from './cta-block'
import { FAQSection } from './faq-section'
import { RelatedPages } from './related-pages'

export function ArticleLayout({
	breadcrumbs,
	title,
	description,
	lastUpdated,
	children,
	relatedPages,
	faq,
	jsonLd
}: {
	breadcrumbs: { label: string; href?: string }[]
	title: string
	description: string
	lastUpdated: string
	children: ReactNode
	relatedPages?: { title: string; description: string; href: string }[]
	faq?: { question: string; answer: string }[]
	jsonLd?: Record<string, unknown>
}) {
	return (
		<article className="py-12 md:py-16">
			<div className="mx-auto max-w-4xl px-6">
				{jsonLd && (
					<script
						type="application/ld+json"
						dangerouslySetInnerHTML={{
							__html: JSON.stringify(jsonLd)
						}}
					/>
				)}

				<Breadcrumbs items={breadcrumbs} />

				<header className="mt-6">
					<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
						{title}
					</h1>
					<p className="mt-4 text-lg text-muted-foreground">
						{description}
					</p>
					<p className="mt-3 text-xs text-muted-foreground">
						Last updated: {lastUpdated}
					</p>
				</header>

				<CTABlock variant="compact" />

				<div className="mt-12 space-y-12">{children}</div>

				{faq && faq.length > 0 && <FAQSection items={faq} />}

				{relatedPages && relatedPages.length > 0 && (
					<RelatedPages pages={relatedPages} />
				)}

				<CTABlock />
			</div>
		</article>
	)
}
