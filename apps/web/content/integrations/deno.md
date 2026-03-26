---
title: "Screenshot API for Deno"
description: "Capture website screenshots with Deno and ScreenshotAPI. Deno.serve examples, permissions model, and edge deployment patterns."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Integrations
    href: /integrations
  - label: Deno
faq:
  - question: "Does ScreenshotAPI work with Deno's permissions model?"
    answer: "Yes. You need --allow-net to make HTTP requests and --allow-env to read the API key from environment variables. No file system or subprocess permissions are required."
  - question: "Can I deploy a Deno screenshot service to Deno Deploy?"
    answer: "Yes. Deno Deploy supports Deno.serve and the fetch API natively. Deploy your screenshot handler as an edge function that calls ScreenshotAPI from the closest region."
  - question: "Do I need to install any packages for Deno screenshot integration?"
    answer: "No. Deno's built-in fetch API handles the HTTP request. No third-party packages or import maps needed."
  - question: "How does Deno compare to Node.js for screenshot API calls?"
    answer: "The code is nearly identical since both use the standard fetch API. Deno's advantages are built-in TypeScript support, a secure permissions model, and no node_modules."
relatedPages:
  - title: "Supabase Edge Functions"
    description: "Screenshots from Supabase Edge Functions (Deno-based)"
    href: "/integrations/supabase-edge-functions"
  - title: "Cloudflare Workers"
    description: "Edge screenshot capture with Cloudflare"
    href: "/integrations/cloudflare-workers"
  - title: "Express Integration"
    description: "Node.js screenshot proxy comparison"
    href: "/integrations/express"
  - title: "JavaScript SDK"
    description: "Full reference for the ScreenshotAPI JavaScript SDK"
    href: "/docs/sdks/javascript"
jsonLd:
  "@context": "https://schema.org"
  "@type": "TechArticle"
  headline: "Screenshot API for Deno"
  description: "Capture website screenshots with Deno and ScreenshotAPI. Deno.serve examples, permissions model, and edge deployment patterns."
  dateModified: "2026-03-25"
---

## Capture Website Screenshots with Deno and ScreenshotAPI

Deno provides a modern runtime for TypeScript and JavaScript with built-in security, native TypeScript compilation, and a standard library that includes everything you need for HTTP servers. Taking screenshots in Node.js usually means installing Puppeteer and its 50 MB Chromium binary. In Deno, the same libraries exist but they are even harder to manage due to the permissions model and different module system.

ScreenshotAPI lets your **Deno screenshot API** integration skip all of that. One fetch call returns a pixel-perfect PNG, JPEG, or WebP. No npm packages, no browser binaries, no complex permissions beyond `--allow-net`.

## Quick Start

1. [Create a free ScreenshotAPI account](https://screenshotapi.to) and copy your API key. **5 free credits** are included.
2. Set the API key as an environment variable.
3. Create a Deno server that proxies screenshot requests.

## Installation

No packages to install. Deno's built-in `fetch` and `Deno.serve` handle everything:

```bash
export SCREENSHOTAPI_KEY=sk_live_xxxxx
```

## Basic Server

A minimal Deno HTTP server that returns screenshots:

```typescript
// server.ts
const API_BASE = "https://screenshotapi.to/api/v1/screenshot";
const API_KEY = Deno.env.get("SCREENSHOTAPI_KEY")!;

Deno.serve({ port: 8000 }, async (request: Request) => {
  const url = new URL(request.url);

  if (url.pathname !== "/api/screenshot") {
    return new Response("Not Found", { status: 404 });
  }

  const targetUrl = url.searchParams.get("url");
  if (!targetUrl) {
    return Response.json({ error: "url parameter is required" }, { status: 400 });
  }

  const params = new URLSearchParams({
    url: targetUrl,
    width: url.searchParams.get("width") ?? "1440",
    height: url.searchParams.get("height") ?? "900",
    type: url.searchParams.get("type") ?? "webp",
    quality: url.searchParams.get("quality") ?? "80",
  });

  const colorScheme = url.searchParams.get("colorScheme");
  if (colorScheme) params.set("colorScheme", colorScheme);

  const fullPage = url.searchParams.get("fullPage");
  if (fullPage) params.set("fullPage", fullPage);

  const response = await fetch(`${API_BASE}?${params}`, {
    headers: { "x-api-key": API_KEY },
  });

  if (!response.ok) {
    return Response.json(
      { error: "Screenshot capture failed" },
      { status: 502 }
    );
  }

  const imageType = url.searchParams.get("type") ?? "webp";

  return new Response(await response.arrayBuffer(), {
    headers: {
      "Content-Type": `image/${imageType}`,
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
});
```

Run it with the required permissions:

```bash
deno run --allow-net --allow-env server.ts
```

## Screenshot Client Module

Extract reusable logic into a module:

```typescript
// lib/screenshot.ts
const API_BASE = "https://screenshotapi.to/api/v1/screenshot";
const API_KEY = Deno.env.get("SCREENSHOTAPI_KEY")!;

export interface CaptureOptions {
  url: string;
  width?: number;
  height?: number;
  type?: "png" | "jpeg" | "webp";
  quality?: number;
  fullPage?: boolean;
  colorScheme?: "light" | "dark";
  waitUntil?: "networkidle" | "load" | "domcontentloaded";
}

export async function captureScreenshot(
  options: CaptureOptions,
  retries = 2
): Promise<Uint8Array> {
  const params = new URLSearchParams({
    url: options.url,
    width: String(options.width ?? 1440),
    height: String(options.height ?? 900),
    type: options.type ?? "webp",
  });

  if (options.quality) params.set("quality", String(options.quality));
  if (options.fullPage) params.set("fullPage", "true");
  if (options.colorScheme) params.set("colorScheme", options.colorScheme);
  if (options.waitUntil) params.set("waitUntil", options.waitUntil);

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${API_BASE}?${params}`, {
        headers: { "x-api-key": API_KEY },
        signal: AbortSignal.timeout(30_000),
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      return new Uint8Array(await response.arrayBuffer());
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }

  throw new Error("Screenshot capture failed after retries");
}
```

## Router-Based Server

For more complex applications, build a simple router:

```typescript
// server.ts
import { captureScreenshot } from "./lib/screenshot.ts";

