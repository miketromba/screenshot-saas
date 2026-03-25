'use client'

import {
	Calendar,
	Camera,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	ExternalLink,
	XCircle,
	Zap
} from 'lucide-react'
import { useState } from 'react'
import { useUsageLogs, useUsageStats } from '@/hooks/use-queries'

const PAGE_SIZE = 20

function formatDate(date: string | Date): string {
	return new Date(date).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		hour: 'numeric',
		minute: '2-digit'
	})
}

export default function UsagePage() {
	const [page, setPage] = useState(0)
	const { data: stats, isLoading: statsLoading } = useUsageStats()
	const { data: logs, isLoading: logsLoading } = useUsageLogs({
		limit: PAGE_SIZE,
		offset: page * PAGE_SIZE
	})

	const statCards = [
		{
			label: 'Total Screenshots',
			value: stats?.totalScreenshots,
			icon: Camera,
			formatted: false
		},
		{
			label: 'Last 30 Days',
			value: stats?.last30Days,
			icon: Calendar,
			formatted: false
		},
		{
			label: 'Failed',
			value: stats?.failedScreenshots,
			icon: XCircle,
			formatted: false
		},
		{
			label: 'Avg Duration',
			value: stats?.avgDurationMs
				? `${(stats.avgDurationMs / 1000).toFixed(1)}s`
				: '0s',
			icon: Zap,
			formatted: true
		}
	]

	return (
		<div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
			<div className="mb-8">
				<h1 className="text-2xl font-bold tracking-tight">Usage</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Monitor your screenshot usage and performance
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
							{statsLoading ? (
								<div className="h-8 w-20 animate-pulse rounded bg-muted" />
							) : (
								<p className="font-(family-name:--font-geist-mono) text-2xl font-bold tracking-tight">
									{card.formatted
										? card.value
										: ((
												card.value as number | undefined
											)?.toLocaleString() ?? '0')}
								</p>
							)}
						</div>
					</div>
				))}
			</div>

			<div className="rounded-xl border border-border bg-card">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="border-b border-border">
								<th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
									URL
								</th>
								<th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
									Status
								</th>
								<th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
									Duration
								</th>
								<th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
									Date
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border">
							{logsLoading
								? Array.from({ length: 5 }).map((_, i) => (
										<tr
											key={`log-skeleton-${i.toString()}`}
										>
											<td className="px-5 py-3">
												<div className="h-4 w-64 animate-pulse rounded bg-muted" />
											</td>
											<td className="px-5 py-3">
												<div className="h-5 w-20 animate-pulse rounded-full bg-muted" />
											</td>
											<td className="px-5 py-3">
												<div className="h-4 w-12 animate-pulse rounded bg-muted" />
											</td>
											<td className="px-5 py-3">
												<div className="h-4 w-28 animate-pulse rounded bg-muted" />
											</td>
										</tr>
									))
								: !logs?.length
									? null
									: logs.map(log => (
											<tr
												key={log.id}
												className="transition-colors hover:bg-muted/30"
											>
												<td className="max-w-xs px-5 py-3">
													<div className="flex items-center gap-2">
														<span
															className="truncate font-(family-name:--font-geist-mono) text-sm"
															title={log.url}
														>
															{log.url}
														</span>
														<a
															href={log.url}
															target="_blank"
															rel="noopener noreferrer"
															className="shrink-0 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
														>
															<ExternalLink className="h-3 w-3" />
														</a>
													</div>
												</td>
												<td className="px-5 py-3">
													{log.status ===
													'completed' ? (
														<span className="inline-flex items-center gap-1.5 rounded-full bg-chart-2/10 px-2.5 py-0.5 text-xs font-medium text-chart-2">
															<CheckCircle2 className="h-3 w-3" />{' '}
															Completed
														</span>
													) : (
														<span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive">
															<XCircle className="h-3 w-3" />{' '}
															Failed
														</span>
													)}
												</td>
												<td className="px-5 py-3 font-(family-name:--font-geist-mono) text-sm text-muted-foreground">
													{log.durationMs
														? `${(log.durationMs / 1000).toFixed(2)}s`
														: '—'}
												</td>
												<td className="px-5 py-3 text-sm text-muted-foreground">
													{formatDate(log.createdAt)}
												</td>
											</tr>
										))}
						</tbody>
					</table>
				</div>

				{!logsLoading && !logs?.length && (
					<div className="px-5 py-16 text-center">
						<Camera className="mx-auto h-8 w-8 text-muted-foreground/30" />
						<p className="mt-2 text-sm text-muted-foreground">
							No screenshots recorded yet
						</p>
					</div>
				)}

				{logs && logs.length > 0 && (
					<div className="flex items-center justify-between border-t border-border px-5 py-3">
						<p className="text-xs text-muted-foreground">
							Showing {page * PAGE_SIZE + 1}&ndash;
							{page * PAGE_SIZE + logs.length}
						</p>
						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={() => setPage(p => Math.max(0, p - 1))}
								disabled={page === 0}
								className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
							>
								<ChevronLeft className="h-3 w-3" /> Previous
							</button>
							<button
								type="button"
								onClick={() => setPage(p => p + 1)}
								disabled={logs.length < PAGE_SIZE}
								className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
							>
								Next <ChevronRight className="h-3 w-3" />
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
