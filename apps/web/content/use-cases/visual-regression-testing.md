---
title: "Visual Regression Testing API"
description: "Catch UI bugs before they reach production. Use screenshot testing to compare visual changes across deployments automatically."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Use Cases
    href: /use-cases
  - label: Visual Regression Testing
faq:
  - question: "What is visual regression testing?"
    answer: "Visual regression testing automatically compares screenshots of your application before and after code changes to detect unintended UI differences. It catches layout shifts, broken styles, missing elements, and other visual bugs that unit tests and integration tests miss."
  - question: "How is this different from Playwright's built-in screenshot comparison?"
    answer: "Playwright's toHaveScreenshot() requires running a local or CI browser instance. ScreenshotAPI offloads the rendering to a managed service, which means no Chromium binaries in your CI pipeline, faster test runs, and consistent rendering across environments."
  - question: "Can I test responsive layouts across multiple viewports?"
    answer: "Yes. Call ScreenshotAPI with different width and height parameters to capture mobile (375x812), tablet (768x1024), and desktop (1440x900) viewports in a single test run."
  - question: "How do I handle dynamic content like dates or ads?"
    answer: "Use the waitForSelector parameter to wait for specific elements, and mask or crop dynamic regions in your comparison logic. Many teams use a dedicated test environment with fixed data to ensure consistent baselines."
relatedPages:
  - title: "Website Monitoring"
    description: "Monitor website appearance changes over time with scheduled screenshots."
    href: "/use-cases/website-monitoring"
  - title: "ScreenshotAPI vs Puppeteer"
    description: "Compare managed screenshot APIs to self-hosted Puppeteer."
    href: "/compare/screenshotapi-vs-puppeteer"
  - title: "Next.js Integration"
    description: "Integrate ScreenshotAPI into your Next.js CI/CD pipeline."
    href: "/integrations/nextjs"
  - title: "Reporting & Dashboards"
    description: "Generate automated reports with screenshot evidence."
    href: "/use-cases/reporting"
jsonLd:
  "@context": "https://schema.org"
  "@type": "Article"
  headline: "Visual Regression Testing API"
  description: "Catch UI bugs before they reach production. Use screenshot testing to compare visual changes across deployments automatically."
  dateModified: "2026-03-25"
---

## The Problem: UI Bugs Slip Through Testing

Your unit tests pass. Your integration tests are green. You merge the pull request, deploy to production, and then a customer reports that the checkout button is hidden behind the footer on mobile. Sound familiar?

Traditional testing catches logic bugs, but it is blind to visual regressions. A CSS change that shifts an element by 20 pixels, a font that fails to load, a z-index conflict that buries a call-to-action: these bugs are invisible to `assert` statements. They require eyes, and at scale, those eyes need to be automated.

**Visual regression testing** solves this by comparing screenshots of your UI before and after each change. If the screenshots differ beyond an acceptable threshold, the test fails, and someone reviews the visual diff before the code ships. The challenge is that running headless browsers in CI is painful. Chromium eats memory, rendering is inconsistent across environments, and maintaining browser infrastructure is a job in itself.

## How ScreenshotAPI Enables Screenshot Testing

ScreenshotAPI handles the hard part: rendering pages in a managed Chromium environment and returning consistent, high-quality screenshots. You focus on the comparison logic.

The workflow integrates into any CI/CD pipeline:

1. **Capture baseline**: On your main branch, call ScreenshotAPI for each critical page and store the screenshots as baseline images.
2. **Capture candidate**: On the pull request branch (deployed to a preview environment), call ScreenshotAPI for the same pages.
3. **Compare**: Use a pixel-diff library (pixelmatch, looks-same, PIL) to compare baseline and candidate screenshots.
4. **Report**: If differences exceed your threshold, fail the build and attach the visual diff to the PR.

### Why use a managed API for screenshot testing?

- **No browser in CI**: No Chromium installation, no `apt-get` dependencies, no flaky xvfb sessions.
- **Consistent rendering**: Every screenshot is captured in the same environment, eliminating "it looks different on CI" issues.
- **Parallel captures**: Fire off all screenshot requests concurrently instead of waiting for sequential browser navigations.
- **Multiple viewports**: Test desktop, tablet, and mobile with different `width` and `height` parameters in the same API call set.

