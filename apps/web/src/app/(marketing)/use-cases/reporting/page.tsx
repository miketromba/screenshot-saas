import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock, ComparisonTable } from '@/components/seo'

export const metadata: Metadata = {
	title: 'Automated Dashboard Screenshot API — Reports & Email Embeds',
	description:
		'Capture dashboard and report screenshots automatically. Embed live dashboard snapshots in emails, Slack messages, PDFs, and stakeholder reports with ScreenshotAPI.'
}

const dashboardCapture = `const API_KEY = process.env.SCREENSHOT_API_KEY;

async function captureDashboard(dashboardUrl, options = {}) {
  const params = new URLSearchParams({
    url: dashboardUrl,
    width: options.width || '1440',
    height: options.height || '900',
    type: options.type || 'png',
    quality: '90',
    waitUntil: 'networkIdle',
    // Wait for charts/graphs to render
    waitForSelector: options.selector || '[data-loaded="true"]',
    delay: options.delay || '2000'
  });

  if (options.fullPage) {
    params.set('fullPage', 'true');
  }

  const response = await fetch(
    \`https://screenshotapi.to/api/v1/screenshot?\${params}\`,
    { headers: { 'x-api-key': API_KEY } }
  );

  if (!response.ok) {
    throw new Error(\`Dashboard capture failed: \${response.status}\`);
  }

  return Buffer.from(await response.arrayBuffer());
}

// Capture multiple dashboard views
const dashboards = [
  { name: 'Revenue', url: 'https://app.yoursite.com/dashboard/revenue' },
  { name: 'Users', url: 'https://app.yoursite.com/dashboard/users' },
  { name: 'Performance', url: 'https://app.yoursite.com/dashboard/performance' }
];

for (const dash of dashboards) {
  const image = await captureDashboard(dash.url, { delay: '3000' });
  await uploadToStorage(\`reports/daily/\${dash.name.toLowerCase()}.png\`, image);
  console.log(\`Captured: \${dash.name}\`);
}`

const emailReport = `import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const API_KEY = process.env.SCREENSHOT_API_KEY;

async function captureAndEmail(dashboards, recipients) {
  const images = [];

  for (const dash of dashboards) {
    const params = new URLSearchParams({
      url: dash.url,
      width: '1200',
      height: '800',
      type: 'png',
      quality: '90',
      waitUntil: 'networkIdle',
      delay: '3000'
    });

    const response = await fetch(
      \`https://screenshotapi.to/api/v1/screenshot?\${params}\`,
      { headers: { 'x-api-key': API_KEY } }
    );

    images.push({
      name: dash.name,
      buffer: Buffer.from(await response.arrayBuffer())
    });
  }

  // Build email with embedded dashboard images
  const date = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  await resend.emails.send({
    from: 'reports@yoursite.com',
    to: recipients,
    subject: \`Daily Dashboard Report — \${date}\`,
    html: \`
      <h1>Daily Dashboard Report</h1>
      <p>\${date}</p>
      \${images.map((img, i) => \`
        <h2>\${img.name}</h2>
        <img src="cid:dashboard-\${i}" width="600" />
      \`).join('')}
    \`,
    attachments: images.map((img, i) => ({
      filename: \`\${img.name.toLowerCase()}.png\`,
      content: img.buffer,
      contentId: \`dashboard-\${i}\`
    }))
  });
}

// Send daily report
await captureAndEmail(
  [
    { name: 'Revenue', url: 'https://app.yoursite.com/dashboard/revenue' },
    { name: 'Traffic', url: 'https://app.yoursite.com/dashboard/traffic' }
  ],
  ['team@yoursite.com', 'ceo@yoursite.com']
);`

