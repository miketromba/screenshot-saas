import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock } from '@/components/seo'

export const metadata: Metadata = {
	title: 'How to Screenshot Single-Page Applications',
	description:
		'Capture screenshots of React, Vue, and Angular SPAs using smart wait strategies. Handle JS rendering, lazy loading, and dynamic content.'
}

export default function Page() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Blog', href: '/blog' },
				{ label: 'Screenshot Single-Page Applications' }
			]}
			title="How to Screenshot Single-Page Applications"
			description="Capture reliable screenshots of React, Vue, and Angular SPAs using waitUntil, waitForSelector, and delay strategies."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'Article',
				headline: 'How to Screenshot Single-Page Applications',
				dateModified: '2026-03-25',
				publisher: {
					'@type': 'Organization',
					name: 'ScreenshotAPI',
					url: 'https://screenshotapi.to'
				}
			}}
			faq={[
				{
					question: 'Why are SPA screenshots tricky?',
					answer: 'SPAs load a minimal HTML shell, then render content with JavaScript. A screenshot taken too early will capture a blank page or loading spinner. You need to wait for JS to execute, data to load, and the DOM to be populated.'
				},
				{
					question: 'What does waitUntil=networkidle do?',
					answer: 'It waits until there are no more than 0-2 network requests for at least 500ms. This is a good heuristic for "the page has finished loading all its data" — API calls, images, fonts, and other resources.'
				},
				{
					question: 'When should I use waitForSelector vs waitUntil?',
					answer: 'Use waitForSelector when you know a specific CSS selector that indicates the page is ready (like .dashboard-loaded or [data-loaded="true"]). Use waitUntil=networkidle as a general-purpose wait that works without knowing the page structure.'
				},
				{
					question: 'Can I screenshot pages behind authentication?',
					answer: 'ScreenshotAPI does not support authenticated sessions directly. For pages behind login, you would need to build a public proxy route that renders the content, or use a session token in the URL.'
				}
			]}
			relatedPages={[
				{
					title: 'Take Screenshots with JavaScript',
					description: 'Screenshot capture in Node.js.',
					href: '/blog/how-to-take-screenshots-with-javascript'
				},
				{
					title: 'Take Full-Page Screenshots',
					description: 'Capture entire scrollable SPA pages.',
					href: '/blog/how-to-take-full-page-screenshots'
				},
				{
					title: 'Automate Website Screenshots',
					description: 'Automated screenshot capture pipelines.',
					href: '/blog/how-to-automate-website-screenshots'
				}
			]}
		>
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					The SPA screenshot problem
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Single-page applications built with React, Vue, Angular, or
					Svelte work differently from traditional server-rendered
					pages. The initial HTML is typically a near-empty shell with
					a {`<div id="root">`} and a JavaScript bundle. The actual
					content is rendered client-side after the JS executes, data
					is fetched from APIs, and components mount. This means a
					naive screenshot — one that captures immediately after the
					HTML loads — will show a blank page, a loading spinner, or a
					partially rendered skeleton.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Strategy 1: waitUntil=networkidle
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					The most versatile strategy. It waits until there are no
					more than two network connections for 500ms — meaning API
					calls are complete, images are loaded, and fonts are
					downloaded:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="bash"
						title="Network idle strategy"
						code={`curl -o spa.png \\
  -H "x-api-key: sk_live_your_api_key" \\
  "https://screenshotapi.to/api/v1/screenshot?url=https://app.example.com&waitUntil=networkidle&width=1440&height=900&type=png"`}
					/>
				</div>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					This works well for most SPAs because they fetch data from
					APIs on mount, and {`networkidle`} waits for those requests
					to finish.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Strategy 2: waitForSelector
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					When you know the page structure, use {`waitForSelector`} to
					wait for a specific element to appear in the DOM. This is
					more reliable than network-based waits for apps with
					streaming or long-polling:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="bash"
						title="Wait for specific element"
						code={`# Wait for the main content to render
curl -o dashboard.png \\
  -H "x-api-key: sk_live_your_api_key" \\
  "https://screenshotapi.to/api/v1/screenshot?url=https://app.example.com/dashboard&waitForSelector=.dashboard-content&type=png"

# Wait for a data table to populate
curl -o report.png \\
  -H "x-api-key: sk_live_your_api_key" \\
  "https://screenshotapi.to/api/v1/screenshot?url=https://app.example.com/reports&waitForSelector=table%20tbody%20tr&type=png"

# Wait for a React component with data attribute
curl -o app.png \\
  -H "x-api-key: sk_live_your_api_key" \\
  "https://screenshotapi.to/api/v1/screenshot?url=https://app.example.com&waitForSelector=[data-loaded%3D'true']&type=png"`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Strategy 3: Combine wait strategies
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					For the most reliable results, combine multiple strategies.
					Use
					{` waitUntil`} for API calls, {`waitForSelector`} for DOM
					readiness, and {`delay`} for animations:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="javascript"
						title="Combined wait strategies"
						code={`const params = new URLSearchParams({
  url: 'https://app.example.com/dashboard',
  width: '1440',
  height: '900',
  type: 'png',
  waitUntil: 'networkidle',        // wait for API calls
  waitForSelector: '.chart-loaded', // wait for charts to render
  delay: '1500'                     // extra time for animations
})

const response = await fetch(
  \`https://screenshotapi.to/api/v1/screenshot?\${params}\`,
  { headers: { 'x-api-key': process.env.SCREENSHOT_API_KEY } }
)`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Common SPA frameworks and tips
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					<strong>React:</strong> Look for data-testid or data-loaded
					attributes. React Query apps settle when {`networkidle`}{' '}
					triggers. <strong>Vue:</strong> The {`v-if`} and {`v-show`}{' '}
					directives make
					{` waitForSelector`} ideal — wait for the element that only
					appears after data loads. <strong>Angular:</strong>{' '}
					Angular&apos;s zone.js can keep network connections open.
					Use {`waitForSelector`} plus a {`delay`} rather than relying
					solely on {`networkidle`}. <strong>Next.js/Nuxt:</strong>{' '}
					Server-rendered SPAs are easier since the initial HTML has
					content. Still use {`waitUntil`} for client-side hydration
					and data fetching.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Debugging blank screenshots
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					If your screenshot comes back blank or shows a loading
					state, try these steps: first, add {`waitUntil=networkidle`}{' '}
					if you have not already. Second, increase the {`delay`} to
					3000-5000ms to give the app more time. Third, use{' '}
					{`waitForSelector`} to target a known element. Fourth, check
					if the page requires authentication or specific cookies.
					Fifth, verify the URL loads correctly in a regular browser.
					Each additional strategy increases reliability at the cost
					of slightly longer capture times.
				</p>
			</section>
		</ArticleLayout>
	)
}
