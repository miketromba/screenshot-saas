---
title: "Screenshot API for SvelteKit"
description: "Capture website screenshots in SvelteKit with ScreenshotAPI. Server load functions, API routes, and reactive component patterns."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Integrations
    href: /integrations
  - label: SvelteKit
faq:
  - question: "Can I call ScreenshotAPI from a SvelteKit server load function?"
    answer: "Yes. Server load functions in +page.server.ts run exclusively on the server, making them a safe place to call ScreenshotAPI with your secret API key. Return the image as a base64 string or URL for the component to render."
  - question: "Do I need Puppeteer to take screenshots in SvelteKit?"
    answer: "No. ScreenshotAPI runs headless browsers remotely. Your SvelteKit app makes a standard HTTP request and receives image bytes. No Chromium installation required."
  - question: "How do I create a screenshot API endpoint in SvelteKit?"
    answer: "Create a +server.ts file in your routes directory that handles GET requests. Call ScreenshotAPI from the handler and return a new Response with the image buffer and appropriate Content-Type header."
  - question: "What is the best way to cache screenshots in SvelteKit?"
    answer: "Set Cache-Control headers on your API route responses for browser and CDN caching. For longer-lived images, store them in an S3-compatible bucket and serve from there."
relatedPages:
  - title: "React Integration"
    description: "Screenshot patterns for React applications"
    href: "/integrations/react"
  - title: "Vercel Integration"
    description: "Deploy SvelteKit screenshot workflows on Vercel"
    href: "/integrations/vercel"
  - title: "JavaScript SDK"
    description: "Full reference for the ScreenshotAPI JavaScript SDK"
    href: "/docs/sdks/javascript"
jsonLd:
  "@context": "https://schema.org"
  "@type": "TechArticle"
  headline: "Screenshot API for SvelteKit"
  description: "Capture website screenshots in SvelteKit with ScreenshotAPI. Server load functions, API routes, and reactive component patterns."
  dateModified: "2026-03-25"
---

## Capture Website Screenshots in SvelteKit with ScreenshotAPI

SvelteKit's architecture makes it straightforward to add server-side screenshot functionality. Server load functions and API routes run on the server, where you can safely call external APIs with secret keys. However, most screenshot tutorials point developers toward Puppeteer or Playwright, which adds a heavy Chromium dependency that complicates deployments on platforms like Vercel and Cloudflare.

ScreenshotAPI replaces all of that with a single HTTP call. Your **SvelteKit screenshot API** integration sends a request and receives a rendered PNG, JPEG, or WebP image. No browser binaries, no container hacks.

## Quick Start

