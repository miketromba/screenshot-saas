import Link from 'next/link'

export function RelatedPages({
	pages
}: {
	pages: { title: string; description: string; href: string }[]
}) {
	return (
		<section className="mt-16">
			<h2 className="text-xl font-bold tracking-tight">
				Related resources
			</h2>
			<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{pages.map(page => (
					<Link
						key={page.href}
						href={page.href}
						className="cursor-pointer rounded-xl border border-border bg-card p-5 transition-colors hover:bg-muted/30"
					>
						<h3 className="font-semibold">{page.title}</h3>
						<p className="mt-1.5 text-sm text-muted-foreground">
							{page.description}
						</p>
					</Link>
				))}
			</div>
		</section>
	)
}
