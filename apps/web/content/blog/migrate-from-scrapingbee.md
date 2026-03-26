---
title: "Migrate from ScrapingBee to ScreenshotAPI"
description: "Switch from ScrapingBee's screenshot feature to ScreenshotAPI. Purpose-built screenshot API with simpler parameters and credit-based pricing."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Blog
    href: /blog
  - label: Migrate from ScrapingBee
faq:
  - question: "Why switch from ScrapingBee to ScreenshotAPI for screenshots?"
    answer: "ScrapingBee is a web scraping tool with screenshots as a secondary feature. ScreenshotAPI is purpose-built for screenshots, with dedicated parameters like colorScheme, waitForSelector, and fullPage. You also avoid paying for scraping features you do not use."
  - question: "How many ScrapingBee credits does a screenshot cost?"
    answer: "ScrapingBee charges 5 credits per request by default (with JavaScript rendering enabled, which screenshots require). On the $49/month Freelance plan with 250,000 credits, that is 50,000 screenshots per month. ScreenshotAPI charges 1 credit per screenshot with no multipliers."
  - question: "Does ScreenshotAPI support ScrapingBee's scraping features?"
    answer: "No. ScreenshotAPI is focused entirely on screenshots. If you need both scraping and screenshots, you can use ScrapingBee for scraping and ScreenshotAPI for screenshots. Many teams find this split actually costs less than using ScrapingBee for both."
  - question: "Can I still use proxies and geolocation with ScreenshotAPI?"
    answer: "ScreenshotAPI does not include built-in proxy rotation or geolocation like ScrapingBee. For most screenshot use cases, proxies are unnecessary since you are capturing visual content rather than scraping data behind anti-bot protections."
relatedPages:
  - title: "ScreenshotAPI vs ScrapingBee"
    description: "Detailed feature and pricing comparison."
    href: "/compare/screenshotapi-vs-scrapingbee"
  - title: "Best Screenshot APIs"
    description: "Full comparison of screenshot API services."
    href: "/blog/best-screenshot-apis"
  - title: "API Documentation"
    description: "Complete ScreenshotAPI parameter reference."
    href: "/docs"
jsonLd:
  "@context": "https://schema.org"
  "@type": "Article"
  headline: "Migrate from ScrapingBee to ScreenshotAPI"
  description: "Switch from ScrapingBee's screenshot feature to ScreenshotAPI. Purpose-built screenshot API with simpler parameters and credit-based pricing."
  dateModified: "2026-03-25"
---

ScrapingBee is a powerful web scraping API that includes a screenshot feature. But if screenshots are your primary use case, you are paying for a scraping engine you do not need. The `screenshot=true` parameter is bolted onto a scraping API, which means you inherit scraping-specific complexity like credit multipliers, JavaScript rendering toggles, and proxy rotation config just to capture an image.

[ScreenshotAPI](/) is purpose-built for screenshots. Every parameter exists to control how a page renders and how the image is captured. There is no scraping layer, no credit multiplier, and no proxy overhead. This guide walks through the migration from ScrapingBee's screenshot feature to ScreenshotAPI.

## Why a Purpose-Built Screenshot API

ScrapingBee is excellent at what it was designed for: scraping data from websites while bypassing bot detection. Screenshots are an afterthought in that architecture, and it shows in several ways.

**Credit multipliers eat your budget.** ScrapingBee charges 5 credits per request when JavaScript rendering is enabled, which is required for screenshots. On the Freelance plan ($49/month, 250,000 credits), that gives you 50,000 screenshots. With ScreenshotAPI, 1 credit equals 1 screenshot with no multipliers.

**Scraping parameters add noise.** When using ScrapingBee for screenshots, you have to navigate parameters meant for data extraction: `render_js`, `premium_proxy`, `stealth_proxy`, `block_resources`, `json_response`. None of these matter for screenshots. ScreenshotAPI's parameter set is focused entirely on visual capture.

**Response handling is more complex.** ScrapingBee returns screenshot data as base64-encoded content that you need to decode. ScreenshotAPI returns the image binary directly with the correct `Content-Type` header, ready to save or stream.

## Pricing Comparison

ScrapingBee pricing is based on monthly credit subscriptions where screenshot requests cost 5 credits each (with required JavaScript rendering). ScreenshotAPI credits are one-time purchases that never expire, with 1 credit per screenshot.

