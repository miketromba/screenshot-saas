---
title: "Screenshot API for Vue.js"
description: "Capture website screenshots in Vue.js and Nuxt apps with ScreenshotAPI. Composition API examples, SSR support, and production patterns."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Integrations
    href: /integrations
  - label: Vue.js
faq:
  - question: "Can I call ScreenshotAPI directly from a Vue component?"
    answer: "You can, but it exposes your API key in client-side code. The recommended approach is to proxy requests through a backend route or Nuxt server route and call that from your Vue component."
  - question: "Does ScreenshotAPI work with Nuxt 3 server routes?"
    answer: "Yes. Nuxt 3 server routes in the server/api directory are the ideal place to call ScreenshotAPI. They run on the server, keep your API key hidden, and return image data to your Vue components."
  - question: "How do I show a loading state while the screenshot is being captured?"
    answer: "Use a reactive ref to track loading state. Set it to true before the fetch call and false after the response arrives. Display a skeleton placeholder or spinner while loading is true."
  - question: "What image format should I use for Vue screenshot previews?"
    answer: "WebP offers the best quality-to-size ratio for web display. Use type=webp with quality=80 for thumbnails and previews. Fall back to PNG when you need lossless output."
relatedPages:
  - title: "React Integration"
    description: "Screenshot capture patterns for React applications"
    href: "/integrations/react"
  - title: "Nuxt on Vercel"
    description: "Deploy screenshot workflows on Vercel's edge network"
    href: "/integrations/vercel"
  - title: "JavaScript SDK"
    description: "Full reference for the ScreenshotAPI JavaScript SDK"
    href: "/docs/sdks/javascript"
jsonLd:
  "@context": "https://schema.org"
  "@type": "TechArticle"
  headline: "Screenshot API for Vue.js"
  description: "Capture website screenshots in Vue.js and Nuxt apps with ScreenshotAPI. Composition API examples, SSR support, and production patterns."
  dateModified: "2026-03-25"
---

## Capture Website Screenshots in Vue.js with ScreenshotAPI

Adding screenshot functionality to a Vue.js application typically means installing Puppeteer or Playwright, which drags in a 50 MB Chromium binary and introduces version conflicts across environments. For Nuxt apps deployed on serverless platforms, getting a headless browser to run is even more painful.

ScreenshotAPI removes that complexity. Your **Vue.js screenshot API** integration sends one HTTP request and receives a pixel-perfect PNG, JPEG, or WebP image. No browser binaries, no container configuration, and it works the same way in development and production.

## Quick Start

1. [Create a free ScreenshotAPI account](https://screenshotapi.to) and copy your API key. You get **5 free credits** to start with.
2. Set up a server-side proxy route to keep your API key secure.
3. Call the proxy from your Vue component using the Composition API.

## Installation

If you are using Nuxt 3, no additional packages are needed. For a standalone Vue app with a separate backend, install the SDK:

```bash
npm install screenshotapi
```

Store your API key in an environment variable:

```bash
SCREENSHOTAPI_KEY=sk_live_xxxxx
```

## Nuxt 3 Server Route

The cleanest approach for Nuxt projects is a server route in the `server/api` directory. This keeps your API key on the server and gives Vue components a local endpoint to call.

```typescript
// server/api/screenshot.get.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const url = query.url as string

  if (!url) {
    throw createError({ statusCode: 400, statusMessage: 'url parameter is required' })
  }

  const params = new URLSearchParams({
    url,
    width: String(query.width ?? 1440),
    height: String(query.height ?? 900),
    type: String(query.type ?? 'webp'),
    quality: String(query.quality ?? 80),
  })

  const response = await fetch(
    `https://screenshotapi.to/api/v1/screenshot?${params}`,
    {
      headers: { 'x-api-key': process.env.SCREENSHOTAPI_KEY! },
    }
  )

  if (!response.ok) {
    throw createError({ statusCode: 502, statusMessage: 'Screenshot capture failed' })
  }

  const buffer = await response.arrayBuffer()
  const imageType = query.type ?? 'webp'

  setResponseHeaders(event, {
    'Content-Type': `image/${imageType}`,
    'Cache-Control': 'public, max-age=3600, s-maxage=3600',
  })

  return Buffer.from(buffer)
})
```

## Basic Vue Component

With the server route in place, build a screenshot component using the Composition API:

```vue
<script setup lang="ts">
import { ref } from 'vue'

const targetUrl = ref('')
const screenshotSrc = ref<string | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

