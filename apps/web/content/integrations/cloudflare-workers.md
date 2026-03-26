---
title: "Cloudflare Workers Screenshot API Integration"
description: "Capture website screenshots with Cloudflare Workers and ScreenshotAPI. Edge-first examples with KV caching, R2 storage, and Wrangler config."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Integrations
    href: /integrations
  - label: Cloudflare Workers
faq:
  - question: "Why use ScreenshotAPI instead of Cloudflare Browser Rendering?"
    answer: "Cloudflare Browser Rendering requires managing Puppeteer scripts, handling browser sessions, and paying for browser compute time. ScreenshotAPI gives you a single HTTP call with no session management."
  - question: "Can I cache screenshots in Cloudflare KV?"
    answer: "Yes. Store the image bytes in KV with an expiration time. Check KV before calling ScreenshotAPI to avoid redundant captures."
  - question: "Does ScreenshotAPI work within Workers' CPU time limits?"
    answer: "Yes. The API call is I/O time (network wait), not CPU time. Workers allow up to 30 seconds of wall clock time on paid plans, which is plenty for a screenshot request."
  - question: "Can I store screenshots in R2?"
    answer: "Yes. Fetch the image from ScreenshotAPI and upload it to an R2 bucket. Serve the stored images through a custom domain or Workers route for CDN-cached delivery."
relatedPages:
  - title: "Vercel Integration"
    description: "Serverless screenshots on Vercel's platform"
    href: "/integrations/vercel"
  - title: "AWS Lambda Integration"
    description: "Serverless screenshot capture with Lambda"
    href: "/integrations/aws-lambda"
  - title: "GitHub Actions Integration"
    description: "Automated screenshots in CI/CD pipelines"
    href: "/integrations/github-actions"
  - title: "JavaScript SDK"
    description: "Full reference for the ScreenshotAPI JavaScript SDK"
    href: "/docs/sdks/javascript"
jsonLd:
  "@context": "https://schema.org"
  "@type": "TechArticle"
  headline: "Cloudflare Workers Screenshot API Integration"
  description: "Capture website screenshots with Cloudflare Workers and ScreenshotAPI. Edge-first examples with KV caching and R2 storage."
  dateModified: "2026-03-25"
---

## Capture Screenshots at the Edge with Cloudflare Workers and ScreenshotAPI

Cloudflare Workers run JavaScript at the edge in over 300 data centers worldwide. While Cloudflare offers its own Browser Rendering API, it requires managing Puppeteer scripts, handling browser session lifecycle, and paying for browser rendering compute. For straightforward screenshot capture, that is more infrastructure than most use cases need.

A **Cloudflare Workers screenshot** integration with ScreenshotAPI takes a simpler approach: your Worker makes one fetch call and gets back image bytes. No browser sessions, no Puppeteer scripts, no rendering compute charges.

## Quick Start

