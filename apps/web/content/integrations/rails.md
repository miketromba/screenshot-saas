---
title: "Ruby on Rails Screenshot API Integration"
description: "Capture website screenshots in Rails with ScreenshotAPI. Replace wkhtmltopdf and Grover with a single HTTP call. Production-ready Ruby examples."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Integrations
    href: /integrations
  - label: Rails
faq:
  - question: "Can ScreenshotAPI replace wkhtmltopdf in my Rails app?"
    answer: "Yes. ScreenshotAPI renders pages with a real Chromium browser, so you get full CSS3, JavaScript, and web font support. No system binary installation is needed."
  - question: "Does it work with Active Storage?"
    answer: "Absolutely. Download the screenshot bytes from the API and attach them to a record using Active Storage's attach method. Works with local disk, S3, GCS, and Azure."
  - question: "How do I capture screenshots in a background job?"
    answer: "Use Sidekiq or Active Job to enqueue a screenshot task. The job calls ScreenshotAPI, saves the image to Active Storage, and updates the record."
  - question: "What about self-hosted Chromium with Grover?"
    answer: "Grover wraps Puppeteer and requires Node.js installed alongside Ruby. ScreenshotAPI has no runtime dependencies, reducing your Docker image size by 200 MB or more."
relatedPages:
  - title: "Laravel Integration"
    description: "PHP screenshot integration for Laravel applications"
    href: "/integrations/laravel"
  - title: "Express Integration"
    description: "Node.js screenshot proxy with Express"
    href: "/integrations/express"
  - title: "Ruby SDK"
    description: "Full reference for the ScreenshotAPI Ruby SDK"
    href: "/docs/sdks/ruby"
  - title: "Visual Regression Testing"
    description: "Catch UI bugs with automated screenshots"
    href: "/use-cases/visual-regression-testing"
jsonLd:
  "@context": "https://schema.org"
  "@type": "TechArticle"
  headline: "Ruby on Rails Screenshot API Integration"
  description: "Capture website screenshots in Rails with ScreenshotAPI. Replace wkhtmltopdf and Grover with a single HTTP call."
  dateModified: "2026-03-25"
---

## Capture Website Screenshots in Rails with ScreenshotAPI

Ruby on Rails developers have historically relied on wkhtmltopdf, WickedPDF, or Grover to generate screenshots and PDFs. These tools come with serious trade-offs: wkhtmltopdf is no longer actively maintained, Grover requires a Node.js runtime alongside Ruby, and all of them add 100-200 MB of browser binaries to your Docker images. ARM-based servers (like Apple Silicon or AWS Graviton) add another layer of compatibility headaches.

A **Rails screenshot API** integration with ScreenshotAPI replaces all of that with a single HTTP request. Your Rails controller calls the API, receives image bytes, and returns or stores them. No system dependencies, no Node.js, no binary management.

## Quick Start

