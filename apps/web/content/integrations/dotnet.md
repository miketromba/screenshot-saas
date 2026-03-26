---
title: "Screenshot API for .NET"
description: "Integrate ScreenshotAPI with ASP.NET and .NET applications. HttpClient examples, minimal API patterns, and production deployment tips."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Integrations
    href: /integrations
  - label: .NET
faq:
  - question: "Do I need a headless browser to take screenshots in .NET?"
    answer: "No. ScreenshotAPI handles browser rendering remotely. Your .NET application makes an HTTP GET request using HttpClient and receives the image bytes. No Puppeteer Sharp or Selenium needed."
  - question: "Should I use IHttpClientFactory in my ASP.NET screenshot service?"
    answer: "Yes. IHttpClientFactory manages HttpClient lifetimes and avoids socket exhaustion issues. Register a named or typed client for ScreenshotAPI calls."
  - question: "Does ScreenshotAPI work with .NET Minimal APIs?"
    answer: "Yes. Minimal APIs in .NET 8+ can call ScreenshotAPI using injected HttpClient and return the image using Results.File or a custom IResult."
  - question: "What image format should I use for .NET screenshot integration?"
    answer: "WebP offers the best compression for web delivery. Use type=webp with quality=80. For lossless output or image processing with System.Drawing, use PNG."
relatedPages:
  - title: "Spring Boot Integration"
    description: "Java-based screenshot integration with Spring Boot"
    href: "/integrations/spring-boot"
  - title: "Azure Functions Integration"
    description: "Serverless screenshots on Azure"
    href: "/integrations/azure-functions"
  - title: "Docker Integration"
    description: "Containerize .NET screenshot workflows"
    href: "/integrations/docker"
jsonLd:
  "@context": "https://schema.org"
  "@type": "TechArticle"
  headline: "Screenshot API for .NET"
  description: "Integrate ScreenshotAPI with ASP.NET and .NET applications. HttpClient examples, minimal API patterns, and production deployment tips."
  dateModified: "2026-03-25"
---

## Capture Website Screenshots in .NET with ScreenshotAPI

.NET developers who need screenshot functionality often reach for PuppeteerSharp or Selenium WebDriver. Both require a Chromium binary that adds hundreds of megabytes to container images and introduces version management headaches across environments. On Azure App Service or AWS Lambda, running a headless browser is especially fragile.

ScreenshotAPI provides a simpler approach for your **.NET screenshot API** integration. One HTTP GET request returns a pixel-perfect PNG, JPEG, or WebP. No browser binaries, no WebDriver, no platform-specific hacks.

## Quick Start

