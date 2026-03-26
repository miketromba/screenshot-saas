import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock, ComparisonTable } from '@/components/seo'

export const metadata: Metadata = {
	title: 'Migrate from Browserless to ScreenshotAPI',
	description:
		'Replace Browserless screenshot endpoints with ScreenshotAPI. Simplify from Puppeteer scripts to a single HTTP call.'
}

export default function Page() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Blog', href: '/blog' },
				{ label: 'Migrate from Browserless' }
			]}
			title="Migrate from Browserless to ScreenshotAPI"
			description="Replace Browserless screenshot endpoints with a simpler ScreenshotAPI call. No more Puppeteer scripts, connection management, or browser instances."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'Article',
				headline: 'Migrate from Browserless to ScreenshotAPI',
				dateModified: '2026-03-25',
				publisher: {
					'@type': 'Organization',
					name: 'ScreenshotAPI',
					url: 'https://screenshotapi.to'
				}
			}}
			faq={[
				{
					question: 'What is Browserless?',
					answer: 'Browserless is a headless browser as a service. You connect Puppeteer or Playwright to their remote Chrome instances via WebSocket. It handles Chrome management, but you still write browser automation scripts.'
				},
				{
					question:
						'How is ScreenshotAPI different from Browserless?',
					answer: 'Browserless gives you a remote browser — you write Puppeteer/Playwright code that runs on their infrastructure. ScreenshotAPI is higher-level: you just pass a URL and parameters, no browser scripts needed.'
				},
				{
					question: 'Is ScreenshotAPI cheaper than Browserless?',
					answer: 'Browserless charges per unit of compute time, typically $0.05+ per browser minute. ScreenshotAPI charges per screenshot at $0.015-$0.04. For screenshot-only use cases, ScreenshotAPI is significantly cheaper.'
				},
				{
					question: 'Should I keep Browserless for anything?',
					answer: 'Keep Browserless if you need full browser automation beyond screenshots — web scraping, form filling, testing, or multi-step browser workflows. For screenshot-only needs, ScreenshotAPI is simpler and cheaper.'
				}
			]}
			relatedPages={[
				{
					title: 'Migrate from Puppeteer',
					description: 'Local Puppeteer to ScreenshotAPI migration.',
					href: '/blog/migrate-from-puppeteer'
				},
				{
					title: 'Migrate from Playwright',
					description: 'Playwright to ScreenshotAPI migration.',
					href: '/blog/migrate-from-playwright'
				},
				{
					title: '9 Best Screenshot APIs',
					description: 'Compare all screenshot API options.',
					href: '/blog/best-screenshot-apis'
				}
			]}
		>
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Why migrate from Browserless?
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Browserless provides remote Chrome instances, but for
					screenshots, it is overkill. You still need to write
					Puppeteer/Playwright scripts, manage WebSocket connections,
					handle browser contexts, and deal with script errors.
					ScreenshotAPI eliminates the scripting entirely — you send a
					URL and get back an image. It is also more cost-effective
					for screenshot workloads since Browserless charges per
					compute minute rather than per screenshot.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Architecture comparison
				</h2>
				<div className="mt-6">
					<ComparisonTable
						headers={['Browserless', 'ScreenshotAPI']}
						rows={[
							{
								feature: 'Model',
								values: [
									'Remote browser + your scripts',
									'Screenshot API endpoint'
								]
							},
							{
								feature: 'Code required',
								values: [
									'Puppeteer/Playwright script',
									'Single HTTP request'
								]
							},
							{
								feature: 'Connection',
								values: [
									'WebSocket to Chrome',
									'HTTPS GET request'
								]
							},
							{
								feature: 'Pricing',
								values: ['Per compute minute', 'Per screenshot']
							},
							{
								feature: 'SDK dependency',
								values: [
									'puppeteer or playwright',
									'None (HTTP)'
								]
							},
							{
								feature: 'Full browser control',
								values: [true, false]
							},
							{
								feature: 'Screenshot-specific features',
								values: ['Via script', 'Built-in parameters']
							},
							{
								feature: 'Dark mode',
								values: ['Via script', 'colorScheme=dark']
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
						title="BEFORE: Browserless + Puppeteer"
						code={`const puppeteer = require('puppeteer');

async function captureScreenshot(url) {
  const browser = await puppeteer.connect({
    browserWSEndpoint: \`wss://chrome.browserless.io?token=\${BROWSERLESS_TOKEN}\`
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.emulateMediaFeatures([
      { name: 'prefers-color-scheme', value: 'dark' }
    ]);
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.waitForSelector('.content');
    const buffer = await page.screenshot({ type: 'png', fullPage: true });
    return buffer;
  } finally {
    await browser.close();
  }
}`}
					/>
				</div>
				<div className="mt-4">
					<CodeBlock
						language="javascript"
						title="AFTER: ScreenshotAPI"
						code={`async function captureScreenshot(url) {
  const params = new URLSearchParams({
    url, width: '1440', height: '900',
    colorScheme: 'dark',
    waitForSelector: '.content',
    fullPage: 'true',
    type: 'png'
  })

  const response = await fetch(
    \`https://screenshotapi.to/api/v1/screenshot?\${params}\`,
    { headers: { 'x-api-key': process.env.SCREENSHOT_API_KEY } }
  )
  return Buffer.from(await response.arrayBuffer())
}`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Using Browserless /screenshot endpoint
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					If you used Browserless&apos;s built-in /screenshot REST
					endpoint instead of Puppeteer scripts, the migration is even
					simpler:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="javascript"
						title="BEFORE: Browserless /screenshot endpoint"
						code={`const response = await fetch(
  'https://chrome.browserless.io/screenshot?token=YOUR_TOKEN',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: 'https://example.com',
      options: {
        type: 'png',
        fullPage: true
      },
      viewport: { width: 1440, height: 900 }
    })
  }
)`}
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
  fullPage: 'true',
  type: 'png'
})

const response = await fetch(
  \`https://screenshotapi.to/api/v1/screenshot?\${params}\`,
  { headers: { 'x-api-key': process.env.SCREENSHOT_API_KEY } }
)`}
					/>
				</div>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					The key difference: Browserless uses POST with a JSON body;
					ScreenshotAPI uses GET with query parameters. GET is
					simpler, more cacheable, and easier to test in a browser or
					with cURL.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					What you can remove
				</h2>
				<div className="mt-6">
					<CodeBlock
						language="bash"
						title="Dependencies to remove"
						code={`# Remove Puppeteer/Playwright (no longer needed for screenshots)
npm uninstall puppeteer puppeteer-core playwright

# Remove Browserless connection management code
# Remove WebSocket error handling and reconnection logic
# Remove browser context pooling code`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Migration steps
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					<strong>1.</strong> Sign up at screenshotapi.to and get your
					API key. <strong>2.</strong> Replace Browserless Puppeteer
					connection code or /screenshot POST calls with ScreenshotAPI
					GET requests. <strong>3.</strong> Map parameters: viewport →
					width/height, options.type → type, options.fullPage →
					fullPage. <strong>4.</strong> Remove Puppeteer dependency if
					no longer needed. <strong>5.</strong> Cancel your
					Browserless subscription. <strong>6.</strong> Test and
					verify screenshot quality matches.
				</p>
			</section>
		</ArticleLayout>
	)
}
