import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock } from '@/components/seo'

export const metadata: Metadata = {
	title: 'How to Take Screenshots with C# (2025)',
	description:
		'Capture website screenshots in C# using HttpClient and ScreenshotAPI. Replace Selenium and Playwright .NET with a simple API call.'
}

export default function Page() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Blog', href: '/blog' },
				{ label: 'Take Screenshots with C#' }
			]}
			title="How to Take Screenshots with C#"
			description="Capture website screenshots in C# with HttpClient — no Selenium WebDriver or Playwright .NET required. Working .NET code examples."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'Article',
				headline: 'How to Take Screenshots with C#',
				dateModified: '2026-03-25',
				publisher: {
					'@type': 'Organization',
					name: 'ScreenshotAPI',
					url: 'https://screenshotapi.to'
				}
			}}
			faq={[
				{
					question: 'Can I take screenshots in C# without Selenium?',
					answer: 'Yes. ScreenshotAPI handles browser rendering on its servers. You only need HttpClient (built into .NET) to make the request — no Selenium, Playwright, or browser drivers needed.'
				},
				{
					question: 'Does this work with .NET Core and .NET 5+?',
					answer: 'Yes. The HttpClient examples use APIs available in .NET Core 3.1, .NET 5, .NET 6, .NET 7, .NET 8, and later. They also work with .NET Framework 4.5+.'
				},
				{
					question: 'Can I use this in ASP.NET Core?',
					answer: 'Absolutely. Register HttpClient via IHttpClientFactory in your DI container for best performance. The API call works from controllers, Razor Pages, Blazor, or background services.'
				},
				{
					question: 'How do I handle the screenshot as a byte array?',
					answer: 'Use await response.Content.ReadAsByteArrayAsync() to get the raw bytes. You can then save to disk, upload to Azure Blob Storage, or return as a FileResult from an ASP.NET controller.'
				}
			]}
			relatedPages={[
				{
					title: 'Take Screenshots with Java',
					description: 'Screenshot capture in Java with HttpClient.',
					href: '/blog/how-to-take-screenshots-with-java'
				},
				{
					title: 'Take Screenshots with JavaScript',
					description: 'Screenshot capture with Node.js and fetch.',
					href: '/blog/how-to-take-screenshots-with-javascript'
				},
				{
					title: 'Best Screenshot APIs',
					description: 'Compare the top screenshot API providers.',
					href: '/blog/best-screenshot-apis'
				}
			]}
		>
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Why capture screenshots in C#?
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					C# and .NET are widely used for enterprise applications,
					internal tools, and backend services. Screenshot
					capabilities are needed for generating reports with visual
					snapshots, building monitoring dashboards, archiving web
					content, and testing. The traditional approach with Selenium
					WebDriver requires managing browser drivers and adds
					significant complexity. ScreenshotAPI simplifies this to a
					single HTTP call.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					The manual way: Selenium WebDriver
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					The traditional approach uses Selenium with a ChromeDriver:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="csharp"
						title="ScreenshotSelenium.cs"
						code={`using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;

public class ScreenshotCapture
{
    public static void Capture(string url, string outputPath = "screenshot.png")
    {
        var options = new ChromeOptions();
        options.AddArgument("--headless=new");
        options.AddArgument("--no-sandbox");
        options.AddArgument("--disable-dev-shm-usage");
        options.AddArgument("--window-size=1440,900");

        using var driver = new ChromeDriver(options);
        try
        {
            driver.Navigate().GoToUrl(url);
            Thread.Sleep(2000); // wait for rendering
            var screenshot = ((ITakesScreenshot)driver).GetScreenshot();
            screenshot.SaveAsFile(outputPath);
            Console.WriteLine($"Screenshot saved to {outputPath}");
        }
        finally
        {
            driver.Quit();
        }
    }
}`}
					/>
				</div>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					This requires the Selenium.WebDriver NuGet package,
					ChromeDriver matching your Chrome version, and Chrome
					installed. Version mismatches between Chrome and
					ChromeDriver are a constant source of failures in CI/CD
					pipelines.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					The easy way: HttpClient with ScreenshotAPI
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Use .NET&apos;s built-in HttpClient:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="csharp"
						title="ScreenshotApi.cs"
						code={`using System.Web;

public class ScreenshotService
{
    private static readonly HttpClient _client = new();

    public static async Task CaptureScreenshot(
        string url,
        string outputPath = "screenshot.png")
    {
        var query = HttpUtility.ParseQueryString(string.Empty);
        query["url"] = url;
        query["width"] = "1440";
        query["height"] = "900";
        query["type"] = "png";

        var requestUrl = $"https://screenshotapi.to/api/v1/screenshot?{query}";

        using var request = new HttpRequestMessage(HttpMethod.Get, requestUrl);
        request.Headers.Add("x-api-key", "sk_live_your_api_key");

        var response = await _client.SendAsync(request);
        response.EnsureSuccessStatusCode();

        var bytes = await response.Content.ReadAsByteArrayAsync();
        await File.WriteAllBytesAsync(outputPath, bytes);

        Console.WriteLine($"Screenshot saved to {outputPath} ({bytes.Length} bytes)");
    }
}`}
					/>
				</div>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					No NuGet packages, no browser drivers, no Chrome
					installation. Just the .NET standard library.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					ASP.NET Core integration
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					For ASP.NET Core applications, use IHttpClientFactory for
					proper connection pooling:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="csharp"
						title="Program.cs + ScreenshotService.cs"
						code={`// Program.cs — register the named client
builder.Services.AddHttpClient("ScreenshotAPI", client =>
{
    client.BaseAddress = new Uri("https://screenshotapi.to");
    client.DefaultRequestHeaders.Add("x-api-key",
        builder.Configuration["ScreenshotApi:Key"]);
    client.Timeout = TimeSpan.FromSeconds(30);
});

// ScreenshotService.cs
public class ScreenshotService(IHttpClientFactory httpClientFactory)
{
    public async Task<byte[]> CaptureAsync(string url, int width = 1440, int height = 900)
    {
        var client = httpClientFactory.CreateClient("ScreenshotAPI");

        var query = HttpUtility.ParseQueryString(string.Empty);
        query["url"] = url;
        query["width"] = width.ToString();
        query["height"] = height.ToString();
        query["type"] = "png";

        var response = await client.GetAsync($"/api/v1/screenshot?{query}");
        response.EnsureSuccessStatusCode();

        return await response.Content.ReadAsByteArrayAsync();
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
						language="csharp"
						title="Advanced options"
						code={`// Full page, dark mode, WebP
var query = HttpUtility.ParseQueryString(string.Empty);
query["url"] = "https://example.com";
query["width"] = "1440";
query["height"] = "900";
query["fullPage"] = "true";
query["colorScheme"] = "dark";
query["type"] = "webp";
query["quality"] = "85";

// Wait for dynamic content
query["waitUntil"] = "networkidle";
query["waitForSelector"] = ".dashboard-loaded";
query["delay"] = "2000";`}
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
					For screenshot-only use cases, ScreenshotAPI eliminates
					browser driver management, Chrome version conflicts, and the
					heavy dependency chain. It also works in constrained
					environments like Azure App Service or AWS Lambda where
					running Chrome is impractical.
				</p>
			</section>
		</ArticleLayout>
	)
}
