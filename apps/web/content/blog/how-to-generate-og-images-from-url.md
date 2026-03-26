---
title: "How to Generate OG Images from Any URL"
description: "Generate Open Graph images from URLs using a screenshot API. Build dynamic og:image tags for social sharing with code examples."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Blog
    href: /blog
  - label: How to Generate OG Images from URL
faq:
  - question: "What is an OG image?"
    answer: "An OG (Open Graph) image is the preview thumbnail that appears when a URL is shared on social media platforms like Twitter, LinkedIn, Slack, and Discord. The recommended size is 1200x630 pixels."
  - question: "How do I generate an OG image from a URL?"
    answer: "Send a GET request to ScreenshotAPI with the target URL, width=1200, height=630, and type=jpeg. The API returns a screenshot of the page at OG image dimensions that you can serve as your og:image meta tag."
  - question: "What size should OG images be?"
    answer: "The recommended OG image size is 1200x630 pixels with a 1.91:1 aspect ratio. This works well across Twitter, Facebook, LinkedIn, Slack, and Discord."
  - question: "Can I generate OG images dynamically?"
    answer: "Yes. You can create an API endpoint that captures screenshots on demand and serves them with appropriate caching headers. This ensures every page on your site has a unique, up-to-date social preview."
  - question: "What format is best for OG images?"
    answer: "JPEG at 80-85% quality provides the best balance of file size and visual quality. Most social platforms re-compress images anyway, so lossless PNG is unnecessary overhead."
relatedPages:
  - title: "OG Image Generation Use Case"
    description: "Learn how teams use screenshot APIs for dynamic OG images."
    href: "/use-cases/og-image-generation"
  - title: "How to Build Link Previews"
    description: "Generate rich link preview cards with thumbnails."
    href: "/blog/how-to-build-link-previews"
  - title: "Best OG Image Generators"
    description: "Compare the top OG image generation tools and services."
    href: "/blog/best-og-image-generators"
  - title: "Next.js Integration Guide"
    description: "Add screenshot-based OG images to your Next.js app."
    href: "/integrations/nextjs"
jsonLd:
  "@context": "https://schema.org"
  "@type": "Article"
  headline: "How to Generate OG Images from Any URL"
  description: "Generate Open Graph images from URLs using a screenshot API. Build dynamic og:image tags for social sharing with code examples."
  dateModified: "2026-03-25"
---

Every URL shared on Twitter, LinkedIn, Slack, or Discord shows a preview card with an image. That image comes from the `og:image` meta tag. If your pages lack OG images, shared links appear as plain text and get fewer clicks. This guide shows how to generate OG images from any URL using a screenshot API.

## Why Screenshot-Based OG Images

There are two approaches to generating OG images:

**Template-based generators** like Vercel's `@vercel/og` or Satori render HTML/CSS templates into images. They are fast but limited to simple layouts and do not represent what the actual page looks like.

**Screenshot-based generators** capture the real page as it appears in a browser. This is better for content-heavy pages, dashboards, documentation, and any page where the visual content is the selling point.

ScreenshotAPI captures the actual rendered page at 1200x630 pixels, the standard OG image size.

## Quick Start

Generate an OG image from any URL with a single API call:

```bash
curl -G "https://screenshotapi.to/api/v1/screenshot" \
  -d "url=https://example.com" \
  -d "width=1200" \
  -d "height=630" \
  -d "type=jpeg" \
  -d "quality=85" \
  -H "x-api-key: sk_live_your_api_key" \
  --output og_image.jpg
```

## Building an OG Image Endpoint

### Node.js / Express

Create an endpoint that generates OG images on demand:

```javascript
import express from 'express';

const app = express();
const API_KEY = process.env.SCREENSHOT_API_KEY;

app.get('/api/og', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'url is required' });

  const params = new URLSearchParams({
    url,
    width: '1200',
    height: '630',
    type: 'jpeg',
    quality: '85',
    waitUntil: 'networkidle'
  });

  const response = await fetch(
    `https://screenshotapi.to/api/v1/screenshot?${params}`,
    { headers: { 'x-api-key': API_KEY } }
  );

  if (!response.ok) {
    return res.status(502).json({ error: 'Screenshot capture failed' });
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  res.set('Content-Type', 'image/jpeg');
  res.set('Cache-Control', 'public, max-age=86400, s-maxage=604800');
  res.send(buffer);
});

