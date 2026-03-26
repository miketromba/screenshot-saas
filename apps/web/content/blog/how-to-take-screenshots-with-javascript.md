---
title: "How to Take Screenshots with JavaScript: Puppeteer, Playwright, and API"
description: "Capture website screenshots with Node.js using Puppeteer, Playwright, or ScreenshotAPI. Working code examples for every approach."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Blog
    href: /blog
  - label: How to Take Screenshots with JavaScript
faq:
  - question: "What is the best Node.js library for taking website screenshots?"
    answer: "Playwright is the best self-hosted option due to its auto-wait capabilities, built-in full-page support, and cleaner API. For production use without infrastructure overhead, a screenshot API is more practical."
  - question: "Can I take screenshots in the browser without a server?"
    answer: "Libraries like html2canvas can capture the current page's DOM in the browser, but they cannot navigate to external URLs or render pages with full CSS/JavaScript fidelity. Server-side solutions are required for capturing arbitrary URLs."
  - question: "How do I handle dynamic content when taking screenshots with Node.js?"
    answer: "Use waitForSelector to wait for a specific element to appear, or waitUntil: 'networkidle0' in Puppeteer (networkidle in Playwright/ScreenshotAPI) to wait until all network requests settle."
  - question: "How many concurrent screenshots can Puppeteer handle?"
    answer: "Each Puppeteer browser instance uses roughly 200-300 MB of RAM. A typical 2 GB server handles 4-6 concurrent captures before becoming unstable. ScreenshotAPI handles concurrency automatically in the cloud."
relatedPages:
  - title: "How to Take Screenshots with Python"
    description: "Capture screenshots using Selenium, Playwright, and the Python SDK."
    href: "/blog/how-to-take-screenshots-with-python"
  - title: "JavaScript SDK Documentation"
    description: "Full reference for the ScreenshotAPI JavaScript client."
    href: "/docs/sdks/javascript"
  - title: "How to Build Link Previews"
    description: "Generate rich link preview cards with thumbnail images."
    href: "/blog/how-to-build-link-previews"
  - title: "ScreenshotAPI vs Puppeteer"
    description: "Detailed comparison of Puppeteer and ScreenshotAPI for production use."
    href: "/compare/screenshotapi-vs-puppeteer"
jsonLd:
  "@context": "https://schema.org"
  "@type": "Article"
  headline: "How to Take Screenshots with JavaScript: Puppeteer, Playwright, and API"
  description: "Capture website screenshots with Node.js using Puppeteer, Playwright, or ScreenshotAPI. Working code examples for every approach."
  dateModified: "2026-03-25"
---

JavaScript is the most popular language for taking website screenshots programmatically. Whether you are building link previews, running visual tests, or generating OG images, this guide covers three approaches with working Node.js code.

## The Hard Way: Puppeteer

Puppeteer is Google's official Node.js library for controlling headless Chrome. It is battle-tested but comes with significant infrastructure overhead.

### Install

```bash
npm install puppeteer
```

This downloads a ~300 MB Chromium binary automatically.

### Basic screenshot

```javascript
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('https://example.com', { waitUntil: 'networkidle0' });
await page.screenshot({ path: 'screenshot.png' });
await browser.close();
```

### Full-page screenshot

```javascript
await page.screenshot({ path: 'full_page.png', fullPage: true });
```

### Wait for dynamic content

```javascript
await page.goto('https://example.com');
await page.waitForSelector('#dashboard-content', { timeout: 10000 });
await page.screenshot({ path: 'screenshot.png' });
```

### Capture a specific element

```javascript
const element = await page.$('.hero-section');
await element.screenshot({ path: 'hero.png' });
```

### Common Puppeteer pitfalls

Puppeteer works well in development but creates problems at scale:

- The Chromium binary adds ~300 MB to your Docker image
- Each browser instance consumes 200-300 MB of RAM
- Zombie browser processes leak memory on long-running servers
- `networkidle0` hangs on pages with persistent WebSocket connections
- Fonts may render differently across operating systems
- Sites with bot detection serve different content to headless Chrome

## The Better Hard Way: Playwright

Playwright improves on Puppeteer with better auto-waiting, multi-browser support, and a more predictable API.

### Install

```bash
npm install playwright
npx playwright install chromium
```

### Basic screenshot

```javascript
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('https://example.com', { waitUntil: 'networkidle' });
await page.screenshot({ path: 'screenshot.png' });
await browser.close();
```

### Full-page screenshot

```javascript
await page.screenshot({ path: 'full_page.png', fullPage: true });
```

### Dark mode

```javascript
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  colorScheme: 'dark'
});
const page = await context.newPage();
await page.goto('https://example.com');
await page.screenshot({ path: 'dark.png' });
```

### Multiple viewports

```javascript
const viewports = [
  { width: 1440, height: 900, name: 'desktop' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 375, height: 812, name: 'mobile' },
];

for (const vp of viewports) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  await page.goto('https://example.com', { waitUntil: 'networkidle' });
  await page.screenshot({ path: `${vp.name}.png` });
  await page.close();
}
```

