import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock, ComparisonTable } from '@/components/seo'

export const metadata: Metadata = {
	title: 'URL Link Preview Thumbnails API — Rich Previews for Any URL',
	description:
		'Generate link preview thumbnails for chat apps, social platforms, and link aggregators. ScreenshotAPI captures URL screenshots for rich, visual link previews.'
}

const jsExample = `const SCREENSHOT_API_KEY = process.env.SCREENSHOT_API_KEY;

async function getLinkPreview(url) {
  const params = new URLSearchParams({
    url,
    width: '1280',
    height: '800',
    type: 'webp',
    quality: '80',
    waitUntil: 'networkIdle'
  });

  const response = await fetch(
    \`https://screenshotapi.to/api/v1/screenshot?\${params}\`,
    { headers: { 'x-api-key': SCREENSHOT_API_KEY } }
  );

  if (!response.ok) throw new Error('Screenshot failed');
  return response.arrayBuffer();
}`

const reactComponent = `import { useState, useEffect } from 'react';

function LinkPreview({ url }) {
  const [thumbnail, setThumbnail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPreview() {
      try {
        const res = await fetch(\`/api/preview?url=\${encodeURIComponent(url)}\`);
        if (res.ok) {
          const blob = await res.blob();
          setThumbnail(URL.createObjectURL(blob));
        }
      } finally {
        setLoading(false);
      }
    }
    fetchPreview();
  }, [url]);

  if (loading) {
    return (
      <div className="animate-pulse rounded-lg bg-gray-200 h-40 w-full" />
    );
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block">
      <div className="overflow-hidden rounded-lg border border-gray-200">
        {thumbnail && (
          <img src={thumbnail} alt={url} className="w-full h-40 object-cover" />
        )}
        <div className="p-3">
          <p className="text-sm font-medium truncate">{url}</p>
        </div>
      </div>
    </a>
  );
}`

const pythonExample = `import requests
import redis
import hashlib
import os

API_KEY = os.environ["SCREENSHOT_API_KEY"]
cache = redis.Redis(host="localhost", port=6379)

def get_link_preview(url: str) -> bytes | None:
    """Get a link preview thumbnail, using Redis cache."""
    cache_key = f"preview:{hashlib.sha256(url.encode()).hexdigest()[:16]}"

    cached = cache.get(cache_key)
    if cached:
        return cached

    response = requests.get(
        "https://screenshotapi.to/api/v1/screenshot",
        params={
            "url": url,
            "width": "1280",
            "height": "800",
            "type": "webp",
            "quality": "80"
        },
        headers={"x-api-key": API_KEY}
    )

    if response.status_code == 200:
        cache.setex(cache_key, 3600 * 24, response.content)  # 24h TTL
        return response.content

    return None`

