---
title: "How to Take Full-Page Screenshots with an API"
description: "Capture entire scrollable web pages from top to bottom using a screenshot API. Handles lazy-loaded content, sticky headers, and infinite scroll."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Blog
    href: /blog
  - label: How to Take Full-Page Screenshots
faq:
  - question: "What is a full-page screenshot?"
    answer: "A full-page screenshot captures the entire scrollable content of a web page, not just the visible viewport. The resulting image is as wide as the viewport and as tall as the total page content."
  - question: "How do I capture lazy-loaded images in a full-page screenshot?"
    answer: "ScreenshotAPI scrolls through the entire page before capturing, which triggers lazy-loaded images and infinite scroll content. The waitUntil=networkidle parameter ensures all network requests complete before the final capture."
  - question: "What format is best for full-page screenshots?"
    answer: "JPEG at 80-85% quality is recommended for full-page captures. Full-page images can be very tall (5000-10000px), and PNG files at those dimensions can be 5-10 MB. JPEG keeps files under 1 MB in most cases."
  - question: "Can I capture full-page screenshots of SPAs?"
    answer: "Yes. Use the waitForSelector parameter to ensure the SPA has finished rendering, combined with fullPage=true. ScreenshotAPI handles the scrolling and lazy-loading triggers automatically."
relatedPages:
  - title: "How to Take Screenshots with JavaScript"
    description: "Node.js screenshot capture with Puppeteer and Playwright."
    href: "/blog/how-to-take-screenshots-with-javascript"
  - title: "How to Screenshot Single-Page Applications"
    description: "Handle SPAs with dynamic content and lazy loading."
    href: "/blog/how-to-screenshot-single-page-applications"
  - title: "Visual Regression Testing"
    description: "Compare full-page screenshots to detect UI changes."
    href: "/use-cases/visual-regression-testing"
jsonLd:
  "@context": "https://schema.org"
  "@type": "Article"
  headline: "How to Take Full-Page Screenshots with an API"
  description: "Capture entire scrollable web pages from top to bottom using a screenshot API. Handles lazy-loaded content, sticky headers, and infinite scroll."
  dateModified: "2026-03-25"
---

A full-page screenshot captures everything on a web page, from the hero section to the footer, in a single tall image. This is useful for archiving, compliance documentation, design review, and [visual regression testing](/use-cases/visual-regression-testing). Standard viewport screenshots miss everything below the fold.

## The Hard Way: Puppeteer

Puppeteer supports full-page screenshots natively, but handling real-world pages requires extra work.

### Basic full-page capture

```javascript
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto('https://example.com', { waitUntil: 'networkidle0' });
await page.screenshot({ path: 'full_page.png', fullPage: true });
await browser.close();
```

### Handling lazy-loaded images

Many pages load images only when they scroll into view. Puppeteer's `fullPage: true` takes the screenshot immediately, before lazy images load. You need to scroll through the page first:

```javascript
async function scrollToBottom(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 400;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

await page.goto('https://example.com', { waitUntil: 'networkidle0' });
await scrollToBottom(page);
await page.waitForTimeout(1000);
await page.screenshot({ path: 'full_page.png', fullPage: true });
```

### Handling sticky headers

Sticky headers appear at the top of every scrolled section, creating visual artifacts in full-page screenshots. Remove them before capturing:

```javascript
await page.evaluate(() => {
  const stickies = document.querySelectorAll('[style*="position: sticky"], [style*="position: fixed"]');
  stickies.forEach(el => el.style.position = 'relative');
});
await page.screenshot({ path: 'full_page.png', fullPage: true });
```

### Problems with Puppeteer full-page screenshots

- Lazy-loaded content requires manual scrolling logic
- Sticky/fixed elements repeat across the image
- Pages with infinite scroll never reach a "bottom"
- Very tall pages (10000+ px) can cause memory issues
- Animation frames may be partially rendered

## The Easy Way: ScreenshotAPI

[ScreenshotAPI](/) handles scrolling, lazy loading, sticky elements, and content stabilization automatically.

### Basic full-page capture

```bash
curl -G "https://screenshotapi.to/api/v1/screenshot" \
  -d "url=https://example.com" \
  -d "width=1440" \
  -d "fullPage=true" \
  -d "type=png" \
  -H "x-api-key: sk_live_your_api_key" \
  --output full_page.png
```