1. [Sign up for ScreenshotAPI](https://screenshotapi.to) and get your API key. **5 free credits** are included.
2. Create a new Workers project with Wrangler.
3. Add your API key as a secret.
4. Deploy a Worker that proxies screenshot requests.

## Installation

Create a new Workers project:

```bash
npm create cloudflare@latest screenshot-worker
cd screenshot-worker
```

Add the API key as a secret:

```bash
npx wrangler secret put SCREENSHOTAPI_KEY
```

## Basic Example

A Worker that returns screenshots based on query parameters:

```typescript
// src/index.ts
interface Env {
  SCREENSHOTAPI_KEY: string
}

const API_BASE = 'https://screenshotapi.to/api/v1/screenshot'

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
      return Response.json({ error: 'url parameter is required' }, { status: 400 })
    }

    const params = new URLSearchParams({
      url,
      width: searchParams.get('width') ?? '1440',
      height: searchParams.get('height') ?? '900',
      type: searchParams.get('type') ?? 'webp',
      quality: searchParams.get('quality') ?? '80',
    })

    const response = await fetch(`${API_BASE}?${params}`, {
      headers: { 'x-api-key': env.SCREENSHOTAPI_KEY },
    })

    if (!response.ok) {
      return Response.json({ error: 'Capture failed' }, { status: 502 })
    }

    const type = searchParams.get('type') ?? 'webp'

    return new Response(response.body, {
      headers: {
        'Content-Type': `image/${type}`,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    })
  },
}
```

Deploy it:

```bash
npx wrangler deploy
```

## KV Caching

Cache screenshots in Cloudflare KV to avoid redundant API calls:

```typescript
interface Env {
  SCREENSHOTAPI_KEY: string
  SCREENSHOTS: KVNamespace
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) {
      return Response.json({ error: 'url is required' }, { status: 400 })
    }

    const width = searchParams.get('width') ?? '1440'
    const height = searchParams.get('height') ?? '900'
    const type = searchParams.get('type') ?? 'webp'

    const cacheKey = `${url}:${width}:${height}:${type}`

    const cached = await env.SCREENSHOTS.get(cacheKey, 'arrayBuffer')
    if (cached) {
      return new Response(cached, {
        headers: {
          'Content-Type': `image/${type}`,
          'Cache-Control': 'public, max-age=86400',
          'X-Cache': 'HIT',
        },
      })
    }

    const params = new URLSearchParams({ url, width, height, type, quality: '80' })

    const response = await fetch(
      `https://screenshotapi.to/api/v1/screenshot?${params}`,
      { headers: { 'x-api-key': env.SCREENSHOTAPI_KEY } }
    )

    if (!response.ok) {
      return Response.json({ error: 'Capture failed' }, { status: 502 })
    }

    const imageBuffer = await response.arrayBuffer()

    await env.SCREENSHOTS.put(cacheKey, imageBuffer, {
      expirationTtl: 3600,
    })

    return new Response(imageBuffer, {
      headers: {
        'Content-Type': `image/${type}`,
        'Cache-Control': 'public, max-age=86400',
        'X-Cache': 'MISS',
      },
    })
  },
}
```

Add the KV namespace to `wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "SCREENSHOTS"
id = "your-kv-namespace-id"
```

## R2 Storage

Store screenshots in Cloudflare R2 for persistent, cost-effective storage:

```typescript
interface Env {
  SCREENSHOTAPI_KEY: string
  SCREENSHOT_BUCKET: R2Bucket
}

