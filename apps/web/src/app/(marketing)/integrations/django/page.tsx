import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock } from '@/components/seo'

export const metadata: Metadata = {
	title: 'Django Screenshot API Integration — Views, Celery Tasks & Model Storage',
	description:
		'Capture website screenshots in Django with view functions, Celery background tasks, and model-based storage. Production-ready Python code examples.'
}

export default function DjangoIntegrationPage() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Integrations', href: '/integrations' },
				{ label: 'Django' }
			]}
			title="Django Screenshot API Integration"
			description="Add website screenshot capture to your Django application with view functions, background processing via Celery, and model-based storage for screenshot metadata."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'TechArticle',
				headline: 'Django Screenshot API Integration',
				description:
					'How to capture website screenshots in Django with views and Celery background tasks.',
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
						'Do I need Celery for Django screenshot integration?',
					answer: 'For simple use cases, you can capture screenshots synchronously in a view. For production apps, Celery is recommended to avoid blocking web requests — screenshot capture typically takes 2–5 seconds.'
				},
				{
					question: 'How do I store screenshots in Django?',
					answer: "Save the image bytes to Django's default storage (local filesystem, S3, etc.) using a FileField or ImageField on your model. Store the URL, status, and metadata in the database."
				},
				{
					question:
						'Can I use Django REST Framework with ScreenshotAPI?',
					answer: 'Yes. Create a DRF serializer for screenshot requests and a ViewSet that triggers the capture. Use Celery for async processing and return a task ID the client can poll.'
				},
				{
					question: 'What Python HTTP library should I use?',
					answer: 'The requests library is the most common choice for Django. For async views (Django 4.1+), use httpx with its async client for non-blocking HTTP calls.'
				},
				{
					question: 'How do I handle rate limiting with Django?',
					answer: 'Use django-ratelimit to limit how often users can request screenshots. Combine this with Celery rate limiting (task_annotations) to control how many API calls you make per minute.'
				}
			]}
			relatedPages={[
				{
					title: 'Flask Integration',
					description:
						'Lightweight Python screenshot integration without the Django overhead.',
					href: '/integrations/flask'
				},
				{
					title: 'FastAPI Integration',
					description:
						'Async Python screenshot capture with FastAPI and httpx.',
					href: '/integrations/fastapi'
				},
				{
					title: 'AWS Lambda Integration',
					description:
						'Deploy screenshot functions as serverless Python handlers.',
					href: '/integrations/aws-lambda'
				}
			]}
		>
			{/* Quick Start */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Quick start
				</h2>
				<p className="mt-3 text-muted-foreground">
					Install the requests library and add your API key to Django
					settings. That&#39;s all you need to start capturing
					screenshots.
				</p>
				<div className="mt-6 space-y-4">
					<CodeBlock
						language="bash"
						title="Terminal"
						code="pip install requests"
					/>
					<CodeBlock
						language="python"
						title="settings.py"
						code={`# Add to your Django settings
SCREENSHOTAPI_KEY = env("SCREENSHOTAPI_KEY")  # sk_live_xxxxx`}
					/>
				</div>
			</section>

			{/* Basic View */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Basic view function
				</h2>
				<p className="mt-3 text-muted-foreground">
					A simple view that captures a screenshot and returns it as
					an HTTP response. Suitable for low-traffic endpoints or
					internal tools.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="python"
						title="screenshots/views.py"
						code={`import requests
from django.conf import settings
from django.http import HttpResponse, JsonResponse

API_BASE = "https://screenshotapi.to/api/v1/screenshot"


def capture_screenshot(request):
    url = request.GET.get("url")
    if not url:
        return JsonResponse({"error": "Missing url parameter"}, status=400)

    response = requests.get(
        API_BASE,
        params={
            "url": url,
            "width": request.GET.get("width", "1440"),
            "height": request.GET.get("height", "900"),
            "type": request.GET.get("type", "png"),
            "fullPage": request.GET.get("fullPage", "false"),
        },
        headers={"x-api-key": settings.SCREENSHOTAPI_KEY},
        timeout=30,
    )

    if not response.ok:
        return JsonResponse(
            {"error": "Screenshot capture failed"},
            status=response.status_code,
        )

    content_type = response.headers.get("content-type", "image/png")
    return HttpResponse(response.content, content_type=content_type)`}
					/>
				</div>
				<div className="mt-4">
					<CodeBlock
						language="python"
						title="screenshots/urls.py"
						code={`from django.urls import path
from . import views

urlpatterns = [
    path("capture/", views.capture_screenshot, name="capture_screenshot"),
]`}
					/>
				</div>
			</section>

			{/* Model */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Screenshot model
				</h2>
				<p className="mt-3 text-muted-foreground">
					Store screenshot metadata and the image file in the
					database. This lets you track capture history, serve cached
					results, and manage storage.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="python"
						title="screenshots/models.py"
						code={`from django.db import models


class Screenshot(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending"
        PROCESSING = "processing"
        COMPLETED = "completed"
        FAILED = "failed"

    url = models.URLField(max_length=2048)
    image = models.ImageField(upload_to="screenshots/%Y/%m/", blank=True)
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )
    width = models.PositiveIntegerField(default=1440)
    height = models.PositiveIntegerField(default=900)
    file_type = models.CharField(max_length=10, default="png")
    file_size = models.PositiveIntegerField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["url", "status"]),
        ]

    def __str__(self):
        return f"Screenshot of {self.url} ({self.status})"
`}
					/>
				</div>
			</section>

			{/* Celery Task */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Celery background task
				</h2>
				<p className="mt-3 text-muted-foreground">
					Offload screenshot capture to a Celery worker so your web
					requests return immediately. The task updates the Screenshot
					model when capture completes.
				</p>
				<div className="mt-6 space-y-4">
					<CodeBlock
						language="bash"
						title="Terminal"
						code="pip install celery redis"
					/>
					<CodeBlock
						language="python"
						title="screenshots/tasks.py"
						code={`import requests
from celery import shared_task
from django.conf import settings
from django.core.files.base import ContentFile
from django.utils import timezone

from .models import Screenshot

API_BASE = "https://screenshotapi.to/api/v1/screenshot"


@shared_task(bind=True, max_retries=3, default_retry_delay=10)
def capture_screenshot_task(self, screenshot_id: int):
    screenshot = Screenshot.objects.get(id=screenshot_id)
    screenshot.status = Screenshot.Status.PROCESSING
    screenshot.save(update_fields=["status"])

    try:
        response = requests.get(
            API_BASE,
            params={
                "url": screenshot.url,
                "width": str(screenshot.width),
                "height": str(screenshot.height),
                "type": screenshot.file_type,
                "quality": "85",
                "waitUntil": "networkidle",
            },
            headers={"x-api-key": settings.SCREENSHOTAPI_KEY},
            timeout=30,
        )
        response.raise_for_status()

        filename = f"{screenshot_id}.{screenshot.file_type}"
        screenshot.image.save(filename, ContentFile(response.content), save=False)
        screenshot.file_size = len(response.content)
        screenshot.status = Screenshot.Status.COMPLETED
        screenshot.completed_at = timezone.now()
        screenshot.save()

    except requests.RequestException as exc:
        screenshot.status = Screenshot.Status.FAILED
        screenshot.error_message = str(exc)
        screenshot.save(update_fields=["status", "error_message"])
        raise self.retry(exc=exc)`}
					/>
				</div>
			</section>

			{/* Async View with Celery */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Async capture endpoint
				</h2>
				<p className="mt-3 text-muted-foreground">
					Combine the model and Celery task into a two-step workflow:
					create a screenshot record, dispatch the task, and return a
					polling URL.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="python"
						title="screenshots/views.py"
						code={`import json
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from .models import Screenshot
from .tasks import capture_screenshot_task


@require_POST
def request_screenshot(request):
    body = json.loads(request.body)
    url = body.get("url")
    if not url:
        return JsonResponse({"error": "Missing url"}, status=400)

    screenshot = Screenshot.objects.create(
        url=url,
        width=body.get("width", 1440),
        height=body.get("height", 900),
        file_type=body.get("type", "png"),
    )

    capture_screenshot_task.delay(screenshot.id)

    return JsonResponse({
        "id": screenshot.id,
        "status": screenshot.status,
        "poll_url": f"/api/screenshots/{screenshot.id}/",
    }, status=202)


def screenshot_status(request, screenshot_id):
    try:
        screenshot = Screenshot.objects.get(id=screenshot_id)
    except Screenshot.DoesNotExist:
        return JsonResponse({"error": "Not found"}, status=404)

    data = {
        "id": screenshot.id,
        "url": screenshot.url,
        "status": screenshot.status,
        "image_url": screenshot.image.url if screenshot.image else None,
        "error": screenshot.error_message or None,
        "created_at": screenshot.created_at.isoformat(),
    }
    return JsonResponse(data)`}
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
								Use Celery for all production captures.
							</strong>{' '}
							Synchronous screenshot calls block your web worker
							for 2–5 seconds. Celery keeps your response times
							fast.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Set request timeouts.
							</strong>{' '}
							Always pass <code>timeout=30</code> to{' '}
							<code>requests.get()</code> to prevent workers from
							hanging indefinitely.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Store images in S3.
							</strong>{' '}
							Use django-storages with S3 as the default file
							storage backend. This offloads serving to a CDN and
							avoids filling your application server disk.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Deduplicate requests.
							</strong>{' '}
							Before creating a new Screenshot, check if a recent
							one exists for the same URL. Return the cached
							version if it&#39;s less than an hour old.
						</span>
					</li>
				</ul>
			</section>
		</ArticleLayout>
	)
}
