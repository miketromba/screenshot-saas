---
title: "How to Automate Website Screenshots at Scale"
description: "Automate website screenshot capture with batch processing, scheduling, and CI/CD integration. Code examples for Node.js, Python, and shell scripts."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Blog
    href: /blog
  - label: How to Automate Website Screenshots
faq:
  - question: "How do I take screenshots of multiple URLs at once?"
    answer: "Use a script that loops through your URL list and calls ScreenshotAPI for each one. Process them concurrently with Promise.all in JavaScript, asyncio.gather in Python, or xargs in shell scripts."
  - question: "Can I schedule automatic screenshots?"
    answer: "Yes. Use cron jobs, GitHub Actions scheduled workflows, or cloud functions with a timer trigger to capture screenshots on a regular schedule."
  - question: "How many screenshots can I capture per minute?"
    answer: "ScreenshotAPI handles concurrent requests without rate limiting issues for standard plans. For large batches (1000+ URLs), process in groups of 10-20 concurrent requests for optimal throughput."
  - question: "How do I store automated screenshots?"
    answer: "Save to cloud storage like S3, Google Cloud Storage, or Cloudflare R2. Include the URL, timestamp, and viewport size in the filename for easy retrieval."
relatedPages:
  - title: "How to Take Screenshots with JavaScript"
    description: "Node.js screenshot capture fundamentals."
    href: "/blog/how-to-take-screenshots-with-javascript"
  - title: "Visual Regression Testing"
    description: "Automated visual comparison of screenshots."
    href: "/blog/how-to-build-visual-regression-testing-pipeline"
  - title: "How to Take Screenshots with cURL"
    description: "Command-line screenshot capture for scripts."
    href: "/blog/how-to-take-screenshots-with-curl"
jsonLd:
  "@context": "https://schema.org"
  "@type": "Article"
  headline: "How to Automate Website Screenshots at Scale"
  description: "Automate website screenshot capture with batch processing, scheduling, and CI/CD integration. Code examples for Node.js, Python, and shell scripts."
  dateModified: "2026-03-25"
---

Automating website screenshots is essential for monitoring, archiving, competitive analysis, and generating thumbnails at scale. Instead of capturing one page at a time, you can build automated pipelines that process hundreds or thousands of URLs. This guide covers batch capture, scheduling, and integration patterns using [ScreenshotAPI](/).

## Batch Capture with Node.js

### Sequential processing

```javascript
import fs from 'fs';

const API_KEY = process.env.SCREENSHOT_API_KEY;
const urls = [
  'https://github.com',
  'https://stripe.com',
  'https://linear.app',
  'https://vercel.com',
  'https://tailwindcss.com',
];

async function captureScreenshot(url) {
  const params = new URLSearchParams({
    url,
    width: '1440',
    height: '900',
    type: 'png',
    waitUntil: 'networkidle'
  });

  const response = await fetch(
    `https://screenshotapi.to/api/v1/screenshot?${params}`,
    { headers: { 'x-api-key': API_KEY } }
  );

  if (!response.ok) throw new Error(`Failed: ${url} (${response.status})`);
  return Buffer.from(await response.arrayBuffer());
}

