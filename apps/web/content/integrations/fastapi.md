---
title: "FastAPI Screenshot API Integration"
description: "Capture website screenshots with FastAPI and ScreenshotAPI. Async Python examples with Pydantic validation, caching, and background tasks."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Integrations
    href: /integrations
  - label: FastAPI
faq:
  - question: "Can I use async HTTP calls with ScreenshotAPI in FastAPI?"
    answer: "Yes. Use httpx.AsyncClient to make non-blocking requests to ScreenshotAPI. This keeps your FastAPI server responsive while screenshots are being captured."
  - question: "How do I validate screenshot parameters in FastAPI?"
    answer: "Use Pydantic models or FastAPI's Query parameters with type hints. FastAPI automatically validates and documents the parameters in the OpenAPI schema."
  - question: "Does ScreenshotAPI work with FastAPI background tasks?"
    answer: "Yes. Use FastAPI's BackgroundTasks or Celery to offload screenshot capture. Return a 202 response immediately and process the screenshot asynchronously."
  - question: "What is the best way to cache screenshots in FastAPI?"
    answer: "Use Redis with an async client like redis-py or aioredis. Store the image bytes with a TTL and check the cache before making API calls."
relatedPages:
  - title: "Django Integration"
    description: "Screenshot integration for Django applications"
    href: "/integrations/django"
  - title: "Flask Integration"
    description: "Lightweight Flask screenshot integration"
    href: "/integrations/flask"
  - title: "Python SDK"
    description: "Full reference for the ScreenshotAPI Python SDK"
    href: "/docs/sdks/python"
  - title: "OG Image Generation"
    description: "Generate dynamic social sharing images"
    href: "/use-cases/og-image-generation"
jsonLd:
  "@context": "https://schema.org"
  "@type": "TechArticle"
  headline: "FastAPI Screenshot API Integration"
  description: "Capture website screenshots with FastAPI and ScreenshotAPI. Async Python examples with Pydantic validation."
  dateModified: "2026-03-25"
---

## Capture Website Screenshots with FastAPI and ScreenshotAPI

FastAPI is Python's fastest-growing web framework, built on async foundations and automatic OpenAPI documentation. Adding screenshot functionality to a FastAPI service typically means pulling in Playwright or Selenium, which introduces browser binaries, synchronous bottlenecks, and deployment complexity.

A **FastAPI screenshot API** integration with ScreenshotAPI takes a different approach: your async endpoint makes one HTTP call, receives image bytes, and returns them to the client. No Chromium, no Playwright, no blocking I/O.

## Quick Start

