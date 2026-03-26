import Link from 'next/link'

export function Breadcrumbs({
	items
}: {
	items: { label: string; href?: string }[]
}) {
	const breadcrumbSchema = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: items.map((item, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			name: item.label,
			...(item.href
				? { item: `https://screenshotapi.to${item.href}` }
				: {})
		}))
	}

	return (
		<nav aria-label="Breadcrumb">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(breadcrumbSchema)
				}}
			/>
			<ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
				{items.map((item, i) => (
					<li key={item.label} className="flex items-center gap-1.5">
						{i > 0 && (
							<svg
								className="h-3.5 w-3.5"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth={2}
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M8.25 4.5l7.5 7.5-7.5 7.5"
								/>
							</svg>
						)}
						{item.href ? (
							<Link
								href={item.href}
								className="cursor-pointer transition-colors hover:text-foreground"
							>
								{item.label}
							</Link>
						) : (
							<span className="text-foreground">
								{item.label}
							</span>
						)}
					</li>
				))}
			</ol>
		</nav>
	)
}
