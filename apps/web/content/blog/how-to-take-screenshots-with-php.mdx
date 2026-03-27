---
title: "How to Take Screenshots with PHP: Browsershot, Puppeteer, and API"
description: "Capture website screenshots in PHP using Spatie Browsershot, Puppeteer, or ScreenshotAPI. Working examples for Laravel and vanilla PHP."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Blog
    href: /blog
  - label: How to Take Screenshots with PHP
faq:
  - question: "What is the best PHP library for taking screenshots?"
    answer: "Spatie Browsershot is the most popular option with over 5 million downloads. It wraps Puppeteer in a clean PHP API. For hosting environments without Node.js, a screenshot API is the only practical option."
  - question: "Can I take screenshots on shared hosting with PHP?"
    answer: "Not with Browsershot or Puppeteer, which require Node.js and Chrome. ScreenshotAPI works on any hosting environment because it only needs PHP's cURL extension, which is available everywhere."
  - question: "How do I capture screenshots in Laravel?"
    answer: "Use ScreenshotAPI with Laravel's HTTP client. Call Http::withHeaders(['x-api-key' => config('services.screenshot.key')])->get() and save the response body as an image file."
  - question: "Does Browsershot work with PHP 8.3?"
    answer: "Yes, Browsershot supports PHP 8.1 and above. However, it still requires Node.js 18+ and Puppeteer to be installed separately."
relatedPages:
  - title: "How to Take Screenshots with JavaScript"
    description: "Capture screenshots using Node.js, Puppeteer, and the API."
    href: "/blog/how-to-take-screenshots-with-javascript"
  - title: "PHP SDK Documentation"
    description: "Full reference for the ScreenshotAPI PHP client."
    href: "/docs/sdks/php"
  - title: "How to Add Website Thumbnails to Your App"
    description: "Generate thumbnails for link directories and dashboards."
    href: "/blog/how-to-add-website-thumbnails-to-your-app"
jsonLd:
  "@context": "https://schema.org"
  "@type": "Article"
  headline: "How to Take Screenshots with PHP: Browsershot, Puppeteer, and API"
  description: "Capture website screenshots in PHP using Spatie Browsershot, Puppeteer, or ScreenshotAPI. Working examples for Laravel and vanilla PHP."
  dateModified: "2026-03-25"
---

Taking a website screenshot with PHP is common in content management systems, link directories, and monitoring tools. This guide covers three approaches: Spatie Browsershot (the community standard), raw Puppeteer via shell commands, and ScreenshotAPI (cloud-based).

## The Hard Way: Spatie Browsershot

Browsershot is a PHP wrapper around Puppeteer with over 5 million downloads. It provides a fluent API but requires both Node.js and Chrome.

### Install

```bash
composer require spatie/browsershot
npm install puppeteer
```

### Basic screenshot

```php
use Spatie\Browsershot\Browsershot;

Browsershot::url('https://example.com')
    ->windowSize(1440, 900)
    ->save('screenshot.png');
```

### Full-page screenshot

```php
Browsershot::url('https://example.com')
    ->windowSize(1440, 900)
    ->fullPage()
    ->save('full_page.png');
```

### Wait for content

```php
Browsershot::url('https://example.com')
    ->waitForFunction('document.querySelector("#main-content") !== null')
    ->save('screenshot.png');
```

### Custom user agent

```php
Browsershot::url('https://example.com')
    ->userAgent('MyApp/1.0')
    ->save('screenshot.png');
```

### Browsershot problems

- Requires Node.js installed alongside PHP
- Puppeteer downloads a ~300 MB Chromium binary
- Shared hosting and most managed PHP platforms do not support it
- Docker images balloon in size with Chrome dependencies
- Process communication between PHP and Node.js can fail silently

## The Alternative Hard Way: Direct Puppeteer via Shell

If you prefer not to use Browsershot, you can write a Node.js script and call it from PHP.

### Node.js script (screenshot.js)

```javascript
const puppeteer = require('puppeteer');
const [,, url, output] = process.argv;

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.screenshot({ path: output });
  await browser.close();
})();
```

### PHP caller

```php
$url = 'https://example.com';
$output = '/tmp/screenshot.png';

exec("node screenshot.js " . escapeshellarg($url) . " " . escapeshellarg($output), $out, $code);

if ($code !== 0) {
    throw new RuntimeException("Screenshot failed with exit code $code");
}
```

