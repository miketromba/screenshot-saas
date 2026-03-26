import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock } from '@/components/seo'

export const metadata: Metadata = {
	title: 'Ruby on Rails Screenshot API Integration — Controllers, Active Job & Storage',
	description:
		'Capture website screenshots in Ruby on Rails with controller actions, Active Job background processing, and ActiveRecord storage. Production-ready Ruby examples.'
}

export default function RailsIntegrationPage() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Integrations', href: '/integrations' },
				{ label: 'Ruby on Rails' }
			]}
			title="Ruby on Rails Screenshot API Integration"
			description="Add website screenshot capture to your Rails application with controller actions, asynchronous processing via Active Job, and model-based storage."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'TechArticle',
				headline: 'Ruby on Rails Screenshot API Integration',
				description:
					'How to capture website screenshots in Rails with controllers and Active Job.',
				dateModified: '2026-03-25',
				publisher: {
					'@type': 'Organization',
					name: 'ScreenshotAPI',
					url: 'https://screenshotapi.to'
				}
			}}
			faq={[
				{
					question: 'Which HTTP library should I use with Rails?',
					answer: "Net::HTTP is included in Ruby's standard library and requires no extra gems. For a friendlier API, consider the httparty or faraday gems."
				},
				{
					question: 'How do I process screenshots in the background?',
					answer: 'Use Active Job with Sidekiq or Good Job as the backend. Create a job class that calls the API, saves the result, and updates the screenshot record status.'
				},
				{
					question: 'Can I store screenshots with Active Storage?',
					answer: 'Yes. Attach the screenshot bytes as an Active Storage blob on your model. This gives you variants, CDN URLs, and cloud storage backends (S3, GCS, Azure) for free.'
				},
				{
					question: 'How do I handle API errors in Rails?',
					answer: 'Wrap the HTTP call in a begin/rescue block. Rescue Net::HTTPError and Timeout::Error, log the error, and update the screenshot record with a failed status.'
				},
				{
					question:
						'Does ScreenshotAPI work with Rails API-only mode?',
					answer: 'Yes. The screenshot endpoint returns binary image data that works perfectly with Rails API-only applications. Return the image bytes with send_data or a JSON response with the image URL.'
				}
			]}
			relatedPages={[
				{
					title: 'Django Integration',
					description:
						'Python equivalent with views, Celery tasks, and model storage.',
					href: '/integrations/django'
				},
				{
					title: 'Laravel Integration',
					description:
						'PHP framework integration with queued jobs and caching.',
					href: '/integrations/laravel'
				},
				{
					title: 'Express Integration',
					description:
						'Node.js screenshot service with Express and Redis caching.',
					href: '/integrations/express'
				}
			]}
		>
			{/* Quick Start */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Quick start
				</h2>
				<p className="mt-3 text-muted-foreground">
					Ruby&#39;s standard library includes everything you need.
					Add your API key to Rails credentials and start capturing
					screenshots.
				</p>
				<div className="mt-6 space-y-4">
					<CodeBlock
						language="bash"
						title="Terminal"
						code={`# Add to Rails credentials
EDITOR="code --wait" bin/rails credentials:edit

# Add this to the credentials file:
# screenshotapi:
#   key: sk_live_xxxxx`}
					/>
					<CodeBlock
						language="ruby"
						title="config/routes.rb"
						code={`Rails.application.routes.draw do
  resources :screenshots, only: [:create, :show]
end`}
					/>
				</div>
			</section>

			{/* Controller */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Controller action
				</h2>
				<p className="mt-3 text-muted-foreground">
					A controller that captures a screenshot synchronously and
					returns the image data. Uses Ruby&#39;s built-in Net::HTTP
					for zero extra dependencies.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="ruby"
						title="app/controllers/screenshots_controller.rb"
						code={`require "net/http"

class ScreenshotsController < ApplicationController
  API_BASE = URI("https://screenshotapi.to/api/v1/screenshot")

  def create
    url = params.require(:url)

    uri = API_BASE.dup
    uri.query = URI.encode_www_form(
      url: url,
      width: params.fetch(:width, 1440),
      height: params.fetch(:height, 900),
      type: params.fetch(:type, "png"),
      fullPage: params.fetch(:full_page, false)
    )

    request = Net::HTTP::Get.new(uri)
    request["x-api-key"] = Rails.application.credentials.dig(:screenshotapi, :key)

    response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
      http.read_timeout = 30
      http.request(request)
    end

    if response.is_a?(Net::HTTPSuccess)
      send_data response.body,
                type: response["content-type"] || "image/png",
                disposition: "inline"
    else
      render json: { error: "Screenshot capture failed" },
             status: :bad_gateway
    end
  end
end`}
					/>
				</div>
			</section>

			{/* Model */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Screenshot model
				</h2>
				<p className="mt-3 text-muted-foreground">
					A model for tracking screenshot requests and storing results
					with Active Storage.
				</p>
				<div className="mt-6 space-y-4">
					<CodeBlock
						language="bash"
						title="Terminal"
						code={`bin/rails generate model Screenshot url:string status:string \\
  width:integer height:integer file_type:string \\
  error_message:text captured_at:datetime
bin/rails db:migrate`}
					/>
					<CodeBlock
						language="ruby"
						title="app/models/screenshot.rb"
						code={`class Screenshot < ApplicationRecord
  has_one_attached :image

  enum :status, {
    pending: "pending",
    processing: "processing",
    completed: "completed",
    failed: "failed"
  }, default: :pending

  validates :url, presence: true, format: { with: URI::DEFAULT_PARSER.make_regexp }
  validates :width, numericality: { greater_than: 0, less_than_or_equal_to: 3840 }
  validates :height, numericality: { greater_than: 0, less_than_or_equal_to: 2160 }

  scope :recent, -> { where(created_at: 1.hour.ago..) }

  def self.find_cached(url, width: 1440, height: 900)
    recent.find_by(url: url, width: width, height: height, status: :completed)
  end
end`}
					/>
				</div>
			</section>

			{/* Active Job */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Active Job for async capture
				</h2>
				<p className="mt-3 text-muted-foreground">
					Process screenshots in the background with Active Job. The
					controller creates the record and enqueues the job,
					returning a polling endpoint immediately.
				</p>
				<div className="mt-6 space-y-4">
					<CodeBlock
						language="ruby"
						title="app/jobs/capture_screenshot_job.rb"
						code={`require "net/http"

class CaptureScreenshotJob < ApplicationJob
  queue_as :default
  retry_on Net::OpenTimeout, wait: 10.seconds, attempts: 3

  API_BASE = URI("https://screenshotapi.to/api/v1/screenshot")

  def perform(screenshot_id)
    screenshot = Screenshot.find(screenshot_id)
    screenshot.update!(status: :processing)

    uri = API_BASE.dup
    uri.query = URI.encode_www_form(
      url: screenshot.url,
      width: screenshot.width,
      height: screenshot.height,
      type: screenshot.file_type || "png",
      quality: 85,
      waitUntil: "networkidle"
    )

    request = Net::HTTP::Get.new(uri)
    request["x-api-key"] = Rails.application.credentials.dig(:screenshotapi, :key)

    response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
      http.read_timeout = 30
      http.request(request)
    end

    if response.is_a?(Net::HTTPSuccess)
      ext = screenshot.file_type || "png"
      screenshot.image.attach(
        io: StringIO.new(response.body),
        filename: "screenshot-#{screenshot.id}.#{ext}",
        content_type: response["content-type"]
      )
      screenshot.update!(status: :completed, captured_at: Time.current)
    else
      screenshot.update!(status: :failed, error_message: "HTTP #{response.code}")
    end
  rescue StandardError => e
    screenshot&.update(status: :failed, error_message: e.message)
    raise
  end
end`}
					/>
					<CodeBlock
						language="ruby"
						title="app/controllers/screenshots_controller.rb (async)"
						code={`class ScreenshotsController < ApplicationController
  def create
    cached = Screenshot.find_cached(params[:url])
    if cached
      redirect_to url_for(cached.image), allow_other_host: true
      return
    end

    screenshot = Screenshot.create!(
      url: params.require(:url),
      width: params.fetch(:width, 1440).to_i,
      height: params.fetch(:height, 900).to_i,
      file_type: params.fetch(:type, "png")
    )

    CaptureScreenshotJob.perform_later(screenshot.id)

    render json: {
      id: screenshot.id,
      status: screenshot.status,
      poll_url: screenshot_path(screenshot)
    }, status: :accepted
  end

  def show
    screenshot = Screenshot.find(params[:id])

    if screenshot.completed? && screenshot.image.attached?
      redirect_to url_for(screenshot.image), allow_other_host: true
    else
      render json: {
        id: screenshot.id,
        status: screenshot.status,
        error: screenshot.error_message
      }
    end
  end
end`}
					/>
				</div>
			</section>

			{/* Production Tips */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Production tips
				</h2>
				<ul className="mt-4 space-y-3 text-muted-foreground">
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Use Sidekiq for Active Job.
							</strong>{' '}
							Sidekiq processes jobs in threads, making it much
							faster than the default async adapter for I/O-bound
							tasks like API calls.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Configure Active Storage for S3.
							</strong>{' '}
							Store screenshots in S3 or another cloud provider.
							Local disk storage won&#39;t survive deploys on
							platforms like Heroku or Render.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Add rate limiting.
							</strong>{' '}
							Use the <code>rack-attack</code> gem to limit
							screenshot requests per IP or user to prevent credit
							abuse.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Purge old screenshots.
							</strong>{' '}
							Schedule a daily Active Job task that deletes
							screenshots older than 30 days and purges their
							Active Storage blobs.
						</span>
					</li>
				</ul>
			</section>
		</ArticleLayout>
	)
}
