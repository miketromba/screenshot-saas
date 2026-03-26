---
title: "Screenshot API for Sinatra"
description: "Add website screenshot capture to Ruby Sinatra apps with ScreenshotAPI. Lightweight routes, background jobs, and production patterns."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Integrations
    href: /integrations
  - label: Sinatra
faq:
  - question: "Do I need Selenium or Ferrum for screenshots in Sinatra?"
    answer: "No. ScreenshotAPI handles browser rendering remotely. Your Sinatra app makes an HTTP GET request and receives image bytes. No headless Chrome installation needed."
  - question: "Can I use ScreenshotAPI with Sinatra's modular style?"
    answer: "Yes. Register your screenshot routes as a Sinatra module and mount it in your main application class. This keeps screenshot logic organized and reusable."
  - question: "How do I run screenshot captures in the background with Sinatra?"
    answer: "Use Sidekiq or another background job processor. Queue a job that calls ScreenshotAPI and stores the result. This prevents long-running requests from blocking your web process."
  - question: "What is the difference between using Sinatra and Rails for screenshots?"
    answer: "The ScreenshotAPI integration is nearly identical. Sinatra is lighter and faster to set up for simple API services, while Rails offers more built-in tooling for larger applications."
relatedPages:
  - title: "Rails Integration"
    description: "Full-featured Rails screenshot integration"
    href: "/integrations/rails"
  - title: "Flask Integration"
    description: "Lightweight Python screenshot API"
    href: "/integrations/flask"
  - title: "Express Integration"
    description: "Node.js screenshot proxy with Express"
    href: "/integrations/express"
  - title: "Ruby SDK"
    description: "Full reference for the ScreenshotAPI Ruby SDK"
    href: "/docs/sdks/ruby"
jsonLd:
  "@context": "https://schema.org"
  "@type": "TechArticle"
  headline: "Screenshot API for Sinatra"
  description: "Add website screenshot capture to Ruby Sinatra apps with ScreenshotAPI. Lightweight routes, background jobs, and production patterns."
  dateModified: "2026-03-25"
---

## Capture Website Screenshots in Sinatra with ScreenshotAPI

Sinatra is the go-to Ruby framework when you need a lightweight API without Rails overhead. Adding screenshot functionality to Ruby apps normally means installing Ferrum or Selenium, which brings Chromium binaries, version conflicts, and deployment complications on platforms like Heroku where browser dependencies require custom buildpacks.

ScreenshotAPI gives your **Sinatra screenshot API** integration a simpler path. One HTTP request returns a pixel-perfect PNG, JPEG, or WebP. No headless browser, no system dependencies, and it deploys anywhere Ruby runs.

## Quick Start

