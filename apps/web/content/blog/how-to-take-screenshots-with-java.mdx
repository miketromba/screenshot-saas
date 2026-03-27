---
title: "How to Take Screenshots with Java: Selenium, Playwright, and API"
description: "Capture website screenshots in Java using Selenium WebDriver, Playwright, or ScreenshotAPI. Production-ready examples for Spring Boot."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Blog
    href: /blog
  - label: How to Take Screenshots with Java
faq:
  - question: "What is the best Java library for website screenshots?"
    answer: "Selenium WebDriver is the most mature option with extensive documentation. Playwright for Java is newer but has better auto-waiting and a cleaner API. For production use without managing browsers, a REST API is the simplest approach."
  - question: "Can I take screenshots in Spring Boot without Chrome?"
    answer: "Yes. ScreenshotAPI provides a REST endpoint. Use Java's HttpClient or Spring's RestTemplate/WebClient to make a GET request and receive an image response."
  - question: "How do I handle ChromeDriver version mismatches?"
    answer: "Use WebDriverManager to automatically download the correct ChromeDriver version for your Chrome installation. Add io.github.bonigarcia:webdrivermanager to your dependencies."
  - question: "Can Java take full-page screenshots?"
    answer: "Selenium requires a workaround by resizing the window to the document height. Playwright for Java supports full-page screenshots natively. ScreenshotAPI accepts a fullPage=true parameter."
relatedPages:
  - title: "How to Take Screenshots with Python"
    description: "Python-based screenshot capture and comparison."
    href: "/blog/how-to-take-screenshots-with-python"
  - title: "API Documentation"
    description: "Complete reference for the ScreenshotAPI REST endpoint."
    href: "/docs"
  - title: "How to Automate Website Screenshots"
    description: "Batch screenshot workflows for monitoring and archival."
    href: "/blog/how-to-automate-website-screenshots"
jsonLd:
  "@context": "https://schema.org"
  "@type": "Article"
  headline: "How to Take Screenshots with Java: Selenium, Playwright, and API"
  description: "Capture website screenshots in Java using Selenium WebDriver, Playwright, or ScreenshotAPI. Production-ready examples for Spring Boot."
  dateModified: "2026-03-25"
---

Java applications in enterprise environments frequently need to capture website screenshots for compliance reports, monitoring dashboards, and document generation. This guide covers three approaches for taking a website screenshot with Java: Selenium WebDriver, Playwright, and ScreenshotAPI.

## The Hard Way: Selenium WebDriver

Selenium is the standard browser automation library in the Java ecosystem. It is well-documented but requires ChromeDriver and Chrome.

### Maven dependencies

```xml
<dependencies>
    <dependency>
        <groupId>org.seleniumhq.selenium</groupId>
        <artifactId>selenium-java</artifactId>
        <version>4.18.1</version>
    </dependency>
    <dependency>
        <groupId>io.github.bonigarcia</groupId>
        <artifactId>webdrivermanager</artifactId>
        <version>5.7.0</version>
    </dependency>
</dependencies>
```

### Basic screenshot

```java
import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.*;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;

public class Screenshot {
    public static void main(String[] args) throws Exception {
        WebDriverManager.chromedriver().setup();

        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless=new", "--window-size=1440,900");

        WebDriver driver = new ChromeDriver(options);
        driver.get("https://example.com");

        File screenshot = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
        Files.copy(screenshot.toPath(), Path.of("screenshot.png"));

        driver.quit();
    }
}
```

### Wait for elements

```java
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;
import java.time.Duration;

WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("main-content")));
File screenshot = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
```

### Selenium limitations

- ChromeDriver version must match Chrome version exactly
- No native full-page screenshot support
- Heavy memory footprint (~300 MB per browser instance)
- WebDriverManager adds startup latency
- Flaky in containerized environments without proper font packages

## The Better Hard Way: Playwright for Java

Playwright provides a modern alternative with better SPA handling and full-page support.

### Maven dependency

```xml
<dependency>
    <groupId>com.microsoft.playwright</groupId>
    <artifactId>playwright</artifactId>
    <version>1.42.0</version>
</dependency>
```

### Basic screenshot

```java
import com.microsoft.playwright.*;

public class Screenshot {
    public static void main(String[] args) {
        try (Playwright playwright = Playwright.create()) {
            Browser browser = playwright.chromium().launch();
            BrowserContext context = browser.newContext(
                new Browser.NewContextOptions().setViewportSize(1440, 900)
            );
            Page page = context.newPage();
            page.navigate("https://example.com",
                new Page.NavigateOptions().setWaitUntil(WaitUntilState.NETWORKIDLE));
            page.screenshot(new Page.ScreenshotOptions().setPath(Path.of("screenshot.png")));
        }
    }
}
```

### Full-page screenshot

```java
page.screenshot(new Page.ScreenshotOptions()
    .setPath(Path.of("full_page.png"))
    .setFullPage(true));
```

### Dark mode

