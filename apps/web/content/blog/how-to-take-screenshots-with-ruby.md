---
title: "How to Take Screenshots with Ruby: Ferrum, Selenium, and API"
description: "Take website screenshots in Ruby using Ferrum, Selenium WebDriver, or ScreenshotAPI. Complete code examples for Rails and standalone scripts."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Blog
    href: /blog
  - label: How to Take Screenshots with Ruby
faq:
  - question: "What is the best Ruby gem for taking website screenshots?"
    answer: "Ferrum is the modern choice. It drives Chrome via the DevTools Protocol without needing Selenium or ChromeDriver. For production use without managing Chrome, a screenshot API is simpler."
  - question: "Can I take screenshots in a Rails application?"
    answer: "Yes. You can use Ferrum in a background job, or call ScreenshotAPI's REST endpoint with Net::HTTP or the Faraday gem. API-based approaches are better suited for web applications because they avoid running Chrome on your app server."
  - question: "Do I need Chrome installed to take screenshots with Ruby?"
    answer: "Ferrum and Selenium both require Chrome or Chromium. ScreenshotAPI runs browsers in the cloud, so you only need Ruby's built-in HTTP library."
relatedPages:
  - title: "How to Take Screenshots with Python"
    description: "Screenshot capture with Python, Playwright, and the API."
    href: "/blog/how-to-take-screenshots-with-python"
  - title: "Ruby SDK Documentation"
    description: "Full reference for the ScreenshotAPI Ruby client."
    href: "/docs/sdks/ruby"
  - title: "Rails Integration Guide"
    description: "Add screenshot capture to your Rails application."
    href: "/integrations/rails"
jsonLd:
  "@context": "https://schema.org"
  "@type": "Article"
  headline: "How to Take Screenshots with Ruby: Ferrum, Selenium, and API"
  description: "Take website screenshots in Ruby using Ferrum, Selenium WebDriver, or ScreenshotAPI. Complete code examples for Rails and standalone scripts."
  dateModified: "2026-03-25"
---

Capturing a website screenshot with Ruby is useful for generating thumbnails, monitoring page changes, and building link previews. This guide covers three approaches: Ferrum (modern headless Chrome), Selenium WebDriver (legacy), and ScreenshotAPI (cloud-based).

## The Hard Way: Selenium WebDriver

Selenium is the traditional approach. It works but requires both Chrome and ChromeDriver.

### Install

```bash
gem install selenium-webdriver
```

### Basic screenshot

```ruby
require "selenium-webdriver"

options = Selenium::WebDriver::Chrome::Options.new
options.add_argument("--headless=new")
options.add_argument("--window-size=1440,900")

driver = Selenium::WebDriver.for(:chrome, options: options)
driver.get("https://example.com")
driver.save_screenshot("screenshot.png")
driver.quit
```

### Problems with Selenium

- ChromeDriver version must match your Chrome version
- No built-in full-page screenshot support
- Heavy memory usage (200+ MB per browser)
- Flaky on CI/CD without careful configuration

## The Better Hard Way: Ferrum

Ferrum uses the Chrome DevTools Protocol directly, eliminating the need for ChromeDriver.

### Install

```bash
gem install ferrum
```

### Basic screenshot

```ruby
require "ferrum"

browser = Ferrum::Browser.new(
  window_size: [1440, 900],
  headless: true
)

browser.goto("https://example.com")
browser.screenshot(path: "screenshot.png")
browser.quit
```

### Full-page screenshot

```ruby
browser.goto("https://example.com")
browser.screenshot(path: "full_page.png", full: true)
```

### Wait for an element

```ruby
browser.goto("https://example.com")
browser.at_css("#main-content") # waits for the element
browser.screenshot(path: "screenshot.png")
```

### Set custom headers or cookies

```ruby
browser = Ferrum::Browser.new(headless: true)
browser.headers.set("Accept-Language" => "en-US")
browser.goto("https://example.com")
browser.screenshot(path: "screenshot.png")
```

### Ferrum limitations

- Requires Chrome/Chromium installed on the host
- Docker images need Chrome dependencies, adding hundreds of megabytes
- Memory-intensive for batch operations
- No built-in dark mode emulation

## The Easy Way: ScreenshotAPI

[ScreenshotAPI](/) lets you capture screenshots with a simple HTTP request. No Chrome, no gems, no binary management.

### Using Net::HTTP (standard library)

```ruby
require "net/http"
require "uri"

uri = URI("https://screenshotapi.to/api/v1/screenshot")
params = {
  url: "https://example.com",
  width: 1440,
  height: 900,
  type: "png"
}
uri.query = URI.encode_www_form(params)

request = Net::HTTP::Get.new(uri)
request["x-api-key"] = "sk_live_your_api_key"

response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
  http.request(request)
end

File.binwrite("screenshot.png", response.body)
```

### Full-page screenshot

```ruby
params = {
  url: "https://example.com",
  width: 1440,
  fullPage: true,
  type: "png"
}
```

### Dark mode

```ruby
params = {
  url: "https://example.com",
  width: 1440,
  height: 900,
  colorScheme: "dark",
  type: "png"
}
```

### Using Faraday

```ruby
require "faraday"

conn = Faraday.new(url: "https://screenshotapi.to") do |f|
  f.request :url_encoded
end

response = conn.get("/api/v1/screenshot") do |req|
  req.headers["x-api-key"] = "sk_live_your_api_key"
  req.params = {
    url: "https://example.com",
    width: 1440,
    height: 900,
    type: "png"
  }
end

File.binwrite("screenshot.png", response.body)
```

### Rails integration with Active Job

```ruby
class ScreenshotJob < ApplicationJob
  queue_as :default

  def perform(url:, filename:)
    uri = URI("https://screenshotapi.to/api/v1/screenshot")
    params = { url: url, width: 1440, height: 900, type: "png" }
    uri.query = URI.encode_www_form(params)

    request = Net::HTTP::Get.new(uri)
    request["x-api-key"] = Rails.application.credentials.screenshot_api_key

    response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
      http.request(request)
    end

    blob = ActiveStorage::Blob.create_and_upload!(
      io: StringIO.new(response.body),
      filename: filename,
      content_type: "image/png"
    )

    blob
  end
end
```

## Comparison Table

| Feature | Selenium | Ferrum | ScreenshotAPI |
|---|---|---|---|
| Chrome required | Yes + ChromeDriver | Yes | No |
| Full-page support | Manual workaround | Native | Native |
| Dark mode | Not supported | Manual | Query parameter |
| Memory per capture | ~250 MB | ~200 MB | 0 (HTTP call) |
| Rails-friendly | Needs Chrome on server | Needs Chrome on server | Works everywhere |
| Heroku/serverless | Difficult | Difficult | Simple |

## When to Use Each

**Choose Selenium** only if you have an existing Selenium test suite and need screenshots as a side effect.

**Choose Ferrum** if you need full browser control and are comfortable installing Chrome on your servers.

**Choose [ScreenshotAPI](/)** for production [Rails applications](/integrations/rails) where you need reliable screenshots without managing browser infrastructure. Check the [pricing page](/pricing) for credit-based plans. Learn more about building [link previews](/blog/how-to-build-link-previews) or [website thumbnails](/blog/how-to-add-website-thumbnails-to-your-app).
