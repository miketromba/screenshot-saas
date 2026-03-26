---
title: "Migrate from Puppeteer to ScreenshotAPI"
description: "Step-by-step migration guide from Puppeteer to ScreenshotAPI. Parameter mapping, before/after code examples, and infrastructure savings."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Blog
    href: /blog
  - label: Migrate from Puppeteer
faq:
  - question: "Why should I migrate from Puppeteer to a screenshot API?"
    answer: "Puppeteer requires managing Chrome binaries, handling memory leaks, scaling browser pools, and maintaining Docker images. A screenshot API handles all of this in the cloud, reducing infrastructure costs and engineering maintenance."
  - question: "Can ScreenshotAPI do everything Puppeteer can?"
    answer: "For screenshot capture, yes. ScreenshotAPI supports all common Puppeteer screenshot features: viewport sizing, full-page capture, format selection, wait strategies, and device emulation. Puppeteer offers additional capabilities like form filling and cookie management that are outside the scope of a screenshot API."
  - question: "How long does the migration take?"
    answer: "Typically 30-60 minutes. The migration involves replacing Puppeteer browser launch and screenshot code with HTTP requests. The URL, viewport, and wait parameters map directly."
  - question: "Will screenshots look the same after migration?"
    answer: "Yes. ScreenshotAPI uses Chromium for rendering, the same browser engine as Puppeteer. The output is visually identical for the same URL and viewport settings."
relatedPages:
  - title: "ScreenshotAPI vs Puppeteer"
    description: "Detailed feature and performance comparison."
    href: "/compare/screenshotapi-vs-puppeteer"
  - title: "How to Take Screenshots with JavaScript"
    description: "Node.js screenshot examples with both approaches."
    href: "/blog/how-to-take-screenshots-with-javascript"
  - title: "Migrate from Playwright"
    description: "Migration guide for Playwright users."
    href: "/blog/migrate-from-playwright"
jsonLd:
  "@context": "https://schema.org"
  "@type": "Article"
  headline: "Migrate from Puppeteer to ScreenshotAPI"
  description: "Step-by-step migration guide from Puppeteer to ScreenshotAPI. Parameter mapping, before/after code examples, and infrastructure savings."
  dateModified: "2026-03-25"
---

Puppeteer is a powerful browser automation tool, but using it solely for screenshots introduces unnecessary complexity: Chrome binary management, memory leak handling, Docker image bloat, and scaling challenges. This guide walks through migrating your Puppeteer screenshot code to [ScreenshotAPI](/).

## Why Migrate

| Concern | Puppeteer | ScreenshotAPI |
|---|---|---|
| Chrome binary | ~300 MB download, version management | Cloud-managed |
| Docker image size | 1-1.5 GB | Not needed |
| Memory per screenshot | 200-300 MB | 0 (HTTP call) |
| Scaling | Manual browser pool | Automatic |
| Zombie processes | Common, needs monitoring | Not applicable |
| Maintenance | Chrome updates, driver compat | Zero |
| Serverless compatible | No (Chrome too large) | Yes |

## Parameter Mapping

| Puppeteer | ScreenshotAPI | Notes |
|---|---|---|
| `page.setViewport({ width, height })` | `width`, `height` | Query parameters |
| `page.goto(url)` | `url` | Query parameter |
| `{ waitUntil: 'networkidle0' }` | `waitUntil=networkidle` | `networkidle0` → `networkidle` |
| `{ waitUntil: 'load' }` | `waitUntil=load` | Same name |
| `{ waitUntil: 'domcontentloaded' }` | `waitUntil=domcontentloaded` | Same name |
| `page.waitForSelector('#el')` | `waitForSelector=#el` | Query parameter |
| `page.waitForTimeout(2000)` | `delay=2000` | Milliseconds |
| `{ fullPage: true }` | `fullPage=true` | Query parameter |
| `{ type: 'png' }` | `type=png` | `png`, `jpeg`, `webp` |
| `{ quality: 80 }` | `quality=80` | JPEG/WebP only |
| `page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }])` | `colorScheme=dark` | Single parameter |

## Before: Puppeteer

### Basic screenshot

```javascript
import puppeteer from 'puppeteer';

async function takeScreenshot(url) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  const buffer = await page.screenshot({ type: 'png' });

  await browser.close();
  return buffer;
}
```

### Full-page with dark mode

