'use client'

import { CREDIT_PACK_TIERS, SUBSCRIPTION_TIERS } from '@screenshot-saas/config'
import Link from 'next/link'
import { useState } from 'react'

function CheckIcon() {
	return (
		<svg
			className="h-4 w-4 shrink-0 text-green-600"
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
	)
}

function FeatureItem({ children }: { children: string }) {
	return (
		<li className="flex items-start gap-2 text-sm text-muted-foreground">
			<CheckIcon />
			<span>{children}</span>
		</li>
	)
}

type BillingPeriod = 'monthly' | 'annual'

const subscriptionTiers = SUBSCRIPTION_TIERS.map(tier => {
	const isFree = tier.slug === 'free'
	return {
		id: tier.slug,
		name: tier.name,
		screenshotsPerMo: `${tier.screenshotsPerMonth.toLocaleString()}/mo`,
		monthlyPrice: tier.monthlyPrice,
		annualPricePerMo: isFree ? null : tier.annualPrice,
		annualTotal: isFree ? null : tier.annualPrice * 12,
		perScreenshotMonthly: tier.perScreenshot,
		perScreenshotAnnual:
			!isFree && tier.screenshotsPerMonth > 0
				? `$${(tier.annualPrice / tier.screenshotsPerMonth).toFixed(4)}`
				: null,
		overage: tier.overageRate,
		popular: 'popular' in tier,
		features: tier.features,
		footnote: null as string | null
	}
})

const faqs = [
	{
		q: 'What is a credit?',
		a: 'One credit equals one screenshot. Credits are consumed from your credit pack balance after your subscription quota is used up.'
	},
	{
		q: 'How do subscriptions work?',
		a: 'Your plan includes a monthly screenshot allowance that resets each billing period. Go over your limit? Paid plans allow overage at a small per-screenshot cost, or you can use credit packs.'
	},
	{
		q: 'Do credits expire?',
		a: 'No. Credit pack credits never expire. Use them whenever you need them. Subscription allowances reset monthly.'
	},
	{
		q: 'Is there a free tier?',
		a: 'Yes! Every account gets 200 free screenshots per month. No credit card required.'
	},
	{
		q: 'Can I switch between plans?',
		a: 'Yes. Upgrade or downgrade anytime. Changes take effect at the start of your next billing period.'
	},
	{
		q: 'Do cached screenshots count against my quota?',
		a: 'No. Cached responses are served instantly and do not count against your monthly allowance.'
	},
	{
		q: 'What payment methods do you accept?',
		a: 'We accept all major credit cards, debit cards, and select local payment methods through our payment provider.'
	}
] as const

function formatPrice(n: number) {
	return `$${n}/mo`
}

