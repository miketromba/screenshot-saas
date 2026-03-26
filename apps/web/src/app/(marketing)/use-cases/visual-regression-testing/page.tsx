import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock, ComparisonTable } from '@/components/seo'

export const metadata: Metadata = {
	title: 'Visual Regression Testing API — Automated Screenshot Diffing',
	description:
		'Catch visual bugs before they ship. Use ScreenshotAPI to capture before/after screenshots in CI/CD and automate pixel-level visual regression testing.'
}

const captureScript = `const fs = require('fs');
const crypto = require('crypto');

const API_KEY = process.env.SCREENSHOT_API_KEY;
const BASE_URL = process.env.APP_URL || 'http://localhost:3000';

const pages = [
  '/',
  '/pricing',
  '/dashboard',
  '/settings',
  '/login'
];

async function captureScreenshots(label) {
  const dir = \`./screenshots/\${label}\`;
  fs.mkdirSync(dir, { recursive: true });

  for (const path of pages) {
    const url = \`\${BASE_URL}\${path}\`;
    const params = new URLSearchParams({
      url,
      width: '1440',
      height: '900',
      type: 'png',
      waitUntil: 'networkIdle'
    });

    const response = await fetch(
      \`https://screenshotapi.to/api/v1/screenshot?\${params}\`,
      { headers: { 'x-api-key': API_KEY } }
    );

    const buffer = Buffer.from(await response.arrayBuffer());
    const filename = path.replace(/\\//g, '_') || '_index';
    fs.writeFileSync(\`\${dir}/\${filename}.png\`, buffer);
    console.log(\`Captured: \${path}\`);
  }
}

// Usage: node capture.js baseline
// Usage: node capture.js current
const label = process.argv[2] || 'current';
captureScreenshots(label);`

const diffScript = `const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');
const fs = require('fs');

function compareScreenshots(baselinePath, currentPath, diffPath) {
  const baseline = PNG.sync.read(fs.readFileSync(baselinePath));
  const current = PNG.sync.read(fs.readFileSync(currentPath));

  const { width, height } = baseline;
  const diff = new PNG({ width, height });

  const mismatchedPixels = pixelmatch(
    baseline.data, current.data, diff.data,
    width, height,
    { threshold: 0.1 }
  );

  fs.writeFileSync(diffPath, PNG.sync.write(diff));

  const totalPixels = width * height;
  const diffPercentage = ((mismatchedPixels / totalPixels) * 100).toFixed(2);

  return { mismatchedPixels, diffPercentage, passed: diffPercentage < 0.5 };
}

// Compare all pages
const baselineDir = './screenshots/baseline';
const currentDir = './screenshots/current';
const diffDir = './screenshots/diff';
fs.mkdirSync(diffDir, { recursive: true });

const files = fs.readdirSync(baselineDir).filter(f => f.endsWith('.png'));
let allPassed = true;

for (const file of files) {
  const result = compareScreenshots(
    \`\${baselineDir}/\${file}\`,
    \`\${currentDir}/\${file}\`,
    \`\${diffDir}/\${file}\`
  );
  console.log(\`\${file}: \${result.diffPercentage}% diff — \${result.passed ? 'PASS' : 'FAIL'}\`);
  if (!result.passed) allPassed = false;
}

process.exit(allPassed ? 0 : 1);`

const githubActionsYml = `name: Visual Regression Tests

on:
  pull_request:
    branches: [main]

jobs:
  visual-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Start app
        run: npm run build && npm start &
        env:
          NODE_ENV: production

      - name: Wait for app
        run: npx wait-on http://localhost:3000 --timeout 30000

      - name: Capture current screenshots
        run: node scripts/capture.js current
        env:
          SCREENSHOT_API_KEY: \${{ secrets.SCREENSHOT_API_KEY }}
          APP_URL: http://localhost:3000

      - name: Compare with baseline
        id: diff
        run: node scripts/diff.js

      - name: Upload diff artifacts
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: visual-diff
          path: screenshots/diff/`

