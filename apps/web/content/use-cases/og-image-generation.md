---
title: "OG Image Generation API"
description: "Generate dynamic Open Graph images from any URL with a simple API call. Perfect for social sharing previews at scale."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Use Cases
    href: /use-cases
  - label: OG Image Generation
faq:
  - question: "What size should OG images be?"
    answer: "The recommended size for Open Graph images is 1200x630 pixels. This works well across Facebook, Twitter/X, LinkedIn, and Slack. ScreenshotAPI lets you set exact width and height parameters to match this spec."
  - question: "Can I generate OG images dynamically for every page?"
    answer: "Yes. You can call the ScreenshotAPI endpoint with any URL and get back a screenshot in PNG, JPEG, or WebP format. Many teams create a dedicated /og route that renders a styled template, then capture it with the API."
  - question: "How fast are the generated images?"
    answer: "ScreenshotAPI typically returns images in 1-3 seconds depending on page complexity. For production use, cache the generated images on your CDN so subsequent requests are served instantly."
  - question: "Do I need to self-host a headless browser?"
    answer: "No. ScreenshotAPI handles the headless browser infrastructure for you. There are no Chromium binaries to install, no memory tuning, and no container orchestration to manage."
relatedPages:
  - title: "Link Preview Generator"
    description: "Generate rich link previews with thumbnail images for any URL."
    href: "/use-cases/link-previews"
  - title: "Social Media Automation"
    description: "Automate social card generation for sharing across platforms."
    href: "/use-cases/social-media-automation"
  - title: "ScreenshotAPI vs Puppeteer"
    description: "See why teams choose a managed API over running Puppeteer themselves."
    href: "/compare/screenshotapi-vs-puppeteer"
jsonLd:
  "@context": "https://schema.org"
  "@type": "Article"
  headline: "OG Image Generation API"
  description: "Generate dynamic Open Graph images from any URL with a simple API call. Perfect for social sharing previews at scale."
  dateModified: "2026-03-25"
---

## Why Dynamic OG Images Matter

When someone shares a link on Twitter/X, LinkedIn, Slack, or Facebook, the platform fetches the page's Open Graph metadata and renders a preview card. Pages without an `og:image` tag get a blank or generic preview, which kills click-through rates. Studies consistently show that posts with rich image previews receive 2-3x more engagement than plain text links.

The problem is that creating unique OG images for every page is tedious. Designing them manually in Figma or Canva does not scale. Build-time generation with tools like Satori or `@vercel/og` adds complexity, framework lock-in, and deployment overhead. What you really need is an **OG image generation API** that takes a URL and hands back a pixel-perfect screenshot, ready to serve as your social preview.

## How ScreenshotAPI Solves OG Image Generation

ScreenshotAPI gives you a single REST endpoint that renders any URL in a real Chromium browser and returns the image. To generate dynamic OG images, the workflow is straightforward:

1. Create an HTML template page (e.g., `/og?title=Hello&desc=World`) that renders your branded OG card design.
2. Call ScreenshotAPI with that URL, specifying 1200x630 dimensions.
3. Cache the result and serve it as your `og:image`.

This approach works with every framework (Next.js, Astro, Django, Rails, plain HTML) because the API is just an HTTP call. There is no SDK lock-in and no build step.

### Key advantages over alternatives

- **No infrastructure**: No headless browsers to manage, no Puppeteer memory leaks, no Chromium binaries in your Docker image.
- **Framework-agnostic**: Works the same whether your app runs on [Next.js](/integrations/nextjs), [Django](/integrations/django), or [Rails](/integrations/rails).
- **Full CSS/JS support**: Since ScreenshotAPI renders in a real browser, your template can use web fonts, gradients, SVGs, and any CSS you want.
- **Multiple formats**: Get your OG image as PNG for lossless quality, JPEG for smaller file sizes, or WebP for modern browsers.

## Implementation Guide

### Step 1: Build Your OG Template

Create a page in your app that renders the OG card design. This page does not need to be publicly linked; it just needs to be accessible by URL.

```html
<!-- /og-template?title=My+Post&author=Jane -->
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0;
      width: 1200px;
      height: 630px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0f172a, #1e293b);
      font-family: 'Inter', sans-serif;
      color: white;
    }
    .card {
      text-align: center;
      padding: 60px;
    }
    h1 { font-size: 56px; margin: 0 0 16px; }
    p { font-size: 24px; opacity: 0.8; }
  </style>
</head>
<body>
  <div class="card">
    <h1>{{title}}</h1>
    <p>By {{author}}</p>
  </div>
</body>
</html>
```

### Step 2: Capture the Template with ScreenshotAPI

#### JavaScript

```javascript
const axios = require("axios");
const fs = require("fs");

async function generateOgImage({ title, author }) {
  const templateUrl = `https://yourapp.com/og-template?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}`;

  const response = await axios.get("https://screenshotapi.to/api/v1/screenshot", {
    params: {
      url: templateUrl,
      width: 1200,
      height: 630,
      type: "png",
      waitUntil: "networkidle",
    },
    headers: {
      "x-api-key": "sk_live_xxxxx",
    },
    responseType: "arraybuffer",
  });

  fs.writeFileSync("og-image.png", response.data);
  return response.data;
}

