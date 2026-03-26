import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock } from '@/components/seo'

export const metadata: Metadata = {
	title: 'How to Build Link Previews with Screenshots',
	description:
		'Generate visual link previews for chat apps and social platforms using ScreenshotAPI. Includes caching strategies and React components.'
}

export default function Page() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Blog', href: '/blog' },
				{ label: 'Build Link Previews' }
			]}
			title="How to Build Link Previews"
			description="Generate thumbnail previews for URLs in chat apps, social platforms, and bookmark tools. Includes caching strategies and a React component."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'Article',
				headline: 'How to Build Link Previews with Screenshots',
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
						'What resolution should link preview thumbnails be?',
					answer: 'For inline previews, 600x400 or 800x450 works well. For card-style previews, 1200x630 (OG image size) is standard. Smaller sizes load faster and use less bandwidth.'
				},
				{
					question:
						'How do I avoid generating previews for every click?',
					answer: 'Generate previews asynchronously when a URL is first submitted, then cache the result. Serve the cached image on subsequent requests. Use a hash of the URL as the cache key.'
				},
				{
					question:
						'Should I generate previews on the client or server?',
					answer: 'Always generate previews server-side to keep your API key secure. The client should request previews from your backend, which in turn calls ScreenshotAPI and caches the result.'
				},
				{
					question: 'How do I handle URLs that fail to screenshot?',
					answer: 'Show a generic placeholder image when the API returns an error. You can also retry after a delay — some sites may temporarily block or rate-limit bots.'
				}
			]}
			relatedPages={[
				{
					title: 'Generate OG Images from URL',
					description: 'Create Open Graph images for social sharing.',
					href: '/blog/how-to-generate-og-images-from-url'
				},
				{
					title: 'Add Website Thumbnails to Your App',
					description: 'Build a thumbnail service with caching.',
					href: '/blog/how-to-add-website-thumbnails-to-your-app'
				},
				{
					title: 'Best URL to Image APIs',
					description: 'Compare URL-to-image API providers.',
					href: '/blog/best-url-to-image-apis'
				}
			]}
		>
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					What are link previews?
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Link previews are visual thumbnails that show users what a
					URL looks like before they click. Slack, Discord, Twitter,
					and iMessage all generate link previews when you paste a
					URL. Building this into your own app — a chat platform,
					bookmarking tool, CMS, or internal wiki — dramatically
					improves user experience by making links visual and
					scannable.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Architecture overview
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					A link preview system has three parts: a backend endpoint
					that accepts a URL, calls ScreenshotAPI, and caches the
					result; a storage layer (CDN, S3, or Redis) for cached
					thumbnails; and a frontend component that displays the
					preview image. Here is the full flow:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="typescript"
						title="api/preview/route.ts"
						code={`import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const cache = new Map<string, { buffer: Buffer; timestamp: number }>()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) {
    return NextResponse.json({ error: 'url required' }, { status: 400 })
  }

  const cacheKey = crypto.createHash('md5').update(url).digest('hex')
  const cached = cache.get(cacheKey)

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return new NextResponse(cached.buffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=86400'
      }
    })
  }

  const params = new URLSearchParams({
    url,
    width: '800',
    height: '450',
    type: 'jpeg',
    quality: '75',
    waitUntil: 'networkidle'
  })

  const response = await fetch(
    \`https://screenshotapi.to/api/v1/screenshot?\${params}\`,
    { headers: { 'x-api-key': process.env.SCREENSHOT_API_KEY! } }
  )

  if (!response.ok) {
    return NextResponse.json({ error: 'Screenshot failed' }, { status: 502 })
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  cache.set(cacheKey, { buffer, timestamp: Date.now() })

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=86400'
    }
  })
}`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					React link preview component
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					A reusable React component that fetches and displays link
					previews:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="tsx"
						title="LinkPreview.tsx"
						code={`'use client'

import { useState } from 'react'

export function LinkPreview({ url }: { url: string }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  const previewUrl = \`/api/preview?url=\${encodeURIComponent(url)}\`

  if (error) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-lg border border-border p-4 hover:bg-muted/50"
      >
        <span className="text-sm text-muted-foreground">{url}</span>
      </a>
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block overflow-hidden rounded-lg border border-border transition-colors hover:border-primary/30"
    >
      <div className="relative aspect-video bg-muted">
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-muted" />
        )}
        <img
          src={previewUrl}
          alt={\`Preview of \${url}\`}
          className={\`h-full w-full object-cover transition-opacity \${loaded ? 'opacity-100' : 'opacity-0'}\`}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      </div>
      <div className="p-3">
        <span className="text-xs text-muted-foreground">{new URL(url).hostname}</span>
      </div>
    </a>
  )
}`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Production caching with Redis
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					For production, replace the in-memory Map with Redis for
					persistent, distributed caching:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="typescript"
						title="Redis-backed cache"
						code={`import { Redis } from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

async function getCachedPreview(url: string): Promise<Buffer | null> {
  const key = \`preview:\${crypto.createHash('md5').update(url).digest('hex')}\`
  const cached = await redis.getBuffer(key)
  return cached
}

async function setCachedPreview(url: string, buffer: Buffer): Promise<void> {
  const key = \`preview:\${crypto.createHash('md5').update(url).digest('hex')}\`
  await redis.set(key, buffer, 'EX', 86400) // 24h TTL
}`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Async preview generation
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					For the best user experience, generate previews
					asynchronously when a URL is submitted. Show a placeholder
					immediately, then swap in the real preview once it is ready.
					This avoids blocking the user while the screenshot is being
					captured.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="typescript"
						title="Background preview generation"
						code={`async function onUrlSubmitted(url: string, recordId: string) {
  // Store the URL immediately
  await db.insert(bookmarks).values({ id: recordId, url })

  // Generate preview in background
  generatePreview(url, recordId).catch(console.error)
}

async function generatePreview(url: string, recordId: string) {
  const params = new URLSearchParams({
    url,
    width: '800',
    height: '450',
    type: 'jpeg',
    quality: '75'
  })

  const response = await fetch(
    \`https://screenshotapi.to/api/v1/screenshot?\${params}\`,
    { headers: { 'x-api-key': process.env.SCREENSHOT_API_KEY! } }
  )

  const buffer = Buffer.from(await response.arrayBuffer())
  await uploadToStorage(\`previews/\${recordId}.jpg\`, buffer)
  await db.update(bookmarks).set({ previewUrl: \`previews/\${recordId}.jpg\` }).where(eq(bookmarks.id, recordId))
}`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Performance tips
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Use JPEG at 75% quality for link previews — they are
					thumbnails, not print materials. Set width to 800 or less,
					since previews are displayed small. Add {`Cache-Control`}{' '}
					headers so browsers and CDNs cache the images. Generate
					previews asynchronously so the user does not wait for the
					screenshot. Consider a CDN like Cloudflare or CloudFront in
					front of your preview endpoint for global edge caching.
				</p>
			</section>
		</ArticleLayout>
	)
}
