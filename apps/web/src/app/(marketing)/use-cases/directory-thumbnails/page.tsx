import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock, ComparisonTable } from '@/components/seo'

export const metadata: Metadata = {
	title: 'Website Thumbnail API for Directories & Listings',
	description:
		'Generate website preview thumbnails for directories, marketplaces, and link collections. ScreenshotAPI captures site thumbnails on submission with automatic caching.'
}

const batchCapture = `const API_KEY = process.env.SCREENSHOT_API_KEY;

async function captureWebsiteThumbnail(url, options = {}) {
  const params = new URLSearchParams({
    url,
    width: options.width || '1280',
    height: options.height || '800',
    type: 'webp',
    quality: '85',
    waitUntil: 'networkIdle'
  });

  const response = await fetch(
    \`https://screenshotapi.to/api/v1/screenshot?\${params}\`,
    { headers: { 'x-api-key': API_KEY } }
  );

  if (!response.ok) {
    throw new Error(\`Capture failed for \${url}: \${response.status}\`);
  }

  return Buffer.from(await response.arrayBuffer());
}

async function processNewListings(listings) {
  const results = [];

  for (const listing of listings) {
    try {
      const thumbnail = await captureWebsiteThumbnail(listing.url);
      const key = \`thumbnails/\${listing.id}.webp\`;

      // Upload to your storage (S3, R2, etc.)
      await uploadToStorage(key, thumbnail, 'image/webp');

      results.push({
        listingId: listing.id,
        thumbnailUrl: \`https://cdn.yoursite.com/\${key}\`,
        status: 'success'
      });
    } catch (error) {
      results.push({
        listingId: listing.id,
        status: 'failed',
        error: error.message
      });
    }
  }

  return results;
}`

const webhookHandler = `import express from 'express';

const app = express();
app.use(express.json());

// When a new listing is submitted, capture its thumbnail
app.post('/api/listings', async (req, res) => {
  const { name, url, category } = req.body;

  // Save listing to database
  const listing = await db.listings.create({
    data: { name, url, category, thumbnailStatus: 'pending' }
  });

  // Capture thumbnail asynchronously
  captureThumbnailAsync(listing.id, url);

  res.json({ id: listing.id, status: 'pending' });
});

async function captureThumbnailAsync(listingId, url) {
  try {
    const params = new URLSearchParams({
      url,
      width: '1280',
      height: '800',
      type: 'webp',
      quality: '85',
      waitUntil: 'networkIdle'
    });

    const response = await fetch(
      \`https://screenshotapi.to/api/v1/screenshot?\${params}\`,
      { headers: { 'x-api-key': process.env.SCREENSHOT_API_KEY } }
    );

    const buffer = Buffer.from(await response.arrayBuffer());
    const thumbnailUrl = await uploadToStorage(
      \`thumbnails/\${listingId}.webp\`, buffer
    );

    await db.listings.update({
      where: { id: listingId },
      data: { thumbnailUrl, thumbnailStatus: 'complete' }
    });
  } catch {
    await db.listings.update({
      where: { id: listingId },
      data: { thumbnailStatus: 'failed' }
    });
  }
}`

const pythonExample = `import requests
import os
from concurrent.futures import ThreadPoolExecutor

API_KEY = os.environ["SCREENSHOT_API_KEY"]

def capture_thumbnail(listing: dict) -> dict:
    """Capture a website thumbnail for a directory listing."""
    response = requests.get(
        "https://screenshotapi.to/api/v1/screenshot",
        params={
            "url": listing["url"],
            "width": "1280",
            "height": "800",
            "type": "webp",
            "quality": "85",
            "waitUntil": "networkIdle"
        },
        headers={"x-api-key": API_KEY},
        timeout=30
    )
    response.raise_for_status()
    return {
        "listing_id": listing["id"],
        "image": response.content,
        "content_type": "image/webp"
    }

def batch_capture(listings: list, max_workers: int = 5) -> list:
    """Capture thumbnails for multiple listings in parallel."""
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = [executor.submit(capture_thumbnail, l) for l in listings]
        return [f.result() for f in futures]`

