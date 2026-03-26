---
title: "Screenshot API for Zapier"
description: "Automate website screenshots with Zapier and ScreenshotAPI. No-code workflows for capturing, storing, and sharing screenshots."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Integrations
    href: /integrations
  - label: Zapier
faq:
  - question: "Can I use ScreenshotAPI with Zapier without coding?"
    answer: "Yes. Use Zapier's Webhooks by Zapier action to make a GET request to the ScreenshotAPI endpoint. No coding required, just configure the URL, headers, and parameters in the Zapier editor."
  - question: "How do I pass the API key in a Zapier webhook?"
    answer: "In the Custom Request action, add a custom header with key x-api-key and your API key as the value. Zapier sends this header with every request."
  - question: "Can I save Zapier screenshots to Google Drive or Dropbox?"
    answer: "Yes. After the webhook step captures the screenshot, add a Google Drive or Dropbox action to upload the file. Zapier passes the image data between steps automatically."
  - question: "What triggers can I use to start a screenshot workflow?"
    answer: "Any Zapier trigger works. Common choices include new form submissions, new rows in Google Sheets, scheduled intervals, new emails, Slack messages, or webhook catches from your own app."
relatedPages:
  - title: "n8n Integration"
    description: "Open-source workflow automation with screenshots"
    href: "/integrations/n8n"
  - title: "Make Integration"
    description: "Screenshots with Make (Integromat) scenarios"
    href: "/integrations/make"
  - title: "GitHub Actions Integration"
    description: "CI/CD screenshot automation"
    href: "/integrations/github-actions"
jsonLd:
  "@context": "https://schema.org"
  "@type": "TechArticle"
  headline: "Screenshot API for Zapier"
  description: "Automate website screenshots with Zapier and ScreenshotAPI. No-code workflows for capturing, storing, and sharing screenshots."
  dateModified: "2026-03-25"
---

## Automate Website Screenshots with Zapier and ScreenshotAPI

Zapier connects thousands of apps through automated workflows called Zaps. By adding ScreenshotAPI to your Zaps, you can capture website screenshots automatically whenever a trigger fires. No coding, no server setup, no headless browser configuration.

A **Zapier screenshot** integration with ScreenshotAPI is perfect for use cases like capturing screenshots of newly submitted websites in a form, monitoring competitor pages on a schedule, generating visual reports for stakeholders, or archiving page snapshots for compliance.

## Quick Start

