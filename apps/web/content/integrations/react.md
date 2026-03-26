---
title: "React Screenshot API Integration"
description: "Add website screenshots and thumbnail generation to your React app with ScreenshotAPI. Works with Vite, CRA, Remix, and any React setup."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Integrations
    href: /integrations
  - label: React
faq:
  - question: "Can I call ScreenshotAPI directly from a React component?"
    answer: "You should proxy requests through your backend to protect your API key. Expose a server endpoint that calls ScreenshotAPI, then fetch from that endpoint in your React component."
  - question: "How do I display a website thumbnail in React?"
    answer: "Point an img tag at your backend proxy endpoint, or fetch the screenshot as a blob and create an object URL. Both approaches work with lazy loading and responsive images."
  - question: "Does ScreenshotAPI work with Vite and Create React App?"
    answer: "Yes. The SDK is a standard npm package with no Node-specific dependencies at the client level. Your backend proxy can run on any Node, Bun, or Deno server."
  - question: "How do I handle loading states while a screenshot is being captured?"
    answer: "Use React state or TanStack Query's isLoading flag to show a skeleton or spinner while the screenshot request is in flight. Screenshots typically return in 1-3 seconds."
relatedPages:
  - title: "Next.js Integration"
    description: "Server-side screenshot generation with Next.js App Router"
    href: "/integrations/nextjs"
  - title: "Express Integration"
    description: "Build a screenshot proxy with Express.js"
    href: "/integrations/express"
  - title: "JavaScript SDK"
    description: "Full reference for the ScreenshotAPI JavaScript SDK"
    href: "/docs/sdks/javascript"
  - title: "Visual Regression Testing"
    description: "Catch UI bugs before they reach production"
    href: "/use-cases/visual-regression-testing"
jsonLd:
  "@context": "https://schema.org"
  "@type": "TechArticle"
  headline: "React Screenshot API Integration"
  description: "Add website screenshots and thumbnail generation to your React app with ScreenshotAPI. Works with Vite, CRA, Remix, and any React setup."
  dateModified: "2026-03-25"
---

## Capture Website Screenshots in React with ScreenshotAPI

Displaying website thumbnails, link previews, and screenshot galleries in a React application is a common requirement for dashboards, CMS tools, and portfolio builders. Most solutions involve self-hosting Puppeteer, which brings significant complexity: large Docker images, memory-hungry processes, and browser crash recovery.

A **React screenshot API** integration with ScreenshotAPI removes that burden entirely. Your React frontend communicates with a lightweight backend proxy, which calls ScreenshotAPI to capture any URL as a PNG, JPEG, or WebP image.

## Quick Start

