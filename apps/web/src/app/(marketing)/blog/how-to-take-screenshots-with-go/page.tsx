import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock } from '@/components/seo'

export const metadata: Metadata = {
	title: 'How to Take Screenshots with Go (2025)',
	description:
		'Capture website screenshots in Go using net/http and ScreenshotAPI. Compare chromedp vs API approach with working code examples.'
}

export default function Page() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Blog', href: '/blog' },
				{ label: 'Take Screenshots with Go' }
			]}
			title="How to Take Screenshots with Go"
			description="Capture website screenshots in Go with net/http — no headless browser or chromedp needed. Working code examples with error handling."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'Article',
				headline: 'How to Take Screenshots with Go',
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
						'Do I need Chrome installed to take screenshots with Go?',
					answer: 'Not with ScreenshotAPI. The API handles all browser rendering on its servers. You only need the Go standard library (net/http) to make the request.'
				},
				{
					question: 'How does chromedp compare to using an API?',
					answer: 'chromedp provides full browser automation via Chrome DevTools Protocol, which is powerful but requires Chrome/Chromium installed. For screenshots only, ScreenshotAPI is simpler and more reliable.'
				},
				{
					question:
						'Can I process the screenshot in memory without saving to disk?',
					answer: 'Yes. The API returns raw image bytes in the HTTP response body. You can process them in memory, upload to S3, or pass them to an image processing library without writing to disk.'
				},
				{
					question: 'What is the response format from ScreenshotAPI?',
					answer: 'The API returns raw image bytes with the appropriate Content-Type header (image/png, image/jpeg, or image/webp). It is not JSON — you read the response body directly as binary data.'
				}
			]}
			relatedPages={[
				{
					title: 'Take Screenshots with cURL',
					description:
						'Quick screenshot capture from the command line.',
					href: '/blog/how-to-take-screenshots-with-curl'
				},
				{
					title: 'Automate Website Screenshots',
					description: 'Build automated screenshot pipelines.',
					href: '/blog/how-to-automate-website-screenshots'
				},
				{
					title: 'Best Screenshot APIs',
					description: 'Compare the top screenshot API providers.',
					href: '/blog/best-screenshot-apis'
				}
			]}
		>
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Why capture screenshots in Go?
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Go excels at building high-performance services, CLI tools,
					and backend infrastructure. Adding screenshot capabilities
					is useful for monitoring dashboards, generating thumbnails
					in a microservice, archiving web content, and building CI/CD
					pipelines. The standard library approach with ScreenshotAPI
					fits perfectly with Go&apos;s philosophy of simplicity and
					minimal dependencies.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					The manual way: chromedp
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					chromedp is the most popular Go package for controlling
					Chrome. Here is what a screenshot requires:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="go"
						title="screenshot_chromedp.go"
						code={`package main

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/chromedp/chromedp"
)

func main() {
	ctx, cancel := chromedp.NewContext(context.Background())
	defer cancel()

	ctx, cancel = context.WithTimeout(ctx, 30*time.Second)
	defer cancel()

	var buf []byte
	err := chromedp.Run(ctx,
		chromedp.EmulateViewport(1440, 900),
		chromedp.Navigate("https://example.com"),
		chromedp.WaitReady("body"),
		chromedp.FullScreenshot(&buf, 90),
	)
	if err != nil {
		log.Fatal(err)
	}

	if err := os.WriteFile("screenshot.png", buf, 0644); err != nil {
		log.Fatal(err)
	}
	log.Printf("Screenshot saved (%d bytes)", len(buf))
}`}
					/>
				</div>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					This requires Chrome or Chromium installed on the system,
					creates a browser process, and needs careful context
					management. In Docker, you need a larger base image with
					Chrome dependencies. On Alpine Linux, getting Chromium
					working is notoriously painful.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					The easy way: net/http with ScreenshotAPI
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Use the Go standard library to make a single HTTP request:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="go"
						title="screenshot_api.go"
						code={`package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
)

func captureScreenshot(targetURL, outputPath string) error {
	params := url.Values{}
	params.Set("url", targetURL)
	params.Set("width", "1440")
	params.Set("height", "900")
	params.Set("type", "png")

	req, err := http.NewRequest("GET",
		"https://screenshotapi.to/api/v1/screenshot?"+params.Encode(), nil)
	if err != nil {
		return fmt.Errorf("creating request: %w", err)
	}
	req.Header.Set("x-api-key", "sk_live_your_api_key")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("executing request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("API error %d: %s", resp.StatusCode, body)
	}

	f, err := os.Create(outputPath)
	if err != nil {
		return fmt.Errorf("creating file: %w", err)
	}
	defer f.Close()

	written, err := io.Copy(f, resp.Body)
	if err != nil {
		return fmt.Errorf("writing file: %w", err)
	}

	fmt.Printf("Screenshot saved to %s (%d bytes)\\n", outputPath, written)
	return nil
}

func main() {
	if err := captureScreenshot("https://example.com", "screenshot.png"); err != nil {
		log.Fatal(err)
	}
}`}
					/>
				</div>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Zero external dependencies. Builds into a tiny static
					binary. Runs anywhere Go runs — including minimal Docker
					containers based on scratch or distroless.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Adding concurrency for batch screenshots
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Go&apos;s goroutines make it trivial to capture multiple
					screenshots in parallel:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="go"
						title="screenshot_batch.go"
						code={`func captureMultiple(urls []string) {
	var wg sync.WaitGroup
	sem := make(chan struct{}, 5) // limit concurrency to 5

	for i, u := range urls {
		wg.Add(1)
		go func(url string, index int) {
			defer wg.Done()
			sem <- struct{}{}
			defer func() { <-sem }()

			outputPath := fmt.Sprintf("screenshot_%d.png", index)
			if err := captureScreenshot(url, outputPath); err != nil {
				log.Printf("Failed %s: %v", url, err)
			}
		}(u, i)
	}

	wg.Wait()
}`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Advanced parameters
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Pass additional parameters for full-page captures, dark
					mode, and wait strategies:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="go"
						title="Advanced options"
						code={`params := url.Values{}
params.Set("url", "https://example.com")
params.Set("width", "1440")
params.Set("height", "900")
params.Set("fullPage", "true")
params.Set("colorScheme", "dark")
params.Set("type", "webp")
params.Set("quality", "85")
params.Set("waitUntil", "networkidle")
params.Set("delay", "2000")`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					chromedp vs ScreenshotAPI
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Use chromedp if you need full browser automation — form
					filling, clicking, navigating multi-step flows. Use
					ScreenshotAPI if you need screenshots: zero dependencies,
					tiny binary size, no Chrome installation, and it works on
					any platform without system-level setup.
				</p>
			</section>
		</ArticleLayout>
	)
}
