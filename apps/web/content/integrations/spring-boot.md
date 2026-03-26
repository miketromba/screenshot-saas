---
title: "Screenshot API for Spring Boot"
description: "Integrate ScreenshotAPI with Java Spring Boot. RestClient examples, service patterns, async capture, and production deployment tips."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Integrations
    href: /integrations
  - label: Spring Boot
faq:
  - question: "Do I need Selenium or Playwright for screenshots in Spring Boot?"
    answer: "No. ScreenshotAPI renders pages on remote browsers. Your Spring Boot application makes an HTTP GET request and receives image bytes. No browser driver installation needed."
  - question: "Should I use RestClient or WebClient for calling ScreenshotAPI?"
    answer: "For synchronous controllers, use RestClient (introduced in Spring Boot 3.2). For reactive applications using WebFlux, use WebClient. Both work equally well with ScreenshotAPI."
  - question: "How do I store the API key securely in Spring Boot?"
    answer: "Store it in application.yml or application.properties with an environment variable placeholder like ${SCREENSHOTAPI_KEY}. Spring Boot resolves environment variables automatically."
  - question: "Can I cache screenshots in Spring Boot?"
    answer: "Yes. Use Spring Cache with @Cacheable on your screenshot service method. Back it with Redis, Caffeine, or any supported cache provider to avoid repeat API calls."
relatedPages:
  - title: "Express Integration"
    description: "Node.js screenshot proxy with Express"
    href: "/integrations/express"
  - title: "Django Integration"
    description: "Python screenshot integration with Django"
    href: "/integrations/django"
  - title: "Docker Integration"
    description: "Containerize screenshot workflows"
    href: "/integrations/docker"
  - title: "Screenshot API Reference"
    description: "Full API parameter reference for all endpoints"
    href: "/docs/api/screenshot"
jsonLd:
  "@context": "https://schema.org"
  "@type": "TechArticle"
  headline: "Screenshot API for Spring Boot"
  description: "Integrate ScreenshotAPI with Java Spring Boot. RestClient examples, service patterns, async capture, and production deployment tips."
  dateModified: "2026-03-25"
---

## Capture Website Screenshots in Spring Boot with ScreenshotAPI

Java applications that need screenshot functionality typically reach for Selenium WebDriver or Playwright for Java, both of which require a Chromium binary on the server. Managing browser versions across dev, staging, and production environments is a constant source of friction, and running headless Chrome inside a container demands extra memory and CPU.

ScreenshotAPI eliminates that overhead for your **Spring Boot screenshot API** integration. A single HTTP GET request returns a pixel-perfect PNG, JPEG, or WebP image. No browser binaries, no WebDriver configuration, no special Docker layers.

## Quick Start

