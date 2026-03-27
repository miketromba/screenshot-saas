---
title: "How to Convert HTML to Image with an API"
description: "Convert HTML pages and raw HTML strings to PNG, JPEG, or WebP images. Compare browser-based, server-side, and API approaches with code examples."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Blog
    href: /blog
  - label: How to Convert HTML to Image
faq:
  - question: "How do I convert HTML to an image?"
    answer: "The most reliable method is using a headless browser (Puppeteer, Playwright) or a screenshot API to render the HTML and capture it as a PNG, JPEG, or WebP image. Client-side libraries like html2canvas work for simple cases but have limited CSS support."
  - question: "Can I convert HTML to image without a browser?"
    answer: "Libraries like Satori can convert a subset of HTML/CSS to SVG without a browser, but they do not support full CSS. For complete rendering fidelity, a browser engine is required. Screenshot APIs handle this in the cloud."
  - question: "What is the best HTML to image API?"
    answer: "ScreenshotAPI provides high-fidelity HTML-to-image conversion using real Chrome rendering. It supports full CSS, JavaScript execution, web fonts, and modern layout features like Grid and Flexbox."
  - question: "Can I convert raw HTML strings to images?"
    answer: "Yes. Host the HTML on a temporary URL or use a data URI approach. With Puppeteer, use page.setContent(). With ScreenshotAPI, host the HTML at a URL and pass it as the url parameter."
relatedPages:
  - title: "Best HTML to Image APIs"
    description: "Compare the top HTML-to-image conversion services."
    href: "/blog/best-html-to-image-apis"
  - title: "How to Generate OG Images from URL"
    description: "Generate social preview images from HTML templates."
    href: "/blog/how-to-generate-og-images-from-url"
  - title: "How to Take Screenshots with JavaScript"
    description: "Node.js screenshot and HTML rendering examples."
    href: "/blog/how-to-take-screenshots-with-javascript"
jsonLd:
  "@context": "https://schema.org"
  "@type": "Article"
  headline: "How to Convert HTML to Image with an API"
  description: "Convert HTML pages and raw HTML strings to PNG, JPEG, or WebP images. Compare browser-based, server-side, and API approaches with code examples."
  dateModified: "2026-03-25"
---

Converting HTML to an image is common for generating social cards, PDF alternatives, email previews, and dynamic graphics. The challenge is that HTML rendering requires a full browser engine, as CSS, fonts, JavaScript, and layout all need to execute. This guide covers three approaches to HTML-to-image conversion.

## Client-Side: html2canvas

html2canvas reconstructs the current page's DOM onto a canvas element. It works in the browser but has significant limitations.

```javascript
import html2canvas from 'html2canvas';

const element = document.getElementById('capture-area');
const canvas = await html2canvas(element);
const dataUrl = canvas.toDataURL('image/png');

// Download the image
const link = document.createElement('a');
link.download = 'capture.png';
link.href = dataUrl;
link.click();
```

### html2canvas limitations

- Cannot render external URLs (same-origin policy)
- Limited CSS support (no CSS Grid, limited Flexbox)
- No web font rendering in some cases
- No JavaScript execution for dynamic content
- Inconsistent results across browsers

## Server-Side: Puppeteer

Puppeteer renders HTML with full Chrome fidelity.

### Screenshot a URL

```javascript
import puppeteer from 'puppeteer';

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630 });
await page.goto('https://example.com', { waitUntil: 'networkidle0' });
await page.screenshot({ path: 'output.png' });
await browser.close();
```

### Render raw HTML

```javascript
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630 });

await page.setContent(`
  <html>
    <head>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
      <style>
        body {
          margin: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          font-family: 'Inter', sans-serif;
          color: white;
        }
        h1 { font-size: 48px; }
      </style>
    </head>
    <body>
      <h1>Hello, World!</h1>
    </body>
  </html>
`, { waitUntil: 'networkidle0' });

await page.screenshot({ path: 'rendered.png' });
await browser.close();
```

### Puppeteer limitations for HTML to image

- 300 MB Chromium binary
- Memory-intensive for concurrent conversions
- Font loading can be unpredictable in headless mode
- Docker images balloon in size

## The Easy Way: ScreenshotAPI

[ScreenshotAPI](/) renders any URL with a full Chrome browser in the cloud. For HTML-to-image conversion, host your HTML at a URL and pass it to the API.

### Convert a URL to image

```bash
curl -G "https://screenshotapi.to/api/v1/screenshot" \
  -d "url=https://example.com" \
  -d "width=1200" \
  -d "height=630" \
  -d "type=png" \
  -H "x-api-key: sk_live_your_api_key" \
  --output output.png
```

### HTML template to image workflow

1. Host your HTML template (static file, API endpoint, or serverless function)
2. Call ScreenshotAPI with the template URL
3. Receive the rendered image

```javascript
const templateUrl = `https://yoursite.com/templates/social-card?title=${encodeURIComponent('My Blog Post')}&author=John`;

const params = new URLSearchParams({
  url: templateUrl,
  width: '1200',
  height: '630',
  type: 'png',
  waitUntil: 'networkidle'
});

const response = await fetch(
  `https://screenshotapi.to/api/v1/screenshot?${params}`,
  { headers: { 'x-api-key': process.env.SCREENSHOT_API_KEY } }
);

const buffer = Buffer.from(await response.arrayBuffer());
await fs.promises.writeFile('social_card.png', buffer);
```

### Dynamic social cards

Create an HTML template endpoint and capture it:

```javascript
// Template endpoint: /api/template/social-card
export function GET(request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'Untitled';
  const author = searchParams.get('author') || 'Anonymous';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
      <style>
        * { margin: 0; box-sizing: border-box; }
        body {
          width: 1200px;
          height: 630px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 80px;
          background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
          font-family: 'Inter', sans-serif;
          color: white;
        }
        h1 { font-size: 56px; font-weight: 700; line-height: 1.2; }
        .author { margin-top: 24px; font-size: 24px; opacity: 0.8; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p class="author">by ${author}</p>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' }
  });
}
```

### Python example

```python
import requests

response = requests.get(
    "https://screenshotapi.to/api/v1/screenshot",
    params={
        "url": "https://yoursite.com/templates/social-card?title=My+Post",
        "width": 1200,
        "height": 630,
        "type": "png",
        "waitUntil": "networkidle",
    },
    headers={"x-api-key": "sk_live_your_api_key"},
)

with open("social_card.png", "wb") as f:
    f.write(response.content)
```

## Comparison Table

| Feature | html2canvas | Puppeteer | ScreenshotAPI |
|---|---|---|---|
| Runs in browser | Yes | No | No |
| External URLs | No | Yes | Yes |
| Full CSS support | Limited | Full | Full |
| Web fonts | Partial | Yes | Yes |
| JavaScript execution | Current page only | Full | Full |
| Setup complexity | npm install | npm install + Chrome | API key only |
| Server required | No | Yes | No (cloud) |

## Use Cases

### Social media cards

Generate unique images for every blog post, product page, or user profile using HTML templates with dynamic data.

### Email previews

Convert HTML email templates to images for preview thumbnails in email marketing dashboards.

### Report generation

Render HTML reports and charts as images for embedding in PDFs, Slack messages, or dashboards.

### Certificate generation

Create dynamic certificates, badges, or awards from HTML templates with personalized data.

## Next Steps

- Compare [HTML to image APIs](/blog/best-html-to-image-apis) for detailed service comparisons
- Learn about [OG image generation](/blog/how-to-generate-og-images-from-url) with HTML templates
- Read the [API documentation](/docs) for all parameters
- Check [pricing](/pricing) for credit packages
