import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
	title: 'Use Cases — Screenshot API for Developers',
	description:
		'Explore how teams use ScreenshotAPI: OG image generation, link previews, visual regression testing, website monitoring, directory thumbnails, and more.'
}

const categories = [
	{
		name: 'Developer Tools',
		useCases: [
			{
				title: 'OG Image Generation',
				description:
					'Dynamically generate Open Graph and social card images from any URL. Perfect for blogs, SaaS products, and content platforms.',
				href: '/use-cases/og-image-generation',
				icon: (
					<svg
						className="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
						/>
					</svg>
				)
			},
			{
				title: 'Link Previews',
				description:
					'Show rich URL thumbnail previews in chat apps, social platforms, and link aggregators.',
				href: '/use-cases/link-previews',
				icon: (
					<svg
						className="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.56a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.34 8.374"
						/>
					</svg>
				)
			},
			{
				title: 'Visual Regression Testing',
				description:
					'Catch visual bugs before they ship. Automate screenshot comparisons in your CI/CD pipeline.',
				href: '/use-cases/visual-regression-testing',
				icon: (
					<svg
						className="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 01-1.59.659H9.06a2.25 2.25 0 01-1.591-.659L5 14.5m14 0V5.25A2.25 2.25 0 0016.75 3h-9.5A2.25 2.25 0 005 5.25v9.25"
						/>
					</svg>
				)
			},
			{
				title: 'PDF-Quality Image Generation',
				description:
					'Capture full web pages as high-resolution images for documents, reports, and print materials.',
				href: '/use-cases/pdf-generation',
				icon: (
					<svg
						className="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
						/>
					</svg>
				)
			}
		]
	},
	{
		name: 'Marketing & Social',
		useCases: [
			{
				title: 'Social Media Automation',
				description:
					'Auto-generate social media images from web pages. Resize for Twitter, LinkedIn, Facebook, and more.',
				href: '/use-cases/social-media-automation',
				icon: (
					<svg
						className="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
						/>
					</svg>
				)
			},
			{
				title: 'Directory & Listing Thumbnails',
				description:
					'Generate website preview thumbnails for directories, marketplaces, and curated link collections.',
				href: '/use-cases/directory-thumbnails',
				icon: (
					<svg
						className="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
						/>
					</svg>
				)
			},
			{
				title: 'Automated Reporting',
				description:
					'Capture dashboard and report screenshots on a schedule. Embed in emails, Slack, and PDFs.',
				href: '/use-cases/reporting',
				icon: (
					<svg
						className="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
						/>
					</svg>
				)
			}
		]
	},
	{
		name: 'Monitoring & QA',
		useCases: [
			{
				title: 'Website Monitoring',
				description:
					'Detect visual breakage, content changes, and defacement with periodic screenshot captures.',
				href: '/use-cases/website-monitoring',
				icon: (
					<svg
						className="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5a17.92 17.92 0 01-8.716-2.247m0 0A8.966 8.966 0 013 12c0-1.777.514-3.434 1.401-4.832"
						/>
					</svg>
				)
			},
			{
				title: 'Competitor Monitoring',
				description:
					'Track visual changes on competitor websites. Get alerted when their pricing, landing pages, or features change.',
				href: '/use-cases/competitor-monitoring',
				icon: (
					<svg
						className="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
						/>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
						/>
					</svg>
				)
			},
			{
				title: 'Web Page Archiving',
				description:
					'Preserve visual snapshots of web pages over time. Build a timestamped visual history of any site.',
				href: '/use-cases/archiving',
				icon: (
					<svg
						className="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={1.5}
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
						/>
					</svg>
				)
			}
		]
	}
]

export default function UseCasesPage() {
	return (
		<div className="py-12 md:py-16">
			<div className="mx-auto max-w-5xl px-6">
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							'@context': 'https://schema.org',
							'@type': 'CollectionPage',
							name: 'ScreenshotAPI Use Cases',
							description:
								'Explore how teams use ScreenshotAPI for OG images, link previews, visual testing, monitoring, and more.',
							url: 'https://screenshotapi.to/use-cases'
						})
					}}
				/>

				<header className="text-center">
					<h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
						What will you build with ScreenshotAPI?
					</h1>
					<p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
						From dynamic OG images to visual regression testing,
						developers use our screenshot API to power workflows
						across every stage of the product lifecycle.
					</p>
				</header>

				<div className="mt-16 space-y-16">
					{categories.map(category => (
						<section key={category.name}>
							<h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
								{category.name}
							</h2>
							<div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
								{category.useCases.map(uc => (
									<Link
										key={uc.href}
										href={uc.href}
										className="group cursor-pointer rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:bg-muted/30"
									>
										<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
											{uc.icon}
										</div>
										<h3 className="mt-4 font-semibold">
											{uc.title}
										</h3>
										<p className="mt-2 text-sm text-muted-foreground">
											{uc.description}
										</p>
										<span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
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
								))}
							</div>
						</section>
					))}
				</div>
			</div>
		</div>
	)
}
