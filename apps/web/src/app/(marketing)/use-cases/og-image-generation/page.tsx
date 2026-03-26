import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock, ComparisonTable } from '@/components/seo'

export const metadata: Metadata = {
	title: 'Dynamic OG Image Generation API — Auto-Generate Social Cards',
	description:
		'Generate Open Graph images and social cards from any URL with ScreenshotAPI. Automate OG image creation for blogs, SaaS products, and content platforms.'
}

const ogApiRoute = `import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'url is required' }, { status: 400 });
  }

  const screenshotUrl = new URL('https://screenshotapi.to/api/v1/screenshot');
  screenshotUrl.searchParams.set('url', targetUrl);
  screenshotUrl.searchParams.set('width', '1200');
  screenshotUrl.searchParams.set('height', '630');
  screenshotUrl.searchParams.set('type', 'png');

  const response = await fetch(screenshotUrl, {
    headers: { 'x-api-key': process.env.SCREENSHOT_API_KEY },
    next: { revalidate: 86400 } // cache for 24 hours
  });

  const imageBuffer = await response.arrayBuffer();

  return new NextResponse(imageBuffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400'
    }
  });
}`

const metaTagExample = `// In your page layout or head component
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  const ogUrl = \`https://yoursite.com/api/og?url=\${encodeURIComponent(post.url)}\`;

  return {
    openGraph: {
      title: post.title,
      description: post.description,
      images: [{ url: ogUrl, width: 1200, height: 630 }]
    },
    twitter: {
      card: 'summary_large_image',
      images: [ogUrl]
    }
  };
}`

const pythonExample = `import requests
import hashlib
import os

API_KEY = os.environ["SCREENSHOT_API_KEY"]
CACHE_DIR = "./og-cache"

def generate_og_image(url: str) -> str:
    """Generate and cache an OG image for a URL."""
    cache_key = hashlib.sha256(url.encode()).hexdigest()[:16]
    cache_path = f"{CACHE_DIR}/{cache_key}.png"

    if os.path.exists(cache_path):
        return cache_path

    response = requests.get(
        "https://screenshotapi.to/api/v1/screenshot",
        params={"url": url, "width": 1200, "height": 630, "type": "png"},
        headers={"x-api-key": API_KEY}
    )
    response.raise_for_status()

    os.makedirs(CACHE_DIR, exist_ok=True)
    with open(cache_path, "wb") as f:
        f.write(response.content)

    return cache_path`

