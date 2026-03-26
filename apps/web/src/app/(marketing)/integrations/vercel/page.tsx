import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock } from '@/components/seo'

export const metadata: Metadata = {
	title: 'Vercel Screenshot API Integration — Edge Functions, Serverless & KV Caching',
	description:
		'Deploy screenshot capture on Vercel with Edge Functions, serverless functions, Vercel KV caching, and environment variable management. Production deployment guide.'
}

export default function VercelIntegrationPage() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Integrations', href: '/integrations' },
				{ label: 'Vercel' }
			]}
			title="Vercel Screenshot API Deployment"
			description="Deploy screenshot capture functions on Vercel using Edge Functions for global low latency, serverless functions for heavier processing, and Vercel KV for persistent caching."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'TechArticle',
				headline: 'Vercel Screenshot API Deployment',
				description:
					'How to deploy screenshot capture functions on Vercel with Edge Functions and KV caching.',
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
						'Should I use Edge Functions or Serverless Functions?',
					answer: 'Use Edge Functions for lightweight proxying with low latency. Use Serverless Functions if you need to process the image (resize, watermark) or store it in a database.'
				},
				{
					question: 'How do I set environment variables on Vercel?',
					answer: 'Go to Project Settings > Environment Variables. Add SCREENSHOTAPI_KEY with your API key. Select which environments (Production, Preview, Development) should have access.'
				},
				{
					question: 'Can I cache screenshots with Vercel KV?',
					answer: 'Yes. Vercel KV (powered by Upstash Redis) is perfect for caching screenshot bytes. Store with a TTL and check KV before calling the API.'
				},
				{
					question: 'What are the function timeout limits on Vercel?',
					answer: 'Edge Functions have a 25-second timeout. Serverless Functions on Hobby plans have 10 seconds, Pro plans have 60 seconds. Screenshot capture typically completes in 2–5 seconds.'
				},
				{
					question: 'How do I handle function cold starts?',
					answer: 'Edge Functions have near-zero cold starts. For Serverless Functions, Vercel keeps them warm for a few minutes after invocation. Use Edge Functions for screenshot routes to avoid cold start delays.'
				}
			]}
			relatedPages={[
				{
					title: 'Next.js Integration',
					description:
						'App Router API routes and Server Components for screenshots.',
					href: '/integrations/nextjs'
				},
				{
					title: 'Cloudflare Workers Integration',
					description:
						'Alternative edge deployment with KV and R2 storage.',
					href: '/integrations/cloudflare-workers'
				},
				{
					title: 'AWS Lambda Integration',
					description:
						'Serverless screenshot functions with S3 storage.',
					href: '/integrations/aws-lambda'
				}
			]}
		>
			{/* Quick Start */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Quick start
				</h2>
				<p className="mt-3 text-muted-foreground">
					Add your API key as a Vercel environment variable and deploy
					a screenshot function. Works with any framework — Next.js,
					Nuxt, SvelteKit, or plain functions.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="bash"
						title="Terminal"
						code={`# Set environment variable via Vercel CLI
vercel env add SCREENSHOTAPI_KEY`}
					/>
				</div>
			</section>

			{/* Edge Function */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Edge Function
				</h2>
				<p className="mt-3 text-muted-foreground">
					An Edge Function that runs in every Vercel region globally.
					Requests are handled by the nearest edge location for
					minimal latency.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="typescript"
						title="app/api/screenshot/route.ts"
						code={`export const runtime = 'edge'

const API_BASE = 'https://screenshotapi.to/api/v1/screenshot'

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url)
	const url = searchParams.get('url')

	if (!url) {
		return Response.json({ error: 'Missing url parameter' }, { status: 400 })
	}

	const params = new URLSearchParams({
		url,
		width: searchParams.get('width') ?? '1440',
		height: searchParams.get('height') ?? '900',
		type: searchParams.get('type') ?? 'webp',
		quality: '85',
		waitUntil: 'networkidle'
	})

	const response = await fetch(\`\${API_BASE}?\${params}\`, {
		headers: { 'x-api-key': process.env.SCREENSHOTAPI_KEY! }
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
			'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
		}
	})
}`}
					/>
				</div>
			</section>

			{/* Serverless Function */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Serverless function
				</h2>
				<p className="mt-3 text-muted-foreground">
					A Node.js serverless function for heavier processing like
					image resizing, watermarking, or storing screenshots in a
					database.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="typescript"
						title="app/api/screenshot/capture/route.ts"
						code={`import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 30

const API_BASE = 'https://screenshotapi.to/api/v1/screenshot'

export async function POST(request: NextRequest) {
	const body = await request.json()
	const { url, width = 1440, height = 900, type = 'webp' } = body

	if (!url) {
		return NextResponse.json({ error: 'Missing url' }, { status: 400 })
	}

	const params = new URLSearchParams({
		url,
		width: String(width),
		height: String(height),
		type,
		quality: '85',
		fullPage: String(body.fullPage ?? false),
		waitUntil: 'networkidle'
	})

	const response = await fetch(\`\${API_BASE}?\${params}\`, {
		headers: { 'x-api-key': process.env.SCREENSHOTAPI_KEY! }
	})

	if (!response.ok) {
		return NextResponse.json(
			{ error: 'Screenshot capture failed' },
			{ status: response.status }
		)
	}

	const buffer = await response.arrayBuffer()
	const base64 = Buffer.from(buffer).toString('base64')
	const contentType = response.headers.get('content-type') ?? 'image/webp'

	return NextResponse.json({
		image: \`data:\${contentType};base64,\${base64}\`,
		size: buffer.byteLength,
		type: contentType
	})
}`}
					/>
				</div>
			</section>

			{/* Vercel KV Caching */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Vercel KV caching
				</h2>
				<p className="mt-3 text-muted-foreground">
					Use Vercel KV (powered by Upstash Redis) to cache screenshot
					metadata and avoid repeated API calls for the same URL.
				</p>
				<div className="mt-6 space-y-4">
					<CodeBlock
						language="bash"
						title="Terminal"
						code={`# Install Vercel KV
npm install @vercel/kv`}
					/>
					<CodeBlock
						language="typescript"
						title="app/api/screenshot/cached/route.ts"
						code={`export const runtime = 'edge'

import { kv } from '@vercel/kv'

const API_BASE = 'https://screenshotapi.to/api/v1/screenshot'
const CACHE_TTL = 3600

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url)
	const url = searchParams.get('url')
	if (!url) {
		return Response.json({ error: 'Missing url' }, { status: 400 })
	}

	const width = searchParams.get('width') ?? '1440'
	const height = searchParams.get('height') ?? '900'
	const type = searchParams.get('type') ?? 'webp'

	const cacheKey = \`screenshot:\${url}:\${width}:\${height}:\${type}\`

	const cached = await kv.get<string>(cacheKey)
	if (cached) {
		const contentType = type === 'webp' ? 'image/webp'
			: type === 'jpeg' ? 'image/jpeg'
			: 'image/png'

		const binary = Uint8Array.from(atob(cached), (c) => c.charCodeAt(0))
		return new Response(binary, {
			headers: {
				'Content-Type': contentType,
				'X-Cache': 'HIT',
				'Cache-Control': 'public, s-maxage=3600'
			}
		})
	}

	const params = new URLSearchParams({
		url, width, height, type, quality: '85'
	})

	const response = await fetch(\`\${API_BASE}?\${params}\`, {
		headers: { 'x-api-key': process.env.SCREENSHOTAPI_KEY! }
	})

	if (!response.ok) {
		return Response.json({ error: 'Capture failed' }, { status: 502 })
	}

	const buffer = await response.arrayBuffer()
	const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)))

	await kv.set(cacheKey, base64, { ex: CACHE_TTL })

	return new Response(buffer, {
		headers: {
			'Content-Type': response.headers.get('content-type') ?? 'image/webp',
			'X-Cache': 'MISS',
			'Cache-Control': 'public, s-maxage=3600'
		}
	})
}`}
					/>
				</div>
			</section>

			{/* Environment Variables */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Environment variables setup
				</h2>
				<p className="mt-3 text-muted-foreground">
					Configure environment variables for each deployment
					environment through the Vercel dashboard or CLI.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="bash"
						title="Terminal"
						code={`# Add API key for all environments
vercel env add SCREENSHOTAPI_KEY

# Or set per-environment
vercel env add SCREENSHOTAPI_KEY production
vercel env add SCREENSHOTAPI_KEY preview
vercel env add SCREENSHOTAPI_KEY development

# Pull env vars to local .env.local
vercel env pull .env.local`}
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
								Use Cache-Control headers.
							</strong>{' '}
							Set <code>s-maxage</code> to leverage Vercel&#39;s
							CDN edge cache. This means repeated requests for the
							same URL hit the CDN, not your function.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Prefer Edge Functions.
							</strong>{' '}
							For simple proxy operations, Edge Functions have
							near-zero cold starts and run in every region.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Set maxDuration.
							</strong>{' '}
							For serverless functions, set{' '}
							<code>maxDuration = 30</code> to allow enough time
							for screenshot capture without hitting default
							limits.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Monitor with Vercel Analytics.
							</strong>{' '}
							Enable function monitoring to track invocation
							counts, durations, and errors. Set up alerts for
							high error rates.
						</span>
					</li>
				</ul>
			</section>
		</ArticleLayout>
	)
}
