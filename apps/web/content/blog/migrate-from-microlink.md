---
title: "Migrate from Microlink to ScreenshotAPI"
description: "Guide to switching from Microlink's screenshot API to ScreenshotAPI. Covers response format differences, parameter mapping, and code examples."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Blog
    href: /blog
  - label: Migrate from Microlink
faq:
  - question: "What is the biggest difference between Microlink and ScreenshotAPI?"
    answer: "Response format. Microlink returns a JSON object containing a CDN URL pointing to the screenshot image. ScreenshotAPI returns the image binary directly with the correct Content-Type header. This means one fewer HTTP request when you need the actual image bytes."
  - question: "Does ScreenshotAPI support Microlink's overlay/browser frame feature?"
    answer: "Not natively. Microlink's overlay parameter wraps screenshots in a decorative browser frame with gradient backgrounds. You can replicate this client-side using image processing libraries like sharp or canvas after capturing the screenshot."
  - question: "How does pricing compare?"
    answer: "Microlink Pro starts at €39/month for 46K requests with unused requests expiring monthly. ScreenshotAPI uses one-time credit purchases that never expire. For variable workloads, ScreenshotAPI is typically more cost-effective."
  - question: "Can I still use the Microlink SDK with ScreenshotAPI?"
    answer: "No. The Microlink MQL SDK is specific to Microlink's API. ScreenshotAPI is a standard REST API that works with any HTTP client. The code is actually simpler since you do not need an SDK at all."
relatedPages:
  - title: "ScreenshotAPI vs Microlink"
    description: "Detailed feature and pricing comparison."
    href: "/compare/screenshotapi-vs-microlink"
  - title: "Best Screenshot APIs"
    description: "Full comparison of screenshot API services."
    href: "/blog/best-screenshot-apis"
  - title: "API Documentation"
    description: "Complete ScreenshotAPI parameter reference."
    href: "/docs"
jsonLd:
  "@context": "https://schema.org"
  "@type": "Article"
  headline: "Migrate from Microlink to ScreenshotAPI"
  description: "Guide to switching from Microlink's screenshot API to ScreenshotAPI. Covers response format differences, parameter mapping, and code examples."
  dateModified: "2026-03-25"
---

Microlink is a versatile link intelligence API that handles metadata extraction, PDF generation, and screenshots. If you are only using Microlink for screenshots, you are paying for an entire link analysis platform when all you need is an image capture endpoint. [ScreenshotAPI](/) is a dedicated screenshot API that returns image data directly, uses straightforward parameters, and charges credits that never expire. This guide covers the migration.

## Why Switch from Microlink

Microlink is well-engineered, but its screenshot capability comes with trade-offs when that is your primary use case.

**Extra HTTP round-trip.** Microlink returns a JSON response containing a CDN URL that points to the screenshot. To get the actual image bytes, you need a second HTTP request to fetch from that URL. ScreenshotAPI returns the image binary directly in the response body, cutting out the intermediary step.

**Subscription pressure.** Microlink Pro starts at €39/month for 46,000 requests. The free tier allows just 50 requests per day. Unused requests expire at month end. ScreenshotAPI credits are one-time purchases that never expire, so you never lose what you have paid for.

**SDK dependency.** Microlink encourages using their MQL (Microlink Query Language) SDK, which adds a dependency to your project. ScreenshotAPI is a plain REST endpoint that works with `fetch`, `requests`, `curl`, or any HTTP client you already use. No SDK required.

**Nested parameter syntax.** Microlink uses dot-notation for viewport parameters (`viewport.width`, `viewport.height`, `viewport.deviceScaleFactor`). ScreenshotAPI uses flat, top-level parameters (`width`, `height`) that are easier to construct programmatically.

## Pricing Comparison

Microlink charges in Euros with monthly subscriptions. ScreenshotAPI charges in USD with one-time credit purchases.

