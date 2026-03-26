---
title: "Screenshot API for Docker"
description: "Use ScreenshotAPI in Docker containers. Lightweight images, multi-stage builds, and container orchestration patterns for screenshot services."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Integrations
    href: /integrations
  - label: Docker
faq:
  - question: "Do I need to install Chrome in my Docker container?"
    answer: "No. ScreenshotAPI handles browser rendering remotely. Your container only needs your application code and an HTTP client. No Chromium, no system fonts, no display server."
  - question: "How small can my Docker image be with ScreenshotAPI?"
    answer: "Without headless Chrome, a Node.js screenshot service can fit in a 50 MB Alpine image. A Go service compiles to a scratch image under 20 MB. Compare that to 500+ MB with Chromium."
  - question: "How do I pass the API key to my container?"
    answer: "Use environment variables. Pass the key with docker run -e, docker-compose environment section, or Kubernetes secrets. Never bake the key into the image."
  - question: "Can I use ScreenshotAPI with Docker Compose for local development?"
    answer: "Yes. Add your screenshot service to docker-compose.yml with the API key as an environment variable. The service calls ScreenshotAPI over the internet, no additional containers needed."
relatedPages:
  - title: "AWS Lambda Integration"
    description: "Serverless screenshot deployment"
    href: "/integrations/aws-lambda"
  - title: "Google Cloud Functions"
    description: "GCP serverless screenshots"
    href: "/integrations/google-cloud-functions"
  - title: "Spring Boot Integration"
    description: "Java screenshot service in containers"
    href: "/integrations/spring-boot"
jsonLd:
  "@context": "https://schema.org"
  "@type": "TechArticle"
  headline: "Screenshot API for Docker"
  description: "Use ScreenshotAPI in Docker containers. Lightweight images, multi-stage builds, and container orchestration patterns for screenshot services."
  dateModified: "2026-03-25"
---

## Use ScreenshotAPI in Docker Containers

Running Puppeteer or Playwright inside Docker is one of the most common pain points in web development. You need a base image with Chromium and its system dependencies (libx11, libxss, fonts, dbus), which inflates images to 500 MB or more. Font rendering differs between Alpine and Debian. Memory usage spikes to 300+ MB per browser instance. And debugging Chrome crashes inside containers is nobody's idea of a good time.

ScreenshotAPI eliminates all of that for your **Docker screenshot** integration. Your container only needs your application code and an HTTP client. The resulting image is small, the resource footprint is minimal, and the behavior is identical across every environment.

## Quick Start

