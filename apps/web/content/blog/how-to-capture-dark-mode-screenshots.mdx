---
title: "How to Capture Dark Mode Screenshots of Any Website"
description: "Force dark mode rendering when capturing website screenshots. Works with CSS prefers-color-scheme, Tailwind dark mode, and custom implementations."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Blog
    href: /blog
  - label: How to Capture Dark Mode Screenshots
faq:
  - question: "How does dark mode screenshot capture work?"
    answer: "The browser emulates the prefers-color-scheme: dark media query, which triggers CSS dark mode styles on the target page. This works with any site that uses the standard CSS media query for dark mode."
  - question: "Does dark mode capture work with Tailwind CSS?"
    answer: "Yes, if the site uses Tailwind's media strategy (class='dark:bg-gray-900'). If the site uses Tailwind's class strategy with a manual toggle, the colorScheme parameter alone may not trigger it since it relies on a .dark class on the HTML element rather than the media query."
  - question: "Can I capture both light and dark mode screenshots?"
    answer: "Yes. Make two API calls with colorScheme=light and colorScheme=dark respectively. This is useful for app store listings, documentation, and marketing materials."
  - question: "What if the site does not support dark mode?"
    answer: "If the site has no dark mode CSS, the colorScheme parameter has no effect and the screenshot renders in the default light appearance."
relatedPages:
  - title: "How to Take Screenshots with JavaScript"
    description: "Node.js screenshot capture with dark mode examples."
    href: "/blog/how-to-take-screenshots-with-javascript"
  - title: "How to Take Full-Page Screenshots"
    description: "Capture entire pages in dark mode."
    href: "/blog/how-to-take-full-page-screenshots"
  - title: "How to Generate OG Images from URL"
    description: "Create dark mode OG images for social sharing."
    href: "/blog/how-to-generate-og-images-from-url"
jsonLd:
  "@context": "https://schema.org"
  "@type": "Article"
  headline: "How to Capture Dark Mode Screenshots of Any Website"
  description: "Force dark mode rendering when capturing website screenshots. Works with CSS prefers-color-scheme, Tailwind dark mode, and custom implementations."
  dateModified: "2026-03-25"
---

Dark mode screenshots are essential for app store listings, documentation that matches user preferences, marketing sites, and design comparisons. Capturing dark mode programmatically requires emulating the browser's `prefers-color-scheme: dark` media query. This guide shows how to do it with both headless browsers and a screenshot API.

## How Dark Mode Detection Works

Websites implement dark mode by responding to the CSS media query:

```css
@media (prefers-color-scheme: dark) {
  body {
    background-color: #1a1a1a;
    color: #ffffff;
  }
}
```

When a browser reports that the user prefers dark mode, the site applies its dark styles. Screenshot tools can emulate this preference.

## The Hard Way: Playwright

Playwright has native support for color scheme emulation.

```javascript
import { chromium } from 'playwright';

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  colorScheme: 'dark'
});

const page = await context.newPage();
await page.goto('https://github.com', { waitUntil: 'networkidle' });
await page.screenshot({ path: 'github_dark.png' });
await browser.close();
```

### Capturing both modes

```javascript
for (const scheme of ['light', 'dark']) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: scheme
  });
  const page = await context.newPage();
  await page.goto('https://github.com', { waitUntil: 'networkidle' });
  await page.screenshot({ path: `github_${scheme}.png` });
  await context.close();
}
```

### Puppeteer (manual approach)

Puppeteer requires CDP commands to emulate color scheme:

```javascript
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.emulateMediaFeatures([
  { name: 'prefers-color-scheme', value: 'dark' }
]);
await page.setViewport({ width: 1440, height: 900 });
await page.goto('https://github.com', { waitUntil: 'networkidle0' });
await page.screenshot({ path: 'github_dark.png' });
await browser.close();
```

### Problems with browser-based dark mode capture

- Puppeteer's media emulation API is verbose
- Sites using JavaScript-based toggles (localStorage) may not respond to media queries
- Tailwind's `class` dark mode strategy requires injecting a CSS class, not a media query
- Managing browser processes for two screenshots per URL doubles resource usage

## The Easy Way: ScreenshotAPI

[ScreenshotAPI](/) supports dark mode capture with a single `colorScheme` parameter.

### Dark mode screenshot