1. [Sign up for ScreenshotAPI](https://screenshotapi.to) and copy your API key. **5 free credits** are included.
2. Configure the API key in your app settings.
3. Create a service that calls the API and an endpoint that serves images.

## Installation

No NuGet packages are required beyond what ASP.NET provides. The built-in `HttpClient` handles everything:

```json
// appsettings.json
{
  "ScreenshotApi": {
    "BaseUrl": "https://screenshotapi.to/api/v1/screenshot",
    "ApiKey": "sk_live_xxxxx"
  }
}
```

In production, use environment variables or Azure Key Vault instead of hardcoding the key.

## Configuration

Create a strongly-typed options class:

```csharp
public class ScreenshotApiOptions
{
    public string BaseUrl { get; set; } = "https://screenshotapi.to/api/v1/screenshot";
    public string ApiKey { get; set; } = string.Empty;
}
```

Register the HttpClient and options in `Program.cs`:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<ScreenshotApiOptions>(
    builder.Configuration.GetSection("ScreenshotApi"));

builder.Services.AddHttpClient("ScreenshotApi", (sp, client) =>
{
    var options = sp.GetRequiredService<IOptions<ScreenshotApiOptions>>().Value;
    client.BaseAddress = new Uri(options.BaseUrl);
    client.DefaultRequestHeaders.Add("x-api-key", options.ApiKey);
    client.Timeout = TimeSpan.FromSeconds(30);
});
```

## Screenshot Service

Create a service that wraps the HTTP calls:

```csharp
using Microsoft.Extensions.Options;

public record CaptureRequest(
    string Url,
    int Width = 1440,
    int Height = 900,
    string Type = "png",
    int? Quality = null,
    bool FullPage = false,
    string? ColorScheme = null,
    string WaitUntil = "networkidle"
);

public class ScreenshotService
{
    private readonly HttpClient _httpClient;

    public ScreenshotService(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient("ScreenshotApi");
    }

    public async Task<byte[]> CaptureAsync(CaptureRequest request, CancellationToken ct = default)
    {
        var queryParams = new Dictionary<string, string?>
        {
            ["url"] = request.Url,
            ["width"] = request.Width.ToString(),
            ["height"] = request.Height.ToString(),
            ["type"] = request.Type,
            ["waitUntil"] = request.WaitUntil,
        };

        if (request.Quality.HasValue)
            queryParams["quality"] = request.Quality.Value.ToString();
        if (request.FullPage)
            queryParams["fullPage"] = "true";
        if (request.ColorScheme is not null)
            queryParams["colorScheme"] = request.ColorScheme;

        var queryString = QueryString.Create(queryParams!);
        var response = await _httpClient.GetAsync($"?{queryString}", ct);
        response.EnsureSuccessStatusCode();

        return await response.Content.ReadAsByteArrayAsync(ct);
    }
}
```

Register the service:

```csharp
builder.Services.AddScoped<ScreenshotService>();
```

## Minimal API Endpoint

Expose a screenshot endpoint using the Minimal API style:

```csharp
var app = builder.Build();

app.MapGet("/api/screenshot", async (
    string url,
    int? width,
    int? height,
    string? type,
    int? quality,
    bool? fullPage,
    string? colorScheme,
    ScreenshotService screenshotService,
    CancellationToken ct) =>
{
    if (!Uri.TryCreate(url, UriKind.Absolute, out var uri) ||
        (uri.Scheme != "http" && uri.Scheme != "https"))
    {
        return Results.BadRequest(new { error = "Invalid URL" });
    }

    var request = new CaptureRequest(
        Url: url,
        Width: width ?? 1440,
        Height: height ?? 900,
        Type: type ?? "webp",
        Quality: quality,
        FullPage: fullPage ?? false,
        ColorScheme: colorScheme
    );

    try
    {
        var image = await screenshotService.CaptureAsync(request, ct);
        var contentType = request.Type switch
        {
            "jpeg" => "image/jpeg",
            "webp" => "image/webp",
            _ => "image/png"
        };

        return Results.File(image, contentType);
    }
    catch (HttpRequestException)
    {
        return Results.StatusCode(502);
    }
});
```

## Controller-Based Endpoint

If you prefer the traditional MVC pattern:

```csharp
[ApiController]
[Route("api/[controller]")]
public class ScreenshotController : ControllerBase
{
    private readonly ScreenshotService _screenshotService;

    public ScreenshotController(ScreenshotService screenshotService)
    {
        _screenshotService = screenshotService;
    }

    [HttpGet]
    [ResponseCache(Duration = 3600, Location = ResponseCacheLocation.Any)]
    public async Task<IActionResult> Get(
        [FromQuery] string url,
        [FromQuery] int width = 1440,
        [FromQuery] int height = 900,
        [FromQuery] string type = "webp",
        [FromQuery] int? quality = null,
        CancellationToken ct = default)
    {
        var request = new CaptureRequest(url, width, height, type, quality);
        var image = await _screenshotService.CaptureAsync(request, ct);

        var contentType = type switch
        {
            "jpeg" => "image/jpeg",
            "webp" => "image/webp",
            _ => "image/png"
        };

        return File(image, contentType);
    }
}
```

## Retry with Polly

Add resilience with the Polly library for transient failures:

```csharp
builder.Services.AddHttpClient("ScreenshotApi", (sp, client) =>
{
    var options = sp.GetRequiredService<IOptions<ScreenshotApiOptions>>().Value;
    client.BaseAddress = new Uri(options.BaseUrl);
    client.DefaultRequestHeaders.Add("x-api-key", options.ApiKey);
})
.AddStandardResilienceHandler();
```

The `AddStandardResilienceHandler` from `Microsoft.Extensions.Http.Resilience` provides retry, circuit breaker, and timeout policies out of the box.

## Batch Screenshot Capture

Capture multiple pages concurrently:

```csharp
public async Task<Dictionary<string, byte[]>> CaptureMultipleAsync(
    IEnumerable<string> urls,
    CancellationToken ct = default)
{
    var tasks = urls.Select(async url =>
    {
        var image = await CaptureAsync(new CaptureRequest(url), ct);
        return (url, image);
    });

    var results = await Task.WhenAll(tasks);
    return results.ToDictionary(r => r.url, r => r.image);
}
```

## Production Tips

### Memory Efficiency

For large images, consider streaming the response instead of buffering the entire byte array:

```csharp
public async Task<Stream> CaptureStreamAsync(CaptureRequest request, CancellationToken ct)
{
    var queryString = BuildQueryString(request);
    var response = await _httpClient.GetAsync($"?{queryString}", HttpCompletionOption.ResponseHeadersRead, ct);
    response.EnsureSuccessStatusCode();
    return await response.Content.ReadAsStreamAsync(ct);
}
```

### Health Checks

Register a health check for the screenshot API:

```csharp
builder.Services.AddHealthChecks()
    .AddUrlGroup(new Uri("https://screenshotapi.to"), "screenshotapi");
```

### Rate Limiting

Use ASP.NET's built-in rate limiting middleware to protect the screenshot endpoint from abuse:

```csharp
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("screenshot", config =>
    {
        config.PermitLimit = 20;
        config.Window = TimeSpan.FromMinutes(1);
    });
});

app.MapGet("/api/screenshot", handler).RequireRateLimiting("screenshot");
```

### Deployment

ScreenshotAPI works on any .NET hosting platform. No Chromium, no Selenium grid, no special container layers. Deploy to Azure App Service, AWS Lambda, Docker, or a bare VM. Visit the [pricing page](/pricing) to select the right credit tier.

## Further Reading

- The [Azure Functions integration](/integrations/azure-functions) covers serverless .NET screenshot patterns.
- Explore the [Spring Boot integration](/integrations/spring-boot) for a Java-based comparison.
- The [API documentation](/docs) has the full parameter reference for all endpoints.