1. [Create a free ScreenshotAPI account](https://screenshotapi.to) and copy your API key. **5 free credits** are included.
2. Add the necessary gems.
3. Create a Sinatra route that proxies screenshot requests.

## Installation

```bash
gem install sinatra faraday
```

Or add to your `Gemfile`:

```ruby
gem 'sinatra'
gem 'faraday'
gem 'puma'
```

Set the API key as an environment variable:

```bash
export SCREENSHOTAPI_KEY=sk_live_xxxxx
```

## Basic Example

A minimal Sinatra app that returns screenshots:

```ruby
# app.rb
require 'sinatra'
require 'faraday'
require 'json'

API_BASE = 'https://screenshotapi.to/api/v1/screenshot'
API_KEY = ENV.fetch('SCREENSHOTAPI_KEY')

get '/screenshot' do
  url = params['url']
  halt 400, { error: 'url parameter is required' }.to_json unless url

  conn = Faraday.new(url: API_BASE) do |f|
    f.request :url_encoded
  end

  response = conn.get do |req|
    req.params = {
      'url' => url,
      'width' => params.fetch('width', '1440'),
      'height' => params.fetch('height', '900'),
      'type' => params.fetch('type', 'png')
    }
    req.params['quality'] = params['quality'] if params['quality']
    req.params['fullPage'] = 'true' if params['fullPage'] == 'true'
    req.params['colorScheme'] = params['colorScheme'] if params['colorScheme']
    req.headers['x-api-key'] = API_KEY
    req.options.timeout = 30
  end

  halt 502, { error: 'Screenshot capture failed' }.to_json unless response.success?

  image_type = params.fetch('type', 'png')
  content_type "image/#{image_type}"
  cache_control :public, max_age: 3600
  response.body
end
```

Test with cURL:

```bash
curl "http://localhost:4567/screenshot?url=https://example.com" --output screenshot.png
```

## Screenshot Client Class

Extract reusable logic into a client class:

```ruby
# lib/screenshot_client.rb
require 'faraday'

class ScreenshotClient
  API_BASE = 'https://screenshotapi.to/api/v1/screenshot'

  def initialize(api_key: ENV.fetch('SCREENSHOTAPI_KEY'))
    @conn = Faraday.new(url: API_BASE) do |f|
      f.request :url_encoded
      f.options.timeout = 30
      f.headers['x-api-key'] = api_key
    end
  end

  def capture(url:, width: 1440, height: 900, type: 'png', quality: nil,
              full_page: false, color_scheme: nil, wait_until: 'networkidle',
              retries: 2)
    params = {
      'url' => url,
      'width' => width.to_s,
      'height' => height.to_s,
      'type' => type,
      'waitUntil' => wait_until
    }
    params['quality'] = quality.to_s if quality
    params['fullPage'] = 'true' if full_page
    params['colorScheme'] = color_scheme if color_scheme

    last_error = nil
    (retries + 1).times do |attempt|
      response = @conn.get { |req| req.params = params }
      return response.body if response.success?

      last_error = "API returned #{response.status}"
      sleep(attempt + 1) if attempt < retries
    end

    raise "Screenshot failed after #{retries + 1} attempts: #{last_error}"
  end
end
```

## Modular Sinatra Application

Organize screenshot routes as a reusable module:

```ruby
# routes/screenshots.rb
require 'sinatra/base'
require_relative '../lib/screenshot_client'

class ScreenshotRoutes < Sinatra::Base
  set :screenshot_client, ScreenshotClient.new

  helpers do
    def screenshot_client
      settings.screenshot_client
    end

    def valid_url?(url)
      uri = URI.parse(url)
      %w[http https].include?(uri.scheme) && !uri.host.nil?
    rescue URI::InvalidURIError
      false
    end
  end

  get '/api/screenshot' do
    url = params['url']
    halt 400, json(error: 'url parameter is required') unless url
    halt 400, json(error: 'invalid URL') unless valid_url?(url)

    begin
      image = screenshot_client.capture(
        url: url,
        width: params.fetch('width', 1440).to_i,
        height: params.fetch('height', 900).to_i,
        type: params.fetch('type', 'webp'),
        quality: params['quality']&.to_i
      )
    rescue => e
      halt 502, json(error: e.message)
    end

    content_type "image/#{params.fetch('type', 'webp')}"
    cache_control :public, max_age: 3600
    image
  end

  get '/api/screenshot/download' do
    url = params['url']
    halt 400, json(error: 'url parameter is required') unless url

    begin
      image = screenshot_client.capture(url: url, type: 'png')
    rescue => e
      halt 502, json(error: e.message)
    end

    attachment 'screenshot.png'
    content_type 'image/png'
    image
  end

  private

  def json(data)
    content_type :json
    data.to_json
  end
end
```

Mount it in your main app:

```ruby
# config.ru
require_relative 'routes/screenshots'

run ScreenshotRoutes
```

## Background Jobs with Sidekiq

For long-running or batch screenshot operations, process captures in the background:

```ruby
# jobs/screenshot_job.rb
require 'sidekiq'
require_relative '../lib/screenshot_client'

class ScreenshotJob
  include Sidekiq::Job

  def perform(url, options = {})
    client = ScreenshotClient.new
    image = client.capture(
      url: url,
      type: options.fetch('type', 'webp'),
      quality: options.fetch('quality', 80),
      width: options.fetch('width', 1440),
      height: options.fetch('height', 900)
    )

    filename = "screenshots/#{Digest::SHA256.hexdigest(url)}.#{options.fetch('type', 'webp')}"
    File.binwrite(filename, image)
  end
end
```

Enqueue from a route:

```ruby
post '/api/screenshot/async' do
  url = params['url']
  halt 400, json(error: 'url parameter is required') unless url

  ScreenshotJob.perform_async(url, {
    'type' => params.fetch('type', 'webp'),
    'quality' => params.fetch('quality', '80')
  })

  status 202
  json(status: 'queued')
end
```

## Dark Mode Screenshots

Capture both color scheme variants for comparison:

```ruby
light = screenshot_client.capture(url: 'https://example.com', color_scheme: 'light')
dark = screenshot_client.capture(url: 'https://example.com', color_scheme: 'dark')
```

This is useful for [visual regression testing](/use-cases/visual-regression-testing) across both themes.

## Production Tips

### Rate Limiting

Use the `rack-attack` gem to limit requests per IP:

```ruby
# config.ru
require 'rack/attack'

Rack::Attack.throttle('screenshot', limit: 20, period: 60) do |req|
  req.ip if req.path == '/api/screenshot'
end

use Rack::Attack
```

### Caching

For repeat captures, cache responses with Rack middleware or store images in S3. Visit the [pricing page](/pricing) to select the right credit tier for your volume.

### Deployment

ScreenshotAPI works on every Ruby hosting platform. No Chromium, no buildpacks, no special container layers. Heroku, Render, Fly.io, and bare VPS deployments all work with the same HTTP client code.

## Further Reading

- For a more full-featured Ruby framework, see the [Rails integration](/integrations/rails).
- The [Flask integration](/integrations/flask) provides a Python comparison with a similarly lightweight framework.
- The [API documentation](/docs) has the full parameter reference for all endpoints.
