---
title: "How to Take Screenshots with C#: Playwright, PuppeteerSharp, and API"
description: "Capture website screenshots in C# and .NET using Playwright, PuppeteerSharp, or ScreenshotAPI. Production-ready examples for ASP.NET Core."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Blog
    href: /blog
  - label: How to Take Screenshots with C#
faq:
  - question: "What is the best .NET library for website screenshots?"
    answer: "Playwright for .NET is the best self-hosted option. It has a clean API, supports full-page screenshots, and handles dynamic content well. For production use without browser overhead, a screenshot API is more practical."
  - question: "Can I take screenshots in ASP.NET Core without installing Chrome?"
    answer: "Yes. ScreenshotAPI is a REST endpoint that returns images. Use HttpClient to make a GET request and receive a PNG, JPEG, or WebP response. No browser binaries needed."
  - question: "How large is the Docker image with Playwright and Chrome?"
    answer: "A .NET Docker image with Playwright and Chromium typically reaches 800 MB to 1.2 GB. Using a screenshot API keeps your image at the base .NET size of around 200 MB."
  - question: "Does PuppeteerSharp work with .NET 8?"
    answer: "Yes, PuppeteerSharp supports .NET 6, 7, and 8. It is a .NET port of Google's Puppeteer and requires a Chromium binary download at runtime."
relatedPages:
  - title: "How to Take Screenshots with JavaScript"
    description: "Capture screenshots using Node.js and Puppeteer."
    href: "/blog/how-to-take-screenshots-with-javascript"
  - title: "API Documentation"
    description: "Complete reference for the ScreenshotAPI REST endpoint."
    href: "/docs"
  - title: "How to Take Full-Page Screenshots"
    description: "Capture entire scrollable pages from top to bottom."
    href: "/blog/how-to-take-full-page-screenshots"
jsonLd:
  "@context": "https://schema.org"
  "@type": "Article"
  headline: "How to Take Screenshots with C#: Playwright, PuppeteerSharp, and API"
  description: "Capture website screenshots in C# and .NET using Playwright, PuppeteerSharp, or ScreenshotAPI. Production-ready examples for ASP.NET Core."
  dateModified: "2026-03-25"
---

C# developers building ASP.NET Core applications often need to capture website screenshots for thumbnails, monitoring, and report generation. This guide covers three approaches: Playwright for .NET, PuppeteerSharp, and ScreenshotAPI.

## The Hard Way: PuppeteerSharp

PuppeteerSharp is the .NET port of Google's Puppeteer. It provides familiar APIs but requires a Chromium download.

### Install

```bash
dotnet add package PuppeteerSharp
```

### Basic screenshot

```csharp
using PuppeteerSharp;

var browserFetcher = new BrowserFetcher();
await browserFetcher.DownloadAsync();

await using var browser = await Puppeteer.LaunchAsync(new LaunchOptions
{
    Headless = true
});

await using var page = await browser.NewPageAsync();
await page.SetViewportAsync(new ViewPortOptions { Width = 1440, Height = 900 });
await page.GoToAsync("https://example.com", WaitUntilNavigation.Networkidle0);
await page.ScreenshotAsync("screenshot.png");
```

### Full-page screenshot

```csharp
await page.ScreenshotAsync("full_page.png", new ScreenshotOptions { FullPage = true });
```

### PuppeteerSharp problems

- Downloads a ~300 MB Chromium binary at runtime
- Docker images grow to 1+ GB with Chrome dependencies
- Memory leaks in long-running services
- Browser processes can become zombies after crashes
- `DownloadAsync()` can fail in restricted environments

## The Better Hard Way: Playwright for .NET

Playwright offers a more modern API with better auto-waiting and element interaction.

### Install

```bash
dotnet add package Microsoft.Playwright
pwsh bin/Debug/net8.0/playwright.ps1 install chromium
```

### Basic screenshot

```csharp
using Microsoft.Playwright;

using var playwright = await Playwright.CreateAsync();
await using var browser = await playwright.Chromium.LaunchAsync();
var page = await browser.NewPageAsync(new BrowserNewPageOptions
{
    ViewportSize = new ViewportSize { Width = 1440, Height = 900 }
});

await page.GotoAsync("https://example.com", new PageGotoOptions
{
    WaitUntil = WaitUntilState.NetworkIdle
});

await page.ScreenshotAsync(new PageScreenshotOptions { Path = "screenshot.png" });
```

### Full-page screenshot

```csharp
await page.ScreenshotAsync(new PageScreenshotOptions
{
    Path = "full_page.png",
    FullPage = true
});
```

### Dark mode

```csharp
var context = await browser.NewContextAsync(new BrowserNewContextOptions
{
    ViewportSize = new ViewportSize { Width = 1440, Height = 900 },
    ColorScheme = ColorScheme.Dark
});
var page = await context.NewPageAsync();
await page.GotoAsync("https://example.com");
await page.ScreenshotAsync(new PageScreenshotOptions { Path = "dark.png" });
```

