import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock, ComparisonTable } from '@/components/seo'

export const metadata: Metadata = {
	title: 'Web Page Archiving API — Visual Snapshots Over Time',
	description:
		'Archive web pages as visual snapshots. ScreenshotAPI captures timestamped screenshots for legal compliance, research, and historical preservation.'
}

const archiveScript = `const fs = require('fs');

const API_KEY = process.env.SCREENSHOT_API_KEY;

async function archivePage(url, options = {}) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const params = new URLSearchParams({
    url,
    width: options.width || '1440',
    height: options.height || '900',
    type: 'png',
    quality: '100',
    fullPage: options.fullPage || 'true',
    waitUntil: 'networkIdle',
    colorScheme: 'light'
  });

  const response = await fetch(
    \`https://screenshotapi.to/api/v1/screenshot?\${params}\`,
    { headers: { 'x-api-key': API_KEY } }
  );

  if (!response.ok) throw new Error(\`Archive failed: \${response.status}\`);

  const buffer = Buffer.from(await response.arrayBuffer());

  // Organize by domain and date
  const domain = new URL(url).hostname;
  const dir = \`./archive/\${domain}/\${timestamp.slice(0, 10)}\`;
  fs.mkdirSync(dir, { recursive: true });

  const filename = \`\${timestamp}.png\`;
  fs.writeFileSync(\`\${dir}/\${filename}\`, buffer);

  // Save metadata alongside screenshot
  const metadata = {
    url,
    capturedAt: new Date().toISOString(),
    filename,
    sizeBytes: buffer.length,
    viewport: { width: params.get('width'), height: params.get('height') }
  };
  fs.writeFileSync(\`\${dir}/\${timestamp}.json\`, JSON.stringify(metadata, null, 2));

  return { ...metadata, path: \`\${dir}/\${filename}\` };
}

// Archive a list of URLs
const urls = [
  'https://example.com',
  'https://example.com/pricing',
  'https://example.com/terms'
];

for (const url of urls) {
  const result = await archivePage(url);
  console.log(\`Archived: \${result.url} → \${result.path}\`);
}`

const s3ArchiveExample = `import {
  S3Client,
  PutObjectCommand
} from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: 'us-east-1' });
const API_KEY = process.env.SCREENSHOT_API_KEY;
const BUCKET = process.env.ARCHIVE_BUCKET;

async function archiveToS3(url) {
  const timestamp = new Date().toISOString();
  const domain = new URL(url).hostname;

  const params = new URLSearchParams({
    url,
    width: '1440',
    type: 'png',
    quality: '100',
    fullPage: 'true',
    waitUntil: 'networkIdle'
  });

  const response = await fetch(
    \`https://screenshotapi.to/api/v1/screenshot?\${params}\`,
    { headers: { 'x-api-key': API_KEY } }
  );

  const buffer = Buffer.from(await response.arrayBuffer());
  const key = \`archives/\${domain}/\${timestamp.replace(/[:.]/g, '-')}.png\`;

  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: buffer,
    ContentType: 'image/png',
    Metadata: {
      'source-url': url,
      'captured-at': timestamp,
      'viewport-width': '1440'
    }
  }));

  return { bucket: BUCKET, key, timestamp };
}`

const pythonExample = `import requests
import os
import json
from datetime import datetime
from pathlib import Path

API_KEY = os.environ["SCREENSHOT_API_KEY"]
ARCHIVE_ROOT = Path("./archive")

def archive_page(url: str, full_page: bool = True) -> dict:
    """Capture and archive a web page with metadata."""
    from urllib.parse import urlparse
    domain = urlparse(url).hostname
    timestamp = datetime.now()

    response = requests.get(
        "https://screenshotapi.to/api/v1/screenshot",
        params={
            "url": url,
            "width": "1440",
            "type": "png",
            "quality": "100",
            "fullPage": str(full_page).lower(),
            "waitUntil": "networkIdle",
            "colorScheme": "light"
        },
        headers={"x-api-key": API_KEY},
        timeout=60
    )
    response.raise_for_status()

    # Organize: archive/<domain>/YYYY-MM-DD/
    date_str = timestamp.strftime("%Y-%m-%d")
    time_str = timestamp.strftime("%H%M%S")
    archive_dir = ARCHIVE_ROOT / domain / date_str
    archive_dir.mkdir(parents=True, exist_ok=True)

    # Save screenshot
    img_path = archive_dir / f"{time_str}.png"
    img_path.write_bytes(response.content)

    # Save metadata
    metadata = {
        "url": url,
        "captured_at": timestamp.isoformat(),
        "size_bytes": len(response.content),
        "full_page": full_page
    }
    meta_path = archive_dir / f"{time_str}.json"
    meta_path.write_text(json.dumps(metadata, indent=2))

    return metadata

# Archive multiple pages on a schedule
pages = [
    "https://example.com",
    "https://example.com/blog",
    "https://example.com/pricing"
]

for page in pages:
    result = archive_page(page)
    print(f"Archived {result['url']} at {result['captured_at']}")`

