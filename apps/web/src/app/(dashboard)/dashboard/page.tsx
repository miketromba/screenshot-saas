'use client'

import {
	ArrowRight,
	Camera,
	CheckCircle2,
	Coins,
	CreditCard,
	Key,
	Play,
	Plus,
	XCircle,
	Zap
} from 'lucide-react'
import Link from 'next/link'
import { useApiKeys, useUsageLogs, useUser } from '@/hooks/use-queries'

const PLAN_LABELS: Record<string, string> = {
	free: 'Free',
	starter: 'Starter',
	growth: 'Growth',
	scale: 'Scale'
}

function formatRelative(date: string | Date): string {
	const d = new Date(date)
	const now = new Date()
	const diffMs = now.getTime() - d.getTime()
	const diffMins = Math.floor(diffMs / 60000)
	const diffHours = Math.floor(diffMins / 60)
	const diffDays = Math.floor(diffHours / 24)

	if (diffMins < 1) return 'just now'
	if (diffMins < 60) return `${diffMins}m ago`
	if (diffHours < 24) return `${diffHours}h ago`
	if (diffDays < 7) return `${diffDays}d ago`
	return d.toLocaleDateString()
}

export default function DashboardPage() {
	const { data: user, isLoading: userLoading } = useUser()
	const { data: apiKeys, isLoading: keysLoading } = useApiKeys()
	const { data: recentLogs, isLoading: logsLoading } = useUsageLogs({
		limit: 10
	})

	const sub = user?.subscription
	const usagePercent = sub
		? Math.min(
				100,
				Math.round(
					(sub.screenshotsUsedThisMonth / sub.screenshotsPerMonth) *
						100
				)
			)
		: 0

	const statCards = [
		{
			label: 'Plan',
			value: sub ? (PLAN_LABELS[sub.plan] ?? sub.plan) : '—',
			icon: Zap,
			loading: userLoading
		},
		{
			label: 'Monthly Usage',
			value: sub
				? `${sub.screenshotsUsedThisMonth.toLocaleString()} / ${sub.screenshotsPerMonth.toLocaleString()}`
				: '—',
			icon: Camera,
			loading: userLoading
		},
		{
			label: 'Credit Balance',
			value: user?.balance?.toLocaleString() ?? '—',
			icon: Coins,
			loading: userLoading
		},
		{
			label: 'API Keys',
			value: apiKeys?.length?.toString() ?? '—',
			icon: Key,
			loading: keysLoading
		}
	]

	const quickActions = [
		{ label: 'Create API Key', href: '/dashboard/api-keys', icon: Plus },
		{
			label: 'Manage Billing',
			href: '/dashboard/billing',
			icon: CreditCard
		},
		{
			label: 'Open Playground',
			href: '/dashboard/playground',
			icon: Play
		}
	]

	return (
		<div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
			<div className="mb-8">
				<h1 className="text-2xl font-bold tracking-tight">
					{userLoading ? (
						<span className="inline-block h-7 w-48 animate-pulse rounded bg-muted" />
					) : (
						<>Welcome back</>
					)}
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					{userLoading ? (
						<span className="inline-block h-4 w-64 animate-pulse rounded bg-muted" />
					) : (
						user?.email
					)}
				</p>
			</div>

			<div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{statCards.map(card => (
					<div
						key={card.label}
						className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-ring/30"
					>
						<div className="flex items-center justify-between">
							<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
								{card.label}
							</p>
							<card.icon className="h-4 w-4 text-muted-foreground/50" />
						</div>
						<div className="mt-3">
							{card.loading ? (
								<div className="h-8 w-24 animate-pulse rounded bg-muted" />
							) : (
								<p className="font-(family-name:--font-geist-mono) text-2xl font-bold tracking-tight">
									{card.value}
								</p>
							)}
						</div>
					</div>
				))}
			</div>

			{sub && !userLoading && (
				<div className="mb-8 rounded-xl border border-border bg-card p-5">
					<div className="flex items-center justify-between">
						<p className="text-sm font-medium">
							Monthly Usage ({PLAN_LABELS[sub.plan]} plan)
						</p>
						<p className="font-(family-name:--font-geist-mono) text-sm text-muted-foreground">
							{usagePercent}%
						</p>
					</div>
					<div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
						<div
							className="h-full rounded-full bg-primary transition-all duration-300"
							style={{ width: `${usagePercent}%` }}
						/>
					</div>
					<div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
						<span>
							{sub.screenshotsUsedThisMonth.toLocaleString()} used
						</span>
						<span>
							{sub.screenshotsPerMonth.toLocaleString()} included
						</span>
					</div>
					{sub.plan !== 'free' &&
						sub.plan !== null &&
						sub.screenshotsUsedThisMonth >=
							sub.screenshotsPerMonth && (
							<p className="mt-2 text-xs text-amber-600">
								You&rsquo;ve used your monthly allowance.
								Additional screenshots will use credit packs or
								incur overage charges.
							</p>
						)}
				</div>
			)}

			<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
				<div className="lg:col-span-2">
					<div className="mb-4 flex items-center justify-between">
						<h2 className="text-sm font-semibold">
							Recent Activity
						</h2>
						<Link
							href="/dashboard/usage"
							className="flex cursor-pointer items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
						>
							View all <ArrowRight className="h-3 w-3" />
						</Link>
					</div>
					<div className="rounded-xl border border-border bg-card">
						{logsLoading ? (
							<div className="divide-y divide-border">
								{Array.from({ length: 5 }).map((_, i) => (
									<div
										key={`skeleton-${i.toString()}`}
										className="flex items-center gap-3 px-4 py-3"
									>
										<div className="h-4 w-4 animate-pulse rounded bg-muted" />
										<div className="h-4 flex-1 animate-pulse rounded bg-muted" />
										<div className="h-4 w-16 animate-pulse rounded bg-muted" />
									</div>
								))}
							</div>
						) : !recentLogs?.length ? (
							<div className="px-4 py-12 text-center">
								<Camera className="mx-auto h-8 w-8 text-muted-foreground/30" />
								<p className="mt-2 text-sm text-muted-foreground">
									No screenshots yet
								</p>
								<Link
									href="/dashboard/playground"
									className="mt-3 inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-primary transition-colors hover:text-primary/80"
								>
									Take your first screenshot{' '}
									<ArrowRight className="h-3 w-3" />
								</Link>
							</div>
						) : (
							<div className="divide-y divide-border">
								{recentLogs.map(log => (
									<div
										key={log.id}
										className="flex items-center gap-3 px-4 py-3"
									>
										{log.status === 'completed' ? (
											<CheckCircle2 className="h-4 w-4 shrink-0 text-chart-2" />
										) : (
											<XCircle className="h-4 w-4 shrink-0 text-destructive" />
										)}
										<span className="min-w-0 flex-1 truncate font-(family-name:--font-geist-mono) text-sm">
											{log.url}
										</span>
										<span className="shrink-0 text-xs text-muted-foreground">
											{log.durationMs
												? `${(log.durationMs / 1000).toFixed(1)}s`
												: '—'}
										</span>
										<span className="shrink-0 text-xs text-muted-foreground">
											{formatRelative(log.createdAt)}
										</span>
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				<div>
					<h2 className="mb-4 text-sm font-semibold">
						Quick Actions
					</h2>
					<div className="space-y-3">
						{quickActions.map(action => (
							<Link
								key={action.href}
								href={action.href}
								className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-ring/30 hover:bg-accent/50"
							>
								<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
									<action.icon className="h-4 w-4 text-primary" />
								</div>
								<span className="text-sm font-medium">
									{action.label}
								</span>
								<ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
							</Link>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}
