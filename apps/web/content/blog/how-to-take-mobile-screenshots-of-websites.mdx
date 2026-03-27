---
title: "How to Take Mobile Screenshots of Websites"
description: "Capture mobile screenshots of any website with responsive viewport emulation. Test iPhone, Android, and tablet layouts programmatically."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Blog
    href: /blog
  - label: How to Take Mobile Screenshots of Websites
faq:
  - question: "How do I take a mobile screenshot of a website?"
    answer: "Set the viewport width to a mobile dimension (375px for iPhone, 360px for most Android phones) when calling the screenshot API. The website will render its responsive mobile layout at that viewport width."
  - question: "What viewport sizes should I use for mobile screenshots?"
    answer: "iPhone: 375x812 (standard) or 390x844 (Pro). Android: 360x800 (common) or 412x915 (Pixel). iPad: 768x1024. These cover the most popular device categories."
  - question: "Do mobile screenshots include the device frame?"
    answer: "No. The API captures only the rendered web page at the specified viewport size. For device mockup frames, use a design tool or overlay the screenshot onto a device template."
  - question: "Can I capture responsive breakpoints automatically?"
    answer: "Yes. Loop through an array of viewport widths and make one API call per breakpoint. This is useful for responsive design QA and documentation."
relatedPages:
  - title: "How to Take Full-Page Screenshots"
    description: "Capture entire scrollable pages at mobile viewports."
    href: "/blog/how-to-take-full-page-screenshots"
  - title: "How to Take Screenshots with JavaScript"
    description: "Node.js screenshot capture with viewport options."
    href: "/blog/how-to-take-screenshots-with-javascript"
  - title: "Visual Regression Testing"
    description: "Compare mobile layouts across releases."
    href: "/use-cases/visual-regression-testing"
jsonLd:
  "@context": "https://schema.org"
  "@type": "Article"
  headline: "How to Take Mobile Screenshots of Websites"
  description: "Capture mobile screenshots of any website with responsive viewport emulation. Test iPhone, Android, and tablet layouts programmatically."
  dateModified: "2026-03-25"
---

Mobile screenshots are essential for responsive design QA, app store listings, client presentations, and documentation. Rather than manually resizing browser windows, you can capture mobile-viewport screenshots programmatically. This guide covers how to take mobile screenshots of websites using both headless browsers and [ScreenshotAPI](/).

## Common Mobile Viewport Sizes

| Device | Width | Height | DPR |
|---|---|---|---|
| iPhone SE | 375 | 667 | 2 |
| iPhone 14 | 390 | 844 | 3 |
| iPhone 14 Pro Max | 430 | 932 | 3 |
| Samsung Galaxy S23 | 360 | 780 | 3 |
| Google Pixel 7 | 412 | 915 | 2.625 |
| iPad | 768 | 1024 | 2 |
| iPad Pro 12.9" | 1024 | 1366 | 2 |

The viewport width determines which responsive breakpoint the site uses. The height affects above-the-fold content.

## The Hard Way: Playwright

```javascript
import { chromium, devices } from 'playwright';

const browser = await chromium.launch();

const iphone = devices['iPhone 14'];
const context = await browser.newContext({ ...iphone });
const page = await context.newPage();
await page.goto('https://example.com', { waitUntil: 'networkidle' });
await page.screenshot({ path: 'mobile_iphone14.png' });
await context.close();

const pixel = devices['Pixel 7'];
const context2 = await browser.newContext({ ...pixel });
const page2 = await context2.newPage();
await page2.goto('https://example.com', { waitUntil: 'networkidle' });
await page2.screenshot({ path: 'mobile_pixel7.png' });
await context2.close();

await browser.close();
```

Playwright ships with a built-in device registry, but you still need to manage browser binaries and memory.

## The Easy Way: ScreenshotAPI

Set the `width` and `height` parameters to mobile dimensions. The website will render its responsive layout.

### iPhone screenshot

```bash
curl -G "https://screenshotapi.to/api/v1/screenshot" \
  -d "url=https://example.com" \
  -d "width=390" \
  -d "height=844" \
  -d "type=png" \
  -H "x-api-key: sk_live_your_api_key" \
  --output mobile_iphone.png
```

### Android screenshot

```bash
curl -G "https://screenshotapi.to/api/v1/screenshot" \
  -d "url=https://example.com" \
  -d "width=360" \
  -d "height=780" \
  -d "type=png" \
  -H "x-api-key: sk_live_your_api_key" \
  --output mobile_android.png
```