### Playwright limitations

Playwright is better than Puppeteer, but the infrastructure challenges remain:

- Browser binaries still require hundreds of megabytes
- Scaling to 50+ concurrent screenshots requires a pool manager
- Docker images need system-level dependencies for font rendering
- Long-running browser pools eventually leak memory

## The Easy Way: ScreenshotAPI

[ScreenshotAPI](/) eliminates browser management entirely. Send an HTTP request, receive an image.

### Using fetch (Node.js 18+)

```javascript
const params = new URLSearchParams({
  url: 'https://example.com',
  width: '1440',
  height: '900',
  type: 'png'
});

const response = await fetch(
  `https://screenshotapi.to/api/v1/screenshot?${params}`,
  { headers: { 'x-api-key': 'sk_live_your_api_key' } }
);

const buffer = Buffer.from(await response.arrayBuffer());
await fs.promises.writeFile('screenshot.png', buffer);
```

### Full-page screenshot

```javascript
const params = new URLSearchParams({
  url: 'https://example.com',
  width: '1440',
  fullPage: 'true',
  type: 'png'
});

const response = await fetch(
  `https://screenshotapi.to/api/v1/screenshot?${params}`,
  { headers: { 'x-api-key': 'sk_live_your_api_key' } }
);
```

### Dark mode with WebP output

```javascript
const params = new URLSearchParams({
  url: 'https://example.com',
  width: '1440',
  height: '900',
  colorScheme: 'dark',
  type: 'webp',
  quality: '90'
});

const response = await fetch(
  `https://screenshotapi.to/api/v1/screenshot?${params}`,
  { headers: { 'x-api-key': 'sk_live_your_api_key' } }
);
```

### Wait for JavaScript-rendered content

```javascript
const params = new URLSearchParams({
  url: 'https://example.com',
  waitUntil: 'networkidle',
  waitForSelector: '#app-loaded',
  type: 'png'
});

const response = await fetch(
  `https://screenshotapi.to/api/v1/screenshot?${params}`,
  { headers: { 'x-api-key': 'sk_live_your_api_key' } }
);
```

### Reusable helper function

```javascript
const SCREENSHOT_API_KEY = process.env.SCREENSHOT_API_KEY;

async function screenshot(url, options = {}) {
  const params = new URLSearchParams({
    url,
    width: '1440',
    height: '900',
    type: 'png',
    ...options
  });

  const response = await fetch(
    `https://screenshotapi.to/api/v1/screenshot?${params}`,
    { headers: { 'x-api-key': SCREENSHOT_API_KEY } }
  );

  if (!response.ok) {
    throw new Error(`Screenshot failed: ${response.status}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

// Usage
const image = await screenshot('https://stripe.com', {
  colorScheme: 'dark',
  type: 'webp'
});
```

### Express.js integration

```javascript
import express from 'express';

const app = express();

app.get('/api/preview', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'url is required' });

  const params = new URLSearchParams({
    url,
    width: '1200',
    height: '630',
    type: 'jpeg',
    quality: '80'
  });

  const response = await fetch(
    `https://screenshotapi.to/api/v1/screenshot?${params}`,
    { headers: { 'x-api-key': process.env.SCREENSHOT_API_KEY } }
  );

  res.set('Content-Type', 'image/jpeg');
  res.set('Cache-Control', 'public, max-age=86400');
  res.send(Buffer.from(await response.arrayBuffer()));
});

app.listen(3000);
```

## Comparison Table

| Feature | Puppeteer | Playwright | ScreenshotAPI |
|---|---|---|---|
| Setup | `npm install` + 300 MB binary | `npm install` + browser install | API key only |
| Full-page | Native | Native | Native |
| Dark mode | Manual CSS injection | Native | Native |
| Wait strategies | `networkidle0`, selector | `networkidle`, selector | `networkidle`, selector |
| Concurrent limit | ~5 per 2 GB RAM | ~5 per 2 GB RAM | Unlimited |
| Docker image | ~1.5 GB | ~900 MB | Not needed |
| Serverless-friendly | No | No | Yes |
| Output formats | PNG, JPEG, WebP | PNG, JPEG | PNG, JPEG, WebP |

## When to Use Each

**Choose Puppeteer** if you need fine-grained browser control beyond screenshots, like form submission, cookie management, or complex navigation flows.

**Choose Playwright** if you are already using it for end-to-end tests and want to add screenshot capture to your test pipeline.

**Choose [ScreenshotAPI](/)** for production features like [link previews](/blog/how-to-build-link-previews), [OG image generation](/use-cases/og-image-generation), or any scenario where you need reliable screenshots without managing browser infrastructure. Check the [pricing page](/pricing) for credit-based plans that scale with your usage.

## Next Steps

- Browse the [API documentation](/docs) for the full parameter reference
- Try the [Next.js integration guide](/integrations/nextjs) for server-side rendering workflows
- Learn how to [migrate from Puppeteer](/blog/migrate-from-puppeteer) if you are already using it