```bash
curl -G "https://screenshotapi.to/api/v1/screenshot" \
  -d "url=https://github.com" \
  -d "width=1440" \
  -d "height=900" \
  -d "colorScheme=dark" \
  -d "type=png" \
  -H "x-api-key: sk_live_your_api_key" \
  --output github_dark.png
```

### Light mode screenshot

```bash
curl -G "https://screenshotapi.to/api/v1/screenshot" \
  -d "url=https://github.com" \
  -d "width=1440" \
  -d "height=900" \
  -d "colorScheme=light" \
  -d "type=png" \
  -H "x-api-key: sk_live_your_api_key" \
  --output github_light.png
```

### Both modes in JavaScript

```javascript
const API_KEY = process.env.SCREENSHOT_API_KEY;

async function captureColorSchemes(url) {
  const results = {};

  for (const scheme of ['light', 'dark']) {
    const params = new URLSearchParams({
      url,
      width: '1440',
      height: '900',
      colorScheme: scheme,
      type: 'png',
      waitUntil: 'networkidle'
    });

    const response = await fetch(
      `https://screenshotapi.to/api/v1/screenshot?${params}`,
      { headers: { 'x-api-key': API_KEY } }
    );

    results[scheme] = Buffer.from(await response.arrayBuffer());
  }

  return results;
}

const { light, dark } = await captureColorSchemes('https://github.com');
await fs.promises.writeFile('light.png', light);
await fs.promises.writeFile('dark.png', dark);
```

### Python

```python
import requests

API_KEY = "sk_live_your_api_key"

for scheme in ["light", "dark"]:
    response = requests.get(
        "https://screenshotapi.to/api/v1/screenshot",
        params={
            "url": "https://github.com",
            "width": 1440,
            "height": 900,
            "colorScheme": scheme,
            "type": "png",
        },
        headers={"x-api-key": API_KEY},
    )

    with open(f"github_{scheme}.png", "wb") as f:
        f.write(response.content)
```

## Use Cases for Dark Mode Screenshots

### App store listings

App stores expect screenshots showing both light and dark appearances. Batch capture your web app in both modes:

```javascript
const pages = ['/dashboard', '/settings', '/analytics'];

for (const path of pages) {
  for (const scheme of ['light', 'dark']) {
    const params = new URLSearchParams({
      url: `https://yourapp.com${path}`,
      width: '1440',
      height: '900',
      colorScheme: scheme,
      type: 'png'
    });

    const response = await fetch(
      `https://screenshotapi.to/api/v1/screenshot?${params}`,
      { headers: { 'x-api-key': process.env.SCREENSHOT_API_KEY } }
    );

    const name = path.slice(1) || 'home';
    const buffer = Buffer.from(await response.arrayBuffer());
    await fs.promises.writeFile(`${name}_${scheme}.png`, buffer);
  }
}
```

### Documentation

Embed screenshots that match the reader's theme preference. Generate both versions and use CSS to swap them:

```html
<picture>
  <source srcset="/screenshots/dark.png" media="(prefers-color-scheme: dark)" />
  <img src="/screenshots/light.png" alt="Dashboard screenshot" />
</picture>
```

### Marketing materials

Dark mode screenshots on dark backgrounds create a sleek, modern look for landing pages and promotional materials.

## Sites That Support Dark Mode

Most modern sites support `prefers-color-scheme`. Notable examples:

- GitHub, GitLab, Bitbucket
- Twitter/X, Reddit, Discord
- Stripe, Linear, Vercel
- MDN, Stack Overflow
- Most sites built with Tailwind CSS (media strategy)

## Troubleshooting

**Site renders in light mode despite colorScheme=dark**: The site may use a JavaScript toggle (localStorage) instead of the CSS media query. Try adding a `delay` parameter to allow JavaScript to execute.

**Colors look slightly different**: Some sites blend media queries with custom theme logic. The screenshot reflects what a real user would see with dark mode enabled.

## Next Steps

- Learn how to [generate dark mode OG images](/blog/how-to-generate-og-images-from-url) for social sharing
- Capture [full-page dark mode screenshots](/blog/how-to-take-full-page-screenshots) for complete page documentation
- Read the [API documentation](/docs) for all available parameters
- Check [pricing](/pricing) for credit-based plans