### Full-page JPEG for smaller file size

```bash
curl -G "https://screenshotapi.to/api/v1/screenshot" \
  -d "url=https://example.com" \
  -d "width=1440" \
  -d "fullPage=true" \
  -d "type=jpeg" \
  -d "quality=85" \
  -H "x-api-key: sk_live_your_api_key" \
  --output full_page.jpg
```

### JavaScript SDK

```javascript
const params = new URLSearchParams({
  url: 'https://example.com',
  width: '1440',
  fullPage: 'true',
  type: 'png',
  waitUntil: 'networkidle'
});

const response = await fetch(
  `https://screenshotapi.to/api/v1/screenshot?${params}`,
  { headers: { 'x-api-key': 'sk_live_your_api_key' } }
);

const buffer = Buffer.from(await response.arrayBuffer());
await fs.promises.writeFile('full_page.png', buffer);
```

### Python

```python
import requests

response = requests.get(
    "https://screenshotapi.to/api/v1/screenshot",
    params={
        "url": "https://example.com",
        "width": 1440,
        "fullPage": True,
        "type": "png",
        "waitUntil": "networkidle",
    },
    headers={"x-api-key": "sk_live_your_api_key"},
)

with open("full_page.png", "wb") as f:
    f.write(response.content)
```

## Full-Page Screenshot Use Cases

### Website archiving

Capture complete pages for compliance records or legal evidence:

```javascript
async function archivePage(url, outputDir) {
  const timestamp = new Date().toISOString().split('T')[0];
  const domain = new URL(url).hostname.replace(/\./g, '_');
  const filename = `${outputDir}/${domain}_${timestamp}.png`;

  const params = new URLSearchParams({
    url,
    width: '1440',
    fullPage: 'true',
    type: 'png',
    waitUntil: 'networkidle'
  });

  const response = await fetch(
    `https://screenshotapi.to/api/v1/screenshot?${params}`,
    { headers: { 'x-api-key': process.env.SCREENSHOT_API_KEY } }
  );

  await fs.promises.writeFile(filename, Buffer.from(await response.arrayBuffer()));
  return filename;
}
```

### Design review

Capture multiple viewports for responsive design review:

```javascript
const viewports = [
  { width: 1440, name: 'desktop' },
  { width: 768, name: 'tablet' },
  { width: 375, name: 'mobile' },
];

for (const vp of viewports) {
  const params = new URLSearchParams({
    url: 'https://example.com',
    width: String(vp.width),
    fullPage: 'true',
    type: 'png'
  });

  const response = await fetch(
    `https://screenshotapi.to/api/v1/screenshot?${params}`,
    { headers: { 'x-api-key': process.env.SCREENSHOT_API_KEY } }
  );

  const buffer = Buffer.from(await response.arrayBuffer());
  await fs.promises.writeFile(`review_${vp.name}.png`, buffer);
}
```

## Optimizing Full-Page Screenshots

### File size

Full-page images can be large. Strategies to reduce file size:

| Format | Typical size (1440px wide, 5000px tall) | Best for |
|---|---|---|
| PNG | 3-8 MB | Pixel-perfect archiving |
| JPEG 85% | 300-800 KB | Design review, sharing |
| WebP 85% | 200-600 KB | Web display |

### Performance

- Use `waitUntil=load` instead of `networkidle` for faster captures when lazy-loading is not important
- Use JPEG or WebP format for faster transfer
- Cache results aggressively if the page content does not change frequently

## Comparison: Viewport vs. Full-Page

| Aspect | Viewport Screenshot | Full-Page Screenshot |
|---|---|---|
| Content captured | Above the fold only | Entire page |
| Image dimensions | Fixed (e.g., 1440x900) | Fixed width, variable height |
| File size | Small (~100 KB) | Large (500 KB - 5 MB) |
| Use case | Thumbnails, OG images | Archiving, testing, review |
| Lazy-loaded content | Not triggered | Triggered by scrolling |

## Next Steps

- Read about [visual regression testing](/blog/how-to-build-visual-regression-testing-pipeline) using full-page screenshots
- Learn how to [capture mobile screenshots](/blog/how-to-take-mobile-screenshots-of-websites) at different viewports
- Check the [API documentation](/docs) for the complete parameter reference
- View [pricing](/pricing) for credit packages