| Monthly Volume | Microlink Cost | ScreenshotAPI Cost | Annual Savings |
|---|---|---|---|
| 50/day (~1,500/mo) | Free (50/day limit) | $30 one-time | N/A |
| 5,000/month | €39/month (~$42, $504/year) | $100 one-time | ~$404/year |
| 20,000/month | €39/month (~$42, $504/year) | $400 one-time | ~$104/year |
| 46,000/month | €39/month (~$42, $504/year) | $750 one-time | Significant |
| 100,000+/month | €500+/month (Enterprise) | Varies | Significant |

ScreenshotAPI credits never expire. If you buy 10,000 and use 3,000 the first month, you still have 7,000 available whenever you need them. See the [pricing page](/pricing) for current credit packages.

## Response Format Difference

This is the most significant architectural change. Understanding it will shape how you update your code.

### Microlink Response (JSON with CDN URL)

```json
{
  "status": "success",
  "data": {
    "screenshot": {
      "url": "https://microlink-cdn.s3.amazonaws.com/s/example_screenshot.png",
      "width": 1440,
      "height": 900,
      "type": "png",
      "size": 284037,
      "size_pretty": "284 kB"
    },
    "title": "Example Domain",
    "description": "...",
    "lang": "en"
  }
}
```

To get the actual image, you make a second request to `data.screenshot.url`.

### ScreenshotAPI Response (Direct Image Binary)

```
HTTP/1.1 200 OK
Content-Type: image/png
Content-Length: 284037

<raw PNG bytes>
```

The image bytes are in the response body. One request, one response, done.

### What This Means for Your Code

If your current code does something like this:

```javascript
// Microlink: two requests to get image bytes
const { data } = await mql(url, { screenshot: true });
const imageResponse = await fetch(data.screenshot.url);
const imageBuffer = await imageResponse.arrayBuffer();
```

It becomes:

```javascript
// ScreenshotAPI: one request to get image bytes
const response = await fetch(`https://screenshotapi.to/api/v1/screenshot?url=${url}&type=png`, {
  headers: { 'x-api-key': process.env.SCREENSHOT_API_KEY }
});
const imageBuffer = await response.arrayBuffer();
```

If your code only stores the screenshot URL (pointing to Microlink's CDN), you will need to save the image binary to your own storage (S3, R2, GCS) and use that URL instead. This gives you full control over the image lifecycle and CDN behavior.

## Parameter Mapping

Microlink uses nested dot-notation parameters. ScreenshotAPI uses flat query parameters.

| Microlink | ScreenshotAPI | Notes |
|---|---|---|
| `url` | `url` | Same |
| `screenshot=true` | N/A | Always returns a screenshot |
| `screenshot.fullPage=true` | `fullPage=true` | Simplified path |
| `screenshot.type=png` | `type=png` | Supports png, jpeg, webp |
| `screenshot.overlay.browser=dark` | N/A | Decorative frame, not supported |
| `screenshot.overlay.background=...` | N/A | Decorative background, not supported |
| `viewport.width=1440` | `width=1440` | Flat parameter |
| `viewport.height=900` | `height=900` | Flat parameter |
| `viewport.deviceScaleFactor=2` | N/A | Use 2x width/height instead |
| `viewport.isMobile=true` | `width=375&height=812` | Set mobile dimensions directly |
| `waitForSelector=.el` | `waitForSelector=.el` | Same |
| `colorScheme=dark` | `colorScheme=dark` | Same |
| `mediaType=screen` | N/A | Screen is the default |
| N/A | `quality=80` | JPEG/WebP quality control |
| N/A | `delay=2000` | Fixed delay in ms |
| N/A | `waitUntil=networkidle` | Page load strategy |

## Authentication Change

Microlink uses a query-string API key on the Pro plan. ScreenshotAPI uses an `x-api-key` header.

### Microlink

```javascript
// Using MQL SDK (abstracts the API key)
import mql from '@microlink/mql';

