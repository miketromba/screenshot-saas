import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock } from '@/components/seo'

export const metadata: Metadata = {
	title: 'GitHub Actions Screenshot API Integration — Visual Regression, PR Screenshots & Artifacts',
	description:
		'Automate website screenshots in GitHub Actions for visual regression testing, PR preview captures, and artifact storage. Complete workflow YAML examples.'
}

export default function GitHubActionsIntegrationPage() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Integrations', href: '/integrations' },
				{ label: 'GitHub Actions' }
			]}
			title="GitHub Actions Screenshot API Integration"
			description="Automate website screenshot capture in your CI/CD pipeline with GitHub Actions. Capture screenshots on every PR, run visual regression tests, and store results as artifacts."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'TechArticle',
				headline: 'GitHub Actions Screenshot API Integration',
				description:
					'How to automate website screenshots in GitHub Actions for visual regression testing.',
				dateModified: '2026-03-25',
				publisher: {
					'@type': 'Organization',
					name: 'ScreenshotAPI',
					url: 'https://screenshotapi.to'
				}
			}}
			faq={[
				{
					question: 'How do I store the API key in GitHub Actions?',
					answer: 'Add it as a repository secret: Settings > Secrets and variables > Actions > New repository secret. Name it SCREENSHOTAPI_KEY. Reference it in workflows using the secrets context.'
				},
				{
					question:
						'Can I capture screenshots of my preview deployment?',
					answer: 'Yes. Wait for the deployment to complete (e.g., Vercel preview URL), then capture screenshots of the preview. Use the deployment_status event or poll for the preview URL.'
				},
				{
					question: 'How do I compare screenshots between commits?',
					answer: 'Capture a baseline screenshot from the main branch and a new screenshot from the PR branch. Use an image comparison library like pixelmatch to detect visual differences.'
				},
				{
					question:
						'How many credits does visual regression testing use?',
					answer: 'Each screenshot costs 1 credit. A typical workflow captures 3–10 pages, so a PR costs 3–10 credits. At $0.015–$0.04 per credit, that is $0.05–$0.40 per PR.'
				},
				{
					question: 'Can I run screenshots on a schedule?',
					answer: 'Yes. Use the schedule trigger with a cron expression to capture screenshots daily or weekly for monitoring, archiving, or compliance purposes.'
				}
			]}
			relatedPages={[
				{
					title: 'Vercel Integration',
					description:
						'Deploy screenshot functions and capture preview deployments.',
					href: '/integrations/vercel'
				},
				{
					title: 'AWS Lambda Integration',
					description:
						'Serverless screenshot functions triggered from CI/CD.',
					href: '/integrations/aws-lambda'
				},
				{
					title: 'Next.js Integration',
					description:
						'Capture screenshots of your Next.js app in development.',
					href: '/integrations/nextjs'
				}
			]}
		>
			{/* Quick Start */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Quick start
				</h2>
				<p className="mt-3 text-muted-foreground">
					Add your API key as a GitHub Actions secret and create a
					workflow that captures screenshots on every push or pull
					request.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="bash"
						title="Add secret via GitHub CLI"
						code={`gh secret set SCREENSHOTAPI_KEY --body "sk_live_xxxxx"`}
					/>
				</div>
			</section>

			{/* Complete Workflow */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Screenshot capture workflow
				</h2>
				<p className="mt-3 text-muted-foreground">
					A complete GitHub Actions workflow that captures screenshots
					of specified pages, stores them as artifacts, and posts a
					summary comment on the PR.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="yaml"
						title=".github/workflows/screenshots.yml"
						code={`name: Capture Screenshots

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

permissions:
  contents: read
  pull-requests: write

jobs:
  screenshots:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Capture screenshots
        env:
          SCREENSHOTAPI_KEY: \${{ secrets.SCREENSHOTAPI_KEY }}
        run: |
          mkdir -p screenshots

          PAGES=(
            "https://yoursite.com"
            "https://yoursite.com/pricing"
            "https://yoursite.com/docs"
          )

          for page in "\${PAGES[@]}"; do
            FILENAME=$(echo "$page" | sed 's|https://||;s|/|_|g').png

            curl -s -o "screenshots/$FILENAME" \\
              -H "x-api-key: $SCREENSHOTAPI_KEY" \\
              "https://screenshotapi.to/api/v1/screenshot?url=$page&width=1440&height=900&type=png&waitUntil=networkidle"

            echo "Captured: $page -> $FILENAME"
          done

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: screenshots-\${{ github.sha }}
          path: screenshots/
          retention-days: 30

      - name: Comment on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const files = fs.readdirSync('screenshots');

            let body = '## Screenshots captured\\n\\n';
            body += \`Captured \${files.length} screenshots for commit \${context.sha.slice(0, 7)}\\n\\n\`;
            body += '| Page | Status |\\n|------|--------|\\n';

            for (const file of files) {
              const page = file.replace('.png', '').replace(/_/g, '/');
              const size = fs.statSync(\`screenshots/\${file}\`).size;
              body += \`| \${page} | ✅ \${(size / 1024).toFixed(1)} KB |\\n\`;
            }

            body += \`\\n📦 [Download artifacts](\${context.serverUrl}/\${context.repo.owner}/\${context.repo.repo}/actions/runs/\${context.runId})\\n\`;

            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body
            });`}
					/>
				</div>
			</section>

			{/* Visual Regression Testing */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Visual regression testing
				</h2>
				<p className="mt-3 text-muted-foreground">
					Compare screenshots between the main branch and the PR to
					detect unintended visual changes. Uses pixelmatch for
					pixel-level comparison.
				</p>
				<div className="mt-6 space-y-4">
					<CodeBlock
						language="yaml"
						title=".github/workflows/visual-regression.yml"
						code={`name: Visual Regression Test

on:
  pull_request:
    branches: [main]

permissions:
  contents: read
  pull-requests: write

jobs:
  visual-regression:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm install pixelmatch pngjs

      - name: Download baseline screenshots
        uses: actions/download-artifact@v4
        with:
          name: screenshots-baseline
          path: baseline/
        continue-on-error: true

      - name: Capture current screenshots
        env:
          SCREENSHOTAPI_KEY: \${{ secrets.SCREENSHOTAPI_KEY }}
        run: |
          mkdir -p current

          PAGES=(
            "https://yoursite.com"
            "https://yoursite.com/pricing"
          )

          for page in "\${PAGES[@]}"; do
            FILENAME=$(echo "$page" | sed 's|https://||;s|/|_|g').png
            curl -s -o "current/$FILENAME" \\
              -H "x-api-key: $SCREENSHOTAPI_KEY" \\
              "https://screenshotapi.to/api/v1/screenshot?url=$page&width=1440&height=900&type=png"
          done

      - name: Compare screenshots
        run: |
          node << 'SCRIPT'
          const fs = require('fs');
          const { PNG } = require('pngjs');
          const pixelmatch = require('pixelmatch');

          const baselineDir = 'baseline';
          const currentDir = 'current';
          const diffDir = 'diffs';
          fs.mkdirSync(diffDir, { recursive: true });

          if (!fs.existsSync(baselineDir)) {
            console.log('No baseline found. Skipping comparison.');
            process.exit(0);
          }

          const results = [];
          const files = fs.readdirSync(currentDir).filter(f => f.endsWith('.png'));

          for (const file of files) {
            const baselinePath = \`\${baselineDir}/\${file}\`;
            const currentPath = \`\${currentDir}/\${file}\`;

            if (!fs.existsSync(baselinePath)) {
              results.push({ file, status: 'new', diff: 0 });
              continue;
            }

            const baseline = PNG.sync.read(fs.readFileSync(baselinePath));
            const current = PNG.sync.read(fs.readFileSync(currentPath));

            const { width, height } = baseline;
            const diff = new PNG({ width, height });

            const mismatchedPixels = pixelmatch(
              baseline.data, current.data, diff.data,
              width, height, { threshold: 0.1 }
            );

            const totalPixels = width * height;
            const diffPercent = ((mismatchedPixels / totalPixels) * 100).toFixed(2);

            fs.writeFileSync(\`\${diffDir}/\${file}\`, PNG.sync.write(diff));
            results.push({ file, status: 'compared', diff: diffPercent });
          }

          fs.writeFileSync('diff-results.json', JSON.stringify(results, null, 2));
          console.log('Results:', JSON.stringify(results, null, 2));

          const failures = results.filter(r => parseFloat(r.diff) > 1);
          if (failures.length > 0) {
            console.log(\`\\n⚠️ \${failures.length} page(s) have >1% visual diff\`);
            process.exit(1);
          }
          SCRIPT

      - name: Upload diff artifacts
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: visual-diffs-\${{ github.sha }}
          path: |
            diffs/
            diff-results.json
          retention-days: 14`}
					/>
				</div>
			</section>

			{/* Scheduled Capture */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Scheduled screenshot capture
				</h2>
				<p className="mt-3 text-muted-foreground">
					Capture screenshots on a schedule for monitoring, archiving,
					or compliance. Run daily or weekly and store results as
					artifacts or push to S3.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="yaml"
						title=".github/workflows/scheduled-screenshots.yml"
						code={`name: Scheduled Screenshots

on:
  schedule:
    - cron: '0 8 * * 1-5' # Weekdays at 8am UTC
  workflow_dispatch: # Allow manual triggers

jobs:
  capture:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        viewport:
          - { width: 1440, height: 900, name: desktop }
          - { width: 768, height: 1024, name: tablet }
          - { width: 375, height: 812, name: mobile }
    steps:
      - name: Capture screenshots
        env:
          SCREENSHOTAPI_KEY: \${{ secrets.SCREENSHOTAPI_KEY }}
        run: |
          mkdir -p screenshots/\${{ matrix.viewport.name }}
          DATE=$(date +%Y-%m-%d)

          PAGES=(
            "https://yoursite.com"
            "https://yoursite.com/pricing"
            "https://yoursite.com/blog"
          )

          for page in "\${PAGES[@]}"; do
            FILENAME=\${DATE}_$(echo "$page" | sed 's|https://||;s|/|_|g').png

            curl -s -o "screenshots/\${{ matrix.viewport.name }}/$FILENAME" \\
              -H "x-api-key: $SCREENSHOTAPI_KEY" \\
              "https://screenshotapi.to/api/v1/screenshot?url=$page&width=\${{ matrix.viewport.width }}&height=\${{ matrix.viewport.height }}&type=png&waitUntil=networkidle"
          done

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: scheduled-\${{ matrix.viewport.name }}-\${{ github.run_id }}
          path: screenshots/
          retention-days: 90`}
					/>
				</div>
			</section>

			{/* Node.js Script */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Node.js capture script
				</h2>
				<p className="mt-3 text-muted-foreground">
					For more complex workflows, use a Node.js script instead of
					inline curl commands. This gives you better error handling,
					retries, and reporting.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="javascript"
						title="scripts/capture-screenshots.mjs"
						code={`import { writeFileSync, mkdirSync } from 'fs'

const API_BASE = 'https://screenshotapi.to/api/v1/screenshot'
const API_KEY = process.env.SCREENSHOTAPI_KEY
const OUTPUT_DIR = process.env.OUTPUT_DIR ?? 'screenshots'

const pages = [
	{ url: 'https://yoursite.com', name: 'homepage' },
	{ url: 'https://yoursite.com/pricing', name: 'pricing' },
	{ url: 'https://yoursite.com/docs', name: 'docs' },
	{ url: 'https://yoursite.com/blog', name: 'blog' }
]

mkdirSync(OUTPUT_DIR, { recursive: true })

const results = []

for (const page of pages) {
	const params = new URLSearchParams({
		url: page.url,
		width: '1440',
		height: '900',
		type: 'png',
		waitUntil: 'networkidle'
	})

	try {
		const response = await fetch(\`\${API_BASE}?\${params}\`, {
			headers: { 'x-api-key': API_KEY },
			signal: AbortSignal.timeout(30_000)
		})

		if (!response.ok) {
			throw new Error(\`HTTP \${response.status}\`)
		}

		const buffer = Buffer.from(await response.arrayBuffer())
		const filepath = \`\${OUTPUT_DIR}/\${page.name}.png\`
		writeFileSync(filepath, buffer)

		results.push({ page: page.name, status: 'ok', size: buffer.byteLength })
		console.log(\`✓ \${page.name} (\${(buffer.byteLength / 1024).toFixed(1)} KB)\`)

	} catch (error) {
		results.push({ page: page.name, status: 'failed', error: error.message })
		console.error(\`✗ \${page.name}: \${error.message}\`)
	}
}

writeFileSync(\`\${OUTPUT_DIR}/results.json\`, JSON.stringify(results, null, 2))

const failed = results.filter((r) => r.status === 'failed')
if (failed.length > 0) {
	console.error(\`\\n\${failed.length}/\${results.length} screenshots failed\`)
	process.exit(1)
}

console.log(\`\\nAll \${results.length} screenshots captured successfully\`)`}
					/>
				</div>
			</section>

			{/* Production Tips */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Production tips
				</h2>
				<ul className="mt-4 space-y-3 text-muted-foreground">
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Use artifact retention wisely.
							</strong>{' '}
							Set <code>retention-days</code> to 14–30 for PR
							screenshots and 90 for scheduled captures. Artifacts
							count toward GitHub storage limits.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Capture preview deployments.
							</strong>{' '}
							Use the <code>deployment_status</code> event to
							trigger screenshots after Vercel or Netlify deploys
							your preview branch.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Use matrix strategy for viewports.
							</strong>{' '}
							Capture desktop, tablet, and mobile screenshots in
							parallel using GitHub Actions&#39; matrix strategy
							for faster feedback.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Set a diff threshold.
							</strong>{' '}
							Anti-aliasing and font rendering differences cause
							small pixel diffs. Use a 0.1–1% threshold to avoid
							false positives in visual regression tests.
						</span>
					</li>
				</ul>
			</section>
		</ArticleLayout>
	)
}
