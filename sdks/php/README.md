# screenshotapi/sdk

Official PHP SDK for [ScreenshotAPI](https://screenshotapi.to) — capture website screenshots with a simple API call.

## Installation

```bash
composer require screenshotapi/sdk
```

## Quick Start

```php
<?php

require_once 'vendor/autoload.php';

use ScreenshotAPI\Client;
use ScreenshotAPI\ScreenshotOptions;

$client = new Client('your-api-key');

// Take a screenshot and save to file
$metadata = $client->save(
    new ScreenshotOptions(url: 'https://example.com'),
    'screenshot.png'
);

echo "Credits remaining: {$metadata->creditsRemaining}\n";
```

## Usage

### Initialize the Client

```php
use ScreenshotAPI\Client;

// Default configuration
$client = new Client('your-api-key');

// Custom configuration
$client = new Client(
    apiKey: 'your-api-key',
    baseUrl: 'https://screenshotapi.to', // optional
    timeout: 60.0, // optional, seconds
);
```

### Take a Screenshot (get raw bytes)

```php
use ScreenshotAPI\ScreenshotOptions;

$result = $client->screenshot(new ScreenshotOptions(
    url: 'https://example.com',
    width: 1920,
    height: 1080,
    fullPage: true,
    type: 'webp',
    quality: 90,
    colorScheme: 'dark',
));

// $result->image       — binary string of image data
// $result->contentType — e.g. "image/webp"
// $result->metadata->creditsRemaining
// $result->metadata->screenshotId
// $result->metadata->durationMs
```

### Save to File

```php
$metadata = $client->save(
    new ScreenshotOptions(
        url: 'https://example.com',
        fullPage: true,
        type: 'png',
    ),
    'screenshot.png'
);
```

## API Reference

### `new Client(apiKey, baseUrl, timeout, httpClient)`

| Parameter    | Type         | Required | Default                     | Description              |
| ------------ | ------------ | -------- | --------------------------- | ------------------------ |
| `apiKey`     | `string`     | Yes      | —                           | Your API key             |
| `baseUrl`    | `string`     | No       | `https://screenshotapi.to` | API base URL             |
| `timeout`    | `float`      | No       | `60`                        | Request timeout (s)      |
| `httpClient` | `HttpClient` | No       | —                           | Custom Guzzle client     |

### `$client->screenshot(ScreenshotOptions $options): Result`

| Parameter         | Type     | Required | Default          | Description                     |
| ----------------- | -------- | -------- | ---------------- | ------------------------------- |
| `url`             | `string` | Yes      | —                | URL to capture                  |
| `width`           | `int`    | No       | `1440`           | Viewport width (px)             |
| `height`          | `int`    | No       | `900`            | Viewport height (px)            |
| `fullPage`        | `bool`   | No       | `false`          | Capture full scrollable page    |
| `type`            | `string` | No       | `"png"`          | `"png"`, `"jpeg"`, or `"webp"` |
| `quality`         | `int`    | No       | `100`            | Image quality (1-100)           |
| `colorScheme`     | `string` | No       | —                | `"light"` or `"dark"`           |
| `waitUntil`       | `string` | No       | `"networkidle2"` | Page load event to wait for     |
| `waitForSelector` | `string` | No       | —                | CSS selector to wait for        |
| `delay`           | `int`    | No       | —                | Extra delay after load (ms)     |

### `$client->save(ScreenshotOptions $options, string $path): Metadata`

Same options as `screenshot()` plus a file `$path`. Returns `Metadata`.

## Error Handling

```php
use ScreenshotAPI\Client;
use ScreenshotAPI\ScreenshotOptions;
use ScreenshotAPI\Exceptions\AuthenticationException;
use ScreenshotAPI\Exceptions\InsufficientCreditsException;
use ScreenshotAPI\Exceptions\InvalidAPIKeyException;
use ScreenshotAPI\Exceptions\ScreenshotFailedException;

$client = new Client('your-api-key');

try {
    $client->screenshot(new ScreenshotOptions(url: 'https://example.com'));
} catch (AuthenticationException $e) {
    // 401 — API key missing or malformed
} catch (InvalidAPIKeyException $e) {
    // 403 — API key revoked or invalid
} catch (InsufficientCreditsException $e) {
    echo "Balance: {$e->balance}\n";
    // 402 — No credits remaining
} catch (ScreenshotFailedException $e) {
    echo "Failed: {$e->getMessage()}\n";
    // 500 — Screenshot capture failed
}
```

## Requirements

- PHP 8.1+
- [Guzzle](https://docs.guzzlephp.org/) 7.0+

## License

MIT
