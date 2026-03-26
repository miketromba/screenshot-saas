---
title: "Screenshot API for Google Cloud Functions"
description: "Deploy a screenshot API endpoint on Google Cloud Functions with ScreenshotAPI. Node.js and Python examples with production patterns."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Integrations
    href: /integrations
  - label: Google Cloud Functions
faq:
  - question: "Do I need to install Puppeteer on Google Cloud Functions?"
    answer: "No. ScreenshotAPI handles browser rendering remotely. Your Cloud Function makes an HTTP request and receives image bytes. No Chromium binary, no special runtime configuration."
  - question: "Which Cloud Functions runtime should I use for screenshots?"
    answer: "Node.js 20+ or Python 3.12+ both work well. The examples in this guide use the Functions Framework for Node.js, but the API call is a standard HTTP GET that works in any runtime."
  - question: "How do I store the API key securely in Cloud Functions?"
    answer: "Use Google Secret Manager and access secrets via the Secret Manager API, or set environment variables in your function configuration. Never hardcode keys in source code."
  - question: "Can I trigger screenshot capture from Pub/Sub or Cloud Scheduler?"
    answer: "Yes. Create an event-driven function that listens to Pub/Sub messages or set up a Cloud Scheduler job to call your HTTP function on a schedule."
relatedPages:
  - title: "AWS Lambda Integration"
    description: "Serverless screenshots on AWS Lambda"
    href: "/integrations/aws-lambda"
  - title: "Azure Functions Integration"
    description: "Serverless screenshots on Azure"
    href: "/integrations/azure-functions"
  - title: "Docker Integration"
    description: "Containerized screenshot workflows"
    href: "/integrations/docker"
  - title: "JavaScript SDK"
    description: "Full reference for the ScreenshotAPI JavaScript SDK"
    href: "/docs/sdks/javascript"
jsonLd:
  "@context": "https://schema.org"
  "@type": "TechArticle"
  headline: "Screenshot API for Google Cloud Functions"
  description: "Deploy a screenshot API endpoint on Google Cloud Functions with ScreenshotAPI. Node.js and Python examples with production patterns."
  dateModified: "2026-03-25"
---

## Deploy Screenshot Capture on Google Cloud Functions with ScreenshotAPI

Running Puppeteer on Google Cloud Functions is technically possible but painful. The Chromium binary exceeds the default deployment size limit, cold starts stretch to 5-10 seconds, and memory usage spikes above 512 MB. Google even recommends using Cloud Run instead if you need headless Chrome.

ScreenshotAPI eliminates that complexity for your **Google Cloud Functions screenshot** integration. A single HTTP GET returns a rendered PNG, JPEG, or WebP. No browser binary, no special runtime, no oversized deployment package. Your function stays lightweight and cold-starts remain fast.

## Quick Start

