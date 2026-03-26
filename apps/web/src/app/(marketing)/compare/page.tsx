import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllContentPages } from '@/lib/content'

export const metadata: Metadata = {
	title: 'Compare Screenshot APIs',
	description:
		'See how ScreenshotAPI compares to Puppeteer, Playwright, Urlbox, and other screenshot tools. Honest feature and pricing comparisons.'
}

const categories = [
	{
		label: 'vs Competitors',
		filter: (slug: string) => slug.startsWith('screenshotapi-vs-')
	},
	{
		label: 'Alternatives',
		filter: (slug: string) => slug.endsWith('-alternatives')
	},
	{
		label: 'Best Of',
		filter: (slug: string) =>
			slug.startsWith('best-') || slug.startsWith('free-')
	}
]

export default function CompareHub() {
	const pages = getAllContentPages('compare')

	return (
		<div className="py-12 md:py-16">
			<div className="mx-auto max-w-5xl px-6">
				<header className="text-center">
					<h1 className="text-4xl font-bold tracking-tight">
						Compare Screenshot APIs
					</h1>
					<p className="mt-4 text-lg text-muted-foreground">
						Honest, detailed comparisons to help you choose the
						right screenshot solution.
					</p>
				</header>

				{categories.map(cat => {
					const catPages = pages.filter(p => cat.filter(p.slug))
					if (catPages.length === 0) return null

					return (
						<section key={cat.label} className="mt-14">
							<h2 className="text-2xl font-bold tracking-tight">
								{cat.label}
							</h2>
							<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
								{catPages.map(p => (
									<Link
										key={p.slug}
										href={`/compare/${p.slug}`}
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
						</section>
					)
				})}
			</div>
		</div>
	)
}
