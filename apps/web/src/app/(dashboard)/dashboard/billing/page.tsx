'use client'

import { POLAR_PRODUCT_IDS } from '@screenshot-saas/config'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
	AlertCircle,
	Calendar,
	Check,
	Coins,
	CreditCard,
	Loader2,
	Sparkles,
	X,
	Zap
} from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { useUser } from '@/hooks/use-queries'
import { api } from '@/lib/api'

function unwrap<T>(res: { data: unknown; error: unknown }): T {
	if (res.error) throw res.error
	return res.data as T
}

type SubscriptionData = {
	plan: 'free' | 'starter' | 'growth' | 'scale'
	status: 'active' | 'canceled' | 'past_due' | 'trialing'
	billingCycle: 'monthly' | 'annual'
	screenshotsPerMonth: number
	screenshotsUsedThisMonth: number
	overageScreenshots: number
	overageRateCents: number | null
	currentPeriodStart: string
	currentPeriodEnd: string
	canceledAt: string | null
}

const PLANS = {
	free: { name: 'Free', monthlyPrice: 0, annualPrice: 0, screenshots: 200 },
	starter: {
		name: 'Starter',
		monthlyPrice: 19,
		annualPrice: 15,
		screenshots: 5000
	},
	growth: {
		name: 'Growth',
		monthlyPrice: 49,
		annualPrice: 39,
		screenshots: 25000
	},
	scale: {
		name: 'Scale',
		monthlyPrice: 149,
		annualPrice: 119,
		screenshots: 100000
	}
} as const

const PLAN_ORDER = ['free', 'starter', 'growth', 'scale'] as const
type PlanKey = (typeof PLAN_ORDER)[number]

function formatPeriodDate(iso: string): string {
	return new Date(iso).toLocaleDateString('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric'
	})
}

function statusBadgeClass(status: SubscriptionData['status']): {
	label: string
	className: string
} {
	switch (status) {
		case 'active':
			return {
				label: 'Active',
				className: 'border-chart-2/40 bg-chart-2/10 text-chart-2'
			}
		case 'trialing':
			return {
				label: 'Trialing',
				className: 'border-primary/40 bg-primary/10 text-primary'
			}
		case 'past_due':
			return {
				label: 'Past due',
				className:
					'border-destructive/40 bg-destructive/10 text-destructive'
			}
		case 'canceled':
			return {
				label: 'Canceled',
				className: 'border-border bg-muted text-muted-foreground'
			}
		default:
			return {
				label: status,
				className: 'border-border bg-muted text-muted-foreground'
			}
	}
}

function plansAbove(current: PlanKey): Exclude<PlanKey, 'free'>[] {
	const i = PLAN_ORDER.indexOf(current)
	if (i === -1) {
		return ['starter', 'growth', 'scale']
	}
	return PLAN_ORDER.slice(i + 1) as Exclude<PlanKey, 'free'>[]
}