generateOgImage({ title: "How to Build a REST API", author: "Jane Doe" });
```

#### Python

```python
import requests
from urllib.parse import urlencode, quote

def generate_og_image(title: str, author: str) -> bytes:
    template_url = f"https://yourapp.com/og-template?title={quote(title)}&author={quote(author)}"

    response = requests.get(
        "https://screenshotapi.to/api/v1/screenshot",
        params={
            "url": template_url,
            "width": 1200,
            "height": 630,
            "type": "png",
            "waitUntil": "networkidle",
        },
        headers={"x-api-key": "sk_live_xxxxx"},
    )
    response.raise_for_status()

    with open("og-image.png", "wb") as f:
        f.write(response.content)

    return response.content

generate_og_image("How to Build a REST API", "Jane Doe")
```

### Step 3: Serve the Image in Your Meta Tags

Once you have the generated image URL (either stored on your CDN or served through a caching proxy), add it to your page's `<head>`:

```html
<meta property="og:image" content="https://cdn.yourapp.com/og/how-to-build-a-rest-api.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://cdn.yourapp.com/og/how-to-build-a-rest-api.png" />
```

### Caching Strategy

Generating OG images on every request wastes credits and adds latency. Instead, generate once and cache:

1. **On publish**: When a blog post or page is created, trigger an OG image generation and upload the result to S3/R2/GCS.
2. **On demand with cache**: Use a CDN edge function that checks if the image exists in cache. If not, call ScreenshotAPI, store the result, and return it.
3. **Cache invalidation**: When the page content changes, regenerate the image and bust the cache.

## Advanced Techniques

### Dark Mode OG Images

ScreenshotAPI supports a `colorScheme` parameter, so you can generate both light and dark variants:

```javascript
const darkOg = await axios.get("https://screenshotapi.to/api/v1/screenshot", {
  params: {
    url: templateUrl,
    width: 1200,
    height: 630,
    type: "png",
    colorScheme: "dark",
    waitUntil: "networkidle",
  },
  headers: { "x-api-key": "sk_live_xxxxx" },
  responseType: "arraybuffer",
});
```

### Waiting for Web Fonts

If your template uses custom fonts loaded from Google Fonts or a CDN, use `waitUntil: "networkidle"` to ensure all font files finish loading before the screenshot is taken. You can also use `waitForSelector` to wait for a specific element:

```javascript
params: {
  url: templateUrl,
  waitForSelector: ".fonts-loaded",
  // Your template adds this class after fonts load
}
```

## Pricing Estimate

OG image generation is typically a one-time cost per page. Here is what a typical month looks like:

| Scenario | Pages/Month | Credits Used | Recommended Plan |
|---|---|---|---|
| Personal blog | 10-20 posts | 10-20 | Free tier (5 credits) + Starter |
| Company blog | 50-100 posts | 50-100 | Starter (500 credits, $20) |
| Content platform | 500-2,000 pages | 500-2,000 | Growth (2,000 credits, $60) |
| Large marketplace | 5,000-10,000 listings | 5,000-10,000 | Pro (10,000 credits, $200) |

Since OG images are generated once per page and cached, your monthly credit usage equals the number of new or updated pages. Credits never expire, so unused credits roll over. Check the [pricing page](/pricing) for full details.

## OG Image Generation Compared to Alternatives

| Approach | Setup Time | Maintenance | Framework Lock-in | Cost |
|---|---|---|---|---|
| Manual design (Figma/Canva) | High | High | None | Designer time |
| @vercel/og / Satori | Medium | Medium | Next.js / React | Free (compute costs) |
| Puppeteer self-hosted | High | High | None | Server costs |
| **ScreenshotAPI** | **Low** | **None** | **None** | **Pay per screenshot** |

For a deeper comparison of managed APIs versus self-hosted Puppeteer, see our [ScreenshotAPI vs Puppeteer](/compare/screenshotapi-vs-puppeteer) breakdown.

## Common Patterns by Framework

### Next.js App Router

In a Next.js app, you can create an API route that generates and caches OG images. See our full [Next.js integration guide](/integrations/nextjs) for details.

### Static Site Generators

For Astro, Hugo, or Jekyll, trigger OG image generation as a post-build step. Loop through all page URLs, call ScreenshotAPI for each one, and write the images to your `public/` or `static/` directory.

### Django / Rails

Use a background job (Celery, Sidekiq) to generate OG images asynchronously when content is created or updated. Store the resulting image URL in your database alongside the page record. See the [Django](/integrations/django) and [Rails](/integrations/rails) integration guides for implementation details.

## Getting Started

1. [Sign up](https://screenshotapi.to) and get 5 free credits.
2. Build your OG template page with your brand colors and layout.
3. Call the API with your template URL and 1200x630 dimensions.
4. Cache the result and add the image URL to your meta tags.
5. Check your previews with the [Twitter Card Validator](https://cards-dev.twitter.com/validator) or [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/).

Read the [full API documentation](/docs) to explore all available parameters.
