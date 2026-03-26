---
title: "Screenshot API for Bitbucket Pipelines"
description: "Automate website screenshots in Bitbucket Pipelines with ScreenshotAPI. Visual testing, deploy evidence, and CI screenshot workflows."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Integrations
    href: /integrations
  - label: Bitbucket Pipelines
faq:
  - question: "Do I need Chrome installed on Bitbucket Pipelines?"
    answer: "No. ScreenshotAPI handles browser rendering remotely. Your pipeline step uses curl or a lightweight script to make HTTP requests. No Chromium installation needed."
  - question: "How do I store the API key in Bitbucket Pipelines?"
    answer: "Add it as a repository variable in Settings > Repository variables. Mark it as Secured so it is masked in pipeline logs."
  - question: "Can I capture screenshots of Bitbucket preview environments?"
    answer: "Yes. Pass the preview deployment URL to ScreenshotAPI in your pipeline step. This works with any hosting provider that creates preview URLs for branches or pull requests."
  - question: "How do I download screenshots from a Bitbucket Pipeline?"
    answer: "Configure the step with an artifacts section. After the pipeline completes, download the screenshots from the Artifacts tab in the pipeline results page."
relatedPages:
  - title: "GitHub Actions Integration"
    description: "Screenshot automation with GitHub Actions"
    href: "/integrations/github-actions"
  - title: "GitLab CI Integration"
    description: "Screenshots in GitLab pipelines"
    href: "/integrations/gitlab-ci"
  - title: "Visual Regression Testing"
    description: "Catch UI bugs with automated comparisons"
    href: "/use-cases/visual-regression-testing"
jsonLd:
  "@context": "https://schema.org"
  "@type": "TechArticle"
  headline: "Screenshot API for Bitbucket Pipelines"
  description: "Automate website screenshots in Bitbucket Pipelines with ScreenshotAPI. Visual testing, deploy evidence, and CI screenshot workflows."
  dateModified: "2026-03-25"
---

## Automate Screenshots in Bitbucket Pipelines with ScreenshotAPI

Bitbucket Pipelines provides CI/CD directly within Bitbucket Cloud. Adding screenshot capability to your pipelines is valuable for visual regression testing, deploy verification, and creating visual change logs. Installing Puppeteer on Bitbucket Pipelines requires a Docker image with Chromium and its dependencies, which increases build times and adds maintenance burden.

ScreenshotAPI simplifies your **Bitbucket Pipelines screenshot** integration to simple HTTP requests. No browser binary, no specialized Docker images, no extra build minutes for Chromium setup.

## Quick Start

