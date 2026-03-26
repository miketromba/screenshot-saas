---
title: "Flask Screenshot API Integration"
description: "Add website screenshot capture to Flask with ScreenshotAPI. No Selenium or Playwright needed. Python code examples for every use case."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Integrations
    href: /integrations
  - label: Flask
faq:
  - question: "Do I need to install Chromium or Selenium for Flask screenshots?"
    answer: "No. ScreenshotAPI runs headless browsers on its own servers. Your Flask app sends an HTTP GET request and receives the image bytes. No browser installation required."
  - question: "Can I use ScreenshotAPI with Flask async views?"
    answer: "Yes. Flask 2.0+ supports async views. You can use httpx or aiohttp to make async requests to ScreenshotAPI inside an async route handler."
  - question: "How do I serve the screenshot as a downloadable file?"
    answer: "Use Flask's send_file with a BytesIO wrapper and set as_attachment=True. Set the download_name parameter to control the filename."
  - question: "What is the best image format for Flask screenshot responses?"
    answer: "WebP offers the best balance of quality and file size. Use type=webp with quality=80 for most use cases. Fall back to PNG if you need lossless output."
relatedPages:
  - title: "Django Integration"
    description: "Full-featured Django screenshot integration with ORM and Celery"
    href: "/integrations/django"
  - title: "FastAPI Integration"
    description: "Async-native screenshot capture with FastAPI"
    href: "/integrations/fastapi"
  - title: "Python SDK"
    description: "Full reference for the ScreenshotAPI Python SDK"
    href: "/docs/sdks/python"
jsonLd:
  "@context": "https://schema.org"
  "@type": "TechArticle"
  headline: "Flask Screenshot API Integration"
  description: "Add website screenshot capture to Flask with ScreenshotAPI. No Selenium or Playwright needed. Python code examples for every use case."
  dateModified: "2026-03-25"
---

## Capture Website Screenshots in Flask with ScreenshotAPI

Flask is the go-to Python framework when you want to build a lightweight API quickly. Adding screenshot functionality typically leads developers to install Playwright or Selenium, which brings browser binaries, version conflicts, and deployment headaches. On platforms like Heroku and Railway, getting Chromium to run inside a container often requires custom buildpacks.

A **Flask screenshot API** integration with ScreenshotAPI side-steps all of that. One HTTP request from your Flask route produces a pixel-perfect screenshot. No browser binaries, no system dependencies, and the whole thing deploys anywhere Python runs.

## Quick Start