app.listen(3000);
```

### Next.js Route Handler

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'url is required' }, { status: 400 });
  }

  const params = new URLSearchParams({
    url,
    width: '1200',
    height: '630',
    type: 'jpeg',
    quality: '85',
    waitUntil: 'networkidle'
  });

  const response = await fetch(
    `https://screenshotapi.to/api/v1/screenshot?${params}`,
    { headers: { 'x-api-key': process.env.SCREENSHOT_API_KEY! } }
  );

  if (!response.ok) {
    return NextResponse.json({ error: 'Capture failed' }, { status: 502 });
  }

  const buffer = Buffer.from(await response.arrayBuffer());

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=86400, s-maxage=604800',
    },
  });
}
```

### Python / Flask

```python
from flask import Flask, request, Response
import requests

app = Flask(__name__)
API_KEY = "sk_live_your_api_key"

@app.route("/api/og")
def og_image():
    url = request.args.get("url")
    if not url:
        return {"error": "url is required"}, 400

    response = requests.get(
        "https://screenshotapi.to/api/v1/screenshot",
        params={
            "url": url,
            "width": 1200,
            "height": 630,
            "type": "jpeg",
            "quality": 85,
            "waitUntil": "networkidle",
        },
        headers={"x-api-key": API_KEY},
    )

    return Response(
        response.content,
        mimetype="image/jpeg",
        headers={"Cache-Control": "public, max-age=86400"},
    )
```

## Adding OG Meta Tags

Once your endpoint is live, reference it in your HTML:

```html
<meta property="og:image" content="https://yoursite.com/api/og?url=https://yoursite.com/blog/my-post" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:type" content="image/jpeg" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://yoursite.com/api/og?url=https://yoursite.com/blog/my-post" />
```

### Next.js Metadata API

```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  const pageUrl = `https://yoursite.com/blog/${params.slug}`;

  return {
    openGraph: {
      images: [{
        url: `https://yoursite.com/api/og?url=${encodeURIComponent(pageUrl)}`,
        width: 1200,
        height: 630,
        type: 'image/jpeg',
      }],
    },
    twitter: {
      card: 'summary_large_image',
      images: [`https://yoursite.com/api/og?url=${encodeURIComponent(pageUrl)}`],
    },
  };
}
```

## Caching Strategy

OG images do not change frequently. Aggressive caching reduces API usage and improves response times:

1. **CDN caching**: Set `s-maxage=604800` (7 days) so CDN edges serve cached images
2. **Browser caching**: Set `max-age=86400` (1 day) for browser-level caching
3. **Pre-generation**: Capture OG images at build time or on content publish, store them in S3 or your CDN

### Pre-generating at build time

```javascript
import fs from 'fs';

const pages = ['/', '/pricing', '/blog/my-post', '/docs'];

for (const page of pages) {
  const url = `https://yoursite.com${page}`;
  const params = new URLSearchParams({
    url,
    width: '1200',
    height: '630',
    type: 'jpeg',
    quality: '85'
  });

  const response = await fetch(
    `https://screenshotapi.to/api/v1/screenshot?${params}`,
    { headers: { 'x-api-key': process.env.SCREENSHOT_API_KEY } }
  );

  const slug = page === '/' ? 'home' : page.slice(1).replace(/\//g, '-');
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(`public/og/${slug}.jpg`, buffer);
}
```

## Dark Mode OG Images

Some pages look better as dark mode screenshots:

```bash
curl -G "https://screenshotapi.to/api/v1/screenshot" \
  -d "url=https://example.com" \
  -d "width=1200" \
  -d "height=630" \
  -d "colorScheme=dark" \
  -d "type=jpeg" \
  -d "quality=85" \
  -H "x-api-key: sk_live_your_api_key" \
  --output og_dark.jpg
```

## Testing OG Images

After implementing, validate with these tools:

- **Twitter Card Validator**: cards-dev.twitter.com/validator
- **Facebook Sharing Debugger**: developers.facebook.com/tools/debug
- **LinkedIn Post Inspector**: linkedin.com/post-inspector
- **opengraph.xyz**: Preview how your link appears across platforms

## Common Pitfalls

**Problem: Blank or loading spinner in OG image**
Add `waitUntil=networkidle` and `waitForSelector` for SPA pages. See the [SPA screenshot guide](/blog/how-to-screenshot-single-page-applications) for details.

**Problem: Cookie banners covering content**
Add a `delay=2000` parameter and use `waitForSelector` to target content below the banner.

**Problem: OG image too large**
Use JPEG format with quality 80-85. A 1200x630 JPEG at 85% quality is typically 50-100 KB compared to 200-400 KB for PNG.

## Next Steps

- Explore the [OG image generation use case](/use-cases/og-image-generation) for more strategies
- Read the [API documentation](/docs) for all parameters
- Check [pricing](/pricing) for credit-based plans that scale with your traffic
