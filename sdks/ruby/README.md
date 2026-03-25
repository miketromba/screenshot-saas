# screenshotapi

Official Ruby SDK for [ScreenshotAPI](https://screenshotapi.dev) — capture website screenshots with a simple API call.

## Installation

Add to your Gemfile:

```ruby
gem "screenshotapi"
```

Or install directly:

```bash
gem install screenshotapi
```

## Quick Start

```ruby
require "screenshotapi"

client = ScreenshotAPI::Client.new("your-api-key")

# Take a screenshot and save to file
metadata = client.save(url: "https://example.com", path: "screenshot.png")
puts "Credits remaining: #{metadata.credits_remaining}"
```

## Usage

### Initialize the Client

```ruby
client = ScreenshotAPI::Client.new(
  "your-api-key",
  base_url: "https://screenshotapi.dev", # optional
  timeout: 60 # optional, seconds
)
```

### Take a Screenshot (get raw bytes)

```ruby
result = client.screenshot(
  url: "https://example.com",
  width: 1920,
  height: 1080,
  full_page: true,
  type: "webp",
  quality: 90,
  color_scheme: "dark"
)

# result.image        — binary string of image data
# result.content_type — e.g. "image/webp"
# result.metadata.credits_remaining
# result.metadata.screenshot_id
# result.metadata.duration_ms
```

### Save to File

```ruby
metadata = client.save(
  url: "https://example.com",
  full_page: true,
  type: "png",
  path: "screenshot.png"
)
```

## API Reference

### `ScreenshotAPI::Client.new(api_key, base_url:, timeout:)`

| Parameter  | Type      | Required | Default                     | Description          |
| ---------- | --------- | -------- | --------------------------- | -------------------- |
| `api_key`  | `String`  | Yes      | —                           | Your API key         |
| `base_url` | `String`  | No       | `https://screenshotapi.dev` | API base URL         |
| `timeout`  | `Integer` | No       | `60`                        | Request timeout (s)  |

### `client.screenshot(**options)`

Returns `ScreenshotAPI::Result`.

| Parameter           | Type      | Required | Default          | Description                     |
| ------------------- | --------- | -------- | ---------------- | ------------------------------- |
| `url`               | `String`  | Yes      | —                | URL to capture                  |
| `width`             | `Integer` | No       | `1440`           | Viewport width (px)             |
| `height`            | `Integer` | No       | `900`            | Viewport height (px)            |
| `full_page`         | `Boolean` | No       | `false`          | Capture full scrollable page    |
| `type`              | `String`  | No       | `"png"`          | `"png"`, `"jpeg"`, or `"webp"` |
| `quality`           | `Integer` | No       | `100`            | Image quality (1-100)           |
| `color_scheme`      | `String`  | No       | —                | `"light"` or `"dark"`           |
| `wait_until`        | `String`  | No       | `"networkidle2"` | Page load event to wait for     |
| `wait_for_selector` | `String`  | No       | —                | CSS selector to wait for        |
| `delay`             | `Integer` | No       | —                | Extra delay after load (ms)     |

### `client.save(path:, **options)`

Same options as `screenshot()` plus `path:`. Returns `ScreenshotAPI::Metadata`.

## Error Handling

```ruby
require "screenshotapi"

client = ScreenshotAPI::Client.new("your-api-key")

begin
  client.screenshot(url: "https://example.com")
rescue ScreenshotAPI::AuthenticationError
  # 401 — API key missing or malformed
rescue ScreenshotAPI::InvalidAPIKeyError
  # 403 — API key revoked or invalid
rescue ScreenshotAPI::InsufficientCreditsError => e
  puts "Balance: #{e.balance}"
  # 402 — No credits remaining
rescue ScreenshotAPI::ScreenshotFailedError => e
  puts "Failed: #{e.message}"
  # 500 — Screenshot capture failed
end
```

## Requirements

- Ruby 3.0+
- No external dependencies (uses `net/http` from stdlib)

## License

MIT