| Effective Screenshots/Month | ScrapingBee Cost | ScreenshotAPI Cost | Annual Savings |
|---|---|---|---|
| 1,000/month | $49/month ($588/year) | $20 one-time | $568/year |
| 10,000/month | $49/month ($588/year) | $200 one-time | $388/year |
| 50,000/month | $49/month ($588/year) | $750 one-time | Significant |
| 100,000/month | $99/month ($1,188/year) | $1,500 one-time | Significant |
| 500,000/month | $599/month ($7,188/year) | Varies | Significant |

ScrapingBee's Freelance plan at $49/month includes 250,000 credits, which equals 50,000 screenshots at 5 credits each. If you only use ScrapingBee for screenshots, you are paying for scraping infrastructure you never touch. Check the [pricing page](/pricing) for current ScreenshotAPI packages.

## Parameter Mapping

ScrapingBee's screenshot parameters map to ScreenshotAPI as follows. Notice how many ScrapingBee parameters become unnecessary.

| ScrapingBee | ScreenshotAPI | Notes |
|---|---|---|
| `api_key=KEY` | `x-api-key: KEY` (header) | Moved to header |
| `url` | `url` | Same |
| `screenshot=true` | N/A | Always returns screenshot |
| `screenshot_full_page=true` | `fullPage=true` | Simplified name |
| `screenshot_selector=.el` | `waitForSelector=.el` | Different purpose but similar utility |
| `window_width=1440` | `width=1440` | Simplified name |
| `window_height=900` | `height=900` | Simplified name |
| `render_js=true` | N/A | Always renders JavaScript |
| `wait=5000` | `delay=5000` | Renamed |
| `wait_for=.selector` | `waitForSelector=.selector` | Camel case |
| `premium_proxy=true` | N/A | Not needed for screenshots |
| `stealth_proxy=true` | N/A | Not needed for screenshots |
| `country_code=us` | N/A | Not needed for screenshots |
| `block_resources=false` | N/A | Loads all resources by default |
| `json_response=true` | N/A | Returns image binary directly |
| N/A | `type=png` | Output format (png, jpeg, webp) |
| N/A | `quality=80` | JPEG/WebP quality control |
| N/A | `colorScheme=dark` | Dark mode capture |
| N/A | `waitUntil=networkidle` | Page load strategy |

## Authentication Change

ScrapingBee uses a query-string `api_key`. ScreenshotAPI uses an `x-api-key` HTTP header.

### ScrapingBee

```javascript
// API key in query string
const url = `https://app.scrapingbee.com/api/v1/?api_key=${API_KEY}&url=https://example.com&screenshot=true`;
const response = await fetch(url);
// Response body is base64 or binary depending on config
```

### ScreenshotAPI

```javascript
// API key in header, image returned directly
const response = await fetch(
  'https://screenshotapi.to/api/v1/screenshot?url=https://example.com&type=png',
  { headers: { 'x-api-key': 'sk_live_your_api_key' } }
);
// Response body is image binary with correct Content-Type
```

## Before and After: JavaScript

### ScrapingBee (Before)

```javascript
async function takeScreenshot(targetUrl) {
  const params = new URLSearchParams({
    api_key: process.env.SCRAPINGBEE_API_KEY,
    url: targetUrl,
    screenshot: 'true',
    window_width: '1440',
    window_height: '900',
    render_js: 'true',
    wait: '2000',
    wait_for: '.main-content',
    block_resources: 'false',
  });

  const response = await fetch(
    `https://app.scrapingbee.com/api/v1/?${params}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`ScrapingBee error: ${error.message}`);
  }

  // ScrapingBee returns screenshot data that needs processing
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

Seven parameters reduced to six. No `screenshot=true` toggle, no `render_js`, no `block_resources`. The API does one thing, and every parameter relates to that thing.

## Before and After: Python

### ScrapingBee (Before)

```python
import requests

def take_screenshot(url):
    response = requests.get(
        "https://app.scrapingbee.com/api/v1/",
        params={
            "api_key": SCRAPINGBEE_API_KEY,
            "url": url,
            "screenshot": True,
            "screenshot_full_page": True,
            "window_width": 1440,
            "window_height": 900,
            "render_js": True,
            "wait": 2000,
        },
    )
    response.raise_for_status()
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
            "fullPage": "true",
            "delay": 2000,
        },
        headers={"x-api-key": os.environ["SCREENSHOT_API_KEY"]},
    )
    response.raise_for_status()
    return response.content
```

For more language-specific examples, see the [Python guide](/blog/how-to-take-screenshots-with-python) and [JavaScript guide](/blog/how-to-take-screenshots-with-javascript).

## Before and After: cURL

### ScrapingBee (Before)

```bash
curl "https://app.scrapingbee.com/api/v1/?api_key=YOUR_KEY&url=https://example.com&screenshot=true&window_width=1440&window_height=900&render_js=true" \
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

