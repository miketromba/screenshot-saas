---
title: "Express.js Screenshot API Integration"
description: "Build a screenshot service with Express and ScreenshotAPI. Production-ready Node.js examples with caching, error handling, and middleware."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Integrations
    href: /integrations
  - label: Express
faq:
  - question: "Why use ScreenshotAPI instead of Puppeteer with Express?"
    answer: "Puppeteer bundles a 170 MB Chromium binary, consumes 200+ MB of RAM per browser instance, and crashes under load. ScreenshotAPI offloads rendering entirely, keeping your Express server lightweight and stable."
  - question: "Can I use ScreenshotAPI with Express middleware?"
    answer: "Yes. The API call is a standard fetch request that works inside any Express route handler or middleware. You can add authentication, rate limiting, and caching middleware around it."
  - question: "How do I stream screenshots to the client?"
    answer: "Fetch the response from ScreenshotAPI and pipe the readable stream directly to the Express response object using response.body.pipe(res)."
  - question: "Does ScreenshotAPI support WebP format?"
    answer: "Yes. Pass type=webp in the query parameters. You can also set quality=80 for a good balance between file size and visual quality."
relatedPages:
  - title: "Next.js Integration"
    description: "Server-side screenshots with Next.js App Router"
    href: "/integrations/nextjs"
  - title: "React Integration"
    description: "Display screenshots in React components"
    href: "/integrations/react"
  - title: "JavaScript SDK"
    description: "Full reference for the ScreenshotAPI JavaScript SDK"
    href: "/docs/sdks/javascript"
  - title: "AWS Lambda Integration"
    description: "Serverless screenshot capture with Lambda"
    href: "/integrations/aws-lambda"
jsonLd:
  "@context": "https://schema.org"
  "@type": "TechArticle"
  headline: "Express.js Screenshot API Integration"
  description: "Build a screenshot service with Express and ScreenshotAPI. Production-ready Node.js examples."
  dateModified: "2026-03-25"
---

## Build a Screenshot Service with Express and ScreenshotAPI

Express.js is the most widely used Node.js web framework, and adding screenshot functionality is a common requirement for SaaS dashboards, CMS tools, and SEO platforms. The typical approach involves running Puppeteer alongside Express, but that introduces a 170 MB Chromium dependency, heavy RAM usage, and browser process management that complicates deployments.

An **Express screenshot API** integration with ScreenshotAPI removes that complexity. Your Express server makes one HTTP request per screenshot and receives image bytes in return. No headless browser, no binary management, no out-of-memory crashes.

## Quick Start

1. [Sign up for ScreenshotAPI](https://screenshotapi.to) to get your API key. You receive **5 free credits** on signup.
2. Install the JavaScript SDK.
3. Create an Express route that proxies screenshot requests.

## Installation

```bash
npm install express screenshotapi
```

Set the environment variable:

```bash
export SCREENSHOTAPI_KEY=sk_live_xxxxx
```

## Basic Example

A minimal Express server that serves screenshots:

```typescript
import express from 'express'

const app = express()
const API_BASE = 'https://screenshotapi.to/api/v1/screenshot'

app.get('/api/screenshot', async (req, res) => {
  const { url, width = '1440', height = '900', type = 'png' } = req.query

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

app.listen(3000, () => console.log('Screenshot server running on :3000'))
```

Test it:

```bash
curl "http://localhost:3000/api/screenshot?url=https://example.com" --output shot.png
```

## Express Screenshot Service Module

Extract screenshot logic into a reusable module:

```typescript
// services/screenshot.ts
interface ScreenshotOptions {
  url: string
  width?: number
  height?: number
  type?: 'png' | 'jpeg' | 'webp'
  quality?: number
  fullPage?: boolean
  colorScheme?: 'light' | 'dark'
  waitUntil?: 'networkidle' | 'load' | 'domcontentloaded'
  delay?: number
}

const API_BASE = 'https://screenshotapi.to/api/v1/screenshot'

export async function captureScreenshot(
  options: ScreenshotOptions,
  retries = 2
): Promise<Buffer> {
  const params = new URLSearchParams({
    url: options.url,
    width: String(options.width ?? 1440),
    height: String(options.height ?? 900),
    type: options.type ?? 'png',
    waitUntil: options.waitUntil ?? 'networkidle',
  })

  if (options.quality) params.set('quality', String(options.quality))
  if (options.fullPage) params.set('fullPage', 'true')
  if (options.colorScheme) params.set('colorScheme', options.colorScheme)
  if (options.delay) params.set('delay', String(options.delay))

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${API_BASE}?${params}`, {
        headers: { 'x-api-key': process.env.SCREENSHOTAPI_KEY! },
        signal: AbortSignal.timeout(30_000),
      })

      if (!res.ok) throw new Error(`API returned ${res.status}`)

      return Buffer.from(await res.arrayBuffer())
    } catch (error) {
      if (attempt === retries) throw error
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
    }
  }

  throw new Error('Screenshot capture failed after retries')
}
```

## Express Router with Middleware

Organize routes with Express Router and add middleware:

```typescript
// routes/screenshot.ts
import { Router } from 'express'
import { captureScreenshot } from '../services/screenshot'