const { data } = await mql('https://example.com', {
  screenshot: true,
  apiKey: process.env.MICROLINK_API_KEY,
});
```

Or via direct HTTP:

```javascript
// API key in query string
const response = await fetch(
  `https://pro.microlink.io?url=https://example.com&screenshot=true&apiKey=${API_KEY}`
);
```

### ScreenshotAPI

```javascript
// API key in header, no SDK needed
const response = await fetch(
  'https://screenshotapi.to/api/v1/screenshot?url=https://example.com&type=png',
  { headers: { 'x-api-key': 'sk_live_your_api_key' } }
);
```

## Before and After: JavaScript

### Microlink (Before)

```javascript
import mql from '@microlink/mql';

async function takeScreenshot(targetUrl) {
  const { data } = await mql(targetUrl, {
    screenshot: {
      fullPage: false,
      type: 'png',
    },
    viewport: {
      width: 1440,
      height: 900,
    },
    waitForSelector: '.main-content',
    colorScheme: 'dark',
    apiKey: process.env.MICROLINK_API_KEY,
  });

  // Second request to get actual image bytes from CDN
  const imageResponse = await fetch(data.screenshot.url);
  return Buffer.from(await imageResponse.arrayBuffer());
}
```

### ScreenshotAPI (After)

```javascript
async function takeScreenshot(targetUrl) {
  const params = new URLSearchParams({
    url: targetUrl,
    width: '1440',
    height: '900',
    type: 'png',
    colorScheme: 'dark',
    waitForSelector: '.main-content',
  });

  const response = await fetch(
    `https://screenshotapi.to/api/v1/screenshot?${params}`,
    { headers: { 'x-api-key': process.env.SCREENSHOT_API_KEY } }
  );

  if (!response.ok) throw new Error(`Screenshot failed: ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}
```

No SDK import. No nested parameter objects. No second HTTP request. The function is shorter and has fewer failure points.

## Before and After: Python

### Microlink (Before)

```python
import requests

def take_screenshot(url):
    response = requests.get(
        "https://pro.microlink.io",
        params={
            "url": url,
            "screenshot": "true",
            "screenshot.fullPage": "true",
            "screenshot.type": "png",
            "viewport.width": 1440,
            "viewport.height": 900,
            "colorScheme": "dark",
            "apiKey": MICROLINK_API_KEY,
        },
    )
    response.raise_for_status()
    data = response.json()

    # Fetch actual image from CDN URL
    image_response = requests.get(data["data"]["screenshot"]["url"])
    return image_response.content
```

### ScreenshotAPI (After)

```python
import requests
import os

def take_screenshot(url):
    response = requests.get(
        "https://screenshotapi.to/api/v1/screenshot",
        params={
            "url": url,
            "width": 1440,
            "height": 900,
            "type": "png",
            "fullPage": "true",
            "colorScheme": "dark",
        },
        headers={"x-api-key": os.environ["SCREENSHOT_API_KEY"]},
    )
    response.raise_for_status()
    return response.content
```

One request instead of two. No JSON parsing. No CDN URL extraction. For more examples, see the [Python guide](/blog/how-to-take-screenshots-with-python) and [cURL guide](/blog/how-to-take-screenshots-with-curl).

## Before and After: cURL

### Microlink (Before)

```bash
# Step 1: Get the JSON response with CDN URL
curl -s "https://pro.microlink.io?url=https://example.com&screenshot=true&viewport.width=1440&viewport.height=900&apiKey=YOUR_KEY" \
  | jq -r '.data.screenshot.url' \
  | xargs curl --output screenshot.png
```

### ScreenshotAPI (After)

```bash
curl -G "https://screenshotapi.to/api/v1/screenshot" \
  -d "url=https://example.com" \
  -d "width=1440" \
  -d "height=900" \
  -d "type=png" \
  -H "x-api-key: sk_live_your_api_key" \
  --output screenshot.png
```

One command instead of a piped chain. No `jq` dependency needed.

## Handling Missing Features

### Browser Overlay (Microlink: screenshot.overlay)

Microlink can wrap screenshots in a decorative browser frame with custom gradient backgrounds. This is useful for marketing materials and social media images. ScreenshotAPI does not offer this natively.

You can replicate the effect client-side using an image processing library:

```javascript
import sharp from 'sharp';

async function addBrowserFrame(screenshotBuffer) {
  const browserFrame = await sharp('browser-frame.png').toBuffer();
  return sharp(browserFrame)
    .composite([{
      input: screenshotBuffer,
      top: 72,   // Below the browser chrome
      left: 12,  // Inside the frame border
    }])
    .toBuffer();
}
```

Alternatively, for [OG image generation](/blog/how-to-generate-og-images-from-url), build the browser frame in HTML/CSS and capture that as the screenshot.

### Device Scale Factor (Microlink: viewport.deviceScaleFactor)

Microlink supports `viewport.deviceScaleFactor=2` for retina-quality screenshots. With ScreenshotAPI, capture at 2x the target display dimensions:

```javascript
// For a 720x450 display, capture at 1440x900
const params = new URLSearchParams({
  url: 'https://example.com',
  width: '2880',  // 2x target width
  height: '1800', // 2x target height
  type: 'png',
});
```

### Metadata Extraction (Microlink: data.title, data.description)

Microlink returns page metadata (title, description, language, etc.) alongside screenshots. ScreenshotAPI focuses purely on visual capture and does not extract metadata. If you need both, call ScreenshotAPI for the image and use a lightweight metadata library like `metascraper` for page data.

## What You Can Simplify

**Remove the MQL SDK.** If you installed `@microlink/mql`, uninstall it. ScreenshotAPI works with native `fetch` or any HTTP client.

**Remove two-step response handling.** The pattern of parsing JSON, extracting a CDN URL, then fetching the image is replaced by a single request that returns image bytes directly.

**Remove nested parameter construction.** Microlink's dot-notation (`viewport.width`, `screenshot.fullPage`, `screenshot.overlay.background`) requires careful nesting. ScreenshotAPI's flat parameters (`width`, `fullPage`) are simpler to build dynamically.

**Remove CDN URL caching logic.** If you cached Microlink CDN URLs to avoid re-fetching, that entire layer is unnecessary. ScreenshotAPI returns the bytes, and you control how and where to cache them.

## Migration Checklist

1. **Create an account** at [screenshotapi.to](/) and purchase credits
2. **Store your API key** as `SCREENSHOT_API_KEY` in environment variables
3. **Uninstall the MQL SDK**: `npm uninstall @microlink/mql` or remove from requirements
4. **Update the endpoint** from `pro.microlink.io` (or `api.microlink.io`) to `screenshotapi.to/api/v1/screenshot`
5. **Move authentication** from `apiKey` query parameter to `x-api-key` header
6. **Remove `screenshot=true`** (always returns a screenshot)
7. **Flatten viewport params**: `viewport.width` to `width`, `viewport.height` to `height`
8. **Flatten screenshot params**: `screenshot.fullPage` to `fullPage`, `screenshot.type` to `type`
9. **Update response handling**: read image bytes directly from response body instead of extracting CDN URL from JSON
10. **Handle image storage**: if you relied on Microlink's CDN URLs, save bytes to your own storage (S3, R2, etc.)
11. **Remove overlay code** or implement client-side browser frames if needed
12. **Test side-by-side**: capture identical URLs and compare visual output
13. **Cancel Microlink Pro** once all screenshot functionality is migrated

## Next Steps

- Read the full [Microlink vs ScreenshotAPI comparison](/compare/screenshotapi-vs-microlink) for a detailed breakdown
- Browse the [API documentation](/docs) for the complete parameter reference
- Learn how to [build link previews](/blog/how-to-build-link-previews) with ScreenshotAPI
- See the [best screenshot APIs comparison](/compare/best-screenshot-api) to evaluate all available options
