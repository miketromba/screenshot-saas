import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock, ComparisonTable } from '@/components/seo'

export const metadata: Metadata = {
	title: '5 Best HTML to Image APIs in 2025',
	description:
		'Convert HTML and CSS to PNG, JPEG, or WebP images. Compare ScreenshotAPI, htmlcsstoimage, Hcti, Puppeteer, and Playwright.'
}

export default function Page() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Blog', href: '/blog' },
				{ label: '5 Best HTML to Image APIs' }
			]}
			title="5 Best HTML to Image APIs"
			description="Convert HTML and CSS into PNG, JPEG, or WebP images. Compare managed APIs and self-hosted solutions for server-side image generation."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'Article',
				headline: '5 Best HTML to Image APIs',
				dateModified: '2026-03-25',
				publisher: {
					'@type': 'Organization',
					name: 'ScreenshotAPI',
					url: 'https://screenshotapi.to'
				}
			}}
			faq={[
				{
					question: 'What is an HTML to image API?',
					answer: 'An HTML to image API renders HTML and CSS code as a browser would, then exports the result as an image (PNG, JPEG, or WebP). It uses a real browser engine for accurate rendering of fonts, CSS Grid, Flexbox, and other modern web features.'
				},
				{
					question:
						'Why use an API instead of a client-side library?',
					answer: 'Client-side libraries like html-to-image use SVG foreignObject which has significant limitations: no external fonts, no cross-origin images, inconsistent CSS support. APIs use a real browser for pixel-perfect results.'
				},
				{
					question: 'Can I use Google Fonts in HTML to image APIs?',
					answer: 'Yes. APIs that use real Chromium browsers (ScreenshotAPI, htmlcsstoimage, Puppeteer) fully support Google Fonts and other web fonts. Use waitUntil=networkidle to ensure fonts are loaded.'
				},
				{
					question: 'What is the fastest HTML to image approach?',
					answer: 'Vercel OG (@vercel/og) using Satori is the fastest but only supports a subset of CSS. For full CSS support, ScreenshotAPI and htmlcsstoimage are the fastest managed options.'
				}
			]}
			relatedPages={[
				{
					title: 'Convert HTML to Image (Guide)',
					description: 'Step-by-step guide with code examples.',
					href: '/blog/how-to-convert-html-to-image'
				},
				{
					title: 'Best OG Image Generators',
					description: 'Generate social sharing images.',
					href: '/blog/best-og-image-generators'
				},
				{
					title: 'Best Screenshot APIs',
					description: 'Full comparison of screenshot APIs.',
					href: '/blog/best-screenshot-apis'
				}
			]}
		>
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Quick comparison
				</h2>
				<div className="mt-6">
					<ComparisonTable
						headers={[
							'ScreenshotAPI',
							'htmlcsstoimage',
							'Hcti API',
							'Puppeteer',
							'Playwright'
						]}
						rows={[
							{
								feature: 'Managed service',
								values: [true, true, true, false, false]
							},
							{
								feature: 'Direct HTML input',
								values: [
									'Via hosted URL',
									true,
									true,
									false,
									false
								]
							},
							{
								feature: 'Full CSS support',
								values: [true, true, true, true, true]
							},
							{
								feature: 'Google Fonts',
								values: [true, true, true, true, true]
							},
							{
								feature: 'Output formats',
								values: [
									'PNG/JPEG/WebP',
									'PNG/JPEG/WebP',
									'PNG/JPEG',
									'PNG/JPEG/WebP/PDF',
									'PNG/JPEG/WebP/PDF'
								]
							},
							{
								feature: 'Free tier',
								values: [
									'5 credits',
									'50/month',
									'50/month',
									'Unlimited',
									'Unlimited'
								]
							},
							{
								feature: 'Infrastructure needed',
								values: [false, false, false, true, true]
							}
						]}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					1. ScreenshotAPI — Best for URL-hosted HTML
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					ScreenshotAPI renders any URL — including HTML pages you
					host yourself — as an image. Host your HTML template on a
					route, pass dynamic parameters via query strings, and
					capture it with ScreenshotAPI. This approach gives you full
					HTML/CSS support, including external fonts, images, and
					complex layouts. The advantage over direct HTML input APIs
					is that your templates can use any framework (React, Vue,
					Tailwind) and any build tools.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="bash"
						title="Screenshot a hosted HTML template"
						code={`curl -o card.png \\
  -H "x-api-key: sk_live_your_api_key" \\
  "https://screenshotapi.to/api/v1/screenshot?url=https://yourapp.com/template?title=Hello&width=1200&height=630&type=png"`}
					/>
				</div>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					<strong>Best for:</strong> Teams who want full framework
					support (React, Tailwind, etc.) for their HTML templates.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					2. htmlcsstoimage — Best for direct HTML input
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					htmlcsstoimage accepts raw HTML and CSS in the API request
					body and returns an image. No need to host a template — just
					send your HTML directly. The free tier includes 50 images
					per month. It supports Google Fonts, custom CSS, and
					template variables. The simplest option when you want to
					convert an HTML string to an image without hosting anything.
				</p>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					<strong>Best for:</strong> Simple HTML-to-image conversion
					without hosting a template.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					3. Hcti API — Budget alternative
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Hcti (HTML/CSS to Image) is a simpler, more affordable
					alternative to htmlcsstoimage. It accepts HTML and CSS via
					POST request and returns a hosted image URL. Good for
					low-volume use cases. The API is straightforward but has
					fewer features than the alternatives.
				</p>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					<strong>Best for:</strong> Budget-conscious projects with
					simple HTML-to-image needs.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					4-5. Self-hosted options
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					<strong>Puppeteer:</strong> The Node.js library for
					controlling headless Chrome. Use {`page.setContent(html)`}{' '}
					to load HTML directly, then {`page.screenshot()`} to capture
					it. Full CSS/font support, unlimited usage, but requires
					managing Chrome infrastructure. <strong>Playwright:</strong>{' '}
					Similar to Puppeteer but supports Chrome, Firefox, and
					Safari. Slightly better API ergonomics and cross-browser
					testing. Same infrastructure requirements as Puppeteer.
				</p>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Both are free but require you to run and manage
					Chrome/Chromium instances, handle memory leaks, scale
					horizontally, and deal with Docker image sizes.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Recommendation
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					If your HTML templates use modern frameworks or Tailwind
					CSS, use <strong>ScreenshotAPI</strong> with hosted
					templates. If you want to send raw HTML strings directly,
					use <strong>htmlcsstoimage</strong>. If you need full
					control and have DevOps capacity, self-host with Puppeteer
					or Playwright.
				</p>
			</section>
		</ArticleLayout>
	)
}