1. [Create a free account](https://screenshotapi.to) and copy your API key. You get **5 free credits** immediately.
2. Install the Python SDK and requests library.
3. Create a Flask route that proxies screenshot requests.

## Installation

```bash
pip install screenshotapi requests flask
```

Set the API key as an environment variable:

```bash
export SCREENSHOTAPI_KEY=sk_live_xxxxx
```

## Basic Example

A minimal Flask app that returns screenshots:

```python
import os
import requests
from flask import Flask, request, Response, jsonify

app = Flask(__name__)

API_BASE = 'https://screenshotapi.to/api/v1/screenshot'
API_KEY = os.environ['SCREENSHOTAPI_KEY']

@app.route('/screenshot')
def screenshot():
    url = request.args.get('url')
    if not url:
        return jsonify(error='url parameter is required'), 400

    response = requests.get(
        API_BASE,
        params={
            'url': url,
            'width': request.args.get('width', 1440),
            'height': request.args.get('height', 900),
            'type': request.args.get('type', 'png'),
        },
        headers={'x-api-key': API_KEY},
        timeout=30,
    )

    if response.status_code != 200:
        return jsonify(error='Screenshot capture failed'), 502

    image_type = request.args.get('type', 'png')
    return Response(
        response.content,
        mimetype=f'image/{image_type}',
        headers={'Cache-Control': 'public, max-age=86400'},
    )

if __name__ == '__main__':
    app.run(debug=True)
```

Test it in your browser or with cURL:

```bash
curl "http://localhost:5000/screenshot?url=https://example.com" --output screenshot.png
```

## Flask Screenshot Utility with Retries

Extract reusable screenshot logic into a helper module:

```python
# screenshot_utils.py
import time
import os
import requests

API_BASE = 'https://screenshotapi.to/api/v1/screenshot'
API_KEY = os.environ['SCREENSHOTAPI_KEY']

class ScreenshotError(Exception):
    pass

def capture(
    url: str,
    width: int = 1440,
    height: int = 900,
    image_type: str = 'png',
    quality: int | None = None,
    full_page: bool = False,
    color_scheme: str | None = None,
    wait_until: str = 'networkidle',
    retries: int = 2,
) -> bytes:
    params: dict = {
        'url': url,
        'width': width,
        'height': height,
        'type': image_type,
        'waitUntil': wait_until,
    }

    if quality is not None:
        params['quality'] = quality
    if full_page:
        params['fullPage'] = 'true'
    if color_scheme:
        params['colorScheme'] = color_scheme

    last_error = None
    for attempt in range(retries + 1):
        try:
            resp = requests.get(
                API_BASE,
                params=params,
                headers={'x-api-key': API_KEY},
                timeout=30,
            )
            resp.raise_for_status()
            return resp.content
        except requests.RequestException as exc:
            last_error = exc
            if attempt < retries:
                time.sleep(1 * (attempt + 1))

    raise ScreenshotError(f'Failed after {retries + 1} attempts: {last_error}')
```

## Flask Blueprint for Screenshot Routes

Organize screenshot routes into a reusable Blueprint:

```python
# blueprints/screenshots.py
from flask import Blueprint, request, Response, jsonify
from screenshot_utils import capture, ScreenshotError

screenshots_bp = Blueprint('screenshots', __name__, url_prefix='/api')

@screenshots_bp.route('/screenshot')
def take_screenshot():
    url = request.args.get('url')
    if not url:
        return jsonify(error='url parameter is required'), 400

    width = request.args.get('width', 1440, type=int)
    height = request.args.get('height', 900, type=int)
    image_type = request.args.get('type', 'webp')
    quality = request.args.get('quality', 80, type=int)
    full_page = request.args.get('fullPage', 'false').lower() == 'true'

    try:
        image = capture(
            url=url,
            width=width,
            height=height,
            image_type=image_type,
            quality=quality,
            full_page=full_page,
        )
    except ScreenshotError:
        return jsonify(error='Screenshot capture failed'), 502

    return Response(
        image,
        mimetype=f'image/{image_type}',
        headers={'Cache-Control': 'public, max-age=3600'},
    )

@screenshots_bp.route('/screenshot/download')
def download_screenshot():
    url = request.args.get('url')
    if not url:
        return jsonify(error='url parameter is required'), 400

    try:
        image = capture(url=url, image_type='png')
    except ScreenshotError:
        return jsonify(error='Screenshot capture failed'), 502

    from io import BytesIO
    from flask import send_file

    return send_file(
        BytesIO(image),
        mimetype='image/png',
        as_attachment=True,
        download_name='screenshot.png',
    )
```

Register the Blueprint in your app factory:

```python
# app.py
from flask import Flask
from blueprints.screenshots import screenshots_bp

def create_app():
    app = Flask(__name__)
    app.register_blueprint(screenshots_bp)
    return app
```

## Full-Page and Mobile Screenshots

Capture entire scrollable pages or emulate mobile viewports:

```python
# Full-page screenshot
full_page_image = capture(
    url='https://example.com/long-page',
    full_page=True,
    image_type='webp',
    quality=80,
)

# Mobile viewport
mobile_image = capture(
    url='https://example.com',
    width=390,
    height=844,
    image_type='webp',
)
```

## Dark Mode Screenshots

Pass the `colorScheme` parameter to capture dark mode variants without modifying the target site:

```python
light = capture(url='https://example.com', color_scheme='light')
dark = capture(url='https://example.com', color_scheme='dark')
```

This is useful for generating preview images for themes or running [visual regression tests](/use-cases/visual-regression-testing) across both modes.

## Caching with Flask-Caching

Avoid redundant API calls by caching screenshot responses:

```python
from flask_caching import Cache

cache = Cache(config={'CACHE_TYPE': 'RedisCache', 'CACHE_REDIS_URL': 'redis://localhost:6379'})

@screenshots_bp.route('/screenshot/cached')
@cache.cached(timeout=3600, query_string=True)
def cached_screenshot():
    url = request.args.get('url')
    if not url:
        return jsonify(error='url parameter is required'), 400

    image = capture(url=url, image_type='webp', quality=80)
    return Response(image, mimetype='image/webp')
```

## Production Tips

### Input Validation

Validate URLs before passing them to the API:

```python
from urllib.parse import urlparse

def is_valid_url(url: str) -> bool:
    try:
        parsed = urlparse(url)
        return parsed.scheme in ('http', 'https') and bool(parsed.netloc)
    except Exception:
        return False
```

### Rate Limiting

Use Flask-Limiter to prevent abuse:

```python
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(get_remote_address, app=app, default_limits=['100 per hour'])

@screenshots_bp.route('/screenshot')
@limiter.limit('20 per minute')
def take_screenshot():
    ...
```

### Deployment Notes

ScreenshotAPI works on every Python hosting platform. No Chromium, no Node.js, no special Docker layers. Whether you deploy on Heroku, Railway, Render, or a plain VPS, the integration is the same `requests.get` call. Visit the [pricing page](/pricing) to pick the credit tier that matches your traffic.

## Further Reading

- [How to Take Screenshots with Python](/blog/how-to-take-screenshots-with-python) walks through the fundamentals of Python screenshot capture.
- The [Python SDK documentation](/docs/sdks/python) has the full parameter reference.
- For a heavier Python framework, see the [Django integration](/integrations/django).
