---
title: "How to Take Screenshots with Python: Selenium, Playwright, and API"
description: "Learn three ways to take website screenshots with Python. Compare Selenium, Playwright, and ScreenshotAPI with working code examples."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Blog
    href: /blog
  - label: How to Take Screenshots with Python
faq:
  - question: "What is the easiest way to screenshot a website with Python?"
    answer: "The easiest way is using a screenshot API like ScreenshotAPI. You send an HTTP request with the target URL and receive a PNG, JPEG, or WebP image back. No browser installation, no driver management, and no headless Chrome configuration required."
  - question: "Can I take full-page screenshots with Python?"
    answer: "Yes. Playwright supports full_page=True, Selenium requires scrolling logic, and ScreenshotAPI supports a fullPage=true query parameter that handles scrolling and lazy-loaded content automatically."
  - question: "Do I need Chrome installed to take screenshots with Python?"
    answer: "If you use Selenium or Playwright, yes. Both require a browser binary. Screenshot APIs like ScreenshotAPI run Chrome in the cloud so you do not need any local browser installation."
  - question: "How do I take screenshots of JavaScript-heavy sites with Python?"
    answer: "Use Playwright's wait_for_selector method or ScreenshotAPI's waitForSelector parameter. Both ensure the page finishes rendering JavaScript content before the screenshot is captured."
relatedPages:
  - title: "How to Take Screenshots with JavaScript"
    description: "Capture website screenshots using Node.js, Puppeteer, and ScreenshotAPI."
    href: "/blog/how-to-take-screenshots-with-javascript"
  - title: "Python Integration Guide"
    description: "Full SDK reference for the ScreenshotAPI Python client."
    href: "/docs/sdks/python"
  - title: "How to Take Full-Page Screenshots"
    description: "Capture entire scrollable pages from top to bottom."
    href: "/blog/how-to-take-full-page-screenshots"
  - title: "ScreenshotAPI vs Puppeteer"
    description: "A detailed comparison of self-hosted Puppeteer versus ScreenshotAPI."
    href: "/compare/screenshotapi-vs-puppeteer"
jsonLd:
  "@context": "https://schema.org"
  "@type": "Article"
  headline: "How to Take Screenshots with Python: Selenium, Playwright, and API"
  description: "Learn three ways to take website screenshots with Python. Compare Selenium, Playwright, and ScreenshotAPI with working code examples."
  dateModified: "2026-03-25"
---

Taking a website screenshot with Python is a common task for monitoring, testing, and generating previews. This guide walks through three approaches: Selenium, Playwright, and a dedicated screenshot API. Each has trade-offs in complexity, reliability, and scalability.

## The Hard Way: Selenium

Selenium is the oldest browser automation library for Python. It works, but it requires a matching ChromeDriver binary and a local Chrome installation.

### Install dependencies

```bash
pip install selenium webdriver-manager
```

### Basic screenshot

```python
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

options = Options()
options.add_argument("--headless=new")
options.add_argument("--window-size=1440,900")

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=options)

driver.get("https://example.com")
driver.save_screenshot("screenshot.png")
driver.quit()
```

### Full-page screenshot with Selenium

Selenium does not natively support full-page screenshots in headless Chrome. You need to resize the window to the full document height first:

```python
total_height = driver.execute_script("return document.body.scrollHeight")
driver.set_window_size(1440, total_height)
driver.save_screenshot("full_page.png")
```

This approach breaks on pages with lazy-loaded content because the scroll height changes as new elements load.

### Problems with Selenium

- ChromeDriver version must match your Chrome version exactly
- `webdriver-manager` helps but adds another dependency
- No built-in full-page screenshot support
- Crashes on memory-constrained servers
- No native support for waiting on network idle

## The Better Hard Way: Playwright

Playwright is the modern alternative to Selenium. It ships its own browser binaries, has a cleaner API, and supports full-page screenshots natively.

### Install dependencies

```bash
pip install playwright
playwright install chromium
```

### Basic screenshot

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.goto("https://example.com", wait_until="networkidle")
    page.screenshot(path="screenshot.png")
    browser.close()
```

### Full-page screenshot

```python
page.screenshot(path="full_page.png", full_page=True)
```

### Wait for specific elements

```python
page.goto("https://example.com")
page.wait_for_selector("#main-content")
page.screenshot(path="screenshot.png")
```

### Dark mode screenshot

```python
browser = p.chromium.launch()
context = browser.new_context(
    viewport={"width": 1440, "height": 900},
    color_scheme="dark"
)
page = context.new_page()
page.goto("https://example.com")
page.screenshot(path="dark_mode.png")
```

### Async variant

```python
import asyncio
from playwright.async_api import async_playwright

