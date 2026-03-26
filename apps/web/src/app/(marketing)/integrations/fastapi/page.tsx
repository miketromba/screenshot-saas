import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock } from '@/components/seo'

export const metadata: Metadata = {
	title: 'FastAPI Screenshot API Integration — Async Endpoints, Pydantic & Background Tasks',
	description:
		'Capture website screenshots in FastAPI with async endpoints, Pydantic request validation, httpx for non-blocking HTTP, and background task processing.'
}

export default function FastAPIIntegrationPage() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Integrations', href: '/integrations' },
				{ label: 'FastAPI' }
			]}
			title="FastAPI Screenshot API Integration"
			description="Build an async screenshot service with FastAPI, Pydantic models for request validation, httpx for non-blocking API calls, and background tasks for long captures."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'TechArticle',
				headline: 'FastAPI Screenshot API Integration',
				description:
					'How to capture website screenshots in FastAPI with async endpoints and Pydantic.',
				dateModified: '2026-03-25',
				publisher: {
					'@type': 'Organization',
					name: 'ScreenshotAPI',
					url: 'https://screenshotapi.to'
				}
			}}
			faq={[
				{
					question: 'Why use httpx instead of requests?',
					answer: 'httpx supports async/await natively, which is essential for FastAPI. Using the synchronous requests library would block the event loop and defeat the purpose of async endpoints.'
				},
				{
					question: 'How do I handle timeouts in FastAPI?',
					answer: 'Set a timeout on the httpx client: httpx.AsyncClient(timeout=30.0). This prevents your endpoint from hanging if the screenshot API is slow.'
				},
				{
					question:
						'Can I use FastAPI BackgroundTasks for screenshot capture?',
					answer: "Yes. FastAPI's built-in BackgroundTasks runs after the response is sent. For heavier workloads, use Celery or ARQ for a proper task queue with retries and monitoring."
				},
				{
					question: 'How do I validate screenshot parameters?',
					answer: 'Use a Pydantic model with Field constraints. This gives you automatic validation, OpenAPI documentation, and type safety for all screenshot parameters.'
				},
				{
					question: 'Should I create a new httpx client per request?',
					answer: 'No. Create a single AsyncClient at startup and reuse it via dependency injection. This enables connection pooling and is significantly faster than creating a client per request.'
				}
			]}
			relatedPages={[
				{
					title: 'Django Integration',
					description:
						'Full Django integration with models, views, and Celery.',
					href: '/integrations/django'
				},
				{
					title: 'Flask Integration',
					description:
						'Lightweight Python screenshot integration with Flask.',
					href: '/integrations/flask'
				},
				{
					title: 'AWS Lambda Integration',
					description:
						'Deploy Python screenshot functions as serverless handlers.',
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
					Install FastAPI, uvicorn, and httpx. FastAPI&#39;s
					async-first design makes it ideal for calling external APIs
					without blocking.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="bash"
						title="Terminal"
						code="pip install fastapi uvicorn httpx python-dotenv"
					/>
				</div>
			</section>

			{/* Pydantic Model */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Pydantic request model
				</h2>
				<p className="mt-3 text-muted-foreground">
					Define a Pydantic model for screenshot parameters with
					built-in validation, defaults, and OpenAPI documentation.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="python"
						title="models.py"
						code={`from pydantic import BaseModel, Field, HttpUrl
from enum import Enum


class ImageType(str, Enum):
    png = "png"
    jpeg = "jpeg"
    webp = "webp"


class ScreenshotRequest(BaseModel):
    url: HttpUrl
    width: int = Field(default=1440, ge=320, le=3840)
    height: int = Field(default=900, ge=240, le=2160)
    type: ImageType = ImageType.png
    full_page: bool = False
    quality: int = Field(default=85, ge=1, le=100)
    wait_until: str = "load"


class ScreenshotResponse(BaseModel):
    id: str
    status: str
    url: str | None = None
    error: str | None = None`}
					/>
				</div>
			</section>

			{/* Async Endpoint */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Async endpoint
				</h2>
				<p className="mt-3 text-muted-foreground">
					A fully async endpoint that captures a screenshot and
					returns the image bytes. Uses httpx&#39;s async client for
					non-blocking HTTP calls.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="python"
						title="main.py"
						code={`import os
from contextlib import asynccontextmanager

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import Response

from models import ImageType

load_dotenv()

API_BASE = "https://screenshotapi.to/api/v1/screenshot"
API_KEY = os.environ["SCREENSHOTAPI_KEY"]


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.http_client = httpx.AsyncClient(timeout=30.0)
    yield
    await app.state.http_client.aclose()


app = FastAPI(title="Screenshot Service", lifespan=lifespan)


@app.get("/screenshot")
async def capture_screenshot(
    url: str = Query(..., description="URL to screenshot"),
    width: int = Query(default=1440, ge=320, le=3840),
    height: int = Query(default=900, ge=240, le=2160),
    type: ImageType = Query(default=ImageType.png),
    full_page: bool = Query(default=False),
):
    client: httpx.AsyncClient = app.state.http_client

    response = await client.get(
        API_BASE,
        params={
            "url": url,
            "width": width,
            "height": height,
            "type": type.value,
            "fullPage": str(full_page).lower(),
            "quality": 85,
            "waitUntil": "networkidle",
        },
        headers={"x-api-key": API_KEY},
    )

    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code,
            detail="Screenshot capture failed",
        )

    content_type = response.headers.get("content-type", "image/png")
    return Response(
        content=response.content,
        media_type=content_type,
        headers={"Cache-Control": "public, max-age=3600"},
    )`}
					/>
				</div>
			</section>

			{/* Background Task */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Background task processing
				</h2>
				<p className="mt-3 text-muted-foreground">
					For long-running captures, return immediately and process
					the screenshot in the background. Clients poll a status
					endpoint for the result.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="python"
						title="main.py (background tasks)"
						code={`import uuid
from fastapi import BackgroundTasks

tasks: dict[str, dict] = {}


async def process_screenshot(task_id: str, url: str, params: dict):
    client: httpx.AsyncClient = app.state.http_client
    tasks[task_id]["status"] = "processing"

    try:
        response = await client.get(
            API_BASE,
            params={"url": url, **params},
            headers={"x-api-key": API_KEY},
        )
        response.raise_for_status()

        filepath = f"screenshots/{task_id}.{params.get('type', 'png')}"
        os.makedirs("screenshots", exist_ok=True)
        with open(filepath, "wb") as f:
            f.write(response.content)

        tasks[task_id]["status"] = "completed"
        tasks[task_id]["filepath"] = filepath

    except httpx.HTTPError as exc:
        tasks[task_id]["status"] = "failed"
        tasks[task_id]["error"] = str(exc)


@app.post("/screenshot/async")
async def request_screenshot(
    url: str,
    background_tasks: BackgroundTasks,
    width: int = 1440,
    height: int = 900,
    type: ImageType = ImageType.png,
):
    task_id = str(uuid.uuid4())
    params = {"width": width, "height": height, "type": type.value}

    tasks[task_id] = {"status": "pending", "url": url}
    background_tasks.add_task(process_screenshot, task_id, url, params)

    return {"task_id": task_id, "status": "pending"}


@app.get("/screenshot/status/{task_id}")
async def screenshot_status(task_id: str):
    task = tasks.get(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task`}
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
								Reuse the httpx client.
							</strong>{' '}
							Create the <code>AsyncClient</code> once at startup
							using the lifespan context manager. This enables
							connection pooling.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Use Redis for task state.
							</strong>{' '}
							The in-memory <code>tasks</code> dict is fine for
							development. In production, store task state in
							Redis so it survives restarts.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Add rate limiting.
							</strong>{' '}
							Use <code>slowapi</code> to limit screenshot
							requests per IP address. This prevents credit abuse
							from a single client.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Run with multiple workers.
							</strong>{' '}
							Deploy with{' '}
							<code>uvicorn main:app --workers 4</code> for
							production. Each worker runs its own event loop for
							better throughput.
						</span>
					</li>
				</ul>
			</section>
		</ArticleLayout>
	)
}
