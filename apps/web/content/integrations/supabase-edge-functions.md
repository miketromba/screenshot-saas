---
title: "Screenshot API for Supabase Edge Functions"
description: "Capture website screenshots from Supabase Edge Functions with ScreenshotAPI. Deno-based handlers, database integration, and storage patterns."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Integrations
    href: /integrations
  - label: Supabase Edge Functions
faq:
  - question: "Can I call ScreenshotAPI from a Supabase Edge Function?"
    answer: "Yes. Supabase Edge Functions run Deno and support the standard fetch API. Call ScreenshotAPI like any other HTTP endpoint and return the image data."
  - question: "How do I store the API key in Supabase Edge Functions?"
    answer: "Use Supabase project secrets. Set the secret with the Supabase CLI and access it with Deno.env.get() inside your function."
  - question: "Can I store screenshots in Supabase Storage?"
    answer: "Yes. After capturing a screenshot, use the Supabase client to upload the image to a Storage bucket. This gives you a public URL for the image."
  - question: "Do I need to install any packages for Edge Functions?"
    answer: "No. The built-in fetch API handles the HTTP request. Import the Supabase client from the esm.sh CDN if you need database or storage access."
relatedPages:
  - title: "Deno Integration"
    description: "Screenshots with the Deno runtime"
    href: "/integrations/deno"
  - title: "Cloudflare Workers"
    description: "Edge screenshot capture with Cloudflare"
    href: "/integrations/cloudflare-workers"
  - title: "Vercel Integration"
    description: "Serverless screenshots on Vercel"
    href: "/integrations/vercel"
jsonLd:
  "@context": "https://schema.org"
  "@type": "TechArticle"
  headline: "Screenshot API for Supabase Edge Functions"
  description: "Capture website screenshots from Supabase Edge Functions with ScreenshotAPI. Deno-based handlers, database integration, and storage patterns."
  dateModified: "2026-03-25"
---

## Capture Website Screenshots from Supabase Edge Functions with ScreenshotAPI

Supabase Edge Functions run Deno at the edge, giving you a serverless execution environment close to your users. They pair naturally with Supabase's database, auth, and storage services. Adding screenshot functionality without ScreenshotAPI would mean trying to run Puppeteer in a Deno edge environment, which is not supported.

ScreenshotAPI fits perfectly into the **Supabase Edge Functions screenshot** workflow. One fetch call returns a rendered PNG, JPEG, or WebP image that you can return directly, store in Supabase Storage, or save metadata to your Postgres database.

## Quick Start