function BillingContent() {
	const searchParams = useSearchParams()
	const success = searchParams.get('success')
	const queryClient = useQueryClient()
	const { data: user, isLoading: userLoading } = useUser()
	const {
		data: subscription,
		isLoading: subscriptionLoading,
		error: subscriptionError
	} = useQuery({
		queryKey: ['subscription'],
		queryFn: async () =>
			unwrap<SubscriptionData>(await api.v1.subscription.get())
	})

	const [banner, setBanner] = useState<'success' | null>(
		success === 'true' ? 'success' : null
	)
	const [upgradeCycle, setUpgradeCycle] = useState<'monthly' | 'annual'>(
		'monthly'
	)
	const [actionError, setActionError] = useState<string | null>(null)

	const checkout = useMutation({
		mutationFn: async (input: {
			plan: Exclude<PlanKey, 'free'>
			billingCycle: 'monthly' | 'annual'
		}) => {
			const polarProductId =
				POLAR_PRODUCT_IDS[input.plan][input.billingCycle]
			if (!polarProductId) {
				throw new Error('Checkout is not configured for this plan.')
			}
			return unwrap<{
				checkoutUrl?: string
				success?: boolean
				message?: string
			}>(
				await api.v1.subscription.checkout.post({
					plan: input.plan,
					billingCycle: input.billingCycle,
					polarProductId
				})
			)
		},
		onSuccess: data => {
			setActionError(null)
			if (data.checkoutUrl) {
				window.location.href = data.checkoutUrl
				return
			}
			queryClient.invalidateQueries({ queryKey: ['subscription'] })
		},
		onError: (err: unknown) => {
			setActionError(
				err instanceof Error ? err.message : 'Checkout failed'
			)
		}
	})

	const cancelSub = useMutation({
		mutationFn: async () =>
			unwrap<{
				success: boolean
				message: string
				currentPeriodEnd: string
			}>(await api.v1.subscription.cancel.post({})),
		onSuccess: () => {
			setActionError(null)
			queryClient.invalidateQueries({ queryKey: ['subscription'] })
		},
		onError: (err: unknown) => {
			setActionError(
				err instanceof Error
					? err.message
					: 'Could not cancel subscription'
			)
		}
	})

	const loading = subscriptionLoading || userLoading

	function handleCancel() {
		if (
			!window.confirm(
				'Cancel your subscription? You will keep access until the end of the current billing period.'
			)
		) {
			return
		}
		cancelSub.mutate()
	}

	const currentPlan = subscription?.plan ?? 'free'
	const usagePct =
		subscription &&
		subscription.screenshotsPerMonth > 0 &&
		Number.isFinite(subscription.screenshotsUsedThisMonth)
			? Math.min(
					100,
					Math.round(
						(subscription.screenshotsUsedThisMonth /
							subscription.screenshotsPerMonth) *
							100
					)
				)
			: 0

	const upgradeList = plansAbove(currentPlan)
	const statusStyle = subscription
		? statusBadgeClass(subscription.status)
		: null
	const showCancel =
		subscription &&
		subscription.plan !== 'free' &&
		subscription.status !== 'canceled'

	return (
		<div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
			{banner === 'success' && (
				<div className="mb-6 flex items-center gap-3 rounded-xl border border-chart-2/30 bg-chart-2/5 px-4 py-3">
					<Check className="h-5 w-5 text-chart-2" />
					<p className="flex-1 text-sm font-medium">
						Subscription updated successfully.
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
				<h1 className="text-2xl font-bold tracking-tight">Billing</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Manage your subscription and view usage
				</p>
			</div>

			{actionError && (
				<div className="mb-6 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
					<AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
					<p className="text-sm text-destructive">{actionError}</p>
				</div>
			)}

			<div className="mb-6 grid gap-4 md:grid-cols-2">
				<div className="rounded-xl border border-border bg-card p-6">
					<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
						Credit balance
					</p>
					{userLoading ? (
						<div className="mt-3 h-10 w-36 animate-pulse rounded bg-muted" />
					) : (
						<div className="mt-3 flex items-center gap-2">
							<Coins className="h-5 w-5 text-muted-foreground" />
							<p className="font-(family-name:--font-geist-mono) text-3xl font-bold tracking-tight">
								{user?.balance?.toLocaleString() ?? 0}
							</p>
							<span className="text-sm text-muted-foreground">
								credits
							</span>
						</div>
					)}
				</div>

				<div className="rounded-xl border border-border bg-card p-6">
					<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
						Current plan
					</p>
					{subscriptionLoading ? (
						<div className="mt-3 space-y-2">
							<div className="h-7 w-40 animate-pulse rounded bg-muted" />
							<div className="h-4 w-56 animate-pulse rounded bg-muted" />
						</div>
					) : subscriptionError ? (
						<p className="mt-3 text-sm text-destructive">
							Could not load subscription
						</p>
					) : (
						<div className="mt-3 flex flex-wrap items-center gap-2">
							<p className="text-xl font-semibold tracking-tight">
								{PLANS[currentPlan].name}
							</p>
							{statusStyle && (
								<span
									className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyle.className}`}
								>
									{statusStyle.label}
								</span>
							)}
							{subscription && (
								<span className="w-full text-sm text-muted-foreground">
									Billed{' '}
									{subscription.billingCycle === 'annual'
										? 'annually'
										: 'monthly'}
								</span>
							)}
						</div>
					)}
				</div>
			</div>

			<div className="mb-8 rounded-xl border border-border bg-card p-6">
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div>
						<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
							Usage this period
						</p>
						<h2 className="mt-1 flex items-center gap-2 text-lg font-semibold">
							<Zap className="h-5 w-5 text-primary" />
							Screenshots
						</h2>
					</div>
					{subscription && (
						<div className="flex items-center gap-2 text-sm text-muted-foreground">
							<Calendar className="h-4 w-4" />
							<span>
								{formatPeriodDate(
									subscription.currentPeriodStart
								)}{' '}
								—{' '}
								{formatPeriodDate(
									subscription.currentPeriodEnd
								)}
							</span>
						</div>
					)}
				</div>

				{subscriptionLoading ? (
					<div className="mt-6 space-y-3">
						<div className="h-4 w-full max-w-md animate-pulse rounded bg-muted" />
						<div className="h-3 w-full animate-pulse rounded-full bg-muted" />
					</div>
				) : subscriptionError ? (
					<p className="mt-6 text-sm text-destructive">
						Could not load usage
					</p>
				) : subscription ? (
					<>
						<div className="mt-4 flex flex-wrap items-baseline justify-between gap-2">
							<p className="font-(family-name:--font-geist-mono) text-2xl font-bold tabular-nums">
								{subscription.screenshotsUsedThisMonth.toLocaleString()}
								<span className="text-lg font-normal text-muted-foreground">
									{' '}
									/{' '}
									{subscription.screenshotsPerMonth.toLocaleString()}
								</span>
							</p>
							<p className="text-sm font-medium text-muted-foreground">
								{usagePct}%
							</p>
						</div>
						<div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-muted">
							<div
								className="h-full rounded-full bg-primary transition-all"
								style={{ width: `${String(usagePct)}%` }}
							/>
						</div>
						{subscription.overageScreenshots > 0 && (
							<p className="mt-3 text-sm text-muted-foreground">
								Overage:{' '}
								<span className="font-medium text-foreground">
									{subscription.overageScreenshots.toLocaleString()}{' '}
									screenshots
								</span>
								{subscription.overageRateCents != null && (
									<span>
										{' '}
										at $
										{(
											subscription.overageRateCents / 100
										).toFixed(2)}{' '}
										per screenshot
									</span>
								)}
							</p>
						)}
					</>
				) : null}
			</div>

			{showCancel && (
				<div className="mb-10 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card px-6 py-4">
					<div>
						<p className="text-sm font-medium">Subscription</p>
						<p className="text-sm text-muted-foreground">
							Cancel to stop renewal. Access continues until the
							period ends.
						</p>
					</div>
					<button
						type="button"
						onClick={handleCancel}
						disabled={cancelSub.isPending}
						className="cursor-pointer rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
					>
						{cancelSub.isPending ? (
							<span className="inline-flex items-center gap-2">
								<Loader2 className="h-4 w-4 animate-spin" />
								Canceling…
							</span>
						) : (
							'Cancel subscription'
						)}
					</button>
				</div>
			)}

			{subscription?.status === 'canceled' && subscription.canceledAt && (
				<p className="mb-8 text-sm text-muted-foreground">
					Canceled on {formatPeriodDate(subscription.canceledAt)}.
					Your plan benefits apply until{' '}
					{formatPeriodDate(subscription.currentPeriodEnd)}.
				</p>
			)}

			<div className="mb-4 flex flex-wrap items-center justify-between gap-4">
				<h2 className="text-sm font-semibold">Upgrade</h2>
				<div className="flex rounded-lg border border-border bg-muted/50 p-1">
					<button
						type="button"
						onClick={() => setUpgradeCycle('monthly')}
						className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
							upgradeCycle === 'monthly'
								? 'bg-card text-foreground shadow-sm'
								: 'text-muted-foreground hover:text-foreground'
						}`}
					>
						Monthly
					</button>
					<button
						type="button"
						onClick={() => setUpgradeCycle('annual')}
						className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
							upgradeCycle === 'annual'
								? 'bg-card text-foreground shadow-sm'
								: 'text-muted-foreground hover:text-foreground'
						}`}
					>
						Annual
					</button>
				</div>
			</div>

			{loading ? (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					{Array.from({ length: 3 }).map((_, i) => (
						<div
							key={`upgrade-skel-${i.toString()}`}
							className="h-52 animate-pulse rounded-xl border border-border bg-muted"
						/>
					))}
				</div>
			) : (
				<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
					{upgradeList.map(plan => {
						const info = PLANS[plan]
						const price =
							upgradeCycle === 'monthly'
								? info.monthlyPrice
								: info.annualPrice
						const isCurrentCheckout =
							checkout.isPending &&
							checkout.variables?.plan === plan
						return (
							<div
								key={plan}
								className="flex flex-col rounded-xl border border-border bg-card p-5"
							>
								<div className="mb-3 flex items-center gap-2">
									<Sparkles className="h-4 w-4 text-primary" />
									<p className="font-semibold">{info.name}</p>
								</div>
								<p className="font-(family-name:--font-geist-mono) text-3xl font-bold">
									${price}
									<span className="text-base font-normal text-muted-foreground">
										/mo
									</span>
								</p>
								{upgradeCycle === 'annual' && price > 0 && (
									<p className="text-xs text-muted-foreground">
										billed annually
									</p>
								)}
								<p className="mt-3 text-sm text-muted-foreground">
									{info.screenshots.toLocaleString()}{' '}
									screenshots / month
								</p>
								<button
									type="button"
									onClick={() =>
										checkout.mutate({
											plan,
											billingCycle: upgradeCycle
										})
									}
									disabled={checkout.isPending}
									className="mt-5 inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
								>
									{isCurrentCheckout ? (
										<>
											<Loader2 className="h-4 w-4 animate-spin" />
											Redirecting…
										</>
									) : (
										<>
											<CreditCard className="h-4 w-4" />
											Upgrade
										</>
									)}
								</button>
							</div>
						)
					})}
				</div>
			)}

			{!loading && upgradeList.length === 0 && (
				<div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-10 text-center">
					<p className="text-sm text-muted-foreground">
						You are on the highest plan. Thank you for your support.
					</p>
				</div>
			)}
		</div>
	)
}

export default function BillingPage() {
	return (
		<Suspense
			fallback={
				<div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
					<div className="h-8 w-48 animate-pulse rounded bg-muted" />
					<div className="mt-2 h-4 w-72 animate-pulse rounded bg-muted" />
					<div className="mt-8 h-40 animate-pulse rounded-xl border border-border bg-muted" />
				</div>
			}
		>
			<BillingContent />
		</Suspense>
	)
}
