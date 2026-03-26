---
title: "Migrate from Urlbox to ScreenshotAPI"
description: "Switch from Urlbox to ScreenshotAPI with this migration guide. Parameter mapping, code changes, and pricing comparison for screenshot APIs."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Blog
    href: /blog
  - label: Migrate from Urlbox
faq:
  - question: "Why switch from Urlbox to ScreenshotAPI?"
    answer: "ScreenshotAPI offers credit-based pricing where credits never expire, compared to Urlbox's monthly subscriptions where unused renders are lost. For teams with variable screenshot volumes, this can reduce costs significantly."
  - question: "How different is the API surface?"
    answer: "Both are REST APIs that accept query parameters and return image responses. Most parameters map directly. The main difference is authentication: Urlbox uses query-string auth tokens or signed URLs, while ScreenshotAPI uses an x-api-key header."
  - question: "Do I need to change my code?"
    answer: "Yes, but minimally. You need to update the API endpoint URL, authentication method, and a few parameter names. The overall request/response pattern is the same."
  - question: "Does ScreenshotAPI support Urlbox's webhook feature?"
    answer: "ScreenshotAPI returns screenshots synchronously. For async workflows, you can implement your own queue with a background job that calls the API and stores the result."
relatedPages:
  - title: "ScreenshotAPI vs Urlbox"
    description: "Detailed feature and pricing comparison."
    href: "/compare/screenshotapi-vs-urlbox"
  - title: "Best Screenshot APIs"
    description: "Full comparison of screenshot API services."
    href: "/blog/best-screenshot-apis"
  - title: "API Documentation"
    description: "Complete ScreenshotAPI parameter reference."
    href: "/docs"
jsonLd:
  "@context": "https://schema.org"
  "@type": "Article"
  headline: "Migrate from Urlbox to ScreenshotAPI"
  description: "Switch from Urlbox to ScreenshotAPI with this migration guide. Parameter mapping, code changes, and pricing comparison for screenshot APIs."
  dateModified: "2026-03-25"
---

Urlbox is a solid screenshot API, but its monthly subscription model means you pay for capacity whether you use it or not. [ScreenshotAPI](/) uses credit-based pricing where credits never expire, making it more cost-effective for teams with variable workloads. This guide walks through the migration.

## Pricing Comparison

| Volume | Urlbox Cost | ScreenshotAPI Cost | Savings |
|---|---|---|---|
| 500/month | $19/month ($228/year) | $20 one-time | $208/year |
| 2,000/month | $39/month ($468/year) | $60 one-time | $408/year |
| 5,000/month | $99/month ($1,188/year) | $200 one-time | $988/year |
| 15,000/month | $99/month ($1,188/year) | $750 one-time | $438/year |

Note: ScreenshotAPI credits never expire. If your volume is consistent monthly, the savings compound over time.

## Parameter Mapping

| Urlbox | ScreenshotAPI | Notes |
|---|---|---|
| `url` | `url` | Same |
| `width` | `width` | Same |
| `height` | `height` | Same |
| `full_page=true` | `fullPage=true` | Camel case |
| `format=png` | `type=png` | Different param name |
| `quality=80` | `quality=80` | Same |
| `wait_until=networkidle` | `waitUntil=networkidle` | Camel case |
| `wait_for=.content` | `waitForSelector=.content` | Different param name |
| `delay=2000` | `delay=2000` | Same |
| `dark_mode=true` | `colorScheme=dark` | Different approach |
| `retina=true` | N/A | Use 2x width instead |
| `block_ads=true` | N/A | Not yet supported |
| `s3_path=...` | N/A | Store result yourself |

## Authentication Change

### Urlbox

```javascript
// Urlbox uses query-string API key or signed URLs
const url = `https://api.urlbox.io/v1/${API_KEY}/${TOKEN}/png?url=https://example.com`;
```

### ScreenshotAPI

```javascript
// ScreenshotAPI uses header-based auth
const response = await fetch(
  'https://screenshotapi.to/api/v1/screenshot?url=https://example.com&type=png',
  { headers: { 'x-api-key': 'sk_live_your_api_key' } }
);
```

## Before: Urlbox (JavaScript)

```javascript
const Urlbox = require('urlbox');
const urlbox = Urlbox(API_KEY, API_SECRET);

