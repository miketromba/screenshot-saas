---
title: "Migrate from Playwright to ScreenshotAPI"
description: "Replace Playwright screenshot code with ScreenshotAPI. Parameter mapping table, before/after examples, and Docker image reduction guide."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Blog
    href: /blog
  - label: Migrate from Playwright
faq:
  - question: "Is Playwright or ScreenshotAPI better for screenshots?"
    answer: "Playwright is better if you need full browser automation (form filling, navigation, testing). ScreenshotAPI is better if you only need to capture screenshots, because it eliminates infrastructure overhead."
  - question: "Does ScreenshotAPI support Playwright's wait strategies?"
    answer: "Yes. Playwright's waitUntil: networkidle maps to waitUntil=networkidle in ScreenshotAPI. Playwright's waitForSelector maps to the waitForSelector parameter. The colorScheme context option maps to the colorScheme parameter."
  - question: "How much smaller will my Docker image be?"
    answer: "Removing Playwright and its browser binaries typically reduces Docker image size from 800 MB-1.2 GB to under 200 MB."
  - question: "Can I migrate incrementally?"
    answer: "Yes. Create a wrapper function that supports both backends. Use an environment variable to toggle between Playwright and ScreenshotAPI during your migration period."
relatedPages:
  - title: "Migrate from Puppeteer"
    description: "Similar migration guide for Puppeteer users."
    href: "/blog/migrate-from-puppeteer"
  - title: "How to Take Screenshots with JavaScript"
    description: "All approaches to screenshot capture in Node.js."
    href: "/blog/how-to-take-screenshots-with-javascript"
  - title: "ScreenshotAPI vs Puppeteer"
    description: "API vs. self-hosted browser comparison."
    href: "/compare/screenshotapi-vs-puppeteer"
jsonLd:
  "@context": "https://schema.org"
  "@type": "Article"
  headline: "Migrate from Playwright to ScreenshotAPI"
  description: "Replace Playwright screenshot code with ScreenshotAPI. Parameter mapping table, before/after examples, and Docker image reduction guide."
  dateModified: "2026-03-25"
---

Playwright is an excellent testing framework, but using it solely for screenshot capture means managing browser binaries, handling memory usage, and maintaining Docker images with hundreds of megabytes of browser dependencies. If screenshots are your only use case, migrating to [ScreenshotAPI](/) eliminates that overhead.

## Parameter Mapping

| Playwright | ScreenshotAPI | Notes |
|---|---|---|
| `viewport: { width, height }` | `width`, `height` | Query parameters |
| `page.goto(url)` | `url` | Query parameter |
| `waitUntil: 'networkidle'` | `waitUntil=networkidle` | Same value |
| `waitUntil: 'load'` | `waitUntil=load` | Same value |
| `waitUntil: 'domcontentloaded'` | `waitUntil=domcontentloaded` | Same value |
| `page.waitForSelector(sel)` | `waitForSelector=sel` | Query parameter |
| `fullPage: true` | `fullPage=true` | Query parameter |
| `type: 'png'` | `type=png` | `png`, `jpeg`, `webp` |
| `quality: 80` | `quality=80` | JPEG/WebP only |
| `colorScheme: 'dark'` | `colorScheme=dark` | Context → query param |
| `page.waitForTimeout(ms)` | `delay=ms` | Milliseconds |

## Before: Playwright

### Basic screenshot

```javascript
import { chromium } from 'playwright';

async function takeScreenshot(url) {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 }
  });

  await page.goto(url, { waitUntil: 'networkidle' });
  const buffer = await page.screenshot({ type: 'png' });

  await browser.close();
  return buffer;
}
```

### Dark mode full-page

```javascript
async function takeFullPageDark(url) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark'
  });
  const page = await context.newPage();

  await page.goto(url, { waitUntil: 'networkidle' });
  const buffer = await page.screenshot({ fullPage: true, type: 'png' });

  await browser.close();
  return buffer;
}
```

### Multiple viewports

```javascript
async function captureViewports(url) {
  const browser = await chromium.launch();
  const results = {};

  for (const vp of [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 375, height: 812 },
  ]) {
    const page = await browser.newPage({
      viewport: { width: vp.width, height: vp.height }
    });
    await page.goto(url, { waitUntil: 'networkidle' });
    results[vp.name] = await page.screenshot({ type: 'png' });
    await page.close();
  }

  await browser.close();
  return results;
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

### Dark mode full-page

```javascript
async function takeFullPageDark(url) {
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

### Multiple viewports (parallel)

```javascript
async function captureViewports(url) {
  const viewports = [
    { name: 'desktop', width: '1440', height: '900' },
    { name: 'tablet', width: '768', height: '1024' },
    { name: 'mobile', width: '375', height: '812' },
  ];

  const captures = viewports.map(async (vp) => {
    const params = new URLSearchParams({
      url,
      width: vp.width,
      height: vp.height,
      type: 'png',
      waitUntil: 'networkidle'
    });

    const response = await fetch(
      `https://screenshotapi.to/api/v1/screenshot?${params}`,
      { headers: { 'x-api-key': process.env.SCREENSHOT_API_KEY } }
    );

    return [vp.name, Buffer.from(await response.arrayBuffer())];
  });

  return Object.fromEntries(await Promise.all(captures));
}
```

With the API, multiple viewports can be captured in parallel without managing separate browser contexts.

## Incremental Migration

Create a wrapper that supports both backends:

```javascript
const USE_API = process.env.SCREENSHOT_BACKEND === 'api';

async function takeScreenshot(url, options = {}) {
  if (USE_API) {
    return takeScreenshotAPI(url, options);
  }
  return takeScreenshotPlaywright(url, options);
}
```

Toggle with `SCREENSHOT_BACKEND=api` when ready.

## Migration Steps

1. **Sign up** at [screenshotapi.to](/) and get an API key
2. **Add wrapper**: Create a screenshot function that supports both backends
3. **Test in parallel**: Run both backends and compare output visually
4. **Switch**: Set the environment variable to use the API
5. **Remove Playwright**: `npm uninstall playwright @playwright/test`
6. **Clean Docker**: Remove `npx playwright install` and browser deps from Dockerfile

## Infrastructure Savings

### Before (Playwright Docker)

```dockerfile
FROM mcr.microsoft.com/playwright:v1.42.0-jammy
COPY . .
RUN npm ci
CMD ["node", "server.js"]
```

Image size: **~1.2 GB**

### After (API-based)

```dockerfile
FROM node:20-slim
COPY . .
RUN npm ci
CMD ["node", "server.js"]
```

Image size: **~200 MB**

## When to Keep Playwright

Keep Playwright if you also use it for:

- End-to-end testing (use Playwright for tests, API for production screenshots)
- Form automation and multi-step navigation flows
- Cookie injection and authentication flows
- JavaScript execution before screenshot (custom scripts)

## Next Steps

- Read the [API documentation](/docs) for all parameters
- Check [pricing](/pricing) for credit packages
- See the [JavaScript guide](/blog/how-to-take-screenshots-with-javascript) for more examples
- Compare [ScreenshotAPI vs Puppeteer](/compare/screenshotapi-vs-puppeteer) for detailed analysis