### Tablet screenshot

```bash
curl -G "https://screenshotapi.to/api/v1/screenshot" \
  -d "url=https://example.com" \
  -d "width=768" \
  -d "height=1024" \
  -d "type=png" \
  -H "x-api-key: sk_live_your_api_key" \
  --output tablet.png
```

## Capture All Breakpoints at Once

### JavaScript

```javascript
const API_KEY = process.env.SCREENSHOT_API_KEY;

const viewports = [
  { name: 'mobile-small', width: 320, height: 568 },
  { name: 'mobile', width: 375, height: 812 },
  { name: 'mobile-large', width: 430, height: 932 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

async function captureAllViewports(url) {
  const captures = viewports.map(async (vp) => {
    const params = new URLSearchParams({
      url,
      width: String(vp.width),
      height: String(vp.height),
      type: 'png',
      waitUntil: 'networkidle'
    });

    const response = await fetch(
      `https://screenshotapi.to/api/v1/screenshot?${params}`,
      { headers: { 'x-api-key': API_KEY } }
    );

    const buffer = Buffer.from(await response.arrayBuffer());
    const filename = `${vp.name}_${vp.width}x${vp.height}.png`;
    await fs.promises.writeFile(filename, buffer);
    return filename;
  });

  return Promise.all(captures);
}

await captureAllViewports('https://example.com');
```

### Python

```python
import asyncio
import aiohttp
import os

API_KEY = os.environ["SCREENSHOT_API_KEY"]

VIEWPORTS = [
    {"name": "mobile-small", "width": 320, "height": 568},
    {"name": "mobile", "width": 375, "height": 812},
    {"name": "mobile-large", "width": 430, "height": 932},
    {"name": "tablet", "width": 768, "height": 1024},
    {"name": "desktop", "width": 1440, "height": 900},
]

async def capture_viewport(session, url, viewport):
    params = {
        "url": url,
        "width": viewport["width"],
        "height": viewport["height"],
        "type": "png",
        "waitUntil": "networkidle",
    }

    async with session.get(
        "https://screenshotapi.to/api/v1/screenshot",
        params=params,
        headers={"x-api-key": API_KEY},
    ) as response:
        data = await response.read()
        filename = f"{viewport['name']}_{viewport['width']}x{viewport['height']}.png"
        with open(filename, "wb") as f:
            f.write(data)
        return filename

async def capture_all(url):
    async with aiohttp.ClientSession() as session:
        tasks = [capture_viewport(session, url, vp) for vp in VIEWPORTS]
        return await asyncio.gather(*tasks)

asyncio.run(capture_all("https://example.com"))
```

## Full-Page Mobile Screenshots

Combine mobile viewport with full-page capture:

```bash
curl -G "https://screenshotapi.to/api/v1/screenshot" \
  -d "url=https://example.com" \
  -d "width=375" \
  -d "fullPage=true" \
  -d "type=jpeg" \
  -d "quality=85" \
  -H "x-api-key: sk_live_your_api_key" \
  --output mobile_full_page.jpg
```

## Dark Mode Mobile Screenshots

```bash
curl -G "https://screenshotapi.to/api/v1/screenshot" \
  -d "url=https://example.com" \
  -d "width=375" \
  -d "height=812" \
  -d "colorScheme=dark" \
  -d "type=png" \
  -H "x-api-key: sk_live_your_api_key" \
  --output mobile_dark.png
```

## Use Cases

### Responsive design QA

Capture all breakpoints after each deployment and compare with previous versions. Integrate with your [visual regression testing pipeline](/blog/how-to-build-visual-regression-testing-pipeline).

### Client presentations

Show clients how their website appears on different devices without needing physical devices or browser dev tools.

### App store screenshots

Capture web app screens at exact device dimensions for App Store and Play Store listings.

### Documentation

Include mobile screenshots in developer documentation to show responsive behavior.

## Next Steps

- Learn to [capture dark mode screenshots](/blog/how-to-capture-dark-mode-screenshots) for both mobile and desktop
- Read about [full-page screenshots](/blog/how-to-take-full-page-screenshots) for capturing entire mobile pages
- Check the [API documentation](/docs) for all viewport parameters
- View [pricing](/pricing) for credit-based plans
