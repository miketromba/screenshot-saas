'use client'

import {
	AlertTriangle,
	Check,
	Copy,
	ImageIcon,
	Key,
	Loader2,
	Play,
	Plus
} from 'lucide-react'
import { useState } from 'react'
import { useApiKeys, useCreateApiKey } from '@/hooks/use-queries'

interface ScreenshotResult {
	imageUrl: string
	creditsRemaining: string | null
	screenshotId: string | null
	durationMs: string | null
}

export default function PlaygroundPage() {
	const { data: apiKeys, isLoading: keysLoading } = useApiKeys()
	const createKeyMutation = useCreateApiKey()

	const [apiKey, setApiKey] = useState('')
	const [justCreatedKey, setJustCreatedKey] = useState<string | null>(null)

	const [url, setUrl] = useState('')
	const [width, setWidth] = useState('1280')
	const [height, setHeight] = useState('720')
	const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png')
	const [quality, setQuality] = useState('80')
	const [fullPage, setFullPage] = useState(false)
	const [colorScheme, setColorScheme] = useState<'light' | 'dark' | ''>('')
	const [waitUntil, setWaitUntil] = useState('')
	const [waitForSelector, setWaitForSelector] = useState('')
	const [delay, setDelay] = useState('')

	const [loading, setLoading] = useState(false)
	const [result, setResult] = useState<ScreenshotResult | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [copied, setCopied] = useState(false)

	const activeKey = apiKey || justCreatedKey || ''
	const hasKeys = apiKeys && apiKeys.length > 0

	async function handleCreateKey() {
		const result = await createKeyMutation.mutateAsync('Playground')
		setJustCreatedKey(result.key)
		setApiKey(result.key)
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		if (!activeKey) return

		setLoading(true)
		setError(null)
		setResult(null)

		const params = new URLSearchParams({ url })
		if (width) params.set('width', width)
		if (height) params.set('height', height)
		if (format) params.set('type', format)
		if (quality && format !== 'png') params.set('quality', quality)
		if (fullPage) params.set('fullPage', 'true')
		if (colorScheme) params.set('colorScheme', colorScheme)
		if (waitUntil) params.set('waitUntil', waitUntil)
		if (waitForSelector) params.set('waitForSelector', waitForSelector)
		if (delay) params.set('delay', delay)

		try {
			const response = await fetch(
				`/api/v1/screenshot?${params.toString()}`,
				{ headers: { 'x-api-key': activeKey } }
			)

			if (!response.ok) {
				const errorBody = await response.json()
				throw new Error(
					errorBody.error ||
						errorBody.message ||
						`Request failed (${response.status})`
				)
			}

			const blob = await response.blob()
			const imageUrl = URL.createObjectURL(blob)

			setResult({
				imageUrl,
				creditsRemaining: response.headers.get('x-credits-remaining'),
				screenshotId: response.headers.get('x-screenshot-id'),
				durationMs: response.headers.get('x-duration-ms')
			})
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Screenshot failed')
		} finally {
			setLoading(false)
		}
	}

	async function copyToClipboard(text: string) {
		await navigator.clipboard.writeText(text)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	const inputClass =
		'w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring'
	const selectClass =
		'w-full cursor-pointer rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring'
	const labelClass = 'block text-sm font-medium mb-1.5'

	return (
		<div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
			<div className="mb-8">
				<h1 className="text-2xl font-bold tracking-tight">
					Playground
				</h1>
				<p className="mt-1 text-sm text-muted-foreground">
					Test the Screenshot API interactively
				</p>
			</div>

			<div className="mb-6 rounded-xl border border-border bg-card p-4">
				<div className="mb-3 flex items-center gap-2">
					<Key className="h-4 w-4 text-muted-foreground" />
					<p className="text-sm font-medium">API Key</p>
				</div>
				{keysLoading ? (
					<div className="h-10 animate-pulse rounded-lg bg-muted" />
				) : !hasKeys && !justCreatedKey ? (
					<div className="flex items-center gap-3">
						<p className="text-sm text-muted-foreground">
							No API keys found.
						</p>
						<button
							type="button"
							onClick={handleCreateKey}
							disabled={createKeyMutation.isPending}
							className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
						>
							{createKeyMutation.isPending ? (
								<>
									<Loader2 className="h-3 w-3 animate-spin" />{' '}
									Creating...
								</>
							) : (
								<>
									<Plus className="h-3 w-3" /> Create API Key
								</>
							)}
						</button>
					</div>
				) : (
					<div>
						<div className="flex items-center gap-2">
							<input
								type="password"
								value={activeKey}
								onChange={e => setApiKey(e.target.value)}
								placeholder="Enter your API key (ss_live_...)"
								className="flex-1 rounded-lg border border-input bg-background px-3 py-2 font-(family-name:--font-geist-mono) text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
							/>
							{activeKey && (
								<button
									type="button"
									onClick={() => copyToClipboard(activeKey)}
									className="cursor-pointer rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
								>
									{copied ? (
										<Check className="h-4 w-4 text-chart-2" />
									) : (
										<Copy className="h-4 w-4" />
									)}
								</button>
							)}
						</div>
						{hasKeys && !activeKey && (
							<p className="mt-2 text-xs text-muted-foreground">
								You have {apiKeys.length} key
								{apiKeys.length !== 1 ? 's' : ''} (
								{apiKeys
									.map(k => `${k.keyPrefix}...`)
									.join(', ')}
								). Enter the full key above to test.
							</p>
						)}
					</div>
				)}
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-4 rounded-xl border border-border bg-card p-5">
						<div>
							<label htmlFor="pg-url" className={labelClass}>
								URL <span className="text-destructive">*</span>
							</label>
							<input
								id="pg-url"
								type="url"
								value={url}
								onChange={e => setUrl(e.target.value)}
								placeholder="https://example.com"
								required
								className={`${inputClass} font-(family-name:--font-geist-mono)`}
							/>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div>
								<label
									htmlFor="pg-width"
									className={labelClass}
								>
									Width
								</label>
								<input
									id="pg-width"
									type="number"
									value={width}
									onChange={e => setWidth(e.target.value)}
									placeholder="1280"
									className={inputClass}
								/>
							</div>
							<div>
								<label
									htmlFor="pg-height"
									className={labelClass}
								>
									Height
								</label>
								<input
									id="pg-height"
									type="number"
									value={height}
									onChange={e => setHeight(e.target.value)}
									placeholder="720"
									className={inputClass}
								/>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div>
								<label
									htmlFor="pg-format"
									className={labelClass}
								>
									Format
								</label>
								<select
									id="pg-format"
									value={format}
									onChange={e =>
										setFormat(
											e.target.value as
												| 'png'
												| 'jpeg'
												| 'webp'
										)
									}
									className={selectClass}
								>
									<option value="png">PNG</option>
									<option value="jpeg">JPEG</option>
									<option value="webp">WebP</option>
								</select>
							</div>
							<div>
								<label
									htmlFor="pg-quality"
									className={labelClass}
								>
									Quality
								</label>
								<input
									id="pg-quality"
									type="number"
									min="1"
									max="100"
									value={quality}
									onChange={e => setQuality(e.target.value)}
									disabled={format === 'png'}
									className={`${inputClass} disabled:opacity-50`}
								/>
							</div>
						</div>

						<div className="flex items-center gap-3">
							<button
								type="button"
								role="switch"
								aria-checked={fullPage}
								onClick={() => setFullPage(!fullPage)}
								className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
									fullPage ? 'bg-primary' : 'bg-input'
								}`}
							>
								<span
									className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
										fullPage
											? 'translate-x-5'
											: 'translate-x-0'
									}`}
								/>
							</button>
							<span
								className="cursor-pointer text-sm font-medium"
								onClick={() => setFullPage(!fullPage)}
								onKeyDown={e => {
									if (e.key === 'Enter' || e.key === ' ')
										setFullPage(!fullPage)
								}}
								role="button"
								tabIndex={0}
							>
								Full Page Screenshot
							</span>
						</div>

						<div>
							<label
								htmlFor="pg-color-scheme"
								className={labelClass}
							>
								Color Scheme
							</label>
							<select
								id="pg-color-scheme"
								value={colorScheme}
								onChange={e =>
									setColorScheme(
										e.target.value as 'light' | 'dark' | ''
									)
								}
								className={selectClass}
							>
								<option value="">Auto</option>
								<option value="light">Light</option>
								<option value="dark">Dark</option>
							</select>
						</div>

						<div>
							<label
								htmlFor="pg-wait-until"
								className={labelClass}
							>
								Wait Until
							</label>
							<select
								id="pg-wait-until"
								value={waitUntil}
								onChange={e => setWaitUntil(e.target.value)}
								className={selectClass}
							>
								<option value="">Default (load)</option>
								<option value="load">load</option>
								<option value="domcontentloaded">
									domcontentloaded
								</option>
								<option value="networkidle">networkidle</option>
							</select>
						</div>

						<div>
							<label
								htmlFor="pg-wait-selector"
								className={labelClass}
							>
								Wait For Selector
							</label>
							<input
								id="pg-wait-selector"
								type="text"
								value={waitForSelector}
								onChange={e =>
									setWaitForSelector(e.target.value)
								}
								placeholder="#main-content"
								className={`${inputClass} font-(family-name:--font-geist-mono)`}
							/>
						</div>

						<div>
							<label htmlFor="pg-delay" className={labelClass}>
								Delay (ms)
							</label>
							<input
								id="pg-delay"
								type="number"
								min="0"
								max="10000"
								value={delay}
								onChange={e => setDelay(e.target.value)}
								placeholder="0"
								className={inputClass}
							/>
						</div>
					</div>

					<button
						type="submit"
						disabled={loading || !activeKey || !url}
						className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{loading ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />{' '}
								Taking Screenshot...
							</>
						) : (
							<>
								<Play className="h-4 w-4" /> Take Screenshot
							</>
						)}
					</button>
				</form>

				<div>
					{error && (
						<div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
							<div className="flex items-center gap-2">
								<AlertTriangle className="h-4 w-4 text-destructive" />
								<p className="text-sm font-medium text-destructive">
									Error
								</p>
							</div>
							<p className="mt-1 text-sm text-muted-foreground">
								{error}
							</p>
						</div>
					)}

					{loading && (
						<div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-16">
							<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
							<p className="mt-3 text-sm text-muted-foreground">
								Capturing screenshot...
							</p>
						</div>
					)}

					{result && (
						<div className="space-y-4">
							<div className="rounded-xl border border-border bg-card p-4">
								<p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
									Response
								</p>
								<div className="grid grid-cols-3 gap-3">
									{result.creditsRemaining !== null && (
										<div>
											<p className="text-xs text-muted-foreground">
												Credits Left
											</p>
											<p className="font-(family-name:--font-geist-mono) text-sm font-semibold">
												{result.creditsRemaining}
											</p>
										</div>
									)}
									{result.durationMs !== null && (
										<div>
											<p className="text-xs text-muted-foreground">
												Duration
											</p>
											<p className="font-(family-name:--font-geist-mono) text-sm font-semibold">
												{(
													Number(result.durationMs) /
													1000
												).toFixed(2)}
												s
											</p>
										</div>
									)}
									{result.screenshotId !== null && (
										<div>
											<p className="text-xs text-muted-foreground">
												ID
											</p>
											<p className="truncate font-(family-name:--font-geist-mono) text-sm text-muted-foreground">
												{result.screenshotId}
											</p>
										</div>
									)}
								</div>
							</div>

							<div className="overflow-hidden rounded-xl border border-border bg-card">
								<img
									src={result.imageUrl}
									alt="Screenshot result"
									className="w-full"
								/>
							</div>
						</div>
					)}

					{!loading && !result && !error && (
						<div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-16">
							<ImageIcon className="h-10 w-10 text-muted-foreground/20" />
							<p className="mt-3 text-sm text-muted-foreground">
								Screenshot will appear here
							</p>
							<p className="mt-1 text-xs text-muted-foreground/60">
								Enter a URL and click &ldquo;Take
								Screenshot&rdquo;
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