export default function DirectoryThumbnailsPage() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Use Cases', href: '/use-cases' },
				{ label: 'Directory Thumbnails' }
			]}
			title="Website Thumbnails for Directories & Listings"
			description="Generate website preview thumbnails automatically when users submit listings. Build visually rich directories without manual screenshot work."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'Article',
				headline:
					'Website Thumbnails for Directories with Screenshot API',
				description:
					'Generate website preview thumbnails for directory and listing sites.',
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
						'How do I generate thumbnails when a listing is submitted?',
					answer: 'Trigger a ScreenshotAPI call asynchronously when a new listing is created. Store the thumbnail in your CDN or object storage (S3, R2) and save the URL to your database. This way the listing appears immediately with a "generating..." placeholder, and the thumbnail fills in within seconds.'
				},
				{
					question:
						'What image size and format works best for directory thumbnails?',
					answer: 'Capture at 1280×800 for a standard desktop viewport, then serve as WebP with quality=85. This gives sharp thumbnails at small file sizes (~30-80KB). You can also generate multiple sizes (small, medium, large) from one capture for different layout contexts.'
				},
				{
					question:
						'How do I keep thumbnails fresh when listed sites change?',
					answer: 'Schedule periodic re-captures (weekly or monthly) for all active listings. Alternatively, let listing owners request a thumbnail refresh. For high-traffic directories, prioritize re-capturing the most-viewed listings.'
				},
				{
					question:
						'Can I capture thumbnails for sites that block bots?',
					answer: 'ScreenshotAPI uses a real Chrome browser, so most sites render correctly. However, sites with aggressive bot protection may show a challenge page. The API handles most common scenarios, and you can use the delay parameter to wait for challenge completion.'
				},
				{
					question:
						'How much does it cost to generate thumbnails at scale?',
					answer: "For a directory with 1,000 listings and monthly refreshes, that's 1,000 screenshots/month at $15-40. A larger directory with 10,000 listings refreshed monthly would be $150-400. New listing submissions add incrementally."
				}
			]}
			relatedPages={[
				{
					title: 'Link Previews',
					description:
						'Generate rich URL preview thumbnails for chat and social apps.',
					href: '/use-cases/link-previews'
				},
				{
					title: 'OG Image Generation',
					description:
						'Auto-generate Open Graph images for social sharing.',
					href: '/use-cases/og-image-generation'
				},
				{
					title: 'ScreenshotAPI vs Urlbox',
					description: 'Compare thumbnail APIs for directory sites.',
					href: '/compare/screenshotapi-vs-urlbox'
				}
			]}
		>
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					The problem with directory thumbnails
				</h2>
				<p className="mt-4 text-muted-foreground">
					Every directory, marketplace, and curated link collection
					needs website thumbnails. Listings without visual previews
					get significantly less engagement — users want to see what a
					site looks like before clicking through.
				</p>
				<p className="mt-3 text-muted-foreground">
					Building this yourself means running headless browsers,
					handling timeouts for slow sites, managing a queue for batch
					captures, and storing/serving images. It&apos;s a full
					microservice just for thumbnails.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					How ScreenshotAPI simplifies thumbnails
				</h2>
				<p className="mt-4 text-muted-foreground">
					Replace your thumbnail infrastructure with a single API call
					per listing. ScreenshotAPI handles browser rendering,
					JavaScript execution, and returns a clean WebP image ready
					for your CDN.
				</p>
				<ComparisonTable
					headers={['Self-hosted', 'ScreenshotAPI']}
					rows={[
						{
							feature: 'Infrastructure',
							values: [
								'Browser cluster + queue',
								'None — API call'
							]
						},
						{
							feature: 'Capture reliability',
							values: ['Frequent timeouts', '99.9% success rate']
						},
						{
							feature: 'JavaScript rendering',
							values: ['Manual configuration', 'Built-in']
						},
						{
							feature: 'Output formats',
							values: ['Varies', 'PNG, JPEG, WebP']
						},
						{
							feature: 'Concurrent captures',
							values: ['Limited by server', 'Unlimited']
						}
					]}
				/>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Batch capture on submission
				</h2>
				<p className="mt-4 text-muted-foreground">
					When new listings are submitted to your directory, capture
					thumbnails and upload them to your storage. This function
					processes multiple listings sequentially with error handling
					for individual failures.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="javascript"
						title="lib/thumbnails.js"
						code={batchCapture}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Async capture on listing creation
				</h2>
				<p className="mt-4 text-muted-foreground">
					For a smoother user experience, accept the listing
					immediately and capture the thumbnail asynchronously. The
					listing shows a placeholder until the thumbnail is ready.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="javascript"
						title="routes/listings.js"
						code={webhookHandler}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Python parallel capture
				</h2>
				<p className="mt-4 text-muted-foreground">
					For Python backends, use ThreadPoolExecutor to capture
					multiple thumbnails in parallel. This is useful for
					backfilling thumbnails for existing listings.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="python"
						title="services/thumbnails.py"
						code={pythonExample}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Pricing estimate
				</h2>
				<p className="mt-4 text-muted-foreground">
					Thumbnail costs scale linearly with your directory size.
					Each listing needs one screenshot on creation, plus periodic
					refreshes.
				</p>
				<div className="mt-4 overflow-hidden rounded-xl border border-border">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-border bg-muted/30">
								<th className="px-4 py-3 text-left font-semibold">
									Directory size
								</th>
								<th className="px-4 py-3 text-left font-semibold">
									New/mo
								</th>
								<th className="px-4 py-3 text-left font-semibold">
									Refresh cycle
								</th>
								<th className="px-4 py-3 text-left font-semibold">
									Est. cost/mo
								</th>
							</tr>
						</thead>
						<tbody>
							<tr className="border-b border-border/50">
								<td className="px-4 py-3">500 listings</td>
								<td className="px-4 py-3 text-muted-foreground">
									50
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									Monthly
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									$8–22
								</td>
							</tr>
							<tr className="border-b border-border/50">
								<td className="px-4 py-3">5,000 listings</td>
								<td className="px-4 py-3 text-muted-foreground">
									200
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									Monthly
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									$78–208
								</td>
							</tr>
							<tr>
								<td className="px-4 py-3">50,000 listings</td>
								<td className="px-4 py-3 text-muted-foreground">
									1,000
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									Quarterly
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									$280–750
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</section>
		</ArticleLayout>
	)
}
