import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
	title: 'Integrations — Screenshot API for Every Framework & Platform',
	description:
		'Integrate ScreenshotAPI with Next.js, React, Django, Rails, Laravel, Express, FastAPI, WordPress, Vercel, AWS Lambda, Cloudflare Workers, and GitHub Actions.'
}

const frontendFrameworks = [
	{
		name: 'Next.js',
		slug: 'nextjs',
		description:
			'Server-side screenshots with API routes, ISR caching, and OG image generation.'
	},
	{
		name: 'React',
		slug: 'react',
		description:
			'Custom hooks, React Query integration, and client-side screenshot components.'
	}
]

const backendFrameworks = [
	{
		name: 'Django',
		slug: 'django',
		description:
			'View functions, Celery background tasks, and model-based screenshot storage.'
	},
	{
		name: 'Flask',
		slug: 'flask',
		description:
			'Lightweight route handlers and background screenshot processing.'
	},
	{
		name: 'Ruby on Rails',
		slug: 'rails',
		description:
			'Controller actions, Active Job async processing, and ActiveRecord storage.'
	},
	{
		name: 'Laravel',
		slug: 'laravel',
		description:
			'Queued jobs, Guzzle HTTP client, and Laravel Cache integration.'
	},
	{
		name: 'Express',
		slug: 'express',
		description:
			'Route handlers, Redis caching middleware, and rate limiting.'
	},
	{
		name: 'FastAPI',
		slug: 'fastapi',
		description:
			'Async endpoints, Pydantic models, and background task processing.'
	},
	{
		name: 'WordPress',
		slug: 'wordpress',
		description: 'Shortcodes, REST API endpoints, and transient caching.'
	}
]

const platforms = [
	{
		name: 'Vercel',
		slug: 'vercel',
		description:
			'Edge Functions, serverless deployment, and Vercel KV caching.'
	},
	{
		name: 'AWS Lambda',
		slug: 'aws-lambda',
		description:
			'Serverless handlers in Node.js and Python with S3 storage.'
	},
	{
		name: 'Cloudflare Workers',
		slug: 'cloudflare-workers',
		description: 'Edge-deployed Workers with KV caching and R2 storage.'
	},
	{
		name: 'GitHub Actions',
		slug: 'github-actions',
		description:
			'CI/CD workflows for visual regression testing and screenshot capture.'
	}
]

function IntegrationCard({
	name,
	slug,
	description
}: {
	name: string
	slug: string
	description: string
}) {
	return (
		<Link
			href={`/integrations/${slug}`}
			className="group cursor-pointer rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:bg-muted/30"
		>
			<h3 className="text-lg font-semibold group-hover:text-primary">
				{name}
			</h3>
			<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
				{description}
			</p>
			<span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
				View integration
				<svg
					className="h-4 w-4"
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
}

function IntegrationGroup({
	title,
	integrations
}: {
	title: string
	integrations: { name: string; slug: string; description: string }[]
}) {
	return (
		<section>
			<h2 className="text-xl font-bold tracking-tight">{title}</h2>
			<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{integrations.map(integration => (
					<IntegrationCard key={integration.slug} {...integration} />
				))}
			</div>
		</section>
	)
}

export default function IntegrationsPage() {
	const jsonLd = {
		'@context': 'https://schema.org',
		'@type': 'CollectionPage',
		name: 'ScreenshotAPI Integrations',
		description:
			'Integrate ScreenshotAPI with popular frameworks and platforms.',
		url: 'https://screenshotapi.to/integrations',
		mainEntity: {
			'@type': 'ItemList',
			itemListElement: [
				...frontendFrameworks,
				...backendFrameworks,
				...platforms
			].map((item, i) => ({
				'@type': 'ListItem',
				position: i + 1,
				name: item.name,
				url: `https://screenshotapi.to/integrations/${item.slug}`
			}))
		}
	}

	return (
		<div className="py-12 md:py-16">
			<div className="mx-auto max-w-5xl px-6">
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(jsonLd)
					}}
				/>

				<header>
					<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
						Integrations
					</h1>
					<p className="mt-4 max-w-2xl text-lg text-muted-foreground">
						Add website screenshots to any stack. Copy-paste
						examples for every major framework and platform — from
						quick prototypes to production-grade implementations.
					</p>
				</header>

				<div className="mt-12 space-y-16">
					<IntegrationGroup
						title="Frontend Frameworks"
						integrations={frontendFrameworks}
					/>
					<IntegrationGroup
						title="Backend Frameworks"
						integrations={backendFrameworks}
					/>
					<IntegrationGroup
						title="Platforms & CI/CD"
						integrations={platforms}
					/>
				</div>

				<section className="mt-16 rounded-2xl border border-border bg-muted/30 px-6 py-12 text-center">
					<h2 className="text-2xl font-bold tracking-tight">
						Don&#39;t see your framework?
					</h2>
					<p className="mx-auto mt-3 max-w-md text-muted-foreground">
						ScreenshotAPI works with any language that can make HTTP
						requests. Start with 5 free credits — no credit card
						required.
					</p>
					<div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
						<Link
							href="/sign-up"
							className="cursor-pointer rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
						>
							Create free account
						</Link>
						<Link
							href="/docs"
							className="cursor-pointer rounded-lg border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-muted"
						>
							Read the docs
						</Link>
					</div>
				</section>
			</div>
		</div>
	)
}
