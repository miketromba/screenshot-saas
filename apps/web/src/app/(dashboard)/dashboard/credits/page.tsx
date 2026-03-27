'use client'

import {
	ArrowDownRight,
	ArrowUpRight,
	Check,
	Coins,
	CreditCard,
	Gift,
	Loader2,
	RefreshCw,
	Star,
	X,
	Zap
} from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import {
	useCreditPacks,
	usePurchaseCredits,
	useTransactions,
	useUser
} from '@/hooks/use-queries'

function formatDate(date: string | Date): string {
	return new Date(date).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: 'numeric',
		minute: '2-digit'
	})
}

const typeConfig: Record<
	string,
	{
		icon: typeof Coins
		label: string
		color: string
	}
> = {
	signup_bonus: { icon: Gift, label: 'Bonus', color: 'text-chart-4' },
	purchase: { icon: CreditCard, label: 'Purchase', color: 'text-chart-2' },
	usage: { icon: ArrowDownRight, label: 'Usage', color: 'text-destructive' },
	auto_topup: {
		icon: RefreshCw,
		label: 'Auto Top-up',
		color: 'text-chart-2'
	},
	refund: { icon: ArrowUpRight, label: 'Refund', color: 'text-chart-1' },
	subscription: { icon: Zap, label: 'Subscription', color: 'text-chart-4' }
}

