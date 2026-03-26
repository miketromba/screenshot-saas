---
title: "Migrate from Browserless to ScreenshotAPI"
description: "Switch from Browserless to ScreenshotAPI for screenshot capture. Eliminate self-hosted Chrome management with a simple REST API migration."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Blog
    href: /blog
  - label: Migrate from Browserless
faq:
  - question: "What is the difference between Browserless and ScreenshotAPI?"
    answer: "Browserless is a cloud-hosted headless Chrome service. You connect Puppeteer or Playwright to their Chrome instances instead of running Chrome locally. ScreenshotAPI is a higher-level REST API specifically for screenshot capture. No Puppeteer or Playwright code needed."
  - question: "Is ScreenshotAPI simpler than Browserless?"
    answer: "Yes, significantly. Browserless requires Puppeteer/Playwright code to control the browser. ScreenshotAPI is a single GET request with query parameters. You go from 15-20 lines of browser automation code to a single HTTP call."
  - question: "Can ScreenshotAPI do everything Browserless does?"
    answer: "For screenshot capture, yes. Browserless also supports PDFs, web scraping, and general browser automation. If you only need screenshots, ScreenshotAPI is simpler and more cost-effective."
  - question: "How does pricing compare?"
    answer: "Browserless charges based on concurrent browser sessions and compute time. ScreenshotAPI charges per screenshot with credits that never expire. For screenshot-only workloads, ScreenshotAPI is typically cheaper."
relatedPages:
  - title: "Migrate from Puppeteer"
    description: "Migration guide for Puppeteer users."
    href: "/blog/migrate-from-puppeteer"
  - title: "Best Screenshot APIs"
    description: "Full comparison of screenshot services."
    href: "/blog/best-screenshot-apis"
  - title: "ScreenshotAPI vs Puppeteer"
    description: "API vs. browser automation comparison."
    href: "/compare/screenshotapi-vs-puppeteer"
jsonLd:
  "@context": "https://schema.org"
  "@type": "Article"
  headline: "Migrate from Browserless to ScreenshotAPI"
  description: "Switch from Browserless to ScreenshotAPI for screenshot capture. Eliminate self-hosted Chrome management with a simple REST API migration."
  dateModified: "2026-03-25"
---

Browserless provides cloud-hosted Chrome instances that you control via Puppeteer or Playwright. It solves the Chrome infrastructure problem but still requires browser automation code. If your primary use case is screenshot capture, [ScreenshotAPI](/) provides a simpler, more focused alternative: a single REST API call instead of browser automation scripts.

## Architecture Comparison

### Browserless

```
Your Code → Puppeteer/Playwright → Browserless WebSocket → Chrome → Screenshot
```

You write browser automation code. Browserless hosts the Chrome instance. You still manage Puppeteer/Playwright dependencies, connection handling, and error recovery.

### ScreenshotAPI

```
Your Code → HTTP GET → ScreenshotAPI → Screenshot
```

You make a single HTTP request. ScreenshotAPI handles everything else.

## Code Comparison

### Browserless (Puppeteer)