```javascript
async function takeFullPageDarkScreenshot(url) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setViewport({ width: 1440, height: 900 });
  await page.emulateMediaFeatures([
    { name: 'prefers-color-scheme', value: 'dark' }
  ]);
  await page.goto(url, { waitUntil: 'networkidle0' });
  const buffer = await page.screenshot({ fullPage: true, type: 'png' });

  await browser.close();
  return buffer;
}
```

### With selector waiting

```javascript
async function screenshotAfterLoad(url, selector) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector(selector, { timeout: 10000 });
  await page.waitForTimeout(500);
  const buffer = await page.screenshot({ type: 'png' });
  await browser.close();
  return buffer;
}
```

## After: ScreenshotAPI

### Basic screenshot

```javascript
async function takeScreenshot(url) {
  const params = new URLSearchParams({
    url,
    width: '1440',
    height: '900',
    type: 'png',
    waitUntil: 'networkidle'
  });

  const response = await fetch(
    `https://screenshotapi.to/api/v1/screenshot?${params}`,
    { headers: { 'x-api-key': process.env.SCREENSHOT_API_KEY } }
  );

  if (!response.ok) throw new Error(`Screenshot failed: ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}
```

### Full-page with dark mode

```javascript
async function takeFullPageDarkScreenshot(url) {
  const params = new URLSearchParams({
    url,
    width: '1440',
    fullPage: 'true',
    colorScheme: 'dark',
    type: 'png'
  });

  const response = await fetch(
    `https://screenshotapi.to/api/v1/screenshot?${params}`,
    { headers: { 'x-api-key': process.env.SCREENSHOT_API_KEY } }
  );

  return Buffer.from(await response.arrayBuffer());
}
```

### With selector waiting

```javascript
async function screenshotAfterLoad(url, selector) {
  const params = new URLSearchParams({
    url,
    width: '1440',
    height: '900',
    type: 'png',
    waitUntil: 'domcontentloaded',
    waitForSelector: selector,
    delay: '500'
  });

  const response = await fetch(
    `https://screenshotapi.to/api/v1/screenshot?${params}`,
    { headers: { 'x-api-key': process.env.SCREENSHOT_API_KEY } }
  );

  return Buffer.from(await response.arrayBuffer());
}
```

## Migration Steps

1. **Get an API key**: Sign up at [screenshotapi.to](/) for 5 free credits
2. **Add the API key to your environment**: Set `SCREENSHOT_API_KEY` in your `.env`
3. **Replace Puppeteer code**: Swap `browser.launch()` + `page.screenshot()` with `fetch()` calls
4. **Remove Puppeteer dependency**: `npm uninstall puppeteer`
5. **Remove Chrome from Docker**: Delete Chromium-related layers from your Dockerfile
6. **Test**: Verify screenshots match visually

## Dockerfile Cleanup

### Before

```dockerfile
FROM node:20

RUN apt-get update && apt-get install -y \
    chromium \
    libnss3 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxkbcommon0 \
    libgbm1 \
    --no-install-recommends

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

COPY . .
RUN npm install
CMD ["node", "server.js"]
```

### After

```dockerfile
FROM node:20-slim
COPY . .
RUN npm install
CMD ["node", "server.js"]
```

Image size reduction: **~1.5 GB → ~200 MB**.

## Error Handling Comparison

### Puppeteer (complex)

```javascript
try {
  const browser = await puppeteer.launch();
  // ... screenshot code ...
} catch (error) {
  if (error.message.includes('Navigation timeout')) {
    // Page took too long to load
  } else if (error.message.includes('net::ERR_')) {
    // Network error
  } else if (error.message.includes('Protocol error')) {
    // Browser crashed
  }
  // Ensure browser is closed even on error
  await browser?.close();
}
```

### ScreenshotAPI (simple)

```javascript
const response = await fetch(apiUrl, { headers });

if (!response.ok) {
  const error = await response.text();
  throw new Error(`Screenshot failed (${response.status}): ${error}`);
}
```

No zombie processes, no browser cleanup, no memory leak monitoring.

## Next Steps

- Read the [full API documentation](/docs) for all parameters
- See the [Puppeteer vs ScreenshotAPI comparison](/compare/screenshotapi-vs-puppeteer) for detailed benchmarks
- Check [pricing](/pricing) to choose a credit package
- Try the [JavaScript SDK](/docs/sdks/javascript) for a typed client
