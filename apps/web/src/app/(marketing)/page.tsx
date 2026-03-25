import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
	title: 'ScreenshotAPI — Website Screenshots via API',
	description:
		'A fast, reliable API for generating web page screenshots on demand. One API call, one screenshot, one credit. SDKs for every major platform.'
}

const features = [
	{
		title: 'Simple REST API',
		description:
			'One GET request is all it takes. Pass a URL, get back a screenshot. No SDKs required — works with any HTTP client.',
		icon: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
			/>
		)
	},
	{
		title: 'Multiple Formats',
		description:
			'Export as PNG, JPEG, or WebP. Control quality settings for optimal file size. Full-page or viewport-only captures.',
		icon: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
			/>
		)
	},
	{
		title: 'Light & Dark Mode',
		description:
			'Capture sites in light or dark color schemes using the colorScheme parameter. Emulates prefers-color-scheme.',
		icon: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
			/>
		)
	},
	{
		title: 'Custom Viewports',
		description:
			'Set exact width and height for pixel-perfect captures. Simulate any device viewport from mobile to desktop.',
		icon: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M10.5 19.5h3m-6.75 2.25h10.5a2.25 2.25 0 002.25-2.25v-15a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 4.5v15a2.25 2.25 0 002.25 2.25z"
			/>
		)
	},
	{
		title: 'Smart Wait Strategies',
		description:
			'Wait for network idle, specific CSS selectors, or fixed delays. Ensure dynamic content is fully loaded before capture.',
		icon: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
			/>
		)
	},
	{
		title: 'Pay Per Screenshot',
		description:
			'No subscriptions or monthly fees. Buy credit packs and use them at your own pace. Auto top-up available.',
		icon: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
			/>
		)
	}
]

const steps = [
	{
		step: '1',
		title: 'Create an account',
		description:
			'Sign up and get 5 free credits instantly. No credit card required.'
	},
	{
		step: '2',
		title: 'Generate an API key',
		description:
			'Create a key in your dashboard. Use it in the x-api-key header or as a Bearer token.'
	},
	{
		step: '3',
		title: 'Take screenshots',
		description:
			'Make a GET request with a URL and options. Receive the screenshot image in response.'
	}
]

const packs = [
	{ name: 'Starter', credits: 500, price: 20, perCredit: '0.040' },
	{
		name: 'Growth',
		credits: 2_000,
		price: 60,
		perCredit: '0.030',
		popular: true
	},
	{ name: 'Pro', credits: 10_000, price: 200, perCredit: '0.020' },
	{ name: 'Scale', credits: 50_000, price: 750, perCredit: '0.015' }
]

