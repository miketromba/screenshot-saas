---
title: "URL to PDF API"
description: "Convert any website or URL to a high-quality PDF with a single API call. Render JavaScript-heavy pages accurately."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Use Cases
    href: /use-cases
  - label: PDF Generation
faq:
  - question: "Can ScreenshotAPI convert a full webpage to PDF?"
    answer: "ScreenshotAPI captures pixel-perfect screenshots of any URL as PNG, JPEG, or WebP images. For PDF conversion, you can capture a full-page screenshot and embed it in a PDF using a library like pdf-lib (JavaScript) or ReportLab (Python). This approach ensures the output looks exactly like the rendered page."
  - question: "How do I handle pages that require scrolling?"
    answer: "Use the fullPage parameter to capture the entire scrollable page in a single screenshot. This captures everything below the fold, which you can then convert into a multi-page PDF or a single long-page PDF."
  - question: "What about JavaScript-rendered content?"
    answer: "ScreenshotAPI uses a full Chromium browser for rendering. Set waitUntil to networkidle to ensure all JavaScript, AJAX calls, and dynamic content finish loading before capture. You can also use waitForSelector to wait for a specific element."
  - question: "Can I convert authenticated pages?"
    answer: "ScreenshotAPI captures publicly accessible URLs. For authenticated content, consider generating a temporary public URL or rendering the content on a private endpoint accessible by the API."
  - question: "What resolution do the PDFs have?"
    answer: "The resolution matches your specified viewport width and height. For print-quality output, capture at 1920px or wider and scale the image to fit standard paper sizes (A4, Letter) in your PDF generation step."
relatedPages:
  - title: "Reporting & Dashboards"
    description: "Generate automated PDF reports from dashboard screenshots."
    href: "/use-cases/reporting"
  - title: "Archiving"
    description: "Archive website snapshots as visual records."
    href: "/use-cases/archiving"
  - title: "ScreenshotAPI vs Puppeteer"
    description: "Compare managed APIs to running Puppeteer for PDF generation."
    href: "/compare/screenshotapi-vs-puppeteer"
jsonLd:
  "@context": "https://schema.org"
  "@type": "Article"
  headline: "URL to PDF API"
  description: "Convert any website or URL to a high-quality PDF with a single API call. Render JavaScript-heavy pages accurately."
  dateModified: "2026-03-25"
---

## The Problem with Converting Websites to PDF

Converting a URL to a PDF sounds simple until you actually try to do it reliably. Basic HTML-to-PDF converters choke on modern websites. They miss JavaScript-rendered content, break CSS Grid and Flexbox layouts, ignore web fonts, and produce output that looks nothing like the original page. Services like wkhtmltopdf use an ancient WebKit engine that cannot handle contemporary web standards.

The alternative is running a headless Chromium instance with Puppeteer or Playwright and calling `page.pdf()`. This works, but it means managing browser binaries, handling memory leaks, configuring sandboxing, and scaling infrastructure. For teams that need **URL to PDF** conversion as a feature rather than a core product, this overhead is hard to justify.

What you need is a **website to PDF** pipeline that renders pages accurately in a real browser, without requiring you to operate that browser yourself.

## How ScreenshotAPI Enables PDF Generation

ScreenshotAPI captures pixel-perfect full-page screenshots using a managed Chromium browser. Combined with a lightweight PDF library, this gives you a reliable URL to PDF pipeline:

1. Call ScreenshotAPI with `fullPage: true` to capture the entire page.
2. Wrap the resulting image in a PDF document using pdf-lib, ReportLab, or similar.
3. Return or store the PDF.

This approach guarantees visual fidelity because the screenshot is an exact representation of what the browser rendered. CSS Grid, Flexbox, animations frozen at capture time, web fonts, SVGs: everything looks exactly as a user would see it.

### Advantages over traditional HTML-to-PDF

- **Accurate rendering**: A real Chromium browser handles all modern CSS and JavaScript.
- **No infrastructure**: No Puppeteer instances, no Docker containers, no memory tuning.
- **Consistent output**: Same rendering engine for every conversion, every time.
- **JavaScript support**: SPAs, charts rendered by D3/Chart.js, and dynamic content all capture correctly.

## Implementation Guide

### Full-Page Screenshot to PDF

#### JavaScript (with pdf-lib)

```javascript
const axios = require("axios");
const { PDFDocument } = require("pdf-lib");
const fs = require("fs");

const API_KEY = process.env.SCREENSHOT_API_KEY;

async function urlToPdf(url) {
  // Step 1: Capture full-page screenshot
  const response = await axios.get("https://screenshotapi.to/api/v1/screenshot", {
    params: {
      url,
      width: 1440,
      fullPage: true,
      type: "png",
      waitUntil: "networkidle",
    },
    headers: { "x-api-key": API_KEY },
    responseType: "arraybuffer",
  });

  const imageBytes = response.data;

  // Step 2: Create PDF and embed the screenshot
  const pdfDoc = await PDFDocument.create();
  const pngImage = await pdfDoc.embedPng(imageBytes);

  const pageWidth = 595.28; // A4 width in points
  const scale = pageWidth / pngImage.width;
  const scaledHeight = pngImage.height * scale;

  // Split into A4-sized pages if the image is taller than one page
  const pageHeight = 841.89; // A4 height in points
  let yOffset = 0;

  while (yOffset < scaledHeight) {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);
    const remainingHeight = scaledHeight - yOffset;
    const drawHeight = Math.min(remainingHeight, pageHeight);

    page.drawImage(pngImage, {
      x: 0,
      y: pageHeight - drawHeight,
      width: pageWidth,
      height: scaledHeight,
    });

    yOffset += pageHeight;
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync("output.pdf", pdfBytes);
  return pdfBytes;
}

urlToPdf("https://example.com/report");
```