type Handler = (request: Request, url: URL) => Promise<Response> | Response;

const routes: Record<string, Handler> = {
  "GET /api/screenshot": async (_req, url) => {
    const targetUrl = url.searchParams.get("url");
    if (!targetUrl) {
      return Response.json({ error: "url parameter is required" }, { status: 400 });
    }

    try {
      const image = await captureScreenshot({
        url: targetUrl,
        width: Number(url.searchParams.get("width")) || 1440,
        height: Number(url.searchParams.get("height")) || 900,
        type: (url.searchParams.get("type") as "png" | "jpeg" | "webp") ?? "webp",
        quality: Number(url.searchParams.get("quality")) || 80,
        colorScheme: url.searchParams.get("colorScheme") as "light" | "dark" | undefined,
      });

      const imageType = url.searchParams.get("type") ?? "webp";
      return new Response(image, {
        headers: {
          "Content-Type": `image/${imageType}`,
          "Cache-Control": "public, max-age=3600",
        },
      });
    } catch {
      return Response.json({ error: "Screenshot capture failed" }, { status: 502 });
    }
  },

  "GET /api/screenshot/batch": async (_req, url) => {
    const urls = url.searchParams.getAll("url");
    if (urls.length === 0) {
      return Response.json({ error: "at least one url is required" }, { status: 400 });
    }

    const results = await Promise.allSettled(
      urls.map((u) => captureScreenshot({ url: u, type: "webp", quality: 80 }))
    );

    const response = urls.map((u, i) => {
      const result = results[i];
      return {
        url: u,
        success: result.status === "fulfilled",
        size: result.status === "fulfilled" ? result.value.length : 0,
      };
    });

    return Response.json(response);
  },
};

Deno.serve({ port: 8000 }, (request) => {
  const url = new URL(request.url);
  const key = `${request.method} ${url.pathname}`;
  const handler = routes[key];

  if (!handler) {
    return new Response("Not Found", { status: 404 });
  }

  return handler(request, url);
});
```

## Deno Deploy

Deploy your screenshot service to the edge with Deno Deploy. The code is identical to the local version:

```typescript
// main.ts (for Deno Deploy)
import { captureScreenshot } from "./lib/screenshot.ts";

Deno.serve(async (request: Request) => {
  const url = new URL(request.url);

  if (url.pathname !== "/api/screenshot") {
    return new Response("Not Found", { status: 404 });
  }

  const targetUrl = url.searchParams.get("url");
  if (!targetUrl) {
    return Response.json({ error: "url parameter is required" }, { status: 400 });
  }

  try {
    const image = await captureScreenshot({
      url: targetUrl,
      type: "webp",
      quality: 80,
    });

    return new Response(image, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return Response.json({ error: "Screenshot capture failed" }, { status: 502 });
  }
});
```

Set the environment variable in the Deno Deploy dashboard under project settings.

## Dark Mode Screenshots

Capture both color schemes for comparison or [visual regression testing](/use-cases/visual-regression-testing):

```typescript
const [light, dark] = await Promise.all([
  captureScreenshot({ url: "https://example.com", colorScheme: "light" }),
  captureScreenshot({ url: "https://example.com", colorScheme: "dark" }),
]);
```

## Writing Screenshots to Disk

Save captured images locally for archival or processing:

```typescript
const image = await captureScreenshot({
  url: "https://example.com",
  type: "png",
});

await Deno.writeFile("screenshot.png", image);
```

This requires the `--allow-write` permission flag.

## Production Tips

### Permissions

Run with the minimum required permissions in production:

```bash
deno run --allow-net=screenshotapi.to,0.0.0.0:8000 --allow-env=SCREENSHOTAPI_KEY server.ts
```

### URL Validation

Validate user-provided URLs before forwarding:

```typescript
function isValidUrl(input: string): boolean {
  try {
    const parsed = new URL(input);
    return ["http:", "https:"].includes(parsed.protocol);
  } catch {
    return false;
  }
}
```

### Error Handling

Always wrap fetch calls in try-catch blocks. Network errors, timeouts, and invalid URLs should return clear error messages to the client.

### Deployment Options

Deno screenshot services deploy easily to Deno Deploy, Fly.io, Railway, or any Docker host. No Chromium binary, no system dependencies. Visit the [pricing page](/pricing) to choose the right credit tier.

## Further Reading

- The [Supabase Edge Functions integration](/integrations/supabase-edge-functions) covers Deno-based serverless screenshots.
- See the [Cloudflare Workers integration](/integrations/cloudflare-workers) for another edge deployment option.
- The [API documentation](/docs) has the full parameter reference for all endpoints.