1. [Sign up for ScreenshotAPI](https://screenshotapi.to) and copy your API key. You get **5 free credits** on signup.
2. Install FastAPI and httpx.
3. Create an async endpoint that captures screenshots.

## Installation

```bash
pip install fastapi uvicorn httpx
```

Set the environment variable:

```bash
export SCREENSHOTAPI_KEY=sk_live_xxxxx
```

## Basic Example

A FastAPI app with a screenshot endpoint:

```python
import os
import httpx
from fastapi import FastAPI, Query, HTTPException
from fastapi.responses import Response

app = FastAPI()

API_BASE = 'https://screenshotapi.to/api/v1/screenshot'
API_KEY = os.environ['SCREENSHOTAPI_KEY']

@app.get('/screenshot')
async def screenshot(
    url: str = Query(..., description='URL to capture'),
    width: int = Query(1440, ge=320, le=3840),
    height: int = Query(900, ge=200, le=2160),
    type: str = Query('png', pattern='^(png|jpeg|webp)$'),
):
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(
            API_BASE,
            params={
                'url': url,
                'width': width,
                'height': height,
                'type': type,
            },
            headers={'x-api-key': API_KEY},
        )

    if response.status_code != 200:
        raise HTTPException(status_code=502, detail='Screenshot capture failed')

    return Response(
        content=response.content,
        media_type=f'image/{type}',
        headers={'Cache-Control': 'public, max-age=86400'},
    )
```

Run the server:

```bash
uvicorn main:app --reload
```

FastAPI auto-generates interactive docs at `/docs`, complete with parameter validation and a "Try it out" button.

## Async Screenshot Service

Extract screenshot logic into a service class with retry support:

```python
# services/screenshot.py
import asyncio
import os
import httpx

API_BASE = 'https://screenshotapi.to/api/v1/screenshot'
API_KEY = os.environ['SCREENSHOTAPI_KEY']

class ScreenshotError(Exception):
    pass

class ScreenshotService:
    def __init__(self, api_key: str = API_KEY, max_retries: int = 2):
        self.api_key = api_key
        self.max_retries = max_retries

    async def capture(
        self,
        url: str,
        width: int = 1440,
        height: int = 900,
        image_type: str = 'png',
        quality: int | None = None,
        full_page: bool = False,
        color_scheme: str | None = None,
        wait_until: str = 'networkidle',
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
        for attempt in range(self.max_retries + 1):
            try:
                async with httpx.AsyncClient(timeout=30) as client:
                    response = await client.get(
                        API_BASE,
                        params=params,
                        headers={'x-api-key': self.api_key},
                    )

                if response.status_code == 200:
                    return response.content

                last_error = f'API returned {response.status_code}'
            except httpx.HTTPError as exc:
                last_error = str(exc)

            if attempt < self.max_retries:
                await asyncio.sleep(1 * (attempt + 1))

        raise ScreenshotError(
            f'Failed after {self.max_retries + 1} attempts: {last_error}'
        )
```

## Pydantic Request Models

Use Pydantic for structured parameter validation:

```python
from enum import Enum
from pydantic import BaseModel, HttpUrl, Field

class ImageFormat(str, Enum):
    png = 'png'
    jpeg = 'jpeg'
    webp = 'webp'

class ColorScheme(str, Enum):
    light = 'light'
    dark = 'dark'

class ScreenshotRequest(BaseModel):
    url: HttpUrl
    width: int = Field(1440, ge=320, le=3840)
    height: int = Field(900, ge=200, le=2160)
    image_type: ImageFormat = ImageFormat.webp
    quality: int | None = Field(None, ge=1, le=100)
    full_page: bool = False
    color_scheme: ColorScheme | None = None

@app.post('/screenshot')
async def create_screenshot(request: ScreenshotRequest):
    service = ScreenshotService()

    try:
        image = await service.capture(
            url=str(request.url),
            width=request.width,
            height=request.height,
            image_type=request.image_type.value,
            quality=request.quality,
            full_page=request.full_page,
            color_scheme=request.color_scheme.value if request.color_scheme else None,
        )
    except ScreenshotError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    return Response(
        content=image,
        media_type=f'image/{request.image_type.value}',
        headers={'Cache-Control': 'public, max-age=3600'},
    )
```

## Background Tasks

Return a response immediately and capture the screenshot in the background:

```python
from fastapi import BackgroundTasks
from fastapi.responses import JSONResponse

async def process_screenshot(url: str, webhook_url: str | None):
    service = ScreenshotService()
    try:
        image = await service.capture(url=url, image_type='webp', quality=80)
        # Save to storage or send to webhook
        if webhook_url:
            async with httpx.AsyncClient() as client:
                await client.post(webhook_url, content=image)
    except ScreenshotError:
        pass  # Log the error

@app.post('/screenshot/async')
async def async_screenshot(
    url: str,
    background_tasks: BackgroundTasks,
    webhook_url: str | None = None,
):
    background_tasks.add_task(process_screenshot, url, webhook_url)
    return JSONResponse(
        content={'status': 'queued', 'url': url},
        status_code=202,
    )
```

## Dependency Injection

Use FastAPI's dependency system to inject the screenshot service:

```python
from fastapi import Depends

async def get_screenshot_service() -> ScreenshotService:
    return ScreenshotService()

@app.get('/capture')
async def capture(
    url: str,
    service: ScreenshotService = Depends(get_screenshot_service),
):
    try:
        image = await service.capture(url=url, image_type='webp', quality=80)
    except ScreenshotError:
        raise HTTPException(status_code=502, detail='Capture failed')

    return Response(content=image, media_type='image/webp')
```

## Caching with Redis

Use Redis to cache screenshots and reduce API calls:

```python
import hashlib
import redis.asyncio as redis

redis_client = redis.from_url('redis://localhost:6379')

async def get_cached_screenshot(
    url: str,
    service: ScreenshotService,
    ttl: int = 3600,
    **kwargs,
) -> bytes:
    cache_key = f'screenshot:{hashlib.sha256(url.encode()).hexdigest()}'

    cached = await redis_client.get(cache_key)
    if cached:
        return cached

    image = await service.capture(url=url, **kwargs)
    await redis_client.setex(cache_key, ttl, image)
    return image
```

## Production Tips

### Rate Limiting

Use slowapi or a custom middleware to limit requests:

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.get('/screenshot')
@limiter.limit('20/minute')
async def screenshot(request, url: str):
    ...
```

### Health Check

Add a health check endpoint that verifies API connectivity:

```python
@app.get('/health')
async def health():
    return {'status': 'ok', 'service': 'screenshot-api'}
```

### Deployment

FastAPI with ScreenshotAPI deploys anywhere that runs Python. No Chromium, no system dependencies. Whether you use Docker, Fly.io, Railway, or a VPS, the integration is the same async HTTP call. Check the [pricing page](/pricing) for credit packages.

## Further Reading

- [How to Take Screenshots with Python](/blog/how-to-take-screenshots-with-python) covers the fundamentals of Python screenshot capture.
- The [Python SDK documentation](/docs/sdks/python) has the full parameter reference.
- See the [Django integration](/integrations/django) for a batteries-included alternative.
