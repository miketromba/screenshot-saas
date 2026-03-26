import type { Metadata } from 'next'
import Link from 'next/link'
import { IntegrationIcon } from '@/components/marketing/integration-icon'
import { getAllContentPages } from '@/lib/content'

export const metadata: Metadata = {
	title: 'Integrations',
	description:
		'Integrate ScreenshotAPI with 30+ frameworks and platforms. Quick-start guides for Next.js, React, Vue, Django, Rails, Laravel, AWS Lambda, and more.'
}

const categories = [
	{
		label: 'Frontend Frameworks',
		slugs: ['nextjs', 'react', 'vue', 'angular', 'svelte', 'remix', 'astro']
	},
	{
		label: 'Backend Frameworks',
		slugs: [
			'django',
			'flask',
			'rails',
			'laravel',
			'express',
			'fastapi',
			'spring-boot',
			'dotnet',
			'gin',
			'sinatra',
			'deno',
			'wordpress'
		]
	},
	{
		label: 'Platforms & Hosting',
		slugs: [
			'vercel',
			'aws-lambda',
			'cloudflare-workers',
			'google-cloud-functions',
			'azure-functions',
			'netlify',
			'supabase-edge-functions',
			'docker'
		]
	},
	{
		label: 'Automation & No-Code',
		slugs: ['zapier', 'n8n', 'make', 'retool']
	},
	{
		label: 'CI/CD',
		slugs: ['github-actions', 'gitlab-ci', 'bitbucket-pipelines']
	}
]

function getShortDescription(description: string): string {
	const cleaned = description
		.replace(
			/^(Integrate|Add|Capture|Deploy|Automate|Use) ScreenshotAPI (with|in|on|from|as) /i,
			''
		)
		.replace(/^(Integrate|Add|Capture|Deploy|Automate|Use) /i, '')
		.replace(/\. .*$/, '')
	return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}

export default function IntegrationsHub() {
	const pages = getAllContentPages('integrations')

	return (
		<div className="py-12 md:py-16">
			<div className="mx-auto max-w-5xl px-6">
				<header className="text-center">
					<h1 className="text-4xl font-bold tracking-tight">
						Integrations
					</h1>
					<p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
						Quick-start guides for every framework, platform, and
						automation tool. Pick your stack and start capturing
						screenshots in minutes.
					</p>
				</header>

				{categories.map(cat => {
					const catPages = cat.slugs
						.map(slug => pages.find(p => p.slug === slug))
						.filter(Boolean)

					if (catPages.length === 0) return null

					return (
						<section key={cat.label} className="mt-14">
							<h2 className="text-2xl font-bold tracking-tight">
								{cat.label}
							</h2>
							<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
								{catPages.map(p => (
									<Link
										key={p!.slug}
										href={`/integrations/${p!.slug}`}
										className="group flex cursor-pointer gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-muted/30"
									>
										<IntegrationIcon slug={p!.slug} />
										<div className="min-w-0">
											<h3 className="font-semibold leading-snug">
												{p!.frontmatter.title
													.replace(
														/^Screenshot API for /,
														''
													)
													.replace(
														/ Screenshot API Integration$/,
														''
													)
													.replace(
														/ Screenshot API$/,
														''
													)
													.replace(
														/ Integration$/,
														''
													)}
											</h3>
											<p className="mt-1 text-sm leading-snug text-muted-foreground line-clamp-2">
												{getShortDescription(
													p!.frontmatter.description
												)}
											</p>
										</div>
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