export default function HomePage() {
	return (
		<>
			{/* Hero */}
			<section className="relative overflow-hidden">
				<div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,var(--muted)_0%,transparent_100%)]" />
				<div className="mx-auto max-w-6xl px-6 pb-20 pt-24 md:pb-28 md:pt-32">
					<div className="mx-auto max-w-3xl text-center">
						<div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
							<span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
							5 free credits on signup
						</div>
						<h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
							Website screenshots
							<br />
							<span className="text-muted-foreground">
								via API, in seconds
							</span>
						</h1>
						<p className="mt-6 text-lg text-muted-foreground md:text-xl">
							A fast, reliable screenshot API powered by headless
							Chromium. One GET request, one screenshot, one
							credit. SDKs for every major platform.
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

					{/* Code example */}
					<div className="mx-auto mt-16 max-w-2xl">
						<div className="overflow-hidden rounded-xl border border-border bg-[oklch(0.17_0_0)] shadow-2xl">
							<div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
								<div className="h-3 w-3 rounded-full bg-white/20" />
								<div className="h-3 w-3 rounded-full bg-white/20" />
								<div className="h-3 w-3 rounded-full bg-white/20" />
								<span className="ml-2 text-xs text-white/40">
									Terminal
								</span>
							</div>
							<pre className="overflow-x-auto p-5 text-sm leading-relaxed">
								<code>
									<span className="text-green-400">curl</span>
									<span className="text-white"> -H </span>
									<span className="text-amber-300">
										{'"x-api-key: sk_live_xxxxx"'}
									</span>
									<span className="text-white"> \</span>
									{'\n  '}
									<span className="text-cyan-300">
										{
											'"https://screenshotapi.to/api/v1/screenshot'
										}
									</span>
									{'\n   '}
									<span className="text-cyan-300">
										{'?url=https://example.com'}
									</span>
									{'\n   '}
									<span className="text-cyan-300">
										{'&width=1440'}
									</span>
									{'\n   '}
									<span className="text-cyan-300">
										{'&height=900'}
									</span>
									{'\n   '}
									<span className="text-cyan-300">
										{'&type=png"'}
									</span>
									<span className="text-white"> \</span>
									{'\n  '}
									<span className="text-white">
										-o screenshot.png
									</span>
								</code>
							</pre>
						</div>
					</div>
				</div>
			</section>

			{/* Features */}
			<section
				id="features"
				className="border-t border-border py-20 md:py-28"
			>
				<div className="mx-auto max-w-6xl px-6">
					<div className="mx-auto max-w-2xl text-center">
						<h2 className="text-3xl font-bold tracking-tight">
							Everything you need to capture the web
						</h2>
						<p className="mt-4 text-muted-foreground">
							A complete screenshot API with the flexibility to
							handle any use case — from OG images to visual
							regression testing.
						</p>
					</div>
					<div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
						{features.map(feature => (
							<div
								key={feature.title}
								className="rounded-xl border border-border bg-card p-6 transition-colors hover:bg-muted/30"
							>
								<div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
									<svg
										className="h-5 w-5 text-primary"
										fill="none"
										viewBox="0 0 24 24"
										strokeWidth={1.5}
										stroke="currentColor"
									>
										{feature.icon}
									</svg>
								</div>
								<h3 className="font-semibold">
									{feature.title}
								</h3>
								<p className="mt-2 text-sm text-muted-foreground">
									{feature.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* How it works */}
			<section className="border-t border-border bg-muted/20 py-20 md:py-28">
				<div className="mx-auto max-w-6xl px-6">
					<div className="mx-auto max-w-2xl text-center">
						<h2 className="text-3xl font-bold tracking-tight">
							Up and running in minutes
						</h2>
						<p className="mt-4 text-muted-foreground">
							Three simple steps to your first screenshot.
						</p>
					</div>
					<div className="mt-14 grid gap-8 md:grid-cols-3">
						{steps.map(s => (
							<div key={s.step} className="text-center">
								<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
									{s.step}
								</div>
								<h3 className="mt-4 font-semibold">
									{s.title}
								</h3>
								<p className="mt-2 text-sm text-muted-foreground">
									{s.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Pricing */}
			<section className="border-t border-border py-20 md:py-28">
				<div className="mx-auto max-w-6xl px-6">
					<div className="mx-auto max-w-2xl text-center">
						<h2 className="text-3xl font-bold tracking-tight">
							Simple, credit-based pricing
						</h2>
						<p className="mt-4 text-muted-foreground">
							No subscriptions. Buy credits, use them at your own
							pace. Every account starts with 5 free credits.
						</p>
					</div>
					<div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
						{packs.map(pack => (
							<div
								key={pack.name}
								className={`relative rounded-xl border p-6 transition-colors hover:border-primary/50 ${
									pack.popular
										? 'border-primary bg-primary/5'
										: 'border-border bg-card'
								}`}
							>
								{pack.popular && (
									<div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
										Most popular
									</div>
								)}
								<h3 className="font-semibold">{pack.name}</h3>
								<div className="mt-3">
									<span className="text-3xl font-bold">
										${pack.price}
									</span>
								</div>
								<p className="mt-1 text-sm text-muted-foreground">
									{pack.credits.toLocaleString()} credits
								</p>
								<p className="text-xs text-muted-foreground">
									${pack.perCredit} per screenshot
								</p>
								<Link
									href="/sign-up"
									className={`mt-6 block cursor-pointer rounded-lg px-4 py-2.5 text-center text-sm font-medium transition-colors ${
										pack.popular
											? 'bg-primary text-primary-foreground hover:bg-primary/90'
											: 'border border-border bg-background hover:bg-muted'
									}`}
								>
									Get started
								</Link>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* SDK section */}
			<section className="border-t border-border bg-muted/20 py-20 md:py-28">
				<div className="mx-auto max-w-6xl px-6">
					<div className="mx-auto max-w-2xl text-center">
						<h2 className="text-3xl font-bold tracking-tight">
							SDKs for every platform
						</h2>
						<p className="mt-4 text-muted-foreground">
							Official libraries for JavaScript, Python, Go, Ruby,
							and PHP. Or just use cURL.
						</p>
					</div>
					<div className="mx-auto mt-10 flex max-w-md flex-wrap items-center justify-center gap-4">
						{[
							'JavaScript',
							'Python',
							'Go',
							'Ruby',
							'PHP',
							'cURL'
						].map(lang => (
							<Link
								key={lang}
								href={`/docs/sdks/${lang.toLowerCase()}`}
								className="cursor-pointer rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
							>
								{lang}
							</Link>
						))}
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="border-t border-border py-20 md:py-28">
				<div className="mx-auto max-w-6xl px-6 text-center">
					<h2 className="text-3xl font-bold tracking-tight">
						Start capturing screenshots today
					</h2>
					<p className="mt-4 text-muted-foreground">
						Create a free account and get 5 credits to try the API.
						No credit card required.
					</p>
					<Link
						href="/sign-up"
						className="mt-8 inline-block cursor-pointer rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
					>
						Create free account
					</Link>
				</div>
			</section>
		</>
	)
}
