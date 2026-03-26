---
title: "Screenshot API for Go Gin"
description: "Integrate ScreenshotAPI with Go and the Gin framework. net/http examples, middleware patterns, and concurrent screenshot capture."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Integrations
    href: /integrations
  - label: Go Gin
faq:
  - question: "Do I need Chrome or Puppeteer to take screenshots in Go?"
    answer: "No. ScreenshotAPI runs headless browsers remotely. Your Go application makes an HTTP GET request using net/http and receives the image bytes. No CGo, no browser binary."
  - question: "Does ScreenshotAPI work with the standard net/http package?"
    answer: "Yes. ScreenshotAPI is a standard REST API. You can use net/http directly, or any HTTP client library. The Gin examples here use net/http under the hood."
  - question: "How do I handle timeouts when calling ScreenshotAPI from Go?"
    answer: "Pass a context with a timeout to your HTTP request. Use context.WithTimeout to set a 30-second deadline, and the request will be cancelled automatically if it exceeds that."
  - question: "What is the best way to capture screenshots concurrently in Go?"
    answer: "Use goroutines with a WaitGroup or errgroup to capture multiple screenshots in parallel. Go's concurrency model makes this straightforward and efficient."
relatedPages:
  - title: "Express Integration"
    description: "Node.js screenshot proxy with Express"
    href: "/integrations/express"
  - title: "FastAPI Integration"
    description: "Python async screenshot capture"
    href: "/integrations/fastapi"
  - title: "Docker Integration"
    description: "Containerize Go screenshot services"
    href: "/integrations/docker"
jsonLd:
  "@context": "https://schema.org"
  "@type": "TechArticle"
  headline: "Screenshot API for Go Gin"
  description: "Integrate ScreenshotAPI with Go and the Gin framework. net/http examples, middleware patterns, and concurrent screenshot capture."
  dateModified: "2026-03-25"
---

## Capture Website Screenshots in Go with Gin and ScreenshotAPI

Go applications that need screenshot functionality typically use chromedp or rod, which embed a Chrome DevTools Protocol client and require a Chromium binary on the host. While these libraries work, they add deployment complexity and significant memory overhead for what is fundamentally an image fetch operation.

ScreenshotAPI simplifies your **Go Gin screenshot API** integration to a single HTTP call. Send a GET request, receive a rendered PNG, JPEG, or WebP image. No CGo dependencies, no browser binary, no memory-hungry headless process.

## Quick Start

