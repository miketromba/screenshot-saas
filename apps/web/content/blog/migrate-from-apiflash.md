---
title: "Migrate from ApiFlash to ScreenshotAPI"
description: "Step-by-step guide to switch from ApiFlash to ScreenshotAPI. Parameter mapping, code examples, and pricing comparison included."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Blog
    href: /blog
  - label: Migrate from ApiFlash
faq:
  - question: "Is ScreenshotAPI a drop-in replacement for ApiFlash?"
    answer: "Almost. Both APIs accept query parameters and return image data directly. You need to swap the endpoint URL, change from access_key to x-api-key header auth, and rename a few parameters. The overall request/response flow stays the same."
  - question: "How does pricing compare between ApiFlash and ScreenshotAPI?"
    answer: "ApiFlash charges monthly subscriptions starting at $7/month for 1,000 screenshots, with unused screenshots lost at month end. ScreenshotAPI uses one-time credit purchases that never expire, so you only pay for what you use."
  - question: "Does ScreenshotAPI support ApiFlash's fresh parameter?"
    answer: "ScreenshotAPI always captures a fresh screenshot on every request. There is no caching layer to bypass, so the fresh parameter is unnecessary."
  - question: "Can I still get JSON responses instead of image data?"
    answer: "ScreenshotAPI returns image binary directly, which is the default behavior in ApiFlash. If you need to store the image and reference it by URL, save the binary to your own storage (S3, R2, etc.) and use that URL."
relatedPages:
  - title: "ScreenshotAPI vs ApiFlash"
    description: "Detailed feature and pricing comparison."
    href: "/compare/screenshotapi-vs-apiflash"
  - title: "Best Screenshot APIs"
    description: "Full comparison of screenshot API services."
    href: "/blog/best-screenshot-apis"
  - title: "API Documentation"
    description: "Complete ScreenshotAPI parameter reference."
    href: "/docs"
jsonLd:
  "@context": "https://schema.org"
  "@type": "Article"
  headline: "Migrate from ApiFlash to ScreenshotAPI"
  description: "Step-by-step guide to switch from ApiFlash to ScreenshotAPI. Parameter mapping, code examples, and pricing comparison included."
  dateModified: "2026-03-25"
---

ApiFlash is a well-known screenshot API built on Chrome and AWS Lambda. It gets the job done, but its monthly subscription model means you lose unused screenshots at the end of every billing cycle. [ScreenshotAPI](/) uses credit-based pricing where credits never expire, giving you predictable costs without the pressure to use-it-or-lose-it. This guide covers everything you need to switch.

## Why Switch from ApiFlash

ApiFlash subscriptions range from $7/month to $180/month, and every plan resets at month end. If you buy the Medium plan at $35/month for 10,000 screenshots and only use 3,000, the remaining 7,000 vanish. Over a year, that waste adds up.

ScreenshotAPI flips this model. You buy credits once, use them whenever you want, and they never expire. For teams with seasonal traffic, side projects, or variable workloads, this approach saves real money.

Beyond pricing, ScreenshotAPI offers a simpler developer experience. Authentication uses a standard `x-api-key` header instead of a query-string access key, which keeps credentials out of server logs and browser history. The parameter naming follows camelCase conventions, making it feel native in JavaScript codebases.

## Pricing Comparison

ApiFlash bills monthly with unused screenshots expiring. ScreenshotAPI credits are one-time purchases that never expire.

| Monthly Volume | ApiFlash Cost | ScreenshotAPI Cost | Annual Savings |
|---|---|---|---|
| 100/month | Free | $5 one-time | N/A |
| 1,000/month | $7/month ($84/year) | $20 one-time | $64/year |
| 5,000/month | $35/month ($420/year) | $100 one-time | $320/year |
| 10,000/month | $35/month ($420/year) | $200 one-time | $220/year |
| 50,000/month | $180/month ($2,160/year) | $750 one-time | $1,410/year |

ScreenshotAPI credits carry forward indefinitely. If you buy 10,000 credits and only use 2,000 in the first month, the remaining 8,000 are still there next month. Check the [pricing page](/pricing) for current credit packages.

## Parameter Mapping

Most ApiFlash parameters have direct equivalents in ScreenshotAPI. The table below maps every common parameter.

| ApiFlash | ScreenshotAPI | Notes |
|---|---|---|
| `access_key=KEY` | `x-api-key: KEY` (header) | Moved from query string to header |
| `url` | `url` | Same |
| `width` | `width` | Same (default viewport width) |
| `height` | `height` | Same (default viewport height) |
| `full_page=true` | `fullPage=true` | Camel case |
| `format=png` | `type=png` | Renamed; supports png, jpeg, webp |
| `quality=80` | `quality=80` | Same (jpeg/webp only) |
| `delay=3` | `delay=3000` | ScreenshotAPI uses milliseconds |
| `wait_until=network_idle` | `waitUntil=networkidle` | Camel case, slightly different value |
| `wait_for=.selector` | `waitForSelector=.selector` | Renamed |
| `fresh=true` | N/A | Always fresh, no caching |
| `response_type=json` | N/A | Returns binary image directly |
| `element=.hero` | N/A | Use `waitForSelector` + crop client-side |
| `no_ads=true` | N/A | Not yet supported |
| `cookies=...` | N/A | Not yet supported |
| N/A | `colorScheme=dark` | Dark mode capture (not in ApiFlash) |

## Authentication Change

This is the biggest structural difference. ApiFlash passes credentials in the query string. ScreenshotAPI uses an HTTP header.

### ApiFlash

