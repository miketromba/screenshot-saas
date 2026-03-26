import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock } from '@/components/seo'

export const metadata: Metadata = {
	title: 'How to Take Screenshots with cURL (2025)',
	description:
		'Capture website screenshots from the terminal with cURL one-liners. Test parameters, script batch captures, and integrate with shell pipelines.'
}

export default function Page() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Blog', href: '/blog' },
				{ label: 'Take Screenshots with cURL' }
			]}
			title="How to Take Screenshots with cURL"
			description="Capture website screenshots directly from your terminal using cURL. Perfect for testing, scripting, and quick one-off captures."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'Article',
				headline: 'How to Take Screenshots with cURL',
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
						'Can I take a website screenshot from the command line?',
					answer: 'Yes. With ScreenshotAPI and cURL, a single command captures any website as an image. Just pass the URL and your API key, and pipe the output to a file.'
				},
				{
					question: 'Do I need to install anything besides cURL?',
					answer: 'No. cURL is pre-installed on macOS, Linux, and modern Windows. You do not need any browser, Node.js, or additional tools.'
				},
				{
					question: 'Can I use wget instead of cURL?',
					answer: 'Yes. Use: wget --header="x-api-key: sk_live_xxx" -O screenshot.png "https://screenshotapi.to/api/v1/screenshot?url=https://example.com&type=png"'
				},
				{
					question: 'How do I capture screenshots of multiple URLs?',
					answer: 'Use a simple bash loop: for url in url1 url2 url3; do curl ... -o "$url.png"; done. Or use xargs for parallel execution.'
				},
				{
					question: 'What is the maximum URL length supported?',
					answer: 'ScreenshotAPI supports URLs up to 2048 characters. For longer URLs, consider using URL shorteners or POST-based alternatives.'
				}
			]}
			relatedPages={[
				{
					title: 'Take Screenshots with Python',
					description:
						'Use Python for more complex screenshot workflows.',
					href: '/blog/how-to-take-screenshots-with-python'
				},
				{
					title: 'Automate Website Screenshots',
					description:
						'Set up automated screenshot capture with cron jobs.',
					href: '/blog/how-to-automate-website-screenshots'
				},
				{
					title: 'Best Free Screenshot APIs',
					description:
						'Free-tier screenshot APIs for testing and prototyping.',
					href: '/blog/best-free-screenshot-apis'
				}
			]}
		>
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Why use cURL for screenshots?
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					cURL is the universal HTTP client. It is pre-installed on
					virtually every Unix system, available on Windows, and is
					the fastest way to test an API. For screenshots, it means
					you can capture any website in a single command — no code to
					write, no dependencies to install, no project to set up. It
					is perfect for testing parameters, scripting batch captures,
					and integrating into shell pipelines.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Basic screenshot capture
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Capture a screenshot with a single command:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="bash"
						title="Basic screenshot"
						code={`curl -o screenshot.png \\
  -H "x-api-key: sk_live_your_api_key" \\
  "https://screenshotapi.to/api/v1/screenshot?url=https://example.com&width=1440&height=900&type=png"`}
					/>
				</div>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					The {`-o`} flag saves the response body (raw image bytes) to
					a file. The API returns the image directly — no JSON
					wrapping.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Common parameter combinations
				</h2>
				<div className="mt-6 space-y-4">
					<CodeBlock
						language="bash"
						title="Full page screenshot"
						code={`curl -o fullpage.png \\
  -H "x-api-key: sk_live_your_api_key" \\
  "https://screenshotapi.to/api/v1/screenshot?url=https://example.com&fullPage=true&type=png"`}
					/>
					<CodeBlock
						language="bash"
						title="Dark mode, WebP format"
						code={`curl -o dark.webp \\
  -H "x-api-key: sk_live_your_api_key" \\
  "https://screenshotapi.to/api/v1/screenshot?url=https://example.com&colorScheme=dark&type=webp&quality=85"`}
					/>
					<CodeBlock
						language="bash"
						title="Mobile viewport (iPhone 14)"
						code={`curl -o mobile.png \\
  -H "x-api-key: sk_live_your_api_key" \\
  "https://screenshotapi.to/api/v1/screenshot?url=https://example.com&width=390&height=844&type=png"`}
					/>
					<CodeBlock
						language="bash"
						title="Wait for SPA content"
						code={`curl -o spa.png \\
  -H "x-api-key: sk_live_your_api_key" \\
  "https://screenshotapi.to/api/v1/screenshot?url=https://app.example.com&waitUntil=networkidle&waitForSelector=.content&delay=2000&type=png"`}
					/>
					<CodeBlock
						language="bash"
						title="JPEG with custom quality"
						code={`curl -o screenshot.jpg \\
  -H "x-api-key: sk_live_your_api_key" \\
  "https://screenshotapi.to/api/v1/screenshot?url=https://example.com&type=jpeg&quality=80"`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Batch capture with a shell script
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Capture screenshots of multiple URLs using a simple bash
					loop:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="bash"
						title="batch_screenshots.sh"
						code={`#!/bin/bash
API_KEY="sk_live_your_api_key"
URLS=(
  "https://example.com"
  "https://github.com"
  "https://news.ycombinator.com"
  "https://stripe.com"
)

for i in "\${!URLS[@]}"; do
  url="\${URLS[$i]}"
  output="screenshot_$((i+1)).png"
  echo "Capturing: $url -> $output"

  curl -s -o "$output" \\
    -H "x-api-key: $API_KEY" \\
    "https://screenshotapi.to/api/v1/screenshot?url=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$url', safe=''))")&width=1440&height=900&type=png"

  echo "  Saved ($output, $(wc -c < "$output") bytes)"
done

echo "Done! Captured \${#URLS[@]} screenshots."`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Parallel capture with xargs
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					For faster batch processing, use xargs to run captures in
					parallel:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="bash"
						title="Parallel capture"
						code={`# urls.txt: one URL per line
cat urls.txt | xargs -P 4 -I {} sh -c '
  filename=$(echo "{}" | sed "s|https\\?://||;s|/|_|g").png
  curl -s -o "$filename" \\
    -H "x-api-key: sk_live_your_api_key" \\
    "https://screenshotapi.to/api/v1/screenshot?url={}&type=png"
  echo "Captured: {} -> $filename"
'`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Useful cURL flags for debugging
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					When troubleshooting, these flags help understand what is
					happening:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="bash"
						title="Debugging flags"
						code={`# Show response headers (useful for checking content-type and status)
curl -I -H "x-api-key: sk_live_your_api_key" \\
  "https://screenshotapi.to/api/v1/screenshot?url=https://example.com&type=png"

# Show timing breakdown
curl -o /dev/null -w "DNS: %{time_namelookup}s\\nConnect: %{time_connect}s\\nTotal: %{time_total}s\\nSize: %{size_download} bytes\\n" \\
  -H "x-api-key: sk_live_your_api_key" \\
  "https://screenshotapi.to/api/v1/screenshot?url=https://example.com&type=png"

# Verbose output for full request/response debugging
curl -v -o screenshot.png \\
  -H "x-api-key: sk_live_your_api_key" \\
  "https://screenshotapi.to/api/v1/screenshot?url=https://example.com&type=png"`}
					/>
				</div>
			</section>
		</ArticleLayout>
	)
}
