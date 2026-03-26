'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { siGithub, siGoogle } from 'simple-icons'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

export default function SignInPage() {
	return (
		<Suspense>
			<SignInForm />
		</Suspense>
	)
}

function SignInForm() {
	const router = useRouter()
	const searchParams = useSearchParams()
	const redirect = searchParams.get('redirect') ?? '/dashboard'
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const configured = isSupabaseConfigured()

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setError(null)
		setLoading(true)

		try {
			const supabase = createClient()
			const { error: authError } = await supabase.auth.signInWithPassword(
				{ email, password }
			)

			if (authError) {
				setError(authError.message)
				setLoading(false)
				return
			}

			router.push(redirect)
			router.refresh()
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'Authentication failed'
			)
			setLoading(false)
		}
	}

	async function handleOAuth(provider: 'github' | 'google') {
		try {
			const supabase = createClient()
			const { error: oauthError } = await supabase.auth.signInWithOAuth({
				provider,
				options: {
					redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`
				}
			})
			if (oauthError) setError(oauthError.message)
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'OAuth sign-in failed'
			)
		}
	}

	return (
		<div className="w-full max-w-sm space-y-6">
			<div className="text-center">
				<h1 className="text-2xl font-bold tracking-tight">
					Welcome back
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Sign in to your ScreenshotAPI account
				</p>
			</div>

			{!configured && (
				<div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
					<p className="font-medium">Auth not configured</p>
					<p className="mt-1 text-xs opacity-80">
						Set NEXT_PUBLIC_SUPABASE_URL and
						NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment
						variables to enable authentication.
					</p>
				</div>
			)}

			<div className="space-y-3">
				<button
					type="button"
					onClick={() => handleOAuth('github')}
					disabled={!configured}
					className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
				>
					<svg
						className="h-4 w-4"
						viewBox="0 0 24 24"
						fill="currentColor"
					>
						<path d={siGithub.path} />
					</svg>
					Continue with GitHub
				</button>
				<button
					type="button"
					onClick={() => handleOAuth('google')}
					disabled={!configured}
					className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
				>
					<svg
						className="h-4 w-4"
						viewBox="0 0 24 24"
						fill="currentColor"
					>
						<path d={siGoogle.path} />
					</svg>
					Continue with Google
				</button>
			</div>

			<div className="relative">
				<div className="absolute inset-0 flex items-center">
					<div className="w-full border-t border-border" />
				</div>
				<div className="relative flex justify-center text-xs uppercase">
					<span className="bg-muted/30 px-2 text-muted-foreground">
						or
					</span>
				</div>
			</div>

			<form onSubmit={handleSubmit} className="space-y-4">
				{error && (
					<div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
						{error}
					</div>
				)}
				<div className="space-y-1.5">
					<label htmlFor="email" className="text-sm font-medium">
						Email
					</label>
					<input
						id="email"
						type="email"
						value={email}
						onChange={e => setEmail(e.target.value)}
						placeholder="you@example.com"
						required
						disabled={!configured}
						className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
					/>
				</div>
				<div className="space-y-1.5">
					<label htmlFor="password" className="text-sm font-medium">
						Password
					</label>
					<input
						id="password"
						type="password"
						value={password}
						onChange={e => setPassword(e.target.value)}
						placeholder="••••••••"
						required
						disabled={!configured}
						className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
					/>
				</div>
				<button
					type="submit"
					disabled={loading || !configured}
					className="w-full cursor-pointer rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{loading ? 'Signing in...' : 'Sign in'}
				</button>
			</form>

			<p className="text-center text-sm text-muted-foreground">
				Don&apos;t have an account?{' '}
				<Link
					href="/sign-up"
					className="cursor-pointer font-medium text-primary underline-offset-4 hover:underline"
				>
					Sign up
				</Link>
			</p>
		</div>
	)
}