1. [Sign up for ScreenshotAPI](https://screenshotapi.to) and copy your API key. **5 free credits** are included.
2. Add the key as a secured repository variable.
3. Add screenshot steps to your `bitbucket-pipelines.yml`.

## Installation

Add the API key as a repository variable:

1. Go to **Repository settings > Pipelines > Repository variables**.
2. Set **Name** to `SCREENSHOTAPI_KEY` and **Value** to your API key.
3. Check **Secured** to mask it in logs.

No additional Docker images or packages are needed. The `alpine` or `node` images with `curl` or `node` are sufficient.

## Basic Pipeline: Screenshot on Deploy

Capture screenshots after deploying to production:

```yaml
# bitbucket-pipelines.yml
pipelines:
  branches:
    main:
      - step:
          name: Deploy
          script:
            - echo "Deploying to production..."

      - step:
          name: Capture Screenshots
          image: alpine:latest
          script:
            - apk add --no-cache curl
            - mkdir -p screenshots
            - |
              for page in "" "/pricing" "/docs" "/blog"; do
                name=$(echo "$page" | sed 's/^\///' | sed 's/^$/homepage/')
                curl -s -o "screenshots/${name}.png" \
                  -H "x-api-key: ${SCREENSHOTAPI_KEY}" \
                  "https://screenshotapi.to/api/v1/screenshot?url=https://yoursite.com${page}&width=1440&height=900&type=png"
                echo "Captured ${name}.png"
              done
          artifacts:
            - screenshots/**
```

## Visual Regression Testing on Pull Requests

Capture screenshots on every PR and compare to baselines:

```yaml
# bitbucket-pipelines.yml
pipelines:
  pull-requests:
    '**':
      - step:
          name: Visual Regression Test
          image: node:20-alpine
          script:
            - node scripts/capture-screenshots.js
            - node scripts/compare-screenshots.js
          artifacts:
            - screenshots/**
```

### Capture Script

```javascript
// scripts/capture-screenshots.js
const fs = require('node:fs');
const path = require('node:path');

const API_BASE = 'https://screenshotapi.to/api/v1/screenshot';
const API_KEY = process.env.SCREENSHOTAPI_KEY;
const BASE_URL = process.env.PREVIEW_URL || 'https://staging.yoursite.com';

const pages = [
  { name: 'homepage', path: '/' },
  { name: 'pricing', path: '/pricing' },
  { name: 'docs', path: '/docs' },
];

const outputDir = 'screenshots/current';
fs.mkdirSync(outputDir, { recursive: true });

async function capture(page) {
  const url = `${BASE_URL}${page.path}`;
  const params = new URLSearchParams({
    url,
    width: '1440',
    height: '900',
    type: 'png',
    waitUntil: 'networkidle',
  });

  try {
    const response = await fetch(`${API_BASE}?${params}`, {
      headers: { 'x-api-key': API_KEY },
    });

    if (!response.ok) {
      console.error(`Failed: ${page.name} (${response.status})`);
      return;
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(path.join(outputDir, `${page.name}.png`), buffer);
    console.log(`Captured ${page.name} (${buffer.length} bytes)`);
  } catch (err) {
    console.error(`Error capturing ${page.name}: ${err.message}`);
  }
}

async function main() {
  await Promise.all(pages.map(capture));
}

main();
```

### Comparison Script

```javascript
// scripts/compare-screenshots.js
const fs = require('node:fs');
const path = require('node:path');

const currentDir = 'screenshots/current';
const baselineDir = 'screenshots/baseline';

if (!fs.existsSync(baselineDir)) {
  console.log('No baseline found. Saving current as baseline.');
  fs.cpSync(currentDir, baselineDir, { recursive: true });
  process.exit(0);
}

const files = fs.readdirSync(currentDir).filter(f => f.endsWith('.png'));
let hasChanges = false;

for (const file of files) {
  const currentPath = path.join(currentDir, file);
  const baselinePath = path.join(baselineDir, file);

  if (!fs.existsSync(baselinePath)) {
    console.log(`New page: ${file}`);
    hasChanges = true;
    continue;
  }

  const current = fs.readFileSync(currentPath);
  const baseline = fs.readFileSync(baselinePath);

  if (!current.equals(baseline)) {
    console.log(`Changed: ${file}`);
    hasChanges = true;
  } else {
    console.log(`Unchanged: ${file}`);
  }
}

if (hasChanges) {
  console.log('\nVisual changes detected. Review the artifacts.');
  process.exit(1);
}
```

## Multi-Page with Custom Script

Capture multiple pages and viewports using a Node.js script:

```yaml
pipelines:
  custom:
    multi-viewport-screenshots:
      - step:
          name: Multi-Viewport Capture
          image: node:20-alpine
          script:
            - node scripts/multi-viewport.js
          artifacts:
            - screenshots/**
```

```javascript
// scripts/multi-viewport.js
const fs = require('node:fs');

const API_BASE = 'https://screenshotapi.to/api/v1/screenshot';
const API_KEY = process.env.SCREENSHOTAPI_KEY;

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
];

const pages = ['https://yoursite.com', 'https://yoursite.com/pricing'];

fs.mkdirSync('screenshots', { recursive: true });

async function captureAll() {
  for (const page of pages) {
    for (const vp of viewports) {
      const pageName = new URL(page).pathname.replace(/\//g, '-') || 'home';
      const filename = `screenshots/${pageName}-${vp.name}.png`;

      const params = new URLSearchParams({
        url: page,
        width: String(vp.width),
        height: String(vp.height),
        type: 'png',
      });

      const response = await fetch(`${API_BASE}?${params}`, {
        headers: { 'x-api-key': API_KEY },
      });

      if (response.ok) {
        const buffer = Buffer.from(await response.arrayBuffer());
        fs.writeFileSync(filename, buffer);
        console.log(`${filename} (${buffer.length} bytes)`);
      } else {
        console.error(`Failed: ${filename} (${response.status})`);
      }
    }
  }
}

captureAll();
```

## Scheduled Monitoring

Run screenshots on a schedule using Bitbucket's scheduled pipelines:

```yaml
pipelines:
  custom:
    site-monitor:
      - step:
          name: Monitor Screenshots
          image: alpine:latest
          script:
            - apk add --no-cache curl
            - mkdir -p screenshots
            - TIMESTAMP=$(date +%Y%m%d-%H%M)
            - |
              curl -s -o "screenshots/homepage-${TIMESTAMP}.png" \
                -H "x-api-key: ${SCREENSHOTAPI_KEY}" \
                "https://screenshotapi.to/api/v1/screenshot?url=https://yoursite.com&width=1440&height=900&type=png"
              
              curl -s -o "screenshots/pricing-${TIMESTAMP}.png" \
                -H "x-api-key: ${SCREENSHOTAPI_KEY}" \
                "https://screenshotapi.to/api/v1/screenshot?url=https://yoursite.com/pricing&width=1440&height=900&type=png"
          artifacts:
            - screenshots/**
```

Configure the schedule in **Pipelines > Schedules**. Set it to run the `site-monitor` custom pipeline at your preferred interval.

## Parallel Steps

Capture multiple pages in parallel using Bitbucket's parallel step feature:

```yaml
pipelines:
  branches:
    main:
      - parallel:
          - step:
              name: Screenshot Homepage
              image: alpine:latest
              script:
                - apk add --no-cache curl
                - curl -s -o homepage.png -H "x-api-key: ${SCREENSHOTAPI_KEY}" "https://screenshotapi.to/api/v1/screenshot?url=https://yoursite.com&width=1440&height=900&type=png"
              artifacts:
                - homepage.png
          - step:
              name: Screenshot Pricing
              image: alpine:latest
              script:
                - apk add --no-cache curl
                - curl -s -o pricing.png -H "x-api-key: ${SCREENSHOTAPI_KEY}" "https://screenshotapi.to/api/v1/screenshot?url=https://yoursite.com/pricing&width=1440&height=900&type=png"
              artifacts:
                - pricing.png
```

## Production Tips

### Build Minutes

Bitbucket Pipelines charges by build minutes. ScreenshotAPI keeps steps fast because there is no browser to install or start. A screenshot step typically completes in 5-15 seconds.

### Artifacts

Download artifacts from the Pipelines tab. Set retention appropriate to your needs. Visual regression baselines should be committed to the repository for persistence across builds.

### Repository Variables

Use secured repository variables for the API key. For organization-wide access, use workspace variables instead of per-repository settings.

### Credit Planning

Each screenshot uses one credit. A pipeline capturing 5 pages on 60 PRs per month uses 300 credits. Visit the [pricing page](/pricing) to find the right tier.

## Further Reading

- The [GitHub Actions integration](/integrations/github-actions) covers GitHub's CI/CD platform.
- See the [GitLab CI integration](/integrations/gitlab-ci) for GitLab pipeline patterns.
- Learn about [visual regression testing](/use-cases/visual-regression-testing) for a comprehensive testing strategy.