This approach has the same infrastructure requirements as Browsershot with less polish.

## The Easy Way: ScreenshotAPI

[ScreenshotAPI](/) requires only PHP's built-in cURL extension. No Node.js, no Chrome, no Composer packages.

### Using cURL (vanilla PHP)

```php
$params = http_build_query([
    'url' => 'https://example.com',
    'width' => 1440,
    'height' => 900,
    'type' => 'png',
]);

$ch = curl_init("https://screenshotapi.to/api/v1/screenshot?{$params}");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'x-api-key: sk_live_your_api_key',
    ],
]);

$image = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    file_put_contents('screenshot.png', $image);
}
```

### Full-page screenshot

```php
$params = http_build_query([
    'url' => 'https://example.com',
    'width' => 1440,
    'fullPage' => 'true',
    'type' => 'png',
]);
```

### Dark mode with JPEG output

```php
$params = http_build_query([
    'url' => 'https://example.com',
    'width' => 1440,
    'height' => 900,
    'colorScheme' => 'dark',
    'type' => 'jpeg',
    'quality' => 85,
]);
```

### Laravel HTTP client

```php
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

$response = Http::withHeaders([
    'x-api-key' => config('services.screenshot.key'),
])->get('https://screenshotapi.to/api/v1/screenshot', [
    'url' => 'https://example.com',
    'width' => 1440,
    'height' => 900,
    'type' => 'png',
]);

if ($response->successful()) {
    Storage::put('screenshots/example.png', $response->body());
}
```

### Laravel queued job

```php
namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class CaptureScreenshot implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable;

    public function __construct(
        private string $url,
        private string $storagePath
    ) {}

    public function handle(): void
    {
        $response = Http::withHeaders([
            'x-api-key' => config('services.screenshot.key'),
        ])->get('https://screenshotapi.to/api/v1/screenshot', [
            'url' => $this->url,
            'width' => 1440,
            'height' => 900,
            'type' => 'png',
        ]);

        if ($response->successful()) {
            Storage::put($this->storagePath, $response->body());
        }
    }
}
```

### Reusable PHP class

```php
class ScreenshotClient
{
    private string $apiKey;
    private string $baseUrl = 'https://screenshotapi.to/api/v1/screenshot';

    public function __construct(string $apiKey)
    {
        $this->apiKey = $apiKey;
    }

    public function capture(string $url, array $options = []): string
    {
        $params = array_merge([
            'url' => $url,
            'width' => 1440,
            'height' => 900,
            'type' => 'png',
        ], $options);

        $ch = curl_init($this->baseUrl . '?' . http_build_query($params));
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_HTTPHEADER => ["x-api-key: {$this->apiKey}"],
        ]);

        $response = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($code !== 200) {
            throw new \RuntimeException("Screenshot API returned HTTP {$code}");
        }

        return $response;
    }
}

// Usage
$client = new ScreenshotClient('sk_live_your_api_key');
$image = $client->capture('https://example.com', ['colorScheme' => 'dark']);
file_put_contents('dark_screenshot.png', $image);
```

## Comparison Table

| Feature | Browsershot | Shell Puppeteer | ScreenshotAPI |
|---|---|---|---|
| Requires Node.js | Yes | Yes | No |
| Requires Chrome | Yes | Yes | No |
| Shared hosting | Not supported | Not supported | Works everywhere |
| Full-page | Native | Manual | Native |
| Dark mode | Manual CSS | Manual CSS | Query parameter |
| Laravel integration | Good | Manual | Excellent |
| Docker image size | ~1.5 GB | ~1.5 GB | Base PHP image |

## When to Use Each

**Choose Browsershot** if you have full control over your server environment and already have Node.js installed alongside PHP.

**Choose [ScreenshotAPI](/)** for production applications, shared hosting, or any environment where installing Chrome is not feasible. It works with vanilla PHP, [Laravel](/integrations/rails), WordPress, and every other PHP framework. View [pricing](/pricing) for credit-based plans.

## Next Steps

- Read the [API documentation](/docs) for all available parameters
- Learn how to [build link previews](/blog/how-to-build-link-previews) with PHP
- See how to [generate OG images from URLs](/blog/how-to-generate-og-images-from-url)
