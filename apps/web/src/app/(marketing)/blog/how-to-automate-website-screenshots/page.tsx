import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock } from '@/components/seo'

export const metadata: Metadata = {
	title: 'How to Automate Website Screenshots (2025)',
	description:
		'Set up automated screenshot capture with cron jobs, GitHub Actions, and Node.js scheduled tasks. Monitor websites visually.'
}

export default function Page() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Blog', href: '/blog' },
				{ label: 'Automate Website Screenshots' }
			]}
			title="How to Automate Website Screenshots"
			description="Set up cron jobs, GitHub Actions workflows, and scheduled tasks to automatically capture website screenshots. Perfect for monitoring, reporting, and archiving."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'Article',
				headline: 'How to Automate Website Screenshots',
				dateModified: '2026-03-25',
				publisher: {
					'@type': 'Organization',
					name: 'ScreenshotAPI',
					url: 'https://screenshotapi.to'
				}
			}}
			faq={[
				{
					question:
						'What is the cheapest way to automate screenshots?',
					answer: 'A cron job on your existing server calling ScreenshotAPI is the cheapest approach. GitHub Actions is free for public repos and offers 2,000 free minutes/month for private repos.'
				},
				{
					question:
						'How often should I capture screenshots for monitoring?',
					answer: 'For visual monitoring, hourly captures are common. For compliance archiving, daily is typical. For change detection, every 15-30 minutes works well. Adjust based on how frequently the target site changes.'
				},
				{
					question:
						'Can I get notified when a website changes visually?',
					answer: 'Yes. Capture screenshots on a schedule, then compare each new screenshot against the previous one using pixel-diff libraries. Send a notification (Slack, email) when the difference exceeds a threshold.'
				},
				{
					question:
						'How do I handle API rate limits in automated pipelines?',
					answer: 'Add delays between requests (1-2 seconds), implement exponential backoff on 429 responses, and process URLs sequentially rather than in parallel if you have many targets.'
				}
			]}
			relatedPages={[
				{
					title: 'Build Visual Regression Testing',
					description: 'Detect visual bugs in CI/CD pipelines.',
					href: '/blog/how-to-build-visual-regression-testing-pipeline'
				},
				{
					title: 'Take Screenshots with JavaScript',
					description: 'Node.js screenshot capture basics.',
					href: '/blog/how-to-take-screenshots-with-javascript'
				},
				{
					title: 'Take Full-Page Screenshots',
					description: 'Capture entire scrollable pages.',
					href: '/blog/how-to-take-full-page-screenshots'
				}
			]}
		>
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Why automate screenshots?
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Automated screenshot capture powers visual website
					monitoring (detect outages, defacements, or layout breaks),
					compliance archiving (capture pages at regular intervals for
					legal records), competitor tracking (monitor pricing pages
					and landing pages), reporting dashboards (daily or weekly
					visual snapshots), and change detection (get notified when a
					page changes). With ScreenshotAPI, automating this is
					trivial — no browser infrastructure to maintain, just HTTP
					requests on a schedule.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Node.js scheduled task
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					A simple Node.js script that captures screenshots on a
					schedule:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="javascript"
						title="screenshot-cron.js"
						code={`const fs = require('fs')
const path = require('path')

const API_KEY = process.env.SCREENSHOT_API_KEY
const URLS = [
  'https://example.com',
  'https://yourapp.com/pricing',
  'https://competitor.com'
]

async function captureScreenshot(url) {
  const params = new URLSearchParams({
    url,
    width: '1440',
    height: '900',
    type: 'png',
    waitUntil: 'networkidle'
  })

  const response = await fetch(
    \`https://screenshotapi.to/api/v1/screenshot?\${params}\`,
    { headers: { 'x-api-key': API_KEY } }
  )

  if (!response.ok) throw new Error(\`HTTP \${response.status}\`)
  return Buffer.from(await response.arrayBuffer())
}

async function run() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const outputDir = path.join('screenshots', timestamp)
  fs.mkdirSync(outputDir, { recursive: true })

  for (const url of URLS) {
    const filename = new URL(url).hostname.replace(/\\./g, '_') + '.png'
    try {
      const buffer = await captureScreenshot(url)
      fs.writeFileSync(path.join(outputDir, filename), buffer)
      console.log(\`✓ \${url} → \${filename}\`)
    } catch (error) {
      console.error(\`✗ \${url}: \${error.message}\`)
    }
    await new Promise(r => setTimeout(r, 1000)) // rate limit
  }
}

run().catch(console.error)`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Cron job setup
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Run the script on a schedule using cron:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="bash"
						title="Crontab entry"
						code={`# Capture screenshots every hour
0 * * * * cd /path/to/project && node screenshot-cron.js >> /var/log/screenshots.log 2>&1

# Capture screenshots every day at 9 AM
0 9 * * * cd /path/to/project && SCREENSHOT_API_KEY=sk_live_xxx node screenshot-cron.js

# Capture screenshots every 15 minutes
*/15 * * * * cd /path/to/project && node screenshot-cron.js`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					GitHub Actions workflow
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Use GitHub Actions for free, managed screenshot automation:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="yaml"
						title=".github/workflows/screenshots.yml"
						code={`name: Scheduled Screenshots

on:
  schedule:
    - cron: '0 */6 * * *' # every 6 hours
  workflow_dispatch: # allow manual trigger

jobs:
  capture:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Capture screenshots
        env:
          SCREENSHOT_API_KEY: \${{ secrets.SCREENSHOT_API_KEY }}
        run: node screenshot-cron.js

      - name: Upload to artifacts
        uses: actions/upload-artifact@v4
        with:
          name: screenshots-\${{ github.run_number }}
          path: screenshots/
          retention-days: 30

      - name: Commit to repo (optional)
        run: |
          git config user.name "Screenshot Bot"
          git config user.email "bot@example.com"
          git add screenshots/
          git commit -m "chore: screenshots $(date -u +%Y-%m-%d)" || true
          git push || true`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Visual change detection
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					Compare screenshots over time to detect visual changes:
				</p>
				<div className="mt-6">
					<CodeBlock
						language="javascript"
						title="change-detection.js"
						code={`const { PNG } = require('pngjs')
const pixelmatch = require('pixelmatch')

function compareScreenshots(buffer1, buffer2) {
  const img1 = PNG.sync.read(buffer1)
  const img2 = PNG.sync.read(buffer2)

  if (img1.width !== img2.width || img1.height !== img2.height) {
    return { changed: true, diffPercent: 100 }
  }

  const diff = new PNG({ width: img1.width, height: img1.height })
  const mismatchedPixels = pixelmatch(
    img1.data, img2.data, diff.data,
    img1.width, img1.height,
    { threshold: 0.1 }
  )

  const totalPixels = img1.width * img1.height
  const diffPercent = (mismatchedPixels / totalPixels) * 100

  return {
    changed: diffPercent > 0.5, // > 0.5% pixels changed
    diffPercent: Math.round(diffPercent * 100) / 100,
    diffImage: PNG.sync.write(diff)
  }
}

// Usage: compare today's screenshot with yesterday's
const today = fs.readFileSync('screenshots/today/example_com.png')
const yesterday = fs.readFileSync('screenshots/yesterday/example_com.png')
const result = compareScreenshots(today, yesterday)

if (result.changed) {
  console.log(\`Page changed! \${result.diffPercent}% pixels different\`)
  fs.writeFileSync('diff.png', result.diffImage)
  // Send notification via Slack, email, etc.
}`}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Scaling tips
				</h2>
				<p className="mt-4 leading-relaxed text-muted-foreground">
					For large-scale automation, add a 1-2 second delay between
					requests to avoid rate limits. Process URLs sequentially or
					in small batches rather than all at once. Store screenshots
					in S3 or R2 with date-based prefixes for easy browsing. Use
					a queue system (BullMQ, SQS) for reliable processing with
					retries. Set up alerts for failed captures so you catch
					issues quickly.
				</p>
			</section>
		</ArticleLayout>
	)
}
