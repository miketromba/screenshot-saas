---
title: "Link Preview Generator API"
description: "Generate rich link preview thumbnails for any URL. Perfect for chat apps, social platforms, and content aggregators."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Use Cases
    href: /use-cases
  - label: Link Previews
faq:
  - question: "What is a link preview?"
    answer: "A link preview is a visual card that appears when you paste a URL into a chat app, social platform, or content feed. It typically shows a thumbnail image, page title, and description. ScreenshotAPI generates the thumbnail by capturing an actual screenshot of the target URL."
  - question: "Why not just use Open Graph metadata for previews?"
    answer: "Many websites lack Open Graph tags, have outdated og:image values, or use placeholder images. A screenshot-based preview always shows the current visual state of the page, regardless of whether the site has proper metadata."
  - question: "How do I handle URLs that require authentication?"
    answer: "For public URLs, simply pass the URL to ScreenshotAPI. For authenticated pages, you would need to use a publicly accessible version of the page. ScreenshotAPI does not support passing cookies or login credentials."
  - question: "What dimensions work best for link preview thumbnails?"
    answer: "For chat apps and content feeds, 1200x630 is the standard. For smaller thumbnails in directory listings, 640x400 or 400x300 work well. ScreenshotAPI lets you specify exact width and height."
  - question: "Can I generate previews in bulk?"
    answer: "Yes. You can make concurrent API calls to generate multiple previews in parallel. For high-volume use cases, the Pro plan (10,000 credits) or Scale plan (50,000 credits) gives you the throughput you need."
relatedPages:
  - title: "OG Image Generation"
    description: "Generate dynamic Open Graph images for social sharing."
    href: "/use-cases/og-image-generation"
  - title: "Directory Thumbnails"
    description: "Generate thumbnail images for website directory listings."
    href: "/use-cases/directory-thumbnails"
  - title: "Best Screenshot API Comparison"
    description: "Compare the top screenshot APIs for your project."
    href: "/compare/best-screenshot-api"
jsonLd:
  "@context": "https://schema.org"
  "@type": "Article"
  headline: "Link Preview Generator API"
  description: "Generate rich link preview thumbnails for any URL. Perfect for chat apps, social platforms, and content aggregators."
  dateModified: "2026-03-25"
---

## The Problem with Link Previews

Every modern chat application, social platform, and content aggregator shows link previews when users share URLs. Slack, Discord, Teams, iMessage, and WhatsApp all fetch metadata and render a card with a thumbnail, title, and description. When those previews look good, links get clicked. When they are broken or missing, links get ignored.

Building a reliable **link preview generator** is harder than it looks. You need to fetch the target page, parse Open Graph tags, extract images, and handle edge cases. Many sites lack `og:image` tags entirely. Others have broken image URLs, oversized images that slow down rendering, or outdated thumbnails that no longer match the page content. JavaScript-rendered SPAs return empty metadata to simple HTTP fetchers.

The screenshot-based approach eliminates these problems. Instead of relying on metadata that may or may not exist, you capture what the page actually looks like, right now.

## How ScreenshotAPI Generates Link Previews

ScreenshotAPI renders the target URL in a full Chromium browser, waits for JavaScript execution and network activity to settle, then captures a pixel-perfect screenshot. This gives you a true visual preview of any URL, regardless of whether the site has Open Graph tags.

The workflow is simple:

1. User pastes a URL into your app.
2. Your backend calls ScreenshotAPI with that URL.
3. ScreenshotAPI returns a PNG, JPEG, or WebP image.
4. You display the image as the link preview thumbnail.
5. Cache the image so repeat views are instant.

### Why screenshots beat metadata parsing

- **Always accurate**: The screenshot shows the real page, not a stale or missing og:image.
- **SPA support**: JavaScript-heavy sites built with React, Vue, or Angular render fully before capture.
- **Consistent sizing**: You control the exact output dimensions. No more dealing with 50x50 favicons or 4000px banner images.
- **Universal**: Works on every URL, including pages that actively block metadata scrapers.

## Implementation Guide

### Basic Link Preview Generator

#### JavaScript

```javascript
const axios = require("axios");

async function generateLinkPreview(url) {
  const response = await axios.get("https://screenshotapi.to/api/v1/screenshot", {
    params: {
      url: url,
      width: 1200,
      height: 630,
      type: "jpeg",
      quality: 80,
      waitUntil: "networkidle",
    },
    headers: {
      "x-api-key": "sk_live_xxxxx",
    },
    responseType: "arraybuffer",
  });

  return {
    imageBuffer: response.data,
    contentType: "image/jpeg",
  };
}
```

#### Python

```python
import requests

def generate_link_preview(url: str) -> bytes:
    response = requests.get(
        "https://screenshotapi.to/api/v1/screenshot",
        params={
            "url": url,
            "width": 1200,
            "height": 630,
            "type": "jpeg",
            "quality": 80,
            "waitUntil": "networkidle",
        },
        headers={"x-api-key": "sk_live_xxxxx"},
    )
    response.raise_for_status()
    return response.content
```

### Link Preview Service with Caching

In production, you want to avoid re-generating previews for the same URL. Here is a complete service with Redis caching:

#### JavaScript (Express)

