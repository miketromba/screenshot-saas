import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock } from '@/components/seo'

export const metadata: Metadata = {
	title: 'How to Take Screenshots with Ruby (2025)',
	description:
		'Capture website screenshots in Ruby using Net::HTTP and ScreenshotAPI. Replace Selenium and Ferrum with a simple API call.'
}

export default function Page() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Blog', href: '/blog' },
				{ label: 'Take Screenshots with Ruby' }
			]}
			title="How to Take Screenshots with Ruby"
			description="Capture website screenshots in Ruby without Selenium or Ferrum. Use Net::HTTP with ScreenshotAPI for simple, reliable screenshot generation."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'Article',
				headline: 'How to Take Screenshots with Ruby',
				dateModified: '2026-03-25',
				publisher: {
					'@type': 'Organization',
					name: 'ScreenshotAPI',
					url: 'https://screenshotapi.to'
				}
			}}
			faq={[
				{
					question:
						'Can I take screenshots in Ruby without Selenium?',
					answer: "Yes. ScreenshotAPI handles browser rendering on its servers. You only need Ruby's built-in Net::HTTP library to make the API request — no Selenium, Ferrum, or Watir required."
				},
				{
					question: 'Does this work in a Rails application?',
					answer: 'Absolutely. You can call ScreenshotAPI from a Rails controller, background job (Sidekiq/GoodJob), or rake task using Net::HTTP or any HTTP client gem like Faraday or HTTParty.'
				},
				{
					question: 'What Ruby versions are supported?',
					answer: 'Any Ruby version that supports Net::HTTP works (Ruby 2.0+). The examples use standard library features available in all modern Ruby versions.'
				},
				{
					question: 'How do I handle rate limiting?',
					answer: 'ScreenshotAPI returns a 429 status code when rate limited. Implement exponential backoff in your retry logic or use a background job queue to throttle requests.'
				}
			]}
			relatedPages={[
				{
					title: 'Take Screenshots with Python',
					description: 'Screenshot capture with Python and requests.',
					href: '/blog/how-to-take-screenshots-with-python'
				},
				{
					title: 'Take Screenshots with PHP',
					description: 'Screenshot capture with PHP and cURL.',
					href: '/blog/how-to-take-screenshots-with-php'
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
					Why capture screenshots in Ruby?
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Ruby and Rails power many web applications that need
					screenshot capabilities — generating link previews, creating
					PDF reports with visual snapshots, archiving user-submitted
					URLs, and building internal monitoring tools. The
					traditional approach with Selenium or Ferrum requires
					managing browser drivers and Chromium binaries, which adds
					significant complexity to your deployment pipeline.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					The manual way: Ferrum
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Ferrum is a popular Ruby gem for headless Chrome automation:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="ruby"
						title="screenshot_ferrum.rb"
						code={`require 'ferrum'

def capture_screenshot(url, output_path = 'screenshot.png')
  browser = Ferrum::Browser.new(
    headless: true,
    window_size: [1440, 900],
    timeout: 30,
    process_timeout: 10
  )

  begin
    browser.goto(url)
    browser.network.wait_for_idle
    browser.screenshot(path: output_path, full: true)
    puts "Screenshot saved to #{output_path}"
  rescue Ferrum::TimeoutError => e
    puts "Timeout: #{e.message}"
  rescue Ferrum::StatusError => e
    puts "Navigation error: #{e.message}"
  ensure
    browser.quit
  end
end

capture_screenshot('https://example.com')`}
					/>
				</div>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					This requires Chrome/Chromium installed on the system, the
					ferrum gem and its dependencies, and careful error handling
					for browser crashes. In production, you also need to manage
					browser process pools and handle zombie processes.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					The easy way: Net::HTTP with ScreenshotAPI
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Use Ruby&apos;s standard library to call ScreenshotAPI:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="ruby"
						title="screenshot_api.rb"
						code={`require 'net/http'
require 'uri'

def capture_screenshot(url, output_path = 'screenshot.png')
  uri = URI('https://screenshotapi.to/api/v1/screenshot')
  uri.query = URI.encode_www_form(
    url: url,
    width: 1440,
    height: 900,
    type: 'png'
  )

  request = Net::HTTP::Get.new(uri)
  request['x-api-key'] = 'sk_live_your_api_key'

  response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
    http.request(request)
  end

  File.binwrite(output_path, response.body)
  puts "Screenshot saved to #{output_path} (#{response.body.bytesize} bytes)"
end

capture_screenshot('https://example.com')`}
					/>
				</div>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					No gems to install, no Chrome dependency, no browser
					processes. Just Ruby&apos;s standard library.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Using it in a Rails background job
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					For production Rails apps, run screenshots in a background
					job to avoid blocking web requests:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="ruby"
						title="app/jobs/screenshot_job.rb"
						code={`class ScreenshotJob < ApplicationJob
  queue_as :default
  retry_on Net::OpenTimeout, wait: 5.seconds, attempts: 3

  def perform(url:, record_id:)
    uri = URI('https://screenshotapi.to/api/v1/screenshot')
    uri.query = URI.encode_www_form(
      url: url, width: 1440, height: 900, type: 'png'
    )

    request = Net::HTTP::Get.new(uri)
    request['x-api-key'] = Rails.application.credentials.screenshot_api_key

    response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
      http.read_timeout = 30
      http.request(request)
    end

    raise "API error: #{response.code}" unless response.is_a?(Net::HTTPSuccess)

    record = Bookmark.find(record_id)
    record.thumbnail.attach(
      io: StringIO.new(response.body),
      filename: "screenshot_#{record_id}.png",
      content_type: 'image/png'
    )
  end
end`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Advanced parameters
				</h2>
				<div className="mt-6">
					<CodeBlock
						language="ruby"
						title="Advanced options"
						code={`# Full-page dark mode screenshot
uri.query = URI.encode_www_form(
  url: 'https://example.com',
  width: 1440,
  height: 900,
  type: 'webp',
  quality: 85,
  fullPage: true,
  colorScheme: 'dark',
  waitUntil: 'networkidle'
)

# Mobile viewport
uri.query = URI.encode_www_form(
  url: 'https://example.com',
  width: 375,
  height: 812,
  type: 'png'
)

# Wait for dynamic content
uri.query = URI.encode_www_form(
  url: 'https://app.example.com',
  waitForSelector: '.dashboard-loaded',
  delay: 2000,
  type: 'png'
)`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Ferrum vs ScreenshotAPI
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Use Ferrum or Selenium when you need full browser automation
					— filling forms, executing JavaScript, navigating multi-step
					flows. Use ScreenshotAPI when you just need screenshots: it
					eliminates Chrome management, works in any Ruby environment,
					and scales effortlessly because the rendering happens on
					remote servers.
				</p>
			</section>
		</ArticleLayout>
	)
}
