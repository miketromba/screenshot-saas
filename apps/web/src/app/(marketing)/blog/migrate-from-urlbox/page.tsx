import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock, ComparisonTable } from '@/components/seo'

export const metadata: Metadata = {
	title: 'Migrate from Urlbox to ScreenshotAPI',
	description:
		'Switch from Urlbox to ScreenshotAPI with this parameter mapping guide. Compare pricing, features, and see before/after code examples.'
}

export default function Page() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Blog', href: '/blog' },
				{ label: 'Migrate from Urlbox' }
			]}
			title="Migrate from Urlbox to ScreenshotAPI"
			description="Switch from Urlbox to ScreenshotAPI with complete parameter mapping, before/after code examples, and pricing comparison."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'Article',
				headline: 'Migrate from Urlbox to ScreenshotAPI',
				dateModified: '2026-03-25',
				publisher: {
					'@type': 'Organization',
					name: 'ScreenshotAPI',
					url: 'https://screenshotapi.to'
				}
			}}
			faq={[
				{
					question: 'Why switch from Urlbox to ScreenshotAPI?',
					answer: 'ScreenshotAPI offers pay-per-screenshot pricing (no wasted monthly subscriptions), a simpler API design, and competitive pricing at $0.015-$0.04/screenshot. Urlbox charges monthly regardless of usage.'
				},
				{
					question: 'Does ScreenshotAPI support all Urlbox features?',
					answer: 'ScreenshotAPI supports the most commonly used features: custom viewports, full-page capture, dark mode, wait strategies, and multiple output formats. Features like ad blocking, CSS injection, and retina rendering are not available.'
				},
				{
					question: 'How does authentication differ?',
					answer: 'Urlbox uses an API key + secret in the URL path with HMAC signing. ScreenshotAPI uses a simple x-api-key header. The header approach is simpler and does not require HMAC computation.'
				},
				{
					question:
						'Can I use the same webhooks for async screenshots?',
					answer: 'ScreenshotAPI returns screenshots synchronously. If you used Urlbox webhooks for async processing, you will need to wrap the synchronous call in your own async job queue.'
				}
			]}
			relatedPages={[
				{
					title: 'Migrate from Screenshotlayer',
					description: 'Switch from Screenshotlayer.',
					href: '/blog/migrate-from-screenshotlayer'
				},
				{
					title: '9 Best Screenshot APIs',
					description: 'Compare all screenshot APIs.',
					href: '/blog/best-screenshot-apis'
				},
				{
					title: 'Take Screenshots with JavaScript',
					description: 'JavaScript integration examples.',
					href: '/blog/how-to-take-screenshots-with-javascript'
				}
			]}
		>
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Parameter mapping
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Here is how Urlbox parameters map to ScreenshotAPI:
				</p>
				<div className="mt-6">
					<ComparisonTable
						headers={['Urlbox', 'ScreenshotAPI']}
						rows={[
							{
								feature: 'Target URL',
								values: ['url=https://...', 'url=https://...']
							},
							{
								feature: 'Width',
								values: ['width=1440', 'width=1440']
							},
							{
								feature: 'Height',
								values: ['height=900', 'height=900']
							},
							{
								feature: 'Full page',
								values: ['full_page=true', 'fullPage=true']
							},
							{
								feature: 'Format',
								values: ['format=png', 'type=png']
							},
							{
								feature: 'Quality',
								values: ['quality=80', 'quality=80']
							},
							{
								feature: 'Dark mode',
								values: ['dark_mode=true', 'colorScheme=dark']
							},
							{
								feature: 'Wait for element',
								values: [
									'wait_for=.selector',
									'waitForSelector=.selector'
								]
							},
							{
								feature: 'Delay',
								values: ['delay=2000', 'delay=2000']
							},
							{
								feature: 'Auth',
								values: ['HMAC URL signing', 'x-api-key header']
							}
						]}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Before and after
				</h2>
				<div className="mt-6">
					<CodeBlock
						language="javascript"
						title="BEFORE: Urlbox"
						code={`const Urlbox = require('urlbox');
const urlbox = Urlbox(URLBOX_API_KEY, URLBOX_API_SECRET);

const imgUrl = urlbox.buildUrl({
  url: 'https://example.com',
  width: 1440,
  height: 900,
  format: 'png',
  full_page: true,
  dark_mode: true,
  wait_for: '.content'
});

// imgUrl is a signed URL you can use in <img> tags
// or fetch to get the image bytes
const response = await fetch(imgUrl);
const buffer = await response.arrayBuffer();`}
					/>
				</div>
				<div className="mt-4">
					<CodeBlock
						language="javascript"
						title="AFTER: ScreenshotAPI"
						code={`const params = new URLSearchParams({
  url: 'https://example.com',
  width: '1440',
  height: '900',
  type: 'png',
  fullPage: 'true',
  colorScheme: 'dark',
  waitForSelector: '.content'
})

const response = await fetch(
  \`https://screenshotapi.to/api/v1/screenshot?\${params}\`,
  { headers: { 'x-api-key': process.env.SCREENSHOT_API_KEY } }
)
const buffer = await response.arrayBuffer()`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Pricing comparison
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Urlbox uses monthly subscription plans starting at $19/month
					for 1,000 screenshots (~$0.019/screenshot). ScreenshotAPI
					uses credit-based pricing at $0.015-$0.04/screenshot with no
					monthly commitment. For variable workloads,
					ScreenshotAPI&apos;s pay-per-use model avoids paying for
					unused screenshots. For consistent high volume, the
					per-screenshot cost is similar.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Feature differences
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Urlbox features <strong>not available</strong> in
					ScreenshotAPI: ad blocking, custom CSS/JS injection, retina
					rendering, cookie injection, HTTP basic auth, PDF output,
					and async webhook delivery. If you rely on these features,
					evaluate whether you can work around them or if Urlbox
					remains the better fit. For most screenshot use cases
					(capturing URLs as images), ScreenshotAPI covers everything
					you need.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Migration steps
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					<strong>1.</strong> Sign up at screenshotapi.to and get your
					API key. <strong>2.</strong> Replace Urlbox SDK calls with
					fetch requests using the parameter mapping above.{' '}
					<strong>3.</strong> Replace HMAC URL signing with the
					x-api-key header. <strong>4.</strong> Update parameter names
					(full_page → fullPage, format → type, dark_mode →
					colorScheme=dark, wait_for → waitForSelector).{' '}
					<strong>5.</strong> Remove the urlbox npm package.{' '}
					<strong>6.</strong> Test all screenshot flows and compare
					output quality.
				</p>
			</section>
		</ArticleLayout>
	)
}