export default function VisualRegressionTestingPage() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Use Cases', href: '/use-cases' },
				{ label: 'Visual Regression Testing' }
			]}
			title="Visual Regression Testing"
			description="Catch visual bugs before they reach production. Capture screenshots in CI/CD, diff them against baselines, and fail builds when unexpected visual changes are detected."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'Article',
				headline: 'Visual Regression Testing with Screenshot API',
				description:
					'Automate visual regression testing in CI/CD with ScreenshotAPI.',
				dateModified: '2026-03-25',
				publisher: {
					'@type': 'Organization',
					name: 'ScreenshotAPI',
					url: 'https://screenshotapi.to'
				}
			}}
			faq={[
				{
					question: 'How is this different from Percy or Chromatic?',
					answer: 'Percy and Chromatic are full visual testing platforms with dashboards and approval workflows. ScreenshotAPI gives you the screenshot capture layer — you own the comparison logic, storage, and workflow. This is ideal if you want full control, lower cost, or need to integrate into a custom pipeline.'
				},
				{
					question: 'How many screenshots does a typical CI run use?',
					answer: "It depends on how many pages and viewport sizes you test. A typical project captures 5-20 pages at 1-3 viewport sizes, which means 5-60 screenshots per CI run. At $0.015-0.04 per screenshot, that's $0.08-$2.40 per run."
				},
				{
					question:
						'Can I test responsive layouts at different viewport sizes?',
					answer: 'Yes. ScreenshotAPI accepts custom width and height parameters, so you can capture the same page at mobile (375×812), tablet (768×1024), and desktop (1440×900) sizes. Run captures in parallel to keep CI times low.'
				},
				{
					question:
						'How do I handle dynamic content like dates or ads?',
					answer: 'Use CSS injection or the waitForSelector parameter to stabilize dynamic content before capture. For truly dynamic elements (ads, timestamps), mask those regions in your diff comparison by ignoring specific pixel areas.'
				},
				{
					question:
						'What threshold should I use for pixel comparison?',
					answer: 'A 0.1 threshold in pixelmatch catches meaningful changes while ignoring sub-pixel rendering differences. Set your pass/fail threshold at 0.5% diff — anything below is likely anti-aliasing or font rendering variance.'
				}
			]}
			relatedPages={[
				{
					title: 'Website Monitoring',
					description:
						'Detect visual breakage on production sites with scheduled captures.',
					href: '/use-cases/website-monitoring'
				},
				{
					title: 'ScreenshotAPI vs Playwright',
					description:
						'Managed API vs self-hosted browser automation for testing.',
					href: '/compare/screenshotapi-vs-playwright'
				},
				{
					title: 'ScreenshotAPI vs Browserless',
					description:
						'Purpose-built screenshots vs general headless browsers.',
					href: '/compare/screenshotapi-vs-browserless'
				}
			]}
		>
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					The cost of visual regressions
				</h2>
				<p className="mt-4 text-muted-foreground">
					A CSS change breaks the checkout button on mobile. A font
					update shifts layout on the pricing page. A dependency
					upgrade subtly alters component spacing. These visual
					regressions slip through unit tests and code review because
					the code is technically correct — it just looks wrong.
				</p>
				<p className="mt-3 text-muted-foreground">
					By the time users report visual bugs, the damage is done:
					lost conversions, support tickets, and eroded trust. Visual
					regression testing catches these issues in CI before they
					merge.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					How ScreenshotAPI enables visual testing
				</h2>
				<p className="mt-4 text-muted-foreground">
					The workflow is simple: capture baseline screenshots of your
					pages, then capture new screenshots on every PR. Diff the
					images pixel-by-pixel. If the diff exceeds your threshold,
					fail the build.
				</p>
				<ComparisonTable
					headers={['Percy/Chromatic', 'ScreenshotAPI + DIY']}
					rows={[
						{
							feature: 'Screenshot capture',
							values: [true, true]
						},
						{
							feature: 'Visual diff engine',
							values: ['Built-in', 'pixelmatch / resemble.js']
						},
						{
							feature: 'Approval dashboard',
							values: [true, 'GitHub PR artifacts']
						},
						{
							feature: 'Pricing model',
							values: [
								'Per-snapshot plans ($300+/mo)',
								'Pay-per-screenshot ($0.015)'
							]
						},
						{
							feature: 'Full control of pipeline',
							values: [false, true]
						},
						{
							feature: 'Custom comparison logic',
							values: ['Limited', 'Fully customizable']
						}
					]}
				/>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Step 1: Capture screenshots
				</h2>
				<p className="mt-4 text-muted-foreground">
					This script captures screenshots of all your key pages. Run
					it once to generate baselines, then on every PR to capture
					the current state.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="javascript"
						title="scripts/capture.js"
						code={captureScript}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Step 2: Diff against baseline
				</h2>
				<p className="mt-4 text-muted-foreground">
					Compare current screenshots against baselines using
					pixelmatch. The script outputs a diff image highlighting
					changed pixels and exits with code 1 if any page exceeds the
					threshold.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="javascript"
						title="scripts/diff.js"
						code={diffScript}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Step 3: GitHub Actions integration
				</h2>
				<p className="mt-4 text-muted-foreground">
					Wire it all together in a GitHub Actions workflow. On every
					pull request, the pipeline captures screenshots, compares
					them, and uploads diff images as artifacts if tests fail.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="yaml"
						title=".github/workflows/visual-tests.yml"
						code={githubActionsYml}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Pricing estimate
				</h2>
				<p className="mt-4 text-muted-foreground">
					Visual regression testing costs depend on how many pages you
					test and how often your CI runs.
				</p>
				<div className="mt-4 overflow-hidden rounded-xl border border-border">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-border bg-muted/30">
								<th className="px-4 py-3 text-left font-semibold">
									Setup
								</th>
								<th className="px-4 py-3 text-left font-semibold">
									Screenshots/run
								</th>
								<th className="px-4 py-3 text-left font-semibold">
									Runs/mo
								</th>
								<th className="px-4 py-3 text-left font-semibold">
									Est. cost
								</th>
							</tr>
						</thead>
						<tbody>
							<tr className="border-b border-border/50">
								<td className="px-4 py-3">Small project</td>
								<td className="px-4 py-3 text-muted-foreground">
									10
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									50
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									$8–20
								</td>
							</tr>
							<tr className="border-b border-border/50">
								<td className="px-4 py-3">Mid-size app</td>
								<td className="px-4 py-3 text-muted-foreground">
									50
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									100
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									$75–200
								</td>
							</tr>
							<tr>
								<td className="px-4 py-3">Large platform</td>
								<td className="px-4 py-3 text-muted-foreground">
									200
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									200
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									$600–1,600
								</td>
							</tr>
						</tbody>
					</table>
				</div>
				<p className="mt-3 text-sm text-muted-foreground">
					Compare this to Percy at $399/mo for 25,000 snapshots or
					Chromatic at $149/mo for 35,000 snapshots. With
					ScreenshotAPI, you pay only for what you use.
				</p>
			</section>
		</ArticleLayout>
	)
}
