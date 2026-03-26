import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
	title: 'Blog — Screenshot API Guides & Tutorials',
	description:
		'Developer guides, tutorials, and comparisons for website screenshot APIs. Learn how to capture screenshots in any language.'
}

const howToGuides = [
	{
		title: 'Take Screenshots with Python',
		description:
			'Capture website screenshots using Python and the requests library.',
		href: '/blog/how-to-take-screenshots-with-python',
		tag: 'Python'
	},
	{
		title: 'Take Screenshots with JavaScript',
		description:
			'Use fetch() or the ScreenshotAPI SDK in Node.js and the browser.',
		href: '/blog/how-to-take-screenshots-with-javascript',
		tag: 'JavaScript'
	},
	{
		title: 'Take Screenshots with Go',
		description:
			'Capture screenshots in Go with net/http — no headless browser needed.',
		href: '/blog/how-to-take-screenshots-with-go',
		tag: 'Go'
	},
	{
		title: 'Take Screenshots with Ruby',
		description:
			'Generate website screenshots in Ruby without Selenium or Ferrum.',
		href: '/blog/how-to-take-screenshots-with-ruby',
		tag: 'Ruby'
	},
	{
		title: 'Take Screenshots with PHP',
		description:
			'Capture screenshots in PHP using cURL — no Browsershot required.',
		href: '/blog/how-to-take-screenshots-with-php',
		tag: 'PHP'
	},
	{
		title: 'Take Screenshots with cURL',
		description:
			'Capture screenshots from the command line with cURL one-liners.',
		href: '/blog/how-to-take-screenshots-with-curl',
		tag: 'cURL'
	},
	{
		title: 'Take Screenshots with C#',
		description:
			'Capture website screenshots in C# with HttpClient — no Selenium needed.',
		href: '/blog/how-to-take-screenshots-with-csharp',
		tag: 'C#'
	},
	{
		title: 'Take Screenshots with Java',
		description:
			'Generate screenshots in Java using HttpClient instead of Selenium.',
		href: '/blog/how-to-take-screenshots-with-java',
		tag: 'Java'
	}
]

const taskGuides = [
	{
		title: 'Generate OG Images from Any URL',
		description:
			'Use ScreenshotAPI to generate Open Graph images for social sharing.',
		href: '/blog/how-to-generate-og-images-from-url',
		tag: 'OG Images'
	},
	{
		title: 'Take Full-Page Screenshots',
		description:
			'Capture entire scrollable pages with the fullPage parameter.',
		href: '/blog/how-to-take-full-page-screenshots',
		tag: 'Full Page'
	},
	{
		title: 'Capture Dark Mode Screenshots',
		description:
			'Force dark mode rendering with the colorScheme parameter.',
		href: '/blog/how-to-capture-dark-mode-screenshots',
		tag: 'Dark Mode'
	},
	{
		title: 'Build Link Previews',
		description:
			'Generate thumbnail previews for URLs in chat apps and platforms.',
		href: '/blog/how-to-build-link-previews',
		tag: 'Previews'
	},
	{
		title: 'Automate Website Screenshots',
		description:
			'Set up cron jobs and CI pipelines for automated screenshot capture.',
		href: '/blog/how-to-automate-website-screenshots',
		tag: 'Automation'
	},
	{
		title: 'Take Mobile Screenshots of Websites',
		description: 'Capture responsive screenshots at mobile viewport sizes.',
		href: '/blog/how-to-take-mobile-screenshots-of-websites',
		tag: 'Mobile'
	},
	{
		title: 'Convert HTML to Image',
		description:
			'Turn HTML/CSS into PNG or JPEG images using a screenshot API.',
		href: '/blog/how-to-convert-html-to-image',
		tag: 'HTML'
	},
	{
		title: 'Screenshot Single-Page Applications',
		description: 'Handle JS-rendered SPAs with smart wait strategies.',
		href: '/blog/how-to-screenshot-single-page-applications',
		tag: 'SPA'
	},
	{
		title: 'Build a Visual Regression Testing Pipeline',
		description:
			'Detect visual bugs with automated screenshot diffing in CI/CD.',
		href: '/blog/how-to-build-visual-regression-testing-pipeline',
		tag: 'Testing'
	},
	{
		title: 'Add Website Thumbnails to Your App',
		description:
			'Build a thumbnail service with caching for your application.',
		href: '/blog/how-to-add-website-thumbnails-to-your-app',
		tag: 'Thumbnails'
	}
]