async def capture():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1440, "height": 900})
        await page.goto("https://example.com", wait_until="networkidle")
        await page.screenshot(path="screenshot.png")
        await browser.close()

asyncio.run(capture())
```

### Problems with Playwright

- Chromium binary is ~150 MB to download
- Requires a server with enough RAM to run a browser (512 MB minimum)
- Scaling to hundreds of concurrent screenshots requires infrastructure work
- Browser processes can leak memory on long-running servers
- Docker setup needs additional system dependencies (`libnss3`, `libatk-bridge2.0-0`, etc.)

## The Easy Way: ScreenshotAPI

[ScreenshotAPI](/) handles browser management, scaling, and rendering in the cloud. You send an HTTP request and receive an image.

### Install the Python SDK

```bash
pip install requests
```

### Basic screenshot

```python
import requests

response = requests.get(
    "https://screenshotapi.to/api/v1/screenshot",
    params={
        "url": "https://example.com",
        "width": 1440,
        "height": 900,
        "type": "png"
    },
    headers={
        "x-api-key": "sk_live_your_api_key"
    }
)

with open("screenshot.png", "wb") as f:
    f.write(response.content)
```

### Full-page screenshot

```python
response = requests.get(
    "https://screenshotapi.to/api/v1/screenshot",
    params={
        "url": "https://example.com",
        "width": 1440,
        "fullPage": True,
        "type": "png"
    },
    headers={
        "x-api-key": "sk_live_your_api_key"
    }
)
```

### Dark mode screenshot

```python
response = requests.get(
    "https://screenshotapi.to/api/v1/screenshot",
    params={
        "url": "https://example.com",
        "width": 1440,
        "height": 900,
        "colorScheme": "dark",
        "type": "png"
    },
    headers={
        "x-api-key": "sk_live_your_api_key"
    }
)
```

### Wait for JavaScript content

```python
response = requests.get(
    "https://screenshotapi.to/api/v1/screenshot",
    params={
        "url": "https://example.com",
        "waitUntil": "networkidle",
        "waitForSelector": "#main-content",
        "type": "png"
    },
    headers={
        "x-api-key": "sk_live_your_api_key"
    }
)
```

### Batch screenshots with a helper function

```python
import requests
from pathlib import Path

API_KEY = "sk_live_your_api_key"
BASE_URL = "https://screenshotapi.to/api/v1/screenshot"

def take_screenshot(url: str, filename: str, **kwargs) -> Path:
    params = {"url": url, "type": "png", **kwargs}
    headers = {"x-api-key": API_KEY}

    response = requests.get(BASE_URL, params=params, headers=headers)
    response.raise_for_status()

    output = Path(filename)
    output.write_bytes(response.content)
    return output

urls = [
    "https://github.com",
    "https://stripe.com",
    "https://linear.app",
]

for url in urls:
    domain = url.split("//")[1].replace(".", "_")
    path = take_screenshot(url, f"{domain}.png", width=1440, height=900)
    print(f"Saved: {path}")
```

## Comparison Table

| Feature | Selenium | Playwright | ScreenshotAPI |
|---|---|---|---|
| Setup time | 10-15 min | 5-10 min | 2 min |
| Browser required | Yes (Chrome) | Yes (Chromium) | No |
| Full-page support | Manual workaround | Native | Native |
| Dark mode | Not supported | Native | Native |
| Wait for selector | Manual polling | Native | Native |
| Concurrent scaling | Difficult | Difficult | Automatic |
| Docker image size | ~1.5 GB | ~800 MB | N/A |
| Memory per capture | ~200 MB | ~150 MB | 0 (cloud) |
| Cost | Free + infra | Free + infra | [Pay per credit](/pricing) |

## When to Use Each Approach

**Choose Selenium** if you already have a Selenium test suite and need screenshots as part of existing browser automation workflows.

**Choose Playwright** if you need precise control over browser behavior, are comfortable managing browser infrastructure, and do not need to scale beyond a few concurrent captures.

**Choose [ScreenshotAPI](/)** if you need reliable screenshots without managing browsers, want to scale to thousands of captures, or are building a feature like [link previews](/use-cases/link-previews) or [OG image generation](/use-cases/og-image-generation) where uptime matters.

## Next Steps

- Read the [full API documentation](/docs) for all available parameters
- Try the [JavaScript SDK](/docs/sdks/javascript) if you are working in a Node.js environment
- Learn how to [generate OG images from URLs](/blog/how-to-generate-og-images-from-url) using Python
