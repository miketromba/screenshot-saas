---
title: "Screenshot API for Azure Functions"
description: "Deploy screenshot capture as an Azure Function with ScreenshotAPI. Node.js v4 model, C# examples, and production deployment patterns."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Integrations
    href: /integrations
  - label: Azure Functions
faq:
  - question: "Do I need a headless browser on Azure Functions?"
    answer: "No. ScreenshotAPI renders pages remotely. Your Azure Function makes an HTTP request and receives image bytes. No Puppeteer, no Chromium, no special plan required."
  - question: "Which Azure Functions runtime should I use for screenshots?"
    answer: "Node.js v4 programming model or .NET 8 isolated worker both work well. The v4 Node.js model offers an Express-like syntax that makes HTTP handlers simple to write."
  - question: "How do I store the API key in Azure Functions?"
    answer: "Use Azure Key Vault references in your application settings. Azure Functions resolves Key Vault references automatically without code changes."
  - question: "Can I use Azure Functions with a timer trigger for scheduled screenshots?"
    answer: "Yes. Create a timer-triggered function with a CRON expression. The function calls ScreenshotAPI and stores the result in Azure Blob Storage on the schedule you define."
relatedPages:
  - title: "AWS Lambda Integration"
    description: "Serverless screenshots on AWS"
    href: "/integrations/aws-lambda"
  - title: ".NET Integration"
    description: "Full ASP.NET screenshot integration"
    href: "/integrations/dotnet"
  - title: "Google Cloud Functions"
    description: "Serverless screenshots on GCP"
    href: "/integrations/google-cloud-functions"
  - title: "JavaScript SDK"
    description: "Full reference for the ScreenshotAPI JavaScript SDK"
    href: "/docs/sdks/javascript"
jsonLd:
  "@context": "https://schema.org"
  "@type": "TechArticle"
  headline: "Screenshot API for Azure Functions"
  description: "Deploy screenshot capture as an Azure Function with ScreenshotAPI. Node.js v4 model, C# examples, and production deployment patterns."
  dateModified: "2026-03-25"
---

## Deploy Screenshot Capture on Azure Functions with ScreenshotAPI

Running headless Chrome on Azure Functions requires the Premium plan for its larger execution environment, and even then, Puppeteer deployments are fragile. The consumption plan's 1.5 GB memory limit and 10-minute timeout create hard constraints that headless browsers push against.

ScreenshotAPI makes your **Azure Functions screenshot** integration lightweight. One HTTP GET returns a rendered PNG, JPEG, or WebP. Your function stays small, cold-starts remain fast, and the consumption plan works perfectly.

## Quick Start

