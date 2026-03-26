import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock } from '@/components/seo'

export const metadata: Metadata = {
	title: 'How to Generate OG Images from Any URL (2025)',
	description:
		'Generate Open Graph images from URLs using ScreenshotAPI. Improve social sharing with automatic og:image generation for any webpage.'
}

export default function Page() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Blog', href: '/blog' },
				{ label: 'Generate OG Images from URL' }
			]}
			title="How to Generate OG Images from Any URL"
			description="Use ScreenshotAPI to automatically generate Open Graph images for social sharing. Turn any URL into a rich preview image for Twitter, Facebook, LinkedIn, and Slack."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'Article',
				headline: 'How to Generate OG Images from Any URL',
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
					answer: 'The recommended size is 1200x630 pixels. This works well across Facebook, Twitter, LinkedIn, and Slack. Use width=1200&height=630 in your ScreenshotAPI request.'
				},
				{
					question: 'Can I use screenshots as OG images?',
					answer: 'Yes. A screenshot of a webpage makes an excellent OG image — it gives users a visual preview of what they will see when they click the link. This is especially useful for user-generated content or URLs you do not control.'
				},
				{
					question:
						'How do I serve OG images dynamically in Next.js?',
					answer: 'Create an API route that fetches the screenshot from ScreenshotAPI and returns it as an image response. Set the og:image meta tag to point to your API route with the target URL as a parameter.'
				},
				{
					question: 'Should I cache OG images?',
					answer: 'Yes. Social platforms cache OG images aggressively, so generating them once and caching in a CDN or object storage (S3, R2) is the best approach. Regenerate on a schedule if the source page changes frequently.'
				},
				{
					question: 'What format is best for OG images?',
					answer: 'JPEG at 80% quality offers the best balance of file size and visual quality for OG images. PNG is better when you need crisp text or transparency, but files are larger.'
				}
			]}
			relatedPages={[
				{
					title: 'Best OG Image Generators',
					description: 'Compare the top OG image generation tools.',
					href: '/blog/best-og-image-generators'
				},
				{
					title: 'Build Link Previews',
					description:
						'Generate thumbnail previews for URLs in your app.',
					href: '/blog/how-to-build-link-previews'
				},
				{
					title: 'Add Website Thumbnails to Your App',
					description: 'Build a thumbnail service with caching.',
					href: '/blog/how-to-add-website-thumbnails-to-your-app'
				}
			]}
		>
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Why OG images matter
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Open Graph images are the preview images shown when you
					share a URL on social media, chat apps, or messaging
					platforms. Posts with rich preview images get significantly
					more engagement — up to 2x more clicks on Twitter and 3x
					more shares on Facebook. If your page does not have an
					og:image tag, platforms show a generic placeholder or
					nothing at all.
				</p>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					For apps that allow users to share links — bookmarking
					tools, CMS platforms, social networks, chat applications —
					you need a way to generate OG images for arbitrary URLs.
					ScreenshotAPI makes this trivial: capture a screenshot at
					1200x630, and you have a ready-to-use OG image.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Basic OG image generation
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Capture a screenshot at the standard OG image dimensions:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="bash"
						title="Generate OG image with cURL"
						code={`curl -o og-image.jpg \\
  -H "x-api-key: sk_live_your_api_key" \\
  "https://screenshotapi.to/api/v1/screenshot?url=https://example.com&width=1200&height=630&type=jpeg&quality=80"`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Next.js OG image route
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Create an API route in Next.js that generates OG images on
					demand and caches them:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="typescript"
						title="app/api/og/route.ts"
						code={`import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) {
    return NextResponse.json({ error: 'url parameter required' }, { status: 400 })
  }

  const params = new URLSearchParams({
    url,
    width: '1200',
    height: '630',
    type: 'jpeg',
    quality: '80',
    waitUntil: 'networkidle'
  })

  const response = await fetch(
    \`https://screenshotapi.to/api/v1/screenshot?\${params}\`,
    { headers: { 'x-api-key': process.env.SCREENSHOT_API_KEY! } }
  )

  if (!response.ok) {
    return NextResponse.json({ error: 'Screenshot failed' }, { status: 502 })
  }

  const imageBuffer = await response.arrayBuffer()

  return new NextResponse(imageBuffer, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800'
    }
  })
}`}
					/>
				</div>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Then reference it in your page&apos;s metadata:
				</p>
				<div className="mt-4">
					<CodeBlock
						language="typescript"
						title="Using the OG image route"
						code={`export const metadata = {
  openGraph: {
    images: [
      {
        url: '/api/og?url=https://example.com',
        width: 1200,
        height: 630,
        alt: 'Screenshot of example.com'
      }
    ]
  }
}`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Caching OG images with S3
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					For production, cache generated OG images in object storage
					to avoid repeated API calls:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="typescript"
						title="OG image with S3 caching"
						code={`import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3'
import crypto from 'crypto'

const s3 = new S3Client({ region: 'us-east-1' })
const BUCKET = 'og-images'

async function getOrCreateOgImage(url: string): Promise<string> {
  const hash = crypto.createHash('sha256').update(url).digest('hex')
  const key = \`og/\${hash}.jpg\`
  const publicUrl = \`https://\${BUCKET}.s3.amazonaws.com/\${key}\`

  try {
    await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }))
    return publicUrl // already cached
  } catch {
    // not cached, generate it
  }

  const params = new URLSearchParams({
    url,
    width: '1200',
    height: '630',
    type: 'jpeg',
    quality: '80'
  })

  const response = await fetch(
    \`https://screenshotapi.to/api/v1/screenshot?\${params}\`,
    { headers: { 'x-api-key': process.env.SCREENSHOT_API_KEY! } }
  )

  const buffer = Buffer.from(await response.arrayBuffer())

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: 'image/jpeg',
    CacheControl: 'public, max-age=604800'
  }))

  return publicUrl
}`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Tips for better OG images
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Use {`waitUntil=networkidle`} to ensure the page is fully
					rendered before capturing. Add a {`delay=1000`} for pages
					with animations. Use {`colorScheme=light`} for consistent
					branding since most social platforms display previews on
					light backgrounds. Consider using
					{` type=jpeg&quality=80`} to keep file sizes under 300KB —
					social platforms have size limits and smaller images load
					faster in feeds.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					When to use this vs Vercel OG
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Vercel OG (using @vercel/og) generates OG images from JSX
					templates. It is great when you design your own OG image
					layout. ScreenshotAPI is better when you need to capture an
					existing page as the OG image — for user-submitted URLs,
					external pages, or when you want the preview to match the
					actual page content exactly.
				</p>
			</section>
		</ArticleLayout>
	)
}
