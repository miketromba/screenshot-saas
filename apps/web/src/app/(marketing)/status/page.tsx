'use client'

import { Activity, CheckCircle2, Clock, RefreshCw, XCircle } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

interface HealthCheck {
	status: 'ok' | 'error'
	timestamp: string
	responseMs: number
}

const API_URL = process.env.NEXT_PUBLIC_APP_URL ?? ''
const HEALTH_ENDPOINT = `${API_URL}/api/health`
const CHECK_INTERVAL = 30_000

export default function StatusPage() {
	const [checks, setChecks] = useState<HealthCheck[]>([])
	const [loading, setLoading] = useState(true)

	const runCheck = useCallback(async () => {
		const start = Date.now()
		try {
			const res = await fetch(HEALTH_ENDPOINT, { cache: 'no-store' })
			const responseMs = Date.now() - start
			const data = await res.json()
			const check: HealthCheck = {
				status: res.ok && data.status === 'ok' ? 'ok' : 'error',
				timestamp: new Date().toISOString(),
				responseMs
			}
			setChecks(prev => [check, ...prev].slice(0, 60))
		} catch {
			const responseMs = Date.now() - start
			setChecks(prev =>
				[
					{
						status: 'error' as const,
						timestamp: new Date().toISOString(),
						responseMs
					},
					...prev
				].slice(0, 60)
			)
		}
		setLoading(false)
	}, [])

	useEffect(() => {
		runCheck()
		const interval = setInterval(runCheck, CHECK_INTERVAL)
		return () => clearInterval(interval)
	}, [runCheck])

	const latest = checks[0]
	const isUp = latest?.status === 'ok'
	const upCount = checks.filter(c => c.status === 'ok').length
	const uptimePercent =
		checks.length > 0 ? ((upCount / checks.length) * 100).toFixed(1) : '—'
	const avgResponse =
		checks.length > 0
			? Math.round(
					checks.reduce((sum, c) => sum + c.responseMs, 0) /
						checks.length
				)
			: 0

	return (
		<div className="mx-auto max-w-3xl px-6 py-16">
			<div className="mb-12 text-center">
				<h1 className="text-3xl font-bold tracking-tight">
					System Status
				</h1>
				<p className="mt-2 text-muted-foreground">
					Real-time monitoring of ScreenshotAPI services
				</p>
			</div>

			{loading ? (
				<div className="flex items-center justify-center py-16">
					<RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
				</div>
			) : (
				<>
					<div
						className={`mb-8 rounded-xl border p-6 ${
							isUp
								? 'border-green-500/30 bg-green-50 dark:bg-green-950/20'
								: 'border-red-500/30 bg-red-50 dark:bg-red-950/20'
						}`}
					>
						<div className="flex items-center gap-3">
							{isUp ? (
								<CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
							) : (
								<XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
							)}
							<div>
								<h2 className="text-lg font-semibold">
									{isUp
										? 'All Systems Operational'
										: 'Service Disruption Detected'}
								</h2>
								<p className="text-sm text-muted-foreground">
									Last checked:{' '}
									{latest
										? new Date(
												latest.timestamp
											).toLocaleTimeString()
										: '—'}
								</p>
							</div>
						</div>
					</div>

					<div className="mb-8 grid grid-cols-3 gap-4">
						<div className="rounded-xl border border-border bg-card p-4 text-center">
							<Activity className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
							<p className="text-2xl font-bold tabular-nums">
								{uptimePercent}%
							</p>
							<p className="text-xs text-muted-foreground">
								Uptime (session)
							</p>
						</div>
						<div className="rounded-xl border border-border bg-card p-4 text-center">
							<Clock className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
							<p className="text-2xl font-bold tabular-nums">
								{avgResponse}ms
							</p>
							<p className="text-xs text-muted-foreground">
								Avg Response
							</p>
						</div>
						<div className="rounded-xl border border-border bg-card p-4 text-center">
							<RefreshCw className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
							<p className="text-2xl font-bold tabular-nums">
								{checks.length}
							</p>
							<p className="text-xs text-muted-foreground">
								Checks Run
							</p>
						</div>
					</div>

					<div className="rounded-xl border border-border bg-card">
						<div className="border-b border-border p-4">
							<h3 className="text-sm font-semibold">
								Screenshot API
							</h3>
							<p className="text-xs text-muted-foreground">
								GET /api/health — checked every 30s
							</p>
						</div>

						<div className="p-4">
							<div className="flex items-end gap-[2px]">
								{Array.from({ length: 60 }).map((_, i) => {
									const idx = 59 - i
									const check = checks[idx]
									return (
										<div
											key={
												check?.timestamp ??
												`empty-${idx}`
											}
											className={`h-8 flex-1 rounded-sm transition-colors ${
												!check
													? 'bg-muted/30'
													: check.status === 'ok'
														? 'bg-green-500'
														: 'bg-red-500'
											}`}
											title={
												check
													? `${check.status === 'ok' ? 'OK' : 'Error'} — ${check.responseMs}ms at ${new Date(check.timestamp).toLocaleTimeString()}`
													: 'No data'
											}
										/>
									)
								})}
							</div>
							<div className="mt-2 flex justify-between text-xs text-muted-foreground">
								<span>30 min ago</span>
								<span>Now</span>
							</div>
						</div>

						{checks.length > 0 && (
							<div className="border-t border-border p-4">
								<h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
									Recent Checks
								</h4>
								<div className="space-y-1.5">
									{checks.slice(0, 10).map(check => (
										<div
											key={check.timestamp}
											className="flex items-center justify-between text-sm"
										>
											<div className="flex items-center gap-2">
												<div
													className={`h-2 w-2 rounded-full ${
														check.status === 'ok'
															? 'bg-green-500'
															: 'bg-red-500'
													}`}
												/>
												<span className="font-(family-name:--font-geist-mono) text-xs text-muted-foreground">
													{new Date(
														check.timestamp
													).toLocaleTimeString()}
												</span>
											</div>
											<span className="font-(family-name:--font-geist-mono) text-xs tabular-nums">
												{check.responseMs}ms
											</span>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</>
			)}
		</div>
	)
}
