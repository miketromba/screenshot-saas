---
title: "Screenshot API for Netlify"
description: "Capture website screenshots with Netlify Functions and ScreenshotAPI. Serverless endpoints, scheduled functions, and edge deployment."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Integrations
    href: /integrations
  - label: Netlify
faq:
  - question: "Can I use ScreenshotAPI with Netlify Functions?"
    answer: "Yes. Netlify Functions are serverless handlers that can call ScreenshotAPI and return screenshots. No Puppeteer or Chromium installation needed."
  - question: "Does ScreenshotAPI work with Netlify Edge Functions?"
    answer: "Yes. Netlify Edge Functions run Deno at the edge. Use the standard fetch API to call ScreenshotAPI from the closest edge location."
  - question: "How do I store the API key securely on Netlify?"
    answer: "Add it as an environment variable in your Netlify site settings under Build & deploy > Environment. Access it with process.env in functions."
  - question: "Can I take screenshots of Netlify deploy previews?"
    answer: "Yes. Use the deploy preview URL from Netlify's deploy context and pass it to ScreenshotAPI. This works for visual testing of every branch and PR."
relatedPages:
  - title: "Vercel Integration"
    description: "Screenshots on Vercel's platform"
    href: "/integrations/vercel"
  - title: "Cloudflare Workers"
    description: "Edge screenshot capture with Cloudflare"
    href: "/integrations/cloudflare-workers"
  - title: "GitHub Actions Integration"
    description: "CI/CD screenshot automation"
    href: "/integrations/github-actions"
  - title: "JavaScript SDK"
    description: "Full reference for the ScreenshotAPI JavaScript SDK"
    href: "/docs/sdks/javascript"
jsonLd:
  "@context": "https://schema.org"
  "@type": "TechArticle"
  headline: "Screenshot API for Netlify"
  description: "Capture website screenshots with Netlify Functions and ScreenshotAPI. Serverless endpoints, scheduled functions, and edge deployment."
  dateModified: "2026-03-25"
---

## Capture Website Screenshots on Netlify with ScreenshotAPI

Netlify Functions provide serverless endpoints that deploy alongside your site. Running Puppeteer inside a Netlify Function is technically possible but painful. The Chromium binary pushes against the 50 MB bundle size limit, cold starts spike, and the 10-second default timeout is tight for page rendering.

ScreenshotAPI makes your **Netlify screenshot** integration simple. One fetch call from a Netlify Function returns a pixel-perfect PNG, JPEG, or WebP. No browser binary, no bundle size issues, and the function stays fast.

## Quick Start

