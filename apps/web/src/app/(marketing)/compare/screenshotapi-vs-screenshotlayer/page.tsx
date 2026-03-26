import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock, ComparisonTable } from '@/components/seo'

export const metadata: Metadata = {
	title: 'ScreenshotAPI vs Screenshotlayer',
	description:
		'Compare ScreenshotAPI with Screenshotlayer by apilayer. Modern API design vs legacy service — features, pricing, and format support.'
}

const faq = [
	{
		question: 'Is Screenshotlayer still maintained?',
		answer: "Screenshotlayer is still operational and part of the apilayer suite of APIs. However, its API design and feature set haven't changed significantly in recent years. It still works, but newer alternatives offer more modern features like WebP output and dark mode support."
	},
	{
		question: 'Does Screenshotlayer have a free tier?',
		answer: "Yes, Screenshotlayer offers 100 free screenshots per month on their free plan. However, the free tier is limited — HTTPS capture requires a paid plan, and you don't get full-page capture. ScreenshotAPI offers 5 free credits with full feature access."
	},
	{
		question: 'Can I export screenshots as WebP from Screenshotlayer?',
		answer: 'No, Screenshotlayer only supports PNG and JPEG output formats. ScreenshotAPI supports PNG, JPEG, and WebP. WebP typically produces 25-35% smaller file sizes compared to PNG with similar quality.'
	},
	{
		question: 'Which API has better documentation?',
		answer: "ScreenshotAPI has modern, interactive API docs with code examples in multiple languages. Screenshotlayer's documentation is functional but follows the older apilayer documentation style, which some developers find less intuitive."
	}
]

const relatedPages = [
	{
		title: 'Screenshotlayer Alternatives',
		description:
			'Modern replacements for Screenshotlayer with better features.',
		href: '/compare/screenshotlayer-alternatives'
	},
	{
		title: 'ScreenshotAPI vs APIFlash',
		description: 'Compare with another commercial screenshot API.',
		href: '/compare/screenshotapi-vs-apiflash'
	},
	{
		title: 'Best Free Screenshot APIs',
		description: 'Screenshot APIs with generous free tiers.',
		href: '/compare/free-screenshot-api'
	}
]

const jsonLd = {
	'@context': 'https://schema.org',
	'@type': 'Article',
	headline: 'ScreenshotAPI vs Screenshotlayer: Modern vs Legacy',
	description:
		'Feature comparison of ScreenshotAPI and Screenshotlayer for website screenshots.',
	dateModified: '2026-03-25',
	publisher: {
		'@type': 'Organization',
		name: 'ScreenshotAPI',
		url: 'https://screenshotapi.to'
	}
}

