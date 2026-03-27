import Link from 'next/link'

export function CTABlock({
	variant = 'default'
}: {
	variant?: 'default' | 'compact'
}) {
	if (variant === 'compact') {
		return (
			<div className="flex flex-col items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-6 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p className="font-semibold">Try ScreenshotAPI free</p>
					<p className="text-sm text-muted-foreground">
						200 free screenshots/month. No credit card required.
					</p>
				</div>
				<Link
					href="/sign-up"
					className="cursor-pointer whitespace-nowrap rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
				>
					Start for free
				</Link>
			</div>
		)
	}

	return (
		<section className="mt-16 rounded-2xl border border-border bg-muted/30 px-6 py-12 text-center">
			<h2 className="text-2xl font-bold tracking-tight">
				Start capturing screenshots today
			</h2>
			<p className="mx-auto mt-3 max-w-md text-muted-foreground">
				Create a free account and get 200 free screenshots per month to
				try the API. No credit card required.
			</p>
			<div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
				<Link
					href="/sign-up"
					className="cursor-pointer rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
				>
					Create free account
				</Link>
				<Link
					href="/pricing"
					className="cursor-pointer rounded-lg border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-muted"
				>
					View pricing
				</Link>
			</div>
		</section>
	)
}
