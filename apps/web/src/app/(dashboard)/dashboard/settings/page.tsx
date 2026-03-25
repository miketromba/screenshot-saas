'use client'

import {
	AlertTriangle,
	Check,
	Loader2,
	LogOut,
	RefreshCw,
	User
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
	useAutoTopup,
	useCreditPacks,
	useUpdateAutoTopup,
	useUser
} from '@/hooks/use-queries'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
	const router = useRouter()
	const { data: user, isLoading: userLoading } = useUser()
	const { data: topup, isLoading: topupLoading } = useAutoTopup()
	const { data: packs, isLoading: packsLoading } = useCreditPacks()
	const updateTopup = useUpdateAutoTopup()

	const [enabled, setEnabled] = useState(false)
	const [threshold, setThreshold] = useState('10')
	const [packId, setPackId] = useState('')
	const [signingOut, setSigningOut] = useState(false)
	const [saved, setSaved] = useState(false)

	useEffect(() => {
		if (topup) {
			setEnabled(topup.enabled)
			setThreshold(String(topup.threshold))
			if (topup.packId) setPackId(topup.packId)
		}
	}, [topup])

	useEffect(() => {
		if (packs?.length && !packId) {
			setPackId(packs[0].id)
		}
	}, [packs, packId])

	async function handleSaveTopup() {
		await updateTopup.mutateAsync({
			enabled,
			threshold: Number(threshold),
			packId: packId || undefined
		})
		setSaved(true)
		setTimeout(() => setSaved(false), 2000)
	}

	async function handleSignOut() {
		setSigningOut(true)
		const supabase = createClient()
		await supabase.auth.signOut()
		router.push('/sign-in')
	}

	return (
		<div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
			<div className="mb-8">
				<h1 className="text-2xl font-bold tracking-tight">Settings</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Manage your account and billing preferences
				</p>
			</div>

			<div className="mb-8 rounded-xl border border-border bg-card">
				<div className="border-b border-border px-5 py-4">
					<div className="flex items-center gap-2">
						<RefreshCw className="h-4 w-4 text-muted-foreground" />
						<h2 className="text-sm font-semibold">Auto Top-up</h2>
					</div>
					<p className="mt-1 text-xs text-muted-foreground">
						Automatically purchase credits when your balance is low
					</p>
				</div>
				<div className="space-y-5 p-5">
					{topupLoading ? (
						<div className="space-y-4">
							<div className="h-6 w-32 animate-pulse rounded bg-muted" />
							<div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
							<div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
						</div>
					) : (
						<>
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium">
										Enable Auto Top-up
									</p>
									<p className="text-xs text-muted-foreground">
										Credits are purchased automatically when
										balance is low
									</p>
								</div>
								<button
									type="button"
									role="switch"
									aria-checked={enabled}
									onClick={() => setEnabled(!enabled)}
									className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
										enabled ? 'bg-primary' : 'bg-input'
									}`}
								>
									<span
										className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
											enabled
												? 'translate-x-5'
												: 'translate-x-0'
										}`}
									/>
								</button>
							</div>

							{enabled && (
								<>
									<div>
										<label
											htmlFor="topup-threshold"
											className="mb-1.5 block text-sm font-medium"
										>
											When balance drops below
										</label>
										<div className="relative">
											<input
												id="topup-threshold"
												type="number"
												min="1"
												value={threshold}
												onChange={e =>
													setThreshold(e.target.value)
												}
												className="w-full rounded-lg border border-input bg-background px-3 py-2.5 pr-16 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
											/>
											<span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
												credits
											</span>
										</div>
									</div>

									<div>
										<label
											htmlFor="topup-pack"
											className="mb-1.5 block text-sm font-medium"
										>
											Credit Pack to Purchase
										</label>
										{packsLoading ? (
											<div className="h-10 animate-pulse rounded-lg bg-muted" />
										) : (
											<select
												id="topup-pack"
												value={packId}
												onChange={e =>
													setPackId(e.target.value)
												}
												className="w-full cursor-pointer rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring"
											>
												{packs?.map(pack => (
													<option
														key={pack.id}
														value={pack.id}
													>
														{pack.name} &mdash;{' '}
														{pack.credits.toLocaleString()}{' '}
														credits ($
														{(
															pack.priceCents /
															100
														).toFixed(0)}
														)
													</option>
												))}
											</select>
										)}
									</div>

									{!topup?.hasPaymentMethod && (
										<div className="flex items-start gap-2 rounded-lg border border-chart-4/30 bg-chart-4/5 px-3 py-2.5">
											<AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-chart-4" />
											<p className="text-xs text-muted-foreground">
												A payment method is required for
												auto top-up. Save your settings
												first, then set up a payment
												method via the Stripe portal.
											</p>
										</div>
									)}
								</>
							)}

							<button
								type="button"
								onClick={handleSaveTopup}
								disabled={updateTopup.isPending}
								className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
							>
								{updateTopup.isPending ? (
									<>
										<Loader2 className="h-3.5 w-3.5 animate-spin" />{' '}
										Saving...
									</>
								) : saved ? (
									<>
										<Check className="h-3.5 w-3.5" /> Saved
									</>
								) : (
									'Save Settings'
								)}
							</button>
						</>
					)}
				</div>
			</div>

			<div className="rounded-xl border border-border bg-card">
				<div className="border-b border-border px-5 py-4">
					<div className="flex items-center gap-2">
						<User className="h-4 w-4 text-muted-foreground" />
						<h2 className="text-sm font-semibold">Account</h2>
					</div>
				</div>
				<div className="space-y-4 p-5">
					{userLoading ? (
						<div className="space-y-3">
							<div className="h-4 w-48 animate-pulse rounded bg-muted" />
							<div className="h-4 w-32 animate-pulse rounded bg-muted" />
						</div>
					) : (
						<>
							<div>
								<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
									Email
								</p>
								<p className="mt-0.5 text-sm">{user?.email}</p>
							</div>
							{user?.createdAt && (
								<div>
									<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
										Member Since
									</p>
									<p className="mt-0.5 text-sm">
										{new Date(
											user.createdAt
										).toLocaleDateString('en-US', {
											month: 'long',
											day: 'numeric',
											year: 'numeric'
										})}
									</p>
								</div>
							)}
						</>
					)}

					<div className="pt-2">
						<button
							type="button"
							onClick={handleSignOut}
							disabled={signingOut}
							className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
						>
							{signingOut ? (
								<>
									<Loader2 className="h-3.5 w-3.5 animate-spin" />{' '}
									Signing out...
								</>
							) : (
								<>
									<LogOut className="h-3.5 w-3.5" /> Sign Out
								</>
							)}
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
