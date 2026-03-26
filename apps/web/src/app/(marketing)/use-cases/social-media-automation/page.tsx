import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock, ComparisonTable } from '@/components/seo'

export const metadata: Metadata = {
	title: 'Social Media Image Automation API — Auto-Generate Social Cards',
	description:
		'Automatically generate social media images from web pages. Capture and resize screenshots for Twitter, LinkedIn, Facebook, and Instagram with ScreenshotAPI.'
}

const socialSizes = `const API_KEY = process.env.SCREENSHOT_API_KEY;

// Platform-specific dimensions
const SOCIAL_FORMATS = {
  twitter: { width: 1200, height: 628, label: 'Twitter/X Card' },
  linkedin: { width: 1200, height: 627, label: 'LinkedIn Post' },
  facebook: { width: 1200, height: 630, label: 'Facebook Share' },
  instagram: { width: 1080, height: 1080, label: 'Instagram Square' },
  pinterest: { width: 1000, height: 1500, label: 'Pinterest Pin' }
};

async function captureForPlatform(url, platform) {
  const format = SOCIAL_FORMATS[platform];
  if (!format) throw new Error(\`Unknown platform: \${platform}\`);

  const params = new URLSearchParams({
    url,
    width: String(format.width),
    height: String(format.height),
    type: 'png',
    quality: '90',
    waitUntil: 'networkIdle'
  });

  const response = await fetch(
    \`https://screenshotapi.to/api/v1/screenshot?\${params}\`,
    { headers: { 'x-api-key': API_KEY } }
  );

  if (!response.ok) throw new Error(\`Capture failed: \${response.status}\`);
  return Buffer.from(await response.arrayBuffer());
}

// Generate images for all platforms at once
async function captureAllPlatforms(url) {
  const results = {};
  for (const [platform, format] of Object.entries(SOCIAL_FORMATS)) {
    results[platform] = {
      ...format,
      image: await captureForPlatform(url, platform)
    };
  }
  return results;
}`

const automationPipeline = `import Fastify from 'fastify';

const app = Fastify();
const API_KEY = process.env.SCREENSHOT_API_KEY;

// Webhook: auto-generate social images when a blog post is published
app.post('/webhooks/post-published', async (request, reply) => {
  const { url, title, slug } = request.body;

  const platforms = ['twitter', 'linkedin', 'facebook'];
  const results = [];

  for (const platform of platforms) {
    const dimensions = {
      twitter: { w: 1200, h: 628 },
      linkedin: { w: 1200, h: 627 },
      facebook: { w: 1200, h: 630 }
    }[platform];

    const params = new URLSearchParams({
      url,
      width: String(dimensions.w),
      height: String(dimensions.h),
      type: 'png',
      waitUntil: 'networkIdle'
    });

    const response = await fetch(
      \`https://screenshotapi.to/api/v1/screenshot?\${params}\`,
      { headers: { 'x-api-key': API_KEY } }
    );

    const buffer = Buffer.from(await response.arrayBuffer());
    const key = \`social/\${slug}/\${platform}.png\`;
    await uploadToStorage(key, buffer);

    results.push({ platform, url: \`https://cdn.yoursite.com/\${key}\` });
  }

  // Optionally: auto-schedule social posts via Buffer, Hootsuite, etc.
  await scheduleSocialPosts(title, url, results);

  return { status: 'ok', images: results };
});`

const pythonExample = `import requests
import os
from dataclasses import dataclass

API_KEY = os.environ["SCREENSHOT_API_KEY"]

@dataclass
class SocialFormat:
    name: str
    width: int
    height: int

FORMATS = [
    SocialFormat("twitter", 1200, 628),
    SocialFormat("linkedin", 1200, 627),
    SocialFormat("facebook", 1200, 630),
    SocialFormat("instagram", 1080, 1080),
]

def generate_social_images(url: str, output_dir: str = "./social"):
    """Generate social media images for all platforms."""
    os.makedirs(output_dir, exist_ok=True)
    results = []

    for fmt in FORMATS:
        response = requests.get(
            "https://screenshotapi.to/api/v1/screenshot",
            params={
                "url": url,
                "width": str(fmt.width),
                "height": str(fmt.height),
                "type": "png",
                "quality": "90",
                "waitUntil": "networkIdle"
            },
            headers={"x-api-key": API_KEY},
            timeout=30
        )
        response.raise_for_status()

        filepath = f"{output_dir}/{fmt.name}.png"
        with open(filepath, "wb") as f:
            f.write(response.content)

        results.append({"platform": fmt.name, "path": filepath})
        print(f"Generated {fmt.name}: {fmt.width}x{fmt.height}")

    return results

# Generate images for a blog post
generate_social_images("https://yoursite.com/blog/new-feature-launch")`

