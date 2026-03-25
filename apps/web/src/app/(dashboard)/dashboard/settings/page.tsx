'use client'

import { Loader2, LogOut, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useUser } from '@/hooks/use-queries'
import { createClient } from '@/lib/supabase/client'

export default function SettingsPage() {
	const router = useRouter()
	const { data: user, isLoading: userLoading } = useUser()
	const [signingOut, setSigningOut] = useState(false)

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
					Manage your account
				</p>
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
