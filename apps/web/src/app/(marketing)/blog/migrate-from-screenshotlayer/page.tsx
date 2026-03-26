import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock, ComparisonTable } from '@/components/seo'

export const metadata: Metadata = {
	title: 'Migrate from Screenshotlayer to ScreenshotAPI',
	description:
		'Switch from Screenshotlayer to ScreenshotAPI. Parameter mapping, before/after code, and reasons to upgrade to a modern screenshot API.'
}

export default function Page() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Blog', href: '/blog' },
				{ label: 'Migrate from Screenshotlayer' }
			]}
			title="Migrate from Screenshotlayer to ScreenshotAPI"
			description="Switch from Screenshotlayer to ScreenshotAPI. Complete parameter mapping, before/after code examples, and reasons to upgrade."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'Article',
				headline: 'Migrate from Screenshotlayer to ScreenshotAPI',
				dateModified: '2026-03-25',
				publisher: {
					'@type': 'Organization',
					name: 'ScreenshotAPI',
					url: 'https://screenshotapi.to'
				}
			}}
			faq={[
				{
					question: 'Why switch from Screenshotlayer?',
					answer: 'Screenshotlayer has an aging API design, does not support HTTPS on the free tier, lacks dark mode, and has no wait strategies for SPAs. ScreenshotAPI is modern, supports all formats, and handles JavaScript-rendered sites reliably.'
				},
				{
					question:
						'Does ScreenshotAPI support the same viewport parameter?',
					answer: 'Yes. Screenshotlayer uses viewport=1440x900 (combined string). ScreenshotAPI uses separate width=1440&height=900 parameters, which is more explicit and easier to work with.'
				},
				{
					question: 'Is ScreenshotAPI more expensive?',
					answer: 'Pricing is comparable. Screenshotlayer starts at $9.99/month for 500 screenshots. ScreenshotAPI charges $0.015-$0.04 per screenshot with no monthly commitment, which is more flexible for variable workloads.'
				},
				{
					question: 'Does ScreenshotAPI support HTTPS?',
					answer: 'Yes, fully. Unlike Screenshotlayer which restricts HTTPS to paid plans, ScreenshotAPI captures both HTTP and HTTPS URLs on all plans including free credits.'
				}
			]}
			relatedPages={[
				{
					title: 'Migrate from Urlbox',
					description: 'Switch from Urlbox to ScreenshotAPI.',
					href: '/blog/migrate-from-urlbox'
				},
				{
					title: 'Best Free Screenshot APIs',
					description: 'Compare free screenshot API options.',
					href: '/blog/best-free-screenshot-apis'
				},
				{
					title: 'Take Screenshots with cURL',
					description: 'Test ScreenshotAPI from the command line.',
					href: '/blog/how-to-take-screenshots-with-curl'
				}
			]}
		>
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Why migrate from Screenshotlayer?
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Screenshotlayer (by APILayer) has been around since 2015 and
					was one of the first screenshot APIs. However, it has not
					kept up with modern web development needs: no dark mode
					support, no wait strategies for JavaScript-rendered pages
					(SPAs), no WebP output, HTTPS restricted to paid plans, and
					limited viewport options. ScreenshotAPI addresses all of
					these limitations with a modern API design.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Parameter mapping
				</h2>
				<div className="mt-6">
					<ComparisonTable
						headers={['Screenshotlayer', 'ScreenshotAPI']}
						rows={[
							{
								feature: 'Target URL',
								values: ['url=https://...', 'url=https://...']
							},
							{
								feature: 'Viewport',
								values: [
									'viewport=1440x900',
									'width=1440&height=900'
								]
							},
							{
								feature: 'Full page',
								values: ['fullpage=1', 'fullPage=true']
							},
							{
								feature: 'Format',
								values: ['format=PNG', 'type=png']
							},
							{
								feature: 'Width only',
								values: ['width=800', 'width=800']
							},
							{
								feature: 'Force HTTPS',
								values: [
									'force=1 (paid)',
									'Automatic (all plans)'
								]
							},
							{
								feature: 'CSS selector',
								values: ['css_url=... (paid)', 'Not applicable']
							},
							{
								feature: 'Auth',
								values: [
									'access_key in URL',
									'x-api-key header'
								]
							},
							{
								feature: 'Dark mode',
								values: ['Not supported', 'colorScheme=dark']
							},
							{
								feature: 'Wait strategies',
								values: [
									'Not supported',
									'waitUntil, waitForSelector, delay'
								]
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
						title="BEFORE: Screenshotlayer"
						code={`const params = new URLSearchParams({
  access_key: process.env.SCREENSHOTLAYER_KEY,
  url: 'https://example.com',
  viewport: '1440x900',
  format: 'PNG',
  fullpage: '1',
  force: '1' // required for HTTPS on paid plans
})

const response = await fetch(
  \`http://api.screenshotlayer.com/api/capture?\${params}\`
)
const buffer = await response.arrayBuffer()`}
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
  fullPage: 'true'
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
					Key improvements after migrating
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					<strong>HTTPS everywhere:</strong> ScreenshotAPI captures
					HTTPS URLs on all plans. No more paying extra for HTTPS
					support. <strong>SPA support:</strong> Use{' '}
					{`waitUntil=networkidle`} and
					{` waitForSelector`} to capture JavaScript-rendered pages
					reliably. Screenshotlayer often returns blank pages for
					SPAs. <strong>Dark mode:</strong> Capture pages in dark mode
					with
					{` colorScheme=dark`}. Not available in Screenshotlayer at
					all. <strong>WebP output:</strong> Reduce image sizes by
					30-50% with WebP format. Screenshotlayer only supports PNG
					and JPEG. <strong>API key in header:</strong> More secure
					than passing keys in URL query parameters.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Migration steps
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					<strong>1.</strong> Sign up at screenshotapi.to and get your
					API key. <strong>2.</strong> Update the API endpoint from
					{` api.screenshotlayer.com/api/capture`} to
					{` screenshotapi.to/api/v1/screenshot`}. <strong>3.</strong>{' '}
					Move the API key from the {`access_key`} query parameter to
					the
					{` x-api-key`} header. <strong>4.</strong> Update parameter
					names:
					{` viewport=WxH`} → {`width=W&height=H`}, {`fullpage=1`} →
					{` fullPage=true`}, {`format=PNG`} → {`type=png`}.{' '}
					<strong>5.</strong> Remove {`force=1`} — HTTPS works
					automatically. <strong>6.</strong> Test all screenshot flows
					and verify output.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Bonus: New capabilities
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					After migrating, you gain access to features Screenshotlayer
					does not offer. Try capturing SPAs with{' '}
					{`waitUntil=networkidle`}, generating dark mode screenshots
					with {`colorScheme=dark`}, using WebP format for smaller
					file sizes, and waiting for specific elements with{' '}
					{`waitForSelector`}. These features open up new use cases
					like visual regression testing and design portfolio
					generation.
				</p>
			</section>
		</ArticleLayout>
	)
}
