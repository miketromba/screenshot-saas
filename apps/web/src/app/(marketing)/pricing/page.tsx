import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
	title: 'Pricing',
	description:
		'Simple credit-based pricing for ScreenshotAPI. No subscriptions — buy credits and use them at your own pace.'
}

const packs = [
	{
		name: 'Starter',
		credits: 100,
		price: 5,
		perCredit: '0.050',
		description: 'Perfect for side projects and prototypes'
	},
	{
		name: 'Growth',
		credits: 500,
		price: 20,
		perCredit: '0.040',
		popular: true,
		description: 'Great for growing applications'
	},
	{
		name: 'Pro',
		credits: 2_000,
		price: 60,
		perCredit: '0.030',
		description: 'For production workloads'
	},
	{
		name: 'Scale',
		credits: 10_000,
		price: 200,
		perCredit: '0.020',
		description: 'Best value for high-volume use'
	}
]

const faqs = [
	{
		q: 'What is a credit?',
		a: 'One credit equals one screenshot. Every API call that successfully returns a screenshot deducts one credit from your balance.'
	},
	{
		q: 'Do credits expire?',
		a: 'No. Credits never expire. Use them whenever you need them.'
	},
	{
		q: 'What happens when I run out of credits?',
		a: 'The API will return a 402 status code. You can purchase more credits at any time, or enable auto top-up to automatically buy more when your balance gets low.'
	},
	{
		q: 'What is auto top-up?',
		a: 'Auto top-up automatically purchases a credit pack when your balance drops below a threshold you set. You choose which pack to buy and the minimum balance that triggers a purchase.'
	},
	{
		q: 'Can I get a refund?',
		a: 'We evaluate refund requests on a case-by-case basis within 30 days of purchase. Contact support@screenshotapi.dev with your request.'
	},
	{
		q: 'Is there a free tier?',
		a: 'Every new account receives 5 free credits to test the API. No credit card required to sign up.'
	},
	{
		q: 'Do failed screenshots use credits?',
		a: 'No. Credits are only deducted for successful screenshots. If a screenshot fails, you keep your credit.'
	},
	{
		q: 'Do you offer enterprise pricing?',
		a: 'For volume above 10,000 screenshots, contact support@screenshotapi.dev and we can discuss custom pricing.'
	}
]

export default function PricingPage() {
	return (
		<>
			<section className="py-20 md:py-28">
				<div className="mx-auto max-w-6xl px-6">
					<div className="mx-auto max-w-2xl text-center">
						<h1 className="text-4xl font-bold tracking-tight">
							Simple, credit-based pricing
						</h1>
						<p className="mt-4 text-lg text-muted-foreground">
							No subscriptions or monthly fees. Buy credits and
							use them whenever you need. Every account starts
							with 5 free credits.
						</p>
					</div>

					<div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
						{packs.map(pack => (
							<div
								key={pack.name}
								className={`relative flex flex-col rounded-xl border p-6 transition-colors hover:border-primary/50 ${
									pack.popular
										? 'border-primary bg-primary/5 shadow-lg shadow-primary/5'
										: 'border-border bg-card'
								}`}
							>
								{pack.popular && (
									<div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
										Most popular
									</div>
								)}
								<h3 className="text-lg font-semibold">
									{pack.name}
								</h3>
								<p className="mt-1 text-sm text-muted-foreground">
									{pack.description}
								</p>
								<div className="mt-4">
									<span className="text-4xl font-bold">
										${pack.price}
									</span>
								</div>
								<p className="mt-1 text-sm text-muted-foreground">
									{pack.credits.toLocaleString()} credits
								</p>
								<div className="mt-1 rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground inline-block w-fit">
									${pack.perCredit}/screenshot
								</div>
								<ul className="mt-6 flex-1 space-y-2 text-sm text-muted-foreground">
									<li className="flex items-center gap-2">
										<svg
											className="h-4 w-4 text-green-600"
											fill="none"
											viewBox="0 0 24 24"
											strokeWidth={2}
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M4.5 12.75l6 6 9-13.5"
											/>
										</svg>
										All screenshot options
									</li>
									<li className="flex items-center gap-2">
										<svg
											className="h-4 w-4 text-green-600"
											fill="none"
											viewBox="0 0 24 24"
											strokeWidth={2}
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M4.5 12.75l6 6 9-13.5"
											/>
										</svg>
										PNG, JPEG, WebP output
									</li>
									<li className="flex items-center gap-2">
										<svg
											className="h-4 w-4 text-green-600"
											fill="none"
											viewBox="0 0 24 24"
											strokeWidth={2}
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M4.5 12.75l6 6 9-13.5"
											/>
										</svg>
										Credits never expire
									</li>
									<li className="flex items-center gap-2">
										<svg
											className="h-4 w-4 text-green-600"
											fill="none"
											viewBox="0 0 24 24"
											strokeWidth={2}
											stroke="currentColor"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M4.5 12.75l6 6 9-13.5"
											/>
										</svg>
										Auto top-up available
									</li>
								</ul>
								<Link
									href="/sign-up"
									className={`mt-6 block cursor-pointer rounded-lg px-4 py-2.5 text-center text-sm font-medium transition-colors ${
										pack.popular
											? 'bg-primary text-primary-foreground hover:bg-primary/90'
											: 'border border-border bg-background hover:bg-muted'
									}`}
								>
									Get started
								</Link>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* FAQ */}
			<section className="border-t border-border bg-muted/20 py-20 md:py-28">
				<div className="mx-auto max-w-3xl px-6">
					<h2 className="text-center text-3xl font-bold tracking-tight">
						Frequently asked questions
					</h2>
					<div className="mt-12 space-y-8">
						{faqs.map(faq => (
							<div key={faq.q}>
								<h3 className="font-semibold">{faq.q}</h3>
								<p className="mt-2 text-sm text-muted-foreground">
									{faq.a}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>
		</>
	)
}
