import Link from 'next/link'
import type { ReactNode } from 'react'

function Logo() {
	return (
		<Link href="/" className="flex cursor-pointer items-center gap-2">
			<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
				<svg
					className="h-4 w-4 text-primary-foreground"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={2}
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
					/>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
					/>
				</svg>
			</div>
			<span className="text-lg font-bold tracking-tight">
				ScreenshotAPI
			</span>
		</Link>
	)
}

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
									href="https://github.com/miketromba/screenshot-service"
									target="_blank"
									rel="noopener noreferrer"
									className="cursor-pointer text-sm text-muted-foreground transition-colors hover:text-foreground"
								>
									GitHub
								</a>
							</li>
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