export default function PricingPage() {
	const [billing, setBilling] = useState<BillingPeriod>('monthly')

	return (
		<>
			<section className="py-20 md:py-28">
				<div className="mx-auto max-w-6xl px-6">
					<div className="mx-auto max-w-2xl text-center">
						<h1 className="text-4xl font-bold tracking-tight">
							Pricing that scales with you
						</h1>
						<p className="mt-4 text-lg text-muted-foreground">
							Subscriptions for predictable monthly usage, plus
							credit packs when you need a boost. Start free — no
							credit card required.
						</p>
					</div>

					<div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
						<span className="text-sm font-medium text-muted-foreground">
							Billing
						</span>
						<div className="inline-flex rounded-lg border border-border bg-muted/50 p-1">
							<button
								type="button"
								onClick={() => setBilling('monthly')}
								className={`cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-colors ${
									billing === 'monthly'
										? 'bg-card text-foreground shadow-sm'
										: 'text-muted-foreground hover:text-foreground'
								}`}
							>
								Monthly
							</button>
							<button
								type="button"
								onClick={() => setBilling('annual')}
								className={`relative cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-colors ${
									billing === 'annual'
										? 'bg-card text-foreground shadow-sm'
										: 'text-muted-foreground hover:text-foreground'
								}`}
							>
								Annual
								<span className="ml-1.5 inline-flex rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">
									Save 20%
								</span>
							</button>
						</div>
					</div>

					<div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
						{subscriptionTiers.map(tier => {
							const isFree = tier.id === 'free'
							const showAnnual =
								billing === 'annual' &&
								tier.annualPricePerMo !== null
							const displayPrice = isFree
								? '$0'
								: showAnnual
									? formatPrice(tier.annualPricePerMo!)
									: formatPrice(tier.monthlyPrice)
							const annualNote =
								showAnnual && tier.annualTotal !== null
									? `($${tier.annualTotal.toLocaleString()}/yr)`
									: null

							return (
								<div
									key={tier.id}
									className={`relative flex flex-col rounded-xl border p-6 transition-colors ${
										tier.popular
											? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
											: 'border-border bg-card hover:border-primary/40'
									}`}
								>
									{tier.popular && (
										<div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-primary-foreground">
											Most popular
										</div>
									)}
									<h3 className="text-lg font-semibold">
										{tier.name}
									</h3>
									<p className="mt-1 text-sm text-muted-foreground">
										{tier.screenshotsPerMo}
									</p>
									<div className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
										<span className="text-4xl font-bold tabular-nums">
											{displayPrice}
										</span>
										{annualNote && (
											<span className="text-sm text-muted-foreground">
												{annualNote}
											</span>
										)}
									</div>
									{!isFree &&
										tier.perScreenshotMonthly &&
										tier.perScreenshotAnnual && (
											<p className="mt-2 text-sm text-muted-foreground">
												{billing === 'annual'
													? tier.perScreenshotAnnual
													: tier.perScreenshotMonthly}{' '}
												per screenshot
											</p>
										)}
									{!isFree && tier.overage && (
										<p className="mt-2 rounded-md border border-border bg-muted/40 px-2.5 py-1.5 text-xs text-muted-foreground">
											Overage: {tier.overage}/screenshot
										</p>
									)}
									{isFree && (
										<p className="mt-2 text-sm text-muted-foreground">
											No credit card required · 200
											screenshots/month
										</p>
									)}
									<ul className="mt-6 flex-1 space-y-2.5">
										{tier.features.map(f => (
											<FeatureItem key={f}>
												{f}
											</FeatureItem>
										))}
									</ul>
									{tier.footnote && (
										<p className="mt-4 text-xs text-muted-foreground">
											{tier.footnote}
										</p>
									)}
									<Link
										href="/sign-up"
										className={`mt-6 block cursor-pointer rounded-lg px-4 py-2.5 text-center text-sm font-medium transition-colors ${
											tier.popular
												? 'bg-primary text-primary-foreground hover:bg-primary/90'
												: 'border border-border bg-background hover:bg-muted'
										}`}
									>
										Get started
									</Link>
								</div>
							)
						})}
					</div>
				</div>
			</section>

			<section className="border-t border-border bg-muted/20 py-16 md:py-24">
				<div className="mx-auto max-w-6xl px-6">
					<div className="mx-auto max-w-2xl text-center">
						<h2 className="text-2xl font-bold tracking-tight md:text-3xl">
							Prefer pay-as-you-go?
						</h2>
						<p className="mt-3 text-muted-foreground">
							Credit packs never expire. No subscription required.
							Use them at your own pace.
						</p>
					</div>

					<div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
						{CREDIT_PACK_TIERS.map(pack => (
							<div
								key={pack.name}
								className="flex flex-col rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40"
							>
								<div className="flex items-baseline justify-between gap-2">
									<h3 className="font-semibold">
										{pack.name}
									</h3>
									<span className="text-2xl font-bold tabular-nums">
										${pack.price}
									</span>
								</div>
								<p className="mt-1 text-sm text-muted-foreground">
									{pack.credits.toLocaleString()} credits
								</p>
								<p className="mt-2 text-xs text-muted-foreground">
									{pack.perScreenshot} per screenshot
								</p>
								<Link
									href="/sign-up"
									className="mt-4 cursor-pointer rounded-md border border-border bg-background px-3 py-2 text-center text-sm font-medium transition-colors hover:bg-muted"
								>
									Buy credits
								</Link>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="border-t border-border py-20 md:py-28">
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
