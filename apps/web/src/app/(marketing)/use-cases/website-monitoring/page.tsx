import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock, ComparisonTable } from '@/components/seo'

export const metadata: Metadata = {
	title: 'Website Visual Monitoring API — Detect Changes & Breakage',
	description:
		'Monitor websites for visual breakage, content changes, and defacement. ScreenshotAPI captures periodic screenshots for automated visual change detection.'
}

const monitorScript = `const fs = require('fs');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');

const API_KEY = process.env.SCREENSHOT_API_KEY;
const WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

const sites = [
  { name: 'Homepage', url: 'https://yoursite.com' },
  { name: 'Pricing', url: 'https://yoursite.com/pricing' },
  { name: 'Docs', url: 'https://yoursite.com/docs' }
];

async function captureScreenshot(url) {
  const params = new URLSearchParams({
    url,
    width: '1440',
    height: '900',
    type: 'png',
    fullPage: 'false',
    waitUntil: 'networkIdle'
  });

  const response = await fetch(
    \`https://screenshotapi.to/api/v1/screenshot?\${params}\`,
    { headers: { 'x-api-key': API_KEY } }
  );

  return Buffer.from(await response.arrayBuffer());
}

async function compareImages(current, previousPath) {
  if (!fs.existsSync(previousPath)) return { isNew: true };

  const prev = PNG.sync.read(fs.readFileSync(previousPath));
  const curr = PNG.sync.read(current);
  const { width, height } = prev;
  const diff = new PNG({ width, height });

  const mismatchedPixels = pixelmatch(
    prev.data, curr.data, diff.data, width, height, { threshold: 0.1 }
  );

  const diffPercent = ((mismatchedPixels / (width * height)) * 100).toFixed(2);
  return { diffPercent, changed: parseFloat(diffPercent) > 1.0 };
}

async function sendAlert(site, diffPercent) {
  await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: \`⚠️ Visual change detected on \${site.name} (\${site.url})\\nDiff: \${diffPercent}%\`
    })
  });
}

async function monitor() {
  const dir = './monitoring/screenshots';
  fs.mkdirSync(dir, { recursive: true });

  for (const site of sites) {
    const filename = site.name.toLowerCase().replace(/\\s+/g, '-');
    const currentPath = \`\${dir}/\${filename}-current.png\`;
    const previousPath = \`\${dir}/\${filename}-previous.png\`;

    const screenshot = await captureScreenshot(site.url);
    const result = await compareImages(screenshot, previousPath);

    if (result.changed) {
      console.log(\`Change detected: \${site.name} — \${result.diffPercent}%\`);
      await sendAlert(site, result.diffPercent);
    }

    // Rotate: current becomes previous
    if (fs.existsSync(currentPath)) {
      fs.renameSync(currentPath, previousPath);
    }
    fs.writeFileSync(currentPath, screenshot);
  }
}

monitor();`

const cronExample = `# Run every hour
0 * * * * cd /app && node scripts/monitor.js

# Or with a process manager like PM2:
# pm2 start scripts/monitor.js --cron-restart="0 * * * *"

# Or as a GitHub Actions scheduled workflow:
name: Visual Monitor
on:
  schedule:
    - cron: '0 */2 * * *'  # Every 2 hours
jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: node scripts/monitor.js
        env:
          SCREENSHOT_API_KEY: \${{ secrets.SCREENSHOT_API_KEY }}
          SLACK_WEBHOOK_URL: \${{ secrets.SLACK_WEBHOOK_URL }}`

const pythonExample = `import requests
import os
import hashlib
from datetime import datetime
from pathlib import Path

API_KEY = os.environ["SCREENSHOT_API_KEY"]
STORAGE_DIR = Path("./monitoring/captures")

def capture_and_store(url: str, name: str) -> dict:
    """Capture a screenshot and store with timestamp."""
    response = requests.get(
        "https://screenshotapi.to/api/v1/screenshot",
        params={
            "url": url,
            "width": "1440",
            "height": "900",
            "type": "png",
            "waitUntil": "networkIdle"
        },
        headers={"x-api-key": API_KEY}
    )
    response.raise_for_status()

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    site_dir = STORAGE_DIR / name
    site_dir.mkdir(parents=True, exist_ok=True)

    filepath = site_dir / f"{timestamp}.png"
    filepath.write_bytes(response.content)

    return {
        "name": name,
        "url": url,
        "filepath": str(filepath),
        "timestamp": timestamp,
        "size_bytes": len(response.content)
    }

# Monitor multiple sites
sites = {
    "homepage": "https://yoursite.com",
    "pricing": "https://yoursite.com/pricing",
    "blog": "https://yoursite.com/blog"
}

for name, url in sites.items():
    result = capture_and_store(url, name)
    print(f"Captured {result['name']}: {result['filepath']}")`

