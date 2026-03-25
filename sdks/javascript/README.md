# @screenshotapi/sdk

Official JavaScript/TypeScript SDK for [ScreenshotAPI](https://screenshotapi.to) — capture website screenshots with a simple API call.

## Installation

```bash
npm install @screenshotapi/sdk
```

```bash
yarn add @screenshotapi/sdk
```

```bash
pnpm add @screenshotapi/sdk
```

```bash
bun add @screenshotapi/sdk
```

## Quick Start

```typescript
import { ScreenshotAPI } from '@screenshotapi/sdk'

const client = new ScreenshotAPI({ apiKey: 'your-api-key' })

// Take a screenshot and save to file
const metadata = await client.save({
  url: 'https://example.com',
  path: './screenshot.png'
})

console.log(`Credits remaining: ${metadata.creditsRemaining}`)
```

## Usage

### Initialize the Client

```typescript
import { ScreenshotAPI } from '@screenshotapi/sdk'

const client = new ScreenshotAPI({
  apiKey: 'your-api-key',
  baseUrl: 'https://screenshotapi.to', // optional, default shown
  timeout: 60000 // optional, ms, default 60s
})
```

### Take a Screenshot (get raw bytes)

```typescript
const result = await client.screenshot({
  url: 'https://example.com',
  width: 1920,
  height: 1080,
  fullPage: true,
  type: 'webp',
  quality: 90,
  colorScheme: 'dark'
})

// result.image       — ArrayBuffer of image data
// result.contentType  — e.g. "image/webp"
// result.metadata.creditsRemaining
// result.metadata.screenshotId
// result.metadata.durationMs
```

### Save to File

```typescript
const metadata = await client.save({
  url: 'https://example.com',
  path: './screenshot.png',
  type: 'png',
  fullPage: true
})
```

## API Reference

### `new ScreenshotAPI(config)`

| Parameter   | Type     | Required | Default                      | Description          |
| ----------- | -------- | -------- | ---------------------------- | -------------------- |
| `apiKey`    | `string` | Yes      | —                            | Your API key         |
| `baseUrl`   | `string` | No       | `https://screenshotapi.to`  | API base URL         |
| `timeout`   | `number` | No       | `60000`                      | Request timeout (ms) |

### `client.screenshot(options)`

Returns `Promise<ScreenshotResult>`.

| Parameter         | Type      | Required | Default           | Description                     |
| ----------------- | --------- | -------- | ----------------- | ------------------------------- |
| `url`             | `string`  | Yes      | —                 | URL to capture                  |
| `width`           | `number`  | No       | `1440`            | Viewport width (px)             |
| `height`          | `number`  | No       | `900`             | Viewport height (px)            |
| `fullPage`        | `boolean` | No       | `false`           | Capture full scrollable page    |
| `type`            | `string`  | No       | `"png"`           | `"png"`, `"jpeg"`, or `"webp"` |
| `quality`         | `number`  | No       | `100`             | Image quality (1-100)           |
| `colorScheme`     | `string`  | No       | —                 | `"light"` or `"dark"`           |
| `waitUntil`       | `string`  | No       | `"networkidle2"`  | Page load event to wait for     |
| `waitForSelector` | `string`  | No       | —                 | CSS selector to wait for        |
| `delay`           | `number`  | No       | —                 | Extra delay after load (ms)     |

### `client.save(options)`

Same options as `screenshot()` plus `path: string`. Returns `Promise<ScreenshotMetadata>`.

## Error Handling

```typescript
import {
  ScreenshotAPI,
  AuthenticationError,
  InsufficientCreditsError,
  InvalidAPIKeyError,
  ScreenshotFailedError
} from '@screenshotapi/sdk'

const client = new ScreenshotAPI({ apiKey: 'your-api-key' })

try {
  await client.screenshot({ url: 'https://example.com' })
} catch (error) {
  if (error instanceof AuthenticationError) {
    // 401 — API key missing or malformed
  } else if (error instanceof InvalidAPIKeyError) {
    // 403 — API key revoked or invalid
  } else if (error instanceof InsufficientCreditsError) {
    console.log(`Balance: ${error.balance}`)
    // 402 — No credits remaining
  } else if (error instanceof ScreenshotFailedError) {
    // 500 — Screenshot capture failed
  }
}
```

## Requirements

- Node.js 18+ (uses native `fetch`)
- Zero dependencies

## License

MIT