for (const url of urls) {
  const domain = new URL(url).hostname.replace(/\./g, '_');
  const buffer = await captureScreenshot(url);
  fs.writeFileSync(`screenshots/${domain}.png`, buffer);
  console.log(`Captured: ${url}`);
}
```

### Concurrent processing with rate limiting

```javascript
async function captureAll(urls, concurrency = 10) {
  const results = [];
  const queue = [...urls];

  async function worker() {
    while (queue.length > 0) {
      const url = queue.shift();
      try {
        const buffer = await captureScreenshot(url);
        const domain = new URL(url).hostname.replace(/\./g, '_');
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `screenshots/${domain}_${timestamp}.png`;
        fs.writeFileSync(filename, buffer);
        results.push({ url, filename, status: 'success' });
        console.log(`OK: ${url}`);
      } catch (error) {
        results.push({ url, status: 'error', error: error.message });
        console.error(`FAIL: ${url} - ${error.message}`);
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
  return results;
}

const results = await captureAll(urls, 10);
console.log(`Completed: ${results.filter(r => r.status === 'success').length}/${results.length}`);
```

## Batch Capture with Python

### Concurrent with asyncio

```python
import asyncio
import aiohttp
import os
from urllib.parse import urlparse
from datetime import date

API_KEY = os.environ["SCREENSHOT_API_KEY"]
BASE_URL = "https://screenshotapi.to/api/v1/screenshot"

async def capture(session, url):
    params = {
        "url": url,
        "width": 1440,
        "height": 900,
        "type": "png",
        "waitUntil": "networkidle",
    }
    headers = {"x-api-key": API_KEY}

    async with session.get(BASE_URL, params=params, headers=headers) as response:
        if response.status != 200:
            print(f"FAIL: {url} ({response.status})")
            return None

        data = await response.read()
        domain = urlparse(url).hostname.replace(".", "_")
        filename = f"screenshots/{domain}_{date.today()}.png"
        with open(filename, "wb") as f:
            f.write(data)
        print(f"OK: {url}")
        return filename

async def capture_all(urls, concurrency=10):
    semaphore = asyncio.Semaphore(concurrency)
    async with aiohttp.ClientSession() as session:
        async def limited_capture(url):
            async with semaphore:
                return await capture(session, url)

        results = await asyncio.gather(*[limited_capture(url) for url in urls])
        return results

urls = [
    "https://github.com",
    "https://stripe.com",
    "https://linear.app",
    "https://vercel.com",
    "https://tailwindcss.com",
]

os.makedirs("screenshots", exist_ok=True)
asyncio.run(capture_all(urls))
```

## Batch Capture with Shell Scripts

### Simple loop

```bash
#!/bin/bash
API_KEY="sk_live_your_api_key"
OUTPUT_DIR="screenshots"
mkdir -p "$OUTPUT_DIR"

while IFS= read -r url; do
  domain=$(echo "$url" | sed 's|https://||' | sed 's|[/.]|_|g')
  timestamp=$(date +%Y-%m-%d)

  curl -s -G "https://screenshotapi.to/api/v1/screenshot" \
    -d "url=$url" \
    -d "width=1440" \
    -d "height=900" \
    -d "type=png" \
    -H "x-api-key: $API_KEY" \
    --output "$OUTPUT_DIR/${domain}_${timestamp}.png"

  echo "Captured: $url"
done < urls.txt
```

### Parallel with xargs

```bash
cat urls.txt | xargs -P 10 -I {} bash -c '
  domain=$(echo "{}" | sed "s|https://||" | sed "s|[/.]|_|g")
  curl -s -G "https://screenshotapi.to/api/v1/screenshot" \
    -d "url={}" \
    -d "width=1440" \
    -d "height=900" \
    -d "type=png" \
    -H "x-api-key: '$API_KEY'" \
    --output "screenshots/${domain}.png"
  echo "Done: {}"
'
```

## Scheduling with Cron

Add a cron entry to capture screenshots daily:

```bash
# Capture screenshots every day at 6 AM
0 6 * * * /path/to/capture_screenshots.sh >> /var/log/screenshots.log 2>&1
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Capture Screenshots
on:
  schedule:
    - cron: '0 6 * * 1' # Every Monday at 6 AM
  workflow_dispatch:

jobs:
  capture:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Capture screenshots
        run: |
          mkdir -p screenshots
          while IFS= read -r url; do
            domain=$(echo "$url" | sed 's|https://||' | sed 's|[/.]|_|g')
            curl -s -G "https://screenshotapi.to/api/v1/screenshot" \
              -d "url=$url" \
              -d "width=1440" \
              -d "height=900" \
              -d "type=png" \
              -H "x-api-key: ${{ secrets.SCREENSHOT_API_KEY }}" \
              --output "screenshots/${domain}.png"
          done < urls.txt

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: screenshots-${{ github.run_number }}
          path: screenshots/
```

## Uploading to S3

```javascript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: 'us-east-1' });

async function captureAndUpload(url) {
  const buffer = await captureScreenshot(url);
  const domain = new URL(url).hostname;
  const timestamp = new Date().toISOString().split('T')[0];
  const key = `screenshots/${domain}/${timestamp}.png`;

  await s3.send(new PutObjectCommand({
    Bucket: 'my-screenshots-bucket',
    Key: key,
    Body: buffer,
    ContentType: 'image/png',
    CacheControl: 'public, max-age=86400'
  }));

  return `https://my-screenshots-bucket.s3.amazonaws.com/${key}`;
}
```

## Monitoring and Change Detection

Compare screenshots over time to detect visual changes:

```javascript
import { createHash } from 'crypto';

async function detectChanges(url, previousHash) {
  const buffer = await captureScreenshot(url);
  const currentHash = createHash('sha256').update(buffer).digest('hex');

  if (previousHash && currentHash !== previousHash) {
    console.log(`Change detected on ${url}`);
    return { changed: true, hash: currentHash, image: buffer };
  }

  return { changed: false, hash: currentHash };
}
```

## Handling Failures

Build retry logic for reliability:

```javascript
async function captureWithRetry(url, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await captureScreenshot(url);
    } catch (error) {
      console.warn(`Attempt ${attempt}/${maxRetries} failed for ${url}: ${error.message}`);
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 1000 * attempt));
      }
    }
  }
  throw new Error(`Failed after ${maxRetries} attempts: ${url}`);
}
```

## Next Steps

- Set up [visual regression testing](/blog/how-to-build-visual-regression-testing-pipeline) with automated screenshot comparison
- Learn about [generating website thumbnails](/blog/how-to-add-website-thumbnails-to-your-app) for link directories
- Read the [API documentation](/docs) for all parameters
- Check [pricing](/pricing) for volume-appropriate credit packages
