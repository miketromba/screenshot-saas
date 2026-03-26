---
title: "Automated Report Screenshots"
description: "Capture dashboard screenshots automatically and deliver visual reports to stakeholders via email, Slack, or PDF. No login required."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Use Cases
    href: /use-cases
  - label: Reporting
faq:
  - question: "Can I capture dashboards that require authentication?"
    answer: "ScreenshotAPI captures publicly accessible URLs. For authenticated dashboards, generate a temporary public share link (most BI tools support this) or render the dashboard data on a private reporting endpoint accessible to the API."
  - question: "How do I ensure charts are fully rendered before capture?"
    answer: "Use waitUntil: networkidle to wait for all network requests (including chart data fetches) to complete. For complex dashboards, combine this with waitForSelector to wait for a specific chart element or loading indicator to disappear."
  - question: "Can I schedule reports to run automatically?"
    answer: "Yes. Use a cron job, GitHub Actions schedule, or a cloud function timer to call ScreenshotAPI at your desired interval (daily, weekly, monthly) and deliver the resulting images via email or Slack."
  - question: "What resolution should I use for report screenshots?"
    answer: "For email reports, 1440x900 provides a good balance of detail and file size. For PDF reports, use 1920px or wider for higher-quality output. For Slack thumbnails, 1200x630 works well."
  - question: "Can I capture multiple dashboard views in a single report?"
    answer: "Yes. Make separate API calls for each dashboard view or tab, then combine the images into a single email, PDF, or Slack message. Each screenshot uses one credit."
relatedPages:
  - title: "PDF Generation"
    description: "Convert dashboard screenshots into PDF reports."
    href: "/use-cases/pdf-generation"
  - title: "Website Monitoring"
    description: "Monitor website visual changes with scheduled screenshots."
    href: "/use-cases/website-monitoring"
  - title: "Visual Regression Testing"
    description: "Compare dashboard layouts across deployments."
    href: "/use-cases/visual-regression-testing"
jsonLd:
  "@context": "https://schema.org"
  "@type": "Article"  
  headline: "Automated Report Screenshots"
  description: "Capture dashboard screenshots automatically and deliver visual reports to stakeholders via email, Slack, or PDF. No login required."
  dateModified: "2026-03-25"
---

## The Problem with Dashboard Reporting

Every organization has dashboards. Grafana for infrastructure, Amplitude for product analytics, Tableau for business intelligence, custom-built admin panels for everything else. The data is there, but getting it in front of the people who need it is the bottleneck.

Stakeholders, executives, and cross-functional partners do not log into dashboards. They want the numbers delivered to them: in their inbox, in Slack, or in a PDF attached to a meeting agenda. The manual process of screenshotting dashboards, pasting them into emails or slides, and sending them out is tedious, error-prone, and does not scale.

What teams need is an **automated report screenshots** pipeline: a system that captures the current state of their dashboards and delivers the visual report on a schedule, with zero manual effort.

## How ScreenshotAPI Automates Dashboard Reports

ScreenshotAPI captures any URL as a high-quality screenshot. For **dashboard screenshot** automation, you point the API at your dashboard URLs, capture the current state, and deliver the images through your preferred channel.

The pipeline has four steps:

1. **Configure**: List the dashboard URLs and the recipients for each report.
2. **Capture**: Call ScreenshotAPI for each dashboard view.
3. **Format**: Combine screenshots into an email, PDF, or Slack message.
4. **Deliver**: Send the report on a schedule (daily, weekly, monthly).

### Why screenshots for reports?

- **No login required**: Recipients see the data without navigating to the tool.
- **Point-in-time accuracy**: The screenshot captures exactly what the dashboard showed at that moment.
- **Universal format**: Images work in email, Slack, PDF, and presentations.
- **Tool-agnostic**: Works with Grafana, Tableau, Metabase, Amplitude, Looker, or any custom dashboard.

## Implementation Guide

### Daily Dashboard Email Report

#### JavaScript (with Nodemailer)

