# screenshotapi

Official Python SDK for [ScreenshotAPI](https://screenshotapi.dev) — capture website screenshots with a simple API call.

## Installation

```bash
pip install screenshotapi
```

## Quick Start

```python
from screenshotapi import ScreenshotAPI

client = ScreenshotAPI("your-api-key")

# Take a screenshot and save to file
metadata = client.save({"url": "https://example.com"}, "screenshot.png")
print(f"Credits remaining: {metadata.credits_remaining}")
```

## Usage

### Initialize the Client

```python
from screenshotapi import ScreenshotAPI

client = ScreenshotAPI(
    "your-api-key",
    base_url="https://screenshotapi.dev",  # optional
    timeout=60.0,  # optional, seconds
)
```

### Take a Screenshot (get raw bytes)

```python
from screenshotapi import ScreenshotOptions

result = client.screenshot(ScreenshotOptions(
    url="https://example.com",
    width=1920,
    height=1080,
    full_page=True,
    type="webp",
    quality=90,
    color_scheme="dark",
))

# result.image         — bytes of image data
# result.content_type  — e.g. "image/webp"
# result.metadata.credits_remaining
# result.metadata.screenshot_id
# result.metadata.duration_ms
```

You can also pass a plain dict:

```python
result = client.screenshot({
    "url": "https://example.com",
    "full_page": True,
    "type": "webp",
})
```

### Save to File

```python
metadata = client.save({"url": "https://example.com"}, "screenshot.png")
```

### Async Support

```python
import asyncio
from screenshotapi import ScreenshotAPI

client = ScreenshotAPI("your-api-key")

async def main():
    result = await client.async_screenshot({"url": "https://example.com"})
    print(f"Duration: {result.metadata.duration_ms}ms")

    # Or save directly
    await client.async_save({"url": "https://example.com"}, "screenshot.png")

asyncio.run(main())
```

## API Reference

### `ScreenshotAPI(api_key, *, base_url, timeout)`

| Parameter  | Type    | Required | Default                     | Description          |
| ---------- | ------- | -------- | --------------------------- | -------------------- |
| `api_key`  | `str`   | Yes      | —                           | Your API key         |
| `base_url` | `str`   | No       | `https://screenshotapi.dev` | API base URL         |
| `timeout`  | `float` | No       | `60.0`                      | Request timeout (s)  |

### `client.screenshot(options)` / `client.async_screenshot(options)`

Returns `ScreenshotResult`.

| Parameter           | Type   | Required | Default          | Description                     |
| ------------------- | ------ | -------- | ---------------- | ------------------------------- |
| `url`               | `str`  | Yes      | —                | URL to capture                  |
| `width`             | `int`  | No       | `1440`           | Viewport width (px)             |
| `height`            | `int`  | No       | `900`            | Viewport height (px)            |
| `full_page`         | `bool` | No       | `False`          | Capture full scrollable page    |
| `type`              | `str`  | No       | `"png"`          | `"png"`, `"jpeg"`, or `"webp"` |
| `quality`           | `int`  | No       | `100`            | Image quality (1-100)           |
| `color_scheme`      | `str`  | No       | —                | `"light"` or `"dark"`           |
| `wait_until`        | `str`  | No       | `"networkidle2"` | Page load event to wait for     |
| `wait_for_selector` | `str`  | No       | —                | CSS selector to wait for        |
| `delay`             | `int`  | No       | —                | Extra delay after load (ms)     |

### `client.save(options, path)` / `client.async_save(options, path)`

Same options as `screenshot()` plus a `path` argument. Returns `ScreenshotMetadata`.

## Error Handling

```python
from screenshotapi import (
    ScreenshotAPI,
    AuthenticationError,
    InsufficientCreditsError,
    InvalidAPIKeyError,
    ScreenshotFailedError,
)

client = ScreenshotAPI("your-api-key")

try:
    client.screenshot({"url": "https://example.com"})
except AuthenticationError:
    print("API key missing or malformed")
except InvalidAPIKeyError:
    print("API key revoked or invalid")
except InsufficientCreditsError as e:
    print(f"No credits remaining. Balance: {e.balance}")
except ScreenshotFailedError as e:
    print(f"Screenshot failed: {e}")
```

## Requirements

- Python 3.8+
- [httpx](https://www.python-httpx.org/)

## License

MIT