const pythonExample = `import requests
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from datetime import datetime

API_KEY = os.environ["SCREENSHOT_API_KEY"]

def capture_dashboard(url: str, delay: int = 3000) -> bytes:
    """Capture a dashboard screenshot with wait for charts."""
    response = requests.get(
        "https://screenshotapi.to/api/v1/screenshot",
        params={
            "url": url,
            "width": "1440",
            "height": "900",
            "type": "png",
            "quality": "90",
            "waitUntil": "networkIdle",
            "delay": str(delay)
        },
        headers={"x-api-key": API_KEY},
        timeout=30
    )
    response.raise_for_status()
    return response.content

def send_dashboard_email(dashboards: list, recipients: list):
    """Capture dashboards and send as email report."""
    msg = MIMEMultipart("related")
    msg["Subject"] = f"Dashboard Report — {datetime.now().strftime('%B %d, %Y')}"
    msg["From"] = "reports@yoursite.com"
    msg["To"] = ", ".join(recipients)

    html_parts = ["<h1>Dashboard Report</h1>"]

    for i, dash in enumerate(dashboards):
        image_data = capture_dashboard(dash["url"])
        cid = f"dashboard_{i}"

        html_parts.append(f"<h2>{dash['name']}</h2>")
        html_parts.append(f'<img src="cid:{cid}" width="600" />')

        img = MIMEImage(image_data, "png")
        img.add_header("Content-ID", f"<{cid}>")
        msg.attach(img)

    html_body = MIMEText("\\n".join(html_parts), "html")
    msg.attach(html_body)

    with smtplib.SMTP("smtp.yoursite.com", 587) as server:
        server.starttls()
        server.login(os.environ["SMTP_USER"], os.environ["SMTP_PASS"])
        server.send_message(msg)

# Generate and email daily report
send_dashboard_email(
    [
        {"name": "Revenue", "url": "https://app.yoursite.com/dashboard/revenue"},
        {"name": "Users", "url": "https://app.yoursite.com/dashboard/users"}
    ],
    ["team@yoursite.com"]
)`