async function captureAndStore(
  env: Env,
  url: string,
  options: { width?: string; height?: string; type?: string } = {}
): Promise<{ key: string; size: number }> {
  const type = options.type ?? 'webp'
  const params = new URLSearchParams({
    url,
    width: options.width ?? '1440',
    height: options.height ?? '900',
    type,
    quality: '80',
    waitUntil: 'networkidle',
  })

  const response = await fetch(
    `https://screenshotapi.to/api/v1/screenshot?${params}`,
    { headers: { 'x-api-key': env.SCREENSHOTAPI_KEY } }
  )

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`)
  }

  const imageBuffer = await response.arrayBuffer()
  const hash = await crypto.subtle
    .digest('SHA-256', new TextEncoder().encode(url))
    .then((buf) =>
      Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('')
        .slice(0, 12)
    )

  const key = `screenshots/${hash}.${type}`

  await env.SCREENSHOT_BUCKET.put(key, imageBuffer, {
    httpMetadata: {
      contentType: `image/${type}`,
      cacheControl: 'public, max-age=604800',
    },
  })

  return { key, size: imageBuffer.byteLength }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { searchParams, pathname } = new URL(request.url)

    if (pathname === '/capture') {
      const url = searchParams.get('url')
      if (!url) return Response.json({ error: 'url is required' }, { status: 400 })

      try {
        const result = await captureAndStore(env, url)
        return Response.json(result)
      } catch (error) {
        return Response.json({ error: 'Capture failed' }, { status: 502 })
      }
    }

    if (pathname.startsWith('/screenshots/')) {
      const object = await env.SCREENSHOT_BUCKET.get(pathname.slice(1))
      if (!object) return new Response('Not found', { status: 404 })

      return new Response(object.body, {
        headers: {
          'Content-Type': object.httpMetadata?.contentType ?? 'image/webp',
          'Cache-Control': 'public, max-age=604800',
        },
      })
    }

    return new Response('Not found', { status: 404 })
  },
}
```

Add R2 to `wrangler.toml`:

```toml
[[r2_buckets]]
binding = "SCREENSHOT_BUCKET"
bucket_name = "screenshot-storage"
```

## Scheduled Screenshots with Cron Triggers

Capture screenshots on a schedule:

```typescript
export default {
  async scheduled(event: ScheduledEvent, env: Env): Promise<void> {
    const urls = [
      'https://example.com',
      'https://another-site.com',
    ]

    await Promise.allSettled(
      urls.map((url) => captureAndStore(env, url))
    )
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    // ... serve stored screenshots
  },
}
```

Configure in `wrangler.toml`:

```toml
[triggers]
crons = ["0 */6 * * *"]
```

## Screenshot Service Module

A reusable module for screenshot capture with retry logic:

```typescript
// lib/screenshot.ts
interface CaptureOptions {
  url: string
  width?: number
  height?: number
  type?: 'png' | 'jpeg' | 'webp'
  quality?: number
  fullPage?: boolean
  colorScheme?: 'light' | 'dark'
  waitUntil?: 'networkidle' | 'load' | 'domcontentloaded'
}

export async function capture(
  apiKey: string,
  options: CaptureOptions,
  retries = 2
): Promise<ArrayBuffer> {
  const params = new URLSearchParams({
    url: options.url,
    width: String(options.width ?? 1440),
    height: String(options.height ?? 900),
    type: options.type ?? 'webp',
  })

  if (options.quality) params.set('quality', String(options.quality))
  if (options.fullPage) params.set('fullPage', 'true')
  if (options.colorScheme) params.set('colorScheme', options.colorScheme)
  if (options.waitUntil) params.set('waitUntil', options.waitUntil)

  for (let attempt = 0; attempt <= retries; attempt++) {
    const response = await fetch(
      `https://screenshotapi.to/api/v1/screenshot?${params}`,
      { headers: { 'x-api-key': apiKey } }
    )

    if (response.ok) return response.arrayBuffer()

    if (attempt < retries) {
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
    }
  }

  throw new Error('Screenshot capture failed after retries')
}
```

## Comparing Edge Screenshot Approaches

| Feature | ScreenshotAPI | CF Browser Rendering | CF REST API |
|---------|--------------|---------------------|-------------|
| Setup complexity | Minimal | Moderate | Low |
| Session management | None | Manual | None |
| Puppeteer required | No | Yes | No |
| Custom scripting | No | Yes | No |
| Cost model | Per-credit | Per-render minute | Per-render |

ScreenshotAPI is ideal when you need simple, reliable screenshot capture without managing browser sessions or Puppeteer scripts.

## Production Tips

### Request Validation

Validate incoming URLs to prevent abuse:

```typescript
function isValidUrl(input: string): boolean {
  try {
    const url = new URL(input)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}
```

### Rate Limiting with Workers

Use the `cf` object or an external rate limiter to throttle requests per IP.

### Cost Optimization

Cloudflare Workers are billed per request (first 10 million free on paid plans). Combined with ScreenshotAPI credits, the per-screenshot cost is very predictable. Visit the [pricing page](/pricing) for credit packages.

## Further Reading

- The [JavaScript SDK documentation](/docs/sdks/javascript) covers the full API reference.
- See the [Vercel integration](/integrations/vercel) for another serverless approach.
- Learn about the [AWS Lambda integration](/integrations/aws-lambda) for AWS-based workflows.
