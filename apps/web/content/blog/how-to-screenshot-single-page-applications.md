---
title: "How to Screenshot Single-Page Applications (React, Vue, Angular)"
description: "Capture reliable screenshots of SPAs built with React, Vue, and Angular. Solve blank page issues with proper wait strategies and selector timing."
lastUpdated: "2026-03-25"
breadcrumbs:
  - label: Home
    href: /
  - label: Blog
    href: /blog
  - label: How to Screenshot Single-Page Applications
faq:
  - question: "Why do my SPA screenshots show a blank page?"
    answer: "SPAs render content with JavaScript after the initial HTML loads. If the screenshot is taken before JavaScript executes and the UI renders, you capture an empty shell. Use waitForSelector or waitUntil=networkidle to wait for content."
  - question: "What is the best wait strategy for React app screenshots?"
    answer: "Use waitForSelector with a CSS selector that targets your main content area (e.g., #root > div or [data-loaded=true]). This is more reliable than time-based delays because it waits for actual content rather than guessing how long rendering takes."
  - question: "Can I screenshot a Vue or Angular app the same way?"
    answer: "Yes. All SPA frameworks produce the same rendering pattern: an empty HTML shell that JavaScript fills with content. The same wait strategies (waitForSelector, networkidle) work for React, Vue, Angular, Svelte, and any other SPA framework."
  - question: "How do I handle lazy-loaded content in SPA screenshots?"
    answer: "For full-page screenshots of SPAs with lazy loading, combine fullPage=true with waitUntil=networkidle. The API scrolls the page to trigger lazy-loaded content and waits for all network requests to complete."
relatedPages:
  - title: "How to Take Full-Page Screenshots"
    description: "Capture entire scrollable SPA pages."
    href: "/blog/how-to-take-full-page-screenshots"
  - title: "How to Take Screenshots with JavaScript"
    description: "Node.js screenshot capture for SPA developers."
    href: "/blog/how-to-take-screenshots-with-javascript"
  - title: "Visual Regression Testing"
    description: "Compare SPA screenshots across releases."
    href: "/use-cases/visual-regression-testing"
jsonLd:
  "@context": "https://schema.org"
  "@type": "Article"
  headline: "How to Screenshot Single-Page Applications (React, Vue, Angular)"
  description: "Capture reliable screenshots of SPAs built with React, Vue, and Angular. Solve blank page issues with proper wait strategies and selector timing."
  dateModified: "2026-03-25"
---

Screenshotting single-page applications is harder than capturing static HTML pages. SPAs built with React, Vue, Angular, or Svelte render content dynamically with JavaScript after the initial page load. If you screenshot too early, you get a blank page or a loading spinner. This guide explains the problem and shows reliable solutions.

## Why SPA Screenshots Fail

A traditional server-rendered page sends complete HTML to the browser. An SPA sends a minimal shell:

```html
<!DOCTYPE html>
<html>
<body>
  <div id="root"></div>
  <script src="/app.bundle.js"></script>
</body>
</html>
```

The rendering timeline looks like this:

1. Browser downloads HTML (the empty shell)
2. Browser downloads JavaScript bundle (500 KB - 2 MB)
3. JavaScript parses and executes
4. Framework mounts and renders components
5. Components fetch data from APIs
6. UI updates with fetched data

A screenshot tool that captures at step 1 or 2 gets a blank page. Capturing at step 4 may show a loading spinner. You need to wait for step 6.

## Wait Strategies

### Strategy 1: Wait for network idle

Wait until all network requests have completed:

```javascript
// Puppeteer
await page.goto('https://myapp.com', { waitUntil: 'networkidle0' });

// Playwright
await page.goto('https://myapp.com', { waitUntil: 'networkidle' });
```

**Pros**: Simple, no app changes needed.
**Cons**: Fails on apps with WebSocket connections, polling, or analytics pings that never go idle.

### Strategy 2: Wait for a specific selector

Wait for a DOM element that only exists after rendering:

```javascript
// Puppeteer
await page.goto('https://myapp.com');
await page.waitForSelector('#dashboard-content', { timeout: 10000 });

// Playwright
await page.goto('https://myapp.com');
await page.waitForSelector('#dashboard-content', { timeout: 10000 });
```

**Pros**: Precise, works with WebSocket-heavy apps.
**Cons**: Requires knowing a CSS selector for the final content.

### Strategy 3: Wait for a data attribute

Add a data attribute in your app when rendering is complete:

```jsx
// In your React app
function App() {
  const [loaded, setLoaded] = useState(false);
  const { data } = useQuery(['dashboard'], fetchDashboard);

  useEffect(() => {
    if (data) setLoaded(true);
  }, [data]);

  return <div data-loaded={loaded}>{/* content */}</div>;
}
```

Then wait for it:

```javascript
await page.waitForSelector('[data-loaded="true"]');
```

**Pros**: Explicit signal from the app that content is ready.
**Cons**: Requires modifying the application code.

### Strategy 4: Combine strategies

The most reliable approach combines multiple signals:

```javascript
await page.goto('https://myapp.com', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#app-content', { timeout: 15000 });
await page.waitForTimeout(500); // Brief pause for animations
await page.screenshot({ path: 'screenshot.png' });
```

## The Easy Way: ScreenshotAPI

[ScreenshotAPI](/) supports all wait strategies as query parameters, no Puppeteer or Playwright setup required.

### Wait for network idle

```bash
curl -G "https://screenshotapi.to/api/v1/screenshot" \
  -d "url=https://myreactapp.com" \
  -d "width=1440" \
  -d "height=900" \
  -d "waitUntil=networkidle" \
  -d "type=png" \
  -H "x-api-key: sk_live_your_api_key" \
  --output screenshot.png
```

### Wait for a selector

```bash
curl -G "https://screenshotapi.to/api/v1/screenshot" \
  -d "url=https://myreactapp.com" \
  -d "width=1440" \
  -d "height=900" \
  -d "waitForSelector=#dashboard-content" \
  -d "type=png" \
  -H "x-api-key: sk_live_your_api_key" \
  --output screenshot.png
```

### Wait for selector with delay

```bash
curl -G "https://screenshotapi.to/api/v1/screenshot" \
  -d "url=https://myreactapp.com" \
  -d "width=1440" \
  -d "height=900" \
  -d "waitForSelector=#dashboard-content" \
  -d "delay=500" \
  -d "type=png" \
  -H "x-api-key: sk_live_your_api_key" \
  --output screenshot.png
```

### JavaScript example

```javascript
async function screenshotSPA(url, selector) {
  const params = new URLSearchParams({
    url,
    width: '1440',
    height: '900',
    type: 'png',
    waitUntil: 'networkidle',
    ...(selector ? { waitForSelector: selector } : {})
  });

  const response = await fetch(
    `https://screenshotapi.to/api/v1/screenshot?${params}`,
    { headers: { 'x-api-key': process.env.SCREENSHOT_API_KEY } }
  );

  return Buffer.from(await response.arrayBuffer());
}

// React app with known content selector
const image = await screenshotSPA('https://myapp.com/dashboard', '#dashboard-loaded');
```

## Framework-Specific Tips

### React

React apps typically mount into `#root`. Wait for child content:

```bash
curl -G "https://screenshotapi.to/api/v1/screenshot" \
  -d "url=https://react-app.com" \
  -d "waitForSelector=#root > div" \
  -d "type=png" \
  -H "x-api-key: sk_live_your_api_key" \
  --output react.png
```

### Vue

Vue 3 apps mount into `#app`. Wait for the mounted content:

```bash
curl -G "https://screenshotapi.to/api/v1/screenshot" \
  -d "url=https://vue-app.com" \
  -d "waitForSelector=#app > div" \
  -d "type=png" \
  -H "x-api-key: sk_live_your_api_key" \
  --output vue.png
```

### Angular

Angular apps typically use `<app-root>`. Wait for child content:

```bash
curl -G "https://screenshotapi.to/api/v1/screenshot" \
  -d "url=https://angular-app.com" \
  -d "waitForSelector=app-root > *" \
  -d "type=png" \
  -H "x-api-key: sk_live_your_api_key" \
  --output angular.png
```

### Next.js (Client-Side Rendering)

Next.js pages that use `use client` render on the client. Wait for hydration:

```bash
curl -G "https://screenshotapi.to/api/v1/screenshot" \
  -d "url=https://nextjs-app.com/dashboard" \
  -d "waitUntil=networkidle" \
  -d "waitForSelector=[data-loaded]" \
  -d "type=png" \
  -H "x-api-key: sk_live_your_api_key" \
  --output nextjs.png
```

## Full-Page SPA Screenshots

Combine SPA wait strategies with full-page capture:

```javascript
const params = new URLSearchParams({
  url: 'https://myapp.com',
  width: '1440',
  fullPage: 'true',
  waitUntil: 'networkidle',
  waitForSelector: '#content-loaded',
  type: 'png'
});

const response = await fetch(
  `https://screenshotapi.to/api/v1/screenshot?${params}`,
  { headers: { 'x-api-key': process.env.SCREENSHOT_API_KEY } }
);
```

## Debugging Blank Screenshots

If you are still getting blank screenshots:

1. **Check the selector**: Open the site in Chrome DevTools and verify your CSS selector matches an element that appears after rendering
2. **Increase the delay**: Add `delay=3000` to give slow APIs time to respond
3. **Try networkidle**: If `load` is not enough, switch to `networkidle`
4. **Check for auth**: If the page requires login, the screenshot will show a login page, not the authenticated content

## Next Steps

- Read about [full-page screenshots](/blog/how-to-take-full-page-screenshots) for capturing entire SPA pages
- See the [JavaScript guide](/blog/how-to-take-screenshots-with-javascript) for more Node.js examples
- Set up [visual regression testing](/blog/how-to-build-visual-regression-testing-pipeline) for your SPA
- Check [pricing](/pricing) for credit-based plans
