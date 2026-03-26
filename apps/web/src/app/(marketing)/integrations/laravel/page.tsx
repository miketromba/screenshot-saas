import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock } from '@/components/seo'

export const metadata: Metadata = {
	title: 'Laravel Screenshot API Integration — Controllers, Queued Jobs & Cache',
	description:
		'Capture website screenshots in Laravel with controllers, queued jobs for background processing, and Laravel Cache for fast repeat requests. PHP code examples.'
}

export default function LaravelIntegrationPage() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Integrations', href: '/integrations' },
				{ label: 'Laravel' }
			]}
			title="Laravel Screenshot API Integration"
			description="Capture website screenshots in your Laravel application with Guzzle HTTP, queued background jobs, and Laravel Cache for efficient repeat requests."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'TechArticle',
				headline: 'Laravel Screenshot API Integration',
				description:
					'How to capture website screenshots in Laravel with controllers and queued jobs.',
				dateModified: '2026-03-25',
				publisher: {
					'@type': 'Organization',
					name: 'ScreenshotAPI',
					url: 'https://screenshotapi.to'
				}
			}}
			faq={[
				{
					question: 'Does Laravel include an HTTP client?',
					answer: 'Yes. Laravel ships with an HTTP client built on Guzzle. Use Http::get() for a clean, fluent API. No extra packages needed.'
				},
				{
					question: 'How do I process screenshots in the background?',
					answer: 'Create a queued job with php artisan make:job CaptureScreenshot. Dispatch it from your controller. Configure a queue driver like Redis or database for production.'
				},
				{
					question: 'How long should I cache screenshots?',
					answer: 'Cache for 1–24 hours depending on how often the target sites change. Use Cache::remember() with a key based on the URL and screenshot parameters.'
				},
				{
					question: 'Can I use ScreenshotAPI with Laravel Livewire?',
					answer: 'Yes. Call the API from a Livewire component action or dispatch a queued job. Use wire:poll to check the status until the screenshot is ready.'
				}
			]}
			relatedPages={[
				{
					title: 'Rails Integration',
					description:
						'Ruby on Rails controllers, Active Job, and Active Storage.',
					href: '/integrations/rails'
				},
				{
					title: 'WordPress Integration',
					description:
						'PHP integration with shortcodes and transient caching.',
					href: '/integrations/wordpress'
				},
				{
					title: 'Django Integration',
					description:
						'Python views, Celery tasks, and model storage.',
					href: '/integrations/django'
				}
			]}
		>
			{/* Quick Start */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Quick start
				</h2>
				<p className="mt-3 text-muted-foreground">
					Laravel includes Guzzle out of the box. Add your API key to
					the <code>.env</code> file and you&#39;re ready to capture
					screenshots.
				</p>
				<div className="mt-6 space-y-4">
					<CodeBlock
						language="bash"
						title=".env"
						code="SCREENSHOTAPI_KEY=sk_live_xxxxx"
					/>
					<CodeBlock
						language="php"
						title="config/services.php"
						code={`return [
    // ... other services

    'screenshotapi' => [
        'key' => env('SCREENSHOTAPI_KEY'),
        'base_url' => 'https://screenshotapi.to/api/v1/screenshot',
    ],
];`}
					/>
				</div>
			</section>

			{/* Controller */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Controller
				</h2>
				<p className="mt-3 text-muted-foreground">
					A resource controller that captures screenshots
					synchronously. Uses Laravel&#39;s built-in HTTP client for a
					clean, expressive API.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="php"
						title="app/Http/Controllers/ScreenshotController.php"
						code={`<?php

namespace App\\Http\\Controllers;

use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Http;
use Illuminate\\Support\\Facades\\Cache;

class ScreenshotController extends Controller
{
    public function capture(Request $request)
    {
        $request->validate([
            'url' => 'required|url',
            'width' => 'integer|min:320|max:3840',
            'height' => 'integer|min:240|max:2160',
            'type' => 'in:png,jpeg,webp',
        ]);

        $cacheKey = 'screenshot:' . md5($request->url . $request->width . $request->height);

        $imageData = Cache::remember($cacheKey, now()->addHours(1), function () use ($request) {
            $response = Http::timeout(30)
                ->withHeaders([
                    'x-api-key' => config('services.screenshotapi.key'),
                ])
                ->get(config('services.screenshotapi.base_url'), [
                    'url' => $request->url,
                    'width' => $request->input('width', 1440),
                    'height' => $request->input('height', 900),
                    'type' => $request->input('type', 'png'),
                    'fullPage' => $request->boolean('fullPage', false),
                ]);

            if ($response->failed()) {
                return null;
            }

            return [
                'body' => base64_encode($response->body()),
                'content_type' => $response->header('content-type') ?? 'image/png',
            ];
        });

        if (!$imageData) {
            Cache::forget($cacheKey);
            return response()->json(['error' => 'Screenshot capture failed'], 502);
        }

        return response(base64_decode($imageData['body']))
            ->header('Content-Type', $imageData['content_type'])
            ->header('Cache-Control', 'public, max-age=3600');
    }
}`}
					/>
				</div>
				<div className="mt-4">
					<CodeBlock
						language="php"
						title="routes/api.php"
						code={`use App\\Http\\Controllers\\ScreenshotController;

Route::get('/screenshot', [ScreenshotController::class, 'capture']);`}
					/>
				</div>
			</section>

			{/* Queued Job */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Queued job for background capture
				</h2>
				<p className="mt-3 text-muted-foreground">
					For production, dispatch a queued job so the API response
					returns immediately. The job captures the screenshot and
					stores it on disk or S3.
				</p>
				<div className="mt-6 space-y-4">
					<CodeBlock
						language="bash"
						title="Terminal"
						code="php artisan make:job CaptureScreenshot"
					/>
					<CodeBlock
						language="php"
						title="app/Jobs/CaptureScreenshot.php"
						code={`<?php

namespace App\\Jobs;

use App\\Models\\Screenshot;
use Illuminate\\Bus\\Queueable;
use Illuminate\\Contracts\\Queue\\ShouldQueue;
use Illuminate\\Foundation\\Bus\\Dispatchable;
use Illuminate\\Queue\\InteractsWithQueue;
use Illuminate\\Queue\\SerializesModels;
use Illuminate\\Support\\Facades\\Http;
use Illuminate\\Support\\Facades\\Storage;

class CaptureScreenshot implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 10;

    public function __construct(
        public Screenshot $screenshot
    ) {}

    public function handle(): void
    {
        $this->screenshot->update(['status' => 'processing']);

        $response = Http::timeout(30)
            ->withHeaders([
                'x-api-key' => config('services.screenshotapi.key'),
            ])
            ->get(config('services.screenshotapi.base_url'), [
                'url' => $this->screenshot->url,
                'width' => $this->screenshot->width,
                'height' => $this->screenshot->height,
                'type' => $this->screenshot->file_type,
                'quality' => 85,
                'waitUntil' => 'networkidle',
            ]);

        if ($response->failed()) {
            $this->screenshot->update([
                'status' => 'failed',
                'error_message' => "HTTP {$response->status()}",
            ]);
            return;
        }

        $path = "screenshots/{$this->screenshot->id}.{$this->screenshot->file_type}";
        Storage::put($path, $response->body());

        $this->screenshot->update([
            'status' => 'completed',
            'file_path' => $path,
            'file_size' => strlen($response->body()),
            'captured_at' => now(),
        ]);
    }

    public function failed(\\Throwable $exception): void
    {
        $this->screenshot->update([
            'status' => 'failed',
            'error_message' => $exception->getMessage(),
        ]);
    }
}`}
					/>
				</div>
			</section>

			{/* Model */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Screenshot model
				</h2>
				<p className="mt-3 text-muted-foreground">
					An Eloquent model for tracking screenshot requests, with a
					migration and helper scopes.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="php"
						title="app/Models/Screenshot.php"
						code={`<?php

namespace App\\Models;

use Illuminate\\Database\\Eloquent\\Model;
use Illuminate\\Support\\Facades\\Storage;

class Screenshot extends Model
{
    protected $fillable = [
        'url', 'width', 'height', 'file_type',
        'status', 'file_path', 'file_size',
        'error_message', 'captured_at',
    ];

    protected $casts = [
        'captured_at' => 'datetime',
    ];

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeRecent($query)
    {
        return $query->where('created_at', '>=', now()->subHour());
    }

    public function getImageUrlAttribute(): ?string
    {
        if (!$this->file_path) return null;
        return Storage::url($this->file_path);
    }
}`}
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
								Use Redis for queues and cache.
							</strong>{' '}
							Set <code>QUEUE_CONNECTION=redis</code> and{' '}
							<code>CACHE_DRIVER=redis</code> for fast, reliable
							job processing and cache storage.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Store on S3.
							</strong>{' '}
							Configure <code>FILESYSTEM_DISK=s3</code> so
							screenshots are stored in a CDN-backed bucket
							instead of local disk.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Add request throttling.
							</strong>{' '}
							Apply Laravel&#39;s <code>throttle</code> middleware
							to the screenshot endpoint to limit requests per
							user per minute.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Schedule cleanup.
							</strong>{' '}
							Add a scheduled command in{' '}
							<code>routes/console.php</code> that deletes
							screenshots older than 7 days and removes their S3
							objects.
						</span>
					</li>
				</ul>
			</section>
		</ArticleLayout>
	)
}
