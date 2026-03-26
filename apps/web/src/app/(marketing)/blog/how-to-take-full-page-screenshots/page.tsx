import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock } from '@/components/seo'

export const metadata: Metadata = {
	title: 'How to Take Full-Page Screenshots (2025)',
	description:
		'Capture entire scrollable web pages as a single image using the fullPage parameter. Perfect for archiving, documentation, and design review.'
}

export default function Page() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Blog', href: '/blog' },
				{ label: 'Take Full-Page Screenshots' }
			]}
			title="How to Take Full-Page Screenshots"
			description="Capture entire scrollable web pages as a single image with ScreenshotAPI's fullPage parameter. One flag, complete page capture."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'Article',
				headline: 'How to Take Full-Page Screenshots',
				dateModified: '2026-03-25',
				publisher: {
					'@type': 'Organization',
					name: 'ScreenshotAPI',
					url: 'https://screenshotapi.to'
				}
			}}
			faq={[
				{
					question: 'What does fullPage=true do?',
					answer: 'It captures the entire scrollable page, not just the visible viewport. The API scrolls to the bottom of the page, calculates the total height, and renders the complete page as a single image.'
				},
				{
					question: 'Is there a maximum page height?',
					answer: 'ScreenshotAPI supports pages up to 16,384 pixels tall. For extremely long pages, consider capturing sections separately or using a viewport-only capture.'
				},
				{
					question:
						'Does full-page capture work with lazy-loaded images?',
					answer: 'Yes. The API scrolls through the page which triggers lazy-loaded images. Combine fullPage=true with waitUntil=networkidle to ensure all images are loaded before capture.'
				},
				{
					question: 'What format is best for full-page screenshots?',
					answer: 'PNG for pixel-perfect quality (diagrams, text-heavy pages). WebP for a good balance of quality and file size. JPEG for photos and visual content where some compression is acceptable.'
				},
				{
					question:
						'Can I set a specific height instead of full page?',
					answer: 'Yes. Omit fullPage and set the height parameter to your desired pixel value. The screenshot will capture exactly that viewport size.'
				}
			]}
			relatedPages={[
				{
					title: 'Take Mobile Screenshots',
					description:
						'Capture responsive screenshots at mobile viewports.',
					href: '/blog/how-to-take-mobile-screenshots-of-websites'
				},
				{
					title: 'Automate Website Screenshots',
					description:
						'Set up automated screenshot capture pipelines.',
					href: '/blog/how-to-automate-website-screenshots'
				},
				{
					title: 'Screenshot Single-Page Applications',
					description:
						'Handle JS-rendered SPAs with smart wait strategies.',
					href: '/blog/how-to-screenshot-single-page-applications'
				}
			]}
		>
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Why full-page screenshots?
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Standard screenshots capture only the visible viewport —
					typically the top 900 pixels of a page. But most web pages
					scroll far beyond that. Full-page screenshots capture
					everything: the header, all content sections, the footer,
					and every pixel in between. Use cases include web archiving
					for compliance, design review and sign-off, documentation
					and knowledge bases, visual regression testing, and
					competitive analysis.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Basic full-page capture
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Add {`fullPage=true`} to capture the entire scrollable page:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="bash"
						title="Full-page screenshot with cURL"
						code={`curl -o fullpage.png \\
  -H "x-api-key: sk_live_your_api_key" \\
  "https://screenshotapi.to/api/v1/screenshot?url=https://example.com&fullPage=true&width=1440&type=png"`}
					/>
				</div>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					When {`fullPage=true`} is set, the height parameter is
					ignored. The API calculates the actual page height and
					captures everything.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Full-page capture in different languages
				</h2>
				<div className="mt-6 space-y-4">
					<CodeBlock
						language="javascript"
						title="Node.js"
						code={`const params = new URLSearchParams({
  url: 'https://example.com',
  fullPage: 'true',
  width: '1440',
  type: 'png'
})

const response = await fetch(
  \`https://screenshotapi.to/api/v1/screenshot?\${params}\`,
  { headers: { 'x-api-key': 'sk_live_your_api_key' } }
)

const buffer = Buffer.from(await response.arrayBuffer())
fs.writeFileSync('fullpage.png', buffer)`}
					/>
					<CodeBlock
						language="python"
						title="Python"
						code={`response = requests.get(
    "https://screenshotapi.to/api/v1/screenshot",
    params={"url": "https://example.com", "fullPage": "true", "width": 1440, "type": "png"},
    headers={"x-api-key": "sk_live_your_api_key"}
)

with open("fullpage.png", "wb") as f:
    f.write(response.content)`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Handling lazy-loaded content
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Many modern sites lazy-load images and content as the user
					scrolls. ScreenshotAPI automatically scrolls through the
					page when
					{` fullPage=true`} is set, triggering lazy loaders. For
					extra reliability, combine it with wait strategies:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="bash"
						title="Full page with wait strategy"
						code={`curl -o fullpage.png \\
  -H "x-api-key: sk_live_your_api_key" \\
  "https://screenshotapi.to/api/v1/screenshot?url=https://example.com&fullPage=true&width=1440&waitUntil=networkidle&delay=2000&type=png"`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Optimizing file size
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Full-page screenshots can be large. Here are strategies to
					reduce file size without sacrificing quality:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="bash"
						title="Optimized full-page capture"
						code={`# WebP at 85% quality — typically 40-60% smaller than PNG
curl -o fullpage.webp \\
  -H "x-api-key: sk_live_your_api_key" \\
  "https://screenshotapi.to/api/v1/screenshot?url=https://example.com&fullPage=true&width=1440&type=webp&quality=85"

# JPEG at 80% quality — good for photo-heavy pages
curl -o fullpage.jpg \\
  -H "x-api-key: sk_live_your_api_key" \\
  "https://screenshotapi.to/api/v1/screenshot?url=https://example.com&fullPage=true&width=1440&type=jpeg&quality=80"

# Narrower width — reduces both dimensions and file size
curl -o fullpage-narrow.png \\
  -H "x-api-key: sk_live_your_api_key" \\
  "https://screenshotapi.to/api/v1/screenshot?url=https://example.com&fullPage=true&width=1024&type=png"`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Use cases for full-page capture
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					<strong>Web archiving:</strong> Capture complete page
					snapshots for compliance, legal evidence, or historical
					records. <strong>Design review:</strong> Share full page
					designs with stakeholders without requiring them to scroll
					through the live site. <strong>Documentation:</strong> Embed
					complete page screenshots in wikis, Notion docs, or PDFs.{' '}
					<strong>Visual testing:</strong> Compare full-page
					screenshots before and after deployments to catch unintended
					changes.
				</p>
			</section>
		</ArticleLayout>
	)
}