### Wait for selector

```csharp
await page.GotoAsync("https://example.com");
await page.WaitForSelectorAsync("#main-content");
await page.ScreenshotAsync(new PageScreenshotOptions { Path = "screenshot.png" });
```

### Playwright .NET limitations

- Requires a PowerShell script to install browser binaries
- Adds 400-600 MB to Docker images
- The `playwright.ps1 install` step complicates CI/CD setup
- Memory-intensive for high-concurrency workloads

## The Easy Way: ScreenshotAPI

[ScreenshotAPI](/) requires only `HttpClient`, which is built into .NET. No browsers, no binaries, no NuGet packages for browser automation.

### Basic screenshot

```csharp
using var httpClient = new HttpClient();
httpClient.DefaultRequestHeaders.Add("x-api-key", "sk_live_your_api_key");

var query = new Dictionary<string, string>
{
    ["url"] = "https://example.com",
    ["width"] = "1440",
    ["height"] = "900",
    ["type"] = "png"
};

var queryString = string.Join("&", query.Select(kv => $"{kv.Key}={Uri.EscapeDataString(kv.Value)}"));
var response = await httpClient.GetAsync($"https://screenshotapi.to/api/v1/screenshot?{queryString}");

response.EnsureSuccessStatusCode();
var imageBytes = await response.Content.ReadAsByteArrayAsync();
await File.WriteAllBytesAsync("screenshot.png", imageBytes);
```

### Reusable service

```csharp
public class ScreenshotService
{
    private readonly HttpClient _httpClient;

    public ScreenshotService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<byte[]> CaptureAsync(string url, ScreenshotOptions? options = null)
    {
        options ??= new ScreenshotOptions();

        var query = new Dictionary<string, string>
        {
            ["url"] = url,
            ["width"] = options.Width.ToString(),
            ["height"] = options.Height.ToString(),
            ["type"] = options.Format
        };

        if (options.FullPage)
            query["fullPage"] = "true";
        if (options.ColorScheme != null)
            query["colorScheme"] = options.ColorScheme;

        var queryString = string.Join("&", query.Select(kv => $"{kv.Key}={Uri.EscapeDataString(kv.Value)}"));
        var response = await _httpClient.GetAsync($"https://screenshotapi.to/api/v1/screenshot?{queryString}");

        response.EnsureSuccessStatusCode();
        return await response.Content.ReadAsByteArrayAsync();
    }
}

public class ScreenshotOptions
{
    public int Width { get; set; } = 1440;
    public int Height { get; set; } = 900;
    public string Format { get; set; } = "png";
    public bool FullPage { get; set; }
    public string? ColorScheme { get; set; }
}
```

### Register in ASP.NET Core DI

```csharp
builder.Services.AddHttpClient<ScreenshotService>(client =>
{
    client.DefaultRequestHeaders.Add("x-api-key", builder.Configuration["ScreenshotApi:Key"]);
});
```

### Minimal API endpoint

```csharp
app.MapGet("/api/preview", async (string url, ScreenshotService screenshots) =>
{
    var image = await screenshots.CaptureAsync(url, new ScreenshotOptions
    {
        Width = 1200,
        Height = 630,
        Format = "jpeg"
    });

    return Results.File(image, "image/jpeg");
});
```

## Comparison Table

| Feature | PuppeteerSharp | Playwright .NET | ScreenshotAPI |
|---|---|---|---|
| Browser required | Yes (downloads at runtime) | Yes (install script) | No |
| NuGet packages | PuppeteerSharp | Microsoft.Playwright | None (HttpClient) |
| Docker image size | ~1.2 GB | ~1 GB | ~200 MB (.NET base) |
| Full-page support | Native | Native | Native |
| Dark mode | Manual CSS | Native | Query parameter |
| ASP.NET Core DI | Manual setup | Manual setup | HttpClient factory |

## When to Use Each

**Choose PuppeteerSharp** if you are migrating from a Node.js Puppeteer setup and want API familiarity.

**Choose Playwright for .NET** if you need full browser automation beyond screenshots, like end-to-end testing.

**Choose [ScreenshotAPI](/)** for production ASP.NET Core services where Docker image size and memory usage matter. Check [pricing](/pricing) for details, and read about [visual regression testing](/blog/how-to-build-visual-regression-testing-pipeline) or [OG image generation](/use-cases/og-image-generation) for common use cases.

## Next Steps

- Read the [API documentation](/docs) for the full parameter reference
- See how to [automate website screenshots](/blog/how-to-automate-website-screenshots) in batch
- Learn about [migrating from Puppeteer](/blog/migrate-from-puppeteer) to an API-based approach