const bestOfPages = [
	{
		title: '9 Best Screenshot APIs in 2025',
		description:
			'Side-by-side comparison of the top screenshot API providers.',
		href: '/blog/best-screenshot-apis',
		tag: 'Comparison'
	},
	{
		title: '5 Best Free Screenshot APIs',
		description:
			'Screenshot APIs with generous free tiers and open-source options.',
		href: '/blog/best-free-screenshot-apis',
		tag: 'Free'
	},
	{
		title: '7 Best OG Image Generators in 2025',
		description: 'Tools for generating Open Graph images at scale.',
		href: '/blog/best-og-image-generators',
		tag: 'OG Images'
	},
	{
		title: '6 Best URL to Image APIs',
		description:
			'Convert any URL into a high-quality image with these APIs.',
		href: '/blog/best-url-to-image-apis',
		tag: 'URL to Image'
	},
	{
		title: '5 Best HTML to Image APIs',
		description: 'Turn HTML and CSS into images with these rendering APIs.',
		href: '/blog/best-html-to-image-apis',
		tag: 'HTML to Image'
	}
]

const migrationGuides = [
	{
		title: 'Migrate from Puppeteer',
		description:
			'Replace your Puppeteer screenshot code with a simple API call.',
		href: '/blog/migrate-from-puppeteer',
		tag: 'Puppeteer'
	},
	{
		title: 'Migrate from Playwright',
		description: 'Switch from Playwright screenshots to ScreenshotAPI.',
		href: '/blog/migrate-from-playwright',
		tag: 'Playwright'
	},
	{
		title: 'Migrate from Urlbox',
		description:
			'Move from Urlbox to ScreenshotAPI with this parameter mapping guide.',
		href: '/blog/migrate-from-urlbox',
		tag: 'Urlbox'
	},
	{
		title: 'Migrate from Screenshotlayer',
		description:
			'Switch from Screenshotlayer to ScreenshotAPI step by step.',
		href: '/blog/migrate-from-screenshotlayer',
		tag: 'Screenshotlayer'
	},
	{
		title: 'Migrate from Browserless',
		description:
			'Replace Browserless screenshot endpoints with ScreenshotAPI.',
		href: '/blog/migrate-from-browserless',
		tag: 'Browserless'
	}
]

function BlogCard({
	title,
	description,
	href,
	tag
}: {
	title: string
	description: string
	href: string
	tag: string
}) {
	return (
		<Link
			href={href}
			className="group cursor-pointer rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:bg-muted/30"
		>
			<span className="inline-block rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
				{tag}
			</span>
			<h3 className="mt-3 font-semibold tracking-tight group-hover:text-primary">
				{title}
			</h3>
			<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
				{description}
			</p>
		</Link>
	)
}

function BlogSection({
	title,
	posts
}: {
	title: string
	posts: { title: string; description: string; href: string; tag: string }[]
}) {
	return (
		<section>
			<h2 className="text-2xl font-bold tracking-tight">{title}</h2>
			<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{posts.map(post => (
					<BlogCard key={post.href} {...post} />
				))}
			</div>
		</section>
	)
}

export default function BlogPage() {
	return (
		<div className="py-12 md:py-16">
			<div className="mx-auto max-w-6xl px-6">
				<header>
					<h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
						Blog
					</h1>
					<p className="mt-4 max-w-2xl text-lg text-muted-foreground">
						Developer guides, API comparisons, and tutorials for
						capturing website screenshots programmatically.
					</p>
				</header>

				<div className="mt-12 space-y-16">
					<BlogSection
						title="How-To Guides"
						posts={[...howToGuides, ...taskGuides]}
					/>
					<BlogSection title="Best Of" posts={bestOfPages} />
					<BlogSection
						title="Migration Guides"
						posts={migrationGuides}
					/>
				</div>
			</div>
		</div>
	)
}
