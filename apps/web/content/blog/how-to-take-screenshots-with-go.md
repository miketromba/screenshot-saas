---
title: "How to Take Screenshots with Go: chromedp, Rod, and API"
description: "Capture website screenshots in Go using chromedp, Rod, or a REST API. Production-ready code examples for each approach."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Blog
    href: /blog
  - label: How to Take Screenshots with Go
faq:
  - question: "What Go library is best for taking website screenshots?"
    answer: "chromedp is the most popular choice. It uses the Chrome DevTools Protocol directly without requiring external dependencies like Selenium. For simpler use cases, a screenshot API avoids Chrome entirely."
  - question: "Do I need Chrome installed to take screenshots with Go?"
    answer: "chromedp and Rod both require a Chrome or Chromium binary. ScreenshotAPI runs Chrome in the cloud, so you only need Go's standard net/http package."
  - question: "Can I take screenshots in Go without a headless browser?"
    answer: "Yes. ScreenshotAPI provides a REST endpoint that returns screenshot images. You make an HTTP GET request with the target URL and receive a PNG, JPEG, or WebP response."
  - question: "How do I take full-page screenshots with Go?"
    answer: "chromedp's chromedp.FullScreenshot function captures the entire page. With ScreenshotAPI, add fullPage=true to the query parameters."
relatedPages:
  - title: "How to Take Screenshots with Python"
    description: "Screenshot capture with Python, Playwright, and the API."
    href: "/blog/how-to-take-screenshots-with-python"
  - title: "Go SDK Documentation"
    description: "Full reference for the ScreenshotAPI Go client."
    href: "/docs/sdks/go"
  - title: "How to Automate Website Screenshots"
    description: "Batch capture and scheduling strategies."
    href: "/blog/how-to-automate-website-screenshots"
jsonLd:
  "@context": "https://schema.org"
  "@type": "Article"
  headline: "How to Take Screenshots with Go: chromedp, Rod, and API"
  description: "Capture website screenshots in Go using chromedp, Rod, or a REST API. Production-ready code examples for each approach."
  dateModified: "2026-03-25"
---

Go is a popular choice for backend services that need to capture website screenshots. Its strong concurrency model makes it well-suited for batch processing, but managing headless Chrome in Go introduces complexity. This guide covers three approaches: chromedp, Rod, and ScreenshotAPI.

## The Hard Way: chromedp

chromedp is the standard Go library for driving Chrome via the DevTools Protocol. It does not use WebDriver or Selenium.

### Install

```bash
go get github.com/chromedp/chromedp
```

You also need Chrome or Chromium installed on the system.

### Basic screenshot

```go
package main

import (
	"context"
	"os"

	"github.com/chromedp/chromedp"
)

func main() {
	ctx, cancel := chromedp.NewContext(context.Background())
	defer cancel()

	var buf []byte
	err := chromedp.Run(ctx,
		chromedp.EmulateViewport(1440, 900),
		chromedp.Navigate("https://example.com"),
		chromedp.CaptureScreenshot(&buf),
	)
	if err != nil {
		panic(err)
	}

	os.WriteFile("screenshot.png", buf, 0644)
}
```

### Full-page screenshot

```go
var buf []byte
err := chromedp.Run(ctx,
	chromedp.EmulateViewport(1440, 900),
	chromedp.Navigate("https://example.com"),
	chromedp.FullScreenshot(&buf, 100),
)
```

### Wait for a selector

```go
err := chromedp.Run(ctx,
	chromedp.Navigate("https://example.com"),
	chromedp.WaitVisible("#main-content", chromedp.ByID),
	chromedp.CaptureScreenshot(&buf),
)
```

### chromedp limitations

- Requires Chrome/Chromium binary on the host
- Docker images grow to 1+ GB with Chrome dependencies
- Each context spawns a new browser process (high memory usage)
- Error handling for browser crashes is manual
- No built-in retry logic or connection pooling

## The Alternative Hard Way: Rod

Rod is a newer Go library for browser automation with a simpler API than chromedp.

### Install

```bash
go get github.com/go-rod/rod
```

### Basic screenshot

```go
package main

import "github.com/go-rod/rod"

func main() {
	page := rod.New().MustConnect().MustPage("https://example.com")
	page.MustWindowResize(1440, 900)
	page.MustWaitStable()
	page.MustScreenshot("screenshot.png")
}
```

### Full-page screenshot

```go
page.MustScreenshotFullPage("full_page.png")
```

Rod auto-downloads a Chromium binary on first run, which simplifies setup but still requires a browser runtime.

## The Easy Way: ScreenshotAPI