## Implementation Guide

### Basic Visual Regression Test

#### JavaScript (Node.js with pixelmatch)

```javascript
const axios = require("axios");
const fs = require("fs");
const { PNG } = require("pngjs");
const pixelmatch = require("pixelmatch");

const API_KEY = process.env.SCREENSHOT_API_KEY;
const API_URL = "https://screenshotapi.to/api/v1/screenshot";

async function captureScreenshot(url, viewport = { width: 1440, height: 900 }) {
  const response = await axios.get(API_URL, {
    params: {
      url,
      width: viewport.width,
      height: viewport.height,
      type: "png",
      waitUntil: "networkidle",
    },
    headers: { "x-api-key": API_KEY },
    responseType: "arraybuffer",
  });
  return Buffer.from(response.data);
}

function compareImages(baselineBuffer, candidateBuffer) {
  const baseline = PNG.sync.read(baselineBuffer);
  const candidate = PNG.sync.read(candidateBuffer);
  const { width, height } = baseline;
  const diff = new PNG({ width, height });

  const mismatchedPixels = pixelmatch(
    baseline.data,
    candidate.data,
    diff.data,
    width,
    height,
    { threshold: 0.1 }
  );

  const totalPixels = width * height;
  const diffPercentage = (mismatchedPixels / totalPixels) * 100;

  return {
    mismatchedPixels,
    diffPercentage,
    diffImage: PNG.sync.write(diff),
  };
}

async function runVisualTest(baselineUrl, candidateUrl, pageName) {
  console.log(`Testing: ${pageName}`);

  const [baseline, candidate] = await Promise.all([
    captureScreenshot(baselineUrl),
    captureScreenshot(candidateUrl),
  ]);

  const result = compareImages(baseline, candidate);

  if (result.diffPercentage > 0.5) {
    fs.writeFileSync(`diff-${pageName}.png`, result.diffImage);
    console.error(
      `FAIL: ${pageName} has ${result.diffPercentage.toFixed(2)}% visual difference`
    );
    return false;
  }

  console.log(`PASS: ${pageName} (${result.diffPercentage.toFixed(2)}% diff)`);
  return true;
}
```

#### Python (with Pillow)

```python
import io
import os
import httpx
from PIL import Image, ImageChops
import numpy as np

API_KEY = os.environ["SCREENSHOT_API_KEY"]
API_URL = "https://screenshotapi.to/api/v1/screenshot"

def capture_screenshot(url: str, width: int = 1440, height: int = 900) -> bytes:
    response = httpx.get(
        API_URL,
        params={
            "url": url,
            "width": width,
            "height": height,
            "type": "png",
            "waitUntil": "networkidle",
        },
        headers={"x-api-key": API_KEY},
    )
    response.raise_for_status()
    return response.content

def compare_images(baseline_bytes: bytes, candidate_bytes: bytes) -> dict:
    baseline = Image.open(io.BytesIO(baseline_bytes)).convert("RGB")
    candidate = Image.open(io.BytesIO(candidate_bytes)).convert("RGB")

    diff = ImageChops.difference(baseline, candidate)
    diff_array = np.array(diff)
    changed_pixels = np.count_nonzero(diff_array.sum(axis=2))
    total_pixels = diff_array.shape[0] * diff_array.shape[1]
    diff_percentage = (changed_pixels / total_pixels) * 100

    return {
        "changed_pixels": int(changed_pixels),
        "diff_percentage": round(diff_percentage, 2),
        "diff_image": diff,
    }

def run_visual_test(baseline_url: str, candidate_url: str, threshold: float = 0.5) -> bool:
    baseline = capture_screenshot(baseline_url)
    candidate = capture_screenshot(candidate_url)
    result = compare_images(baseline, candidate)

    if result["diff_percentage"] > threshold:
        result["diff_image"].save("visual-diff.png")
        print(f"FAIL: {result['diff_percentage']}% difference detected")
        return False

    print(f"PASS: {result['diff_percentage']}% difference (within threshold)")
    return True
```

### CI/CD Integration (GitHub Actions)

Here is a GitHub Actions workflow that runs visual regression tests on every pull request:

```yaml
name: Visual Regression Tests
on:
  pull_request:
    branches: [main]

jobs:
  visual-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run visual regression tests
        env:
          SCREENSHOT_API_KEY: ${{ secrets.SCREENSHOT_API_KEY }}
          BASELINE_URL: https://main.yourapp.com
          CANDIDATE_URL: ${{ github.event.pull_request.head.ref }}.yourapp.com
        run: |
          pip install httpx pillow numpy
          python visual_test.py

      - name: Upload diff images
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: visual-diffs
          path: "*.png"
```

### Multi-Viewport Testing

Test critical pages across device sizes by looping through viewport configurations:

```javascript
const viewports = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

const pages = [
  { name: "homepage", path: "/" },
  { name: "pricing", path: "/pricing" },
  { name: "checkout", path: "/checkout" },
];

async function runAllTests(baseUrl, candidateBaseUrl) {
  const results = [];

  for (const page of pages) {
    for (const viewport of viewports) {
      const passed = await runVisualTest(
        `${baseUrl}${page.path}`,
        `${candidateBaseUrl}${page.path}`,
        `${page.name}-${viewport.name}`
      );
      results.push({ page: page.name, viewport: viewport.name, passed });
    }
  }

  const failures = results.filter((r) => !r.passed);
  if (failures.length > 0) {
    console.error(`${failures.length} visual regression(s) detected`);
    process.exit(1);
  }
}
```

## Advanced Patterns

### Selective Region Comparison

Not every pixel difference matters. Cookie banners, timestamps, and ad slots create noise. Crop your screenshots to focus on the areas that matter:

```javascript
const sharp = require("sharp");

async function captureRegion(url, region) {
  const fullScreenshot = await captureScreenshot(url);
  return sharp(fullScreenshot)
    .extract({
      left: region.x,
      top: region.y,
      width: region.width,
      height: region.height,
    })
    .toBuffer();
}
```

### Full-Page Screenshots

For pages with scrollable content, use the `fullPage` parameter to capture everything below the fold:

```javascript
params: {
  url: pageUrl,
  width: 1440,
  fullPage: true,
  type: "png",
  waitUntil: "networkidle",
}
```

## Pricing Estimate

Visual regression testing credit usage depends on the number of pages, viewports, and PR frequency:

| Scenario | Pages x Viewports x PRs/Month | Credits/Month | Recommended Plan |
|---|---|---|---|
| Small project (5 pages, 2 viewports, 20 PRs) | 200 | 200 | Starter (500 credits, $20) |
| Medium project (15 pages, 3 viewports, 40 PRs) | 1,800 | 1,800 | Growth (2,000 credits, $60) |
| Large project (50 pages, 3 viewports, 60 PRs) | 9,000 | 9,000 | Pro (10,000 credits, $200) |

Each screenshot uses one credit. Baseline captures and candidate captures both count, so multiply your page count by 2 for each PR. Visit the [pricing page](/pricing) for more details.

## Visual Regression Testing Compared to Alternatives

| Tool | Browser Management | CI Complexity | Cost | Multi-viewport |
|---|---|---|---|---|
| Playwright screenshots | Self-managed | High | Free (compute) | Manual setup |
| Percy / Chromatic | Managed | Medium | $300+/month | Built-in |
| Puppeteer + pixelmatch | Self-managed | High | Server costs | Manual setup |
| **ScreenshotAPI + pixelmatch** | **Managed** | **Low** | **Pay per screenshot** | **API parameter** |

For teams that want the reliability of managed rendering without the cost of enterprise visual testing platforms, ScreenshotAPI provides the screenshot capture layer while you own the comparison logic. See our [ScreenshotAPI vs Puppeteer comparison](/compare/screenshotapi-vs-puppeteer) for a detailed breakdown.

## Getting Started

1. [Sign up](https://screenshotapi.to) for 5 free credits to test the workflow.
2. Capture baseline screenshots of your critical pages.
3. Integrate the comparison script into your CI pipeline.
4. Set your diff threshold (0.1% to 1% is typical for most teams).
5. Review visual diffs on every pull request before merging.

Read the [API documentation](/docs) for the full parameter reference.