#### Python (with ReportLab)

```python
import os
import io
import httpx
from PIL import Image
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

API_KEY = os.environ["SCREENSHOT_API_KEY"]

def url_to_pdf(url: str, output_path: str = "output.pdf") -> bytes:
    # Step 1: Capture full-page screenshot
    response = httpx.get(
        "https://screenshotapi.to/api/v1/screenshot",
        params={
            "url": url,
            "width": 1440,
            "fullPage": True,
            "type": "png",
            "waitUntil": "networkidle",
        },
        headers={"x-api-key": API_KEY},
    )
    response.raise_for_status()

    # Step 2: Convert screenshot to PDF
    img = Image.open(io.BytesIO(response.content))
    img_width, img_height = img.size

    page_width, page_height = A4
    scale = page_width / img_width
    scaled_height = img_height * scale

    c = canvas.Canvas(output_path, pagesize=(page_width, max(scaled_height, page_height)))

    img_path = "/tmp/screenshot.png"
    img.save(img_path)
    c.drawImage(img_path, 0, max(0, page_height - scaled_height),
                width=page_width, height=scaled_height)
    c.save()

    with open(output_path, "rb") as f:
        return f.read()

url_to_pdf("https://example.com/report")
```

### Batch URL to PDF Conversion

For converting multiple URLs (e.g., generating a multi-page report), capture each page and combine them into a single PDF:

```javascript
const axios = require("axios");
const { PDFDocument } = require("pdf-lib");

async function batchUrlsToPdf(urls) {
  const mergedPdf = await PDFDocument.create();

  for (const url of urls) {
    const response = await axios.get("https://screenshotapi.to/api/v1/screenshot", {
      params: {
        url,
        width: 1440,
        height: 900,
        type: "png",
        waitUntil: "networkidle",
      },
      headers: { "x-api-key": process.env.SCREENSHOT_API_KEY },
      responseType: "arraybuffer",
    });

    const pngImage = await mergedPdf.embedPng(response.data);
    const page = mergedPdf.addPage([595.28, 841.89]);

    const scale = 595.28 / pngImage.width;
    page.drawImage(pngImage, {
      x: 0,
      y: 841.89 - pngImage.height * scale,
      width: 595.28,
      height: pngImage.height * scale,
    });
  }

  return mergedPdf.save();
}

batchUrlsToPdf([
  "https://example.com/page-1",
  "https://example.com/page-2",
  "https://example.com/page-3",
]);
```

## Advanced Techniques

### Waiting for Charts and Visualizations

Dashboard pages with Chart.js, D3, or Recharts need time to render their visualizations. Use `waitForSelector` to wait for a specific chart element:

```javascript
params: {
  url: dashboardUrl,
  waitForSelector: ".chart-rendered",
  waitUntil: "networkidle",
  fullPage: true,
}
```

### Capturing at Print-Quality Resolution

For high-DPI output suitable for printing, capture at a wider viewport and let the PDF library scale it down:

```javascript
params: {
  url: targetUrl,
  width: 2880, // 2x A4 width for retina-quality output
  fullPage: true,
  type: "png",
}
```

### Light Mode for Print

Force light mode for cleaner print output, since dark backgrounds waste ink and reduce readability:

```javascript
params: {
  url: targetUrl,
  colorScheme: "light",
  fullPage: true,
}
```

## Use Cases for URL to PDF Conversion

### Invoice and Receipt Generation

Render an invoice template as a web page, then capture it as a PDF. This lets your design team use HTML/CSS for invoice layout instead of wrestling with PDF generation libraries.

### Documentation Export

Let users export documentation pages or help articles as PDFs. Capture the rendered page with all its formatting, code blocks, and diagrams intact.

### Report Distribution

Generate PDF reports from dashboards and analytics pages for stakeholders who prefer email attachments over logging into a tool. See the [reporting use case](/use-cases/reporting) for detailed implementation patterns.

### Legal and Compliance Archives

Capture web pages as PDFs for legal evidence or compliance records. The [archiving use case](/use-cases/archiving) covers this pattern in depth.

## Pricing Estimate

| Scenario | PDFs/Month | Credits Used | Recommended Plan |
|---|---|---|---|
| Invoice generation (small business) | 50-200 | 50-200 | Starter (500 credits, $20) |
| Documentation export | 200-500 | 200-500 | Starter (500 credits, $20) |
| Report distribution | 500-2,000 | 500-2,000 | Growth (2,000 credits, $60) |
| Bulk archiving | 2,000-10,000 | 2,000-10,000 | Pro (10,000 credits, $200) |

Each full-page capture uses one credit, regardless of page length. Credits never expire. Visit the [pricing page](/pricing) for details.

## URL to PDF API Compared to Alternatives

| Approach | JS Rendering | CSS Fidelity | Infrastructure | Cost |
|---|---|---|---|---|
| wkhtmltopdf | None | Poor | Self-hosted | Free |
| Puppeteer page.pdf() | Full | High | Self-hosted | Server costs |
| PDFmyURL / CloudConvert | Full | High | Managed | Subscription |
| **ScreenshotAPI + pdf-lib** | **Full** | **Exact** | **Managed** | **Per credit** |

For teams already using Puppeteer, see our [ScreenshotAPI vs Puppeteer comparison](/compare/screenshotapi-vs-puppeteer) to understand the trade-offs.

## Getting Started

1. [Sign up](https://screenshotapi.to) for 5 free credits.
2. Test a full-page capture using the [API playground](/docs).
3. Integrate the screenshot-to-PDF pipeline from the examples above.
4. Add PDF generation as a feature in your application.

Read the [API documentation](/docs) for the full parameter reference.