```javascript
const express = require("express");
const axios = require("axios");
const Redis = require("ioredis");
const crypto = require("crypto");

const app = express();
const redis = new Redis(process.env.REDIS_URL);

const CACHE_TTL = 60 * 60 * 24 * 7; // 7 days

function urlHash(url) {
  return crypto.createHash("sha256").update(url).digest("hex").slice(0, 16);
}

app.get("/api/preview", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "url parameter required" });

  const cacheKey = `preview:${urlHash(url)}`;
  const cached = await redis.getBuffer(cacheKey);

  if (cached) {
    res.set("Content-Type", "image/jpeg");
    res.set("Cache-Control", "public, max-age=86400");
    return res.send(cached);
  }

  const response = await axios.get("https://screenshotapi.to/api/v1/screenshot", {
    params: {
      url,
      width: 1200,
      height: 630,
      type: "jpeg",
      quality: 80,
      waitUntil: "networkidle",
    },
    headers: { "x-api-key": process.env.SCREENSHOT_API_KEY },
    responseType: "arraybuffer",
  });

  await redis.setex(cacheKey, CACHE_TTL, Buffer.from(response.data));

  res.set("Content-Type", "image/jpeg");
  res.set("Cache-Control", "public, max-age=86400");
  res.send(response.data);
});

app.listen(3000);
```

#### Python (FastAPI)

```python
import hashlib
import httpx
import redis.asyncio as redis
from fastapi import FastAPI, Query
from fastapi.responses import Response

app = FastAPI()
cache = redis.from_url("redis://localhost:6379")

CACHE_TTL = 60 * 60 * 24 * 7  # 7 days

def url_hash(url: str) -> str:
    return hashlib.sha256(url.encode()).hexdigest()[:16]

@app.get("/api/preview")
async def preview(url: str = Query(...)):
    cache_key = f"preview:{url_hash(url)}"
    cached = await cache.get(cache_key)

    if cached:
        return Response(content=cached, media_type="image/jpeg")

    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://screenshotapi.to/api/v1/screenshot",
            params={
                "url": url,
                "width": 1200,
                "height": 630,
                "type": "jpeg",
                "quality": 80,
                "waitUntil": "networkidle",
            },
            headers={"x-api-key": "sk_live_xxxxx"},
        )
        response.raise_for_status()

    await cache.setex(cache_key, CACHE_TTL, response.content)
    return Response(content=response.content, media_type="image/jpeg")
```

## Handling Edge Cases

### JavaScript-Heavy SPAs

Single-page applications built with React, Vue, or Angular often render content after the initial HTML loads. Use `waitUntil: "networkidle"` to ensure the page is fully rendered before capture:

```javascript
params: {
  url: targetUrl,
  waitUntil: "networkidle",
}
```

For pages with lazy-loaded content, add a `delay` parameter to wait an additional number of milliseconds after the page reports idle:

```javascript
params: {
  url: targetUrl,
  waitUntil: "networkidle",
  delay: 2000,
}
```

### Cookie Consent Banners

Many European sites display cookie consent overlays that obscure the actual content. You can use `waitForSelector` combined with `delay` to let the page settle, or use a specific viewport that pushes the banner below the fold.

### Dark Mode Pages

Some sites default to dark mode based on system preferences. Control this with the `colorScheme` parameter:

```javascript
params: {
  url: targetUrl,
  colorScheme: "light", // Force light mode for consistent previews
}
```

## Architecture for Scale

For applications generating thousands of link previews per day, here is a recommended architecture:

1. **Queue incoming URLs**: When a user pastes a URL, push it to a job queue (BullMQ, Celery, Sidekiq).
2. **Worker processes**: Workers dequeue URLs, check the cache, and call ScreenshotAPI for misses.
3. **CDN storage**: Upload generated images to S3/R2/GCS and serve through a CDN.
4. **Cache layer**: Store the CDN URL in Redis or your database so your app can reference it immediately.
5. **TTL refresh**: Set a reasonable TTL (7-30 days) and regenerate previews for actively shared links.

This pattern keeps your API responsive while handling burst traffic without exceeding rate limits.

## Pricing Estimate

Link preview volume depends on your application type:

| Scenario | URLs/Month | Credits Used | Recommended Plan |
|---|---|---|---|
| Internal tool / Slack bot | 100-500 | 100-500 | Starter (500 credits, $20) |
| Community forum | 500-2,000 | 500-2,000 | Growth (2,000 credits, $60) |
| Chat application | 2,000-10,000 | 2,000-10,000 | Pro (10,000 credits, $200) |
| Content aggregator | 10,000-50,000 | 10,000-50,000 | Scale (50,000 credits, $750) |

With proper caching, each unique URL only costs one credit. Repeated views of the same link preview are served from cache at zero cost. Credits never expire, so you only pay for what you use. See the [pricing page](/pricing) for details.

## Link Preview API Compared to Metadata Scraping

| Feature | Metadata Scraping | ScreenshotAPI |
|---|---|---|
| SPA support | Limited | Full |
| Missing og:image handling | Fallback to favicon | Full visual preview |
| Accuracy | Depends on site markup | Always current |
| Setup complexity | Medium (parser, fallbacks) | Low (one API call) |
| Infrastructure | Self-hosted scraper | Managed API |

For teams building chat apps or social platforms, a screenshot-based **link preview generator API** delivers consistent, visually rich previews that metadata scraping simply cannot match. For more on how ScreenshotAPI compares to building your own solution, see the [best screenshot API comparison](/compare/best-screenshot-api).

## Getting Started

1. [Sign up](https://screenshotapi.to) for 5 free credits.
2. Try the API with a sample URL using cURL or the [API playground](/docs).
3. Integrate the caching layer from the examples above.
4. Deploy and start serving beautiful link previews.

Read the [full API documentation](/docs) to explore all parameters and response formats.