1. [Create a free account](https://screenshotapi.to) to get your API key. Five credits are included to start.
2. Set up a backend proxy (Express, Fastify, or any server) to keep your API key secret.
3. Fetch screenshots from your React components via the proxy.

## Installation

Install the SDK in your backend project:

```bash
npm install screenshotapi
```

You do not need the SDK on the client side. The React frontend only talks to your proxy endpoint.

## Backend Proxy Setup

Never expose your API key in client-side code. Create a simple proxy server instead:

```typescript
// server/screenshot.ts
import express from 'express'

const router = express.Router()
const API_BASE = 'https://screenshotapi.to/api/v1/screenshot'

router.get('/api/screenshot', async (req, res) => {
  const { url, width = '1280', height = '800', type = 'webp' } = req.query

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'url parameter is required' })
  }

  try {
    const params = new URLSearchParams({
      url,
      width: String(width),
      height: String(height),
      type: String(type),
    })

    const response = await fetch(`${API_BASE}?${params}`, {
      headers: { 'x-api-key': process.env.SCREENSHOTAPI_KEY! },
    })

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Capture failed' })
    }

    const buffer = Buffer.from(await response.arrayBuffer())

    res.set('Content-Type', `image/${type}`)
    res.set('Cache-Control', 'public, max-age=86400')
    res.send(buffer)
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
```

## Basic React Example

With the proxy in place, displaying a screenshot in React is straightforward:

```tsx
function WebsiteThumbnail({ url }: { url: string }) {
  const screenshotUrl = `/api/screenshot?url=${encodeURIComponent(url)}&width=1280&height=800&type=webp`

  return (
    <div className="overflow-hidden rounded-lg border">
      <img
        src={screenshotUrl}
        alt={`Screenshot of ${url}`}
        loading="lazy"
        className="h-auto w-full"
      />
    </div>
  )
}
```

## React Screenshot Component with Loading States

A production-ready **React website thumbnail** component should handle loading, error, and success states:

```tsx
import { useState, useCallback } from 'react'

interface ScreenshotProps {
  url: string
  width?: number
  height?: number
  className?: string
}

function Screenshot({ url, width = 1280, height = 800, className }: ScreenshotProps) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  const screenshotSrc = `/api/screenshot?url=${encodeURIComponent(url)}&width=${width}&height=${height}&type=webp`

  const handleLoad = useCallback(() => setStatus('ready'), [])
  const handleError = useCallback(() => setStatus('error'), [])

  return (
    <div className={`relative overflow-hidden rounded-lg border ${className ?? ''}`}>
      {status === 'loading' && (
        <div className="flex h-48 items-center justify-center bg-muted">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}

      {status === 'error' && (
        <div className="flex h-48 items-center justify-center bg-muted">
          <span className="text-sm text-muted-foreground">Failed to load preview</span>
        </div>
      )}

      <img
        src={screenshotSrc}
        alt={`Preview of ${url}`}
        onLoad={handleLoad}
        onError={handleError}
        className={status === 'ready' ? 'block h-auto w-full' : 'hidden'}
      />
    </div>
  )
}
```

## Using TanStack Query for Screenshots

For applications that already use [TanStack Query](/docs), fetching screenshots as blobs gives you fine-grained control over caching and refetching:

```tsx
import { useQuery } from '@tanstack/react-query'

function useScreenshot(url: string) {
  return useQuery({
    queryKey: ['screenshot', url],
    queryFn: async () => {
      const params = new URLSearchParams({
        url,
        width: '1280',
        height: '800',
        type: 'webp',
      })

      const res = await fetch(`/api/screenshot?${params}`)
      if (!res.ok) throw new Error('Screenshot failed')

      const blob = await res.blob()
      return URL.createObjectURL(blob)
    },
    staleTime: 1000 * 60 * 60,
    retry: 2,
  })
}

function SiteThumbnail({ url }: { url: string }) {
  const { data: imageUrl, isLoading, isError } = useScreenshot(url)

  if (isLoading) return <div className="h-48 animate-pulse rounded-lg bg-muted" />
  if (isError) return <div className="h-48 rounded-lg bg-muted" />

  return (
    <img
      src={imageUrl}
      alt={`Preview of ${url}`}
      className="h-auto w-full rounded-lg"
    />
  )
}
```

Remember to revoke object URLs when components unmount to avoid memory leaks. See the [TanStack Query documentation](/docs) for advanced caching patterns.

## Screenshot Gallery Component

Building a gallery of website previews is a common pattern for portfolio sites and link aggregators:

```tsx
interface Site {
  name: string
  url: string
}

function ScreenshotGallery({ sites }: { sites: Site[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {sites.map((site) => (
        <a
          key={site.url}
          href={site.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group cursor-pointer overflow-hidden rounded-xl border transition-shadow hover:shadow-lg"
        >
          <Screenshot url={site.url} width={1440} height={900} />
          <div className="p-4">
            <h3 className="font-semibold group-hover:text-primary">{site.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{site.url}</p>
          </div>
        </a>
      ))}
    </div>
  )
}
```

## Dark Mode and Light Mode Captures

ScreenshotAPI's `colorScheme` parameter lets you capture both themes without modifying the target site:

```tsx
function ThemeComparison({ url }: { url: string }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <h3 className="mb-2 font-medium">Light Mode</h3>
        <img
          src={`/api/screenshot?url=${encodeURIComponent(url)}&colorScheme=light`}
          alt="Light mode preview"
          className="rounded-lg border"
        />
      </div>
      <div>
        <h3 className="mb-2 font-medium">Dark Mode</h3>
        <img
          src={`/api/screenshot?url=${encodeURIComponent(url)}&colorScheme=dark`}
          alt="Dark mode preview"
          className="rounded-lg border"
        />
      </div>
    </div>
  )
}
```

## Production Tips

### Protect Your API Key

Your `SCREENSHOTAPI_KEY` must stay on the server. Never import it in client-side bundles. The proxy pattern shown above keeps the key safe while exposing a clean `/api/screenshot` interface to your React app.

### Caching Best Practices

1. **HTTP caching**: Return `Cache-Control` headers from your proxy so the browser and CDN cache responses.
2. **TanStack Query caching**: Set `staleTime` to avoid refetching screenshots that haven't changed.
3. **Persistent storage**: For thumbnails that rarely change, save the image to S3 or R2 and serve the stored copy.

### Rate Limiting User Input

If users can enter arbitrary URLs, add server-side validation and rate limiting. Reject private IPs, limit requests per user, and sanitize input to prevent SSRF attacks.

### Image Optimization

Use the `webp` format and the `quality` parameter to minimize bandwidth:

```
/api/screenshot?url=https://example.com&type=webp&quality=80
```

WebP images are typically 25-35% smaller than PNG at comparable visual quality. Check the [pricing page](/pricing) to estimate credit usage for your expected volume.

## Further Reading

- [How to Take Screenshots with JavaScript](/blog/how-to-take-screenshots-with-javascript) explains the fundamentals of programmatic screenshot capture.
- The [Next.js integration](/integrations/nextjs) guide covers server-side patterns with App Router.
- Visit the [JavaScript SDK docs](/docs/sdks/javascript) for the full parameter reference.
