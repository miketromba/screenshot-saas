import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllContentPages } from '@/lib/content'

export const metadata: Metadata = {
	title: 'Use Cases',
	description:
		'Explore how teams use ScreenshotAPI for OG images, link previews, visual regression testing, website monitoring, and more.'
}

const useCasesMeta: Record<
	string,
	{ icon: React.ReactNode; accent: string; category: string }
> = {
	'og-image-generation': {
		icon: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
			/>
		),
		accent: 'text-violet-500 bg-violet-500/10',
		category: 'generate'
	},
	'link-previews': {
		icon: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
			/>
		),
		accent: 'text-sky-500 bg-sky-500/10',
		category: 'generate'
	},
	'social-media-automation': {
		icon: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
			/>
		),
		accent: 'text-pink-500 bg-pink-500/10',
		category: 'generate'
	},
	'directory-thumbnails': {
		icon: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
			/>
		),
		accent: 'text-amber-500 bg-amber-500/10',
		category: 'generate'
	},
	'pdf-generation': {
		icon: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
			/>
		),
		accent: 'text-emerald-500 bg-emerald-500/10',
		category: 'generate'
	},
	'visual-regression-testing': {
		icon: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
			/>
		),
		accent: 'text-rose-500 bg-rose-500/10',
		category: 'monitor'
	},
	'website-monitoring': {
		icon: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
			/>
		),
		accent: 'text-blue-500 bg-blue-500/10',
		category: 'monitor'
	},
	'competitor-monitoring': {
		icon: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
			/>
		),
		accent: 'text-orange-500 bg-orange-500/10',
		category: 'monitor'
	},
	archiving: {
		icon: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
			/>
		),
		accent: 'text-teal-500 bg-teal-500/10',
		category: 'record'
	},
	reporting: {
		icon: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605"
			/>
		),
		accent: 'text-indigo-500 bg-indigo-500/10',
		category: 'record'
	}
}

const featured = [
	'og-image-generation',
	'visual-regression-testing',
	'website-monitoring'
]

const categories = [
	{
		key: 'generate',
		label: 'Generate',
		description: 'Create visual assets from any URL',
		slugOrder: [
			'og-image-generation',
			'link-previews',
			'social-media-automation',
			'directory-thumbnails',
			'pdf-generation'
		]
	},
	{
		key: 'monitor',
		label: 'Monitor',
		description: 'Watch for visual changes over time',
		slugOrder: [
			'website-monitoring',
			'competitor-monitoring',
			'visual-regression-testing'
		]
	},
	{
		key: 'record',
		label: 'Record',
		description: 'Capture and preserve for the long term',
		slugOrder: ['archiving', 'reporting']
	}
]

function UseCaseIcon({
	slug,
	size = 'md'
}: {
	slug: string
	size?: 'sm' | 'md'
}) {
	const meta = useCasesMeta[slug]
	if (!meta) return null

	const sizeClasses =
		size === 'md' ? 'h-11 w-11 rounded-xl' : 'h-9 w-9 rounded-lg'
	const iconSize = size === 'md' ? 'h-5.5 w-5.5' : 'h-4.5 w-4.5'

	return (
		<div
			className={`flex shrink-0 items-center justify-center ${sizeClasses} ${meta.accent}`}
		>
			<svg
				className={`${iconSize} ${meta.accent.split(' ')[0]}`}
				fill="none"
				viewBox="0 0 24 24"
				strokeWidth={1.5}
				stroke="currentColor"
			>
				{meta.icon}
			</svg>
		</div>
	)
}

export default function UseCasesHub() {
	const pages = getAllContentPages('use-cases')

	const featuredPages = featured
		.map(slug => pages.find(p => p.slug === slug))
		.filter(Boolean)

	return (
		<>
			{/* Hero */}
			<section className="relative overflow-hidden">
				<div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,var(--muted)_0%,transparent_100%)]" />
				<div className="mx-auto max-w-6xl px-6 pb-16 pt-20 md:pb-20 md:pt-28">
					<div className="mx-auto max-w-3xl text-center">
						<div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
							<span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
							10 production use cases
						</div>
						<h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
							One API, endless
							<br />
							<span className="text-muted-foreground">
								possibilities
							</span>
						</h1>
						<p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
							See how developers and teams use ScreenshotAPI to
							generate images, monitor websites, and automate
							visual workflows.
						</p>
					</div>
				</div>
			</section>

			{/* Featured use cases */}
			<section className="border-t border-border py-16 md:py-20">
				<div className="mx-auto max-w-6xl px-6">
					<p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
						Popular use cases
					</p>
					<div className="mt-8 grid gap-5 md:grid-cols-3">
						{featuredPages.map(p => {
							if (!p) return null
							const meta = useCasesMeta[p.slug]
							return (
								<Link
									key={p.slug}
									href={`/use-cases/${p.slug}`}
									className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-card p-7 transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
								>
									<div className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
										<div
											className={`absolute -right-10 -top-10 h-40 w-40 rounded-full ${meta?.accent.split(' ')[1]} blur-3xl`}
										/>
									</div>
									<UseCaseIcon slug={p.slug} size="md" />
									<h3 className="mt-5 text-lg font-semibold leading-snug">
										{p.frontmatter.title}
									</h3>
									<p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">
										{p.frontmatter.description}
									</p>
									<span className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors group-hover:text-primary/80">
										Learn more
										<svg
											className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
											fill="none"
											viewBox="0 0 24 24"
											strokeWidth={2}
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
											/>
										</svg>
									</span>
								</Link>
							)
						})}
					</div>
				</div>
			</section>

			{/* All use cases by category */}
			{categories.map(cat => {
				const catPages = cat.slugOrder
					.map(slug => pages.find(p => p.slug === slug))
					.filter(Boolean)

				if (catPages.length === 0) return null

				return (
					<section
						key={cat.key}
						className="border-t border-border py-14 md:py-16"
					>
						<div className="mx-auto max-w-6xl px-6">
							<div className="flex items-baseline gap-3">
								<h2 className="text-2xl font-bold tracking-tight">
									{cat.label}
								</h2>
								<span className="text-sm text-muted-foreground">
									— {cat.description}
								</span>
							</div>
							<div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
								{catPages.map(p => {
									if (!p) return null
									return (
										<Link
											key={p.slug}
											href={`/use-cases/${p.slug}`}
											className="group flex cursor-pointer gap-4 rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/40 hover:bg-muted/30"
										>
											<UseCaseIcon
												slug={p.slug}
												size="sm"
											/>
											<div className="min-w-0">
												<h3 className="font-semibold leading-snug">
													{p.frontmatter.title}
												</h3>
												<p className="mt-1 text-sm leading-snug text-muted-foreground line-clamp-2">
													{p.frontmatter.description}
												</p>
											</div>
										</Link>
									)
								})}
							</div>
						</div>
					</section>
				)
			})}

			{/* CTA */}
			<section className="border-t border-border bg-muted/20 py-16 md:py-20">
				<div className="mx-auto max-w-6xl px-6 text-center">
					<h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
						Have a different use case?
					</h2>
					<p className="mt-3 text-muted-foreground">
						ScreenshotAPI works anywhere you need to capture the
						web. Start with 200 free screenshots/month.
					</p>
					<div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
						<Link
							href="/sign-up"
							className="cursor-pointer rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
						>
							Start for free
						</Link>
						<Link
							href="/docs"
							className="cursor-pointer rounded-lg border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-muted"
						>
							Read the docs
						</Link>
					</div>
				</div>
			</section>
		</>
	)
}
