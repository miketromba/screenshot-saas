import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock } from '@/components/seo'

export const metadata: Metadata = {
	title: 'Flask Screenshot API Integration — Routes, Background Tasks & Caching',
	description:
		'Capture website screenshots in Flask with route handlers, background tasks using threading or Celery, and simple caching. Python code examples included.'
}

export default function FlaskIntegrationPage() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Integrations', href: '/integrations' },
				{ label: 'Flask' }
			]}
			title="Flask Screenshot API Integration"
			description="Add website screenshot capture to your Flask application with clean route handlers, background processing, and response caching for repeat requests."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'TechArticle',
				headline: 'Flask Screenshot API Integration',
				description:
					'How to capture website screenshots in Flask with route handlers and background tasks.',
				dateModified: '2026-03-25',
				publisher: {
					'@type': 'Organization',
					name: 'ScreenshotAPI',
					url: 'https://screenshotapi.to'
				}
			}}
			faq={[
				{
					question: 'Is Flask fast enough for screenshot capture?',
					answer: 'Flask handles the HTTP routing — the actual screenshot is captured by ScreenshotAPI. For high-traffic apps, offload capture to a background thread or Celery to keep Flask responsive.'
				},
				{
					question:
						'Should I use threading or Celery for background tasks?',
					answer: 'Threading is simpler and works for low-to-medium traffic. Celery adds complexity but gives you retries, monitoring, and rate limiting — use it for production workloads.'
				},
				{
					question: 'How do I cache screenshots in Flask?',
					answer: 'Use Flask-Caching with a Redis or filesystem backend. Cache the image bytes with a key based on the URL and parameters, and set a TTL of 1–24 hours.'
				},
				{
					question: 'Can I use httpx instead of requests?',
					answer: 'Yes. If you are using Flask with async views (Flask 2.0+), httpx with its async client is a great choice for non-blocking API calls.'
				}
			]}
			relatedPages={[
				{
					title: 'Django Integration',
					description:
						'Full-featured Django integration with models and Celery tasks.',
					href: '/integrations/django'
				},
				{
					title: 'FastAPI Integration',
					description:
						'Async-first Python integration with Pydantic validation.',
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
					Install Flask and the requests library, then add a route
					that proxies screenshot requests to ScreenshotAPI.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="bash"
						title="Terminal"
						code="pip install flask requests python-dotenv"
					/>
				</div>
			</section>

			{/* Basic Route */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Basic route handler
				</h2>
				<p className="mt-3 text-muted-foreground">
					A minimal Flask app with a single route that captures and
					returns a screenshot.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="python"
						title="app.py"
						code={`import os
import requests
from flask import Flask, request, jsonify, Response
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

API_BASE = "https://screenshotapi.to/api/v1/screenshot"
API_KEY = os.environ["SCREENSHOTAPI_KEY"]


@app.route("/screenshot")
def capture_screenshot():
    url = request.args.get("url")
    if not url:
        return jsonify({"error": "Missing url parameter"}), 400

    response = requests.get(
        API_BASE,
        params={
            "url": url,
            "width": request.args.get("width", "1440"),
            "height": request.args.get("height", "900"),
            "type": request.args.get("type", "png"),
            "fullPage": request.args.get("fullPage", "false"),
        },
        headers={"x-api-key": API_KEY},
        timeout=30,
    )

    if not response.ok:
        return jsonify({"error": "Screenshot capture failed"}), response.status_code

    content_type = response.headers.get("content-type", "image/png")
    return Response(response.content, content_type=content_type)


if __name__ == "__main__":
    app.run(debug=True)`}
					/>
				</div>
			</section>

			{/* Background Task */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Background processing
				</h2>
				<p className="mt-3 text-muted-foreground">
					For production use, offload screenshot capture to a
					background thread so the request returns immediately. The
					client polls a status endpoint for the result.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="python"
						title="app.py (with background tasks)"
						code={`import os
import uuid
import threading
import requests
from flask import Flask, request, jsonify, send_file
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
API_BASE = "https://screenshotapi.to/api/v1/screenshot"
API_KEY = os.environ["SCREENSHOTAPI_KEY"]
SCREENSHOT_DIR = "screenshots"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

tasks: dict[str, dict] = {}


def capture_in_background(task_id: str, url: str, params: dict):
    tasks[task_id]["status"] = "processing"
    try:
        response = requests.get(
            API_BASE,
            params={"url": url, **params},
            headers={"x-api-key": API_KEY},
            timeout=30,
        )
        response.raise_for_status()

        file_type = params.get("type", "png")
        filepath = os.path.join(SCREENSHOT_DIR, f"{task_id}.{file_type}")
        with open(filepath, "wb") as f:
            f.write(response.content)

        tasks[task_id]["status"] = "completed"
        tasks[task_id]["filepath"] = filepath
    except Exception as exc:
        tasks[task_id]["status"] = "failed"
        tasks[task_id]["error"] = str(exc)


@app.route("/screenshot", methods=["POST"])
def request_screenshot():
    data = request.get_json()
    url = data.get("url")
    if not url:
        return jsonify({"error": "Missing url"}), 400

    task_id = str(uuid.uuid4())
    params = {
        "width": str(data.get("width", 1440)),
        "height": str(data.get("height", 900)),
        "type": data.get("type", "png"),
    }

    tasks[task_id] = {"status": "pending", "url": url}
    thread = threading.Thread(
        target=capture_in_background,
        args=(task_id, url, params),
    )
    thread.start()

    return jsonify({"task_id": task_id, "status": "pending"}), 202


@app.route("/screenshot/<task_id>")
def screenshot_status(task_id):
    task = tasks.get(task_id)
    if not task:
        return jsonify({"error": "Not found"}), 404

    if task["status"] == "completed":
        return send_file(task["filepath"], mimetype="image/png")

    return jsonify({
        "task_id": task_id,
        "status": task["status"],
        "error": task.get("error"),
    })`}
					/>
				</div>
			</section>

			{/* Caching */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Caching with Flask-Caching
				</h2>
				<p className="mt-3 text-muted-foreground">
					Avoid duplicate API calls by caching screenshots.
					Flask-Caching supports Redis, Memcached, and filesystem
					backends.
				</p>
				<div className="mt-6 space-y-4">
					<CodeBlock
						language="bash"
						title="Terminal"
						code="pip install flask-caching"
					/>
					<CodeBlock
						language="python"
						title="app.py (with caching)"
						code={`from flask import Flask, request, jsonify, Response
from flask_caching import Cache

app = Flask(__name__)
cache = Cache(app, config={
    "CACHE_TYPE": "RedisCache",
    "CACHE_REDIS_URL": "redis://localhost:6379/0",
    "CACHE_DEFAULT_TIMEOUT": 3600,
})


def make_cache_key():
    return request.full_path


@app.route("/screenshot")
@cache.cached(key_prefix=make_cache_key)
def capture_screenshot():
    url = request.args.get("url")
    if not url:
        return jsonify({"error": "Missing url"}), 400

    import requests as req
    response = req.get(
        "https://screenshotapi.to/api/v1/screenshot",
        params={
            "url": url,
            "width": request.args.get("width", "1440"),
            "height": request.args.get("height", "900"),
            "type": request.args.get("type", "png"),
        },
        headers={"x-api-key": os.environ["SCREENSHOTAPI_KEY"]},
        timeout=30,
    )

    if not response.ok:
        return jsonify({"error": "Failed"}), response.status_code

    return Response(response.content, content_type="image/png")`}
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
								Use Gunicorn in production.
							</strong>{' '}
							Run Flask with Gunicorn and multiple workers. The
							built-in dev server is single-threaded and not
							suitable for production traffic.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Validate URLs.
							</strong>{' '}
							Always validate and sanitize the URL parameter
							before passing it to the API. Reject private IPs and
							internal hostnames.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Switch to Celery for scale.
							</strong>{' '}
							Threading works for small apps, but Celery gives you
							retries, dead letter queues, and monitoring via
							Flower.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Clean up old files.
							</strong>{' '}
							Schedule a periodic task to delete screenshot files
							older than 24 hours to prevent disk from filling up.
						</span>
					</li>
				</ul>
			</section>
		</ArticleLayout>
	)
}
