import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock } from '@/components/seo'

export const metadata: Metadata = {
	title: 'How to Take Mobile Screenshots of Websites',
	description:
		'Capture responsive mobile screenshots using custom viewport sizes. iPhone, Android, and tablet viewport examples for responsive testing.'
}

export default function Page() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Blog', href: '/blog' },
				{ label: 'Take Mobile Screenshots' }
			]}
			title="How to Take Mobile Screenshots of Websites"
			description="Capture responsive mobile screenshots using custom viewport sizes. Test iPhone, Android, and tablet layouts with ScreenshotAPI's width and height parameters."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'Article',
				headline: 'How to Take Mobile Screenshots of Websites',
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
						'What viewport size should I use for iPhone screenshots?',
					answer: 'iPhone 14/15: 390x844, iPhone 14/15 Pro Max: 430x932, iPhone SE: 375x667. These are CSS pixel values, not physical pixel values.'
				},
				{
					question: 'Does this trigger responsive CSS breakpoints?',
					answer: 'Yes. Setting the viewport width triggers CSS media queries just like a real device. A width of 375px will trigger @media (max-width: 768px) styles and mobile layouts.'
				},
				{
					question: 'Can I simulate a specific device user agent?',
					answer: 'ScreenshotAPI uses a standard Chrome user agent. The viewport size is what triggers responsive layouts — user agent strings rarely affect CSS rendering in modern sites.'
				},
				{
					question: 'How do I capture multiple device sizes at once?',
					answer: 'Make parallel API requests with different width/height parameters. Each request returns a screenshot at the specified viewport size.'
				}
			]}
			relatedPages={[
				{
					title: 'Take Full-Page Screenshots',
					description: 'Capture entire scrollable pages.',
					href: '/blog/how-to-take-full-page-screenshots'
				},
				{
					title: 'Capture Dark Mode Screenshots',
					description: 'Force dark mode rendering in screenshots.',
					href: '/blog/how-to-capture-dark-mode-screenshots'
				},
				{
					title: 'Build Visual Regression Testing',
					description: 'Test responsiveness across deployments.',
					href: '/blog/how-to-build-visual-regression-testing-pipeline'
				}
			]}
		>
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Why mobile screenshots matter
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Over 60% of web traffic comes from mobile devices. Capturing
					mobile screenshots is essential for responsive design
					testing, QA across device sizes, client presentations
					showing mobile layouts, app store and marketing materials,
					and visual regression testing across breakpoints.
					ScreenshotAPI lets you set any viewport size with the
					{` width`} and {`height`} parameters — no physical device
					farm needed.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Common device viewport sizes
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Here are the most common device viewports in CSS pixels:
				</p>
				<div className="mt-6 space-y-4">
					<CodeBlock
						language="bash"
						title="iPhone 14 / 15 (390x844)"
						code={`curl -o iphone14.png \\
  -H "x-api-key: sk_live_your_api_key" \\
  "https://screenshotapi.to/api/v1/screenshot?url=https://example.com&width=390&height=844&type=png"`}
					/>
					<CodeBlock
						language="bash"
						title="iPhone 14 Pro Max (430x932)"
						code={`curl -o iphone14promax.png \\
  -H "x-api-key: sk_live_your_api_key" \\
  "https://screenshotapi.to/api/v1/screenshot?url=https://example.com&width=430&height=932&type=png"`}
					/>
					<CodeBlock
						language="bash"
						title="Samsung Galaxy S24 (360x780)"
						code={`curl -o galaxy-s24.png \\
  -H "x-api-key: sk_live_your_api_key" \\
  "https://screenshotapi.to/api/v1/screenshot?url=https://example.com&width=360&height=780&type=png"`}
					/>
					<CodeBlock
						language="bash"
						title="iPad (810x1080)"
						code={`curl -o ipad.png \\
  -H "x-api-key: sk_live_your_api_key" \\
  "https://screenshotapi.to/api/v1/screenshot?url=https://example.com&width=810&height=1080&type=png"`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Batch capture across all breakpoints
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Capture a URL at every common breakpoint in a single script:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="javascript"
						title="capture-all-viewports.js"
						code={`const fs = require('fs')

const VIEWPORTS = [
  { name: 'mobile-sm', width: 320, height: 568 },   // iPhone SE (old)
  { name: 'mobile', width: 375, height: 812 },       // iPhone X/11/12
  { name: 'mobile-lg', width: 390, height: 844 },    // iPhone 14/15
  { name: 'mobile-xl', width: 430, height: 932 },    // iPhone Pro Max
  { name: 'tablet', width: 768, height: 1024 },      // iPad
  { name: 'tablet-lg', width: 1024, height: 1366 },  // iPad Pro
  { name: 'desktop', width: 1440, height: 900 },     // Standard desktop
  { name: 'desktop-xl', width: 1920, height: 1080 }  // Full HD
]

async function captureAllViewports(url) {
  for (const viewport of VIEWPORTS) {
    const params = new URLSearchParams({
      url,
      width: String(viewport.width),
      height: String(viewport.height),
      type: 'png'
    })

    const response = await fetch(
      \`https://screenshotapi.to/api/v1/screenshot?\${params}\`,
      { headers: { 'x-api-key': process.env.SCREENSHOT_API_KEY } }
    )

    const buffer = Buffer.from(await response.arrayBuffer())
    fs.writeFileSync(\`\${viewport.name}.png\`, buffer)
    console.log(\`✓ \${viewport.name} (\${viewport.width}x\${viewport.height})\`)

    await new Promise(r => setTimeout(r, 500))
  }
}

captureAllViewports('https://example.com')`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Mobile full-page screenshots
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Combine mobile viewports with full-page capture to see the
					entire mobile layout:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="bash"
						title="Mobile full-page capture"
						code={`# iPhone 14 full page
curl -o mobile-fullpage.png \\
  -H "x-api-key: sk_live_your_api_key" \\
  "https://screenshotapi.to/api/v1/screenshot?url=https://example.com&width=390&fullPage=true&type=png"

# iPad full page in dark mode
curl -o tablet-dark-fullpage.png \\
  -H "x-api-key: sk_live_your_api_key" \\
  "https://screenshotapi.to/api/v1/screenshot?url=https://example.com&width=768&fullPage=true&colorScheme=dark&type=png"`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Responsive testing workflow
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Use mobile screenshots as part of your testing workflow:
					capture all breakpoints before a deploy, compare against
					baseline images, and flag any layout shifts. This catches
					responsive bugs that desktop-only testing misses — like
					overflowing text, hidden elements, or broken navigation
					menus on small screens.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Tips for accurate mobile screenshots
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Use {`waitUntil=networkidle`} for sites that load
					mobile-specific resources. Add {`delay=1000`} for sites with
					mobile-specific animations or transitions. Remember that
					viewport sizes should be in CSS pixels, not physical pixels
					— an iPhone 14 at 3x is 390 CSS pixels wide, not 1170.
					Full-page mode with {`fullPage=true`} is especially useful
					on mobile since content is stacked vertically.
				</p>
			</section>
		</ArticleLayout>
	)
}