const router = Router()

router.get('/', async (req, res) => {
  const { url, width, height, type = 'webp', quality, fullPage } = req.query

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'url parameter is required' })
  }

  try {
    const image = await captureScreenshot({
      url,
      width: width ? Number(width) : 1440,
      height: height ? Number(height) : 900,
      type: type as 'png' | 'jpeg' | 'webp',
      quality: quality ? Number(quality) : undefined,
      fullPage: fullPage === 'true',
    })

    res.set('Content-Type', `image/${type}`)
    res.set('Cache-Control', 'public, max-age=3600, s-maxage=86400')
    res.send(image)
  } catch (error) {
    res.status(502).json({ error: 'Screenshot capture failed' })
  }
})

router.get('/download', async (req, res) => {
  const url = req.query.url as string
  if (!url) return res.status(400).json({ error: 'url is required' })

  try {
    const image = await captureScreenshot({ url, type: 'png' })
    res.set('Content-Disposition', 'attachment; filename="screenshot.png"')
    res.set('Content-Type', 'image/png')
    res.send(image)
  } catch (error) {
    res.status(502).json({ error: 'Download failed' })
  }
})

export default router
```

Mount it:

```typescript
import screenshotRouter from './routes/screenshot'

app.use('/api/screenshot', screenshotRouter)
```

## Streaming Responses

For large full-page screenshots, stream the response instead of buffering it:

```typescript
app.get('/api/screenshot/stream', async (req, res) => {
  const url = req.query.url as string
  if (!url) return res.status(400).json({ error: 'url is required' })

  const params = new URLSearchParams({
    url,
    width: '1440',
    height: '900',
    type: 'png',
    fullPage: 'true',
  })

  const response = await fetch(`${API_BASE}?${params}`, {
    headers: { 'x-api-key': process.env.SCREENSHOTAPI_KEY! },
  })

  if (!response.ok || !response.body) {
    return res.status(502).json({ error: 'Capture failed' })
  }

  res.set('Content-Type', 'image/png')
  res.set('Cache-Control', 'public, max-age=3600')

  const reader = response.body.getReader()
  const push = async () => {
    const { done, value } = await reader.read()
    if (done) {
      res.end()
      return
    }
    res.write(value)
    await push()
  }
  await push()
})
```

## Caching with Node-Cache

Store recent screenshots in memory to reduce API calls:

```typescript
import NodeCache from 'node-cache'

const cache = new NodeCache({ stdTTL: 3600, maxKeys: 500 })

app.get('/api/screenshot/cached', async (req, res) => {
  const url = req.query.url as string
  if (!url) return res.status(400).json({ error: 'url is required' })

  const cacheKey = `screenshot:${url}`
  const cached = cache.get<Buffer>(cacheKey)

  if (cached) {
    res.set('Content-Type', 'image/webp')
    res.set('X-Cache', 'HIT')
    return res.send(cached)
  }

  try {
    const image = await captureScreenshot({ url, type: 'webp', quality: 80 })
    cache.set(cacheKey, image)

    res.set('Content-Type', 'image/webp')
    res.set('X-Cache', 'MISS')
    res.send(image)
  } catch (error) {
    res.status(502).json({ error: 'Capture failed' })
  }
})
```

## Production Tips

### Rate Limiting

Protect your endpoint with express-rate-limit:

```typescript
import rateLimit from 'express-rate-limit'

const screenshotLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Too many screenshot requests' },
})

app.use('/api/screenshot', screenshotLimiter)
```

### Input Validation

Validate URLs before forwarding them:

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

### Error Monitoring

Log screenshot failures for debugging:

```typescript
app.use('/api/screenshot', (err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(`Screenshot error for ${req.query.url}:`, err.message)
  res.status(500).json({ error: 'Internal server error' })
})
```

### Scaling

Express servers calling ScreenshotAPI scale horizontally without any special configuration. Since the screenshot rendering happens off-server, you can run multiple Express instances behind a load balancer without worrying about Chromium process limits. Check the [pricing page](/pricing) for volume credit packages.

## Further Reading

- [How to Take Screenshots with JavaScript](/blog/how-to-take-screenshots-with-javascript) covers the fundamentals of programmatic screenshot capture.
- The [JavaScript SDK documentation](/docs/sdks/javascript) has the complete parameter reference.
- See the [AWS Lambda integration](/integrations/aws-lambda) for serverless deployments.