1. [Sign up for ScreenshotAPI](https://screenshotapi.to) and copy your API key. **5 free credits** are included.
2. Store the key as a Supabase project secret.
3. Create an Edge Function that calls the API.

## Installation

Set up the Supabase CLI and create a function:

```bash
supabase functions new screenshot
```

Store the API key as a secret:

```bash
supabase secrets set SCREENSHOTAPI_KEY=sk_live_xxxxx
```

## Basic Edge Function

```typescript
// supabase/functions/screenshot/index.ts
const API_BASE = "https://screenshotapi.to/api/v1/screenshot";

Deno.serve(async (request: Request) => {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get("url");

  if (!targetUrl) {
    return Response.json(
      { error: "url parameter is required" },
      { status: 400 }
    );
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

  const apiKey = Deno.env.get("SCREENSHOTAPI_KEY")!;

  const response = await fetch(`${API_BASE}?${params}`, {
    headers: { "x-api-key": apiKey },
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
      "Cache-Control": "public, max-age=3600",
    },
  });
});
```

Deploy the function:

```bash
supabase functions deploy screenshot
```

Test it:

```bash
curl "https://your-project.supabase.co/functions/v1/screenshot?url=https://example.com" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  --output screenshot.webp
```

## Store Screenshots in Supabase Storage

Capture a screenshot and upload it to a Supabase Storage bucket:

```typescript
// supabase/functions/screenshot-store/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const API_BASE = "https://screenshotapi.to/api/v1/screenshot";

Deno.serve(async (request: Request) => {
  const { url, type = "webp", quality = 80 } = await request.json();

  if (!url) {
    return Response.json({ error: "url is required" }, { status: 400 });
  }

  const apiKey = Deno.env.get("SCREENSHOTAPI_KEY")!;

  const params = new URLSearchParams({
    url,
    width: "1440",
    height: "900",
    type,
    quality: String(quality),
  });

  const response = await fetch(`${API_BASE}?${params}`, {
    headers: { "x-api-key": apiKey },
  });

  if (!response.ok) {
    return Response.json({ error: "Screenshot capture failed" }, { status: 502 });
  }

  const imageBuffer = await response.arrayBuffer();

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const filename = `${Date.now()}-${crypto.randomUUID()}.${type}`;

  const { error: uploadError } = await supabase.storage
    .from("screenshots")
    .upload(filename, imageBuffer, {
      contentType: `image/${type}`,
      cacheControl: "86400",
    });

  if (uploadError) {
    return Response.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: publicUrl } = supabase.storage
    .from("screenshots")
    .getPublicUrl(filename);

  return Response.json({
    url: publicUrl.publicUrl,
    size: imageBuffer.byteLength,
    filename,
  });
});
```

## Save Metadata to Database

Track screenshot captures in your Postgres database:

```typescript
// supabase/functions/screenshot-track/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const API_BASE = "https://screenshotapi.to/api/v1/screenshot";

Deno.serve(async (request: Request) => {
  const { url, type = "webp" } = await request.json();

  if (!url) {
    return Response.json({ error: "url is required" }, { status: 400 });
  }

  const apiKey = Deno.env.get("SCREENSHOTAPI_KEY")!;

  const params = new URLSearchParams({
    url,
    width: "1440",
    height: "900",
    type,
    quality: "80",
  });

  const startTime = Date.now();

  const response = await fetch(`${API_BASE}?${params}`, {
    headers: { "x-api-key": apiKey },
  });

  const durationMs = Date.now() - startTime;

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  if (!response.ok) {
    await supabase.from("screenshot_logs").insert({
      url,
      success: false,
      status_code: response.status,
      duration_ms: durationMs,
    });

    return Response.json({ error: "Screenshot capture failed" }, { status: 502 });
  }

  const imageBuffer = await response.arrayBuffer();

  const filename = `${Date.now()}.${type}`;
  await supabase.storage.from("screenshots").upload(filename, imageBuffer, {
    contentType: `image/${type}`,
  });

  const { data: publicUrl } = supabase.storage
    .from("screenshots")
    .getPublicUrl(filename);

  await supabase.from("screenshot_logs").insert({
    url,
    success: true,
    status_code: 200,
    duration_ms: durationMs,
    file_size: imageBuffer.byteLength,
    storage_path: filename,
    public_url: publicUrl.publicUrl,
  });

  return Response.json({
    url: publicUrl.publicUrl,
    size: imageBuffer.byteLength,
    duration: durationMs,
  });
});
```

## Auth-Protected Screenshot Function

Require authentication before allowing screenshot capture:

```typescript
// supabase/functions/screenshot-auth/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const API_BASE = "https://screenshotapi.to/api/v1/screenshot";

Deno.serve(async (request: Request) => {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    return Response.json({ error: "Missing authorization" }, { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const targetUrl = url.searchParams.get("url");

  if (!targetUrl) {
    return Response.json({ error: "url parameter is required" }, { status: 400 });
  }

  const params = new URLSearchParams({
    url: targetUrl,
    width: "1440",
    height: "900",
    type: "webp",
    quality: "80",
  });

  const apiKey = Deno.env.get("SCREENSHOTAPI_KEY")!;

  const response = await fetch(`${API_BASE}?${params}`, {
    headers: { "x-api-key": apiKey },
  });

  if (!response.ok) {
    return Response.json({ error: "Screenshot capture failed" }, { status: 502 });
  }

  return new Response(await response.arrayBuffer(), {
    headers: {
      "Content-Type": "image/webp",
      "Cache-Control": "public, max-age=3600",
    },
  });
});
```

## Production Tips

### Secrets Management

Always use `supabase secrets set` for API keys. Never hardcode secrets in your function code. Access them with `Deno.env.get()` at runtime.

### CORS

If calling the Edge Function from a browser, handle CORS headers:

```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

if (request.method === "OPTIONS") {
  return new Response("ok", { headers: corsHeaders });
}
```

### Storage Buckets

Create a `screenshots` bucket in the Supabase dashboard. Set it to public if you want direct URL access to images. Add lifecycle policies to clean up old screenshots.

### Rate Limiting

Supabase Edge Functions do not include built-in rate limiting. Implement request counting in your database or use Supabase RLS policies to control access. Visit the [pricing page](/pricing) for credit tier options.

## Further Reading

- The [Deno integration](/integrations/deno) covers standalone Deno screenshot patterns.
- See the [Cloudflare Workers integration](/integrations/cloudflare-workers) for another edge-based approach.
- The [API documentation](/docs) has the full parameter reference for all endpoints.
