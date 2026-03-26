import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock } from '@/components/seo'

export const metadata: Metadata = {
	title: 'How to Convert HTML to Image (PNG/JPEG)',
	description:
		'Turn HTML and CSS into PNG or JPEG images using ScreenshotAPI. Alternative to html-to-image libraries for server-side rendering.'
}

export default function Page() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Blog', href: '/blog' },
				{ label: 'Convert HTML to Image' }
			]}
			title="How to Convert HTML to Image"
			description="Turn HTML and CSS into PNG, JPEG, or WebP images using ScreenshotAPI. A server-side alternative to html-to-image and dom-to-image libraries."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'Article',
				headline: 'How to Convert HTML to Image',
				dateModified: '2026-03-25',
				publisher: {
					'@type': 'Organization',
					name: 'ScreenshotAPI',
					url: 'https://screenshotapi.to'
				}
			}}
			faq={[
				{
					question: 'Can ScreenshotAPI render raw HTML?',
					answer: 'ScreenshotAPI renders any URL. To render raw HTML, host it temporarily (on your server, a CDN, or a service like CodePen/JSFiddle) and pass that URL to the API. Alternatively, use a data URI for simple HTML.'
				},
				{
					question: 'How is this different from html-to-image?',
					answer: 'html-to-image runs in the browser and converts DOM elements to canvas using SVG foreignObject. It has known issues with external fonts, images, and complex CSS. ScreenshotAPI uses a real browser engine (Chromium) for pixel-perfect rendering.'
				},
				{
					question: 'Can I render HTML with custom fonts and images?',
					answer: 'Yes. Since ScreenshotAPI uses a real Chromium browser, it loads external fonts, images, and all CSS just like a regular browser. Use waitUntil=networkidle to ensure everything is loaded.'
				},
				{
					question: 'What is the maximum HTML size I can render?',
					answer: 'There is no hard limit on HTML size. The URL length limit is 2048 characters, so for complex HTML, host it on a server rather than using data URIs.'
				}
			]}
			relatedPages={[
				{
					title: 'Best HTML to Image APIs',
					description: 'Compare HTML-to-image API providers.',
					href: '/blog/best-html-to-image-apis'
				},
				{
					title: 'Generate OG Images from URL',
					description: 'Create OG images from web pages.',
					href: '/blog/how-to-generate-og-images-from-url'
				},
				{
					title: 'Best OG Image Generators',
					description: 'Tools for generating OG images at scale.',
					href: '/blog/best-og-image-generators'
				}
			]}
		>
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Why convert HTML to images?
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					There are many cases where you need an image from HTML:
					generating social media cards, creating email-friendly
					content (HTML email rendering is inconsistent), building
					certificate or invoice generators, creating shareable images
					from dynamic data, and generating images for print.
					Client-side libraries like html-to-image and dom-to-image
					work but have significant limitations. ScreenshotAPI gives
					you a real browser engine for pixel-perfect results.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Approach 1: Host HTML and screenshot it
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					The most reliable approach is to host your HTML on a URL and
					capture it with ScreenshotAPI. Create a simple API route
					that renders your template:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="typescript"
						title="app/api/template/route.tsx"
						code={`import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const title = request.nextUrl.searchParams.get('title') ?? 'Hello World'
  const subtitle = request.nextUrl.searchParams.get('subtitle') ?? ''

  const html = \`<!DOCTYPE html>
<html>
<head>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@600;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1200px; height: 630px;
      display: flex; align-items: center; justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: 'Inter', sans-serif;
      color: white;
    }
    .card {
      text-align: center; padding: 60px;
    }
    h1 { font-size: 64px; font-weight: 800; line-height: 1.1; }
    p { font-size: 28px; margin-top: 20px; opacity: 0.9; }
  </style>
</head>
<body>
  <div class="card">
    <h1>\${title}</h1>
    \${subtitle ? \`<p>\${subtitle}</p>\` : ''}
  </div>
</body>
</html>\`

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' }
  })
}`}
					/>
				</div>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Then capture it as an image:
				</p>
				<div className="mt-4">
					<CodeBlock
						language="bash"
						title="Screenshot the template"
						code={`curl -o card.png \\
  -H "x-api-key: sk_live_your_api_key" \\
  "https://screenshotapi.to/api/v1/screenshot?url=https://yourapp.com/api/template?title=Hello%20World&width=1200&height=630&type=png"`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Approach 2: Data URIs for simple HTML
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					For simple HTML that fits in a URL, you can use data URIs.
					Note the 2048-character URL limit:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="javascript"
						title="Data URI approach"
						code={`const html = \`
<div style="width:600px;height:400px;display:flex;align-items:center;
  justify-content:center;background:#1a1a2e;color:white;font-family:system-ui;
  font-size:48px;font-weight:bold;">
  Hello World
</div>\`

const dataUri = \`data:text/html;charset=utf-8,\${encodeURIComponent(html)}\`

const params = new URLSearchParams({
  url: dataUri,
  width: '600',
  height: '400',
  type: 'png'
})

const response = await fetch(
  \`https://screenshotapi.to/api/v1/screenshot?\${params}\`,
  { headers: { 'x-api-key': 'sk_live_your_api_key' } }
)`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Dynamic image generation service
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Build a complete image generation service that accepts
					parameters and returns images:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="typescript"
						title="app/api/image/route.ts"
						code={`import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const title = searchParams.get('title') ?? 'Untitled'
  const theme = searchParams.get('theme') ?? 'blue'

  const templateUrl = new URL('/api/template', request.url)
  templateUrl.searchParams.set('title', title)
  templateUrl.searchParams.set('theme', theme)

  const params = new URLSearchParams({
    url: templateUrl.toString(),
    width: '1200',
    height: '630',
    type: 'png',
    waitUntil: 'networkidle'
  })

  const screenshotResponse = await fetch(
    \`https://screenshotapi.to/api/v1/screenshot?\${params}\`,
    { headers: { 'x-api-key': process.env.SCREENSHOT_API_KEY! } }
  )

  if (!screenshotResponse.ok) {
    return NextResponse.json({ error: 'Generation failed' }, { status: 502 })
  }

  const buffer = await screenshotResponse.arrayBuffer()

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=604800, immutable'
    }
  })
}`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Client-side libraries vs API
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Client-side libraries like html-to-image and dom-to-image
					use SVG foreignObject to convert DOM elements to canvas.
					They are limited by browser security policies, do not
					support all CSS (especially external fonts, cross-origin
					images, and complex layouts), and produce inconsistent
					results across browsers. ScreenshotAPI uses a real Chromium
					browser, so the rendering matches exactly what users see —
					including fonts, animations, and complex CSS layouts.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Tips for best results
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Use Google Fonts with {`display=swap`} and add
					{` waitUntil=networkidle`} to ensure fonts are loaded. Set
					explicit width and height on your HTML body to match the
					viewport dimensions. Use {`type=png`} for text-heavy content
					and {`type=jpeg`} for photo-heavy content. For consistent
					rendering, inline critical CSS rather than relying on
					external stylesheets.
				</p>
			</section>
		</ArticleLayout>
	)
}