```javascript
// Credential exposed in URL — visible in logs and history
const url = `https://api.apiflash.com/v1/urltoimage?access_key=${ACCESS_KEY}&url=https://example.com`;
const response = await fetch(url);
```

### ScreenshotAPI

```javascript
// Credential in header — not logged in URLs
const response = await fetch(
  'https://screenshotapi.to/api/v1/screenshot?url=https://example.com&type=png',
  { headers: { 'x-api-key': 'sk_live_your_api_key' } }
);
```

Header-based auth is more secure. Query-string keys end up in access logs, CDN logs, and browser history. Headers stay out of all three.

## Before and After: JavaScript

### ApiFlash (Before)

```javascript
async function takeScreenshot(targetUrl) {
  const params = new URLSearchParams({
    access_key: process.env.APIFLASH_KEY,
    url: targetUrl,
    width: '1440',
    height: '900',
    format: 'png',
    full_page: 'false',
    delay: '2',
    wait_for: '.main-content',
    fresh: 'true',
  });

  const response = await fetch(
    `https://api.apiflash.com/v1/urltoimage?${params}`
  );
  return Buffer.from(await response.arrayBuffer());
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
    delay: '2000',
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

Key changes: `access_key` removed from params, `format` renamed to `type`, `full_page` renamed to `fullPage`, `delay` converted from seconds to milliseconds, `wait_for` renamed to `waitForSelector`, `fresh` removed (always fresh), and auth moved to header.

## Before and After: Python

### ApiFlash (Before)

```python
import requests

def take_screenshot(url):
    response = requests.get(
        "https://api.apiflash.com/v1/urltoimage",
        params={
            "access_key": APIFLASH_KEY,
            "url": url,
            "width": 1440,
            "height": 900,
            "format": "png",
            "full_page": False,
            "delay": 2,
            "wait_for": ".main-content",
            "fresh": True,
        },
    )
    return response.content
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
            "delay": 2000,
            "waitForSelector": ".main-content",
        },
        headers={"x-api-key": os.environ["SCREENSHOT_API_KEY"]},
    )
    response.raise_for_status()
    return response.content
```

For more language-specific examples, see the [JavaScript guide](/blog/how-to-take-screenshots-with-javascript) and [Python guide](/blog/how-to-take-screenshots-with-python).

## Before and After: cURL

### ApiFlash (Before)

```bash
curl "https://api.apiflash.com/v1/urltoimage?access_key=YOUR_KEY&url=https://example.com&width=1440&height=900&format=png&fresh=true" \
  --output screenshot.png
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

## What You Can Simplify

Switching to ScreenshotAPI lets you remove code that deals with ApiFlash-specific concerns:

**No more cache management.** ApiFlash's `fresh` parameter exists because their API caches screenshots by default. ScreenshotAPI captures a new screenshot on every call, so you never need to worry about stale results or cache invalidation logic.

**No more response type toggling.** ApiFlash's `response_type=json` mode returns a JSON wrapper with a URL pointing to the screenshot. ScreenshotAPI always returns the image bytes directly, simplifying your response handling.

**No more query-string credential scrubbing.** If you had middleware to strip `access_key` from logs or analytics, you can remove it. Header-based auth keeps credentials out of URLs entirely.

## Handling Missing Features

### Element Capture (ApiFlash: element)

ApiFlash can capture a specific DOM element via CSS selector. ScreenshotAPI does not support element-level capture yet. As a workaround, capture the full page and crop on the client:

```javascript
import sharp from 'sharp';

async function captureElement(targetUrl, selector) {
  const params = new URLSearchParams({
    url: targetUrl,
    fullPage: 'true',
    type: 'png',
  });

  const response = await fetch(
    `https://screenshotapi.to/api/v1/screenshot?${params}`,
    { headers: { 'x-api-key': process.env.SCREENSHOT_API_KEY } }
  );

  const buffer = Buffer.from(await response.arrayBuffer());
  // Crop to desired region using sharp
  return sharp(buffer).extract({ left: 0, top: 200, width: 800, height: 400 }).toBuffer();
}
```

### Ad Blocking (ApiFlash: no_ads)

ScreenshotAPI does not include built-in ad blocking. If this is critical for your workflow, consider using a [proxy-based ad blocker](/docs) upstream or injecting CSS to hide ad containers via custom scripts.

## Migration Checklist

1. **Create an account** at [screenshotapi.to](/) and purchase credits
2. **Store your API key** in environment variables as `SCREENSHOT_API_KEY`
3. **Update the endpoint URL** from `api.apiflash.com/v1/urltoimage` to `screenshotapi.to/api/v1/screenshot`
4. **Move authentication** from query-string `access_key` to `x-api-key` header
5. **Rename parameters**: `format` to `type`, `full_page` to `fullPage`, `wait_for` to `waitForSelector`, `wait_until` to `waitUntil`
6. **Convert delay values** from seconds to milliseconds
7. **Remove `fresh` parameter** (no longer needed)
8. **Remove `response_type` handling** if you used the JSON response mode
9. **Test side-by-side**: capture the same URLs with both APIs and compare results visually
10. **Decommission ApiFlash** once you have verified all screenshots render correctly

## Next Steps

- Read the full [ApiFlash vs ScreenshotAPI comparison](/compare/screenshotapi-vs-apiflash) for a feature-by-feature breakdown
- Browse the [API documentation](/docs) for the complete parameter reference
- See [how to automate website screenshots](/blog/how-to-automate-website-screenshots) for batch capture patterns
- Check the [best screenshot APIs comparison](/compare/best-screenshot-api) to see how other services stack up
