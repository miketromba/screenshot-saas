import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { highlight } from 'sugar-high'
import {
	CompetitorComparison,
	CreditPackTable,
	FeatureList,
	FreeTierBanner,
	PricingSummary,
	ScreenshotAPIPricing
} from '@/components/content/marketing-blocks'

function extractText(node: unknown): string {
	if (typeof node === 'string') return node
	if (Array.isArray(node)) return node.map(extractText).join('')
	if (node && typeof node === 'object' && 'props' in node) {
		return extractText(
			(node as { props: { children: unknown } }).props.children
		)
	}
	return String(node ?? '')
}

const mdxComponents = {
	ScreenshotAPIPricing,
	CreditPackTable,
	FreeTierBanner,
	FeatureList,
	CompetitorComparison,
	PricingSummary,
	pre({ children }: { children?: React.ReactNode }) {
		return (
			<div className="not-wysiwyg overflow-hidden rounded-xl border border-border bg-[oklch(0.17_0_0)]">
				<pre className="overflow-x-auto text-sm leading-relaxed">
					{children}
				</pre>
			</div>
		)
	},
	code({
		className,
		children
	}: {
		className?: string
		children?: React.ReactNode
	}) {
		const isBlock = className?.startsWith('language-')
		if (isBlock) {
			const lang = className?.replace('language-', '')
			const code = extractText(children).replace(/\n$/, '')
			const html = highlight(code)
			return (
				<>
					<div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
						<div className="h-2.5 w-2.5 rounded-full bg-white/20" />
						<div className="h-2.5 w-2.5 rounded-full bg-white/20" />
						<div className="h-2.5 w-2.5 rounded-full bg-white/20" />
						<span className="ml-2 text-xs text-white/40">
							{lang}
						</span>
					</div>
					<code
						className="block p-4"
						dangerouslySetInnerHTML={{ __html: html }}
					/>
				</>
			)
		}
		return (
			<code className="rounded bg-muted px-1.5 py-0.5 text-sm">
				{children}
			</code>
		)
	},
	table({ children }: { children?: React.ReactNode }) {
		return (
			<div className="not-wysiwyg overflow-x-auto">
				<table className="w-full border-collapse text-sm">
					{children}
				</table>
			</div>
		)
	},
	thead({ children }: { children?: React.ReactNode }) {
		return <thead className="border-b border-border">{children}</thead>
	},
	th({ children }: { children?: React.ReactNode }) {
		return <th className="px-4 py-3 text-left font-semibold">{children}</th>
	},
	td({ children }: { children?: React.ReactNode }) {
		return (
			<td className="border-b border-border/50 px-4 py-3 text-muted-foreground">
				{children}
			</td>
		)
	},
	tr({ children }: { children?: React.ReactNode }) {
		return (
			<tr className="transition-colors hover:bg-muted/30">{children}</tr>
		)
	},
	a({ href, children }: { href?: string; children?: React.ReactNode }) {
		const isExternal = href?.startsWith('http') || href?.startsWith('//')
		return (
			<a
				href={href}
				className="cursor-pointer text-primary underline underline-offset-4 transition-colors hover:text-primary/80"
				{...(isExternal
					? { target: '_blank', rel: 'noopener noreferrer' }
					: {})}
			>
				{children}
			</a>
		)
	}
}

export function MarkdownRenderer({ content }: { content: string }) {
	return (
		<div className="wysiwyg wysiwyg-neutral dark:wysiwyg-invert max-w-none">
			<MDXRemote
				source={content}
				components={mdxComponents}
				options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
			/>
		</div>
	)
}