1. [Sign up for ScreenshotAPI](https://screenshotapi.to) and copy your API key. **5 free credits** are included.
2. Create a new Zap in your Zapier account.
3. Add a Webhooks by Zapier action to call the API.

## Basic Zap: Capture Screenshot on Form Submission

This workflow captures a screenshot whenever someone submits a URL through a Google Form.

### Step 1: Trigger

Choose **Google Forms** as the trigger app and select "New Response in Spreadsheet." Connect your Google account and select the form that collects URLs.

### Step 2: Capture Screenshot

Add a **Webhooks by Zapier** action with these settings:

- **Action Event**: Custom Request
- **Method**: GET
- **URL**: `https://screenshotapi.to/api/v1/screenshot`
- **Query String Params**:
  - `url`: Map to the URL field from the form response
  - `width`: `1440`
  - `height`: `900`
  - `type`: `png`
  - `waitUntil`: `networkidle`
- **Headers**:
  - `x-api-key`: `sk_live_xxxxx`

### Step 3: Store the Screenshot

Add a **Google Drive** action:

- **Action Event**: Upload File
- **File**: Map to the response body from the webhook step
- **Folder**: Select your screenshots folder
- **File Name**: Use the submitted URL or a timestamp

## Scheduled Monitoring Zap

Capture screenshots of your own site on a regular schedule:

### Step 1: Schedule Trigger

Choose **Schedule by Zapier** as the trigger:

- **Trigger Event**: Every Day (or Every Hour, Every Week)
- **Time of Day**: 9:00 AM

### Step 2: Capture Homepage

Add a **Webhooks by Zapier** Custom Request:

- **Method**: GET
- **URL**: `https://screenshotapi.to/api/v1/screenshot?url=https://yoursite.com&width=1440&height=900&type=png`
- **Headers**: `x-api-key: sk_live_xxxxx`

### Step 3: Send to Slack

Add a **Slack** action:

- **Action Event**: Send Channel Message
- **Channel**: #screenshots or #monitoring
- **Message Text**: `Daily homepage screenshot captured at {{zap_meta_human_now}}`
- **File**: Attach the screenshot from the webhook step

## Multi-Page Screenshot Workflow

Capture multiple pages in a single Zap using Zapier's Looping feature:

### Step 1: Trigger

Use any trigger that provides a list of URLs, or use **Formatter by Zapier** to create a list:

- **Action Event**: Utilities > Line Items to Text
- **Input**: Enter URLs separated by commas

### Step 2: Loop Through URLs

Add **Looping by Zapier**:

- **Values to Loop**: Map to your list of URLs

### Step 3: Capture Each Page

Inside the loop, add a **Webhooks by Zapier** Custom Request:

- **Method**: GET
- **URL**: `https://screenshotapi.to/api/v1/screenshot`
- **Query String Params**:
  - `url`: Map to the current loop value
  - `width`: `1440`
  - `height`: `900`
  - `type`: `webp`
  - `quality`: `80`
- **Headers**: `x-api-key: sk_live_xxxxx`

### Step 4: Upload to Storage

Add a storage action inside the loop to save each screenshot to Google Drive, Dropbox, or S3.

## Competitor Monitoring Workflow

Track visual changes on competitor websites:

1. **Trigger**: Schedule by Zapier (weekly)
2. **Action**: Webhooks by Zapier Custom Request to capture competitor homepage
3. **Action**: Send screenshot to an email or Slack channel with a note about which competitor was captured
4. **Action**: Store in Google Drive with dated filename for historical comparison

## Webhook Trigger for On-Demand Screenshots

Create a Zap that accepts webhook requests from your own application:

### Step 1: Trigger

Choose **Webhooks by Zapier** > Catch Hook. Copy the webhook URL and call it from your app:

```bash
curl -X POST "https://hooks.zapier.com/hooks/catch/YOUR_HOOK_ID" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "type": "png"}'
```

### Step 2: Capture Screenshot

Use another **Webhooks by Zapier** Custom Request to call ScreenshotAPI with the URL from the incoming webhook.

### Step 3: Process the Result

Send the screenshot to email, upload to cloud storage, or post to a team channel.

## Dark Mode Screenshots

Add `colorScheme=dark` to the query string parameters to capture the dark mode version of any website:

- **Query String Params**:
  - `colorScheme`: `dark`

This is useful for generating preview images for both themes, or for [visual regression testing](/use-cases/visual-regression-testing) workflows.

## Production Tips

### API Key Security

Zapier stores your API key securely in the webhook configuration. It is never exposed to end users. For team accounts, use Zapier's shared app connections to manage the key centrally.

### Error Handling

Enable Zapier's built-in error handling to retry failed screenshots. Add a "Paths" step after the webhook to check the response status code and branch accordingly.

### Rate Limiting

If your Zap processes many URLs, add a Delay step between webhook calls to avoid hitting rate limits. Zapier's built-in delay supports 1 second to 1 hour intervals.

### Credit Usage

Each screenshot capture uses one credit. A monitoring Zap that captures 5 pages daily uses 150 credits per month. Visit the [pricing page](/pricing) to pick the right credit tier.

## Further Reading

- The [n8n integration](/integrations/n8n) covers open-source workflow automation as an alternative.
- See the [Make integration](/integrations/make) for another no-code option.
- The [API documentation](/docs) has the full parameter reference for all endpoints.