```javascript
import puppeteer from 'puppeteer';

async function takeScreenshot(url) {
  const browser = await puppeteer.connect({
    browserWSEndpoint: `wss://chrome.browserless.io?token=${BROWSERLESS_TOKEN}`
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  const buffer = await page.screenshot({ type: 'png' });

  await page.close();
  await browser.disconnect();

  return buffer;
}
```

### Browserless REST API

```javascript
async function takeScreenshot(url) {
  const response = await fetch(
    `https://chrome.browserless.io/screenshot?token=${BROWSERLESS_TOKEN}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        options: {
          type: 'png',
          fullPage: false
        },
        viewport: {
          width: 1440,
          height: 900
        },
        waitForTimeout: 5000
      })
    }
  );

  return Buffer.from(await response.arrayBuffer());
}
```

### ScreenshotAPI

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

Key differences:
- **GET instead of POST**: Simpler, cacheable, easy to test in a browser
- **Query params instead of JSON body**: No serialization needed
- **No Puppeteer dependency**: Remove an entire dependency tree

## Parameter Mapping

| Browserless (REST API) | ScreenshotAPI | Notes |
|---|---|---|
| `url` (in JSON body) | `url` (query param) | GET vs POST |
| `viewport.width` | `width` | Flat param |
| `viewport.height` | `height` | Flat param |
| `options.type: 'png'` | `type=png` | Query param |
| `options.quality: 80` | `quality=80` | Query param |
| `options.fullPage: true` | `fullPage=true` | Query param |
| `waitForTimeout: 5000` | `delay=5000` | Renamed |
| `waitForSelector: '.el'` | `waitForSelector=.el` | Same concept |
| `emulatedMedia: [{name: 'prefers-color-scheme', value: 'dark'}]` | `colorScheme=dark` | Simplified |

## Browserless Puppeteer Connection → ScreenshotAPI

### Before: Puppeteer with Browserless WebSocket

```javascript
import puppeteer from 'puppeteer';

async function captureFullPageDark(url) {
  const browser = await puppeteer.connect({
    browserWSEndpoint: `wss://chrome.browserless.io?token=${process.env.BROWSERLESS_TOKEN}`
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.emulateMediaFeatures([
      { name: 'prefers-color-scheme', value: 'dark' }
    ]);
    await page.goto(url, { waitUntil: 'networkidle0' });
    const buffer = await page.screenshot({ fullPage: true, type: 'png' });
    await page.close();
    return buffer;
  } finally {
    await browser.disconnect();
  }
}
```

### After: ScreenshotAPI

```javascript
async function captureFullPageDark(url) {
  const params = new URLSearchParams({
    url,
    width: '1440',
    fullPage: 'true',
    colorScheme: 'dark',
    type: 'png',
    waitUntil: 'networkidle'
  });

  const response = await fetch(
    `https://screenshotapi.to/api/v1/screenshot?${params}`,
    { headers: { 'x-api-key': process.env.SCREENSHOT_API_KEY } }
  );

  return Buffer.from(await response.arrayBuffer());
}
```

15+ lines reduced to 12 lines, with no browser connection management, no try/finally cleanup, and no Puppeteer dependency.

## Dependency Cleanup

### Before

```json
{
  "dependencies": {
    "puppeteer-core": "^22.0.0"
  }
}
```

### After

```json
{
  "dependencies": {}
}
```

No additional dependencies needed. ScreenshotAPI works with Node.js built-in `fetch`.

## Handling Browserless-Specific Features

### `/unblock` API (bot detection bypass)

Browserless offers an `/unblock` endpoint for sites that detect headless browsers. ScreenshotAPI handles anti-bot measures on the server side.

### `/pdf` endpoint

If you use Browserless for PDF generation in addition to screenshots, you will need a separate PDF solution. ScreenshotAPI focuses on screenshot capture.

### `/scrape` endpoint

For web scraping, consider a dedicated scraping service. ScreenshotAPI is optimized for visual capture.

## Migration Steps

1. **Sign up** at [screenshotapi.to](/) for 5 free credits
2. **Replace screenshot functions**: Swap Browserless calls with ScreenshotAPI GET requests
3. **Remove Puppeteer**: `npm uninstall puppeteer-core` (or `puppeteer`)
4. **Update environment variables**: Replace `BROWSERLESS_TOKEN` with `SCREENSHOT_API_KEY`
5. **Test**: Compare screenshots visually
6. **Cancel Browserless subscription** (if screenshot-only usage)

## When to Keep Browserless

Keep Browserless if you also use it for:

- PDF generation
- Web scraping with JavaScript execution
- Multi-step browser automation (login flows, form filling)
- Custom JavaScript injection before capture

If screenshots are a small part of your Browserless usage, you can migrate just the screenshot portion to ScreenshotAPI and keep Browserless for other tasks.

## Next Steps

- Read the [API documentation](/docs) for all parameters
- Compare options in the [best screenshot APIs guide](/blog/best-screenshot-apis)
- Check [pricing](/pricing) for credit packages
- See the [Puppeteer migration guide](/blog/migrate-from-puppeteer) for more Puppeteer-specific details
