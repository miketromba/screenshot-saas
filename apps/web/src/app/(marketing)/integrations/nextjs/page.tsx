import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock } from '@/components/seo'

export const metadata: Metadata = {
	title: 'Next.js Screenshot API Integration — Server Components, API Routes & OG Images',
	description:
		'Capture website screenshots in Next.js with App Router API routes, Server Components, ISR caching, and dynamic OG image generation. Production-ready code examples.'
}

export default function NextjsIntegrationPage() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Integrations', href: '/integrations' },
				{ label: 'Next.js' }
			]}
			title="Next.js Screenshot API Integration"
			description="Capture website screenshots in your Next.js application using App Router API routes, Server Components, ISR for cached screenshots, and dynamic OG image generation."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'TechArticle',
				headline: 'Next.js Screenshot API Integration',
				description:
					'How to integrate ScreenshotAPI with Next.js App Router for server-side screenshot capture.',
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
						'Can I call ScreenshotAPI from a Server Component?',
					answer: 'Yes. Server Components run on the server, so you can call the API directly using fetch with your secret API key. The key never reaches the client browser.'
				},
				{
					question: 'How do I cache screenshots in Next.js?',
					answer: 'Use ISR (Incremental Static Regeneration) with the revalidate option on your fetch call or route segment config. This caches the screenshot at the CDN edge and refreshes it at the interval you specify.'
				},
				{
					question:
						'Is ScreenshotAPI compatible with Next.js Edge Runtime?',
					answer: 'Yes. The API is a standard HTTP endpoint, so it works from both the Node.js and Edge runtimes. Use the standard fetch API in either environment.'
				},
				{
					question: 'How do I generate OG images with ScreenshotAPI?',
					answer: "Create an API route that calls ScreenshotAPI and returns the image buffer with the correct Content-Type header. Then reference this route in your metadata's openGraph.images array."
				},
				{
					question: 'What happens if the API is slow or times out?',
					answer: 'Wrap your fetch call in a try/catch and return a fallback image or error response. In production, combine this with ISR caching so most requests serve from cache and never hit the API.'
				}
			]}
			relatedPages={[
				{
					title: 'React Integration',
					description:
						'Client-side screenshot capture with custom hooks and React Query.',
					href: '/integrations/react'
				},
				{
					title: 'Vercel Deployment',
					description:
						'Deploy screenshot functions on Vercel with Edge Functions and KV caching.',
					href: '/integrations/vercel'
				},
				{
					title: 'Express Integration',
					description:
						'Build a Node.js screenshot service with Express and Redis caching.',
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
					The fastest way to capture screenshots in Next.js is with an
					API route handler. No extra dependencies needed — just the
					built-in <code>fetch</code> API and your API key.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="bash"
						title="Environment variable"
						code={`# .env.local
SCREENSHOTAPI_KEY=sk_live_xxxxx`}
					/>
				</div>
			</section>

			{/* API Route Handler */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					API route handler
				</h2>
				<p className="mt-3 text-muted-foreground">
					Create an App Router route handler that proxies screenshot
					requests. This keeps your API key on the server and lets you
					add your own auth, rate limiting, and caching logic.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="typescript"
						title="app/api/screenshot/route.ts"
						code={`import { NextRequest, NextResponse } from 'next/server'

const API_BASE = 'https://screenshotapi.to/api/v1/screenshot'

export async function GET(request: NextRequest) {
	const { searchParams } = request.nextUrl
	const url = searchParams.get('url')

	if (!url) {
		return NextResponse.json(
			{ error: 'Missing url parameter' },
			{ status: 400 }
		)
	}

	const params = new URLSearchParams({
		url,
		width: searchParams.get('width') ?? '1440',
		height: searchParams.get('height') ?? '900',
		type: searchParams.get('type') ?? 'png',
		fullPage: searchParams.get('fullPage') ?? 'false'
	})

	const response = await fetch(\`\${API_BASE}?\${params}\`, {
		headers: { 'x-api-key': process.env.SCREENSHOTAPI_KEY! },
		next: { revalidate: 3600 }
	})

	if (!response.ok) {
		return NextResponse.json(
			{ error: 'Screenshot capture failed' },
			{ status: response.status }
		)
	}

	const imageBuffer = await response.arrayBuffer()
	const contentType = response.headers.get('content-type') ?? 'image/png'

	return new NextResponse(imageBuffer, {
		headers: {
			'Content-Type': contentType,
			'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
		}
	})
}`}
					/>
				</div>
			</section>

			{/* Server Component Usage */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Server Component usage
				</h2>
				<p className="mt-3 text-muted-foreground">
					Call the API directly from a Server Component. The API key
					stays on the server and the screenshot URL is resolved at
					render time.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="typescript"
						title="app/screenshots/[url]/page.tsx"
						code={`const API_BASE = 'https://screenshotapi.to/api/v1/screenshot'

async function getScreenshot(url: string) {
	const params = new URLSearchParams({
		url,
		width: '1440',
		height: '900',
		type: 'webp',
		quality: '80'
	})

	const response = await fetch(\`\${API_BASE}?\${params}\`, {
		headers: { 'x-api-key': process.env.SCREENSHOTAPI_KEY! },
		next: { revalidate: 86400 }
	})

	if (!response.ok) return null
	const buffer = await response.arrayBuffer()
	return \`data:image/webp;base64,\${Buffer.from(buffer).toString('base64')}\`
}

export default async function ScreenshotPage({
	params
}: {
	params: Promise<{ url: string }>
}) {
	const { url } = await params
	const decoded = decodeURIComponent(url)
	const screenshot = await getScreenshot(decoded)

	if (!screenshot) {
		return <p>Failed to capture screenshot for {decoded}</p>
	}

	return (
		<div>
			<h1>Screenshot of {decoded}</h1>
			<img
				src={screenshot}
				alt={\`Screenshot of \${decoded}\`}
				className="rounded-lg border shadow-sm"
			/>
		</div>
	)
}`}
					/>
				</div>
			</section>

			{/* OG Image Generation */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					OG image generation
				</h2>
				<p className="mt-3 text-muted-foreground">
					Generate dynamic Open Graph images by serving screenshots
					from a dedicated route. Reference the route in your page
					metadata so social platforms fetch the live screenshot.
				</p>
				<div className="mt-6 space-y-4">
					<CodeBlock
						language="typescript"
						title="app/api/og/route.ts"
						code={`import { NextRequest, NextResponse } from 'next/server'

const API_BASE = 'https://screenshotapi.to/api/v1/screenshot'

export async function GET(request: NextRequest) {
	const url = request.nextUrl.searchParams.get('url')
	if (!url) {
		return NextResponse.json({ error: 'Missing url' }, { status: 400 })
	}

	const params = new URLSearchParams({
		url,
		width: '1200',
		height: '630',
		type: 'png'
	})

	const response = await fetch(\`\${API_BASE}?\${params}\`, {
		headers: { 'x-api-key': process.env.SCREENSHOTAPI_KEY! },
		next: { revalidate: 86400 }
	})

	if (!response.ok) {
		return new NextResponse(null, { status: 502 })
	}

	return new NextResponse(await response.arrayBuffer(), {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800'
		}
	})
}`}
					/>
					<CodeBlock
						language="typescript"
						title="app/sites/[domain]/page.tsx (metadata)"
						code={`import type { Metadata } from 'next'

export async function generateMetadata({
	params
}: {
	params: Promise<{ domain: string }>
}): Promise<Metadata> {
	const { domain } = await params

	return {
		title: \`Screenshot of \${domain}\`,
		openGraph: {
			images: [
				{
					url: \`/api/og?url=https://\${domain}\`,
					width: 1200,
					height: 630
				}
			]
		}
	}
}`}
					/>
				</div>
			</section>

			{/* ISR Caching */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					ISR caching pattern
				</h2>
				<p className="mt-3 text-muted-foreground">
					Combine Incremental Static Regeneration with ScreenshotAPI
					to serve screenshots from the CDN edge. The first request
					captures a live screenshot; subsequent requests serve from
					cache until the revalidation period expires.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="typescript"
						title="app/preview/[url]/page.tsx"
						code={`export const revalidate = 3600 // revalidate every hour

const API_BASE = 'https://screenshotapi.to/api/v1/screenshot'

async function captureScreenshot(url: string): Promise<string | null> {
	try {
		const params = new URLSearchParams({
			url,
			width: '1440',
			height: '900',
			type: 'webp',
			quality: '85',
			waitUntil: 'networkidle'
		})

		const res = await fetch(\`\${API_BASE}?\${params}\`, {
			headers: { 'x-api-key': process.env.SCREENSHOTAPI_KEY! }
		})

		if (!res.ok) return null
		const buffer = await res.arrayBuffer()
		return \`data:image/webp;base64,\${Buffer.from(buffer).toString('base64')}\`
	} catch {
		return null
	}
}

export async function generateStaticParams() {
	const popularSites = [
		'https://github.com',
		'https://vercel.com',
		'https://nextjs.org'
	]
	return popularSites.map((url) => ({
		url: encodeURIComponent(url)
	}))
}

export default async function PreviewPage({
	params
}: {
	params: Promise<{ url: string }>
}) {
	const { url } = await params
	const decoded = decodeURIComponent(url)
	const screenshot = await captureScreenshot(decoded)

	return (
		<main className="mx-auto max-w-4xl p-8">
			<h1 className="text-2xl font-bold">{decoded}</h1>
			{screenshot ? (
				<img
					src={screenshot}
					alt={\`Preview of \${decoded}\`}
					className="mt-4 w-full rounded-lg border"
				/>
			) : (
				<p className="mt-4 text-red-500">
					Unable to capture screenshot. Try again later.
				</p>
			)}
		</main>
	)
}`}
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
								Always set revalidate.
							</strong>{' '}
							Without ISR, every page visit triggers an API call.
							Set <code>revalidate: 3600</code> for hourly
							refreshes or <code>86400</code> for daily.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Use WebP in production.
							</strong>{' '}
							WebP files are 25–35% smaller than PNG with similar
							quality. Set <code>type=webp&quality=85</code> for
							the best balance.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Proxy through an API route.
							</strong>{' '}
							Never expose your API key to the client. Use a
							server-side route handler as a proxy with your own
							authentication.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Use waitUntil for SPAs.
							</strong>{' '}
							If the target site is a single-page app, set{' '}
							<code>waitUntil=networkidle</code> to wait for all
							network requests to finish before capturing.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Handle errors gracefully.
							</strong>{' '}
							Always wrap API calls in try/catch and return
							meaningful fallback UI instead of throwing.
						</span>
					</li>
				</ul>
			</section>
		</ArticleLayout>
	)
}