1. [Create a free ScreenshotAPI account](https://screenshotapi.to) and copy your API key. **5 free credits** are included.
2. Add the API key to your `.env` file.
3. Create a server route or load function that calls the API.

## Installation

No additional packages are required. SvelteKit's built-in `fetch` handles everything:

```bash
# .env
SCREENSHOTAPI_KEY=sk_live_xxxxx
```

If you want the typed SDK, install it:

```bash
npm install screenshotapi
```

## SvelteKit API Route

Create an API endpoint that proxies screenshot requests. This keeps your API key server-side and gives your Svelte components a local endpoint:

```typescript
// src/routes/api/screenshot/+server.ts
import { error } from '@sveltejs/kit'
import { SCREENSHOTAPI_KEY } from '$env/static/private'
import type { RequestHandler } from './$types'

const API_BASE = 'https://screenshotapi.to/api/v1/screenshot'

export const GET: RequestHandler = async ({ url }) => {
  const targetUrl = url.searchParams.get('url')

  if (!targetUrl) {
    error(400, 'url parameter is required')
  }

  const params = new URLSearchParams({
    url: targetUrl,
    width: url.searchParams.get('width') ?? '1440',
    height: url.searchParams.get('height') ?? '900',
    type: url.searchParams.get('type') ?? 'webp',
    quality: url.searchParams.get('quality') ?? '80',
  })

  const fullPage = url.searchParams.get('fullPage')
  if (fullPage) params.set('fullPage', fullPage)

  const colorScheme = url.searchParams.get('colorScheme')
  if (colorScheme) params.set('colorScheme', colorScheme)

  const response = await fetch(`${API_BASE}?${params}`, {
    headers: { 'x-api-key': SCREENSHOTAPI_KEY },
  })

  if (!response.ok) {
    error(502, 'Screenshot capture failed')
  }

  const buffer = await response.arrayBuffer()
  const imageType = url.searchParams.get('type') ?? 'webp'

  return new Response(buffer, {
    headers: {
      'Content-Type': `image/${imageType}`,
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
```

## Basic Svelte Component

Build a screenshot capture component that calls the API route:

```svelte
<!-- src/routes/screenshot/+page.svelte -->
<script lang="ts">
  let targetUrl = $state('')
  let screenshotSrc = $state<string | null>(null)
  let loading = $state(false)
  let errorMessage = $state<string | null>(null)

  async function capture() {
    if (!targetUrl) return

    loading = true
    errorMessage = null
    screenshotSrc = null

    try {
      const params = new URLSearchParams({
        url: targetUrl,
        width: '1440',
        height: '900',
        type: 'webp',
      })

      const response = await fetch(`/api/screenshot?${params}`)

      if (!response.ok) {
        throw new Error(`Capture failed: ${response.status}`)
      }

      const blob = await response.blob()
      screenshotSrc = URL.createObjectURL(blob)
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : 'Unknown error'
    } finally {
      loading = false
    }
  }
</script>

<div class="screenshot-tool">
  <div class="input-row">
    <input
      bind:value={targetUrl}
      type="url"
      placeholder="https://example.com"
      onkeydown={(e) => e.key === 'Enter' && capture()}
    />
    <button disabled={loading || !targetUrl} onclick={capture}>
      {loading ? 'Capturing...' : 'Capture'}
    </button>
  </div>

  {#if errorMessage}
    <p class="error">{errorMessage}</p>
  {/if}

  {#if loading}
    <div class="skeleton"></div>
  {/if}

  {#if screenshotSrc}
    <img src={screenshotSrc} alt="Website screenshot" class="preview" />
  {/if}
</div>
```

## Server Load Function

For pages that need screenshots at render time, use a server load function. This approach works well for dashboards showing site previews:

```typescript
// src/routes/dashboard/+page.server.ts
import { SCREENSHOTAPI_KEY } from '$env/static/private'
import type { PageServerLoad } from './$types'

const API_BASE = 'https://screenshotapi.to/api/v1/screenshot'

export const load: PageServerLoad = async ({ fetch }) => {
  const sites = [
    { name: 'Homepage', url: 'https://yoursite.com' },
    { name: 'Blog', url: 'https://yoursite.com/blog' },
    { name: 'Docs', url: 'https://yoursite.com/docs' },
  ]

  const previews = await Promise.all(
    sites.map(async (site) => {
      const params = new URLSearchParams({
        url: site.url,
        width: '1440',
        height: '900',
        type: 'webp',
        quality: '75',
      })

      try {
        const response = await fetch(`${API_BASE}?${params}`, {
          headers: { 'x-api-key': SCREENSHOTAPI_KEY },
        })

        if (!response.ok) return { ...site, image: null }

        const buffer = Buffer.from(await response.arrayBuffer())
        return {
          ...site,
          image: `data:image/webp;base64,${buffer.toString('base64')}`,
        }
      } catch {
        return { ...site, image: null }
      }
    })
  )

  return { previews }
}
```

Display the previews in the page component:

```svelte
<!-- src/routes/dashboard/+page.svelte -->
<script lang="ts">
  let { data } = $props()
</script>

<div class="grid">
  {#each data.previews as preview}
    <div class="card">
      <h3>{preview.name}</h3>
      {#if preview.image}
        <img src={preview.image} alt="Preview of {preview.name}" />
      {:else}
        <div class="placeholder">Failed to load</div>
      {/if}
    </div>
  {/each}
</div>
```

## Screenshot Utility Module

Extract reusable screenshot logic into a server-only module:

```typescript
// src/lib/server/screenshot.ts
import { SCREENSHOTAPI_KEY } from '$env/static/private'

const API_BASE = 'https://screenshotapi.to/api/v1/screenshot'

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

export async function captureScreenshot(
  options: CaptureOptions,
  retries = 2
): Promise<Buffer> {
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
    try {
      const response = await fetch(`${API_BASE}?${params}`, {
        headers: { 'x-api-key': SCREENSHOTAPI_KEY },
        signal: AbortSignal.timeout(30_000),
      })

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`)
      }

      return Buffer.from(await response.arrayBuffer())
    } catch (err) {
      if (attempt === retries) throw err
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
    }
  }

  throw new Error('Screenshot capture failed after retries')
}
```

## Dark Mode Screenshots

Capture both color scheme variants for theme comparison or [visual regression testing](/use-cases/visual-regression-testing):

```typescript
import { captureScreenshot } from '$lib/server/screenshot'

const [light, dark] = await Promise.all([
  captureScreenshot({ url: 'https://example.com', colorScheme: 'light' }),
  captureScreenshot({ url: 'https://example.com', colorScheme: 'dark' }),
])
```

## Production Tips

### URL Validation

Always validate user input before passing it to the API:

```typescript
function isValidUrl(input: string): boolean {
  try {
    const parsed = new URL(input)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}
```

### Rate Limiting

If your screenshot endpoint is public-facing, add rate limiting. SvelteKit hooks are a good place for this:

```typescript
// src/hooks.server.ts
const ipRequests = new Map<string, number[]>()

export async function handle({ event, resolve }) {
  if (event.url.pathname.startsWith('/api/screenshot')) {
    const ip = event.getClientAddress()
    const now = Date.now()
    const requests = (ipRequests.get(ip) ?? []).filter((t) => now - t < 60_000)

    if (requests.length >= 20) {
      return new Response('Rate limit exceeded', { status: 429 })
    }

    requests.push(now)
    ipRequests.set(ip, requests)
  }

  return resolve(event)
}
```

### Caching

Set appropriate cache headers on your API route responses so browsers and CDNs avoid repeat requests. For persistent storage, upload screenshots to an S3-compatible bucket. Check the [pricing page](/pricing) to choose the right credit volume.

## Further Reading

- [How to Take Screenshots with JavaScript](/blog/how-to-take-screenshots-with-javascript) covers the fundamentals of browser screenshot capture.
- The [JavaScript SDK documentation](/docs/sdks/javascript) has the full parameter reference.
- See the [Vercel integration](/integrations/vercel) for deploying SvelteKit screenshot workflows.
