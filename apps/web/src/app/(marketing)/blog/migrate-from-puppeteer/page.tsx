import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock, ComparisonTable } from '@/components/seo'

export const metadata: Metadata = {
	title: 'Migrate from Puppeteer to ScreenshotAPI',
	description:
		'Replace Puppeteer screenshot code with ScreenshotAPI. Step-by-step migration guide with parameter mapping and before/after examples.'
}

export default function Page() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Blog', href: '/blog' },
				{ label: 'Migrate from Puppeteer' }
			]}
			title="Migrate from Puppeteer to ScreenshotAPI"
			description="Replace your Puppeteer screenshot code with a simple API call. Step-by-step migration with parameter mapping, before/after code, and what you can remove."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'Article',
				headline: 'Migrate from Puppeteer to ScreenshotAPI',
				dateModified: '2026-03-25',
				publisher: {
					'@type': 'Organization',
					name: 'ScreenshotAPI',
					url: 'https://screenshotapi.to'
				}
			}}
			faq={[
				{
					question:
						'Can I replace all Puppeteer usage with ScreenshotAPI?',
					answer: 'Only if you use Puppeteer exclusively for screenshots. If you also use it for web scraping, form automation, or testing, you will still need Puppeteer for those tasks. ScreenshotAPI replaces the screenshot functionality only.'
				},
				{
					question:
						'How much faster is ScreenshotAPI than Puppeteer?',
					answer: 'The API call itself takes 2-5 seconds. The real time savings come from setup: no Chromium download (5-10 minutes in CI), no browser launch time (1-2 seconds), and no infrastructure management (hours of DevOps work).'
				},
				{
					question: 'Will my screenshots look different?',
					answer: 'ScreenshotAPI uses Chromium for rendering, the same engine Puppeteer uses. Screenshots should look identical. Minor differences may occur due to font availability or timezone-dependent content.'
				},
				{
					question:
						'What about Puppeteer scripts that click, scroll, or fill forms before screenshotting?',
					answer: 'ScreenshotAPI supports basic interactions via wait strategies (waitUntil, waitForSelector, delay). For complex multi-step interactions, you would need to keep Puppeteer or create a public URL that renders the desired state.'
				}
			]}
			relatedPages={[
				{
					title: 'Migrate from Playwright',
					description: 'Similar migration from Playwright.',
					href: '/blog/migrate-from-playwright'
				},
				{
					title: 'Take Screenshots with JavaScript',
					description: 'JavaScript screenshot examples.',
					href: '/blog/how-to-take-screenshots-with-javascript'
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
					Why migrate from Puppeteer?
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Puppeteer is powerful for browser automation, but using it
					just for screenshots comes with heavy overhead: managing
					Chromium binaries (~400MB download), handling memory leaks
					from browser processes, building infrastructure to pool and
					scale browser instances, dealing with Docker image bloat,
					and debugging flaky headless Chrome crashes. ScreenshotAPI
					handles all of this for you and exposes a simple HTTP
					endpoint.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Parameter mapping
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Here is how Puppeteer options map to ScreenshotAPI
					parameters:
				</p>
				<div className="mt-6">
					<ComparisonTable
						headers={['Puppeteer', 'ScreenshotAPI']}
						rows={[
							{
								feature: 'Target URL',
								values: ['page.goto(url)', 'url=https://...']
							},
							{
								feature: 'Viewport width',
								values: [
									'page.setViewport({width})',
									'width=1440'
								]
							},
							{
								feature: 'Viewport height',
								values: [
									'page.setViewport({height})',
									'height=900'
								]
							},
							{
								feature: 'Full page',
								values: [
									'screenshot({fullPage: true})',
									'fullPage=true'
								]
							},
							{
								feature: 'Image format',
								values: [
									'screenshot({type: "png"})',
									'type=png'
								]
							},
							{
								feature: 'JPEG quality',
								values: [
									'screenshot({quality: 80})',
									'quality=80'
								]
							},
							{
								feature: 'Wait for network',
								values: [
									'goto(url, {waitUntil: "networkidle0"})',
									'waitUntil=networkidle'
								]
							},
							{
								feature: 'Wait for selector',
								values: [
									'page.waitForSelector(".foo")',
									'waitForSelector=.foo'
								]
							},
							{
								feature: 'Extra delay',
								values: [
									'page.waitForTimeout(2000)',
									'delay=2000'
								]
							},
							{
								feature: 'Dark mode',
								values: [
									'page.emulateMediaFeatures([...])',
									'colorScheme=dark'
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
						title="BEFORE: Puppeteer (20+ lines)"
						code={`const puppeteer = require('puppeteer');

async function captureScreenshot(url) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox',
           '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.emulateMediaFeatures([
      { name: 'prefers-color-scheme', value: 'dark' }
    ]);
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    const buffer = await page.screenshot({
      type: 'png',
      fullPage: true
    });
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
						title="AFTER: ScreenshotAPI (8 lines)"
						code={`async function captureScreenshot(url) {
  const params = new URLSearchParams({
    url, width: '1440', height: '900',
    colorScheme: 'dark', fullPage: 'true', type: 'png'
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
					What you can remove
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					After migrating, you can remove the following from your
					project:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="bash"
						title="Dependencies to remove"
						code={`# Remove Puppeteer and its Chromium download
npm uninstall puppeteer puppeteer-core

# If you used chrome-aws-lambda for Lambda/Vercel
npm uninstall chrome-aws-lambda @sparticuz/chromium

# Remove Chromium from your Docker image
# Before: FROM node:20 + apt-get install chromium (1.2GB image)
# After:  FROM node:20-alpine (180MB image)`}
					/>
				</div>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					You also no longer need: Chromium system dependencies
					(libgbm, libatk, libnss3), browser process pool management
					code, memory monitoring for Chrome processes, Chrome crash
					recovery logic, and special Docker/CI configuration for
					headless Chrome.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Step-by-step migration
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					<strong>Step 1:</strong> Sign up at screenshotapi.to and get
					your API key. <strong>Step 2:</strong> Replace each{' '}
					{`puppeteer.launch()`} / {`page.screenshot()`} call with a
					fetch request using the parameter mapping above.{' '}
					<strong>Step 3:</strong> Run your tests to verify
					screenshots match. <strong>Step 4:</strong> Remove the
					puppeteer dependency and any Chrome-related infrastructure.{' '}
					<strong>Step 5:</strong> Remove Chrome from your Docker
					images and CI configuration.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					When to keep Puppeteer
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Keep Puppeteer if you use it for more than screenshots — web
					scraping, end-to-end testing, form automation, or multi-step
					browser workflows. ScreenshotAPI replaces the screenshot
					functionality, not the full browser automation. If
					screenshots are your only use case, migrating eliminates
					significant complexity.
				</p>
			</section>
		</ArticleLayout>
	)
}