```javascript
const axios = require("axios");
const nodemailer = require("nodemailer");

const API_KEY = process.env.SCREENSHOT_API_KEY;

const DASHBOARDS = [
  { name: "Revenue Overview", url: "https://dashboard.yourapp.com/revenue?share=abc123" },
  { name: "User Metrics", url: "https://dashboard.yourapp.com/users?share=def456" },
  { name: "Infrastructure", url: "https://grafana.yourapp.com/d/abc/overview?orgId=1&kiosk" },
];

async function captureDashboard(dashboard) {
  const response = await axios.get("https://screenshotapi.to/api/v1/screenshot", {
    params: {
      url: dashboard.url,
      width: 1440,
      height: 900,
      type: "png",
      waitUntil: "networkidle",
      delay: 3000,
    },
    headers: { "x-api-key": API_KEY },
    responseType: "arraybuffer",
  });

  return {
    name: dashboard.name,
    buffer: Buffer.from(response.data),
    cid: dashboard.name.toLowerCase().replace(/\s+/g, "-"),
  };
}

async function sendDailyReport(recipients) {
  const captures = await Promise.all(DASHBOARDS.map(captureDashboard));

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const imagesHtml = captures
    .map((c) => `<h2>${c.name}</h2><img src="cid:${c.cid}" style="max-width:100%;border:1px solid #e5e7eb;border-radius:8px;" />`)
    .join("\n");

  await transporter.sendMail({
    from: "reports@yourapp.com",
    to: recipients.join(", "),
    subject: `Daily Dashboard Report - ${today}`,
    html: `
      <h1>Daily Dashboard Report</h1>
      <p>Generated on ${today}</p>
      ${imagesHtml}
      <p style="color:#6b7280;font-size:14px;">This report was generated automatically by ScreenshotAPI.</p>
    `,
    attachments: captures.map((c) => ({
      filename: `${c.cid}.png`,
      content: c.buffer,
      cid: c.cid,
    })),
  });
}

sendDailyReport(["ceo@yourapp.com", "vp-eng@yourapp.com"]);
```

#### Python (with smtplib)

```python
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from datetime import datetime
import httpx

API_KEY = os.environ["SCREENSHOT_API_KEY"]

DASHBOARDS = [
    {"name": "Revenue Overview", "url": "https://dashboard.yourapp.com/revenue?share=abc123"},
    {"name": "User Metrics", "url": "https://dashboard.yourapp.com/users?share=def456"},
    {"name": "Infrastructure", "url": "https://grafana.yourapp.com/d/abc/overview?kiosk"},
]

def capture_dashboard(dashboard: dict) -> dict:
    response = httpx.get(
        "https://screenshotapi.to/api/v1/screenshot",
        params={
            "url": dashboard["url"],
            "width": 1440,
            "height": 900,
            "type": "png",
            "waitUntil": "networkidle",
            "delay": 3000,
        },
        headers={"x-api-key": API_KEY},
    )
    response.raise_for_status()

    cid = dashboard["name"].lower().replace(" ", "-")
    return {"name": dashboard["name"], "content": response.content, "cid": cid}

def send_daily_report(recipients: list[str]):
    captures = [capture_dashboard(d) for d in DASHBOARDS]
    today = datetime.now().strftime("%A, %B %d, %Y")

    msg = MIMEMultipart("related")
    msg["Subject"] = f"Daily Dashboard Report - {today}"
    msg["From"] = "reports@yourapp.com"
    msg["To"] = ", ".join(recipients)

    images_html = "\n".join(
        f'<h2>{c["name"]}</h2><img src="cid:{c["cid"]}" style="max-width:100%;" />'
        for c in captures
    )

    html = MIMEText(
        f"<h1>Daily Dashboard Report</h1><p>{today}</p>{images_html}",
        "html",
    )
    msg.attach(html)

    for capture in captures:
        img = MIMEImage(capture["content"], "png")
        img.add_header("Content-ID", f"<{capture['cid']}>")
        msg.attach(img)

    with smtplib.SMTP(os.environ["SMTP_HOST"], 587) as server:
        server.starttls()
        server.login(os.environ["SMTP_USER"], os.environ["SMTP_PASS"])
        server.send_message(msg)

send_daily_report(["ceo@yourapp.com", "vp-eng@yourapp.com"])
```

### Slack Report Delivery

Send dashboard screenshots directly to a Slack channel:

```javascript
const { WebClient } = require("@slack/web-api");
const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

async function sendSlackReport(channelId) {
  const captures = await Promise.all(DASHBOARDS.map(captureDashboard));

  for (const capture of captures) {
    await slack.files.uploadV2({
      channel_id: channelId,
      file: capture.buffer,
      filename: `${capture.cid}.png`,
      title: capture.name,
      initial_comment: `📊 ${capture.name} - ${new Date().toLocaleDateString()}`,
    });
  }
}
```

### PDF Report Generation

Combine multiple dashboard screenshots into a single PDF for email attachment or archiving:

```javascript
const { PDFDocument } = require("pdf-lib");

async function generatePdfReport() {
  const captures = await Promise.all(DASHBOARDS.map(captureDashboard));
  const pdfDoc = await PDFDocument.create();

  for (const capture of captures) {
    const pngImage = await pdfDoc.embedPng(capture.buffer);
    const pageWidth = 842; // A4 landscape width
    const pageHeight = 595; // A4 landscape height
    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    const scale = Math.min(
      (pageWidth - 40) / pngImage.width,
      (pageHeight - 60) / pngImage.height
    );

    page.drawImage(pngImage, {
      x: 20,
      y: pageHeight - pngImage.height * scale - 40,
      width: pngImage.width * scale,
      height: pngImage.height * scale,
    });
  }

  return pdfDoc.save();
}
```

See the [PDF generation use case](/use-cases/pdf-generation) for more advanced PDF patterns.

## Dashboard-Specific Tips

### Grafana

Use Grafana's kiosk mode to hide navigation and focus on panels:

```javascript
params: {
  url: "https://grafana.yourapp.com/d/abc/overview?orgId=1&kiosk",
  width: 1920,
  height: 1080,
  waitUntil: "networkidle",
  delay: 5000, // Grafana panels can take time to load
}
```

### Tableau

Use Tableau's embed URL format for clean captures:

```javascript
params: {
  url: "https://public.tableau.com/views/YourDashboard?:embed=y&:display_count=no",
  width: 1440,
  height: 900,
  waitUntil: "networkidle",
  delay: 5000,
}
```

### Custom Dashboards

For internal dashboards built with React/Vue and charting libraries (Chart.js, D3, Recharts), use `waitForSelector` to ensure all charts are rendered:

```javascript
params: {
  url: dashboardUrl,
  waitForSelector: "[data-charts-loaded='true']",
  waitUntil: "networkidle",
}
```

### Dark Mode for Reports

Some dashboards look better in light mode for email reports. Use the `colorScheme` parameter:

```javascript
params: {
  url: dashboardUrl,
  colorScheme: "light",
}
```

## Scheduling Patterns

### Cron-Based (Linux/macOS)

```bash
# Daily at 8 AM
0 8 * * * cd /path/to/reporter && node send-report.js

# Weekly on Monday at 9 AM
0 9 * * 1 cd /path/to/reporter && python send_report.py

# Monthly on the 1st at 7 AM
0 7 1 * * cd /path/to/reporter && node send-monthly-report.js
```

### GitHub Actions

```yaml
name: Weekly Report
on:
  schedule:
    - cron: "0 9 * * 1" # Monday at 9 AM UTC
  workflow_dispatch:

jobs:
  report:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Generate and send report
        env:
          SCREENSHOT_API_KEY: ${{ secrets.SCREENSHOT_API_KEY }}
          SMTP_HOST: ${{ secrets.SMTP_HOST }}
          SMTP_USER: ${{ secrets.SMTP_USER }}
          SMTP_PASS: ${{ secrets.SMTP_PASS }}
        run: |
          npm install axios nodemailer pdf-lib
          node send-report.js
```

## Pricing Estimate

| Scenario | Dashboards | Frequency | Credits/Month | Recommended Plan |
|---|---|---|---|---|
| Weekly exec summary (3 views) | 3 | 4x/month | 12 | Free tier + Starter |
| Daily team report (5 views) | 5 | 30x/month | 150 | Starter (500 credits, $20) |
| Daily multi-team (15 views) | 15 | 30x/month | 450 | Starter (500 credits, $20) |
| Hourly ops dashboards (10 views) | 10 | 720x/month | 7,200 | Pro (10,000 credits, $200) |

Each dashboard capture uses one credit. Credits never expire. Visit the [pricing page](/pricing) for all plan options.

## Automated Reports vs. Manual Process

| Aspect | Manual Screenshots | ScreenshotAPI Automation |
|---|---|---|
| Time per report | 15-30 minutes | 0 (automated) |
| Consistency | Varies by person | Identical every time |
| Scheduling | Relies on memory | Cron / Actions |
| Stakeholder coverage | Often missed | Always delivered |
| Historical archive | Rarely saved | Every capture stored |

For teams building their own **dashboard screenshot API** integration, ScreenshotAPI provides the reliable capture layer while you control formatting, delivery, and scheduling. Check the [website monitoring use case](/use-cases/website-monitoring) for a related change-detection pattern, or explore the [visual regression testing guide](/use-cases/visual-regression-testing) for CI/CD integration.

## Getting Started

1. [Sign up](https://screenshotapi.to) for 5 free credits.
2. Identify 2-3 dashboards your team checks most often.
3. Get shareable or kiosk-mode URLs for those dashboards.
4. Build the capture and email pipeline from the examples above.
5. Schedule it and stop manually screenshotting dashboards forever.

Read the [API documentation](/docs) for the full parameter reference.
