import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock, ComparisonTable } from '@/components/seo'

export const metadata: Metadata = {
	title: 'ScreenshotAPI vs ScreenshotMachine',
	description:
		'Compare ScreenshotAPI with ScreenshotMachine. Modern screenshot API with dark mode and WebP vs a basic legacy screenshot service.'
}

const faq = [
	{
		question: 'Is ScreenshotMachine still active?',
		answer: "Yes, ScreenshotMachine is still operational and serving screenshots. However, its feature set and API design haven't evolved much in recent years. It remains a basic, functional screenshot service without modern features like WebP output or dark mode capture."
	},
	{
		question: 'Does ScreenshotMachine support WebP?',
		answer: 'No, ScreenshotMachine only supports PNG and JPEG output formats. ScreenshotAPI supports PNG, JPEG, and WebP. WebP offers significantly better compression, especially for website screenshots with lots of text and UI elements.'
	},
	{
		question: 'How does ScreenshotMachine pricing work?',
		answer: "ScreenshotMachine uses monthly subscription plans with set screenshot quotas. Plans are relatively affordable, starting from around $8-10/month. Unused screenshots don't carry over. ScreenshotAPI uses per-credit pricing with no subscription and no expiration."
	},
	{
		question: 'Which service is easier to integrate?',
		answer: "Both offer simple REST APIs. ScreenshotAPI has more modern documentation with code examples in multiple languages and SDKs for JavaScript, Python, Go, Ruby, and PHP. ScreenshotMachine's documentation is functional but more basic."
	}
]

const relatedPages = [
	{
		title: 'ScreenshotAPI vs Screenshotlayer',
		description: 'Compare with another legacy screenshot API service.',
		href: '/compare/screenshotapi-vs-screenshotlayer'
	},
	{
		title: 'Best Free Screenshot APIs',
		description:
			'Screenshot APIs with free tiers for testing and prototyping.',
		href: '/compare/free-screenshot-api'
	},
	{
		title: '7 Best Screenshot APIs',
		description: 'Full ranking of the top screenshot APIs available today.',
		href: '/compare/best-screenshot-api'
	}
]

const jsonLd = {
	'@context': 'https://schema.org',
	'@type': 'Article',
	headline: 'ScreenshotAPI vs ScreenshotMachine: Modern vs Legacy',
	description:
		'Comparison of ScreenshotAPI and ScreenshotMachine for website screenshots.',
	dateModified: '2026-03-25',
	publisher: {
		'@type': 'Organization',
		name: 'ScreenshotAPI',
		url: 'https://screenshotapi.to'
	}
}

export default function ScreenshotAPIvsScreenshotMachine() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Compare', href: '/compare' },
				{ label: 'ScreenshotAPI vs ScreenshotMachine' }
			]}
			title="ScreenshotAPI vs ScreenshotMachine"
			description="ScreenshotMachine is a long-running screenshot service with basic features. ScreenshotAPI offers a modern API with better format support and flexible pricing."
			lastUpdated="March 25, 2026"
			faq={faq}
			relatedPages={relatedPages}
			jsonLd={jsonLd}
		>
			<section>
				<h2 className="text-2xl font-bold tracking-tight">Overview</h2>
				<p className="mt-3 text-muted-foreground">
					ScreenshotMachine is one of the older screenshot services on
					the web. It offers a simple API for capturing website
					screenshots in PNG and JPEG formats, with basic features
					like custom dimensions and device emulation.
				</p>
				<p className="mt-3 text-muted-foreground">
					ScreenshotAPI is a modern alternative built for today&apos;s
					web. It supports WebP output, dark mode capture, smart wait
					strategies, and credit-based pricing. The developer
					experience — from documentation to SDKs — is designed for
					modern development workflows.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					API comparison
				</h2>
				<div className="mt-6 space-y-4">
					<CodeBlock
						language="javascript"
						title="ScreenshotAPI"
						code={`const response = await fetch(
  'https://screenshotapi.to/api/v1/screenshot?url=https://example.com&width=1440&height=900&type=webp',
  { headers: { 'x-api-key': 'sk_live_xxxxx' } }
);
const image = await response.blob();`}
					/>
					<CodeBlock
						language="javascript"
						title="ScreenshotMachine"
						code={`const params = new URLSearchParams({
  key: 'YOUR_CUSTOMER_KEY',
  url: 'https://example.com',
  dimension: '1440x900',
  format: 'png',
  device: 'desktop'
});
const response = await fetch(
  'https://api.screenshotmachine.com?' + params
);
const image = await response.blob();`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Feature comparison
				</h2>
				<div className="mt-6">
					<ComparisonTable
						headers={['ScreenshotAPI', 'ScreenshotMachine']}
						rows={[
							{ feature: 'PNG output', values: [true, true] },
							{ feature: 'JPEG output', values: [true, true] },
							{ feature: 'WebP output', values: [true, false] },
							{
								feature: 'Full-page capture',
								values: [true, true]
							},
							{
								feature: 'Custom viewports',
								values: [true, true]
							},
							{ feature: 'Dark mode', values: [true, false] },
							{
								feature: 'Wait strategies',
								values: ['3 modes', 'Basic delay']
							},
							{
								feature: 'Device emulation',
								values: [false, true]
							},
							{
								feature: 'Caching',
								values: [false, 'Server-side cache']
							},
							{
								feature: 'SDKs',
								values: ['JS, Python, Go, Ruby, PHP', 'Limited']
							},
							{
								feature: 'Pricing model',
								values: ['Per credit', 'Monthly subscription']
							},
							{
								feature: 'Free tier',
								values: ['5 credits', 'Limited trial']
							},
							{
								feature: 'API docs quality',
								values: ['Modern, interactive', 'Basic']
							}
						]}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					What ScreenshotMachine gets right
				</h2>
				<p className="mt-3 text-muted-foreground">
					ScreenshotMachine is reliable and battle-tested. It has been
					running for years without major outages. The API is simple,
					the pricing is affordable, and it includes device emulation
					(desktop, tablet, phone presets) as a built-in feature. For
					basic screenshot needs with no frills, it works.
				</p>
				<p className="mt-3 text-muted-foreground">
					Its server-side caching also means repeated requests for the
					same URL return instantly, which can be useful for
					high-volume scenarios where freshness isn&apos;t critical.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					What ScreenshotAPI improves on
				</h2>
				<p className="mt-3 text-muted-foreground">
					ScreenshotAPI modernizes the screenshot API experience in
					several ways:
				</p>
				<ul className="mt-4 space-y-2 text-muted-foreground">
					<li className="flex gap-2">
						<span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								WebP support
							</strong>{' '}
							— 25-35% smaller files than PNG with comparable
							quality
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Dark mode capture
							</strong>{' '}
							— renders pages with dark color scheme preference
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Smart wait strategies
							</strong>{' '}
							— network idle, CSS selector, and delay options
							ensure pages are fully rendered
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Official SDKs
							</strong>{' '}
							— first-party libraries for JavaScript, Python, Go,
							Ruby, and PHP
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								No subscription lock-in
							</strong>{' '}
							— credits never expire, no monthly commitment
						</span>
					</li>
				</ul>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">Verdict</h2>
				<p className="mt-3 text-muted-foreground">
					ScreenshotMachine is a reliable legacy service that handles
					basic screenshot needs. If you need a modern API with WebP
					support, dark mode, advanced wait strategies, and flexible
					pricing, ScreenshotAPI is the better choice. The developer
					experience gap is noticeable — from documentation to SDKs to
					pricing flexibility, ScreenshotAPI is built for how
					developers work today.
				</p>
			</section>
		</ArticleLayout>
	)
}