1. [Sign up for ScreenshotAPI](https://screenshotapi.to) and copy your API key. **5 free credits** are included.
2. Add the key as an environment variable in your Netlify site settings.
3. Create a Netlify Function that calls the API.

## Installation

No additional packages needed. Modern Netlify Functions use the Web API `Response` object and built-in `fetch`:

```bash
# Add to Netlify environment variables via the dashboard
SCREENSHOTAPI_KEY=sk_live_xxxxx
```

## Basic Netlify Function

```typescript
// netlify/functions/screenshot.mts
const API_BASE = 'https://screenshotapi.to/api/v1/screenshot'

export default async (request: Request) => {
  const url = new URL(request.url)
  const targetUrl = url.searchParams.get('url')

  if (!targetUrl) {
    return new Response(
      JSON.stringify({ error: 'url parameter is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const params = new URLSearchParams({
    url: targetUrl,
    width: url.searchParams.get('width') ?? '1440',
    height: url.searchParams.get('height') ?? '900',
    type: url.searchParams.get('type') ?? 'webp',
    quality: url.searchParams.get('quality') ?? '80',
  })

  const colorScheme = url.searchParams.get('colorScheme')
  if (colorScheme) params.set('colorScheme', colorScheme)

  const fullPage = url.searchParams.get('fullPage')
  if (fullPage) params.set('fullPage', fullPage)

  const response = await fetch(`${API_BASE}?${params}`, {
    headers: { 'x-api-key': process.env.SCREENSHOTAPI_KEY! },
  })

  if (!response.ok) {
    return new Response(
      JSON.stringify({ error: 'Screenshot capture failed' }),
      { status: 502, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const imageType = url.searchParams.get('type') ?? 'webp'

  return new Response(await response.arrayBuffer(), {
    headers: {
      'Content-Type': `image/${imageType}`,
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}

export const config = {
  path: '/api/screenshot',
}
```

Test locally with the Netlify CLI:

```bash
netlify dev
curl "http://localhost:8888/api/screenshot?url=https://example.com" --output screenshot.webp
```

## Netlify Edge Function

For lower latency, use an Edge Function that runs at the CDN edge:

```typescript
// netlify/edge-functions/screenshot.ts
import type { Context } from '@netlify/edge-functions'

const API_BASE = 'https://screenshotapi.to/api/v1/screenshot'

export default async (request: Request, context: Context) => {
  const url = new URL(request.url)
  const targetUrl = url.searchParams.get('url')

  if (!targetUrl) {
    return Response.json({ error: 'url parameter is required' }, { status: 400 })
  }

  const params = new URLSearchParams({
    url: targetUrl,
    width: url.searchParams.get('width') ?? '1440',
    height: url.searchParams.get('height') ?? '900',
    type: url.searchParams.get('type') ?? 'webp',
    quality: url.searchParams.get('quality') ?? '80',
  })

  const response = await fetch(`${API_BASE}?${params}`, {
    headers: { 'x-api-key': Deno.env.get('SCREENSHOTAPI_KEY')! },
  })

  if (!response.ok) {
    return Response.json({ error: 'Screenshot capture failed' }, { status: 502 })
  }

  const imageType = url.searchParams.get('type') ?? 'webp'

  return new Response(await response.arrayBuffer(), {
    headers: {
      'Content-Type': `image/${imageType}`,
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

export const config = {
  path: '/api/edge-screenshot',
}
```

## Scheduled Function for Monitoring

Capture screenshots on a schedule using Netlify Scheduled Functions:

```typescript
// netlify/functions/screenshot-monitor.mts
import { Config } from '@netlify/functions'

const API_BASE = 'https://screenshotapi.to/api/v1/screenshot'

const PAGES = [
  { name: 'homepage', url: 'https://yoursite.com' },
  { name: 'pricing', url: 'https://yoursite.com/pricing' },
  { name: 'docs', url: 'https://yoursite.com/docs' },
]

export default async () => {
  for (const page of PAGES) {
    const params = new URLSearchParams({
      url: page.url,
      width: '1440',
      height: '900',
      type: 'png',
    })

    const response = await fetch(`${API_BASE}?${params}`, {
      headers: { 'x-api-key': process.env.SCREENSHOTAPI_KEY! },
    })

    if (response.ok) {
      const buffer = Buffer.from(await response.arrayBuffer())
      console.log(`Captured ${page.name}: ${buffer.length} bytes`)
    } else {
      console.error(`Failed to capture ${page.name}: ${response.status}`)
    }
  }
}

export const config: Config = {
  schedule: '0 */6 * * *',
}
```

## Deploy Preview Screenshots

Capture screenshots of Netlify deploy previews for visual review:

```typescript
// netlify/functions/preview-screenshot.mts
const API_BASE = 'https://screenshotapi.to/api/v1/screenshot'

export default async (request: Request) => {
  const { deploy_url, pages = ['/'] } = await request.json()

  if (!deploy_url) {
    return Response.json({ error: 'deploy_url is required' }, { status: 400 })
  }

  const results = await Promise.all(
    pages.map(async (page: string) => {
      const fullUrl = `${deploy_url}${page}`
      const params = new URLSearchParams({
        url: fullUrl,
        width: '1440',
        height: '900',
        type: 'webp',
        quality: '80',
        waitUntil: 'networkidle',
      })

      const response = await fetch(`${API_BASE}?${params}`, {
        headers: { 'x-api-key': process.env.SCREENSHOTAPI_KEY! },
      })

      return {
        page,
        success: response.ok,
        size: response.ok ? (await response.arrayBuffer()).byteLength : 0,
      }
    })
  )

  return Response.json({ results })
}

export const config = {
  path: '/api/preview-screenshot',
  method: 'POST',
}
```

## Production Tips

### Environment Variables

Add `SCREENSHOTAPI_KEY` in the Netlify dashboard under Site settings > Environment variables. The variable is available to both serverless and edge functions.

### Function Timeout

Netlify Functions have a 10-second timeout on the free plan and 26 seconds on paid plans. ScreenshotAPI typically responds within 2-5 seconds, well within these limits.

### Caching

Set `Cache-Control` headers on responses. Netlify's CDN respects `s-maxage` for edge caching. For persistent storage, upload screenshots to an external object store.

### Deploy Hooks

Combine with Netlify deploy hooks to trigger screenshots after each deployment. This creates an automated visual snapshot of every release. Visit the [pricing page](/pricing) to select the right credit tier.

## Further Reading

- The [Vercel integration](/integrations/vercel) covers a similar serverless deployment model.
- See the [GitHub Actions integration](/integrations/github-actions) for CI/CD screenshot automation.
- The [API documentation](/docs) has the full parameter reference for all endpoints.