export default function ScreenshotAPIvsScreenshotlayer() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Compare', href: '/compare' },
				{ label: 'ScreenshotAPI vs Screenshotlayer' }
			]}
			title="ScreenshotAPI vs Screenshotlayer"
			description="Screenshotlayer by apilayer has been around since 2015. ScreenshotAPI is a modern alternative with better format support and flexible pricing. Here's a detailed comparison."
			lastUpdated="March 25, 2026"
			faq={faq}
			relatedPages={relatedPages}
			jsonLd={jsonLd}
		>
			<section>
				<h2 className="text-2xl font-bold tracking-tight">Overview</h2>
				<p className="mt-3 text-muted-foreground">
					Screenshotlayer is one of the older screenshot APIs on the
					market, part of the apilayer family of web APIs. It launched
					around 2015 and offers a straightforward API for capturing
					website screenshots. Its free tier of 100 screenshots/month
					has made it popular for small projects.
				</p>
				<p className="mt-3 text-muted-foreground">
					ScreenshotAPI is a newer entrant focused on modern web
					standards, developer experience, and flexible pricing. It
					supports modern formats like WebP, offers dark mode capture,
					and uses credit-based pricing instead of monthly
					subscriptions.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					API comparison
				</h2>
				<div className="mt-6 space-y-4">
					<CodeBlock
						language="bash"
						title="ScreenshotAPI"
						code={`curl "https://screenshotapi.to/api/v1/screenshot?url=https://example.com&width=1440&height=900&type=webp" \\
  -H "x-api-key: sk_live_xxxxx" \\
  -o screenshot.webp`}
					/>
					<CodeBlock
						language="bash"
						title="Screenshotlayer"
						code={`curl "http://api.screenshotlayer.com/api/capture?access_key=YOUR_KEY&url=https://example.com&viewport=1440x900&format=PNG" \\
  -o screenshot.png`}
					/>
				</div>
				<p className="mt-4 text-muted-foreground">
					Note that Screenshotlayer&apos;s free tier uses HTTP (not
					HTTPS) for the API endpoint. HTTPS capture of target URLs
					also requires a paid plan.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Feature comparison
				</h2>
				<div className="mt-6">
					<ComparisonTable
						headers={['ScreenshotAPI', 'Screenshotlayer']}
						rows={[
							{ feature: 'PNG output', values: [true, true] },
							{ feature: 'JPEG output', values: [true, true] },
							{ feature: 'WebP output', values: [true, false] },
							{
								feature: 'Full-page capture',
								values: [true, 'Paid plans only']
							},
							{
								feature: 'Custom viewports',
								values: [true, true]
							},
							{ feature: 'Dark mode', values: [true, false] },
							{
								feature: 'HTTPS capture',
								values: [true, 'Paid plans only']
							},
							{
								feature: 'Wait strategies',
								values: ['3 modes', 'Basic delay only']
							},
							{
								feature: 'API over HTTPS',
								values: [true, 'Paid plans only']
							},
							{
								feature: 'Custom CSS injection',
								values: [false, true]
							},
							{
								feature: 'Pricing model',
								values: ['Per credit', 'Monthly subscription']
							},
							{
								feature: 'Free tier',
								values: [
									'5 credits (full features)',
									'100/mo (limited)'
								]
							},
							{
								feature: 'Credits expire?',
								values: ['Never', 'Monthly reset']
							}
						]}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Pricing comparison
				</h2>
				<p className="mt-3 text-muted-foreground">
					Screenshotlayer uses traditional monthly subscription tiers:
				</p>
				<ul className="mt-4 space-y-2 text-muted-foreground">
					<li className="flex gap-2">
						<span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Screenshotlayer Free:
							</strong>{' '}
							100 screenshots/month — but no HTTPS, no full-page,
							no HTTPS API endpoint
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Screenshotlayer Basic:
							</strong>{' '}
							$9.99/month for 500 screenshots — unlocks HTTPS and
							full-page
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								ScreenshotAPI:
							</strong>{' '}
							$0.015–$0.04 per screenshot, all features included.
							500 screenshots would cost $7.50–$20 with no monthly
							commitment.
						</span>
					</li>
				</ul>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Key differences
				</h2>
				<p className="mt-3 text-muted-foreground">
					The biggest differences come down to how modern the service
					feels. Screenshotlayer works, but its API design reflects
					2015 web conventions — HTTP by default, limited format
					support, and feature-gating behind pricing tiers.
					ScreenshotAPI gives every user access to all features
					regardless of their plan, and supports modern output formats
					like WebP.
				</p>
				<p className="mt-3 text-muted-foreground">
					That said, Screenshotlayer is a proven service backed by
					apilayer&apos;s infrastructure. It supports custom CSS
					injection, which ScreenshotAPI does not. And its 100 free
					screenshots per month is generous for low-volume use cases,
					even with the limitations.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">Verdict</h2>
				<p className="mt-3 text-muted-foreground">
					Screenshotlayer is a solid budget option if you stay within
					its free tier limits and don&apos;t need HTTPS or WebP. For
					anything beyond basic use, ScreenshotAPI offers a more
					modern developer experience, better format support, and more
					predictable pricing without subscription lock-in.
				</p>
			</section>
		</ArticleLayout>
	)
}
