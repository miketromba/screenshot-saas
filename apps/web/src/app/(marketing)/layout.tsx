import Link from 'next/link'
import type { ReactNode } from 'react'
import { Logo } from '@/components/logo'

function Header() {
	return (
		<header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
			<div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
				<div className="flex items-center gap-8">
					<Logo />
					<nav className="hidden items-center gap-6 md:flex">
						<Link
							href="/use-cases"
							className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground"
						>
							Use Cases
						</Link>
						<Link
							href="/compare"
							className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground"
						>
							Compare
						</Link>
						<Link
							href="/integrations"
							className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground"
						>
							Integrations
						</Link>
						<Link
							href="/pricing"
							className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground"
						>
							Pricing
						</Link>
						<Link
							href="/docs"
							className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground"
						>
							Docs
						</Link>
					</nav>
				</div>
				<div className="flex items-center gap-3">
					<Link
						href="/sign-in"
						className="cursor-pointer text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
					>
						Sign in
					</Link>
					<Link
						href="/sign-up"
						className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
					>
						Get Started
					</Link>
				</div>
			</div>
		</header>
	)
}

function Footer() {
	return (
		<footer className="border-t border-border bg-muted/30">
			<div className="mx-auto max-w-6xl px-6 py-12">
				<div className="grid grid-cols-2 gap-8 md:grid-cols-5">
					<div className="col-span-2 md:col-span-1">
						<Logo />
						<p className="mt-3 text-sm text-muted-foreground">
							Website screenshots via API, in seconds.
						</p>
					</div>
					<div>
						<h3 className="text-sm font-semibold">Product</h3>
						<ul className="mt-3 space-y-2">
							<li>
								<Link
									href="/#features"
									className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground"
								>
									Features
								</Link>
							</li>
							<li>
								<Link
									href="/pricing"
									className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground"
								>
									Pricing
								</Link>
							</li>
							<li>
								<Link
									href="/docs"
									className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground"
								>
									Documentation
								</Link>
							</li>
							<li>
								<Link
									href="/docs/api/screenshot"
									className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground"
								>
									API Reference
								</Link>
							</li>
						</ul>
					</div>
					<div>
						<h3 className="text-sm font-semibold">Solutions</h3>
						<ul className="mt-3 space-y-2">
							<li>
								<Link
									href="/use-cases"
									className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground"
								>
									Use Cases
								</Link>
							</li>
							<li>
								<Link
									href="/compare"
									className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground"
								>
									Compare
								</Link>
							</li>
							<li>
								<Link
									href="/integrations"
									className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground"
								>
									Integrations
								</Link>
							</li>
							<li>
								<Link
									href="/blog"
									className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground"
								>
									Blog
								</Link>
							</li>
						</ul>
					</div>
					<div>
						<h3 className="text-sm font-semibold">Company</h3>
						<ul className="mt-3 space-y-2">
							<li>
								<Link
									href="/changelog"
									className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground"
								>
									Changelog
								</Link>
							</li>
							<li>
								<Link
									href="/status"
									className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground"
								>
									Status
								</Link>
							</li>
							<li>
								<Link
									href="/terms"
									className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground"
								>
									Terms of Service
								</Link>
							</li>
							<li>
								<Link
									href="/privacy"
									className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground"
								>
									Privacy Policy
								</Link>
							</li>
						</ul>
					</div>
					<div>
						<h3 className="text-sm font-semibold">Links</h3>
						<ul className="mt-3 space-y-2">
							<li>
								<a
									href="mailto:support@screenshotapi.to"
									className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground"
								>
									Support
								</a>
							</li>
						</ul>
					</div>
				</div>
				<div className="mt-10 border-t border-border pt-6">
					<p className="text-center text-xs text-muted-foreground">
						&copy; {new Date().getFullYear()} ScreenshotAPI. All
						rights reserved.
					</p>
				</div>
			</div>
		</footer>
	)
}

export default function MarketingLayout({ children }: { children: ReactNode }) {
	return (
		<>
			<Header />
			<main className="flex-1">{children}</main>
			<Footer />
		</>
	)
}
