import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock, ComparisonTable } from '@/components/seo'

export const metadata: Metadata = {
	title: 'Migrate from Playwright to ScreenshotAPI',
	description:
		'Replace Playwright screenshot code with ScreenshotAPI. Parameter mapping, before/after code examples, and step-by-step migration guide.'
}

export default function Page() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Blog', href: '/blog' },
				{ label: 'Migrate from Playwright' }
			]}
			title="Migrate from Playwright to ScreenshotAPI"
			description="Replace your Playwright screenshot code with a simple API call. Includes parameter mapping, before/after code, and what infrastructure you can remove."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'Article',
				headline: 'Migrate from Playwright to ScreenshotAPI',
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
						'Is Playwright better than Puppeteer for screenshots?',
					answer: 'Playwright has a slightly nicer API and supports multiple browsers (Chrome, Firefox, Safari). But for screenshots specifically, both are overkill — a screenshot API is simpler and more maintainable.'
				},
				{
					question:
						'Does ScreenshotAPI support Firefox or Safari rendering?',
					answer: 'ScreenshotAPI uses Chromium for rendering. If you need cross-browser screenshots, Playwright is still needed. However, 95%+ of screenshot use cases only need Chrome rendering.'
				},
				{
					question: 'What about Playwright for Python?',
					answer: 'The migration is the same — replace the Playwright Python code with a requests.get() call to ScreenshotAPI. See our Python screenshot guide for examples.'
				},
				{
					question: 'Can I migrate incrementally?',
					answer: 'Yes. Replace individual screenshot calls one at a time. You can run Playwright and ScreenshotAPI side by side during migration. Once all screenshot code is migrated, remove the Playwright dependency.'
				}
			]}
			relatedPages={[
				{
					title: 'Migrate from Puppeteer',
					description: 'Similar migration from Puppeteer.',
					href: '/blog/migrate-from-puppeteer'
				},
				{
					title: 'Take Screenshots with Python',
					description: 'Replace Playwright Python with an API call.',
					href: '/blog/how-to-take-screenshots-with-python'
				},
				{
					title: 'Screenshot Single-Page Applications',
					description: 'Handle SPAs with wait strategies.',
					href: '/blog/how-to-screenshot-single-page-applications'
				}
			]}
		>
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Why migrate from Playwright?
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Playwright is an excellent browser automation framework, but
					using it solely for screenshots means carrying unnecessary
					weight: browser binary downloads ({`playwright install`}{' '}
					downloads 300-600MB), browser process management, memory
					allocation for Chromium instances, complex Docker
					configurations, and flaky CI runs due to browser crashes. If
					screenshots are your only use case, ScreenshotAPI eliminates
					all of this.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Parameter mapping
				</h2>
				<div className="mt-6">
					<ComparisonTable
						headers={['Playwright', 'ScreenshotAPI']}
						rows={[
							{
								feature: 'Target URL',
								values: ['page.goto(url)', 'url=https://...']
							},
							{
								feature: 'Viewport size',
								values: [
									'browser.newContext({viewport})',
									'width=1440&height=900'
								]
							},
							{
								feature: 'Full page',
								values: [
									'page.screenshot({fullPage: true})',
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
								feature: 'Wait for load',
								values: [
									'goto(url, {waitUntil: "networkidle"})',
									'waitUntil=networkidle'
								]
							},
							{
								feature: 'Wait for element',
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
									'newContext({colorScheme: "dark"})',
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
						title="BEFORE: Playwright"
						code={`const { chromium } = require('playwright');

async function captureScreenshot(url) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark'
  });
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle' });
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
    colorScheme: 'dark', waitForSelector: '.content',
    fullPage: 'true', type: 'png'
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
					Python migration
				</h2>
				<div className="mt-6">
					<CodeBlock
						language="python"
						title="BEFORE: Playwright for Python"
						code={`from playwright.sync_api import sync_playwright

def capture_screenshot(url):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()
        page.goto(url, wait_until="networkidle")
        buffer = page.screenshot(type="png", full_page=True)
        browser.close()
        return buffer`}
					/>
				</div>
				<div className="mt-4">
					<CodeBlock
						language="python"
						title="AFTER: requests"
						code={`import requests

def capture_screenshot(url):
    response = requests.get(
        "https://screenshotapi.to/api/v1/screenshot",
        params={"url": url, "width": 1440, "height": 900, "fullPage": "true", "type": "png"},
        headers={"x-api-key": "sk_live_your_api_key"}
    )
    return response.content`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					What you can remove
				</h2>
				<div className="mt-6">
					<CodeBlock
						language="bash"
						title="Dependencies to remove"
						code={`# Remove Playwright and its browser downloads
npm uninstall playwright @playwright/test
npx playwright uninstall

# Python
pip uninstall playwright
playwright uninstall

# Remove from CI:
# - "npx playwright install --with-deps chromium" step
# - System dependency installation (libgbm, etc.)
# - Browser caching configuration`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					When to keep Playwright
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Keep Playwright if you use it for end-to-end testing, web
					scraping, multi-step automation, or cross-browser testing.
					ScreenshotAPI only replaces the screenshot functionality. If
					your Playwright code clicks buttons, fills forms, or
					navigates through flows before taking a screenshot, you
					still need Playwright for those interactions — unless you
					can create a public URL that renders the desired state
					directly.
				</p>
			</section>
		</ArticleLayout>
	)
}
