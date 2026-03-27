import Link from 'next/link'
import type { SimpleIcon } from 'simple-icons'
import {
	siCurl,
	siDotnet,
	siElixir,
	siGo,
	siJavascript,
	siOpenjdk,
	siPhp,
	siPython,
	siRuby,
	siRust
} from 'simple-icons'
import { IntegrationIcon } from './integration-icon'

function iconIsDark(hex: string): boolean {
	const r = Number.parseInt(hex.slice(0, 2), 16)
	const g = Number.parseInt(hex.slice(2, 4), 16)
	const b = Number.parseInt(hex.slice(4, 6), 16)
	return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.15
}

const sdks: {
	name: string
	slug: string
	icon: SimpleIcon
	hexOverride?: string
}[] = [
	{ name: 'JavaScript', slug: 'javascript', icon: siJavascript },
	{ name: 'Python', slug: 'python', icon: siPython },
	{ name: 'Go', slug: 'go', icon: siGo },
	{ name: 'Ruby', slug: 'ruby', icon: siRuby },
	{ name: 'PHP', slug: 'php', icon: siPhp },
	{ name: 'Java', slug: 'java', icon: siOpenjdk, hexOverride: 'ED8B00' },
	{ name: 'C#', slug: 'csharp', icon: siDotnet },
	{ name: 'Elixir', slug: 'elixir', icon: siElixir },
	{ name: 'Rust', slug: 'rust', icon: siRust, hexOverride: 'CE422B' },
	{ name: 'cURL', slug: 'curl', icon: siCurl }
]

const integrations = [
	{ slug: 'nextjs', name: 'Next.js' },
	{ slug: 'react', name: 'React' },
	{ slug: 'vue', name: 'Vue' },
	{ slug: 'angular', name: 'Angular' },
	{ slug: 'svelte', name: 'Svelte' },
	{ slug: 'remix', name: 'Remix' },
	{ slug: 'astro', name: 'Astro' },
	{ slug: 'django', name: 'Django' },
	{ slug: 'flask', name: 'Flask' },
	{ slug: 'rails', name: 'Rails' },
	{ slug: 'laravel', name: 'Laravel' },
	{ slug: 'express', name: 'Express' },
	{ slug: 'fastapi', name: 'FastAPI' },
	{ slug: 'spring-boot', name: 'Spring Boot' },
	{ slug: 'dotnet', name: '.NET' },
	{ slug: 'gin', name: 'Gin' },
	{ slug: 'sinatra', name: 'Sinatra' },
	{ slug: 'deno', name: 'Deno' },
	{ slug: 'wordpress', name: 'WordPress' },
	{ slug: 'vercel', name: 'Vercel' },
	{ slug: 'aws-lambda', name: 'AWS Lambda' },
	{ slug: 'cloudflare-workers', name: 'Cloudflare' },
	{ slug: 'google-cloud-functions', name: 'Google Cloud' },
	{ slug: 'azure-functions', name: 'Azure' },
	{ slug: 'netlify', name: 'Netlify' },
	{ slug: 'supabase-edge-functions', name: 'Supabase' },
	{ slug: 'docker', name: 'Docker' },
	{ slug: 'zapier', name: 'Zapier' },
	{ slug: 'n8n', name: 'n8n' },
	{ slug: 'make', name: 'Make' },
	{ slug: 'retool', name: 'Retool' },
	{ slug: 'github-actions', name: 'GitHub Actions' },
	{ slug: 'gitlab-ci', name: 'GitLab CI' },
	{ slug: 'bitbucket-pipelines', name: 'Bitbucket' }
]

export function SdkShowcase() {
	return (
		<section className="border-t border-border bg-muted/20 py-20 md:py-28">
			<div className="mx-auto max-w-6xl px-6">
				<div className="mx-auto max-w-2xl text-center">
					<h2 className="text-3xl font-bold tracking-tight">
						SDKs and integrations for every stack
					</h2>
					<p className="mt-4 text-lg text-muted-foreground">
						Official libraries for every major language, plus
						step-by-step guides for 30+ frameworks, platforms, and
						automation tools.
					</p>
				</div>

				{/* SDK languages */}
				<div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-5">
					{sdks.map(sdk => {
						const hex = sdk.hexOverride ?? sdk.icon.hex
						const dark = iconIsDark(hex)
						return (
							<Link
								key={sdk.slug}
								href={`/docs/sdks/${sdk.slug}`}
								className="group flex cursor-pointer flex-col items-center gap-3 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:bg-muted/30"
							>
								<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted/60">
									<svg
										viewBox="0 0 24 24"
										fill="currentColor"
										className={
											dark
												? 'h-7 w-7 text-foreground'
												: 'h-7 w-7'
										}
										style={
											dark
												? undefined
												: {
														color: `#${hex}`
													}
										}
									>
										<path d={sdk.icon.path} />
									</svg>
								</div>
								<span className="text-sm font-semibold">
									{sdk.name}
								</span>
							</Link>
						)
					})}
				</div>

				{/* Integration grid */}
				<div className="mt-16">
					<p className="text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
						Plus 30+ framework &amp; platform integrations
					</p>
					<div className="mx-auto mt-8 grid max-w-4xl grid-cols-4 gap-x-2 gap-y-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7">
						{integrations.map(integration => (
							<Link
								key={integration.slug}
								href={`/integrations/${integration.slug}`}
								className="group flex cursor-pointer flex-col items-center gap-2 rounded-lg p-3 transition-all hover:bg-muted/50"
							>
								<IntegrationIcon slug={integration.slug} />
								<span className="text-center text-[11px] font-medium leading-tight text-muted-foreground transition-colors group-hover:text-foreground">
									{integration.name}
								</span>
							</Link>
						))}
					</div>
				</div>

				<div className="mt-10 text-center">
					<Link
						href="/integrations"
						className="cursor-pointer text-sm font-medium text-primary transition-colors hover:text-primary/80"
					>
						Browse all integrations →
					</Link>
				</div>
			</div>
		</section>
	)
}
