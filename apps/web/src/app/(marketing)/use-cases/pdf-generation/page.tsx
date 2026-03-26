import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock, ComparisonTable } from '@/components/seo'

export const metadata: Metadata = {
	title: 'PDF-Quality Web Page Capture API — Full-Page Screenshots',
	description:
		'Capture full web pages as high-resolution images for PDFs, reports, and print. ScreenshotAPI renders complete pages with pixel-perfect quality for document generation.'
}

const fullPageCapture = `const API_KEY = process.env.SCREENSHOT_API_KEY;

async function captureFullPage(url, options = {}) {
  const params = new URLSearchParams({
    url,
    width: options.width || '1440',
    type: 'png',
    quality: '100',
    fullPage: 'true',
    waitUntil: 'networkIdle',
    colorScheme: options.colorScheme || 'light'
  });

  const response = await fetch(
    \`https://screenshotapi.to/api/v1/screenshot?\${params}\`,
    { headers: { 'x-api-key': API_KEY } }
  );

  if (!response.ok) {
    throw new Error(\`Capture failed: \${response.status}\`);
  }

  return Buffer.from(await response.arrayBuffer());
}

// Capture a full-page screenshot for PDF embedding
const pageImage = await captureFullPage('https://yoursite.com/report/q1-2026');

// Save locally or upload to storage
fs.writeFileSync('report-screenshot.png', pageImage);`

const pdfEmbedExample = `import PDFDocument from 'pdfkit';
import fs from 'fs';

const API_KEY = process.env.SCREENSHOT_API_KEY;

async function generateReportPDF(pageUrl, outputPath) {
  // Capture the web page as a full-page image
  const params = new URLSearchParams({
    url: pageUrl,
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

  const imageBuffer = Buffer.from(await response.arrayBuffer());

  // Create PDF with the screenshot
  const doc = new PDFDocument({ size: 'A4', margin: 0 });
  doc.pipe(fs.createWriteStream(outputPath));

  // Scale image to fit A4 width (595 points)
  doc.image(imageBuffer, 0, 0, { width: 595 });

  doc.end();
  return outputPath;
}

await generateReportPDF(
  'https://app.yoursite.com/dashboard',
  './output/dashboard-report.pdf'
);`

const pythonExample = `import requests
import os
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from io import BytesIO
from PIL import Image

API_KEY = os.environ["SCREENSHOT_API_KEY"]

def capture_page_as_image(url: str) -> bytes:
    """Capture a full-page screenshot at print quality."""
    response = requests.get(
        "https://screenshotapi.to/api/v1/screenshot",
        params={
            "url": url,
            "width": "1440",
            "type": "png",
            "quality": "100",
            "fullPage": "true",
            "waitUntil": "networkIdle",
            "colorScheme": "light"
        },
        headers={"x-api-key": API_KEY},
        timeout=60
    )
    response.raise_for_status()
    return response.content

def create_pdf_from_screenshots(urls: list, output_path: str):
    """Create a PDF document from multiple page screenshots."""
    c = canvas.Canvas(output_path, pagesize=A4)
    page_width, page_height = A4

    for url in urls:
        image_bytes = capture_page_as_image(url)
        img = Image.open(BytesIO(image_bytes))

        # Scale to fit page width
        scale = page_width / img.width
        scaled_height = img.height * scale

        # Save temp image for reportlab
        temp_path = f"/tmp/capture_{hash(url)}.png"
        img.save(temp_path)

        c.drawImage(temp_path, 0, page_height - scaled_height,
                     width=page_width, height=scaled_height)
        c.showPage()

    c.save()

# Generate a multi-page PDF from web pages
create_pdf_from_screenshots(
    ["https://yoursite.com/report/summary",
     "https://yoursite.com/report/details",
     "https://yoursite.com/report/charts"],
    "quarterly_report.pdf"
)`