async function captureScreenshot() {
  if (!targetUrl.value) return

  loading.value = true
  error.value = null
  screenshotSrc.value = null

  try {
    const params = new URLSearchParams({
      url: targetUrl.value,
      width: '1440',
      height: '900',
      type: 'webp',
    })

    const response = await fetch(`/api/screenshot?${params}`)

    if (!response.ok) {
      throw new Error(`Capture failed: ${response.status}`)
    }

    const blob = await response.blob()
    screenshotSrc.value = URL.createObjectURL(blob)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="screenshot-capture">
    <div class="input-row">
      <input
        v-model="targetUrl"
        type="url"
        placeholder="https://example.com"
        @keyup.enter="captureScreenshot"
      />
      <button :disabled="loading || !targetUrl" @click="captureScreenshot">
        {{ loading ? 'Capturing...' : 'Capture' }}
      </button>
    </div>

    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="loading" class="skeleton" />

    <img
      v-if="screenshotSrc"
      :src="screenshotSrc"
      alt="Website screenshot"
      class="screenshot-preview"
    />
  </div>
</template>
```

## Composable for Reusable Screenshot Logic

Extract screenshot logic into a Vue composable so any component in your app can use it:

```typescript
// composables/useScreenshot.ts
import { ref } from 'vue'

interface ScreenshotOptions {
  url: string
  width?: number
  height?: number
  type?: 'png' | 'jpeg' | 'webp'
  quality?: number
  fullPage?: boolean
  colorScheme?: 'light' | 'dark'
}

export function useScreenshot() {
  const imageUrl = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function capture(options: ScreenshotOptions) {
    loading.value = true
    error.value = null

    try {
      const params = new URLSearchParams({
        url: options.url,
        width: String(options.width ?? 1440),
        height: String(options.height ?? 900),
        type: options.type ?? 'webp',
      })

      if (options.quality) params.set('quality', String(options.quality))
      if (options.fullPage) params.set('fullPage', 'true')
      if (options.colorScheme) params.set('colorScheme', options.colorScheme)

      const response = await fetch(`/api/screenshot?${params}`)

      if (!response.ok) {
        throw new Error(`Screenshot failed: ${response.status}`)
      }

      const blob = await response.blob()

      if (imageUrl.value) {
        URL.revokeObjectURL(imageUrl.value)
      }

      imageUrl.value = URL.createObjectURL(blob)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Capture failed'
    } finally {
      loading.value = false
    }
  }

  return { imageUrl, loading, error, capture }
}
```

Use the composable anywhere:

```vue
<script setup lang="ts">
const { imageUrl, loading, error, capture } = useScreenshot()

await capture({
  url: 'https://example.com',
  colorScheme: 'dark',
  type: 'webp',
  quality: 85,
})
</script>
```

## Batch Screenshot Gallery

Build a gallery component that captures multiple screenshots in parallel:

```vue
<script setup lang="ts">
import { ref } from 'vue'

const urls = ref([
  'https://github.com',
  'https://vuejs.org',
  'https://nuxt.com',
])

interface ScreenshotResult {
  url: string
  src: string | null
  error: string | null
}

const results = ref<ScreenshotResult[]>([])
const capturing = ref(false)

async function captureAll() {
  capturing.value = true

  results.value = await Promise.all(
    urls.value.map(async (url) => {
      try {
        const params = new URLSearchParams({
          url,
          width: '1440',
          height: '900',
          type: 'webp',
          quality: '80',
        })

        const res = await fetch(`/api/screenshot?${params}`)
        if (!res.ok) throw new Error(`Status ${res.status}`)

        const blob = await res.blob()
        return { url, src: URL.createObjectURL(blob), error: null }
      } catch (err) {
        return { url, src: null, error: String(err) }
      }
    })
  )

  capturing.value = false
}
</script>

<template>
  <div>
    <button :disabled="capturing" @click="captureAll">
      {{ capturing ? 'Capturing...' : 'Capture All' }}
    </button>

    <div class="grid">
      <div v-for="result in results" :key="result.url" class="card">
        <img v-if="result.src" :src="result.src" :alt="result.url" />
        <p v-else-if="result.error" class="error">{{ result.error }}</p>
        <p class="url">{{ result.url }}</p>
      </div>
    </div>
  </div>
</template>
```

## Dark Mode Screenshots

ScreenshotAPI accepts a `colorScheme` parameter that forces the target page into light or dark mode. This is useful when building theme comparison tools or generating preview images for both modes:

```typescript
const lightParams = new URLSearchParams({
  url: 'https://example.com',
  width: '1440',
  height: '900',
  type: 'webp',
  colorScheme: 'light',
})

const darkParams = new URLSearchParams({
  url: 'https://example.com',
  width: '1440',
  height: '900',
  type: 'webp',
  colorScheme: 'dark',
})

const [light, dark] = await Promise.all([
  fetch(`/api/screenshot?${lightParams}`),
  fetch(`/api/screenshot?${darkParams}`),
])
```

Pair this with [visual regression testing](/use-cases/visual-regression-testing) to ensure both themes render correctly after every deploy.

## Production Tips

### Proxy All Requests Server-Side

Never expose your API key in client-side Vue code. Always route requests through a Nuxt server route, an Express proxy, or any backend you control. This also lets you add rate limiting and input validation in one place.

### URL Validation

Validate URLs before forwarding them to the API:

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

### Caching

Avoid burning credits on repeat captures. In Nuxt, use `cachedEventHandler` to cache server route responses:

```typescript
// server/api/screenshot.get.ts
export default cachedEventHandler(
  async (event) => {
    // ... same handler logic
  },
  { maxAge: 3600 }
)
```

For external caching, set `Cache-Control` headers and serve images through a CDN. Visit the [pricing page](/pricing) to pick the right credit tier for your volume.

### Memory Management

When using `URL.createObjectURL` in components, revoke the object URL when the component unmounts to avoid memory leaks:

```typescript
import { onUnmounted } from 'vue'

onUnmounted(() => {
  if (imageUrl.value) {
    URL.revokeObjectURL(imageUrl.value)
  }
})
```

## Further Reading

- [How to Take Screenshots with JavaScript](/blog/how-to-take-screenshots-with-javascript) covers the fundamentals of browser-based screenshot capture.
- The [JavaScript SDK documentation](/docs/sdks/javascript) has the full parameter reference.
- See the [React integration](/integrations/react) for comparison with React-based patterns.