export default function SocialMediaAutomationPage() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Use Cases', href: '/use-cases' },
				{ label: 'Social Media Automation' }
			]}
			title="Social Media Image Automation"
			description="Automatically generate platform-specific social media images from any URL. Capture web pages sized for Twitter, LinkedIn, Facebook, Instagram, and Pinterest — no design tools required."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'Article',
				headline: 'Social Media Image Automation with Screenshot API',
				description:
					'Auto-generate social media images from web pages for all platforms.',
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
						'What sizes do different social platforms require?',
					answer: "Twitter/X: 1200×628, LinkedIn: 1200×627, Facebook: 1200×630, Instagram: 1080×1080, Pinterest: 1000×1500. ScreenshotAPI lets you specify exact width and height to match each platform's requirements."
				},
				{
					question:
						'Can I automate this when a blog post is published?',
					answer: "Yes. Set up a webhook that triggers when content is published (e.g., from your CMS). The webhook calls ScreenshotAPI to capture the page at each platform's dimensions, then stores the images for social scheduling."
				},
				{
					question:
						'How do I ensure the page looks good at non-standard aspect ratios?',
					answer: 'The API captures exactly what a browser would show at the specified viewport size. For best results, ensure your pages have responsive layouts. You can also capture at a larger size and crop to the target dimensions.'
				},
				{
					question:
						'Can I capture dark mode versions for social posts?',
					answer: 'Yes. Use the colorScheme=dark parameter to capture the page in dark mode. This is great for developer-focused content that looks better with dark backgrounds on social media.'
				},
				{
					question: 'How quickly can social images be generated?',
					answer: 'Each screenshot takes 2-5 seconds. Generating images for 3-4 platforms takes 10-20 seconds total. For real-time workflows, run captures in parallel to reduce total time to 3-5 seconds for all platforms.'
				}
			]}
			relatedPages={[
				{
					title: 'OG Image Generation',
					description:
						'Generate Open Graph images for automatic social previews.',
					href: '/use-cases/og-image-generation'
				},
				{
					title: 'Link Previews',
					description:
						'Rich URL preview thumbnails for chat and social platforms.',
					href: '/use-cases/link-previews'
				},
				{
					title: 'Automated Reporting',
					description:
						'Capture dashboards for reports and social sharing.',
					href: '/use-cases/reporting'
				}
			]}
		>
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					The social image bottleneck
				</h2>
				<p className="mt-4 text-muted-foreground">
					Every blog post, product update, and landing page needs
					social images — and each platform has different size
					requirements. Twitter wants 1200×628, LinkedIn needs
					1200×627, Instagram requires 1080×1080 squares, and
					Pinterest prefers tall 1000×1500 pins.
				</p>
				<p className="mt-3 text-muted-foreground">
					Creating these manually means opening Figma or Canva,
					designing 3-5 variations, exporting, and uploading. For
					teams publishing content daily, this design tax adds up to
					hours of work per week. And the results are often generic
					templates that don&apos;t reflect the actual page content.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					How ScreenshotAPI automates social images
				</h2>
				<p className="mt-4 text-muted-foreground">
					Capture your web page at each platform&apos;s required
					dimensions. The screenshot shows the actual page content —
					not a generic template — giving each social post an
					authentic, unique visual.
				</p>
				<ComparisonTable
					headers={['Manual Design', 'ScreenshotAPI']}
					rows={[
						{
							feature: 'Time per post',
							values: ['15-30 minutes', '< 30 seconds']
						},
						{
							feature: 'Reflects actual content',
							values: ['Template-based', 'Real page capture']
						},
						{
							feature: 'Multi-platform sizes',
							values: ['Manual resize', 'API parameter']
						},
						{
							feature: 'Scalability',
							values: ['Linear with content', 'Fully automated']
						},
						{
							feature: 'Design skills needed',
							values: [true, false]
						}
					]}
				/>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Capture for all platforms
				</h2>
				<p className="mt-4 text-muted-foreground">
					This JavaScript module defines all platform dimensions and
					captures a URL at each size. Use it to generate a complete
					set of social images from a single URL.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="javascript"
						title="lib/social-images.js"
						code={socialSizes}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Automation pipeline with webhooks
				</h2>
				<p className="mt-4 text-muted-foreground">
					Wire ScreenshotAPI into your publishing workflow. When a
					blog post is published, a webhook triggers social image
					generation for all platforms and optionally schedules the
					posts via Buffer or Hootsuite.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="javascript"
						title="routes/webhooks.js"
						code={automationPipeline}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Python implementation
				</h2>
				<p className="mt-4 text-muted-foreground">
					Generate social media images for all platforms with Python.
					This script captures a URL at each platform&apos;s
					dimensions and saves the results locally.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="python"
						title="generate_social.py"
						code={pythonExample}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Pricing estimate
				</h2>
				<p className="mt-4 text-muted-foreground">
					Each platform-specific capture counts as one screenshot.
					Generating images for 3 platforms per post means 3
					screenshots per published piece of content.
				</p>
				<div className="mt-4 overflow-hidden rounded-xl border border-border">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-border bg-muted/30">
								<th className="px-4 py-3 text-left font-semibold">
									Content volume
								</th>
								<th className="px-4 py-3 text-left font-semibold">
									Platforms
								</th>
								<th className="px-4 py-3 text-left font-semibold">
									Screenshots/mo
								</th>
								<th className="px-4 py-3 text-left font-semibold">
									Est. cost
								</th>
							</tr>
						</thead>
						<tbody>
							<tr className="border-b border-border/50">
								<td className="px-4 py-3">4 posts/week</td>
								<td className="px-4 py-3 text-muted-foreground">
									3
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									48
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									$1–2
								</td>
							</tr>
							<tr className="border-b border-border/50">
								<td className="px-4 py-3">Daily publishing</td>
								<td className="px-4 py-3 text-muted-foreground">
									4
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									120
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									$2–5
								</td>
							</tr>
							<tr>
								<td className="px-4 py-3">
									Multi-author platform
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									5
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									500–2,000
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									$8–80
								</td>
							</tr>
						</tbody>
					</table>
				</div>
				<p className="mt-3 text-sm text-muted-foreground">
					Social media automation is extremely cost-effective since
					each piece of content only needs images generated once.
				</p>
			</section>
		</ArticleLayout>
	)
}
