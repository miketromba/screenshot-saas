import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock } from '@/components/seo'

export const metadata: Metadata = {
	title: 'How to Build Visual Regression Testing in CI/CD',
	description:
		'Detect visual bugs with automated screenshot diffing in GitHub Actions. Compare before/after screenshots on every pull request.'
}

export default function Page() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Blog', href: '/blog' },
				{ label: 'Visual Regression Testing' }
			]}
			title="How to Build a Visual Regression Testing Pipeline"
			description="Detect visual bugs automatically by diffing screenshots in CI/CD. Includes a complete GitHub Actions workflow with screenshot comparison."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'Article',
				headline: 'How to Build a Visual Regression Testing Pipeline',
				dateModified: '2026-03-25',
				publisher: {
					'@type': 'Organization',
					name: 'ScreenshotAPI',
					url: 'https://screenshotapi.to'
				}
			}}
			faq={[
				{
					question: 'What is visual regression testing?',
					answer: 'Visual regression testing captures screenshots of your app before and after code changes, then compares them pixel-by-pixel to detect unintended visual changes. It catches CSS bugs, layout shifts, and broken UI that unit tests cannot detect.'
				},
				{
					question:
						'How is this different from tools like Percy or Chromatic?',
					answer: 'Percy and Chromatic are full-service visual testing platforms with dashboards, approval workflows, and browser matrix testing. This approach is simpler and cheaper — you own the pipeline and just pay for screenshot API calls.'
				},
				{
					question:
						'What threshold should I use for pixel comparison?',
					answer: 'A threshold of 0.1 (10% color difference per pixel) and a 0.5% total pixel mismatch rate works well for most sites. Increase the threshold if you have animations or dynamic content that causes false positives.'
				},
				{
					question: 'Can I run visual tests on pull requests?',
					answer: 'Yes. Capture screenshots of the PR branch, compare against the main branch screenshots, and post the results as a PR comment with diff images. The GitHub Actions workflow in this guide does exactly that.'
				}
			]}
			relatedPages={[
				{
					title: 'Automate Website Screenshots',
					description: 'Set up scheduled screenshot capture.',
					href: '/blog/how-to-automate-website-screenshots'
				},
				{
					title: 'Take Full-Page Screenshots',
					description: 'Capture entire scrollable pages.',
					href: '/blog/how-to-take-full-page-screenshots'
				},
				{
					title: 'Capture Dark Mode Screenshots',
					description: 'Test both themes in your pipeline.',
					href: '/blog/how-to-capture-dark-mode-screenshots'
				}
			]}
		>
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Why visual regression testing?
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Unit tests verify logic. Integration tests verify behavior.
					But neither catches visual bugs — a CSS change that moves a
					button off screen, a font that fails to load, a z-index
					conflict that hides content. Visual regression testing
					captures screenshots before and after changes, diffs them
					pixel-by-pixel, and flags differences. It is the only way to
					catch visual regressions automatically.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					The screenshot capture script
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					A reusable script that captures screenshots of key pages:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="javascript"
						title="visual-test.js"
						code={`const fs = require('fs')
const path = require('path')

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'pricing', path: '/pricing' },
  { name: 'docs', path: '/docs' },
  { name: 'dashboard', path: '/dashboard' }
]

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 375, height: 812 }
]

async function captureAll(baseUrl, outputDir) {
  fs.mkdirSync(outputDir, { recursive: true })

  for (const page of PAGES) {
    for (const viewport of VIEWPORTS) {
      const params = new URLSearchParams({
        url: \`\${baseUrl}\${page.path}\`,
        width: String(viewport.width),
        height: String(viewport.height),
        type: 'png',
        waitUntil: 'networkidle'
      })

      const response = await fetch(
        \`https://screenshotapi.to/api/v1/screenshot?\${params}\`,
        { headers: { 'x-api-key': process.env.SCREENSHOT_API_KEY } }
      )

      const filename = \`\${page.name}-\${viewport.name}.png\`
      const buffer = Buffer.from(await response.arrayBuffer())
      fs.writeFileSync(path.join(outputDir, filename), buffer)
      console.log(\`✓ \${filename}\`)

      await new Promise(r => setTimeout(r, 500))
    }
  }
}

const baseUrl = process.argv[2] || 'https://yourapp.com'
const outputDir = process.argv[3] || 'screenshots/current'
captureAll(baseUrl, outputDir)`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					The comparison script
				</h2>
				<div className="mt-6">
					<CodeBlock
						language="javascript"
						title="compare.js"
						code={`const fs = require('fs')
const path = require('path')
const { PNG } = require('pngjs')
const pixelmatch = require('pixelmatch')

function compare(baselineDir, currentDir, diffDir) {
  fs.mkdirSync(diffDir, { recursive: true })
  const results = []

  const files = fs.readdirSync(currentDir).filter(f => f.endsWith('.png'))

  for (const file of files) {
    const baselinePath = path.join(baselineDir, file)
    const currentPath = path.join(currentDir, file)

    if (!fs.existsSync(baselinePath)) {
      results.push({ file, status: 'new', diffPercent: 0 })
      continue
    }

    const baseline = PNG.sync.read(fs.readFileSync(baselinePath))
    const current = PNG.sync.read(fs.readFileSync(currentPath))

    if (baseline.width !== current.width || baseline.height !== current.height) {
      results.push({ file, status: 'size-changed', diffPercent: 100 })
      continue
    }

    const diff = new PNG({ width: baseline.width, height: baseline.height })
    const mismatched = pixelmatch(
      baseline.data, current.data, diff.data,
      baseline.width, baseline.height,
      { threshold: 0.1 }
    )

    const diffPercent = (mismatched / (baseline.width * baseline.height)) * 100

    if (diffPercent > 0.5) {
      fs.writeFileSync(path.join(diffDir, file), PNG.sync.write(diff))
      results.push({ file, status: 'changed', diffPercent: Math.round(diffPercent * 100) / 100 })
    } else {
      results.push({ file, status: 'unchanged', diffPercent: 0 })
    }
  }

  return results
}

const results = compare('screenshots/baseline', 'screenshots/current', 'screenshots/diff')
const changed = results.filter(r => r.status !== 'unchanged')

if (changed.length > 0) {
  console.log('Visual changes detected:')
  changed.forEach(r => console.log(\`  \${r.file}: \${r.status} (\${r.diffPercent}%)\`))
  process.exit(1)
} else {
  console.log('No visual changes detected.')
}`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					GitHub Actions workflow
				</h2>
				<div className="mt-6">
					<CodeBlock
						language="yaml"
						title=".github/workflows/visual-test.yml"
						code={`name: Visual Regression Test

on:
  pull_request:
    branches: [main]

jobs:
  visual-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm install pngjs pixelmatch

      - name: Download baseline screenshots
        uses: actions/download-artifact@v4
        with:
          name: visual-baseline
          path: screenshots/baseline
        continue-on-error: true

      - name: Capture current screenshots
        env:
          SCREENSHOT_API_KEY: \${{ secrets.SCREENSHOT_API_KEY }}
        run: node visual-test.js https://preview-\${{ github.event.pull_request.number }}.yourapp.com screenshots/current

      - name: Compare screenshots
        id: compare
        run: node compare.js
        continue-on-error: true

      - name: Upload diff artifacts
        if: steps.compare.outcome == 'failure'
        uses: actions/upload-artifact@v4
        with:
          name: visual-diff-\${{ github.event.pull_request.number }}
          path: screenshots/diff/

      - name: Comment on PR
        if: steps.compare.outcome == 'failure'
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '⚠️ Visual changes detected. Check the diff artifacts for details.'
            })`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Updating baselines
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					When visual changes are intentional, update the baseline
					screenshots. Run the capture script against the main branch
					after merging:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="yaml"
						title="Update baseline on merge to main"
						code={`name: Update Visual Baseline

on:
  push:
    branches: [main]

jobs:
  update-baseline:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Capture baseline
        env:
          SCREENSHOT_API_KEY: \${{ secrets.SCREENSHOT_API_KEY }}
        run: node visual-test.js https://yourapp.com screenshots/baseline

      - name: Upload baseline
        uses: actions/upload-artifact@v4
        with:
          name: visual-baseline
          path: screenshots/baseline/
          overwrite: true`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Tips for reliable visual tests
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Use {`waitUntil=networkidle`} for consistent rendering. Hide
					dynamic content (timestamps, animations) with CSS or mock
					data. Test at fixed viewport sizes for deterministic
					screenshots. Set the pixelmatch threshold based on your
					tolerance for minor rendering differences. Start with a
					small set of critical pages and expand coverage over time.
				</p>
			</section>
		</ArticleLayout>
	)
}
