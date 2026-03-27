import type { Metadata } from 'next'
import { type ContentPage, getAllContentPages } from '@/lib/content'

export const metadata: Metadata = {
	title: 'Changelog — ScreenshotAPI',
	description: 'Latest updates, features, and improvements to ScreenshotAPI.',
	alternates: { canonical: 'https://screenshotapi.to/changelog' }
}

function ChangelogEntry({ page }: { page: ContentPage }) {
	const date = new Date(page.frontmatter.lastUpdated)
	const formatted = date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	})

	return (
		<article className="relative border-b border-border pb-10 last:border-b-0">
			<div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
				<div className="shrink-0 sm:w-36">
					<time
						dateTime={page.frontmatter.lastUpdated}
						className="text-sm font-medium text-muted-foreground"
					>
						{formatted}
					</time>
				</div>
				<div className="flex-1">
					<h2 className="text-xl font-semibold tracking-tight">
						{page.frontmatter.title}
					</h2>
					<p className="mt-2 text-sm text-muted-foreground">
						{page.frontmatter.description}
					</p>
					<div
						className="prose prose-sm mt-4 max-w-none text-muted-foreground dark:prose-invert [&_li]:my-0.5 [&_ul]:my-2"
						dangerouslySetInnerHTML={{
							__html: simpleMarkdownToHtml(page.content)
						}}
					/>
				</div>
			</div>
		</article>
	)
}

function simpleMarkdownToHtml(md: string): string {
	return md
		.replace(
			/^### (.+)$/gm,
			'<h3 class="text-base font-semibold mt-4 mb-2 text-foreground">$1</h3>'
		)
		.replace(
			/^## (.+)$/gm,
			'<h2 class="text-lg font-semibold mt-6 mb-2 text-foreground">$2</h2>'
		)
		.replace(/^- (.+)$/gm, '<li>$1</li>')
		.replace(
			/(<li>.*<\/li>\n?)+/g,
			match => `<ul class="list-disc pl-5">${match}</ul>`
		)
		.replace(
			/`([^`]+)`/g,
			'<code class="rounded bg-muted px-1.5 py-0.5 text-xs">$1</code>'
		)
		.replace(
			/\*\*([^*]+)\*\*/g,
			'<strong class="font-semibold text-foreground">$1</strong>'
		)
		.replace(/\n\n/g, '<br/>')
}

export default function ChangelogPage() {
	const entries = getAllContentPages('changelog').sort((a, b) =>
		b.frontmatter.lastUpdated.localeCompare(a.frontmatter.lastUpdated)
	)

	return (
		<div className="mx-auto max-w-3xl px-6 py-16">
			<div className="mb-12 text-center">
				<h1 className="text-3xl font-bold tracking-tight">Changelog</h1>
				<p className="mt-2 text-muted-foreground">
					New features, improvements, and fixes to ScreenshotAPI
				</p>
			</div>

			{entries.length === 0 ? (
				<p className="text-center text-muted-foreground">
					No changelog entries yet.
				</p>
			) : (
				<div className="space-y-10">
					{entries.map(entry => (
						<ChangelogEntry key={entry.slug} page={entry} />
					))}
				</div>
			)}
		</div>
	)
}
