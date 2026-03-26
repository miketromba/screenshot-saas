import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock } from '@/components/seo'

export const metadata: Metadata = {
	title: 'How to Take Screenshots with JavaScript (2025)',
	description:
		'Capture website screenshots in JavaScript and Node.js using Puppeteer or ScreenshotAPI. Includes fetch, SDK, and browser examples.'
}

export default function Page() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Blog', href: '/blog' },
				{ label: 'Take Screenshots with JavaScript' }
			]}
			title="How to Take Screenshots with JavaScript"
			description="Capture website screenshots in JavaScript using Puppeteer, fetch(), or the ScreenshotAPI SDK. We cover Node.js and browser examples."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'Article',
				headline: 'How to Take Screenshots with JavaScript',
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
						'Can I take screenshots in the browser with JavaScript?',
					answer: 'You cannot capture screenshots of external websites from browser-side JavaScript due to same-origin policy restrictions. However, you can call ScreenshotAPI from the browser using fetch() to get screenshots as image blobs.'
				},
				{
					question:
						'Is Puppeteer still the best option for Node.js screenshots?',
					answer: 'Puppeteer is powerful for full browser automation, but for screenshots specifically, a dedicated API is simpler and more cost-effective. ScreenshotAPI eliminates the need to manage Chromium, handle memory leaks, and scale browser instances.'
				},
				{
					question: 'Does ScreenshotAPI have a JavaScript SDK?',
					answer: 'Yes. Install it with npm install screenshotapi and use it to capture screenshots in a few lines of code. It handles authentication, retries, and error handling automatically.'
				},
				{
					question: 'Can I use ScreenshotAPI with TypeScript?',
					answer: 'Absolutely. The SDK includes TypeScript type definitions out of the box, and all HTTP examples work the same way in TypeScript.'
				},
				{
					question: 'How do I save screenshots to disk in Node.js?',
					answer: 'Use fs.writeFile to save the response buffer: const buffer = await response.arrayBuffer(); fs.writeFileSync("screenshot.png", Buffer.from(buffer)).'
				}
			]}
			relatedPages={[
				{
					title: 'Take Screenshots with Python',
					description:
						'Capture screenshots using Python and requests.',
					href: '/blog/how-to-take-screenshots-with-python'
				},
				{
					title: 'Automate Website Screenshots',
					description:
						'Set up scheduled screenshot capture with cron jobs.',
					href: '/blog/how-to-automate-website-screenshots'
				},
				{
					title: 'Migrate from Puppeteer',
					description:
						'Replace Puppeteer screenshot code with ScreenshotAPI.',
					href: '/blog/migrate-from-puppeteer'
				}
			]}
		>
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Why screenshot websites with JavaScript?
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					JavaScript is the most common language for web development,
					and screenshot capture is a natural extension. Whether you
					are building link previews for a chat app, generating OG
					images for a CMS, monitoring competitor websites, or running
					visual regression tests, you need a reliable way to turn
					URLs into images. The challenge has always been managing
					headless browsers — until now.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					The manual way: Puppeteer
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Puppeteer has been the standard Node.js tool for headless
					browser automation. Here is the typical screenshot flow:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="javascript"
						title="screenshot_puppeteer.js"
						code={`const puppeteer = require('puppeteer');

async function captureScreenshot(url, outputPath = 'screenshot.png') {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    await page.screenshot({ path: outputPath, fullPage: true });
    console.log(\`Screenshot saved to \${outputPath}\`);
  } catch (error) {
    console.error('Screenshot failed:', error.message);
  } finally {
    await browser.close();
  }
}

captureScreenshot('https://example.com');`}
					/>
				</div>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					This downloads and manages a Chromium binary (~400MB),
					spawns a browser process for each run, and requires careful
					memory management. In serverless environments like Vercel or
					AWS Lambda, you need special packages like chrome-aws-lambda
					and are constrained by memory limits.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					The easy way: fetch() with ScreenshotAPI
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Replace all that complexity with a single HTTP request:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="javascript"
						title="screenshot_fetch.js"
						code={`const fs = require('fs');

async function captureScreenshot(url) {
  const params = new URLSearchParams({
    url,
    width: '1440',
    height: '900',
    type: 'png'
  });

  const response = await fetch(
    \`https://screenshotapi.to/api/v1/screenshot?\${params}\`,
    { headers: { 'x-api-key': 'sk_live_your_api_key' } }
  );

  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync('screenshot.png', buffer);
  console.log(\`Screenshot saved (\${buffer.length} bytes)\`);
}

captureScreenshot('https://example.com');`}
					/>
				</div>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Zero dependencies beyond Node.js itself. No Chromium to
					install, no browser pool to manage, no memory leaks to
					debug.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Using the ScreenshotAPI SDK
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					For an even cleaner developer experience, use the official
					SDK:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="bash"
						title="Install the SDK"
						code={`npm install screenshotapi`}
					/>
				</div>
				<div className="mt-4">
					<CodeBlock
						language="javascript"
						title="screenshot_sdk.js"
						code={`const { ScreenshotAPI } = require('screenshotapi');

const client = new ScreenshotAPI('sk_live_your_api_key');

const screenshot = await client.capture({
  url: 'https://example.com',
  width: 1440,
  height: 900,
  type: 'png',
  fullPage: true
});

// Save to file
await screenshot.saveToFile('screenshot.png');

// Or get the buffer directly
const buffer = await screenshot.toBuffer();`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Browser-side usage
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					You can also call ScreenshotAPI from client-side JavaScript.
					Note that you should proxy through your backend in
					production to avoid exposing your API key:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="javascript"
						title="Browser-side (via your backend proxy)"
						code={`async function getScreenshot(url) {
  const response = await fetch(
    \`/api/screenshot?url=\${encodeURIComponent(url)}\`
  );
  const blob = await response.blob();
  const imgUrl = URL.createObjectURL(blob);

  const img = document.createElement('img');
  img.src = imgUrl;
  document.body.appendChild(img);
}

getScreenshot('https://example.com');`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Advanced: dark mode and wait strategies
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					ScreenshotAPI supports options that would require complex
					Puppeteer scripting:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="javascript"
						title="Advanced parameters"
						code={`// Dark mode + full page + WebP
const params = new URLSearchParams({
  url: 'https://example.com',
  width: '1440',
  height: '900',
  type: 'webp',
  quality: '85',
  fullPage: 'true',
  colorScheme: 'dark'
});

// Wait for a specific element (great for SPAs)
const spaParams = new URLSearchParams({
  url: 'https://app.example.com',
  waitUntil: 'networkidle',
  waitForSelector: '.dashboard-content',
  delay: '1000',
  type: 'png'
});`}
					/>
				</div>
			</section>
		</ArticleLayout>
	)
}
