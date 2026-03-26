import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
	title: 'Compare Screenshot APIs',
	description:
		'Compare ScreenshotAPI against Puppeteer, Playwright, Urlbox, and other screenshot services. Find the best screenshot API for your needs.'
}

const vsPages = [
	{
		title: 'ScreenshotAPI vs Puppeteer',
		description:
			'Managed API vs self-hosted browser automation. Skip the infrastructure.',
		href: '/compare/screenshotapi-vs-puppeteer'
	},
	{
		title: 'ScreenshotAPI vs Playwright',
		description:
			'Why a managed screenshot API beats running your own Playwright cluster.',
		href: '/compare/screenshotapi-vs-playwright'
	},
	{
		title: 'ScreenshotAPI vs Urlbox',
		description:
			'Credit-based pricing vs monthly subscriptions. Feature-by-feature comparison.',
		href: '/compare/screenshotapi-vs-urlbox'
	},
	{
		title: 'ScreenshotAPI vs Screenshotlayer',
		description:
			'Modern API design vs legacy screenshot service from apilayer.',
		href: '/compare/screenshotapi-vs-screenshotlayer'
	},
	{
		title: 'ScreenshotAPI vs APIFlash',
		description:
			'Pay-per-use pricing vs monthly quotas for website screenshots.',
		href: '/compare/screenshotapi-vs-apiflash'
	},
	{
		title: 'ScreenshotAPI vs Browserless',
		description:
			'Purpose-built screenshots vs general-purpose headless browsers.',
		href: '/compare/screenshotapi-vs-browserless'
	},
	{
		title: 'ScreenshotAPI vs ScrapingBee',
		description:
			'Dedicated screenshot API vs web scraping tool with screenshot add-on.',
		href: '/compare/screenshotapi-vs-scrapingbee'
	},
	{
		title: 'ScreenshotAPI vs ScreenshotMachine',
		description:
			'Modern features and formats vs a basic legacy screenshot service.',
		href: '/compare/screenshotapi-vs-screenshotmachine'
	},
	{
		title: 'ScreenshotAPI vs Microlink',
		description:
			'Focused screenshot API vs broad link-processing platform.',
		href: '/compare/screenshotapi-vs-microlink'
	}
]

const alternativePages = [
	{
		title: 'Urlbox Alternatives',
		description:
			'6 Urlbox alternatives with flexible pricing and modern APIs.',
		href: '/compare/urlbox-alternatives'
	},
	{
		title: 'Screenshotlayer Alternatives',
		description:
			'Modern replacements for Screenshotlayer with better format support.',
		href: '/compare/screenshotlayer-alternatives'
	},
	{
		title: 'Browserless Alternatives',
		description:
			'Lighter-weight alternatives for teams that only need screenshots.',
		href: '/compare/browserless-alternatives'
	},
	{
		title: 'Puppeteer Screenshot Alternatives',
		description:
			'Managed services that replace self-hosted Puppeteer screenshot code.',
		href: '/compare/puppeteer-screenshot-alternatives'
	},
	{
		title: 'APIFlash Alternatives',
		description:
			'Screenshot APIs with credit-based pricing and no monthly lock-in.',
		href: '/compare/apiflash-alternatives'
	}
]

const bestOfPages = [
	{
		title: '7 Best Screenshot APIs in 2025',
		description:
			'Comprehensive ranking of the top screenshot APIs by features, pricing, and DX.',
		href: '/compare/best-screenshot-api'
	},
	{
		title: '5 Best Free Screenshot APIs in 2025',
		description:
			'Screenshot APIs with generous free tiers for side projects and prototyping.',
		href: '/compare/free-screenshot-api'
	}
]

function PageCard({
	title,
	description,
	href
}: {
	title: string
	description: string
	href: string
}) {
	return (
		<Link
			href={href}
			className="group cursor-pointer rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:bg-muted/30"
		>
			<h3 className="font-semibold transition-colors group-hover:text-primary">
				{title}
			</h3>
			<p className="mt-2 text-sm text-muted-foreground">{description}</p>
		</Link>
	)
}

export default function ComparePage() {
	return (
		<div className="py-12 md:py-16">
			<div className="mx-auto max-w-5xl px-6">
				<header>
					<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
						Compare Screenshot APIs
					</h1>
					<p className="mt-4 max-w-2xl text-lg text-muted-foreground">
						See how ScreenshotAPI stacks up against other screenshot
						tools and services. Honest, developer-focused
						comparisons to help you pick the right solution.
					</p>
				</header>

				<section className="mt-14">
					<h2 className="text-xl font-bold tracking-tight">
						vs Competitors
					</h2>
					<p className="mt-2 text-sm text-muted-foreground">
						Head-to-head feature and pricing comparisons.
					</p>
					<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{vsPages.map(page => (
							<PageCard key={page.href} {...page} />
						))}
					</div>
				</section>

				<section className="mt-14">
					<h2 className="text-xl font-bold tracking-tight">
						Alternatives
					</h2>
					<p className="mt-2 text-sm text-muted-foreground">
						Looking to switch? Explore alternatives to popular
						screenshot services.
					</p>
					<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{alternativePages.map(page => (
							<PageCard key={page.href} {...page} />
						))}
					</div>
				</section>

				<section className="mt-14">
					<h2 className="text-xl font-bold tracking-tight">
						Best Of
					</h2>
					<p className="mt-2 text-sm text-muted-foreground">
						Curated rankings based on real-world testing and
						developer experience.
					</p>
					<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{bestOfPages.map(page => (
							<PageCard key={page.href} {...page} />
						))}
					</div>
				</section>
			</div>
		</div>
	)
}