export default function WebsiteMonitoringPage() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Use Cases', href: '/use-cases' },
				{ label: 'Website Monitoring' }
			]}
			title="Website Visual Monitoring"
			description="Detect visual breakage, content changes, and defacement automatically. Capture periodic screenshots and get alerted when your sites look different than expected."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'Article',
				headline: 'Website Visual Monitoring with Screenshot API',
				description:
					'Monitor websites for visual changes with periodic screenshot captures.',
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
						'How often should I capture monitoring screenshots?',
					answer: 'For most sites, every 1-2 hours is sufficient to catch issues quickly without excessive cost. Critical pages (checkout, login) may warrant more frequent checks — every 15-30 minutes. Low-priority pages can be checked daily.'
				},
				{
					question: 'What change threshold should trigger an alert?',
					answer: 'A 1% pixel diff threshold works well for most sites. Below 1%, changes are usually anti-aliasing or minor rendering differences. Above 1% indicates meaningful visual changes. Tune this based on your site — pages with dynamic content like ads may need a higher threshold.'
				},
				{
					question: "Can I monitor sites I don't own?",
					answer: 'Yes. ScreenshotAPI captures any publicly accessible URL. This is commonly used for monitoring third-party dependencies, partner sites, or competitor pages. Respect robots.txt and terms of service for sites you monitor.'
				},
				{
					question:
						'How do I handle pages with dynamic content like ads?',
					answer: 'Use the waitForSelector parameter to wait for your main content to load, and consider masking dynamic regions (ad slots, live feeds) in your comparison logic. Alternatively, capture only the above-the-fold portion with fixed viewport dimensions.'
				},
				{
					question:
						'What does website visual monitoring typically cost?',
					answer: 'Monitoring 10 pages every hour generates ~7,200 screenshots/month at $108-288 depending on your plan. Checking 10 pages every 2 hours halves that to ~3,600 screenshots/month at $54-144.'
				}
			]}
			relatedPages={[
				{
					title: 'Competitor Monitoring',
					description:
						'Track visual changes on competitor websites automatically.',
					href: '/use-cases/competitor-monitoring'
				},
				{
					title: 'Visual Regression Testing',
					description:
						'Catch visual bugs in CI/CD before they ship to production.',
					href: '/use-cases/visual-regression-testing'
				},
				{
					title: 'Web Page Archiving',
					description:
						'Preserve timestamped visual snapshots of any website.',
					href: '/use-cases/archiving'
				}
			]}
		>
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Why visual monitoring matters
				</h2>
				<p className="mt-4 text-muted-foreground">
					Uptime monitoring tells you if your site is reachable. It
					doesn&apos;t tell you if the page looks right. A 200 status
					code means nothing if your hero section is blank, the
					navigation is broken, or a deployment pushed a CSS
					regression that makes your site unreadable.
				</p>
				<p className="mt-3 text-muted-foreground">
					Visual monitoring captures what users actually see. By
					periodically screenshotting your pages and comparing them to
					previous captures, you can detect layout breakage, missing
					content, defacement, and unexpected changes before users
					report them.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					How ScreenshotAPI powers visual monitoring
				</h2>
				<p className="mt-4 text-muted-foreground">
					ScreenshotAPI captures consistent, high-fidelity screenshots
					on every request — same browser engine, same rendering, no
					variance between captures. This makes pixel-level comparison
					reliable and eliminates false positives from browser
					differences.
				</p>
				<ComparisonTable
					headers={['Manual Checking', 'ScreenshotAPI Monitoring']}
					rows={[
						{
							feature: 'Detection speed',
							values: ['Hours to days', 'Minutes']
						},
						{
							feature: 'Coverage',
							values: [
								'A few pages at best',
								'All critical pages'
							]
						},
						{
							feature: 'Consistency',
							values: ['Human error prone', 'Pixel-accurate']
						},
						{
							feature: 'Alerting',
							values: ['None — reactive', 'Slack, email, webhook']
						},
						{
							feature: 'History',
							values: ['No record', 'Timestamped visual history']
						}
					]}
				/>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Implementation: Node.js monitoring script
				</h2>
				<p className="mt-4 text-muted-foreground">
					This script captures screenshots of your monitored pages,
					compares them to previous captures, and sends a Slack alert
					when visual changes exceed the threshold.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="javascript"
						title="scripts/monitor.js"
						code={monitorScript}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Scheduling with cron or CI
				</h2>
				<p className="mt-4 text-muted-foreground">
					Run the monitoring script on a schedule using cron, PM2, or
					a GitHub Actions scheduled workflow. Choose a frequency
					based on how critical the pages are.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="yaml"
						title="Scheduling options"
						code={cronExample}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Python example with timestamped captures
				</h2>
				<p className="mt-4 text-muted-foreground">
					For Python-based monitoring systems, here&apos;s a capture
					function that stores screenshots with timestamps for
					historical tracking.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="python"
						title="monitoring/capture.py"
						code={pythonExample}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Pricing estimate
				</h2>
				<p className="mt-4 text-muted-foreground">
					Monitoring costs depend on how many pages you track and how
					frequently you capture.
				</p>
				<div className="mt-4 overflow-hidden rounded-xl border border-border">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-border bg-muted/30">
								<th className="px-4 py-3 text-left font-semibold">
									Setup
								</th>
								<th className="px-4 py-3 text-left font-semibold">
									Pages
								</th>
								<th className="px-4 py-3 text-left font-semibold">
									Frequency
								</th>
								<th className="px-4 py-3 text-left font-semibold">
									Est. cost/mo
								</th>
							</tr>
						</thead>
						<tbody>
							<tr className="border-b border-border/50">
								<td className="px-4 py-3">Basic</td>
								<td className="px-4 py-3 text-muted-foreground">
									5
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									Every 4 hours
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									$14–36
								</td>
							</tr>
							<tr className="border-b border-border/50">
								<td className="px-4 py-3">Standard</td>
								<td className="px-4 py-3 text-muted-foreground">
									15
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									Every hour
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									$162–432
								</td>
							</tr>
							<tr>
								<td className="px-4 py-3">Comprehensive</td>
								<td className="px-4 py-3 text-muted-foreground">
									50
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									Every 30 min
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									$1,080–2,880
								</td>
							</tr>
						</tbody>
					</table>
				</div>
				<p className="mt-3 text-sm text-muted-foreground">
					Start with critical pages at lower frequency and expand
					coverage as needed.
				</p>
			</section>
		</ArticleLayout>
	)
}