export default function LinkPreviewsPage() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Use Cases', href: '/use-cases' },
				{ label: 'Link Previews' }
			]}
			title="URL Link Preview Thumbnails"
			description="Generate rich link preview thumbnails for any URL. Build visual link previews for chat apps, social platforms, CMS tools, and link aggregators without managing headless browsers."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'Article',
				headline: 'URL Link Preview Thumbnails with Screenshot API',
				description:
					'Generate rich link preview thumbnails for chat apps and social platforms.',
				dateModified: '2026-03-25',
				publisher: {
					'@type': 'Organization',
					name: 'ScreenshotAPI',
					url: 'https://screenshotapi.to'
				}
			}}
			faq={[
				{
					question: 'What image format is best for link previews?',
					answer: 'WebP offers the best balance of quality and file size for link previews. Use type=webp with quality=80 for thumbnails that load quickly. Fall back to PNG if you need lossless quality or JPEG for maximum compatibility.'
				},
				{
					question:
						'How do I handle URLs that require authentication?',
					answer: "ScreenshotAPI captures what a public visitor would see. For authenticated pages, you'd need to capture a public-facing version of the page. Most link preview use cases involve public URLs, which work out of the box."
				},
				{
					question:
						'How fast are link preview screenshots generated?',
					answer: 'Most screenshots are generated in 2-5 seconds depending on page complexity. For real-time link previews, generate thumbnails asynchronously when a link is first shared and serve cached versions for subsequent requests.'
				},
				{
					question:
						'Can I generate previews for pages with dynamic content?',
					answer: 'Yes. ScreenshotAPI executes JavaScript and waits for the page to fully render. Use the waitUntil=networkIdle parameter to ensure SPAs and dynamically-loaded content are captured correctly.'
				},
				{
					question: 'How should I cache link preview images?',
					answer: 'Use a two-layer cache: store images in Redis or Memcached with a 24-hour TTL for fast access, and persist to S3 or your CDN for long-term storage. Invalidate when the source URL content changes significantly.'
				}
			]}
			relatedPages={[
				{
					title: 'OG Image Generation',
					description:
						'Generate Open Graph images for social sharing.',
					href: '/use-cases/og-image-generation'
				},
				{
					title: 'Directory Thumbnails',
					description:
						'Website thumbnails for directory and listing sites.',
					href: '/use-cases/directory-thumbnails'
				},
				{
					title: 'ScreenshotAPI vs Urlbox',
					description:
						'Compare features and pricing for link preview generation.',
					href: '/compare/screenshotapi-vs-urlbox'
				}
			]}
		>
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Why link previews matter
				</h2>
				<p className="mt-4 text-muted-foreground">
					When users share a link in Slack, Discord, or a chat app,
					they expect to see a visual preview — a thumbnail of the
					destination page. Without previews, links are just plain
					text that users are reluctant to click. Rich link previews
					increase click-through rates by 30-50% compared to bare
					URLs.
				</p>
				<p className="mt-3 text-muted-foreground">
					Building a link preview system from scratch means running
					headless browsers, handling timeouts, managing memory,
					dealing with anti-bot protections, and scaling
					infrastructure. It&apos;s a surprisingly complex problem for
					what seems like a simple feature.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					How ScreenshotAPI powers link previews
				</h2>
				<p className="mt-4 text-muted-foreground">
					Replace your headless browser infrastructure with a single
					API call. ScreenshotAPI handles rendering, waiting for
					dynamic content, and returning a clean screenshot at your
					specified dimensions.
				</p>
				<ComparisonTable
					headers={['Build Your Own', 'ScreenshotAPI']}
					rows={[
						{
							feature: 'Setup time',
							values: ['1-2 weeks', '< 1 hour']
						},
						{
							feature: 'Browser management',
							values: [
								'Puppeteer/Playwright cluster',
								'Not needed'
							]
						},
						{
							feature: 'JavaScript rendering',
							values: [true, true]
						},
						{
							feature: 'SPA support',
							values: ['Manual wait logic', 'Built-in smart wait']
						},
						{
							feature: 'Output formats',
							values: ['PNG only (default)', 'PNG, JPEG, WebP']
						},
						{
							feature: 'Auto-scaling',
							values: [false, true]
						}
					]}
				/>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					JavaScript implementation
				</h2>
				<p className="mt-4 text-muted-foreground">
					Fetch a link preview thumbnail with a single API call. This
					function can be used in any Node.js backend — Express,
					Fastify, Next.js, or serverless functions.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="javascript"
						title="lib/link-preview.js"
						code={jsExample}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					React component for displaying previews
				</h2>
				<p className="mt-4 text-muted-foreground">
					Here&apos;s a React component that fetches and displays a
					link preview thumbnail. It includes a loading skeleton and
					error handling for a polished user experience.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="jsx"
						title="components/LinkPreview.jsx"
						code={reactComponent}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Python with Redis caching
				</h2>
				<p className="mt-4 text-muted-foreground">
					For Python backends, combine ScreenshotAPI with Redis for a
					fast, cache-friendly link preview service. Each URL is
					captured once and served from cache for 24 hours.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="python"
						title="services/link_preview.py"
						code={pythonExample}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Pricing estimate
				</h2>
				<p className="mt-4 text-muted-foreground">
					Link preview costs scale with unique URLs shared. With
					caching, repeated shares of the same URL cost nothing after
					the first capture.
				</p>
				<div className="mt-4 overflow-hidden rounded-xl border border-border">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-border bg-muted/30">
								<th className="px-4 py-3 text-left font-semibold">
									App type
								</th>
								<th className="px-4 py-3 text-left font-semibold">
									Unique URLs/mo
								</th>
								<th className="px-4 py-3 text-left font-semibold">
									Est. cost
								</th>
							</tr>
						</thead>
						<tbody>
							<tr className="border-b border-border/50">
								<td className="px-4 py-3">
									Internal team chat
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									100–500
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									$2–15
								</td>
							</tr>
							<tr className="border-b border-border/50">
								<td className="px-4 py-3">
									Social / community app
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									2,000–10,000
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									$30–150
								</td>
							</tr>
							<tr>
								<td className="px-4 py-3">
									Link aggregator / news
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									10,000–50,000
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									$150–750
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</section>
		</ArticleLayout>
	)
}