```java
BrowserContext context = browser.newContext(
    new Browser.NewContextOptions()
        .setViewportSize(1440, 900)
        .setColorScheme(ColorScheme.DARK)
);
```

## The Easy Way: ScreenshotAPI

[ScreenshotAPI](/) works with Java's built-in `HttpClient`. No browser binaries, no extra dependencies.

### Basic screenshot (Java 11+)

```java
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.stream.Collectors;

public class Screenshot {
    private static final String API_KEY = "sk_live_your_api_key";
    private static final String BASE_URL = "https://screenshotapi.to/api/v1/screenshot";

    public static void main(String[] args) throws Exception {
        Map<String, String> params = Map.of(
            "url", "https://example.com",
            "width", "1440",
            "height", "900",
            "type", "png"
        );

        String query = params.entrySet().stream()
            .map(e -> e.getKey() + "=" + URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8))
            .collect(Collectors.joining("&"));

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(BASE_URL + "?" + query))
            .header("x-api-key", API_KEY)
            .GET()
            .build();

        HttpResponse<byte[]> response = HttpClient.newHttpClient()
            .send(request, HttpResponse.BodyHandlers.ofByteArray());

        Files.write(Path.of("screenshot.png"), response.body());
    }
}
```

### Reusable service class

```java
public class ScreenshotService {
    private final HttpClient httpClient;
    private final String apiKey;

    public ScreenshotService(String apiKey) {
        this.apiKey = apiKey;
        this.httpClient = HttpClient.newHttpClient();
    }

    public byte[] capture(String url, Map<String, String> options) throws Exception {
        Map<String, String> params = new java.util.HashMap<>(options);
        params.put("url", url);
        params.putIfAbsent("width", "1440");
        params.putIfAbsent("height", "900");
        params.putIfAbsent("type", "png");

        String query = params.entrySet().stream()
            .map(e -> e.getKey() + "=" + URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8))
            .collect(Collectors.joining("&"));

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://screenshotapi.to/api/v1/screenshot?" + query))
            .header("x-api-key", apiKey)
            .GET()
            .build();

        HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Screenshot API returned " + response.statusCode());
        }

        return response.body();
    }
}
```

### Spring Boot integration

```java
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

@Service
public class ScreenshotService {

    private final RestTemplate restTemplate;
    private final String apiKey;

    public ScreenshotService(RestTemplate restTemplate,
                              @Value("${screenshot.api-key}") String apiKey) {
        this.restTemplate = restTemplate;
        this.apiKey = apiKey;
    }

    public byte[] capture(String url) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("x-api-key", apiKey);

        String endpoint = String.format(
            "https://screenshotapi.to/api/v1/screenshot?url=%s&width=1440&height=900&type=png",
            URLEncoder.encode(url, StandardCharsets.UTF_8)
        );

        ResponseEntity<byte[]> response = restTemplate.exchange(
            endpoint, HttpMethod.GET, new HttpEntity<>(headers), byte[].class
        );

        return response.getBody();
    }
}
```

### Spring Boot REST controller

```java
@RestController
public class PreviewController {

    private final ScreenshotService screenshotService;

    public PreviewController(ScreenshotService screenshotService) {
        this.screenshotService = screenshotService;
    }

    @GetMapping("/api/preview")
    public ResponseEntity<byte[]> preview(@RequestParam String url) {
        byte[] image = screenshotService.capture(url);
        return ResponseEntity.ok()
            .contentType(MediaType.IMAGE_PNG)
            .cacheControl(CacheControl.maxAge(Duration.ofDays(1)).cachePublic())
            .body(image);
    }
}
```

## Comparison Table

| Feature | Selenium | Playwright Java | ScreenshotAPI |
|---|---|---|---|
| Browser required | Yes + ChromeDriver | Yes (auto-install) | No |
| Full-page support | Manual workaround | Native | Native |
| Dark mode | Not supported | Native | Query parameter |
| Memory per capture | ~300 MB | ~250 MB | 0 (HTTP call) |
| Spring Boot DI | Manual | Manual | RestTemplate/WebClient |
| Docker image size | ~1.5 GB | ~1 GB | ~300 MB (JRE base) |

## When to Use Each

**Choose Selenium** if you have existing Selenium test infrastructure and need screenshots as a side effect.

**Choose Playwright for Java** for modern browser automation needs with better reliability than Selenium.

**Choose [ScreenshotAPI](/)** for production Spring Boot services, microservices, and cloud deployments. Check [pricing](/pricing) for credit-based plans, and see how to [build visual regression pipelines](/blog/how-to-build-visual-regression-testing-pipeline) or [generate website thumbnails](/blog/how-to-add-website-thumbnails-to-your-app).

## Next Steps

- Read the [API documentation](/docs) for all available parameters
- Explore the [cURL guide](/blog/how-to-take-screenshots-with-curl) for quick testing
- Learn about [automating screenshots](/blog/how-to-automate-website-screenshots) for batch processing