async function takeScreenshot(targetUrl) {
  const imgUrl = urlbox.buildUrl({
    url: targetUrl,
    width: 1440,
    height: 900,
    format: 'png',
    full_page: false,
    wait_until: 'networkidle',
    dark_mode: true,
  });

  const response = await fetch(imgUrl);
  return Buffer.from(await response.arrayBuffer());
}
```

## After: ScreenshotAPI (JavaScript)

```javascript
async function takeScreenshot(targetUrl) {
  const params = new URLSearchParams({
    url: targetUrl,
    width: '1440',
    height: '900',
    type: 'png',
    waitUntil: 'networkidle',
    colorScheme: 'dark',
  });

  const response = await fetch(
    `https://screenshotapi.to/api/v1/screenshot?${params}`,
    { headers: { 'x-api-key': process.env.SCREENSHOT_API_KEY } }
  );

  if (!response.ok) throw new Error(`Screenshot failed: ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}
```

## Before: Urlbox (Python)

```python
import requests

def take_screenshot(url):
    response = requests.get(
        f"https://api.urlbox.io/v1/{API_KEY}/{TOKEN}/png",
        params={
            "url": url,
            "width": 1440,
            "height": 900,
            "full_page": False,
            "wait_until": "networkidle",
        }
    )
    return response.content
```

## After: ScreenshotAPI (Python)

```python
import requests

def take_screenshot(url):
    response = requests.get(
        "https://screenshotapi.to/api/v1/screenshot",
        params={
            "url": url,
            "width": 1440,
            "height": 900,
            "type": "png",
            "waitUntil": "networkidle",
        },
        headers={"x-api-key": "sk_live_your_api_key"},
    )
    response.raise_for_status()
    return response.content
```

## Before: Urlbox (cURL)

```bash
curl "https://api.urlbox.io/v1/API_KEY/TOKEN/png?url=https://example.com&width=1440&height=900" \
  --output screenshot.png
```

## After: ScreenshotAPI (cURL)

```bash
curl -G "https://screenshotapi.to/api/v1/screenshot" \
  -d "url=https://example.com" \
  -d "width=1440" \
  -d "height=900" \
  -d "type=png" \
  -H "x-api-key: sk_live_your_api_key" \
  --output screenshot.png
```

## Handling Missing Features

### Retina/HiDPI (Urlbox: retina=true)

ScreenshotAPI does not have a retina parameter. Capture at 2x the display size instead:

```javascript
// For a 720x450 display, capture at 1440x900
const params = new URLSearchParams({
  url: 'https://example.com',
  width: '2880',  // 2x target
  height: '1800', // 2x target
  type: 'png'
});
```

### S3 Upload (Urlbox: s3_path)

Upload the result yourself after capture:

```javascript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const buffer = await takeScreenshot(url);
await s3.send(new PutObjectCommand({
  Bucket: 'my-screenshots',
  Key: `screenshots/${Date.now()}.png`,
  Body: buffer,
  ContentType: 'image/png'
}));
```

## Migration Steps

1. **Sign up** at [screenshotapi.to](/) and get your API key
2. **Update auth**: Switch from query-string tokens to `x-api-key` header
3. **Update parameters**: Rename `format` → `type`, `full_page` → `fullPage`, `wait_until` → `waitUntil`, `wait_for` → `waitForSelector`
4. **Update endpoint**: Change the base URL
5. **Test**: Compare screenshots visually
6. **Remove Urlbox SDK**: Uninstall the Urlbox package

## Next Steps

- Read the [Urlbox vs ScreenshotAPI comparison](/compare/screenshotapi-vs-urlbox) for a detailed feature matrix
- Browse the [API documentation](/docs) for all parameters
- Check [pricing](/pricing) for the right credit package
- See the [best screenshot APIs](/blog/best-screenshot-apis) for a broader comparison
