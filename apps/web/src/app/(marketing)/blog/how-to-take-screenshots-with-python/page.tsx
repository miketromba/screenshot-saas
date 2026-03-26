import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock } from '@/components/seo'

export const metadata: Metadata = {
	title: 'How to Take Screenshots with Python (2025)',
	description:
		'Learn how to capture website screenshots in Python using requests and ScreenshotAPI. Compare Puppeteer vs API approach with code examples.'
}

export default function Page() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Blog', href: '/blog' },
				{ label: 'Take Screenshots with Python' }
			]}
			title="How to Take Screenshots with Python"
			description="Capture website screenshots in Python with just a few lines of code. We'll compare the manual Puppeteer/Playwright approach with the simpler ScreenshotAPI method."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'Article',
				headline: 'How to Take Screenshots with Python',
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
						'Can I take screenshots with Python without a browser?',
					answer: 'Yes. ScreenshotAPI handles the browser rendering on its servers. You just make an HTTP request with the requests library and receive a screenshot image back — no Chromium, Selenium, or Playwright needed on your machine.'
				},
				{
					question:
						'How do I save the screenshot to a file in Python?',
					answer: 'After making the API request with requests.get(), write response.content to a file in binary mode: open("screenshot.png", "wb").write(response.content). The API returns raw image bytes.'
				},
				{
					question: 'Is Pyppeteer still maintained?',
					answer: 'Pyppeteer (the Python port of Puppeteer) has not been actively maintained since 2021. For browser automation in Python, Playwright for Python is the better choice — but for screenshots specifically, an API is far simpler.'
				},
				{
					question: 'What image formats does ScreenshotAPI support?',
					answer: 'ScreenshotAPI supports PNG, JPEG, and WebP output formats. Set the type parameter to png, jpeg, or webp in your request.'
				},
				{
					question:
						'Can I capture full-page screenshots with Python?',
					answer: 'Yes. Add fullPage=true to your API request parameters and ScreenshotAPI will capture the entire scrollable page, not just the visible viewport.'
				}
			]}
			relatedPages={[
				{
					title: 'Take Screenshots with JavaScript',
					description:
						'Capture screenshots using Node.js fetch or the SDK.',
					href: '/blog/how-to-take-screenshots-with-javascript'
				},
				{
					title: 'Take Full-Page Screenshots',
					description:
						'Capture entire scrollable pages with one parameter.',
					href: '/blog/how-to-take-full-page-screenshots'
				},
				{
					title: 'Migrate from Puppeteer',
					description:
						'Step-by-step guide to replacing Puppeteer with an API.',
					href: '/blog/migrate-from-puppeteer'
				}
			]}
		>
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Why capture screenshots in Python?
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Python is the go-to language for automation, data pipelines,
					and web scraping. Adding screenshot capabilities unlocks use
					cases like visual monitoring, generating social preview
					images, archiving web pages, and building testing pipelines.
					The challenge is that capturing a screenshot traditionally
					requires running a headless browser — which means managing
					Chromium binaries, handling memory leaks, and dealing with
					flaky rendering.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					The manual way: Playwright for Python
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					The most common approach is using Playwright or Selenium to
					control a headless browser. Here is what that looks like
					with Playwright:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="python"
						title="screenshot_playwright.py"
						code={`from playwright.sync_api import sync_playwright

def capture_screenshot(url, output_path="screenshot.png"):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 900}
        )
        page = context.new_page()

        try:
            page.goto(url, wait_until="networkidle")
            page.screenshot(path=output_path, full_page=True)
            print(f"Screenshot saved to {output_path}")
        except Exception as e:
            print(f"Failed to capture screenshot: {e}")
        finally:
            browser.close()

capture_screenshot("https://example.com")`}
					/>
				</div>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					This works, but it requires installing Playwright and its
					Chromium binary ({`playwright install chromium`}), managing
					browser lifecycle, handling timeouts and errors, and dealing
					with significant memory usage. On a server, you also need
					system dependencies like libgbm and libatk. In Docker, the
					image size balloons to 1GB+.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					The easy way: ScreenshotAPI + requests
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Instead of running a browser yourself, offload the rendering
					to ScreenshotAPI. One HTTP request, a few lines of Python,
					and you get back a screenshot image.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="python"
						title="screenshot_api.py"
						code={`import requests

response = requests.get(
    "https://screenshotapi.to/api/v1/screenshot",
    params={"url": "https://example.com", "width": 1440, "height": 900, "type": "png"},
    headers={"x-api-key": "sk_live_your_api_key"}
)

with open("screenshot.png", "wb") as f:
    f.write(response.content)

print(f"Screenshot saved ({len(response.content)} bytes)")`}
					/>
				</div>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					No Chromium binary. No Playwright installation. No system
					dependencies. Just the requests library that you already
					have in every Python project.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Adding error handling
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					For production use, add proper error handling and retries:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="python"
						title="screenshot_robust.py"
						code={`import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

def capture_screenshot(url, output_path="screenshot.png", **kwargs):
    session = requests.Session()
    retries = Retry(total=3, backoff_factor=1, status_forcelist=[502, 503, 504])
    session.mount("https://", HTTPAdapter(max_retries=retries))

    params = {"url": url, "width": 1440, "height": 900, "type": "png", **kwargs}

    response = session.get(
        "https://screenshotapi.to/api/v1/screenshot",
        params=params,
        headers={"x-api-key": "sk_live_your_api_key"},
        timeout=30
    )
    response.raise_for_status()

    with open(output_path, "wb") as f:
        f.write(response.content)

    return output_path

# Basic usage
capture_screenshot("https://example.com")

# Full page, dark mode, JPEG
capture_screenshot(
    "https://example.com",
    output_path="dark.jpg",
    fullPage="true",
    colorScheme="dark",
    type="jpeg",
    quality="80"
)`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Advanced options
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					ScreenshotAPI supports many parameters that would require
					complex Playwright scripts to replicate:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="python"
						title="advanced_options.py"
						code={`# Wait for a specific element before capturing
params = {
    "url": "https://app.example.com/dashboard",
    "waitForSelector": ".dashboard-loaded",
    "waitUntil": "networkidle",
    "delay": 2000,
    "width": 1440,
    "height": 900,
    "type": "png"
}

# Mobile viewport
params = {
    "url": "https://example.com",
    "width": 375,
    "height": 812,
    "type": "png"
}

# Full page in dark mode as WebP
params = {
    "url": "https://example.com",
    "fullPage": "true",
    "colorScheme": "dark",
    "type": "webp",
    "quality": 85
}`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Playwright vs ScreenshotAPI: which to use?
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Use Playwright if you need full browser automation —
					clicking buttons, filling forms, navigating through flows.
					Use ScreenshotAPI if you just need screenshots: it is faster
					to set up, cheaper to run, and far simpler to maintain. You
					avoid managing Chromium, handling memory leaks, and building
					infrastructure to scale browser instances.
				</p>
			</section>
		</ArticleLayout>
	)
}