1. [Sign up for ScreenshotAPI](https://screenshotapi.to) and copy your API key. **5 free credits** are included.
2. Configure the API key in your Spring Boot application properties.
3. Create a service that calls the API and a controller that exposes the endpoint.

## Installation

No external screenshot libraries are needed. Spring Boot's built-in HTTP clients handle everything. If you use Spring Boot 3.2+, RestClient is the recommended choice:

```xml
<!-- pom.xml - only spring-boot-starter-web is required -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

Configure the API key in `application.yml`:

```yaml
screenshotapi:
  key: ${SCREENSHOTAPI_KEY}
  base-url: https://screenshotapi.to/api/v1/screenshot
```

## Screenshot Service

Create a service class that encapsulates all screenshot logic:

```java
package com.example.screenshot;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class ScreenshotService {

    private final RestClient restClient;
    private final String baseUrl;

    public ScreenshotService(
            @Value("${screenshotapi.key}") String apiKey,
            @Value("${screenshotapi.base-url}") String baseUrl) {
        this.baseUrl = baseUrl;
        this.restClient = RestClient.builder()
                .defaultHeader("x-api-key", apiKey)
                .build();
    }

    public byte[] capture(CaptureRequest request) {
        var uriBuilder = UriComponentsBuilder.fromHttpUrl(baseUrl)
                .queryParam("url", request.url())
                .queryParam("width", request.width() != null ? request.width() : 1440)
                .queryParam("height", request.height() != null ? request.height() : 900)
                .queryParam("type", request.type() != null ? request.type() : "png");

        if (request.quality() != null) {
            uriBuilder.queryParam("quality", request.quality());
        }
        if (request.fullPage() != null && request.fullPage()) {
            uriBuilder.queryParam("fullPage", "true");
        }
        if (request.colorScheme() != null) {
            uriBuilder.queryParam("colorScheme", request.colorScheme());
        }
        if (request.waitUntil() != null) {
            uriBuilder.queryParam("waitUntil", request.waitUntil());
        }

        return restClient.get()
                .uri(uriBuilder.build().toUri())
                .retrieve()
                .body(byte[].class);
    }

    public record CaptureRequest(
            String url,
            Integer width,
            Integer height,
            String type,
            Integer quality,
            Boolean fullPage,
            String colorScheme,
            String waitUntil
    ) {}
}
```

## REST Controller

Expose a screenshot endpoint for your frontend or other services:

```java
package com.example.screenshot;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ScreenshotController {

    private final ScreenshotService screenshotService;

    public ScreenshotController(ScreenshotService screenshotService) {
        this.screenshotService = screenshotService;
    }

    @GetMapping("/api/screenshot")
    public ResponseEntity<byte[]> screenshot(
            @RequestParam String url,
            @RequestParam(defaultValue = "1440") int width,
            @RequestParam(defaultValue = "900") int height,
            @RequestParam(defaultValue = "png") String type,
            @RequestParam(required = false) Integer quality,
            @RequestParam(required = false) Boolean fullPage,
            @RequestParam(required = false) String colorScheme) {

        var request = new ScreenshotService.CaptureRequest(
                url, width, height, type, quality, fullPage, colorScheme, "networkidle"
        );

        byte[] image = screenshotService.capture(request);

        MediaType mediaType = switch (type) {
            case "jpeg" -> MediaType.IMAGE_JPEG;
            case "webp" -> MediaType.parseMediaType("image/webp");
            default -> MediaType.IMAGE_PNG;
        };

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header("Cache-Control", "public, max-age=3600")
                .body(image);
    }
}
```

## Async Screenshot Capture

For batch operations or non-blocking workflows, use `@Async` with `CompletableFuture`:

```java
import org.springframework.scheduling.annotation.Async;
import java.util.concurrent.CompletableFuture;

@Service
public class AsyncScreenshotService {

    private final ScreenshotService screenshotService;

    public AsyncScreenshotService(ScreenshotService screenshotService) {
        this.screenshotService = screenshotService;
    }

    @Async
    public CompletableFuture<byte[]> captureAsync(ScreenshotService.CaptureRequest request) {
        byte[] image = screenshotService.capture(request);
        return CompletableFuture.completedFuture(image);
    }

    public List<byte[]> captureAll(List<String> urls) {
        var futures = urls.stream()
                .map(url -> captureAsync(new ScreenshotService.CaptureRequest(
                        url, 1440, 900, "webp", 80, false, null, "networkidle"
                )))
                .toList();

        return futures.stream()
                .map(CompletableFuture::join)
                .toList();
    }
}
```

## Retry with Resilience4j

Add automatic retries for transient failures:

```java
import io.github.resilience4j.retry.annotation.Retry;

@Service
public class ResilientScreenshotService {

    private final ScreenshotService screenshotService;

    public ResilientScreenshotService(ScreenshotService screenshotService) {
        this.screenshotService = screenshotService;
    }

    @Retry(name = "screenshot", fallbackMethod = "fallback")
    public byte[] captureWithRetry(ScreenshotService.CaptureRequest request) {
        return screenshotService.capture(request);
    }

    private byte[] fallback(ScreenshotService.CaptureRequest request, Exception ex) {
        throw new ScreenshotException("Screenshot capture failed after retries: " + ex.getMessage());
    }
}
```

Configure retry behavior in `application.yml`:

```yaml
resilience4j:
  retry:
    instances:
      screenshot:
        maxAttempts: 3
        waitDuration: 1s
        retryExceptions:
          - org.springframework.web.client.RestClientException
```

## Caching with Spring Cache

Avoid repeat API calls for the same URL:

```java
import org.springframework.cache.annotation.Cacheable;

@Service
public class CachedScreenshotService {

    private final ScreenshotService screenshotService;

    public CachedScreenshotService(ScreenshotService screenshotService) {
        this.screenshotService = screenshotService;
    }

    @Cacheable(value = "screenshots", key = "#request.url() + '-' + #request.width() + '-' + #request.type()")
    public byte[] capture(ScreenshotService.CaptureRequest request) {
        return screenshotService.capture(request);
    }
}
```

## Production Tips

### Input Validation

Validate URLs before sending them to the API:

```java
import java.net.URI;

public static boolean isValidUrl(String url) {
    try {
        var uri = URI.create(url);
        return "http".equals(uri.getScheme()) || "https".equals(uri.getScheme());
    } catch (IllegalArgumentException e) {
        return false;
    }
}
```

### Connection Pooling

Configure RestClient with connection pooling for high-throughput scenarios. Use Apache HttpClient 5 as the underlying client for connection reuse.

### Health Checks

Add a custom health indicator that verifies ScreenshotAPI connectivity:

```java
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;

@Component
public class ScreenshotApiHealthIndicator implements HealthIndicator {
    @Override
    public Health health() {
        // Lightweight connectivity check
        return Health.up().withDetail("service", "screenshotapi.to").build();
    }
}
```

### Deployment

ScreenshotAPI works on any platform that runs Spring Boot. No Chromium, no Selenium grid, no special Docker configuration. Whether you deploy on AWS ECS, GCP Cloud Run, or a traditional VM, the integration is a standard HTTP call. Check the [pricing page](/pricing) for credit tiers.

## Further Reading

- The [Docker integration](/integrations/docker) covers containerized deployment patterns.
- Explore the [Django integration](/integrations/django) for a Python-based comparison.
- The [API documentation](/docs) has the full parameter reference for all endpoints.
