import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock, ComparisonTable } from '@/components/seo'

export const metadata: Metadata = {
	title: 'Competitor Website Monitoring API — Track Visual Changes',
	description:
		'Track visual changes on competitor websites automatically. ScreenshotAPI captures scheduled screenshots for pricing, feature, and design change detection.'
}

const monitorScript = `const fs = require('fs');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch');

const API_KEY = process.env.SCREENSHOT_API_KEY;
const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL;

const competitors = [
  {
    name: 'Competitor A',
    pages: [
      { label: 'Homepage', url: 'https://competitor-a.com' },
      { label: 'Pricing', url: 'https://competitor-a.com/pricing' },
      { label: 'Features', url: 'https://competitor-a.com/features' }
    ]
  },
  {
    name: 'Competitor B',
    pages: [
      { label: 'Homepage', url: 'https://competitor-b.com' },
      { label: 'Pricing', url: 'https://competitor-b.com/pricing' }
    ]
  }
];

async function capture(url) {
  const params = new URLSearchParams({
    url,
    width: '1440',
    height: '900',
    type: 'png',
    waitUntil: 'networkIdle'
  });

  const res = await fetch(
    \`https://screenshotapi.to/api/v1/screenshot?\${params}\`,
    { headers: { 'x-api-key': API_KEY } }
  );
  return Buffer.from(await res.arrayBuffer());
}

async function detectChanges(current, previousPath) {
  if (!fs.existsSync(previousPath)) return { isNew: true, diffPercent: 0 };

  const prev = PNG.sync.read(fs.readFileSync(previousPath));
  const curr = PNG.sync.read(current);
  const { width, height } = prev;
  const diff = new PNG({ width, height });

  const mismatched = pixelmatch(
    prev.data, curr.data, diff.data, width, height, { threshold: 0.1 }
  );

  const diffPercent = ((mismatched / (width * height)) * 100).toFixed(2);
  const diffPath = previousPath.replace('/previous/', '/diff/');
  fs.mkdirSync(fs.dirname(diffPath), { recursive: true });
  fs.writeFileSync(diffPath, PNG.sync.write(diff));

  return { diffPercent, changed: parseFloat(diffPercent) > 2.0, diffPath };
}

async function notifySlack(competitor, page, diffPercent) {
  await fetch(SLACK_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: [
        \`🔍 *Competitor change detected*\`,
        \`Company: \${competitor}\`,
        \`Page: \${page.label} (\${page.url})\`,
        \`Diff: \${diffPercent}%\`
      ].join('\\n')
    })
  });
}

async function run() {
  for (const competitor of competitors) {
    const slug = competitor.name.toLowerCase().replace(/\\s+/g, '-');

    for (const page of competitor.pages) {
      const pageSlug = page.label.toLowerCase().replace(/\\s+/g, '-');
      const dir = \`./competitors/\${slug}\`;
      const prevPath = \`\${dir}/previous/\${pageSlug}.png\`;
      const currPath = \`\${dir}/current/\${pageSlug}.png\`;

      const screenshot = await capture(page.url);
      const result = await detectChanges(screenshot, prevPath);

      if (result.changed) {
        await notifySlack(competitor.name, page, result.diffPercent);
      }

      // Rotate screenshots
      fs.mkdirSync(\`\${dir}/previous\`, { recursive: true });
      fs.mkdirSync(\`\${dir}/current\`, { recursive: true });
      if (fs.existsSync(currPath)) fs.renameSync(currPath, prevPath);
      fs.writeFileSync(currPath, screenshot);
    }
  }
}

run();`