1. [Sign up for ScreenshotAPI](https://screenshotapi.to) and copy your API key. **5 free credits** are included.
2. Add the key to your function app settings.
3. Deploy a function that calls the API.

## Installation (Node.js)

Create a new function project using the Azure Functions Core Tools:

```bash
func init screenshot-function --javascript --model V4
cd screenshot-function
npm install
```

Add the API key to `local.settings.json` for development:

```json
{
  "Values": {
    "SCREENSHOTAPI_KEY": "sk_live_xxxxx",
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node"
  }
}
```

## Node.js v4 HTTP Function

```javascript
// src/functions/screenshot.js
const { app } = require('@azure/functions');

const API_BASE = 'https://screenshotapi.to/api/v1/screenshot';

app.http('screenshot', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    const url = request.query.get('url');
    if (!url) {
      return { status: 400, jsonBody: { error: 'url parameter is required' } };
    }

    const params = new URLSearchParams({
      url,
      width: request.query.get('width') ?? '1440',
      height: request.query.get('height') ?? '900',
      type: request.query.get('type') ?? 'webp',
      quality: request.query.get('quality') ?? '80',
    });

    const colorScheme = request.query.get('colorScheme');
    if (colorScheme) params.set('colorScheme', colorScheme);

    const fullPage = request.query.get('fullPage');
    if (fullPage) params.set('fullPage', fullPage);

    try {
      const response = await fetch(`${API_BASE}?${params}`, {
        headers: { 'x-api-key': process.env.SCREENSHOTAPI_KEY },
        signal: AbortSignal.timeout(25_000),
      });

      if (!response.ok) {
        return { status: 502, jsonBody: { error: 'Screenshot capture failed' } };
      }

      const imageType = request.query.get('type') ?? 'webp';

      return {
        status: 200,
        headers: {
          'Content-Type': `image/${imageType}`,
          'Cache-Control': 'public, max-age=3600',
        },
        body: Buffer.from(await response.arrayBuffer()),
      };
    } catch {
      return { status: 502, jsonBody: { error: 'Screenshot capture timed out' } };
    }
  },
});
```

## C# Isolated Worker Function

```csharp
// ScreenshotFunction.cs
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;

public class ScreenshotFunction
{
    private readonly HttpClient _httpClient;
    private const string ApiBase = "https://screenshotapi.to/api/v1/screenshot";

    public ScreenshotFunction(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient();
        _httpClient.DefaultRequestHeaders.Add("x-api-key",
            Environment.GetEnvironmentVariable("SCREENSHOTAPI_KEY"));
    }

    [Function("screenshot")]
    public async Task<HttpResponseData> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequestData req)
    {
        var query = System.Web.HttpUtility.ParseQueryString(req.Url.Query);
        var url = query["url"];

        if (string.IsNullOrEmpty(url))
        {
            var badRequest = req.CreateResponse(System.Net.HttpStatusCode.BadRequest);
            await badRequest.WriteAsJsonAsync(new { error = "url parameter is required" });
            return badRequest;
        }

        var queryParams = new Dictionary<string, string?>
        {
            ["url"] = url,
            ["width"] = query["width"] ?? "1440",
            ["height"] = query["height"] ?? "900",
            ["type"] = query["type"] ?? "webp",
            ["quality"] = query["quality"] ?? "80",
        };

        if (!string.IsNullOrEmpty(query["colorScheme"]))
            queryParams["colorScheme"] = query["colorScheme"];

        var queryString = string.Join("&",
            queryParams.Select(kv => $"{kv.Key}={Uri.EscapeDataString(kv.Value!)}"));

        var apiResponse = await _httpClient.GetAsync($"{ApiBase}?{queryString}");

        if (!apiResponse.IsSuccessStatusCode)
        {
            var error = req.CreateResponse(System.Net.HttpStatusCode.BadGateway);
            await error.WriteAsJsonAsync(new { error = "Screenshot capture failed" });
            return error;
        }

        var imageType = query["type"] ?? "webp";
        var response = req.CreateResponse(System.Net.HttpStatusCode.OK);
        response.Headers.Add("Content-Type", $"image/{imageType}");
        response.Headers.Add("Cache-Control", "public, max-age=3600");

        var imageBytes = await apiResponse.Content.ReadAsByteArrayAsync();
        await response.Body.WriteAsync(imageBytes);

        return response;
    }
}
```

## Timer-Triggered Monitoring

Capture screenshots on a schedule and store them in Azure Blob Storage:

```javascript
const { app } = require('@azure/functions');
const { BlobServiceClient } = require('@azure/storage-blob');

const API_BASE = 'https://screenshotapi.to/api/v1/screenshot';

app.timer('screenshotMonitor', {
  schedule: '0 0 */6 * * *',
  handler: async (timer, context) => {
    const pages = [
      { name: 'homepage', url: 'https://yoursite.com' },
      { name: 'pricing', url: 'https://yoursite.com/pricing' },
    ];

    const blobClient = BlobServiceClient.fromConnectionString(
      process.env.AzureWebJobsStorage
    );
    const container = blobClient.getContainerClient('screenshots');
    await container.createIfNotExists();

    for (const page of pages) {
      const params = new URLSearchParams({
        url: page.url,
        width: '1440',
        height: '900',
        type: 'png',
      });

      const response = await fetch(`${API_BASE}?${params}`, {
        headers: { 'x-api-key': process.env.SCREENSHOTAPI_KEY },
      });

      if (response.ok) {
        const buffer = Buffer.from(await response.arrayBuffer());
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const blobName = `${page.name}/${timestamp}.png`;
        const blockBlob = container.getBlockBlobClient(blobName);

        await blockBlob.upload(buffer, buffer.length, {
          blobHTTPHeaders: { blobContentType: 'image/png' },
        });

        context.log(`Stored ${blobName} (${buffer.length} bytes)`);
      }
    }
  },
});
```

## Batch Processing with Queue Trigger

Process screenshot requests from an Azure Storage Queue:

```javascript
app.storageQueue('processScreenshot', {
  queueName: 'screenshot-requests',
  connection: 'AzureWebJobsStorage',
  handler: async (message, context) => {
    const { url, type = 'webp', quality = 80, callbackUrl } = message;

    const params = new URLSearchParams({
      url,
      width: '1440',
      height: '900',
      type,
      quality: String(quality),
    });

    const response = await fetch(`${API_BASE}?${params}`, {
      headers: { 'x-api-key': process.env.SCREENSHOTAPI_KEY },
    });

    if (!response.ok) {
      throw new Error(`Screenshot failed: ${response.status}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    if (callbackUrl) {
      await fetch(callbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': `image/${type}` },
        body: buffer,
      });
    }

    context.log(`Processed screenshot for ${url} (${buffer.length} bytes)`);
  },
});
```

## Production Tips

### Key Vault Integration

Store the API key in Azure Key Vault and reference it in app settings:

```
SCREENSHOTAPI_KEY=@Microsoft.KeyVault(SecretUri=https://myvault.vault.azure.net/secrets/screenshotapi-key/)
```

### Function Configuration

ScreenshotAPI handles all rendering, so your function needs minimal resources:

```json
{
  "functionTimeout": "00:00:30",
  "extensions": {
    "http": {
      "routePrefix": "api"
    }
  }
}
```

### CORS

If calling the function from a browser, configure CORS in the Azure portal or `host.json`.

### Cost

On the consumption plan, you pay per execution and compute time. Since ScreenshotAPI does the heavy work, each invocation is brief. At typical usage, costs stay well under $1/month for the function itself. Visit the [pricing page](/pricing) for ScreenshotAPI credit tiers.

## Further Reading

- The [.NET integration](/integrations/dotnet) covers full ASP.NET screenshot patterns.
- Compare with the [AWS Lambda integration](/integrations/aws-lambda) for cross-cloud planning.
- The [API documentation](/docs) has the full parameter reference for all endpoints.