## What You Can Remove

Switching from ScrapingBee to a dedicated screenshot API means you can strip out a lot of scraping-related code.

**Remove JavaScript rendering toggles.** ScrapingBee defaults to `render_js=false` to save credits on simple scraping jobs. For screenshots, you always need JavaScript rendering, so you have to explicitly set `render_js=true` on every request. ScreenshotAPI always renders JavaScript because screenshots require it. One less parameter to manage and one less thing to forget.

**Remove proxy configuration.** ScrapingBee's `premium_proxy`, `stealth_proxy`, and `country_code` parameters exist to bypass anti-bot detection when scraping data. Screenshot capture rarely triggers bot detection since you are loading a page visually, not extracting structured data. These parameters just add cost (10-75 credits per request with premium proxies) without benefit for screenshot workloads.

**Remove credit calculation logic.** If you built monitoring or alerting around ScrapingBee's credit multiplier system (5x for JS rendering, 10-75x for premium proxies), you can remove all of it. ScreenshotAPI charges 1 credit per screenshot regardless of parameters used.

**Remove base64 decoding.** Depending on your ScrapingBee configuration, screenshot responses may come back as base64-encoded strings that need decoding before saving. ScreenshotAPI returns raw image bytes with the correct `Content-Type` header, so you can pipe the response directly to a file or S3 upload.

## Features You Gain

Moving to ScreenshotAPI gives you screenshot-specific capabilities that ScrapingBee does not offer:

**Dark mode captures.** The `colorScheme=dark` parameter tells the browser to use `prefers-color-scheme: dark`, rendering pages in dark mode natively. With ScrapingBee, you would need to inject custom JavaScript to emulate this. See the [dark mode screenshot guide](/blog/how-to-capture-dark-mode-screenshots) for details.

**Output format control.** ScreenshotAPI supports `type=png`, `type=jpeg`, and `type=webp` with configurable `quality` for lossy formats. ScrapingBee's screenshot feature returns PNG only without format options.

**Page load strategies.** The `waitUntil` parameter supports `networkidle`, `domcontentloaded`, and `load` strategies, giving you precise control over when the screenshot fires. This is more reliable than ScrapingBee's `wait` parameter (a fixed delay) for pages with variable load times.

## When to Keep ScrapingBee

If you use ScrapingBee for both data scraping and screenshots, you do not need to migrate everything. Consider running both services in parallel:

- **ScrapingBee** for data extraction, HTML scraping, and structured data collection where proxy rotation and bot bypass matter
- **ScreenshotAPI** for visual captures, [OG image generation](/blog/how-to-generate-og-images-from-url), [link previews](/blog/how-to-build-link-previews), and [visual regression testing](/blog/how-to-build-visual-regression-testing-pipeline)

This split often costs less than using ScrapingBee for both, since you are not burning 5 credits per screenshot request on a scraping platform.

## Migration Checklist

1. **Create an account** at [screenshotapi.to](/) and purchase credits
2. **Store your API key** as `SCREENSHOT_API_KEY` in environment variables
3. **Update the endpoint** from `app.scrapingbee.com/api/v1/` to `screenshotapi.to/api/v1/screenshot`
4. **Move authentication** from `api_key` query parameter to `x-api-key` header
5. **Remove `screenshot=true`** (no longer needed, the API only does screenshots)
6. **Remove `render_js=true`** (always renders JavaScript)
7. **Rename viewport params**: `window_width` to `width`, `window_height` to `height`
8. **Rename `screenshot_full_page`** to `fullPage`
9. **Rename `wait`** to `delay`
10. **Add `type=png`** (or jpeg/webp) to specify output format
11. **Remove proxy parameters** (`premium_proxy`, `stealth_proxy`, `country_code`)
12. **Remove base64 decoding** if applicable, response is now raw image binary
13. **Update credit monitoring** to remove multiplier logic
14. **Test side-by-side**: capture the same URLs and compare output quality
15. **Downgrade or cancel ScrapingBee** if screenshots were your only use case

## Next Steps

- Read the full [ScrapingBee vs ScreenshotAPI comparison](/compare/screenshotapi-vs-scrapingbee) for a detailed breakdown
- Browse the [API documentation](/docs) for the complete parameter reference
- Explore [screenshot use cases](/use-cases/link-previews) to see what else you can build
- Check the [best screenshot APIs comparison](/compare/best-screenshot-api) to understand the full landscape