export default function PdfGenerationPage() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Use Cases', href: '/use-cases' },
				{ label: 'PDF-Quality Image Generation' }
			]}
			title="PDF-Quality Web Page Capture"
			description="Capture full web pages as high-resolution images for PDFs, documents, and print materials. Render complete pages with pixel-perfect quality using a simple API."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'Article',
				headline: 'PDF-Quality Web Page Capture with Screenshot API',
				description:
					'Capture full web pages as high-resolution images for documents and print.',
				dateModified: '2026-03-25',
				publisher: {
					'@type': 'Organization',
					name: 'ScreenshotAPI',
					url: 'https://screenshotapi.to'
				}
			}}
			faq={[
				{
					question: 'Can ScreenshotAPI capture full-length pages?',
					answer: 'Yes. Set fullPage=true to capture the entire scrollable page, not just the viewport. This works for pages of any length — blog posts, documentation, dashboards, and reports are all captured in full.'
				},
				{
					question:
						'What resolution should I use for print-quality captures?',
					answer: 'Use width=1440 or wider with quality=100 and type=png for lossless quality. PNG is best for text-heavy content. For photos, JPEG at quality=95 offers a good balance of quality and file size.'
				},
				{
					question: 'How do I embed screenshots in a PDF?',
					answer: 'Capture the page as a PNG, then embed it in a PDF using a library like PDFKit (Node.js), ReportLab (Python), or FPDF (PHP). Scale the image to fit your page dimensions (A4 is 595×842 points).'
				},
				{
					question: 'Can I force light mode for cleaner prints?',
					answer: "Yes. Use the colorScheme=light parameter to force light mode regardless of the site's default. This ensures clean, print-friendly output with white backgrounds and dark text."
				},
				{
					question: 'How long does a full-page capture take?',
					answer: 'Most full-page captures complete in 3-10 seconds depending on page length and complexity. Long pages with many images may take up to 15 seconds. Use the waitUntil=networkIdle parameter to ensure all content is loaded.'
				}
			]}
			relatedPages={[
				{
					title: 'Automated Reporting',
					description:
						'Capture dashboard screenshots for automated reports.',
					href: '/use-cases/reporting'
				},
				{
					title: 'Web Page Archiving',
					description:
						'Preserve visual snapshots of pages over time.',
					href: '/use-cases/archiving'
				},
				{
					title: 'ScreenshotAPI vs Puppeteer',
					description:
						'Skip the browser infrastructure for page captures.',
					href: '/compare/screenshotapi-vs-puppeteer'
				}
			]}
		>
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Why capture web pages as images?
				</h2>
				<p className="mt-4 text-muted-foreground">
					Web content doesn&apos;t always stay on the web. Teams need
					to include web pages in PDFs, pitch decks, legal documents,
					compliance reports, and printed materials. Converting a live
					web page into a static, shareable image preserves its exact
					visual appearance at a specific point in time.
				</p>
				<p className="mt-3 text-muted-foreground">
					Browser &quot;Print to PDF&quot; is unreliable — it
					reformats layouts, breaks CSS Grid/Flexbox, misses web
					fonts, and strips interactive elements. A screenshot
					captures exactly what users see, with perfect fidelity.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					How ScreenshotAPI delivers print quality
				</h2>
				<p className="mt-4 text-muted-foreground">
					ScreenshotAPI renders pages in a real Chrome browser and
					captures at the exact dimensions and quality you specify.
					Full-page mode captures the entire scrollable content, and
					PNG output ensures lossless quality for text and graphics.
				</p>
				<ComparisonTable
					headers={['Browser Print', 'ScreenshotAPI']}
					rows={[
						{
							feature: 'Layout fidelity',
							values: ['Reformats page', 'Pixel-perfect']
						},
						{
							feature: 'CSS Grid/Flexbox',
							values: ['Often broken', 'Rendered correctly']
						},
						{
							feature: 'Web fonts',
							values: ['Sometimes missing', 'Fully rendered']
						},
						{
							feature: 'Full-page capture',
							values: [
								'Pagination issues',
								'Single continuous image'
							]
						},
						{
							feature: 'Automation',
							values: ['Manual or fragile', 'Simple API call']
						},
						{
							feature: 'Dark/light mode',
							values: ['System default', 'Force either mode']
						}
					]}
				/>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Full-page capture in JavaScript
				</h2>
				<p className="mt-4 text-muted-foreground">
					Capture an entire web page as a single high-resolution
					image. The <code>fullPage</code> parameter captures all
					scrollable content, not just the visible viewport.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="javascript"
						title="lib/capture.js"
						code={fullPageCapture}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Embedding in PDFs with Node.js
				</h2>
				<p className="mt-4 text-muted-foreground">
					Capture a web page and embed it directly into a PDF document
					using PDFKit. This is useful for generating reports,
					proposals, or documentation from web-based dashboards.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="javascript"
						title="lib/pdf-report.js"
						code={pdfEmbedExample}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Multi-page PDF generation in Python
				</h2>
				<p className="mt-4 text-muted-foreground">
					Capture multiple web pages and assemble them into a
					multi-page PDF using Python&apos;s ReportLab library. Each
					page becomes a full-width image in the document.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="python"
						title="generate_report.py"
						code={pythonExample}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Pricing estimate
				</h2>
				<p className="mt-4 text-muted-foreground">
					PDF generation costs depend on how many pages you capture
					and how often. Full-page captures count as a single
					screenshot regardless of page length.
				</p>
				<div className="mt-4 overflow-hidden rounded-xl border border-border">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-border bg-muted/30">
								<th className="px-4 py-3 text-left font-semibold">
									Use case
								</th>
								<th className="px-4 py-3 text-left font-semibold">
									Pages/report
								</th>
								<th className="px-4 py-3 text-left font-semibold">
									Reports/mo
								</th>
								<th className="px-4 py-3 text-left font-semibold">
									Est. cost
								</th>
							</tr>
						</thead>
						<tbody>
							<tr className="border-b border-border/50">
								<td className="px-4 py-3">Weekly reports</td>
								<td className="px-4 py-3 text-muted-foreground">
									3–5
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									4
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									$1–4
								</td>
							</tr>
							<tr className="border-b border-border/50">
								<td className="px-4 py-3">
									Client deliverables
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									5–10
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									20
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									$2–8
								</td>
							</tr>
							<tr>
								<td className="px-4 py-3">
									Automated daily reports
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									10
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									30
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									$5–12
								</td>
							</tr>
						</tbody>
					</table>
				</div>
				<p className="mt-3 text-sm text-muted-foreground">
					PDF capture is one of the lowest-cost use cases since
					reports are generated infrequently compared to real-time
					features like link previews.
				</p>
			</section>
		</ArticleLayout>
	)
}
