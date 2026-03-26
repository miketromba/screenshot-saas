import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock } from '@/components/seo'

export const metadata: Metadata = {
	title: 'How to Take Screenshots with PHP (2025)',
	description:
		'Capture website screenshots in PHP using cURL and ScreenshotAPI. Replace Browsershot and Chrome PHP with a simple HTTP call.'
}

export default function Page() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Blog', href: '/blog' },
				{ label: 'Take Screenshots with PHP' }
			]}
			title="How to Take Screenshots with PHP"
			description="Capture website screenshots in PHP with cURL — no Browsershot, Puppeteer, or Chrome binary required. Production-ready code examples."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'Article',
				headline: 'How to Take Screenshots with PHP',
				dateModified: '2026-03-25',
				publisher: {
					'@type': 'Organization',
					name: 'ScreenshotAPI',
					url: 'https://screenshotapi.to'
				}
			}}
			faq={[
				{
					question: 'Can I take screenshots in PHP without Chrome?',
					answer: 'Yes. ScreenshotAPI runs the browser rendering on its servers. Your PHP code just makes a cURL request and receives the screenshot image — no Chrome, Puppeteer, or Node.js required on your server.'
				},
				{
					question: 'Does this work on shared hosting?',
					answer: 'Yes, as long as cURL is enabled (it is on virtually all PHP hosts). Unlike Browsershot which requires a Node.js binary and Puppeteer, ScreenshotAPI works with a simple HTTP request.'
				},
				{
					question: 'Can I use this with Laravel?',
					answer: 'Absolutely. You can use the cURL approach directly, or use Laravel\'s HTTP facade: Http::withHeaders(["x-api-key" => $key])->get($url). Run it in a queued job for best performance.'
				},
				{
					question:
						'What is the maximum timeout for screenshot requests?',
					answer: 'ScreenshotAPI has a maximum timeout of 30 seconds for rendering. If a page takes longer to load, the API will return what has been rendered. You can use waitUntil and delay parameters to control timing.'
				}
			]}
			relatedPages={[
				{
					title: 'Take Screenshots with Ruby',
					description: 'Screenshot capture in Ruby with Net::HTTP.',
					href: '/blog/how-to-take-screenshots-with-ruby'
				},
				{
					title: 'Take Screenshots with cURL',
					description: 'Command-line screenshot capture with cURL.',
					href: '/blog/how-to-take-screenshots-with-curl'
				},
				{
					title: 'Migrate from Puppeteer',
					description:
						'Replace Browsershot/Puppeteer with ScreenshotAPI.',
					href: '/blog/migrate-from-puppeteer'
				}
			]}
		>
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Why capture screenshots in PHP?
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					PHP powers over 75% of websites with known server-side
					languages. From WordPress plugins to Laravel applications,
					there are countless use cases for screenshot capture:
					generating link previews, thumbnail services, visual
					monitoring, PDF generation with embedded screenshots, and
					website archiving. The traditional approach using
					Browsershot requires Node.js and Puppeteer — a heavy
					dependency chain that complicates deployment, especially on
					shared hosting.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					The manual way: Browsershot
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Spatie&apos;s Browsershot is the most popular PHP screenshot
					package. It shells out to Puppeteer under the hood:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="php"
						title="screenshot_browsershot.php"
						code={`<?php
use Spatie\\Browsershot\\Browsershot;

// Requires: composer require spatie/browsershot
// Also requires: npm install puppeteer
// Also requires: Chrome/Chromium binary

Browsershot::url('https://example.com')
    ->windowSize(1440, 900)
    ->waitUntilNetworkIdle()
    ->fullPage()
    ->setNodeBinary('/usr/local/bin/node')
    ->setNpmBinary('/usr/local/bin/npm')
    ->setChromePath('/usr/bin/google-chrome')
    ->save('screenshot.png');`}
					/>
				</div>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					This requires Node.js, npm, Puppeteer, and Chrome all
					installed on your server. On shared hosting, this simply
					does not work. On Docker, your image size increases
					dramatically. And you need to configure binary paths for
					each environment.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					The easy way: cURL with ScreenshotAPI
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Use PHP&apos;s built-in cURL extension to call
					ScreenshotAPI:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="php"
						title="screenshot_api.php"
						code={`<?php

function captureScreenshot(string $url, string $outputPath = 'screenshot.png'): void
{
    $params = http_build_query([
        'url' => $url,
        'width' => 1440,
        'height' => 900,
        'type' => 'png',
    ]);

    $ch = curl_init("https://screenshotapi.to/api/v1/screenshot?{$params}");
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => ['x-api-key: sk_live_your_api_key'],
        CURLOPT_TIMEOUT => 30,
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200) {
        throw new RuntimeException("API error: HTTP {$httpCode}");
    }

    file_put_contents($outputPath, $response);
    echo "Screenshot saved to {$outputPath} (" . strlen($response) . " bytes)\\n";
}

captureScreenshot('https://example.com');`}
					/>
				</div>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					No Node.js, no Puppeteer, no Chrome binary. Works on any PHP
					hosting environment with cURL enabled.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Laravel integration
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					In Laravel, use the HTTP facade and run it in a queued job:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="php"
						title="app/Jobs/CaptureScreenshot.php"
						code={`<?php

namespace App\\Jobs;

use Illuminate\\Bus\\Queueable;
use Illuminate\\Contracts\\Queue\\ShouldQueue;
use Illuminate\\Foundation\\Bus\\Dispatchable;
use Illuminate\\Support\\Facades\\Http;
use Illuminate\\Support\\Facades\\Storage;

class CaptureScreenshot implements ShouldQueue
{
    use Dispatchable, Queueable;

    public int $tries = 3;
    public int $backoff = 5;

    public function __construct(
        private string $url,
        private int $recordId,
    ) {}

    public function handle(): void
    {
        $response = Http::timeout(30)
            ->withHeaders(['x-api-key' => config('services.screenshotapi.key')])
            ->get('https://screenshotapi.to/api/v1/screenshot', [
                'url' => $this->url,
                'width' => 1440,
                'height' => 900,
                'type' => 'png',
            ]);

        $response->throw();

        Storage::put(
            "screenshots/{$this->recordId}.png",
            $response->body()
        );
    }
}`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Advanced parameters
				</h2>
				<div className="mt-6">
					<CodeBlock
						language="php"
						title="Advanced options"
						code={`<?php

// Full page, dark mode, WebP
$params = http_build_query([
    'url' => 'https://example.com',
    'width' => 1440,
    'height' => 900,
    'fullPage' => 'true',
    'colorScheme' => 'dark',
    'type' => 'webp',
    'quality' => 85,
]);

// Mobile viewport
$params = http_build_query([
    'url' => 'https://example.com',
    'width' => 375,
    'height' => 812,
    'type' => 'png',
]);

// Wait for dynamic content
$params = http_build_query([
    'url' => 'https://app.example.com',
    'waitUntil' => 'networkidle',
    'waitForSelector' => '.content-loaded',
    'delay' => 2000,
    'type' => 'png',
]);`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Browsershot vs ScreenshotAPI
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Browsershot is a solid package when you already have Node.js
					in your stack and need browser automation beyond
					screenshots. But for screenshot-only use cases,
					ScreenshotAPI eliminates the entire Node.js/Puppeteer/Chrome
					dependency chain, works on shared hosting, and requires zero
					server configuration. It is also more reliable since you do
					not need to handle Chrome crashes and memory leaks.
				</p>
			</section>
		</ArticleLayout>
	)
}