export default function ArchivingPage() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Use Cases', href: '/use-cases' },
				{ label: 'Web Page Archiving' }
			]}
			title="Web Page Archiving with Visual Snapshots"
			description="Preserve the visual state of any web page over time. Capture timestamped screenshots for legal compliance, research, competitive intelligence, and historical preservation."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'Article',
				headline: 'Web Page Archiving with Screenshot API',
				description:
					'Archive web pages as visual snapshots with timestamped captures.',
				dateModified: '2026-03-25',
				publisher: {
					'@type': 'Organization',
					name: 'ScreenshotAPI',
					url: 'https://screenshotapi.to'
				}
			}}
			faq={[
				{
					question: 'How is this different from the Wayback Machine?',
					answer: "The Wayback Machine archives HTML for replay, but doesn't guarantee visual fidelity — CSS, fonts, and JavaScript often break. ScreenshotAPI captures a pixel-perfect image of what the page actually looked like, which is more reliable for visual records and legal evidence."
				},
				{
					question:
						'Can I use archived screenshots as legal evidence?',
					answer: 'Screenshot archives with metadata (timestamp, URL, viewport) are commonly used as evidence of website content at a specific time. For stronger legal standing, also capture the HTTP response headers and consider using a timestamping service for the image files.'
				},
				{
					question: 'How should I organize archived screenshots?',
					answer: 'Organize by domain and date: archive/<domain>/YYYY-MM-DD/<timestamp>.png. Store metadata (URL, capture time, viewport) in a sidecar JSON file or database. This makes it easy to browse history for any site and date range.'
				},
				{
					question: 'How much storage do archives require?',
					answer: 'A full-page PNG screenshot of a typical page is 500KB–3MB. Archiving 10 pages daily generates about 5–30MB/day or 150–900MB/month. Storage is cheap — S3 costs about $0.023/GB/month, so even large archives are affordable.'
				},
				{
					question: 'Can I archive pages that require login?',
					answer: "ScreenshotAPI captures publicly accessible pages. For authenticated content, you'd need to set up a public-facing version or use the API with a pre-authenticated session URL. Most archiving use cases target public pages."
				}
			]}
			relatedPages={[
				{
					title: 'Website Monitoring',
					description:
						'Detect visual changes on your sites with periodic captures.',
					href: '/use-cases/website-monitoring'
				},
				{
					title: 'Competitor Monitoring',
					description: 'Track visual changes on competitor websites.',
					href: '/use-cases/competitor-monitoring'
				},
				{
					title: 'PDF-Quality Capture',
					description:
						'High-resolution page captures for documents and print.',
					href: '/use-cases/pdf-generation'
				}
			]}
		>
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Why archive web pages visually?
				</h2>
				<p className="mt-4 text-muted-foreground">
					Web pages are ephemeral. Content changes, pages get
					redesigned, and sites go offline entirely. For legal
					compliance, intellectual property disputes, competitive
					research, and historical records, you need proof of what a
					page looked like at a specific point in time.
				</p>
				<p className="mt-3 text-muted-foreground">
					HTML archiving tools like wget or the Wayback Machine save
					the source code, but CSS frameworks break, external
					resources disappear, and JavaScript-rendered content is
					lost. A screenshot captures exactly what a visitor saw —
					layout, fonts, images, and all — as a permanent visual
					record.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					ScreenshotAPI for archiving
				</h2>
				<p className="mt-4 text-muted-foreground">
					ScreenshotAPI renders pages in a real browser and captures
					full-page screenshots at the resolution you specify. Every
					capture is consistent, reproducible, and includes all
					dynamically-loaded content.
				</p>
				<ComparisonTable
					headers={['HTML Archive', 'Screenshot Archive']}
					rows={[
						{
							feature: 'Visual fidelity',
							values: [
								'Degrades over time',
								'Pixel-perfect forever'
							]
						},
						{
							feature: 'JavaScript content',
							values: ['Often missing', 'Fully captured']
						},
						{
							feature: 'External dependencies',
							values: [
								'Break when removed',
								'Self-contained image'
							]
						},
						{
							feature: 'Storage size',
							values: ['10-50MB per page', '0.5-3MB per page']
						},
						{
							feature: 'Legal evidence',
							values: ['Requires replay', 'Instant visual proof']
						},
						{
							feature: 'Searchable text',
							values: [true, 'With OCR']
						}
					]}
				/>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Local archiving with metadata
				</h2>
				<p className="mt-4 text-muted-foreground">
					This script captures full-page screenshots and stores them
					alongside JSON metadata organized by domain and date. Each
					archive entry includes the URL, timestamp, file size, and
					viewport dimensions.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="javascript"
						title="scripts/archive.js"
						code={archiveScript}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Cloud archiving with S3
				</h2>
				<p className="mt-4 text-muted-foreground">
					For production archiving, store screenshots in S3 or
					compatible object storage. S3 metadata fields record the
					source URL and capture timestamp directly on the object.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="javascript"
						title="lib/s3-archive.js"
						code={s3ArchiveExample}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Python archiving script
				</h2>
				<p className="mt-4 text-muted-foreground">
					A Python implementation for scheduled archiving. Run this as
					a daily cron job to build a visual history of any set of web
					pages.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="python"
						title="archive.py"
						code={pythonExample}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Pricing estimate
				</h2>
				<p className="mt-4 text-muted-foreground">
					Archiving costs depend on how many pages you track and how
					frequently you capture. Storage costs are separate and
					typically minimal.
				</p>
				<div className="mt-4 overflow-hidden rounded-xl border border-border">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-border bg-muted/30">
								<th className="px-4 py-3 text-left font-semibold">
									Scenario
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
								<td className="px-4 py-3">Legal compliance</td>
								<td className="px-4 py-3 text-muted-foreground">
									10
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									Weekly
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									$1–2
								</td>
							</tr>
							<tr className="border-b border-border/50">
								<td className="px-4 py-3">Research archive</td>
								<td className="px-4 py-3 text-muted-foreground">
									50
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									Daily
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									$23–60
								</td>
							</tr>
							<tr>
								<td className="px-4 py-3">
									Large-scale archive
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									500
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									Daily
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									$225–600
								</td>
							</tr>
						</tbody>
					</table>
				</div>
				<p className="mt-3 text-sm text-muted-foreground">
					Storage on S3 adds roughly $0.023/GB/month. A typical
					archive of 1,500 full-page screenshots takes about 2-4GB.
				</p>
			</section>
		</ArticleLayout>
	)
}
