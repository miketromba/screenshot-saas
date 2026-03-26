import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock } from '@/components/seo'

export const metadata: Metadata = {
	title: 'How to Capture Dark Mode Screenshots (2025)',
	description:
		'Force dark mode rendering when capturing website screenshots. Use the colorScheme parameter for design portfolios and documentation.'
}

export default function Page() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Blog', href: '/blog' },
				{ label: 'Capture Dark Mode Screenshots' }
			]}
			title="How to Capture Dark Mode Screenshots"
			description="Force dark mode rendering when capturing screenshots with ScreenshotAPI's colorScheme parameter. Perfect for design portfolios, documentation, and app store listings."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'Article',
				headline: 'How to Capture Dark Mode Screenshots',
				dateModified: '2026-03-25',
				publisher: {
					'@type': 'Organization',
					name: 'ScreenshotAPI',
					url: 'https://screenshotapi.to'
				}
			}}
			faq={[
				{
					question: 'How does the colorScheme parameter work?',
					answer: 'It sets the prefers-color-scheme CSS media feature in the browser. Sites that support dark mode via @media (prefers-color-scheme: dark) will render in dark mode when colorScheme=dark is set.'
				},
				{
					question: 'Does this work with all websites?',
					answer: 'It works with any website that uses the prefers-color-scheme CSS media query to implement dark mode. Sites that toggle dark mode via JavaScript class names (like adding a .dark class) may not respond to this parameter.'
				},
				{
					question:
						'Can I capture both light and dark mode screenshots?',
					answer: 'Yes. Make two API calls — one with colorScheme=light and one with colorScheme=dark. This is great for design documentation and before/after comparisons.'
				},
				{
					question:
						'Does dark mode affect the background color of the screenshot?',
					answer: 'The screenshot captures exactly what the page renders. If the page has a dark background in dark mode, the screenshot will show that dark background. The API does not add any overlay or modification.'
				}
			]}
			relatedPages={[
				{
					title: 'Take Full-Page Screenshots',
					description: 'Capture entire scrollable pages.',
					href: '/blog/how-to-take-full-page-screenshots'
				},
				{
					title: 'Take Mobile Screenshots',
					description:
						'Capture responsive screenshots at mobile viewports.',
					href: '/blog/how-to-take-mobile-screenshots-of-websites'
				},
				{
					title: 'Build Visual Regression Testing',
					description: 'Detect visual changes in CI/CD pipelines.',
					href: '/blog/how-to-build-visual-regression-testing-pipeline'
				}
			]}
		>
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Why capture dark mode screenshots?
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Dark mode has become a standard feature in web applications.
					More than 80% of users prefer dark mode in at least some
					contexts. Capturing dark mode screenshots is essential for
					design portfolios showcasing both themes, documentation that
					matches user preferences, app store and marketing materials,
					visual testing of dark mode implementations, and bug reports
					that need to show dark mode issues.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Using the colorScheme parameter
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					ScreenshotAPI sets the {`prefers-color-scheme`} CSS media
					feature on the browser, triggering dark mode on sites that
					support it:
				</p>
				<div className="mt-6 space-y-4">
					<CodeBlock
						language="bash"
						title="Dark mode screenshot"
						code={`curl -o dark.png \\
  -H "x-api-key: sk_live_your_api_key" \\
  "https://screenshotapi.to/api/v1/screenshot?url=https://github.com&colorScheme=dark&width=1440&height=900&type=png"`}
					/>
					<CodeBlock
						language="bash"
						title="Light mode screenshot (explicit)"
						code={`curl -o light.png \\
  -H "x-api-key: sk_live_your_api_key" \\
  "https://screenshotapi.to/api/v1/screenshot?url=https://github.com&colorScheme=light&width=1440&height=900&type=png"`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Capturing both themes side by side
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Generate both light and dark screenshots for design review
					or documentation:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="javascript"
						title="Capture both themes"
						code={`async function captureBothThemes(url) {
  const baseParams = { url, width: '1440', height: '900', type: 'png' }

  const [lightResponse, darkResponse] = await Promise.all([
    fetch(
      \`https://screenshotapi.to/api/v1/screenshot?\${new URLSearchParams({
        ...baseParams,
        colorScheme: 'light'
      })}\`,
      { headers: { 'x-api-key': process.env.SCREENSHOT_API_KEY } }
    ),
    fetch(
      \`https://screenshotapi.to/api/v1/screenshot?\${new URLSearchParams({
        ...baseParams,
        colorScheme: 'dark'
      })}\`,
      { headers: { 'x-api-key': process.env.SCREENSHOT_API_KEY } }
    )
  ])

  fs.writeFileSync('light.png', Buffer.from(await lightResponse.arrayBuffer()))
  fs.writeFileSync('dark.png', Buffer.from(await darkResponse.arrayBuffer()))
}`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Combining with other parameters
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Dark mode works with all other ScreenshotAPI parameters:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="bash"
						title="Dark mode + full page + mobile"
						code={`# Full-page dark mode
curl -o dark-fullpage.png \\
  -H "x-api-key: sk_live_your_api_key" \\
  "https://screenshotapi.to/api/v1/screenshot?url=https://github.com&colorScheme=dark&fullPage=true&width=1440&type=png"

# Dark mode on mobile viewport
curl -o dark-mobile.png \\
  -H "x-api-key: sk_live_your_api_key" \\
  "https://screenshotapi.to/api/v1/screenshot?url=https://github.com&colorScheme=dark&width=375&height=812&type=png"

# Dark mode as WebP
curl -o dark.webp \\
  -H "x-api-key: sk_live_your_api_key" \\
  "https://screenshotapi.to/api/v1/screenshot?url=https://github.com&colorScheme=dark&width=1440&height=900&type=webp&quality=90"`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Testing dark mode implementations
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Use automated dark mode screenshots to verify your site
					renders correctly in both themes. Capture screenshots on
					each deploy and diff them against baseline images to catch
					dark mode regressions — like text becoming invisible against
					a dark background or missing color token overrides.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="javascript"
						title="Dark mode visual regression check"
						code={`const pages = ['/', '/about', '/pricing', '/docs']
const themes = ['light', 'dark']

for (const page of pages) {
  for (const theme of themes) {
    const params = new URLSearchParams({
      url: \`https://yoursite.com\${page}\`,
      colorScheme: theme,
      width: '1440',
      height: '900',
      type: 'png'
    })

    const response = await fetch(
      \`https://screenshotapi.to/api/v1/screenshot?\${params}\`,
      { headers: { 'x-api-key': process.env.SCREENSHOT_API_KEY } }
    )

    const buffer = Buffer.from(await response.arrayBuffer())
    fs.writeFileSync(\`screenshots\${page.replace('/', '_') || 'home'}_\${theme}.png\`, buffer)
  }
}`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Limitations and workarounds
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					The colorScheme parameter only affects sites that use the
					{` prefers-color-scheme`} CSS media query. Sites that
					implement dark mode via JavaScript toggles (adding a class
					like {`.dark`} to the body) will not respond. For those
					sites, you may need to target a URL that already has dark
					mode enabled, or use a wait strategy that triggers the dark
					mode toggle.
				</p>
			</section>
		</ArticleLayout>
	)
}
