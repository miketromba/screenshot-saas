import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock } from '@/components/seo'

export const metadata: Metadata = {
	title: 'Express.js Screenshot API Integration — Routes, Redis Caching & Rate Limiting',
	description:
		'Capture website screenshots in Express.js with route handlers, Redis caching middleware, and rate limiting. Production-ready Node.js code examples.'
}

export default function ExpressIntegrationPage() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Integrations', href: '/integrations' },
				{ label: 'Express' }
			]}
			title="Express.js Screenshot API Integration"
			description="Build a screenshot service with Express.js featuring route handlers, Redis-backed caching middleware, and per-user rate limiting to protect your API credits."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'TechArticle',
				headline: 'Express.js Screenshot API Integration',
				description:
					'How to capture website screenshots in Express.js with Redis caching and rate limiting.',
				dateModified: '2026-03-25',
				publisher: {
					'@type': 'Organization',
					name: 'ScreenshotAPI',
					url: 'https://screenshotapi.to'
				}
			}}
			faq={[
				{
					question: 'Do I need any external packages?',
					answer: 'No. The built-in fetch API (Node.js 18+) is all you need. Add Redis for caching and express-rate-limit for rate limiting in production.'
				},
				{
					question: 'How do I cache screenshots in Express?',
					answer: 'Use Redis to store screenshot buffers with a TTL. Check the cache before calling the API, and write to it after a successful capture. The example below shows a complete caching middleware.'
				},
				{
					question: 'Should I use streaming or buffering?',
					answer: 'For most use cases, buffer the response and send it. Streaming adds complexity and the API response is typically 50–500KB — well within memory limits.'
				},
				{
					question:
						'How do I handle concurrent requests for the same URL?',
					answer: 'Implement request coalescing: when a URL is being captured, queue subsequent requests for the same URL and resolve them all when the first request completes.'
				},
				{
					question:
						'Can I use this as a microservice behind an API gateway?',
					answer: 'Yes. This is a common pattern. Run the Express screenshot service as a standalone microservice and route to it via Nginx, Kong, or AWS API Gateway.'
				}
			]}
			relatedPages={[
				{
					title: 'Next.js Integration',
					description:
						'Server-side screenshots with App Router and ISR caching.',
					href: '/integrations/nextjs'
				},
				{
					title: 'FastAPI Integration',
					description:
						'Async Python screenshot service with Pydantic validation.',
					href: '/integrations/fastapi'
				},
				{
					title: 'Vercel Deployment',
					description:
						'Deploy your Express screenshot service on Vercel.',
					href: '/integrations/vercel'
				}
			]}
		>
			{/* Quick Start */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Quick start
				</h2>
				<p className="mt-3 text-muted-foreground">
					Create a new Express project and add a route that proxies
					screenshot requests. Node.js 18+ includes the{' '}
					<code>fetch</code> API natively.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="bash"
						title="Terminal"
						code={`mkdir screenshot-service && cd screenshot-service
npm init -y
npm install express dotenv`}
					/>
				</div>
			</section>

			{/* Basic Route */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Basic route handler
				</h2>
				<p className="mt-3 text-muted-foreground">
					A minimal Express server with a single screenshot endpoint.
					The API key is loaded from environment variables and never
					exposed to clients.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="javascript"
						title="server.js"
						code={`import express from 'express'
import 'dotenv/config'

const app = express()
const API_BASE = 'https://screenshotapi.to/api/v1/screenshot'

app.get('/screenshot', async (req, res) => {
	const { url, width = '1440', height = '900', type = 'png', fullPage = 'false' } = req.query

	if (!url) {
		return res.status(400).json({ error: 'Missing url parameter' })
	}

	const params = new URLSearchParams({
		url, width, height, type, fullPage
	})

	const response = await fetch(\`\${API_BASE}?\${params}\`, {
		headers: { 'x-api-key': process.env.SCREENSHOTAPI_KEY }
	})

	if (!response.ok) {
		return res.status(response.status).json({ error: 'Screenshot capture failed' })
	}

	const buffer = Buffer.from(await response.arrayBuffer())
	const contentType = response.headers.get('content-type') ?? 'image/png'

	res
		.set('Content-Type', contentType)
		.set('Cache-Control', 'public, max-age=3600')
		.send(buffer)
})

app.listen(3000, () => console.log('Screenshot service running on :3000'))`}
					/>
				</div>
			</section>

			{/* Redis Caching Middleware */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Redis caching middleware
				</h2>
				<p className="mt-3 text-muted-foreground">
					Add a caching layer with Redis to avoid duplicate API calls.
					Cached screenshots are served in under 5ms instead of 2–5
					seconds.
				</p>
				<div className="mt-6 space-y-4">
					<CodeBlock
						language="bash"
						title="Terminal"
						code="npm install ioredis"
					/>
					<CodeBlock
						language="javascript"
						title="middleware/cache.js"
						code={`import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)
const TTL = 3600

export function screenshotCache() {
	return async (req, res, next) => {
		const { url, width = '1440', height = '900', type = 'png' } = req.query
		if (!url) return next()

		const cacheKey = \`screenshot:\${url}:\${width}:\${height}:\${type}\`

		const cached = await redis.getBuffer(cacheKey)
		if (cached) {
			const contentType = type === 'webp' ? 'image/webp'
				: type === 'jpeg' ? 'image/jpeg'
				: 'image/png'
			return res
				.set('Content-Type', contentType)
				.set('X-Cache', 'HIT')
				.set('Cache-Control', 'public, max-age=3600')
				.send(cached)
		}

		res._cacheKey = cacheKey
		const originalSend = res.send.bind(res)
		res.send = (body) => {
			if (res.statusCode === 200 && Buffer.isBuffer(body)) {
				redis.setex(cacheKey, TTL, body)
			}
			return originalSend(body)
		}

		res.set('X-Cache', 'MISS')
		next()
	}
}`}
					/>
					<CodeBlock
						language="javascript"
						title="server.js (with caching)"
						code={`import express from 'express'
import 'dotenv/config'
import { screenshotCache } from './middleware/cache.js'

const app = express()
const API_BASE = 'https://screenshotapi.to/api/v1/screenshot'

app.get('/screenshot', screenshotCache(), async (req, res) => {
	const { url, width = '1440', height = '900', type = 'png', fullPage = 'false' } = req.query

	if (!url) {
		return res.status(400).json({ error: 'Missing url parameter' })
	}

	const params = new URLSearchParams({ url, width, height, type, fullPage })
	const response = await fetch(\`\${API_BASE}?\${params}\`, {
		headers: { 'x-api-key': process.env.SCREENSHOTAPI_KEY }
	})

	if (!response.ok) {
		return res.status(response.status).json({ error: 'Screenshot capture failed' })
	}

	const buffer = Buffer.from(await response.arrayBuffer())
	res
		.set('Content-Type', response.headers.get('content-type') ?? 'image/png')
		.set('Cache-Control', 'public, max-age=3600')
		.send(buffer)
})

app.listen(3000)`}
					/>
				</div>
			</section>

			{/* Rate Limiting */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Rate limiting
				</h2>
				<p className="mt-3 text-muted-foreground">
					Protect your API credits by limiting how many screenshots
					each client can request per time window.
				</p>
				<div className="mt-6 space-y-4">
					<CodeBlock
						language="bash"
						title="Terminal"
						code="npm install express-rate-limit rate-limit-redis"
					/>
					<CodeBlock
						language="javascript"
						title="middleware/rate-limit.js"
						code={`import rateLimit from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

export const screenshotRateLimit = rateLimit({
	windowMs: 60 * 1000,
	max: 10,
	standardHeaders: true,
	legacyHeaders: false,
	message: { error: 'Too many screenshot requests. Try again in a minute.' },
	store: new RedisStore({
		sendCommand: (...args) => redis.call(...args)
	})
})`}
					/>
				</div>
			</section>

			{/* Error Handling */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Error handling
				</h2>
				<p className="mt-3 text-muted-foreground">
					Wrap the screenshot capture in a structured error handler
					that returns consistent error responses and logs failures.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="javascript"
						title="lib/screenshot.js"
						code={`const API_BASE = 'https://screenshotapi.to/api/v1/screenshot'

export async function captureScreenshot({ url, width = 1440, height = 900, type = 'png' }) {
	const params = new URLSearchParams({
		url,
		width: String(width),
		height: String(height),
		type,
		quality: '85',
		waitUntil: 'networkidle'
	})

	const response = await fetch(\`\${API_BASE}?\${params}\`, {
		headers: { 'x-api-key': process.env.SCREENSHOTAPI_KEY },
		signal: AbortSignal.timeout(30_000)
	})

	if (!response.ok) {
		const text = await response.text().catch(() => 'Unknown error')
		throw new ScreenshotError(
			\`Capture failed: HTTP \${response.status}\`,
			response.status,
			text
		)
	}

	return {
		buffer: Buffer.from(await response.arrayBuffer()),
		contentType: response.headers.get('content-type') ?? 'image/png'
	}
}

export class ScreenshotError extends Error {
	constructor(message, status, detail) {
		super(message)
		this.name = 'ScreenshotError'
		this.status = status
		this.detail = detail
	}
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
								Use AbortSignal.timeout().
							</strong>{' '}
							Set a 30-second timeout on fetch to prevent requests
							from hanging indefinitely if the API is slow.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Run behind a reverse proxy.
							</strong>{' '}
							Use Nginx or Caddy in front of Express for TLS,
							compression, and static asset serving.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Add health checks.
							</strong>{' '}
							Expose a <code>/health</code> endpoint that verifies
							Redis connectivity and API key validity for
							monitoring.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Validate URL inputs.
							</strong>{' '}
							Reject private IPs, localhost, and non-HTTP(S)
							schemes to prevent SSRF attacks through the
							screenshot endpoint.
						</span>
					</li>
				</ul>
			</section>
		</ArticleLayout>
	)
}