function CreditsContent() {
	const searchParams = useSearchParams()
	const success = searchParams.get('success')
	const canceled = searchParams.get('canceled')

	const { data: user, isLoading: userLoading } = useUser()
	const { data: packs, isLoading: packsLoading } = useCreditPacks()
	const { data: transactions, isLoading: txLoading } = useTransactions()
	const purchase = usePurchaseCredits()

	const [purchasingPack, setPurchasingPack] = useState<string | null>(null)
	const [banner, setBanner] = useState<'success' | 'canceled' | null>(
		success === 'true' ? 'success' : canceled === 'true' ? 'canceled' : null
	)

	async function handlePurchase(packId: string) {
		setPurchasingPack(packId)
		try {
			const result = await purchase.mutateAsync(packId)
			if (result.checkoutUrl) {
				window.location.href = result.checkoutUrl
			}
		} catch {
			setPurchasingPack(null)
		}
	}

	return (
		<div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
			{banner === 'success' && (
				<div className="mb-6 flex items-center gap-3 rounded-xl border border-chart-2/30 bg-chart-2/5 px-4 py-3">
					<Check className="h-5 w-5 text-chart-2" />
					<p className="flex-1 text-sm font-medium">
						Payment successful! Credits have been added to your
						account.
					</p>
					<button
						type="button"
						onClick={() => setBanner(null)}
						className="cursor-pointer rounded-md p-1 text-muted-foreground hover:text-foreground"
					>
						<X className="h-4 w-4" />
					</button>
				</div>
			)}
			{banner === 'canceled' && (
				<div className="mb-6 flex items-center gap-3 rounded-xl border border-border bg-muted/50 px-4 py-3">
					<X className="h-5 w-5 text-muted-foreground" />
					<p className="flex-1 text-sm text-muted-foreground">
						Payment was canceled. No credits were added.
					</p>
					<button
						type="button"
						onClick={() => setBanner(null)}
						className="cursor-pointer rounded-md p-1 text-muted-foreground hover:text-foreground"
					>
						<X className="h-4 w-4" />
					</button>
				</div>
			)}

			<div className="mb-8">
				<h1 className="text-2xl font-bold tracking-tight">
					Credit Packs
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Purchase credits for pay-as-you-go usage beyond your
					subscription allowance. Credits never expire.
				</p>
			</div>

			<div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div className="rounded-xl border border-border bg-card p-6">
					<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
						Credit Balance
					</p>
					{userLoading ? (
						<div className="mt-2 h-10 w-32 animate-pulse rounded bg-muted" />
					) : (
						<p className="mt-2 font-(family-name:--font-geist-mono) text-4xl font-bold tracking-tight">
							{user?.balance?.toLocaleString() ?? 0}
							<span className="ml-2 text-base font-normal text-muted-foreground">
								credits
							</span>
						</p>
					)}
				</div>
				<div className="rounded-xl border border-border bg-card p-6">
					<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
						Subscription Plan
					</p>
					{userLoading ? (
						<div className="mt-2 h-10 w-32 animate-pulse rounded bg-muted" />
					) : (
						<div className="mt-2">
							<p className="text-2xl font-bold capitalize tracking-tight">
								{user?.subscription?.plan ?? 'Free'}
							</p>
							<p className="text-sm text-muted-foreground">
								{user?.subscription
									? `${user.subscription.screenshotsUsedThisMonth.toLocaleString()} / ${user.subscription.screenshotsPerMonth.toLocaleString()} screenshots this month`
									: '200 free screenshots/month'}
							</p>
							<Link
								href="/dashboard/billing"
								className="mt-1 inline-block cursor-pointer text-xs font-medium text-primary transition-colors hover:text-primary/80"
							>
								Manage subscription &rarr;
							</Link>
						</div>
					)}
				</div>
			</div>

			<h2 className="mb-4 text-sm font-semibold">Buy Credit Packs</h2>
			<p className="mb-4 text-xs text-muted-foreground">
				Credits are consumed after your monthly subscription allowance
				is used up. They never expire.
			</p>
			{packsLoading ? (
				<div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{Array.from({ length: 4 }).map((_, i) => (
						<div
							key={`pack-skeleton-${i.toString()}`}
							className="h-48 animate-pulse rounded-xl border border-border bg-muted"
						/>
					))}
				</div>
			) : (
				<div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{packs?.map(pack => (
						<div
							key={pack.id}
							className={`relative rounded-xl border p-5 transition-colors hover:border-ring/30 ${
								pack.isPopular
									? 'border-primary bg-primary/2'
									: 'border-border bg-card'
							}`}
						>
							{pack.isPopular && (
								<div className="absolute -top-2.5 left-4 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
									<Star className="h-3 w-3" /> Popular
								</div>
							)}
							<p className="text-sm font-semibold">{pack.name}</p>
							<p className="mt-1 font-(family-name:--font-geist-mono) text-2xl font-bold tracking-tight">
								{pack.credits.toLocaleString()}
							</p>
							<p className="text-xs text-muted-foreground">
								credits
							</p>
							<p className="mt-3 text-lg font-semibold">
								${(pack.priceCents / 100).toFixed(0)}
							</p>
							<p className="text-xs text-muted-foreground">
								$
								{(pack.priceCents / pack.credits / 100).toFixed(
									4
								)}{' '}
								per credit
							</p>
							<button
								type="button"
								onClick={() => handlePurchase(pack.id)}
								disabled={purchasingPack === pack.id}
								className={`mt-4 w-full cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
									pack.isPopular
										? 'bg-primary text-primary-foreground hover:bg-primary/90'
										: 'border border-border bg-background hover:bg-muted'
								}`}
							>
								{purchasingPack === pack.id ? (
									<span className="inline-flex items-center gap-2">
										<Loader2 className="h-3.5 w-3.5 animate-spin" />{' '}
										Processing...
									</span>
								) : (
									'Buy Now'
								)}
							</button>
						</div>
					))}
				</div>
			)}

			<h2 className="mb-4 text-sm font-semibold">Transaction History</h2>
			<div className="rounded-xl border border-border bg-card">
				{txLoading ? (
					<div className="divide-y divide-border">
						{Array.from({ length: 5 }).map((_, i) => (
							<div
								key={`tx-skeleton-${i.toString()}`}
								className="flex items-center gap-3 px-5 py-3"
							>
								<div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
								<div className="flex-1 space-y-1.5">
									<div className="h-3.5 w-40 animate-pulse rounded bg-muted" />
									<div className="h-3 w-24 animate-pulse rounded bg-muted" />
								</div>
								<div className="h-4 w-16 animate-pulse rounded bg-muted" />
							</div>
						))}
					</div>
				) : !transactions?.length ? (
					<div className="px-5 py-12 text-center">
						<Coins className="mx-auto h-8 w-8 text-muted-foreground/30" />
						<p className="mt-2 text-sm text-muted-foreground">
							No transactions yet
						</p>
					</div>
				) : (
					<div className="divide-y divide-border">
						{transactions.map(tx => {
							const config = typeConfig[tx.type] ?? {
								icon: Coins,
								label: tx.type,
								color: 'text-muted-foreground'
							}
							const Icon = config.icon
							return (
								<div
									key={tx.id}
									className="flex items-center gap-3 px-5 py-3"
								>
									<div
										className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted ${config.color}`}
									>
										<Icon className="h-4 w-4" />
									</div>
									<div className="min-w-0 flex-1">
										<p className="text-sm">
											{tx.description ?? config.label}
										</p>
										<p className="text-xs text-muted-foreground">
											{formatDate(tx.createdAt)}
										</p>
									</div>
									<span
										className={`shrink-0 font-(family-name:--font-geist-mono) text-sm font-medium ${
											tx.amount > 0
												? 'text-chart-2'
												: 'text-muted-foreground'
										}`}
									>
										{tx.amount > 0 ? '+' : ''}
										{tx.amount}
									</span>
								</div>
							)
						})}
					</div>
				)}
			</div>
		</div>
	)
}

export default function CreditsPage() {
	return (
		<Suspense
			fallback={
				<div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
					<div className="h-8 w-48 animate-pulse rounded bg-muted" />
					<div className="mt-2 h-4 w-72 animate-pulse rounded bg-muted" />
				</div>
			}
		>
			<CreditsContent />
		</Suspense>
	)
}