1. [Sign up for ScreenshotAPI](https://screenshotapi.to) and copy your API key. **5 free credits** are included.
2. Write a simple screenshot service in your preferred language.
3. Containerize it with a lightweight Docker image.

## Node.js Example

### Application Code

```javascript
// index.js
const API_BASE = 'https://screenshotapi.to/api/v1/screenshot';
const API_KEY = process.env.SCREENSHOTAPI_KEY;
const PORT = process.env.PORT || 3000;

const server = Bun.serve({
  port: PORT,
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname !== '/api/screenshot') {
      return new Response('Not Found', { status: 404 });
    }

    const targetUrl = url.searchParams.get('url');
    if (!targetUrl) {
      return Response.json({ error: 'url parameter is required' }, { status: 400 });
    }

    const params = new URLSearchParams({
      url: targetUrl,
      width: url.searchParams.get('width') ?? '1440',
      height: url.searchParams.get('height') ?? '900',
      type: url.searchParams.get('type') ?? 'webp',
      quality: url.searchParams.get('quality') ?? '80',
    });

    const response = await fetch(`${API_BASE}?${params}`, {
      headers: { 'x-api-key': API_KEY },
    });

    if (!response.ok) {
      return Response.json({ error: 'Screenshot capture failed' }, { status: 502 });
    }

    const imageType = url.searchParams.get('type') ?? 'webp';

    return new Response(await response.arrayBuffer(), {
      headers: {
        'Content-Type': `image/${imageType}`,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  },
});

console.log(`Screenshot service running on port ${PORT}`);
```

### Dockerfile

```dockerfile
FROM oven/bun:1-alpine AS base
WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile --production

COPY index.js .

ENV PORT=3000
EXPOSE 3000

USER bun
CMD ["bun", "run", "index.js"]
```

Build and run:

```bash
docker build -t screenshot-service .
docker run -p 3000:3000 -e SCREENSHOTAPI_KEY=sk_live_xxxxx screenshot-service
```

The image comes in under 100 MB. Compare that to 500+ MB when you bundle Chromium.

## Go Example

### Application Code

```go
// main.go
package main

import (
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"time"
)

var (
	apiBase = "https://screenshotapi.to/api/v1/screenshot"
	apiKey  = os.Getenv("SCREENSHOTAPI_KEY")
	client  = &http.Client{Timeout: 30 * time.Second}
)

func main() {
	http.HandleFunc("/api/screenshot", screenshotHandler)
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	fmt.Printf("Screenshot service running on port %s\n", port)
	http.ListenAndServe(":"+port, nil)
}

func screenshotHandler(w http.ResponseWriter, r *http.Request) {
	targetURL := r.URL.Query().Get("url")
	if targetURL == "" {
		http.Error(w, `{"error":"url parameter is required"}`, http.StatusBadRequest)
		return
	}

	params := url.Values{
		"url":     {targetURL},
		"width":   {getOrDefault(r, "width", "1440")},
		"height":  {getOrDefault(r, "height", "900")},
		"type":    {getOrDefault(r, "type", "webp")},
		"quality": {getOrDefault(r, "quality", "80")},
	}

	reqURL := fmt.Sprintf("%s?%s", apiBase, params.Encode())
	req, _ := http.NewRequestWithContext(r.Context(), http.MethodGet, reqURL, nil)
	req.Header.Set("x-api-key", apiKey)

	resp, err := client.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		http.Error(w, `{"error":"screenshot capture failed"}`, http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	imageType := getOrDefault(r, "type", "webp")
	w.Header().Set("Content-Type", fmt.Sprintf("image/%s", imageType))
	w.Header().Set("Cache-Control", "public, max-age=3600")
	io.Copy(w, resp.Body)
}

func getOrDefault(r *http.Request, key, fallback string) string {
	if v := r.URL.Query().Get(key); v != "" {
		return v
	}
	return fallback
}
```

### Multi-Stage Dockerfile

```dockerfile
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod main.go ./
RUN CGO_ENABLED=0 go build -ldflags="-s -w" -o screenshot-service .

FROM scratch
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /app/screenshot-service /screenshot-service
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["/screenshot-service"]
```

The final image is under 10 MB. No OS, no Chromium, just your binary and TLS certificates.

## Docker Compose

Run the service alongside your existing stack:

```yaml
# docker-compose.yml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - screenshot

  screenshot:
    build:
      context: ./screenshot-service
    ports:
      - "3001:3000"
    environment:
      - SCREENSHOTAPI_KEY=${SCREENSHOTAPI_KEY}
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000/health"]
      interval: 30s
      timeout: 5s
      retries: 3
```

## Kubernetes Deployment

Deploy the screenshot service to Kubernetes:

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: screenshot-service
spec:
  replicas: 2
  selector:
    matchLabels:
      app: screenshot-service
  template:
    metadata:
      labels:
        app: screenshot-service
    spec:
      containers:
        - name: screenshot
          image: your-registry/screenshot-service:latest
          ports:
            - containerPort: 3000
          env:
            - name: SCREENSHOTAPI_KEY
              valueFrom:
                secretKeyRef:
                  name: screenshot-secrets
                  key: api-key
          resources:
            requests:
              memory: "64Mi"
              cpu: "50m"
            limits:
              memory: "128Mi"
              cpu: "200m"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 30
```

Create the secret:

```bash
kubectl create secret generic screenshot-secrets \
  --from-literal=api-key=sk_live_xxxxx
```

Compare the resource requirements: a Puppeteer container typically needs 512 MB+ memory and significant CPU. This service runs comfortably at 64 MB.

## Image Size Comparison

| Approach | Image Size | Memory at Runtime |
|----------|-----------|-------------------|
| ScreenshotAPI + Node.js Alpine | ~80 MB | ~30 MB |
| ScreenshotAPI + Go scratch | ~10 MB | ~10 MB |
| Puppeteer + Chromium | ~500 MB | ~300 MB |
| Playwright + Chromium | ~450 MB | ~300 MB |

## Production Tips

### Never Bake Secrets into Images

Always pass the API key through environment variables, Docker secrets, or a secrets manager. Never include it in the Dockerfile or image layers.

### Health Checks

Add a `/health` endpoint to your service for container orchestrator probes. Keep it lightweight and do not call ScreenshotAPI on health checks.

### Graceful Shutdown

Handle SIGTERM to finish in-flight screenshot requests before the container stops. This prevents wasted credits on abandoned requests.

### Logging

Log screenshot requests with URL, response time, and image size. Use structured logging (JSON) for easy parsing in container log aggregation systems. Visit the [pricing page](/pricing) for credit tier details.

## Further Reading

- The [Spring Boot integration](/integrations/spring-boot) covers Java containerization patterns.
- See the [Go Gin integration](/integrations/gin) for the full Go framework setup.
- The [API documentation](/docs) has the full parameter reference for all endpoints.