1. [Sign up for ScreenshotAPI](https://screenshotapi.to) and copy your API key. You get **5 free credits** on signup.
2. Add the `httparty` gem or use `Net::HTTP` from the standard library.
3. Create a service object and controller action.

## Installation

Add HTTParty to your Gemfile (or use the built-in Net::HTTP if you prefer zero dependencies):

```ruby
# Gemfile
gem 'httparty'
```

```bash
bundle install
```

Store your API key in Rails credentials:

```bash
rails credentials:edit
```

```yaml
screenshotapi:
  api_key: sk_live_xxxxx
```

## Basic Example

A controller action that captures a screenshot and returns it to the browser:

```ruby
# app/controllers/screenshots_controller.rb
class ScreenshotsController < ApplicationController
  API_BASE = 'https://screenshotapi.to/api/v1/screenshot'

  def show
    url = params[:url]
    return render json: { error: 'url is required' }, status: :bad_request if url.blank?

    response = HTTParty.get(
      API_BASE,
      query: {
        url: url,
        width: params.fetch(:width, 1440),
        height: params.fetch(:height, 900),
        type: params.fetch(:type, 'png')
      },
      headers: { 'x-api-key' => Rails.application.credentials.dig(:screenshotapi, :api_key) },
      timeout: 30
    )

    if response.success?
      send_data response.body,
                type: "image/#{params.fetch(:type, 'png')}",
                disposition: 'inline'
    else
      render json: { error: 'Screenshot capture failed' }, status: :bad_gateway
    end
  end
end
```

Add the route:

```ruby
# config/routes.rb
Rails.application.routes.draw do
  get 'screenshots', to: 'screenshots#show'
end
```

## Rails Screenshot Service Object

Extract screenshot logic into a service object for reuse across controllers, jobs, and rake tasks:

```ruby
# app/services/screenshot_service.rb
class ScreenshotService
  API_BASE = 'https://screenshotapi.to/api/v1/screenshot'
  MAX_RETRIES = 2

  class CaptureError < StandardError; end

  def initialize(api_key: Rails.application.credentials.dig(:screenshotapi, :api_key))
    @api_key = api_key
  end

  def capture(url:, width: 1440, height: 900, type: 'png', quality: nil,
              full_page: false, color_scheme: nil, wait_until: 'networkidle')
    params = {
      url: url,
      width: width,
      height: height,
      type: type,
      waitUntil: wait_until
    }

    params[:quality] = quality if quality
    params[:fullPage] = true if full_page
    params[:colorScheme] = color_scheme if color_scheme

    attempt = 0
    begin
      response = HTTParty.get(
        API_BASE,
        query: params,
        headers: { 'x-api-key' => @api_key },
        timeout: 30
      )

      raise CaptureError, "API returned #{response.code}" unless response.success?

      response.body
    rescue StandardError => e
      attempt += 1
      if attempt <= MAX_RETRIES
        sleep(attempt)
        retry
      end
      raise CaptureError, "Failed after #{MAX_RETRIES + 1} attempts: #{e.message}"
    end
  end
end
```

Usage anywhere in your app:

```ruby
service = ScreenshotService.new
image = service.capture(url: 'https://example.com', type: 'webp', quality: 80)
```

## Active Storage Integration

Save screenshots directly to Active Storage:

```ruby
# app/models/site.rb
class Site < ApplicationRecord
  has_one_attached :screenshot

  def capture_screenshot!
    service = ScreenshotService.new
    image = service.capture(url: self.url, type: 'webp', quality: 80)

    screenshot.attach(
      io: StringIO.new(image),
      filename: "#{slug}-screenshot.webp",
      content_type: 'image/webp'
    )
  end
end
```

```ruby
site = Site.find_by(slug: 'example')
site.capture_screenshot!
# => site.screenshot.url now returns the stored image URL
```

## Background Jobs with Sidekiq

For bulk operations or slow pages, offload screenshots to a background job:

```ruby
# app/jobs/capture_screenshot_job.rb
class CaptureScreenshotJob < ApplicationJob
  queue_as :default
  retry_on ScreenshotService::CaptureError, wait: :polynomially_longer, attempts: 3

  def perform(site_id)
    site = Site.find(site_id)
    site.capture_screenshot!
    Rails.logger.info "Screenshot captured for #{site.url}"
  end
end
```

Enqueue from a controller:

```ruby
def create
  site = Site.create!(site_params)
  CaptureScreenshotJob.perform_later(site.id)
  render json: site, status: :created
end
```

## API Controller with Pagination

Build a full screenshots API endpoint:

```ruby
# app/controllers/api/v1/screenshots_controller.rb
module Api
  module V1
    class ScreenshotsController < ApplicationController
      def index
        sites = Site.where.not(screenshot_blob: nil)
                    .page(params[:page])
                    .per(20)

        render json: sites.map { |s|
          {
            id: s.id,
            url: s.url,
            screenshot_url: url_for(s.screenshot),
            captured_at: s.screenshot.created_at
          }
        }
      end

      def create
        url = params.require(:url)

        service = ScreenshotService.new
        image = service.capture(
          url: url,
          width: params.fetch(:width, 1440).to_i,
          height: params.fetch(:height, 900).to_i,
          type: params.fetch(:type, 'webp')
        )

        send_data image,
                  type: "image/#{params.fetch(:type, 'webp')}",
                  disposition: 'inline'
      rescue ScreenshotService::CaptureError => e
        render json: { error: e.message }, status: :bad_gateway
      end
    end
  end
end
```

## Production Tips

### Caching with Rails Cache

Cache screenshots to reduce API calls:

```ruby
def cached_capture(url:, **options)
  cache_key = "screenshot:#{Digest::SHA256.hexdigest(url)}:#{options.sort.to_s}"

  Rails.cache.fetch(cache_key, expires_in: 1.hour) do
    ScreenshotService.new.capture(url: url, **options)
  end
end
```

### Input Validation

Validate URLs before sending them to the API:

```ruby
require 'uri'

def valid_screenshot_url?(url)
  uri = URI.parse(url)
  uri.is_a?(URI::HTTP) || uri.is_a?(URI::HTTPS)
rescue URI::InvalidURIError
  false
end
```

### Health Check

Add a health check to monitor API connectivity:

```ruby
# config/initializers/health_check.rb
Rails.application.config.after_initialize do
  ScreenshotService.new # validates credentials are present
end
```

### Docker Image Savings

Switching from wkhtmltopdf or Grover to ScreenshotAPI typically removes 100-200 MB from your production Docker image. No Chromium, no Node.js, no Puppeteer. Visit the [pricing page](/pricing) to choose the right credit package for your app's volume.

## Further Reading

- The [Ruby SDK documentation](/docs/sdks/ruby) has the complete parameter reference for the ScreenshotAPI Ruby client.
- See the [Laravel integration](/integrations/laravel) for a similar pattern in PHP.
- Learn about [visual regression testing](/use-cases/visual-regression-testing) to catch UI bugs before they reach production.
