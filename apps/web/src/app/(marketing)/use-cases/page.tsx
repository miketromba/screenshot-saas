import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllContentPages } from '@/lib/content'

export const metadata: Metadata = {
	title: 'Use Cases',
	description:
		'Explore how teams use ScreenshotAPI for OG images, link previews, visual regression testing, website monitoring, and more.'
}

export default function UseCasesHub() {
	const pages = getAllContentPages('use-cases')

	return (
		<div className="py-12 md:py-16">
			<div className="mx-auto max-w-5xl px-6">
				<header className="text-center">
					<h1 className="text-4xl font-bold tracking-tight">
						Use Cases
					</h1>
					<p className="mt-4 text-lg text-muted-foreground">
						See how developers and teams use ScreenshotAPI to solve
						real problems.
					</p>
				</header>

				<div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{pages.map(p => (
						<Link
							key={p.slug}
							href={`/use-cases/${p.slug}`}
							className="cursor-pointer rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-muted/30"
						>
							<h3 className="font-semibold">
								{p.frontmatter.title}
							</h3>
							<p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
								{p.frontmatter.description}
							</p>
						</Link>
					))}
				</div>
			</div>
		</div>
	)
}