[ScreenshotAPI](/) removes the need for Chrome entirely. You make a standard HTTP request using Go's `net/http` package and receive an image.

### Basic screenshot

```go
package main

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
)

func main() {
	params := url.Values{
		"url":    {"https://example.com"},
		"width":  {"1440"},
		"height": {"900"},
		"type":   {"png"},
	}

	endpoint := "https://screenshotapi.to/api/v1/screenshot?" + params.Encode()

	req, _ := http.NewRequest("GET", endpoint, nil)
	req.Header.Set("x-api-key", "sk_live_your_api_key")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	data, _ := io.ReadAll(resp.Body)
	os.WriteFile("screenshot.png", data, 0644)
	fmt.Println("Screenshot saved")
}
```

### Full-page screenshot

```go
params := url.Values{
	"url":      {"https://example.com"},
	"width":    {"1440"},
	"fullPage": {"true"},
	"type":     {"png"},
}
```

### Dark mode with WebP

```go
params := url.Values{
	"url":         {"https://example.com"},
	"width":       {"1440"},
	"height":      {"900"},
	"colorScheme": {"dark"},
	"type":        {"webp"},
	"quality":     {"90"},
}
```

### Reusable function with error handling

```go
package screenshot

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
)

type Options struct {
	URL         string
	Width       int
	Height      int
	FullPage    bool
	Type        string
	ColorScheme string
}

func Capture(apiKey string, opts Options) ([]byte, error) {
	params := url.Values{
		"url":  {opts.URL},
		"type": {opts.Type},
	}
	if opts.Width > 0 {
		params.Set("width", fmt.Sprintf("%d", opts.Width))
	}
	if opts.Height > 0 {
		params.Set("height", fmt.Sprintf("%d", opts.Height))
	}
	if opts.FullPage {
		params.Set("fullPage", "true")
	}
	if opts.ColorScheme != "" {
		params.Set("colorScheme", opts.ColorScheme)
	}

	endpoint := "https://screenshotapi.to/api/v1/screenshot?" + params.Encode()
	req, err := http.NewRequest("GET", endpoint, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("x-api-key", apiKey)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("screenshot API returned %d: %s", resp.StatusCode, body)
	}

	return io.ReadAll(resp.Body)
}
```

### Concurrent batch capture

```go
package main

import (
	"fmt"
	"os"
	"sync"
)

func main() {
	urls := []string{
		"https://github.com",
		"https://stripe.com",
		"https://linear.app",
		"https://vercel.com",
	}

	var wg sync.WaitGroup
	for _, u := range urls {
		wg.Add(1)
		go func(targetURL string) {
			defer wg.Done()
			data, err := screenshot.Capture("sk_live_your_api_key", screenshot.Options{
				URL:    targetURL,
				Width:  1440,
				Height: 900,
				Type:   "png",
			})
			if err != nil {
				fmt.Printf("Error capturing %s: %v\n", targetURL, err)
				return
			}
			filename := fmt.Sprintf("%s.png", sanitize(targetURL))
			os.WriteFile(filename, data, 0644)
			fmt.Printf("Saved %s\n", filename)
		}(u)
	}
	wg.Wait()
}
```

Go's goroutines make it easy to capture many screenshots concurrently without the overhead of managing browser processes.

## Comparison Table

| Feature | chromedp | Rod | ScreenshotAPI |
|---|---|---|---|
| Chrome required | Yes | Yes (auto-downloads) | No |
| Full-page support | Native | Native | Native |
| Dark mode | Manual emulation | Manual emulation | Query parameter |
| Memory per capture | ~200 MB | ~200 MB | 0 (HTTP call) |
| Concurrency | Limited by RAM | Limited by RAM | Goroutines + API |
| Docker complexity | High (Chrome deps) | High (Chrome deps) | Minimal |
| Setup | Moderate | Simple | Trivial |

## When to Use Each

**Choose chromedp** if you need full browser automation beyond screenshots, like form filling, cookie management, or complex multi-page flows.

**Choose Rod** if you prefer a simpler API than chromedp and do not mind the auto-downloaded browser binary.

**Choose [ScreenshotAPI](/)** for production workloads where reliability and simplicity matter. Go's concurrency model pairs perfectly with a stateless API. See the [pricing page](/pricing) for credit packages, or learn about specific [use cases](/use-cases/link-previews) for screenshot APIs.

## Next Steps

- Read the [API documentation](/docs) for the complete parameter reference
- See how to [automate website screenshots](/blog/how-to-automate-website-screenshots) with batch processing
- Compare [ScreenshotAPI vs Puppeteer](/compare/screenshotapi-vs-puppeteer) for more context on self-hosted vs. API approaches
