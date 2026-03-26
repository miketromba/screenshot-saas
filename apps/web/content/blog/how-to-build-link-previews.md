---
title: "How to Build Link Previews with a Screenshot API"
description: "Build rich link preview cards with thumbnail images using a screenshot API. Working examples for React, Next.js, and backend services."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Blog
    href: /blog
  - label: How to Build Link Previews
faq:
  - question: "What is a link preview?"
    answer: "A link preview is a rich card showing a thumbnail image, title, and description for a URL. They appear in chat apps, social media feeds, content management systems, and link aggregation tools."
  - question: "How do I generate link preview thumbnails?"
    answer: "Use ScreenshotAPI to capture a screenshot of the target URL at a thumbnail size (e.g., 1200x630 or 800x600). Cache the result and display it alongside the page title and description."
  - question: "Should I generate link previews on the server or client?"
    answer: "Always on the server. Client-side screenshot capture cannot navigate to external URLs due to browser security restrictions. Use a server-side API call and cache the result."
  - question: "How do I handle slow-loading pages in link previews?"
    answer: "Use the waitUntil=networkidle parameter to wait for all network requests to complete, or waitForSelector to wait for a specific content element. Add a timeout to prevent hanging on unresponsive URLs."
relatedPages:
  - title: "Link Previews Use Case"
    description: "See how teams use screenshot APIs for link previews."
    href: "/use-cases/link-previews"
  - title: "How to Generate OG Images from URL"
    description: "Generate social sharing images from any URL."
    href: "/blog/how-to-generate-og-images-from-url"
  - title: "How to Add Website Thumbnails to Your App"
    description: "Display website thumbnails in directories and dashboards."
    href: "/blog/how-to-add-website-thumbnails-to-your-app"
  - title: "Next.js Integration"
    description: "Add link previews to your Next.js application."
    href: "/integrations/nextjs"
jsonLd:
  "@context": "https://schema.org"
  "@type": "Article"
  headline: "How to Build Link Previews with a Screenshot API"
  description: "Build rich link preview cards with thumbnail images using a screenshot API. Working examples for React, Next.js, and backend services."
  dateModified: "2026-03-25"
---

Link previews turn plain URLs into rich cards with thumbnail images, titles, and descriptions. Slack, Discord, Twitter, and Notion all use them. Building link previews for your own application requires capturing screenshots of URLs on demand. This guide shows how to build a link preview system using [ScreenshotAPI](/).

## Architecture Overview

A link preview system has three components:

1. **Screenshot capture**: Call ScreenshotAPI to generate a thumbnail image
2. **Metadata extraction**: Fetch the page's title and description from Open Graph tags
3. **Caching layer**: Store results to avoid re-capturing the same URL

## Step 1: Screenshot Capture Endpoint

### Node.js / Express

```javascript
import express from 'express';

const app = express();
const API_KEY = process.env.SCREENSHOT_API_KEY;

app.get('/api/preview/image', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'url is required' });

  const params = new URLSearchParams({
    url,
    width: '1200',
    height: '630',
    type: 'jpeg',
    quality: '80',
    waitUntil: 'networkidle'
  });

  const response = await fetch(
    `https://screenshotapi.to/api/v1/screenshot?${params}`,
    { headers: { 'x-api-key': API_KEY } }
  );

  if (!response.ok) {
    return res.status(502).json({ error: 'Failed to capture screenshot' });
  }

  res.set('Content-Type', 'image/jpeg');
  res.set('Cache-Control', 'public, max-age=604800');
  res.send(Buffer.from(await response.arrayBuffer()));
});

app.listen(3000);
```

## Step 2: Metadata Extraction

Fetch Open Graph metadata from the target page:

```javascript
import { JSDOM } from 'jsdom';

