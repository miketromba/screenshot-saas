---
title: "AWS Lambda Screenshot API Integration"
description: "Capture website screenshots with AWS Lambda and ScreenshotAPI. No Chromium layer needed. Serverless examples with API Gateway, S3, and CDK."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Integrations
    href: /integrations
  - label: AWS Lambda
faq:
  - question: "Do I need chrome-aws-lambda or Puppeteer on Lambda?"
    answer: "No. ScreenshotAPI handles browser rendering on its infrastructure. Your Lambda function makes a single HTTP request and receives the screenshot, keeping the deployment package tiny."
  - question: "How large is the Lambda deployment package?"
    answer: "Without Chromium, your Lambda function can be as small as a few kilobytes of code. Compare that to the 50 MB chrome-aws-lambda layer that traditional approaches require."
  - question: "Can I store screenshots in S3?"
    answer: "Yes. Fetch the screenshot from ScreenshotAPI and upload it directly to S3 using the AWS SDK. Serve the images through CloudFront for global CDN delivery."
  - question: "What about Lambda cold starts?"
    answer: "Since there is no Chromium binary to load, cold starts are measured in milliseconds rather than seconds. The function initializes instantly and makes a network call to ScreenshotAPI."
  - question: "Can I trigger screenshots from other AWS services?"
    answer: "Yes. Trigger your Lambda function from API Gateway, SQS, SNS, EventBridge, or Step Functions. Any event source that invokes Lambda works."
relatedPages:
  - title: "Vercel Integration"
    description: "Serverless screenshots on Vercel's edge network"
    href: "/integrations/vercel"
  - title: "Cloudflare Workers Integration"
    description: "Edge screenshot capture with Cloudflare Workers"
    href: "/integrations/cloudflare-workers"
  - title: "JavaScript SDK"
    description: "Full reference for the ScreenshotAPI JavaScript SDK"
    href: "/docs/sdks/javascript"
  - title: "Visual Regression Testing"
    description: "Automated visual testing with screenshots"
    href: "/use-cases/visual-regression-testing"
jsonLd:
  "@context": "https://schema.org"
  "@type": "TechArticle"
  headline: "AWS Lambda Screenshot API Integration"
  description: "Capture website screenshots with AWS Lambda and ScreenshotAPI. No Chromium layer needed."
  dateModified: "2026-03-25"
---

## Capture Screenshots with AWS Lambda and ScreenshotAPI

Building a screenshot service on AWS Lambda traditionally requires the `chrome-aws-lambda` layer, which adds a 50 MB compressed Chromium binary to your function. This pushes against Lambda's 250 MB uncompressed limit, causes 3-8 second cold starts, and requires 1600+ MB of memory for stable operation. At scale, the compute costs add up quickly.

An **AWS Lambda screenshot API** integration with ScreenshotAPI eliminates the Chromium dependency entirely. Your Lambda function makes one HTTP request, receives the screenshot bytes, and optionally stores them in S3. The deployment package stays under 1 MB, cold starts are nearly instant, and memory usage stays minimal.

## Quick Start

1. [Sign up for ScreenshotAPI](https://screenshotapi.to) and copy your API key. **5 free credits** are included.
2. Store the API key in AWS Systems Manager Parameter Store or Secrets Manager.
3. Create a Lambda function that calls the API.

## Installation

No Lambda layers or heavy dependencies are needed. For Node.js functions, the built-in `fetch` API (available in Node.js 18+) is all you need.

Store your API key in Parameter Store:

```bash
aws ssm put-parameter \
  --name /screenshotapi/api-key \
  --type SecureString \
  --value sk_live_xxxxx
```

## Basic Example: Node.js Lambda

A Lambda function triggered by API Gateway:

```typescript
// handler.ts
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'

const ssm = new SSMClient({})
let apiKey: string | undefined

async function getApiKey(): Promise<string> {
  if (apiKey) return apiKey

  const result = await ssm.send(
    new GetParameterCommand({
      Name: '/screenshotapi/api-key',
      WithDecryption: true,
    })
  )

  apiKey = result.Parameter?.Value
  if (!apiKey) throw new Error('API key not found')
  return apiKey
}

export async function handler(event: {
  queryStringParameters?: Record<string, string>
}) {
  const url = event.queryStringParameters?.url
  if (!url) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'url parameter is required' }),
    }
  }

  const key = await getApiKey()

  const params = new URLSearchParams({
    url,
    width: event.queryStringParameters?.width ?? '1440',
    height: event.queryStringParameters?.height ?? '900',
    type: event.queryStringParameters?.type ?? 'png',
  })

  const response = await fetch(
    `https://screenshotapi.to/api/v1/screenshot?${params}`,
    { headers: { 'x-api-key': key } }
  )

  if (!response.ok) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: 'Screenshot capture failed' }),
    }
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  const type = event.queryStringParameters?.type ?? 'png'

  return {
    statusCode: 200,
    headers: {
      'Content-Type': `image/${type}`,
      'Cache-Control': 'public, max-age=86400',
    },
    body: buffer.toString('base64'),
    isBase64Encoded: true,
  }
}
```

## Python Lambda Handler

For Python-based Lambda functions:

```python
# handler.py
import json
import os
import base64
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError

API_BASE = 'https://screenshotapi.to/api/v1/screenshot'

