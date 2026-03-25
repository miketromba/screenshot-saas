# screenshotapi-go

Official Go SDK for [ScreenshotAPI](https://screenshotapi.to) — capture website screenshots with a simple API call.

## Installation

```bash
go get github.com/miketromba/screenshotapi-go
```

## Quick Start

```go
package main

import (
	"context"
	"fmt"
	"log"

	screenshotapi "github.com/miketromba/screenshotapi-go"
)

func main() {
	client := screenshotapi.NewClient("your-api-key")

	metadata, err := client.Save(context.Background(), screenshotapi.ScreenshotOptions{
		URL: "https://example.com",
	}, "screenshot.png")
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("Credits remaining: %d\n", metadata.CreditsRemaining)
}
```

## Usage

### Initialize the Client

```go
// Default configuration
client := screenshotapi.NewClient("your-api-key")

// Custom configuration
client := screenshotapi.NewClient("your-api-key",
	screenshotapi.WithBaseURL("https://custom.api.dev"),
	screenshotapi.WithTimeout(30 * time.Second),
)

// Custom HTTP client
client := screenshotapi.NewClient("your-api-key",
	screenshotapi.WithHTTPClient(&http.Client{
		Transport: &http.Transport{MaxIdleConns: 10},
	}),
)
```

### Take a Screenshot (get raw bytes)

```go
result, err := client.Screenshot(context.Background(), screenshotapi.ScreenshotOptions{
	URL:         "https://example.com",
	Width:       1920,
	Height:      1080,
	FullPage:    true,
	Type:        screenshotapi.WebP,
	Quality:     90,
	ColorScheme: screenshotapi.Dark,
})
if err != nil {
	log.Fatal(err)
}

// result.Image       — []byte of image data
// result.ContentType — e.g. "image/webp"
// result.Metadata.CreditsRemaining
// result.Metadata.ScreenshotID
// result.Metadata.DurationMs
```

### Save to File

```go
metadata, err := client.Save(ctx, screenshotapi.ScreenshotOptions{
	URL:      "https://example.com",
	FullPage: true,
	Type:     screenshotapi.PNG,
}, "screenshot.png")
```

### Context Support

All methods accept a `context.Context` for cancellation and deadlines:

```go
ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
defer cancel()

result, err := client.Screenshot(ctx, screenshotapi.ScreenshotOptions{
	URL: "https://example.com",
})
```

## API Reference

### `NewClient(apiKey string, opts ...Option) *Client`

| Option             | Type            | Default                     | Description          |
| ------------------ | --------------- | --------------------------- | -------------------- |
| `WithBaseURL`      | `string`        | `https://screenshotapi.to` | API base URL         |
| `WithTimeout`      | `time.Duration` | `60s`                       | Request timeout      |
| `WithHTTPClient`   | `*http.Client`  | —                           | Custom HTTP client   |

### `client.Screenshot(ctx, opts) (*Result, error)`

| Field             | Type          | Required | Default          | Description                     |
| ----------------- | ------------- | -------- | ---------------- | ------------------------------- |
| `URL`             | `string`      | Yes      | —                | URL to capture                  |
| `Width`           | `int`         | No       | `1440`           | Viewport width (px)             |
| `Height`          | `int`         | No       | `900`            | Viewport height (px)            |
| `FullPage`        | `bool`        | No       | `false`          | Capture full scrollable page    |
| `Type`            | `ImageType`   | No       | `PNG`            | `PNG`, `JPEG`, or `WebP`       |
| `Quality`         | `int`         | No       | `100`            | Image quality (1-100)           |
| `ColorScheme`     | `ColorScheme` | No       | —                | `Light` or `Dark`               |
| `WaitUntil`       | `WaitUntil`   | No       | `NetworkIdle2`   | Page load event to wait for     |
| `WaitForSelector` | `string`      | No       | —                | CSS selector to wait for        |
| `Delay`           | `int`         | No       | —                | Extra delay after load (ms)     |

### `client.Save(ctx, opts, path) (*Metadata, error)`

Same options as `Screenshot()` plus a file `path`. Returns only `*Metadata`.

## Error Handling

```go
import "errors"

result, err := client.Screenshot(ctx, opts)
if err != nil {
	var authErr *screenshotapi.AuthenticationError
	var creditsErr *screenshotapi.InsufficientCreditsError
	var keyErr *screenshotapi.InvalidAPIKeyError
	var failedErr *screenshotapi.ScreenshotFailedError

	switch {
	case errors.As(err, &authErr):
		// 401 — API key missing or malformed
	case errors.As(err, &creditsErr):
		fmt.Printf("Balance: %d\n", creditsErr.Balance)
		// 402 — No credits remaining
	case errors.As(err, &keyErr):
		// 403 — API key revoked or invalid
	case errors.As(err, &failedErr):
		// 500 — Screenshot capture failed
	default:
		// Other error
	}
}
```

## Requirements

- Go 1.21+
- Standard library only (no external dependencies)

## License

MIT
