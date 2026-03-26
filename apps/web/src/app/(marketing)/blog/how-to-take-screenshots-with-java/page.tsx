import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock } from '@/components/seo'

export const metadata: Metadata = {
	title: 'How to Take Screenshots with Java (2025)',
	description:
		'Capture website screenshots in Java using HttpClient and ScreenshotAPI. Replace Selenium WebDriver with a simple API call.'
}

export default function Page() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Blog', href: '/blog' },
				{ label: 'Take Screenshots with Java' }
			]}
			title="How to Take Screenshots with Java"
			description="Capture website screenshots in Java using HttpClient — no Selenium WebDriver or browser drivers required. Working Java 11+ code examples."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'Article',
				headline: 'How to Take Screenshots with Java',
				dateModified: '2026-03-25',
				publisher: {
					'@type': 'Organization',
					name: 'ScreenshotAPI',
					url: 'https://screenshotapi.to'
				}
			}}
			faq={[
				{
					question:
						'Can I take screenshots in Java without Selenium?',
					answer: "Yes. ScreenshotAPI handles browser rendering on its servers. You only need Java's built-in HttpClient (Java 11+) to make the request — no Selenium, WebDriver, or browser binaries required."
				},
				{
					question: 'What Java version do I need?',
					answer: 'The HttpClient examples use java.net.http.HttpClient, which was introduced in Java 11. For Java 8, you can use HttpURLConnection or a library like OkHttp or Apache HttpClient.'
				},
				{
					question: 'Can I use this in Spring Boot?',
					answer: 'Absolutely. Use the WebClient from Spring WebFlux for reactive applications, or RestTemplate for traditional Spring MVC apps. The API works the same way regardless of your HTTP client.'
				},
				{
					question: 'How do I handle the response as an InputStream?',
					answer: 'Use HttpResponse.BodyHandlers.ofInputStream() instead of ofByteArray() for streaming large screenshots directly to disk or to an output stream without loading everything into memory.'
				}
			]}
			relatedPages={[
				{
					title: 'Take Screenshots with C#',
					description: 'Screenshot capture in C# with HttpClient.',
					href: '/blog/how-to-take-screenshots-with-csharp'
				},
				{
					title: 'Take Screenshots with Go',
					description: 'Screenshot capture in Go with net/http.',
					href: '/blog/how-to-take-screenshots-with-go'
				},
				{
					title: 'Migrate from Puppeteer',
					description:
						'Replace browser automation with a simple API.',
					href: '/blog/migrate-from-puppeteer'
				}
			]}
		>
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Why capture screenshots in Java?
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Java is the backbone of enterprise systems, microservices,
					and data pipelines. Adding screenshot capabilities enables
					report generation with visual snapshots, link preview
					services, web monitoring, and testing pipelines. The
					traditional approach with Selenium WebDriver requires
					managing browser drivers and Chrome/Firefox installations —
					a complexity that ScreenshotAPI completely eliminates.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					The manual way: Selenium WebDriver
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					The standard approach uses Selenium with ChromeDriver:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="java"
						title="ScreenshotSelenium.java"
						code={`import org.openqa.selenium.*;
import org.openqa.selenium.chrome.*;
import java.io.*;
import java.nio.file.*;

public class ScreenshotSelenium {
    public static void capture(String url, String outputPath) {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless=new");
        options.addArguments("--no-sandbox");
        options.addArguments("--disable-dev-shm-usage");
        options.addArguments("--window-size=1440,900");

        WebDriver driver = new ChromeDriver(options);
        try {
            driver.get(url);
            Thread.sleep(2000);
            File src = ((TakesScreenshot) driver).getScreenshotAs(OutputType.FILE);
            Files.copy(src.toPath(), Path.of(outputPath),
                StandardCopyOption.REPLACE_EXISTING);
            System.out.println("Screenshot saved to " + outputPath);
        } catch (Exception e) {
            System.err.println("Screenshot failed: " + e.getMessage());
        } finally {
            driver.quit();
        }
    }
}`}
					/>
				</div>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					This requires the Selenium dependency, ChromeDriver binary
					matching your Chrome version, and Chrome installed. Driver
					version mismatches are the most common source of CI/CD
					failures with Selenium.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					The easy way: HttpClient with ScreenshotAPI
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Use Java&apos;s built-in HttpClient (Java 11+):
				</p>
				<div className="mt-6">
					<CodeBlock
						language="java"
						title="ScreenshotApi.java"
						code={`import java.net.URI;
import java.net.URLEncoder;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;

public class ScreenshotApi {
    private static final HttpClient client = HttpClient.newHttpClient();
    private static final String API_KEY = "sk_live_your_api_key";

    public static void capture(String url, String outputPath) throws Exception {
        String encodedUrl = URLEncoder.encode(url, StandardCharsets.UTF_8);
        String apiUrl = "https://screenshotapi.to/api/v1/screenshot"
            + "?url=" + encodedUrl
            + "&width=1440&height=900&type=png";

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create(apiUrl))
            .header("x-api-key", API_KEY)
            .GET()
            .build();

        HttpResponse<byte[]> response = client.send(
            request, HttpResponse.BodyHandlers.ofByteArray());

        if (response.statusCode() != 200) {
            throw new RuntimeException("API error: " + response.statusCode());
        }

        Files.write(Path.of(outputPath), response.body());
        System.out.printf("Screenshot saved to %s (%d bytes)%n",
            outputPath, response.body().length);
    }

    public static void main(String[] args) throws Exception {
        capture("https://example.com", "screenshot.png");
    }
}`}
					/>
				</div>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Zero external dependencies. No Selenium, no ChromeDriver, no
					browser installation. Just the Java standard library.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Spring Boot integration
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					For Spring Boot applications, create a service that can be
					injected into controllers:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="java"
						title="ScreenshotService.java"
						code={`import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
public class ScreenshotService {
    private final WebClient webClient;

    public ScreenshotService(@Value("\${screenshotapi.key}") String apiKey) {
        this.webClient = WebClient.builder()
            .baseUrl("https://screenshotapi.to")
            .defaultHeader("x-api-key", apiKey)
            .build();
    }

    public Mono<byte[]> capture(String url, int width, int height) {
        return webClient.get()
            .uri(uriBuilder -> uriBuilder
                .path("/api/v1/screenshot")
                .queryParam("url", url)
                .queryParam("width", width)
                .queryParam("height", height)
                .queryParam("type", "png")
                .build())
            .retrieve()
            .bodyToMono(byte[].class);
    }
}`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Advanced parameters
				</h2>
				<div className="mt-6">
					<CodeBlock
						language="java"
						title="Advanced options"
						code={`// Full page, dark mode, WebP
String apiUrl = "https://screenshotapi.to/api/v1/screenshot"
    + "?url=" + URLEncoder.encode(url, StandardCharsets.UTF_8)
    + "&width=1440&height=900"
    + "&fullPage=true"
    + "&colorScheme=dark"
    + "&type=webp"
    + "&quality=85";

// Wait for dynamic content
String spaUrl = "https://screenshotapi.to/api/v1/screenshot"
    + "?url=" + URLEncoder.encode(url, StandardCharsets.UTF_8)
    + "&waitUntil=networkidle"
    + "&waitForSelector=.dashboard-loaded"
    + "&delay=2000"
    + "&type=png";`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Selenium vs ScreenshotAPI
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Use Selenium when you need full browser automation — testing
					login flows, form submissions, or multi-step user journeys.
					For screenshot-only use cases, ScreenshotAPI eliminates the
					ChromeDriver version dance, reduces Docker image sizes, and
					removes the need for Chrome installation on your servers. It
					is also more reliable in CI/CD environments where browser
					driver management is fragile.
				</p>
			</section>
		</ArticleLayout>
	)
}