def handler(event, context):
    params = event.get('queryStringParameters') or {}
    url = params.get('url')

    if not url:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'url parameter is required'}),
        }

    query = urlencode({
        'url': url,
        'width': params.get('width', '1440'),
        'height': params.get('height', '900'),
        'type': params.get('type', 'png'),
    })

    api_key = os.environ['SCREENSHOTAPI_KEY']
    request = Request(
        f'{API_BASE}?{query}',
        headers={'x-api-key': api_key},
    )

    try:
        response = urlopen(request, timeout=30)
        image_data = response.read()
    except HTTPError as e:
        return {
            'statusCode': 502,
            'body': json.dumps({'error': f'API returned {e.code}'}),
        }

    image_type = params.get('type', 'png')

    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': f'image/{image_type}',
            'Cache-Control': 'public, max-age=86400',
        },
        'body': base64.b64encode(image_data).decode('utf-8'),
        'isBase64Encoded': True,
    }
```

## Storing Screenshots in S3

Capture screenshots and upload them to S3 for persistent storage:

```typescript
// handler.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import crypto from 'node:crypto'

const s3 = new S3Client({})
const BUCKET = process.env.SCREENSHOT_BUCKET!

export async function handler(event: { url: string; prefix?: string }) {
  const { url, prefix = 'screenshots' } = event

  const params = new URLSearchParams({
    url,
    width: '1440',
    height: '900',
    type: 'webp',
    quality: '80',
    waitUntil: 'networkidle',
  })

  const response = await fetch(
    `https://screenshotapi.to/api/v1/screenshot?${params}`,
    { headers: { 'x-api-key': process.env.SCREENSHOTAPI_KEY! } }
  )

  if (!response.ok) {
    throw new Error(`Screenshot API returned ${response.status}`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  const hash = crypto.createHash('sha256').update(url).digest('hex').slice(0, 12)
  const key = `${prefix}/${hash}.webp`

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=604800',
    })
  )

  return {
    key,
    url: `https://${BUCKET}.s3.amazonaws.com/${key}`,
    size: buffer.length,
  }
}
```

## SQS-Triggered Batch Processing

Process a queue of screenshot requests:

```typescript
// batch-handler.ts
import type { SQSEvent } from 'aws-lambda'

interface ScreenshotMessage {
  url: string
  callbackUrl?: string
}

export async function handler(event: SQSEvent) {
  const results = await Promise.allSettled(
    event.Records.map(async (record) => {
      const message: ScreenshotMessage = JSON.parse(record.body)

      const params = new URLSearchParams({
        url: message.url,
        width: '1440',
        height: '900',
        type: 'webp',
        quality: '80',
      })

      const response = await fetch(
        `https://screenshotapi.to/api/v1/screenshot?${params}`,
        { headers: { 'x-api-key': process.env.SCREENSHOTAPI_KEY! } }
      )

      if (!response.ok) {
        throw new Error(`Failed: ${response.status}`)
      }

      // Upload to S3, call webhook, etc.
      if (message.callbackUrl) {
        await fetch(message.callbackUrl, {
          method: 'POST',
          body: await response.arrayBuffer(),
          headers: { 'Content-Type': 'image/webp' },
        })
      }

      return { url: message.url, status: 'captured' }
    })
  )

  const failures = results.filter((r) => r.status === 'rejected')
  if (failures.length > 0) {
    throw new Error(`${failures.length} screenshots failed`)
  }
}
```

## CDK Infrastructure

Define the full stack with AWS CDK:

```typescript
// lib/screenshot-stack.ts
import * as cdk from 'aws-cdk-lib'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as s3 from 'aws-cdk-lib/aws-s3'
import type { Construct } from 'constructs'

export class ScreenshotStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    const bucket = new s3.Bucket(this, 'ScreenshotBucket', {
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    })

    const fn = new lambda.Function(this, 'ScreenshotFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'handler.handler',
      code: lambda.Code.fromAsset('lambda'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        SCREENSHOT_BUCKET: bucket.bucketName,
        SCREENSHOTAPI_KEY: process.env.SCREENSHOTAPI_KEY!,
      },
    })

    bucket.grantWrite(fn)

    new apigateway.LambdaRestApi(this, 'ScreenshotApi', {
      handler: fn,
    })
  }
}
```

## Production Tips

### Memory Configuration

Without Chromium, your Lambda function only needs 128-256 MB of memory. This is dramatically less than the 1600 MB typically required for Puppeteer-based functions, reducing costs significantly.

### Cold Start Performance

| Approach | Cold Start | Warm Invocation | Package Size |
|----------|-----------|-----------------|-------------|
| ScreenshotAPI | ~50 ms | ~5 ms | < 1 MB |
| chrome-aws-lambda | 3-8 s | 200-500 ms | ~50 MB |
| Playwright Layer | 5-12 s | 300-800 ms | ~80 MB |

### Error Handling

Always handle API failures gracefully and use dead-letter queues for SQS-triggered functions:

```typescript
const response = await fetch(apiUrl, { headers, signal: AbortSignal.timeout(25_000) })
```

Keep the timeout slightly below Lambda's configured timeout to allow for cleanup.

### Cost Comparison

At 10,000 screenshots per month with 256 MB Lambda functions, you spend pennies on Lambda compute. The primary cost becomes your ScreenshotAPI credit package. Check the [pricing page](/pricing) for volume options.

## Further Reading

- The [JavaScript SDK documentation](/docs/sdks/javascript) has the full API parameter reference.
- See the [Vercel integration](/integrations/vercel) for another serverless approach.
- Learn about [visual regression testing](/use-cases/visual-regression-testing) for automated QA workflows.
