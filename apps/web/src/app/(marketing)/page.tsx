import type { Metadata } from 'next'
import Link from 'next/link'
import { SdkShowcase } from '@/components/marketing/sdk-showcase'

export const metadata: Metadata = {
	title: 'ScreenshotAPI — The screenshot API that respects your time',
	description:
		'A fast, reliable screenshot API with ad blocking, PDF export, and smart caching. 200 free screenshots per month. One API call, one screenshot. SDKs for every platform.'
}

const features = [
	{
		title: 'Simple REST API',
		description:
			'One GET request is all it takes. Pass a URL, get back a screenshot. Works with any HTTP client.',
		icon: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"
			/>
		)
	},
	{
		title: 'Multiple Formats',
		description:
			'Export as PNG, JPEG, WebP, or PDF. Control quality settings. Full-page or viewport captures.',
		icon: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
			/>
		)
	},
	{
		title: 'Ad Blocking',
		description:
			'Remove ads, trackers, and cookie banners automatically. Clean screenshots every time.',
		icon: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
			/>
		)
	},
	{
		title: 'Response Caching',
		description:
			"Smart caching with configurable TTL. Cached responses are served instantly and don't count against your quota.",
		icon: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M3.75 13.5L14.25 2.25 12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
			/>
		)
	},
	{
		title: 'HTML Rendering',
		description:
			'Render raw HTML to images or PDFs. Perfect for OG images, invoices, and email previews.',
		icon: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25"
			/>
		)
	},
	{
		title: 'Smart Wait Strategies',
		description:
			'Wait for network idle, CSS selectors, or fixed delays. Capture dynamic content reliably.',
		icon: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
			/>
		)
	},
	{
		title: 'Stealth Mode',
		description:
			'Bypass bot detection with user agent rotation and anti-fingerprinting. Capture protected sites.',
		icon: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
			/>
		)
	},
	{
		title: 'Flexible Pricing',
		description:
			'Monthly subscriptions for predictable costs or credit packs for pay-as-you-go. 200 free screenshots/month.',
		icon: (
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9v3"
			/>
		)
	}
]

const steps = [
	{
		step: '1',
		title: 'Create an account',
		description:
			'Sign up and get 200 free screenshots per month. No credit card required.'
	},
	{
		step: '2',
		title: 'Generate an API key',
		description:
			'Create a key in your dashboard with one click. Use it in the x-api-key header.'
	},
	{
		step: '3',
		title: 'Take screenshots',
		description:
			'Make a GET request with a URL. Get back a screenshot in PNG, JPEG, WebP, or PDF.'
	}
]

const pricingTiers = [
	{
		name: 'Free',
		price: '$0',
		priceSuffix: '',
		screenshots: '200 screenshots/month',
		popular: false,
		href: '/sign-up',
		cta: 'Get started'
	},
	{
		name: 'Starter',
		price: '$19',
		priceSuffix: '/mo',
		screenshots: '5,000 screenshots/month',
		popular: false,
		href: '/pricing',
		cta: 'Choose plan'
	},
	{
		name: 'Growth',
		price: '$49',
		priceSuffix: '/mo',
		screenshots: '25,000 screenshots/month',
		popular: true,
		href: '/pricing',
		cta: 'Choose plan'
	},
	{
		name: 'Scale',
		price: '$149',
		priceSuffix: '/mo',
		screenshots: '100,000 screenshots/month',
		popular: false,
		href: '/pricing',
		cta: 'Choose plan'
	}
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
							200 free screenshots/month
						</div>
						<h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
							Website screenshots
							<br />
							<span className="text-muted-foreground">
								via API, in seconds
							</span>
						</h1>
						<p className="mt-6 text-lg text-muted-foreground md:text-xl">
							A fast, reliable screenshot API with ad blocking,
							PDF export, and smart caching. One API call, one
							screenshot. SDKs for every platform.
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
										{'&type=png'}
									</span>
									{'\n   '}
									<span className="text-cyan-300">
										{'&blockAds=true'}
									</span>
									{'\n   '}
									<span className="text-cyan-300">
										{'&removeCookieBanners=true"'}
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
							The screenshot API that respects your time
						</h2>
						<p className="mt-4 text-muted-foreground">
							Everything you need to capture the web — from ad
							blocking and caching to HTML rendering and stealth
							mode.
						</p>
					</div>
					<div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
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

			{/* Pricing preview */}
			<section className="border-t border-border py-20 md:py-28">
				<div className="mx-auto max-w-6xl px-6">
					<div className="mx-auto max-w-2xl text-center">
						<h2 className="text-3xl font-bold tracking-tight">
							Flexible pricing for every scale
						</h2>
						<p className="mt-4 text-muted-foreground">
							Start free with 200 screenshots/month. Upgrade as
							you grow.
						</p>
					</div>
					<div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
						{pricingTiers.map(tier => (
							<div
								key={tier.name}
								className={`relative rounded-xl border p-6 transition-colors hover:border-primary/50 ${
									tier.popular
										? 'border-primary bg-primary/5'
										: 'border-border bg-card'
								}`}
							>
								{tier.popular && (
									<div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
										Most popular
									</div>
								)}
								<h3 className="font-semibold">{tier.name}</h3>
								<div className="mt-3">
									<span className="text-3xl font-bold">
										{tier.price}
									</span>
									{tier.priceSuffix ? (
										<span className="text-sm text-muted-foreground">
											{tier.priceSuffix}
										</span>
									) : null}
								</div>
								<p className="mt-1 text-sm text-muted-foreground">
									{tier.screenshots}
								</p>
								<Link
									href={tier.href}
									className={`mt-6 block cursor-pointer rounded-lg px-4 py-2.5 text-center text-sm font-medium transition-colors ${
										tier.popular
											? 'bg-primary text-primary-foreground hover:bg-primary/90'
											: 'border border-border bg-background hover:bg-muted'
									}`}
								>
									{tier.cta}
								</Link>
							</div>
						))}
					</div>
					<div className="mt-10 text-center">
						<Link
							href="/pricing"
							className="cursor-pointer text-sm font-medium text-primary transition-colors hover:text-primary/80"
						>
							View full pricing & credit packs →
						</Link>
					</div>
				</div>
			</section>

			<SdkShowcase />

			{/* CTA */}
			<section className="border-t border-border py-20 md:py-28">
				<div className="mx-auto max-w-6xl px-6 text-center">
					<h2 className="text-3xl font-bold tracking-tight">
						Start capturing screenshots today
					</h2>
					<p className="mt-4 text-muted-foreground">
						Create a free account and get 200 screenshots per month.
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