1. [Sign up for ScreenshotAPI](https://screenshotapi.to) and copy your API key. **5 free credits** are included.
2. Set the API key as an environment variable.
3. Create a Gin handler that proxies screenshot requests.

## Installation

```bash
go get github.com/gin-gonic/gin
```

Set the environment variable:

```bash
export SCREENSHOTAPI_KEY=sk_live_xxxxx
```

## Basic Gin Handler

A minimal handler that accepts a URL and returns the screenshot:

```go
package main

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

var (
	apiBase = "https://screenshotapi.to/api/v1/screenshot"
	apiKey  = os.Getenv("SCREENSHOTAPI_KEY")
	client  = &http.Client{Timeout: 30 * time.Second}
)

func main() {
	r := gin.Default()
	r.GET("/api/screenshot", screenshotHandler)
	r.Run(":8080")
}

func screenshotHandler(c *gin.Context) {
	targetURL := c.Query("url")
	if targetURL == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "url parameter is required"})
		return
	}

	params := url.Values{
		"url":    {targetURL},
		"width":  {c.DefaultQuery("width", "1440")},
		"height": {c.DefaultQuery("height", "900")},
		"type":   {c.DefaultQuery("type", "webp")},
	}

	if q := c.Query("quality"); q != "" {
		params.Set("quality", q)
	}
	if c.Query("fullPage") == "true" {
		params.Set("fullPage", "true")
	}
	if cs := c.Query("colorScheme"); cs != "" {
		params.Set("colorScheme", cs)
	}

	reqURL := fmt.Sprintf("%s?%s", apiBase, params.Encode())

	req, err := http.NewRequestWithContext(c.Request.Context(), http.MethodGet, reqURL, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to build request"})
		return
	}
	req.Header.Set("x-api-key", apiKey)

	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "screenshot capture failed"})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusBadGateway, gin.H{"error": "API returned non-200 status"})
		return
	}

	imageType := c.DefaultQuery("type", "webp")
	c.Header("Content-Type", fmt.Sprintf("image/%s", imageType))
	c.Header("Cache-Control", "public, max-age=3600")

	io.Copy(c.Writer, resp.Body)
}
```

## Screenshot Client Package

Extract reusable logic into a dedicated package:

```go
// pkg/screenshot/client.go
package screenshot

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"
)

type Client struct {
	apiKey  string
	baseURL string
	http    *http.Client
}

type CaptureOptions struct {
	URL         string
	Width       int
	Height      int
	Type        string
	Quality     int
	FullPage    bool
	ColorScheme string
	WaitUntil   string
}

func NewClient(apiKey string) *Client {
	return &Client{
		apiKey:  apiKey,
		baseURL: "https://screenshotapi.to/api/v1/screenshot",
		http:    &http.Client{Timeout: 30 * time.Second},
	}
}

func (c *Client) Capture(ctx context.Context, opts CaptureOptions) ([]byte, error) {
	if opts.Width == 0 {
		opts.Width = 1440
	}
	if opts.Height == 0 {
		opts.Height = 900
	}
	if opts.Type == "" {
		opts.Type = "png"
	}

	params := url.Values{
		"url":    {opts.URL},
		"width":  {fmt.Sprintf("%d", opts.Width)},
		"height": {fmt.Sprintf("%d", opts.Height)},
		"type":   {opts.Type},
	}

	if opts.Quality > 0 {
		params.Set("quality", fmt.Sprintf("%d", opts.Quality))
	}
	if opts.FullPage {
		params.Set("fullPage", "true")
	}
	if opts.ColorScheme != "" {
		params.Set("colorScheme", opts.ColorScheme)
	}
	if opts.WaitUntil != "" {
		params.Set("waitUntil", opts.WaitUntil)
	}

	reqURL := fmt.Sprintf("%s?%s", c.baseURL, params.Encode())

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, reqURL, nil)
	if err != nil {
		return nil, fmt.Errorf("build request: %w", err)
	}
	req.Header.Set("x-api-key", c.apiKey)

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, fmt.Errorf("execute request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API returned status %d", resp.StatusCode)
	}

	return io.ReadAll(resp.Body)
}
```

## Concurrent Batch Capture

Go's goroutines make parallel screenshot capture straightforward:

```go
package screenshot

import (
	"context"
	"sync"
)

type Result struct {
	URL   string
	Image []byte
	Err   error
}

func (c *Client) CaptureAll(ctx context.Context, urls []string, opts CaptureOptions) []Result {
	results := make([]Result, len(urls))
	var wg sync.WaitGroup

	for i, u := range urls {
		wg.Add(1)
		go func(idx int, targetURL string) {
			defer wg.Done()
			o := opts
			o.URL = targetURL
			image, err := c.Capture(ctx, o)
			results[idx] = Result{URL: targetURL, Image: image, Err: err}
		}(i, u)
	}

	wg.Wait()
	return results
}
```

Use it from a Gin handler:

```go
func batchHandler(c *gin.Context) {
	urls := c.QueryArray("url")
	if len(urls) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "at least one url is required"})
		return
	}

	sc := screenshot.NewClient(apiKey)
	results := sc.CaptureAll(c.Request.Context(), urls, screenshot.CaptureOptions{
		Width:   1440,
		Height:  900,
		Type:    "webp",
		Quality: 80,
	})

	response := make([]gin.H, len(results))
	for i, r := range results {
		if r.Err != nil {
			response[i] = gin.H{"url": r.URL, "error": r.Err.Error()}
		} else {
			response[i] = gin.H{"url": r.URL, "size": len(r.Image)}
		}
	}

	c.JSON(http.StatusOK, response)
}
```

## Gin Middleware for Rate Limiting

Protect the screenshot endpoint with rate limiting middleware:

```go
func rateLimitMiddleware(maxPerMinute int) gin.HandlerFunc {
	type visitor struct {
		count    int
		resetAt  time.Time
	}

	var mu sync.Mutex
	visitors := make(map[string]*visitor)

	return func(c *gin.Context) {
		ip := c.ClientIP()
		now := time.Now()

		mu.Lock()
		v, exists := visitors[ip]
		if !exists || now.After(v.resetAt) {
			visitors[ip] = &visitor{count: 1, resetAt: now.Add(time.Minute)}
			mu.Unlock()
			c.Next()
			return
		}

		if v.count >= maxPerMinute {
			mu.Unlock()
			c.JSON(http.StatusTooManyRequests, gin.H{"error": "rate limit exceeded"})
			c.Abort()
			return
		}

		v.count++
		mu.Unlock()
		c.Next()
	}
}
```

Apply it to the screenshot route:

```go
r.GET("/api/screenshot", rateLimitMiddleware(20), screenshotHandler)
```

## Production Tips

### Connection Reuse

The default `http.Client` reuses connections via keep-alive. For high-throughput scenarios, configure the transport explicitly:

```go
client = &http.Client{
	Timeout: 30 * time.Second,
	Transport: &http.Transport{
		MaxIdleConns:        100,
		MaxIdleConnsPerHost: 10,
		IdleConnTimeout:     90 * time.Second,
	},
}
```

### Streaming Responses

For large full-page screenshots, stream the response instead of buffering it entirely in memory. Use `io.Copy` to pipe the API response directly to the Gin response writer.

### Context Cancellation

Always pass the request context to HTTP calls so screenshots are cancelled when the client disconnects. This prevents wasted credits on abandoned requests.

### Deployment

Go binaries are self-contained, making deployment trivial. No Chromium, no external dependencies. A single `go build` produces a binary that runs anywhere. Visit the [pricing page](/pricing) to pick the right credit tier.

## Further Reading

- The [Docker integration](/integrations/docker) covers containerizing Go screenshot services.
- Explore the [FastAPI integration](/integrations/fastapi) for a Python-based comparison.
- The [API documentation](/docs) has the full parameter reference for all endpoints.
