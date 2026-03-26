import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock } from '@/components/seo'

export const metadata: Metadata = {
	title: 'Cloudflare Workers Screenshot API Integration — Workers, KV Caching & R2 Storage',
	description:
		'Capture website screenshots at the edge with Cloudflare Workers. Cache with KV, store in R2, and deploy globally with zero cold starts.'
}

export default function CloudflareWorkersIntegrationPage() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Integrations', href: '/integrations' },
				{ label: 'Cloudflare Workers' }
			]}
			title="Cloudflare Workers Screenshot API Integration"
			description="Deploy screenshot capture at the edge with Cloudflare Workers. Use KV for fast metadata caching, R2 for persistent image storage, and global deployment with zero cold starts."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'TechArticle',
				headline: 'Cloudflare Workers Screenshot API Integration',
				description:
					'How to capture website screenshots with Cloudflare Workers, KV, and R2.',
				dateModified: '2026-03-25',
				publisher: {
					'@type': 'Organization',
					name: 'ScreenshotAPI',
					url: 'https://screenshotapi.to'
				}
			}}
			faq={[
				{
					question: 'What are the CPU time limits for Workers?',
					answer: 'Free plan: 10ms CPU time. Paid plan ($5/mo): 30 seconds CPU time. Screenshot API calls use mostly I/O wait (not CPU), so even free plans work for simple proxying.'
				},
				{
					question: 'Can I store screenshots in R2?',
					answer: 'Yes. R2 is S3-compatible with no egress fees. Store the image bytes in R2 and serve them via a custom domain or Worker for free bandwidth.'
				},
				{
					question: 'How does KV caching work?',
					answer: 'KV is a global key-value store. Write the screenshot URL/metadata to KV with a TTL. Reads are served from the nearest edge location with sub-millisecond latency.'
				},
				{
					question: 'Do Workers have cold starts?',
					answer: "Workers have near-zero cold starts (under 5ms). They run on Cloudflare's V8 isolates, not containers, so there is no startup penalty."
				},
				{
					question: 'Can I use this with a custom domain?',
					answer: 'Yes. Add a custom domain route in your wrangler.toml or Cloudflare dashboard. The Worker will handle requests on your domain.'
				}
			]}
			relatedPages={[
				{
					title: 'Vercel Integration',
					description:
						'Alternative edge deployment with Vercel Edge Functions.',
					href: '/integrations/vercel'
				},
				{
					title: 'AWS Lambda Integration',
					description:
						'Serverless screenshot functions with S3 storage.',
					href: '/integrations/aws-lambda'
				},
				{
					title: 'Express Integration',
					description: 'Self-hosted Node.js screenshot service.',
					href: '/integrations/express'
				}
			]}
		>
			{/* Quick Start */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Quick start
				</h2>
				<p className="mt-3 text-muted-foreground">
					Create a new Workers project with Wrangler, add your API key
					as a secret, and deploy a screenshot proxy in minutes.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="bash"
						title="Terminal"
						code={`npm create cloudflare@latest screenshot-service
cd screenshot-service

# Add API key as a secret
npx wrangler secret put SCREENSHOTAPI_KEY`}
					/>
				</div>
			</section>

			{/* Basic Worker */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Worker script
				</h2>
				<p className="mt-3 text-muted-foreground">
					A Worker that proxies screenshot requests to ScreenshotAPI.
					Runs on every Cloudflare edge location with zero cold
					starts.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="typescript"
						title="src/index.ts"
						code={`interface Env {
	SCREENSHOTAPI_KEY: string
}

const API_BASE = 'https://screenshotapi.to/api/v1/screenshot'

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url)

		if (url.pathname !== '/screenshot') {
			return new Response('Not found', { status: 404 })
		}

		const targetUrl = url.searchParams.get('url')
		if (!targetUrl) {
			return Response.json({ error: 'Missing url parameter' }, { status: 400 })
		}

		const params = new URLSearchParams({
			url: targetUrl,
			width: url.searchParams.get('width') ?? '1440',
			height: url.searchParams.get('height') ?? '900',
			type: url.searchParams.get('type') ?? 'webp',
			quality: '85',
			waitUntil: 'networkidle'
		})

		const response = await fetch(\`\${API_BASE}?\${params}\`, {
			headers: { 'x-api-key': env.SCREENSHOTAPI_KEY }
		})

		if (!response.ok) {
			return Response.json(
				{ error: 'Screenshot capture failed' },
				{ status: response.status }
			)
		}

		return new Response(response.body, {
			headers: {
				'Content-Type': response.headers.get('content-type') ?? 'image/webp',
				'Cache-Control': 'public, max-age=3600, s-maxage=86400'
			}
		})
	}
}`}
					/>
				</div>
			</section>

			{/* KV Caching */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					KV caching
				</h2>
				<p className="mt-3 text-muted-foreground">
					Cache screenshot metadata in Workers KV. Since KV has a 25MB
					value limit and is optimized for reads, store image bytes in
					R2 and use KV for the URL/metadata mapping.
				</p>
				<div className="mt-6 space-y-4">
					<CodeBlock
						language="toml"
						title="wrangler.toml"
						code={`name = "screenshot-service"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "SCREENSHOT_CACHE"
id = "your-kv-namespace-id"

[[r2_buckets]]
binding = "SCREENSHOT_STORAGE"
bucket_name = "screenshots"`}
					/>
					<CodeBlock
						language="typescript"
						title="src/index.ts (with KV + R2)"
						code={`interface Env {
	SCREENSHOTAPI_KEY: string
	SCREENSHOT_CACHE: KVNamespace
	SCREENSHOT_STORAGE: R2Bucket
}

const API_BASE = 'https://screenshotapi.to/api/v1/screenshot'
const CACHE_TTL = 3600

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url)
		if (url.pathname !== '/screenshot') {
			return new Response('Not found', { status: 404 })
		}

		const targetUrl = url.searchParams.get('url')
		if (!targetUrl) {
			return Response.json({ error: 'Missing url' }, { status: 400 })
		}

		const width = url.searchParams.get('width') ?? '1440'
		const height = url.searchParams.get('height') ?? '900'
		const type = url.searchParams.get('type') ?? 'webp'
		const cacheKey = \`\${targetUrl}:\${width}:\${height}:\${type}\`

		// Check KV for cached R2 key
		const cachedR2Key = await env.SCREENSHOT_CACHE.get(cacheKey)
		if (cachedR2Key) {
			const object = await env.SCREENSHOT_STORAGE.get(cachedR2Key)
			if (object) {
				return new Response(object.body, {
					headers: {
						'Content-Type': object.httpMetadata?.contentType ?? 'image/webp',
						'X-Cache': 'HIT',
						'Cache-Control': 'public, max-age=3600'
					}
				})
			}
		}

		// Capture screenshot
		const params = new URLSearchParams({
			url: targetUrl, width, height, type, quality: '85', waitUntil: 'networkidle'
		})

		const response = await fetch(\`\${API_BASE}?\${params}\`, {
			headers: { 'x-api-key': env.SCREENSHOTAPI_KEY }
		})

		if (!response.ok) {
			return Response.json({ error: 'Capture failed' }, { status: 502 })
		}

		const imageBytes = await response.arrayBuffer()
		const contentType = response.headers.get('content-type') ?? 'image/webp'

		// Store in R2
		const r2Key = \`screenshots/\${Date.now()}-\${encodeURIComponent(targetUrl).slice(0, 100)}.\${type}\`
		await env.SCREENSHOT_STORAGE.put(r2Key, imageBytes, {
			httpMetadata: { contentType }
		})

		// Cache the R2 key in KV
		await env.SCREENSHOT_CACHE.put(cacheKey, r2Key, { expirationTtl: CACHE_TTL })

		return new Response(imageBytes, {
			headers: {
				'Content-Type': contentType,
				'X-Cache': 'MISS',
				'Cache-Control': 'public, max-age=3600'
			}
		})
	}
}`}
					/>
				</div>
			</section>

			{/* Deployment */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Deployment
				</h2>
				<p className="mt-3 text-muted-foreground">
					Deploy to Cloudflare&#39;s global network with a single
					command.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="bash"
						title="Terminal"
						code={`# Deploy to production
npx wrangler deploy

# Test locally
npx wrangler dev

# View logs
npx wrangler tail`}
					/>
				</div>
			</section>

			{/* Production Tips */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Production tips
				</h2>
				<ul className="mt-4 space-y-3 text-muted-foreground">
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Use R2 for image storage.
							</strong>{' '}
							R2 has zero egress fees, making it ideal for serving
							screenshots. Store images in R2 and cache the lookup
							key in KV.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Leverage the Cache API.
							</strong>{' '}
							In addition to KV, use the Workers Cache API for the
							hottest screenshots. Cache API entries are stored at
							the edge PoP.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Add rate limiting.
							</strong>{' '}
							Use the Cloudflare Rate Limiting product or
							implement token-bucket rate limiting in the Worker
							using KV counters.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Set up custom domains.
							</strong>{' '}
							Route your Worker to a custom domain (e.g.,{' '}
							<code>screenshots.yourapp.com</code>) for cleaner
							URLs and better branding.
						</span>
					</li>
				</ul>
			</section>
		</ArticleLayout>
	)
}
