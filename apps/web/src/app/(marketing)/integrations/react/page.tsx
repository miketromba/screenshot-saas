import type { Metadata } from 'next'
import { ArticleLayout, CodeBlock } from '@/components/seo'

export const metadata: Metadata = {
	title: 'React Screenshot API Integration — Hooks, Components & React Query',
	description:
		'Capture website screenshots in React with a custom useScreenshot hook, loading/error states, and React Query caching. Copy-paste component examples.'
}

export default function ReactIntegrationPage() {
	return (
		<ArticleLayout
			breadcrumbs={[
				{ label: 'Home', href: '/' },
				{ label: 'Integrations', href: '/integrations' },
				{ label: 'React' }
			]}
			title="React Screenshot API Integration"
			description="Build screenshot capture into your React application with custom hooks, ready-made components, and React Query for smart caching and refetching."
			lastUpdated="March 25, 2026"
			jsonLd={{
				'@context': 'https://schema.org',
				'@type': 'TechArticle',
				headline: 'React Screenshot API Integration',
				description:
					'How to capture website screenshots in React with hooks and React Query.',
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
						'Can I call ScreenshotAPI directly from the browser?',
					answer: 'You should not expose your API key in client-side code. Instead, create a backend proxy (e.g., a Next.js API route or Express endpoint) and call that from your React app.'
				},
				{
					question: 'How do I cache screenshots in React?',
					answer: 'Use React Query (TanStack Query) with a staleTime of 5–60 minutes. This caches the screenshot in memory and avoids duplicate API calls when components remount.'
				},
				{
					question: 'What image format should I use for React apps?',
					answer: 'Use WebP for the smallest file size. If you need transparency, use PNG. Set quality to 80–85 for WebP for a good balance of file size and visual quality.'
				},
				{
					question:
						'How do I show a loading state while the screenshot loads?',
					answer: 'React Query provides isLoading and isError states. Use isLoading to show a skeleton placeholder, and isError to display a retry button or error message.'
				},
				{
					question: 'Does this work with React Server Components?',
					answer: 'The hooks shown here are for Client Components. For Server Components in Next.js, see the Next.js integration guide where you can call the API directly with fetch.'
				}
			]}
			relatedPages={[
				{
					title: 'Next.js Integration',
					description:
						'Server-side screenshot capture with API routes and ISR caching.',
					href: '/integrations/nextjs'
				},
				{
					title: 'Express Integration',
					description:
						'Build the backend proxy for your React screenshot components.',
					href: '/integrations/express'
				},
				{
					title: 'FastAPI Integration',
					description:
						'Python backend for serving screenshots to your React frontend.',
					href: '/integrations/fastapi'
				}
			]}
		>
			{/* Quick Start */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Quick start
				</h2>
				<p className="mt-3 text-muted-foreground">
					Since you should never expose your API key in client code,
					the React integration calls a backend proxy. This example
					assumes you have a <code>/api/screenshot</code> endpoint
					that forwards requests to ScreenshotAPI.
				</p>
			</section>

			{/* Installation */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Installation
				</h2>
				<p className="mt-3 text-muted-foreground">
					Install TanStack Query for data fetching, caching, and
					automatic refetching.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="bash"
						title="Terminal"
						code="npm install @tanstack/react-query"
					/>
				</div>
			</section>

			{/* Custom Hook */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Custom useScreenshot hook
				</h2>
				<p className="mt-3 text-muted-foreground">
					A reusable hook that fetches a screenshot from your backend
					proxy and returns an object URL for rendering. Includes
					loading and error states out of the box.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="typescript"
						title="hooks/use-screenshot.ts"
						code={`import { useQuery } from '@tanstack/react-query'

interface ScreenshotOptions {
	url: string
	width?: number
	height?: number
	type?: 'png' | 'jpeg' | 'webp'
	fullPage?: boolean
}

async function fetchScreenshot(options: ScreenshotOptions): Promise<string> {
	const params = new URLSearchParams({
		url: options.url,
		width: String(options.width ?? 1440),
		height: String(options.height ?? 900),
		type: options.type ?? 'webp',
		fullPage: String(options.fullPage ?? false)
	})

	const response = await fetch(\`/api/screenshot?\${params}\`)

	if (!response.ok) {
		throw new Error(\`Screenshot failed: \${response.status}\`)
	}

	const blob = await response.blob()
	return URL.createObjectURL(blob)
}

export function useScreenshot(options: ScreenshotOptions) {
	return useQuery({
		queryKey: ['screenshot', options],
		queryFn: () => fetchScreenshot(options),
		staleTime: 1000 * 60 * 30, // 30 minutes
		retry: 2,
		refetchOnWindowFocus: false
	})
}`}
					/>
				</div>
			</section>

			{/* Screenshot Component */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Screenshot component
				</h2>
				<p className="mt-3 text-muted-foreground">
					A drop-in component that displays a captured screenshot with
					loading skeleton, error state, and retry functionality.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="tsx"
						title="components/screenshot-preview.tsx"
						code={`'use client'

import { useScreenshot } from '@/hooks/use-screenshot'
import { useEffect } from 'react'

interface ScreenshotPreviewProps {
	url: string
	width?: number
	height?: number
	className?: string
}

export function ScreenshotPreview({
	url,
	width = 1440,
	height = 900,
	className
}: ScreenshotPreviewProps) {
	const { data: src, isLoading, isError, error, refetch } = useScreenshot({
		url,
		width,
		height,
		type: 'webp'
	})

	useEffect(() => {
		return () => {
			if (src) URL.revokeObjectURL(src)
		}
	}, [src])

	if (isLoading) {
		return (
			<div
				className={\`animate-pulse rounded-lg bg-muted \${className ?? ''}\`}
				style={{ aspectRatio: \`\${width}/\${height}\` }}
			/>
		)
	}

	if (isError) {
		return (
			<div className={\`flex flex-col items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 p-6 \${className ?? ''}\`}>
				<p className="text-sm text-red-600">
					{error instanceof Error ? error.message : 'Failed to load screenshot'}
				</p>
				<button
					onClick={() => refetch()}
					className="cursor-pointer rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-200"
				>
					Retry
				</button>
			</div>
		)
	}

	return (
		<img
			src={src}
			alt={\`Screenshot of \${url}\`}
			className={\`rounded-lg border shadow-sm \${className ?? ''}\`}
		/>
	)
}`}
					/>
				</div>
			</section>

			{/* Provider Setup */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Provider setup
				</h2>
				<p className="mt-3 text-muted-foreground">
					Wrap your app with the React Query provider to enable
					caching across all screenshot components.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="tsx"
						title="app/providers.tsx"
						code={`'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 1000 * 60 * 5,
						refetchOnWindowFocus: false
					}
				}
			})
	)

	return (
		<QueryClientProvider client={queryClient}>
			{children}
		</QueryClientProvider>
	)
}`}
					/>
				</div>
			</section>

			{/* Usage Example */}
			<section>
				<h2 className="text-2xl font-bold tracking-tight">
					Usage example
				</h2>
				<p className="mt-3 text-muted-foreground">
					Combine the hook and component to build a screenshot gallery
					or site preview tool.
				</p>
				<div className="mt-6">
					<CodeBlock
						language="tsx"
						title="app/gallery/page.tsx"
						code={`'use client'

import { ScreenshotPreview } from '@/components/screenshot-preview'

const sites = [
	'https://github.com',
	'https://vercel.com',
	'https://nextjs.org',
	'https://tailwindcss.com'
]

export default function GalleryPage() {
	return (
		<div className="mx-auto max-w-6xl p-8">
			<h1 className="text-3xl font-bold">Site Previews</h1>
			<div className="mt-8 grid gap-6 sm:grid-cols-2">
				{sites.map((url) => (
					<div key={url} className="space-y-2">
						<p className="text-sm font-medium">{url}</p>
						<ScreenshotPreview url={url} width={1440} height={900} />
					</div>
				))}
			</div>
		</div>
	)
}`}
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
								Revoke object URLs.
							</strong>{' '}
							Call <code>URL.revokeObjectURL()</code> when the
							component unmounts to prevent memory leaks.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Set a generous staleTime.
							</strong>{' '}
							Screenshots rarely change. A 30-minute staleTime
							avoids unnecessary API calls while keeping content
							fresh.
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Limit retries.
							</strong>{' '}
							Set <code>retry: 2</code> to avoid burning credits
							on URLs that consistently fail (e.g., sites that
							block headless browsers).
						</span>
					</li>
					<li className="flex gap-2">
						<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
						<span>
							<strong className="text-foreground">
								Prefetch on hover.
							</strong>{' '}
							Use <code>queryClient.prefetchQuery()</code> on link
							hover to start fetching the screenshot before the
							user navigates.
						</span>
					</li>
				</ul>
			</section>
		</ArticleLayout>
	)
}
