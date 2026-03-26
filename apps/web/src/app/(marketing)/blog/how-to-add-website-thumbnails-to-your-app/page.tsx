import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock } from '@/components/seo'

export const metadata: Metadata = {
	title: 'How to Add Website Thumbnails to Your App',
	description:
		'Build a thumbnail service that generates and caches website previews. Includes React component, caching layer, and API endpoint.'
}

export default function Page() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Blog', href: '/blog' },
				{ label: 'Add Website Thumbnails' }
			]}
			title="How to Add Website Thumbnails to Your App"
			description="Build a thumbnail service with caching that displays website previews in your application. Includes a React component and backend endpoint."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'Article',
				headline: 'How to Add Website Thumbnails to Your App',
				dateModified: '2026-03-25',
				publisher: {
					'@type': 'Organization',
					name: 'ScreenshotAPI',
					url: 'https://screenshotapi.to'
				}
			}}
			faq={[
				{
					question: 'How much does it cost to generate thumbnails?',
					answer: 'ScreenshotAPI charges $0.015-$0.04 per screenshot depending on your plan. With caching, you only generate each thumbnail once, so the cost is proportional to unique URLs, not total views.'
				},
				{
					question: 'How long does it take to generate a thumbnail?',
					answer: 'Typically 2-5 seconds for the first request. Subsequent requests are served from cache instantly. Use async generation so users do not wait for the first capture.'
				},
				{
					question: 'What size should thumbnails be?',
					answer: 'For card-style thumbnails, 600x400 or 800x450 works well. Smaller sizes load faster. Request at a larger size and let your frontend CSS scale it down for retina displays.'
				},
				{
					question: 'How do I handle sites that block screenshots?',
					answer: "Some sites block headless browsers. In these cases, show a generic placeholder with the site favicon and domain name. You can fetch the favicon from Google's favicon API as a fallback."
				}
			]}
			relatedPages={[
				{
					title: 'Build Link Previews',
					description: 'Generate visual URL previews for chat apps.',
					href: '/blog/how-to-build-link-previews'
				},
				{
					title: 'Generate OG Images from URL',
					description: 'Create Open Graph images for social sharing.',
					href: '/blog/how-to-generate-og-images-from-url'
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
					Why add website thumbnails?
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Website thumbnails transform boring URL lists into visual,
					scannable interfaces. Bookmark managers like Raindrop.io,
					link aggregators like Product Hunt, CMS platforms, and
					internal tool dashboards all use thumbnails to help users
					identify links at a glance. Instead of reading URLs, users
					can see what the page looks like — dramatically improving
					the browsing experience.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Backend thumbnail endpoint
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Create an API endpoint that generates thumbnails on demand
					with caching:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="typescript"
						title="app/api/thumbnail/route.ts"
						code={`import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const CACHE = new Map<string, { data: Buffer; ts: number }>()
const TTL = 7 * 24 * 60 * 60 * 1000 // 7 days

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) {
    return NextResponse.json({ error: 'url required' }, { status: 400 })
  }

  const key = crypto.createHash('md5').update(url).digest('hex')
  const cached = CACHE.get(key)
  if (cached && Date.now() - cached.ts < TTL) {
    return new NextResponse(cached.data, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=604800'
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

  try {
    const response = await fetch(
      \`https://screenshotapi.to/api/v1/screenshot?\${params}\`,
      {
        headers: { 'x-api-key': process.env.SCREENSHOT_API_KEY! },
        signal: AbortSignal.timeout(15000)
      }
    )

    if (!response.ok) throw new Error(\`API returned \${response.status}\`)

    const buffer = Buffer.from(await response.arrayBuffer())
    CACHE.set(key, { data: buffer, ts: Date.now() })

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=604800'
      }
    })
  } catch {
    return new NextResponse(null, { status: 502 })
  }
}`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					React thumbnail component
				</h2>
				<div className="mt-6">
					<CodeBlock
						language="tsx"
						title="WebsiteThumbnail.tsx"
						code={`'use client'

import { useState } from 'react'

export function WebsiteThumbnail({
  url,
  alt,
  className
}: {
  url: string
  alt?: string
  className?: string
}) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')

  const thumbnailUrl = \`/api/thumbnail?url=\${encodeURIComponent(url)}\`
  const hostname = new URL(url).hostname

  return (
    <div className={\`relative overflow-hidden rounded-lg bg-muted \${className ?? ''}\`}>
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}

      {status === 'error' ? (
        <div className="flex h-full items-center justify-center gap-2 p-4">
          <img
            src={\`https://www.google.com/s2/favicons?domain=\${hostname}&sz=32\`}
            alt=""
            className="h-6 w-6"
          />
          <span className="text-sm text-muted-foreground">{hostname}</span>
        </div>
      ) : (
        <img
          src={thumbnailUrl}
          alt={alt ?? \`Thumbnail of \${hostname}\`}
          className={\`h-full w-full object-cover transition-opacity duration-300 \${
            status === 'loaded' ? 'opacity-100' : 'opacity-0'
          }\`}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          loading="lazy"
        />
      )}
    </div>
  )
}`}
					/>
				</div>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Usage in your app:
				</p>
				<div className="mt-4">
					<CodeBlock
						language="tsx"
						title="Using the component"
						code={`<div className="grid grid-cols-3 gap-4">
  {bookmarks.map(bookmark => (
    <a key={bookmark.id} href={bookmark.url} className="group cursor-pointer">
      <WebsiteThumbnail
        url={bookmark.url}
        className="aspect-video"
      />
      <p className="mt-2 text-sm font-medium group-hover:text-primary">
        {bookmark.title}
      </p>
    </a>
  ))}
</div>`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Production caching with R2 or S3
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					For production, use object storage instead of in-memory
					caching to survive server restarts and scale horizontally:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="typescript"
						title="S3 caching layer"
						code={`import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'

const s3 = new S3Client({ region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_KEY!
  }
})

async function getThumbnail(url: string): Promise<Buffer> {
  const key = \`thumbnails/\${crypto.createHash('md5').update(url).digest('hex')}.jpg\`

  try {
    const cached = await s3.send(new GetObjectCommand({
      Bucket: 'thumbnails',
      Key: key
    }))
    return Buffer.from(await cached.Body!.transformToByteArray())
  } catch {
    // not cached — generate it
  }

  const params = new URLSearchParams({
    url, width: '800', height: '450', type: 'jpeg', quality: '75'
  })

  const response = await fetch(
    \`https://screenshotapi.to/api/v1/screenshot?\${params}\`,
    { headers: { 'x-api-key': process.env.SCREENSHOT_API_KEY! } }
  )

  const buffer = Buffer.from(await response.arrayBuffer())

  await s3.send(new PutObjectCommand({
    Bucket: 'thumbnails',
    Key: key,
    Body: buffer,
    ContentType: 'image/jpeg',
    CacheControl: 'public, max-age=604800'
  }))

  return buffer
}`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Async generation pattern
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					The best UX generates thumbnails asynchronously. When a user
					adds a URL, immediately show a placeholder. Generate the
					thumbnail in the background and update the UI when it is
					ready. This avoids making users wait 2-5 seconds for each
					thumbnail.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="typescript"
						title="Async pattern"
						code={`// When user saves a bookmark
async function createBookmark(url: string, userId: string) {
  const bookmark = await db.insert(bookmarks).values({
    url,
    userId,
    thumbnailStatus: 'pending'
  }).returning()

  // Fire-and-forget background job
  generateThumbnail(bookmark.id, url).catch(console.error)

  return bookmark
}

async function generateThumbnail(bookmarkId: string, url: string) {
  const buffer = await getThumbnail(url)
  const thumbnailUrl = await uploadToStorage(\`thumbnails/\${bookmarkId}.jpg\`, buffer)

  await db.update(bookmarks)
    .set({ thumbnailUrl, thumbnailStatus: 'ready' })
    .where(eq(bookmarks.id, bookmarkId))
}`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Performance optimization
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Serve thumbnails through a CDN for global edge caching. Use
					{` loading="lazy"`} on thumbnail images so they only load
					when visible. Request JPEG at 75% quality — thumbnails do
					not need pixel-perfect quality. Set long cache headers (7+
					days) since websites do not change their appearance often.
					Consider generating multiple sizes (small for grids, large
					for detail views) to minimize bandwidth.
				</p>
			</section>
		</ArticleLayout>
	)
}
