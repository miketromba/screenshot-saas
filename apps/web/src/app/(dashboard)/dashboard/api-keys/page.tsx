'use client'

import { AlertTriangle, Check, Copy, Key, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import {
	useApiKeys,
	useCreateApiKey,
	useRevokeApiKey
} from '@/hooks/use-queries'

function formatDate(date: string | Date): string {
	return new Date(date).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	})
}

export default function ApiKeysPage() {
	const { data: keys, isLoading, error } = useApiKeys()
	const createKey = useCreateApiKey()
	const revokeKey = useRevokeApiKey()

	const [showCreate, setShowCreate] = useState(false)
	const [newKeyName, setNewKeyName] = useState('')
	const [createdKey, setCreatedKey] = useState<{
		key: string
		name: string
	} | null>(null)
	const [revokeTarget, setRevokeTarget] = useState<{
		id: string
		name: string
	} | null>(null)
	const [copied, setCopied] = useState(false)

	async function handleCreate(e: React.FormEvent) {
		e.preventDefault()
		const result = await createKey.mutateAsync(newKeyName)
		setCreatedKey({ key: result.key, name: result.name })
		setNewKeyName('')
		setShowCreate(false)
	}

	async function handleRevoke() {
		if (!revokeTarget) return
		await revokeKey.mutateAsync(revokeTarget.id)
		setRevokeTarget(null)
	}

	async function copyKey(key: string) {
		await navigator.clipboard.writeText(key)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	return (
		<div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">
						API Keys
					</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Manage your API keys for authenticating requests
					</p>
				</div>
				<button
					type="button"
					onClick={() => setShowCreate(true)}
					className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
				>
					<Plus className="h-4 w-4" />
					Create Key
				</button>
			</div>

			{createdKey && (
				<div className="mb-6 rounded-xl border border-chart-2/30 bg-chart-2/5 p-4">
					<div className="flex items-start gap-3">
						<Key className="mt-0.5 h-5 w-5 shrink-0 text-chart-2" />
						<div className="min-w-0 flex-1">
							<p className="text-sm font-medium">
								API Key Created: {createdKey.name}
							</p>
							<p className="mt-1 text-xs text-muted-foreground">
								Copy this key now — you won&apos;t be able to
								see it again.
							</p>
							<div className="mt-3 flex items-center gap-2">
								<code className="flex-1 select-all rounded-lg border border-border bg-background px-3 py-2 font-(family-name:--font-geist-mono) text-sm">
									{createdKey.key}
								</code>
								<button
									type="button"
									onClick={() => copyKey(createdKey.key)}
									className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
								>
									{copied ? (
										<Check className="h-4 w-4 text-chart-2" />
									) : (
										<Copy className="h-4 w-4" />
									)}
									{copied ? 'Copied' : 'Copy'}
								</button>
							</div>
						</div>
						<button
							type="button"
							onClick={() => setCreatedKey(null)}
							className="cursor-pointer rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
						>
							<X className="h-4 w-4" />
						</button>
					</div>
				</div>
			)}

			{isLoading ? (
				<div className="rounded-xl border border-border bg-card">
					<div className="divide-y divide-border">
						{Array.from({ length: 3 }).map((_, i) => (
							<div
								key={`skeleton-${i.toString()}`}
								className="flex items-center gap-4 px-5 py-4"
							>
								<div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
								<div className="flex-1 space-y-2">
									<div className="h-4 w-32 animate-pulse rounded bg-muted" />
									<div className="h-3 w-48 animate-pulse rounded bg-muted" />
								</div>
								<div className="h-8 w-8 animate-pulse rounded bg-muted" />
							</div>
						))}
					</div>
				</div>
			) : error ? (
				<div className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-12 text-center">
					<AlertTriangle className="mx-auto h-8 w-8 text-destructive/50" />
					<p className="mt-2 text-sm text-destructive">
						Failed to load API keys
					</p>
				</div>
			) : !keys?.length ? (
				<div className="rounded-xl border border-border bg-card px-5 py-16 text-center">
					<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
						<Key className="h-6 w-6 text-muted-foreground" />
					</div>
					<h3 className="mt-4 text-sm font-semibold">No API keys</h3>
					<p className="mt-1 text-sm text-muted-foreground">
						Create your first API key to start using the Screenshot
						API.
					</p>
					<button
						type="button"
						onClick={() => setShowCreate(true)}
						className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
					>
						<Plus className="h-4 w-4" />
						Create API Key
					</button>
				</div>
			) : (
				<div className="rounded-xl border border-border bg-card">
					<div className="divide-y divide-border">
						{keys.map(key => (
							<div
								key={key.id}
								className="flex items-center gap-4 px-5 py-4"
							>
								<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
									<Key className="h-4 w-4 text-muted-foreground" />
								</div>
								<div className="min-w-0 flex-1">
									<p className="text-sm font-medium">
										{key.name}
									</p>
									<div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
										<span className="font-(family-name:--font-geist-mono)">
											{key.keyPrefix}••••••••
										</span>
										<span>
											Created {formatDate(key.createdAt)}
										</span>
										{key.lastUsedAt && (
											<span>
												Last used{' '}
												{formatDate(key.lastUsedAt)}
											</span>
										)}
									</div>
								</div>
								<button
									type="button"
									onClick={() =>
										setRevokeTarget({
											id: key.id,
											name: key.name
										})
									}
									className="cursor-pointer rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
									title="Revoke key"
								>
									<Trash2 className="h-4 w-4" />
								</button>
							</div>
						))}
					</div>
				</div>
			)}

			{showCreate && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div
						className="fixed inset-0 bg-background/80 backdrop-blur-sm"
						onClick={() => setShowCreate(false)}
						onKeyDown={e => {
							if (e.key === 'Escape') setShowCreate(false)
						}}
					/>
					<div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg">
						<h2 className="text-lg font-semibold">
							Create API Key
						</h2>
						<p className="mt-1 text-sm text-muted-foreground">
							Give your key a descriptive name to identify it
							later.
						</p>
						<form onSubmit={handleCreate} className="mt-4">
							<input
								type="text"
								value={newKeyName}
								onChange={e => setNewKeyName(e.target.value)}
								placeholder="e.g. Production, Development, Testing"
								required
								className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
							/>
							<div className="mt-4 flex items-center justify-end gap-3">
								<button
									type="button"
									onClick={() => {
										setShowCreate(false)
										setNewKeyName('')
									}}
									className="cursor-pointer rounded-lg px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
								>
									Cancel
								</button>
								<button
									type="submit"
									disabled={
										createKey.isPending ||
										!newKeyName.trim()
									}
									className="cursor-pointer rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
								>
									{createKey.isPending
										? 'Creating...'
										: 'Create Key'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{revokeTarget && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div
						className="fixed inset-0 bg-background/80 backdrop-blur-sm"
						onClick={() => setRevokeTarget(null)}
						onKeyDown={e => {
							if (e.key === 'Escape') setRevokeTarget(null)
						}}
					/>
					<div className="relative w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
								<AlertTriangle className="h-5 w-5 text-destructive" />
							</div>
							<div>
								<h2 className="text-base font-semibold">
									Revoke API Key
								</h2>
								<p className="text-sm text-muted-foreground">
									&ldquo;{revokeTarget.name}&rdquo;
								</p>
							</div>
						</div>
						<p className="mt-4 text-sm text-muted-foreground">
							This action cannot be undone. Any applications using
							this key will lose access immediately.
						</p>
						<div className="mt-5 flex items-center justify-end gap-3">
							<button
								type="button"
								onClick={() => setRevokeTarget(null)}
								className="cursor-pointer rounded-lg px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={handleRevoke}
								disabled={revokeKey.isPending}
								className="cursor-pointer rounded-lg bg-destructive px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50"
							>
								{revokeKey.isPending
									? 'Revoking...'
									: 'Revoke Key'}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