async function extractMetadata(url) {
  const response = await fetch(url, {
    headers: { 'User-Agent': 'LinkPreviewBot/1.0' }
  });
  const html = await response.text();
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const getMeta = (property) => {
    const el = doc.querySelector(`meta[property="${property}"], meta[name="${property}"]`);
    return el?.getAttribute('content') || null;
  };

  return {
    title: getMeta('og:title') || doc.querySelector('title')?.textContent || '',
    description: getMeta('og:description') || getMeta('description') || '',
    siteName: getMeta('og:site_name') || new URL(url).hostname,
    favicon: `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32`
  };
}
```

## Step 3: Combined Preview API

```javascript
app.get('/api/preview', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'url is required' });

  const [metadata, screenshotResponse] = await Promise.all([
    extractMetadata(url),
    fetch(
      `https://screenshotapi.to/api/v1/screenshot?${new URLSearchParams({
        url,
        width: '1200',
        height: '630',
        type: 'jpeg',
        quality: '80',
        waitUntil: 'networkidle'
      })}`,
      { headers: { 'x-api-key': API_KEY } }
    )
  ]);

  const imageBuffer = Buffer.from(await screenshotResponse.arrayBuffer());
  const imageBase64 = imageBuffer.toString('base64');

  res.set('Cache-Control', 'public, max-age=604800');
  res.json({
    url,
    title: metadata.title,
    description: metadata.description,
    siteName: metadata.siteName,
    favicon: metadata.favicon,
    image: `data:image/jpeg;base64,${imageBase64}`
  });
});
```

## Step 4: React Component

```tsx
import { useState, useEffect } from 'react';

interface LinkPreviewData {
  url: string;
  title: string;
  description: string;
  siteName: string;
  favicon: string;
  image: string;
}

function LinkPreview({ url }: { url: string }) {
  const [preview, setPreview] = useState<LinkPreviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/preview?url=${encodeURIComponent(url)}`)
      .then(res => res.json())
      .then(data => {
        setPreview(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [url]);

  if (loading) {
    return (
      <div className="animate-pulse rounded-lg border p-4">
        <div className="h-40 rounded bg-gray-200" />
        <div className="mt-3 h-4 w-3/4 rounded bg-gray-200" />
        <div className="mt-2 h-3 w-1/2 rounded bg-gray-200" />
      </div>
    );
  }

  if (!preview) return null;

  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block cursor-pointer overflow-hidden rounded-lg border transition-shadow hover:shadow-md"
    >
      <img
        src={preview.image}
        alt={preview.title}
        className="h-40 w-full object-cover"
      />
      <div className="p-4">
        <div className="flex items-center gap-2">
          <img src={preview.favicon} alt="" className="h-4 w-4" />
          <span className="text-xs text-gray-500">{preview.siteName}</span>
        </div>
        <h3 className="mt-1 font-semibold">{preview.title}</h3>
        <p className="mt-1 text-sm text-gray-600 line-clamp-2">{preview.description}</p>
      </div>
    </a>
  );
}
```

## Caching Strategy

Link previews should be cached aggressively. URLs rarely change their visual appearance:

### In-memory cache (simple)

```javascript
const cache = new Map();
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

async function getCachedPreview(url) {
  const cached = cache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const data = await generatePreview(url);
  cache.set(url, { data, timestamp: Date.now() });
  return data;
}
```

### Redis cache (production)

```javascript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);
const CACHE_TTL = 604800; // 7 days in seconds

async function getCachedPreview(url) {
  const cached = await redis.get(`preview:${url}`);
  if (cached) return JSON.parse(cached);

  const data = await generatePreview(url);
  await redis.set(`preview:${url}`, JSON.stringify(data), 'EX', CACHE_TTL);
  return data;
}
```

## Mobile-Optimized Thumbnails

For mobile displays, capture at a smaller size to reduce bandwidth:

```javascript
const params = new URLSearchParams({
  url: targetUrl,
  width: '800',
  height: '600',
  type: 'jpeg',
  quality: '75'
});
```

## Error Handling

Not all URLs will capture successfully. Handle failures gracefully:

```javascript
async function generatePreview(url) {
  try {
    const [metadata, screenshot] = await Promise.allSettled([
      extractMetadata(url),
      captureScreenshot(url)
    ]);

    return {
      url,
      title: metadata.status === 'fulfilled' ? metadata.value.title : new URL(url).hostname,
      description: metadata.status === 'fulfilled' ? metadata.value.description : '',
      image: screenshot.status === 'fulfilled' ? screenshot.value : null
    };
  } catch {
    return { url, title: new URL(url).hostname, description: '', image: null };
  }
}
```

## Next Steps

- Read the [link previews use case](/use-cases/link-previews) for architecture patterns
- Learn about [website thumbnails](/blog/how-to-add-website-thumbnails-to-your-app) for directory pages
- See the [Next.js integration](/integrations/nextjs) for server component examples
- Check [pricing](/pricing) for credit-based plans that fit your traffic