export default function OgImageGenerationPage() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Use Cases', href: '/use-cases' },
				{ label: 'OG Image Generation' }
			]}
			title="Dynamic OG Image Generation"
			description="Automatically generate Open Graph images and social cards from any URL. Stop creating OG images manually — let ScreenshotAPI capture pixel-perfect previews at scale."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'Article',
				headline: 'Dynamic OG Image Generation with Screenshot API',
				description:
					'Generate Open Graph images and social cards from any URL with ScreenshotAPI.',
				dateModified: '2026-03-25',
				publisher: {
					'@type': 'Organization',
					name: 'ScreenshotAPI',
					url: 'https://screenshotapi.to'
				}
			}}
			faq={[
				{
					question: 'What size should OG images be?',
					answer: 'The recommended size for Open Graph images is 1200×630 pixels. This works well across Facebook, Twitter/X, LinkedIn, and Slack. ScreenshotAPI lets you specify exact width and height to match this standard.'
				},
				{
					question: 'How do I cache generated OG images?',
					answer: 'Set Cache-Control headers on your API route (e.g., max-age=86400 for 24 hours). You can also store generated images in a CDN or object storage like S3, keyed by a hash of the URL, so each URL is only captured once.'
				},
				{
					question: 'Can I generate OG images for dynamic content?',
					answer: 'Yes. ScreenshotAPI renders the full page including JavaScript, so dynamic content, SPAs, and server-rendered pages all work. Use the waitUntil or waitForSelector parameters to ensure content is fully loaded before capture.'
				},
				{
					question: 'How much does OG image generation cost?',
					answer: 'With ScreenshotAPI, each screenshot costs $0.015–$0.04 depending on your plan. A typical blog with 500–2,000 posts would spend $20–60/month. Caching reduces costs further since each URL only needs to be captured once.'
				},
				{
					question:
						'Does this work with Next.js, Nuxt, and other frameworks?',
					answer: 'Absolutely. ScreenshotAPI is a REST API that works with any framework or language. We show Next.js examples here, but the same approach works with Nuxt, SvelteKit, Remix, Rails, Django, or any backend.'
				}
			]}
			relatedPages={[
				{
					title: 'Social Media Automation',
					description:
						'Auto-generate platform-specific social images from URLs.',
					href: '/use-cases/social-media-automation'
				},
				{
					title: 'Link Previews',
					description:
						'Show rich URL thumbnails in chat apps and social platforms.',
					href: '/use-cases/link-previews'
				},
				{
					title: 'ScreenshotAPI vs Puppeteer',
					description:
						'Why a managed API beats running your own browser for OG images.',
					href: '/compare/screenshotapi-vs-puppeteer'
				}
			]}
		>
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					The problem with manual OG images
				</h2>
				<p className="mt-4 text-muted-foreground">
					Every page you publish needs an Open Graph image for social
					sharing. Without one, links shared on Twitter/X, Facebook,
					LinkedIn, and Slack look bare — no preview, no thumbnail,
					just a plain URL. The result is lower click-through rates
					and less engagement.
				</p>
				<p className="mt-3 text-muted-foreground">
					Creating OG images manually is tedious. Design teams create
					templates in Figma, developers export and upload them, and
					the whole process breaks down at scale. A blog with hundreds
					of posts or a SaaS with thousands of user-generated pages
					can&apos;t have someone hand-craft each image.
				</p>
				<p className="mt-3 text-muted-foreground">
					Some teams build custom OG image generators with headless
					browsers like Puppeteer — but that means managing browser
					instances, handling memory leaks, setting up infrastructure,
					and dealing with rendering edge cases.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					How ScreenshotAPI solves it
				</h2>
				<p className="mt-4 text-muted-foreground">
					ScreenshotAPI captures any URL as a pixel-perfect image at
					exactly 1200×630 pixels — the standard OG image size. One
					API call, one image, zero infrastructure to manage.
				</p>
				<ComparisonTable
					headers={['DIY Puppeteer', 'ScreenshotAPI']}
					rows={[
						{
							feature: 'Infrastructure',
							values: [
								'Manage browser instances',
								'None — managed API'
							]
						},
						{
							feature: 'Time to integrate',
							values: ['Days to weeks', 'Minutes']
						},
						{
							feature: 'Memory management',
							values: ['Manual cleanup needed', 'Handled for you']
						},
						{
							feature: 'Scaling',
							values: [
								'Horizontal scaling required',
								'Built-in auto-scaling'
							]
						},
						{
							feature: 'Cost at 1,000 images/mo',
							values: [
								'$20-50 (server costs)',
								'$15-40 (pay per screenshot)'
							]
						}
					]}
				/>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Implementation: Next.js OG image API route
				</h2>
				<p className="mt-4 text-muted-foreground">
					Create an API route that takes a URL parameter, captures a
					screenshot at OG dimensions, and returns the image with
					caching headers. Social platforms will fetch this URL when
					your page is shared.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="javascript"
						title="app/api/og/route.js"
						code={ogApiRoute}
					/>
				</div>
				<p className="mt-6 text-muted-foreground">
					Then reference this endpoint in your page metadata so social
					platforms pick it up automatically:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="javascript"
						title="app/blog/[slug]/page.js"
						code={metaTagExample}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Python example with file caching
				</h2>
				<p className="mt-4 text-muted-foreground">
					If you&apos;re running a Python backend (Django, Flask,
					FastAPI), here&apos;s how to generate and cache OG images
					locally. In production, swap the file cache for S3 or your
					CDN of choice.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="python"
						title="og_generator.py"
						code={pythonExample}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Caching strategy
				</h2>
				<p className="mt-4 text-muted-foreground">
					OG images don&apos;t need to be generated on every request.
					A smart caching strategy keeps costs low and response times
					fast:
				</p>
				<ul className="mt-4 space-y-2 text-muted-foreground">
					<li className="flex gap-2">
						<span className="font-semibold text-foreground">
							1.
						</span>
						<span>
							<strong>Hash the URL</strong> to create a unique
							cache key. Same URL always produces the same key.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="font-semibold text-foreground">
							2.
						</span>
						<span>
							<strong>Store in CDN or S3</strong> with a 24-hour
							TTL. Most OG images don&apos;t need real-time
							freshness.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="font-semibold text-foreground">
							3.
						</span>
						<span>
							<strong>Invalidate on content change</strong> — when
							a page is updated, purge its cached OG image so the
							next share gets a fresh capture.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="font-semibold text-foreground">
							4.
						</span>
						<span>
							<strong>Set Cache-Control headers</strong> on your
							API route so browsers and CDNs cache the response
							automatically.
						</span>
					</li>
				</ul>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Pricing estimate
				</h2>
				<p className="mt-4 text-muted-foreground">
					OG image generation is one of the most cost-effective uses
					of ScreenshotAPI because each URL only needs to be captured
					once and then cached.
				</p>
				<div className="mt-4 overflow-hidden rounded-xl border border-border">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-border bg-muted/30">
								<th className="px-4 py-3 text-left font-semibold">
									Scenario
								</th>
								<th className="px-4 py-3 text-left font-semibold">
									Screenshots/mo
								</th>
								<th className="px-4 py-3 text-left font-semibold">
									Est. cost
								</th>
							</tr>
						</thead>
						<tbody>
							<tr className="border-b border-border/50">
								<td className="px-4 py-3">Personal blog</td>
								<td className="px-4 py-3 text-muted-foreground">
									50–100
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									$2–4
								</td>
							</tr>
							<tr className="border-b border-border/50">
								<td className="px-4 py-3">Content platform</td>
								<td className="px-4 py-3 text-muted-foreground">
									500–2,000
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									$20–60
								</td>
							</tr>
							<tr>
								<td className="px-4 py-3">Large SaaS / UGC</td>
								<td className="px-4 py-3 text-muted-foreground">
									5,000–10,000
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									$75–150
								</td>
							</tr>
						</tbody>
					</table>
				</div>
				<p className="mt-3 text-sm text-muted-foreground">
					With proper caching, most sites stay in the 500–2,000 range
					since only new or updated pages need fresh captures.
				</p>
			</section>
		</ArticleLayout>
	)
}