const pythonExample = `import requests
import os
import json
from datetime import datetime
from pathlib import Path

API_KEY = os.environ["SCREENSHOT_API_KEY"]
WEBHOOK_URL = os.environ.get("SLACK_WEBHOOK_URL")

COMPETITORS = {
    "competitor-a": {
        "name": "Competitor A",
        "pages": {
            "pricing": "https://competitor-a.com/pricing",
            "features": "https://competitor-a.com/features",
            "homepage": "https://competitor-a.com"
        }
    },
    "competitor-b": {
        "name": "Competitor B",
        "pages": {
            "pricing": "https://competitor-b.com/pricing",
            "homepage": "https://competitor-b.com"
        }
    }
}

def capture_competitor_page(url: str) -> bytes:
    """Capture a competitor page screenshot."""
    response = requests.get(
        "https://screenshotapi.to/api/v1/screenshot",
        params={
            "url": url,
            "width": "1440",
            "height": "900",
            "type": "png",
            "waitUntil": "networkIdle"
        },
        headers={"x-api-key": API_KEY},
        timeout=30
    )
    response.raise_for_status()
    return response.content

def monitor_all():
    """Capture all competitor pages and store with timestamps."""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    results = []

    for slug, competitor in COMPETITORS.items():
        for page_name, url in competitor["pages"].items():
            screenshot = capture_competitor_page(url)

            output_dir = Path(f"./competitors/{slug}/{page_name}")
            output_dir.mkdir(parents=True, exist_ok=True)

            filepath = output_dir / f"{timestamp}.png"
            filepath.write_bytes(screenshot)

            results.append({
                "competitor": competitor["name"],
                "page": page_name,
                "url": url,
                "filepath": str(filepath),
                "size": len(screenshot)
            })
            print(f"Captured {competitor['name']} - {page_name}")

    return results

monitor_all()`