export default function ReportingPage() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Use Cases', href: '/use-cases' },
				{ label: 'Automated Reporting' }
			]}
			title="Automated Dashboard & Report Screenshots"
			description="Capture dashboard screenshots on a schedule and embed them in emails, Slack messages, and PDF reports. Share visual snapshots with stakeholders who don't have dashboard access."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'Article',
				headline: 'Automated Dashboard Screenshots for Reports',
				description:
					'Capture dashboard screenshots and embed in reports and emails.',
				dateModified: '2026-03-25',
				publisher: {
					'@type': 'Organization',
					name: 'ScreenshotAPI',
					url: 'https://screenshotapi.to'
				}
			}}
			faq={[
				{
					question: 'How do I capture dashboards that require login?',
					answer: 'For authenticated dashboards, create a read-only reporting URL with an embedded auth token (e.g., a JWT with limited scope). Many dashboard tools like Metabase, Grafana, and Looker support public sharing links specifically for this purpose.'
				},
				{
					question:
						'How do I ensure charts are fully rendered before capture?',
					answer: 'Use two strategies: the delay parameter (e.g., delay=3000 for 3 seconds) and the waitForSelector parameter to wait for a specific element. Set a data attribute like data-loaded="true" on your dashboard container when all charts finish rendering.'
				},
				{
					question:
						'Can I capture dashboards from tools like Grafana or Metabase?',
					answer: 'Yes. Any dashboard tool that supports public/shared URLs works with ScreenshotAPI. Grafana has "share panel" links, Metabase has public sharing, and Looker has shared dashboards. Point ScreenshotAPI at the shared URL.'
				},
				{
					question: 'How do I embed screenshots in emails?',
					answer: 'Use CID (Content-ID) attachments in HTML emails. Attach the screenshot as an inline image with a Content-ID, then reference it with <img src="cid:your-id"> in the HTML body. This works across all major email clients.'
				},
				{
					question:
						'What resolution should I use for report screenshots?',
					answer: '1440×900 works well for full dashboard views. For email embeds, capture at 1200×800 and display at 600px wide for good quality on retina screens. For PDF embedding, use the full width your PDF layout allows.'
				}
			]}
			relatedPages={[
				{
					title: 'PDF-Quality Capture',
					description:
						'Full-page screenshots for PDF document generation.',
					href: '/use-cases/pdf-generation'
				},
				{
					title: 'Website Monitoring',
					description:
						'Periodic visual monitoring for breakage detection.',
					href: '/use-cases/website-monitoring'
				},
				{
					title: 'ScreenshotAPI vs Puppeteer',
					description:
						'Managed API vs self-hosted browsers for report generation.',
					href: '/compare/screenshotapi-vs-puppeteer'
				}
			]}
		>
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					The reporting problem
				</h2>
				<p className="mt-4 text-muted-foreground">
					Dashboards are great for real-time data, but not everyone
					has access — and not everyone wants to log in and navigate
					to the right view. Executives want a snapshot in their
					inbox. Stakeholders want metrics in their weekly PDF. Teams
					want charts in their Slack channel.
				</p>
				<p className="mt-3 text-muted-foreground">
					Manually screenshotting dashboards every morning is tedious
					and fragile. Miss a day, and the report doesn&apos;t go out.
					Change your dashboard layout, and the screenshots need
					adjusting. What should be automated is instead a daily
					chore.
				</p>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					How ScreenshotAPI automates report generation
				</h2>
				<p className="mt-4 text-muted-foreground">
					Capture any dashboard or web-based report as a high-quality
					image with a single API call. The <code>waitUntil</code>,
					<code>waitForSelector</code>, and <code>delay</code>{' '}
					parameters ensure charts and graphs are fully rendered
					before capture.
				</p>
				<ComparisonTable
					headers={['Manual Process', 'ScreenshotAPI']}
					rows={[
						{
							feature: 'Time per report',
							values: ['5-15 minutes', 'Automated']
						},
						{
							feature: 'Consistency',
							values: ['Varies by person', 'Identical every time']
						},
						{
							feature: 'Scheduling',
							values: [
								'Requires someone available',
								'Cron / CI / serverless'
							]
						},
						{
							feature: 'Multiple dashboards',
							values: ['Linear manual effort', 'Parallel capture']
						},
						{
							feature: 'Chart rendering',
							values: [
								'Hope it loaded',
								'waitForSelector guarantee'
							]
						}
					]}
				/>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Capturing dashboard screenshots
				</h2>
				<p className="mt-4 text-muted-foreground">
					This function captures a dashboard with smart waiting — it
					waits for network activity to settle and for a specific
					selector to appear, ensuring all charts and data are
					rendered.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="javascript"
						title="lib/dashboard-capture.js"
						code={dashboardCapture}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Email reports with embedded dashboards
				</h2>
				<p className="mt-4 text-muted-foreground">
					Capture multiple dashboard views and send them as an HTML
					email with inline images. Recipients see the dashboard
					snapshots directly in their inbox without clicking any
					links.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="javascript"
						title="scripts/email-report.js"
						code={emailReport}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Python email reporting
				</h2>
				<p className="mt-4 text-muted-foreground">
					A Python implementation that captures dashboards and sends
					them as email reports with embedded images using SMTP.
					Suitable for Django, Flask, or standalone scripts.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="python"
						title="daily_report.py"
						code={pythonExample}
					/>
				</div>
			</section>

			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Pricing estimate
				</h2>
				<p className="mt-4 text-muted-foreground">
					Report generation is a low-volume, high-value use case. A
					few screenshots per day can replace hours of manual work.
				</p>
				<div className="mt-4 overflow-hidden rounded-xl border border-border">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-border bg-muted/30">
								<th className="px-4 py-3 text-left font-semibold">
									Report cadence
								</th>
								<th className="px-4 py-3 text-left font-semibold">
									Dashboards
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
								<td className="px-4 py-3">
									Weekly executive report
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									3
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									12
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									&lt; $1
								</td>
							</tr>
							<tr className="border-b border-border/50">
								<td className="px-4 py-3">
									Daily team dashboard
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									5
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									150
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									$3–6
								</td>
							</tr>
							<tr>
								<td className="px-4 py-3">
									Multi-team, multi-dashboard
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									15
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									450
								</td>
								<td className="px-4 py-3 text-muted-foreground">
									$7–18
								</td>
							</tr>
						</tbody>
					</table>
				</div>
				<p className="mt-3 text-sm text-muted-foreground">
					Reporting is one of the most affordable use cases. Even
					comprehensive daily reports for multiple teams stay under
					$20/month.
				</p>
			</section>
		</ArticleLayout>
	)
}
