---
title: "How to Add Website Thumbnails to Your App"
description: "Generate website thumbnail images for link directories, dashboards, and bookmark managers. Working examples with caching and lazy loading."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Blog
    href: /blog
  - label: How to Add Website Thumbnails to Your App
faq:
  - question: "What is a website thumbnail?"
    answer: "A website thumbnail is a small screenshot of a web page, typically displayed at 300-400px wide. They are used in link directories, bookmark managers, dashboards, and social link cards to give users a visual preview of a URL."
  - question: "How do I generate website thumbnails at scale?"
    answer: "Use ScreenshotAPI to capture screenshots at the desired thumbnail dimensions, cache the results in cloud storage or a CDN, and serve them with long cache headers. Process thumbnails asynchronously for the best user experience."
  - question: "What size should website thumbnails be?"
    answer: "Capture at 1280x800 for good quality, then resize or let CSS scale them down. Alternatively, capture at the display size (e.g., 640x400) with JPEG format for smaller file sizes."
  - question: "How do I handle thumbnails for sites that block screenshots?"
    answer: "Some sites block headless browsers. In those cases, show a fallback placeholder with the site's favicon and domain name instead of a screenshot."
relatedPages:
  - title: "How to Build Link Previews"
    description: "Build rich link preview cards with metadata."
    href: "/blog/how-to-build-link-previews"
  - title: "How to Automate Website Screenshots"
    description: "Batch thumbnail generation for large directories."
    href: "/blog/how-to-automate-website-screenshots"
  - title: "Link Previews Use Case"
    description: "Architecture patterns for link preview systems."
    href: "/use-cases/link-previews"
jsonLd:
  "@context": "https://schema.org"
  "@type": "Article"
  headline: "How to Add Website Thumbnails to Your App"
  description: "Generate website thumbnail images for link directories, dashboards, and bookmark managers. Working examples with caching and lazy loading."
  dateModified: "2026-03-25"
---

Website thumbnails are small screenshots used in link directories, bookmark managers, dashboards, and CMS tools. They help users visually identify links and make interfaces more engaging than plain text URLs. This guide shows how to generate, cache, and display website thumbnails using [ScreenshotAPI](/).

## Generating a Thumbnail

Capture a website screenshot at thumbnail-friendly dimensions:

```bash
curl -G "https://screenshotapi.to/api/v1/screenshot" \
  -d "url=https://github.com" \
  -d "width=1280" \
  -d "height=800" \
  -d "type=jpeg" \
  -d "quality=80" \
  -H "x-api-key: sk_live_your_api_key" \
  --output thumbnail.jpg
```

JPEG at 80% quality is ideal for thumbnails. A 1280x800 capture at this setting produces a 60-120 KB file that looks sharp when displayed at 300-400px width.

## Backend Thumbnail Service

### Node.js

```javascript
import express from 'express';

const app = express();
const API_KEY = process.env.SCREENSHOT_API_KEY;

app.get('/api/thumbnail', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'url is required' });

  try {
    const params = new URLSearchParams({
      url,
      width: '1280',
      height: '800',
      type: 'jpeg',
      quality: '80',
      waitUntil: 'load'
    });

    const response = await fetch(
      `https://screenshotapi.to/api/v1/screenshot?${params}`,
      { headers: { 'x-api-key': API_KEY } }
    );

    if (!response.ok) {
      return res.status(502).json({ error: 'Failed to capture thumbnail' });
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    res.set('Content-Type', 'image/jpeg');
    res.set('Cache-Control', 'public, max-age=604800, s-maxage=2592000');
    res.send(buffer);
  } catch {
    res.status(500).json({ error: 'Internal error' });
  }
});

app.listen(3000);
```

### Python / Flask

```python
from flask import Flask, request, Response
import requests

app = Flask(__name__)
API_KEY = "sk_live_your_api_key"