1. [Sign up for ScreenshotAPI](https://screenshotapi.to) and copy your API key. **5 free credits** are included.
2. Store the key in Secret Manager or as an environment variable.
3. Deploy a Cloud Function that calls the API.

## Installation

Create a new function directory:

```bash
mkdir screenshot-function && cd screenshot-function
npm init -y
npm install @google-cloud/functions-framework
```

## Node.js HTTP Function

```javascript
// index.js
const functions = require('@google-cloud/functions-framework');

const API_BASE = 'https://screenshotapi.to/api/v1/screenshot';
const API_KEY = process.env.SCREENSHOTAPI_KEY;

functions.http('screenshot', async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const url = req.query.url;
  if (!url) {
    res.status(400).json({ error: 'url parameter is required' });
    return;
  }

  const params = new URLSearchParams({
    url,
    width: req.query.width ?? '1440',
    height: req.query.height ?? '900',
    type: req.query.type ?? 'webp',
    quality: req.query.quality ?? '80',
  });

  if (req.query.fullPage === 'true') params.set('fullPage', 'true');
  if (req.query.colorScheme) params.set('colorScheme', req.query.colorScheme);
  if (req.query.waitUntil) params.set('waitUntil', req.query.waitUntil);

  try {
    const response = await fetch(`${API_BASE}?${params}`, {
      headers: { 'x-api-key': API_KEY },
      signal: AbortSignal.timeout(25_000),
    });

    if (!response.ok) {
      res.status(502).json({ error: 'Screenshot capture failed' });
      return;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const imageType = req.query.type ?? 'webp';

    res.set('Content-Type', `image/${imageType}`);
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(buffer);
  } catch (err) {
    res.status(502).json({ error: 'Screenshot capture timed out' });
  }
});
```

Deploy the function:

```bash
gcloud functions deploy screenshot \
  --runtime nodejs20 \
  --trigger-http \
  --allow-unauthenticated \
  --set-env-vars SCREENSHOTAPI_KEY=sk_live_xxxxx \
  --memory 256MB \
  --timeout 30s \
  --region us-central1
```

## Python HTTP Function

```python
# main.py
import os
import functions_framework
import requests

API_BASE = 'https://screenshotapi.to/api/v1/screenshot'
API_KEY = os.environ['SCREENSHOTAPI_KEY']

@functions_framework.http
def screenshot(request):
    if request.method != 'GET':
        return {'error': 'Method not allowed'}, 405

    url = request.args.get('url')
    if not url:
        return {'error': 'url parameter is required'}, 400

    params = {
        'url': url,
        'width': request.args.get('width', '1440'),
        'height': request.args.get('height', '900'),
        'type': request.args.get('type', 'webp'),
        'quality': request.args.get('quality', '80'),
    }

    if request.args.get('fullPage') == 'true':
        params['fullPage'] = 'true'
    if request.args.get('colorScheme'):
        params['colorScheme'] = request.args['colorScheme']

    try:
        response = requests.get(
            API_BASE,
            params=params,
            headers={'x-api-key': API_KEY},
            timeout=25,
        )
        response.raise_for_status()
    except requests.RequestException:
        return {'error': 'Screenshot capture failed'}, 502

    image_type = request.args.get('type', 'webp')
    headers = {
        'Content-Type': f'image/{image_type}',
        'Cache-Control': 'public, max-age=3600',
    }

    return (response.content, 200, headers)
```

## Cloud Scheduler Integration

Capture screenshots on a schedule for monitoring or archival:

```bash
gcloud scheduler jobs create http screenshot-monitor \
  --schedule="0 */6 * * *" \
  --uri="https://REGION-PROJECT.cloudfunctions.net/screenshot?url=https://yoursite.com&type=png" \
  --http-method=GET \
  --time-zone="UTC"
```

## Storing Screenshots in Cloud Storage

Save captured images to a GCS bucket for long-term storage:

```javascript
const { Storage } = require('@google-cloud/storage');
const storage = new Storage();
const bucket = storage.bucket(process.env.SCREENSHOT_BUCKET);

functions.http('screenshotAndStore', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    res.status(400).json({ error: 'url parameter is required' });
    return;
  }

  const params = new URLSearchParams({
    url,
    width: '1440',
    height: '900',
    type: 'webp',
    quality: '80',
  });

  const response = await fetch(`${API_BASE}?${params}`, {
    headers: { 'x-api-key': API_KEY },
  });

  if (!response.ok) {
    res.status(502).json({ error: 'Screenshot capture failed' });
    return;
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const filename = `screenshots/${Date.now()}-${encodeURIComponent(url)}.webp`;

  const file = bucket.file(filename);
  await file.save(buffer, {
    contentType: 'image/webp',
    metadata: { cacheControl: 'public, max-age=86400' },
  });

  const publicUrl = `https://storage.googleapis.com/${process.env.SCREENSHOT_BUCKET}/${filename}`;
  res.json({ url: publicUrl, size: buffer.length });
});
```

## Batch Capture with Pub/Sub

Process multiple screenshots asynchronously using Pub/Sub:

```javascript
functions.cloudEvent('processScreenshot', async (cloudEvent) => {
  const message = JSON.parse(
    Buffer.from(cloudEvent.data.message.data, 'base64').toString()
  );

  const { url, type = 'webp', quality = 80 } = message;

  const params = new URLSearchParams({
    url,
    width: '1440',
    height: '900',
    type,
    quality: String(quality),
  });

  const response = await fetch(`${API_BASE}?${params}`, {
    headers: { 'x-api-key': API_KEY },
  });

  if (!response.ok) {
    throw new Error(`Screenshot failed: ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const file = bucket.file(`screenshots/${Date.now()}.${type}`);
  await file.save(buffer, { contentType: `image/${type}` });
});
```

## Production Tips

### Memory and Timeout

ScreenshotAPI does all the heavy lifting, so your function needs minimal memory. 256 MB is sufficient for most cases. Set the timeout to 30 seconds to handle slow page loads.

### Secrets Management

Use Google Secret Manager instead of environment variables for production API keys:

```bash
echo -n "sk_live_xxxxx" | gcloud secrets create screenshotapi-key --data-file=-

gcloud functions deploy screenshot \
  --set-secrets SCREENSHOTAPI_KEY=screenshotapi-key:latest
```

### Authentication

For internal functions, remove `--allow-unauthenticated` and use IAM to control access. For public-facing functions, add rate limiting logic inside the function.

### Cost Optimization

Cloud Functions charges per invocation and compute time. Since ScreenshotAPI handles the rendering, your function runs for only the duration of the HTTP call. At 256 MB with a 2-second execution, costs are minimal. Check the [pricing page](/pricing) for ScreenshotAPI credit tiers.

## Further Reading

- Compare with the [AWS Lambda integration](/integrations/aws-lambda) for a multi-cloud perspective.
- The [Azure Functions integration](/integrations/azure-functions) covers Microsoft's serverless platform.
- The [API documentation](/docs) has the full parameter reference for all endpoints.