export default function CompetitorMonitoringPage() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Use Cases', href: '/use-cases' },
				{ label: 'Competitor Monitoring' }
			]}
			title="Competitor Website Monitoring"
			description="Track visual changes on competitor websites automatically. Get alerted when competitors change their pricing, features, landing pages, or design — without manually checking their sites."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'Article',
				headline: 'Competitor Website Monitoring with Screenshot API',
				description:
					'Track visual changes on competitor websites with automated screenshots.',
				dateModified: '2026-03-25',
				publisher: {
					'@type': 'Organization',
					name: 'ScreenshotAPI',
					url: 'https://screenshotapi.to'
				}
			}}
			faq={[
				{
					question: 'Is it legal to monitor competitor websites?',
					answer: "Viewing and screenshotting publicly accessible web pages is generally legal — you're capturing what any visitor can see. However, respect robots.txt directives, terms of service, and don't access authenticated or restricted content. Consult legal counsel for your specific jurisdiction."
				},
				{
					question: 'How often should I check competitor pages?',
					answer: 'Daily checks are sufficient for most competitive intelligence needs. For pricing pages, you might want twice-daily captures. Major campaigns or launches may warrant more frequent monitoring. Start with daily and adjust based on how often changes occur.'
				},
				{
					question: 'What pages are most important to monitor?',
					answer: 'Pricing pages are the highest-value target — they reveal strategy changes. Feature/product pages show roadmap direction. Landing pages and homepage reflect messaging changes. Blog/changelog pages signal new releases and positioning shifts.'
				},
				{
					question:
						'How do I reduce false positives from dynamic content?',
					answer: 'Set a higher diff threshold (2-5%) to filter out minor changes from ads, timestamps, and dynamic content. Focus monitoring on specific page sections if possible, and use the waitForSelector parameter to ensure key content is loaded before capture.'
				},
				{
					question:
						'Can I build a visual timeline of competitor changes?',
					answer: 'Yes. Store timestamped screenshots in S3 or local storage organized by competitor and date. Over time, this builds a visual history you can browse to understand how competitors evolve their sites, messaging, and pricing.'
				}
			]}
			relatedPages={[
				{
					title: 'Website Monitoring',
					description:
						'Monitor your own sites for visual breakage and changes.',
					href: '/use-cases/website-monitoring'
				},
				{
					title: 'Web Page Archiving',
					description:
						'Build timestamped visual archives of any website.',
					href: '/use-cases/archiving'
				},
				{
					title: 'Visual Regression Testing',
					description:
						'Catch visual bugs in CI/CD with automated screenshot diffing.',
					href: '/use-cases/visual-regression-testing'
				}
			]}
		>
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Why monitor competitor websites?
				</h2>
				<p className="mt-4 text-muted-foreground">
					Your competitors are constantly updating their pricing,
					features, messaging, and design. A pricing change can shift
					your competitive positioning overnight. A new feature launch
					might require an immediate response. A redesign could signal
					a strategic pivot.
				</p>
				<p className="mt-3 text-muted-foreground">
					Manually checking competitor sites is tedious and
					unreliable. You check sporadically, miss changes between
					visits, and have no record of what changed when. Automated
					visual monitoring captures every change with precise
					timestamps.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					How ScreenshotAPI enables competitor intelligence
				</h2>
				<p className="mt-4 text-muted-foreground">
					Schedule screenshot captures of competitor pages, compare
					them to previous captures, and get notified when significant
					visual changes are detected. Build a visual timeline of how
					competitors evolve over time.
				</p>
				<ComparisonTable
					headers={['Manual Checking', 'Automated Monitoring']}
					rows={[
						{
							feature: 'Coverage',
							values: [
								'A few pages when remembered',
								'All tracked pages, every day'
							]
						},
						{
							feature: 'Detection speed',
							values: ['Days to weeks', 'Within hours']
						},
						{
							feature: 'Change history',
							values: ['None', 'Full visual timeline']
						},
						{
							feature: 'Evidence',
							values: [
								'Memory / notes',
								'Timestamped screenshots'
							]
						},
						{
							feature: 'Time investment',
							values: ['30+ min/week', 'Fully automated']
						}
					]}
				/>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					JavaScript monitoring with Slack alerts
				</h2>
				<p className="mt-4 text-muted-foreground">
					This script captures screenshots of competitor pages,
					compares them to previous captures using pixel diffing, and
					sends Slack notifications when significant changes are
					detected.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="javascript"
						title="scripts/competitor-monitor.js"
						code={monitorScript}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Python implementation with timestamped storage
				</h2>
				<p className="mt-4 text-muted-foreground">
					A Python version that captures all competitor pages and
					stores them with timestamps, building a browsable visual
					history organized by competitor and page.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="python"
						title="competitor_monitor.py"
						code={pythonExample}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					What to monitor
				</h2>
				<p className="mt-4 text-muted-foreground">
					Focus your monitoring on the pages that reveal the most
					about competitor strategy:
				</p>
				<ul className="mt-4 space-y-3 text-muted-foreground">
					<li className="flex gap-2">
						<span className="font-semibold text-foreground">
							Pricing pages
						</span>
						<span>
							— The most valuable target. Price changes, new
							tiers, and feature bundling reveal strategic shifts.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="font-semibold text-foreground">
							Feature pages
						</span>
						<span>
							— New features, removed features, and changed
							descriptions show product direction.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="font-semibold text-foreground">
							Homepage
						</span>
						<span>
							— Messaging changes, new value propositions, and
							redesigns signal strategic pivots.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="font-semibold text-foreground">
							Blog / changelog
						</span>
						<span>
							— New posts, product announcements, and positioning
							updates.
						</span>
					</li>
				</ul>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Pricing estimate
				</h2>
				<p className="mt-4 text-muted-foreground">
					Competitor monitoring is typically low-volume — you&apos;re
					tracking a handful of pages per competitor, not thousands.
				</p>
				<div className="mt-4 overflow-hidden rounded-xl border border-border">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-border bg-muted/30">
								<th className="px-4 py-3 text-left font-semibold">
									Scope
								</th>
								<th className="px-4 py-3 text-left font-semibold">
									Competitors
								</th>
								<th className="px-4 py-3 text-left font-semibold">
									Pages each
								</th>
								<th className="px-4 py-3 text-left font-semibold">
									Est. cost/mo
								</th>
							</tr>
						</thead>
						<tbody>
							<tr className="border-b border-border/50">
								<td className="px-4 py-3">Focused</td>
								<td className="px-4 py-3 text-muted-foreground">
									3
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									3
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									$4–10
								</td>
							</tr>
							<tr className="border-b border-border/50">
								<td className="px-4 py-3">Comprehensive</td>
								<td className="px-4 py-3 text-muted-foreground">
									8
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									5
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									$18–48
								</td>
							</tr>
							<tr>
								<td className="px-4 py-3">Enterprise</td>
								<td className="px-4 py-3 text-muted-foreground">
									20
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									10
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									$90–240
								</td>
							</tr>
						</tbody>
					</table>
				</div>
				<p className="mt-3 text-sm text-muted-foreground">
					Estimates based on daily captures. Twice-daily doubles the
					cost but catches changes faster.
				</p>
			</section>
		</ArticleLayout>
	)
}