@app.route("/api/thumbnail")
def thumbnail():
    url = request.args.get("url")
    if not url:
        return {"error": "url is required"}, 400

    response = requests.get(
        "https://screenshotapi.to/api/v1/screenshot",
        params={
            "url": url,
            "width": 1280,
            "height": 800,
            "type": "jpeg",
            "quality": 80,
            "waitUntil": "load",
        },
        headers={"x-api-key": API_KEY},
    )

    if response.status_code != 200:
        return {"error": "Failed to capture"}, 502

    return Response(
        response.content,
        mimetype="image/jpeg",
        headers={"Cache-Control": "public, max-age=604800"},
    )
```

## Caching with S3

Store thumbnails in S3 to avoid re-capturing:

```javascript
import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { createHash } from 'crypto';

const s3 = new S3Client({ region: 'us-east-1' });
const BUCKET = 'my-thumbnails';

async function getThumbnail(url) {
  const hash = createHash('md5').update(url).digest('hex');
  const key = `thumbnails/${hash}.jpg`;

  // Check if cached
  try {
    await s3.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
    return `https://${BUCKET}.s3.amazonaws.com/${key}`;
  } catch {
    // Not cached, capture it
  }

  const params = new URLSearchParams({
    url,
    width: '1280',
    height: '800',
    type: 'jpeg',
    quality: '80'
  });

  const response = await fetch(
    `https://screenshotapi.to/api/v1/screenshot?${params}`,
    { headers: { 'x-api-key': process.env.SCREENSHOT_API_KEY } }
  );

  const buffer = Buffer.from(await response.arrayBuffer());

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: 'image/jpeg',
    CacheControl: 'public, max-age=2592000'
  }));

  return `https://${BUCKET}.s3.amazonaws.com/${key}`;
}
```

## React Component

### Thumbnail card

```tsx
function WebsiteThumbnail({ url, title }: { url: string; title: string }) {
  const thumbnailSrc = `/api/thumbnail?url=${encodeURIComponent(url)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block cursor-pointer overflow-hidden rounded-lg border transition-all hover:shadow-md"
    >
      <div className="aspect-video overflow-hidden bg-gray-100">
        <img
          src={thumbnailSrc}
          alt={`Screenshot of ${title}`}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="p-3">
        <h3 className="font-medium truncate">{title}</h3>
        <p className="text-sm text-gray-500 truncate">{new URL(url).hostname}</p>
      </div>
    </a>
  );
}
```

### Thumbnail grid

```tsx
function ThumbnailGrid({ links }: { links: { url: string; title: string }[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {links.map((link) => (
        <WebsiteThumbnail key={link.url} url={link.url} title={link.title} />
      ))}
    </div>
  );
}
```

## Batch Thumbnail Generation

For directories with many links, generate thumbnails asynchronously:

```javascript
import { Queue } from 'bullmq';

const thumbnailQueue = new Queue('thumbnails');

async function queueThumbnail(url) {
  await thumbnailQueue.add('capture', { url }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 }
  });
}

// Worker
import { Worker } from 'bullmq';

const worker = new Worker('thumbnails', async (job) => {
  const { url } = job.data;
  await getThumbnail(url); // Uses the S3 caching function above
}, { concurrency: 5 });
```

## Placeholder and Fallback

Show a placeholder while thumbnails load, and a fallback if capture fails:

```tsx
function ThumbnailWithFallback({ url, title }: { url: string; title: string }) {
  const [error, setError] = useState(false);
  const hostname = new URL(url).hostname;

  if (error) {
    return (
      <div className="flex aspect-video items-center justify-center rounded-lg bg-gray-100">
        <div className="text-center">
          <img
            src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`}
            alt=""
            className="mx-auto h-8 w-8"
          />
          <p className="mt-2 text-sm text-gray-500">{hostname}</p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={`/api/thumbnail?url=${encodeURIComponent(url)}`}
      alt={`Screenshot of ${title}`}
      className="aspect-video w-full rounded-lg object-cover"
      loading="lazy"
      onError={() => setError(true)}
    />
  );
}
```

## Next Steps

- Read about [building link previews](/blog/how-to-build-link-previews) with metadata extraction
- Learn to [automate screenshot capture](/blog/how-to-automate-website-screenshots) for large directories
- Check the [API documentation](/docs) for all parameters
- View [pricing](/pricing) for credit-based plans
