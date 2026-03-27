'use client'

import { AlertTriangle, Check, Copy, Loader2, Play } from 'lucide-react'
import { useState } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_APP_URL ?? 'https://screenshotapi.to'

interface ParamDef {
	key: string
	label: string
	type: 'text' | 'number' | 'select' | 'toggle' | 'textarea'
	required?: boolean
	placeholder?: string
	options?: string[]
}

const PARAMS: ParamDef[] = [
	{
		key: 'url',
		label: 'URL',
		type: 'text',
		required: true,
		placeholder: 'https://example.com'
	},
	{ key: 'width', label: 'Width', type: 'number', placeholder: '1440' },
	{ key: 'height', label: 'Height', type: 'number', placeholder: '900' },
	{
		key: 'type',
		label: 'Format',
		type: 'select',
		options: ['png', 'jpeg', 'webp', 'pdf']
	},
	{ key: 'quality', label: 'Quality', type: 'number', placeholder: '100' },
	{ key: 'fullPage', label: 'Full Page', type: 'toggle' },
	{
		key: 'colorScheme',
		label: 'Color Scheme',
		type: 'select',
		options: ['', 'light', 'dark']
	},
	{
		key: 'waitUntil',
		label: 'Wait Until',
		type: 'select',
		options: [
			'',
			'load',
			'domcontentloaded',
			'networkidle0',
			'networkidle2'
		]
	},
	{
		key: 'waitForSelector',
		label: 'Wait For Selector',
		type: 'text',
		placeholder: '#content'
	},
	{ key: 'delay', label: 'Delay (ms)', type: 'number', placeholder: '0' },
	{ key: 'blockAds', label: 'Block Ads', type: 'toggle' },
	{
		key: 'removeCookieBanners',
		label: 'Remove Cookie Banners',
		type: 'toggle'
	},
	{ key: 'removePopups', label: 'Remove Popups', type: 'toggle' },
	{
		key: 'removeElements',
		label: 'Remove Elements',
		type: 'text',
		placeholder: '.popup, #banner'
	},
	{ key: 'stealthMode', label: 'Stealth Mode', type: 'toggle' },
	{ key: 'preloadFonts', label: 'Preload Fonts', type: 'toggle' },
	{
		key: 'devicePixelRatio',
		label: 'Device Pixel Ratio',
		type: 'select',
		options: ['', '2', '3']
	},
	{
		key: 'mockupDevice',
		label: 'Mockup Device',
		type: 'select',
		options: ['', 'browser', 'iphone', 'macbook']
	},
	{
		key: 'timezone',
		label: 'Timezone',
		type: 'text',
		placeholder: 'America/New_York'
	},
	{ key: 'locale', label: 'Locale', type: 'text', placeholder: 'en-US' },
	{
		key: 'cacheTtl',
		label: 'Cache TTL (s)',
		type: 'number',
		placeholder: '0'
	},
	{
		key: 'cssInject',
		label: 'CSS Inject',
		type: 'textarea',
		placeholder: 'body { background: white; }'
	},
	{
		key: 'jsInject',
		label: 'JS Inject',
		type: 'textarea',
		placeholder: 'document.querySelector(".popup")?.remove()'
	}
]

export function ApiExplorer() {
	const [values, setValues] = useState<Record<string, string>>({})
	const [apiKey, setApiKey] = useState('')
	const [loading, setLoading] = useState(false)
	const [result, setResult] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [copied, setCopied] = useState(false)

	function set(key: string, value: string) {
		setValues(prev => ({ ...prev, [key]: value }))
	}

	function buildQueryString(): string {
		const params = new URLSearchParams()
		for (const p of PARAMS) {
			const val = values[p.key]
			if (!val) continue
			if (p.type === 'toggle') {
				if (val === 'true') params.set(p.key, 'true')
			} else {
				params.set(p.key, val)
			}
		}
		return params.toString()
	}

	function buildCurl(): string {
		const qs = buildQueryString()
		const key = apiKey || 'sk_live_your_key_here'
		return `curl "${API_BASE}/api/v1/screenshot?${qs}" \\\n  -H "x-api-key: ${key}" \\\n  --output screenshot.png`
	}

	function buildFetch(): string {
		const qs = buildQueryString()
		const key = apiKey || 'sk_live_your_key_here'
		return `const response = await fetch(
  '${API_BASE}/api/v1/screenshot?${qs}',
  { headers: { 'x-api-key': '${key}' } }
)

const buffer = Buffer.from(await response.arrayBuffer())
await fs.promises.writeFile('screenshot.png', buffer)`
	}

	async function handleExecute() {
		if (!apiKey || !values.url) return
		setLoading(true)
		setError(null)
		setResult(null)

		const qs = buildQueryString()
		try {
			const response = await fetch(
				`${API_BASE}/api/v1/screenshot?${qs}`,
				{ headers: { 'x-api-key': apiKey } }
			)
			if (!response.ok) {
				const body = await response.json()
				throw new Error(
					body.message || body.error || `Error ${response.status}`
				)
			}
			const blob = await response.blob()
			setResult(URL.createObjectURL(blob))
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Request failed')
		} finally {
			setLoading(false)
		}
	}

	function handleCopy(text: string) {
		navigator.clipboard.writeText(text)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	const inputCls =
		'w-full rounded-md border border-fd-border bg-fd-background px-2.5 py-1.5 text-sm outline-none focus:border-fd-ring focus:ring-1 focus:ring-fd-ring'

	return (
		<div className="not-prose mt-6 space-y-6">
			<div className="rounded-lg border border-fd-border bg-fd-card p-4">
				<h3 className="mb-3 text-sm font-semibold">API Key</h3>
				<input
					type="password"
					value={apiKey}
					onChange={e => setApiKey(e.target.value)}
					placeholder="sk_live_your_key_here (optional — needed to execute)"
					className={`${inputCls} font-mono`}
				/>
			</div>

			<div className="rounded-lg border border-fd-border bg-fd-card p-4">
				<h3 className="mb-3 text-sm font-semibold">Parameters</h3>
				<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
					{PARAMS.map(p => (
						<div
							key={p.key}
							className={
								p.type === 'textarea' ? 'sm:col-span-2' : ''
							}
						>
							<label
								htmlFor={`explorer-${p.key}`}
								className="mb-1 block text-xs font-medium text-fd-muted-foreground"
							>
								{p.label}
								{p.required && (
									<span className="text-red-500"> *</span>
								)}
							</label>
							{p.type === 'select' ? (
								<select
									id={`explorer-${p.key}`}
									value={values[p.key] ?? ''}
									onChange={e => set(p.key, e.target.value)}
									className={`${inputCls} cursor-pointer`}
								>
									{p.options?.map(o => (
										<option key={o} value={o}>
											{o || '(default)'}
										</option>
									))}
								</select>
							) : p.type === 'toggle' ? (
								<button
									id={`explorer-${p.key}`}
									type="button"
									onClick={() =>
										set(
											p.key,
											values[p.key] === 'true'
												? ''
												: 'true'
										)
									}
									className={`cursor-pointer rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
										values[p.key] === 'true'
											? 'border-fd-primary bg-fd-primary text-fd-primary-foreground'
											: 'border-fd-border bg-fd-background text-fd-muted-foreground hover:bg-fd-accent'
									}`}
								>
									{values[p.key] === 'true'
										? 'Enabled'
										: 'Disabled'}
								</button>
							) : p.type === 'textarea' ? (
								<textarea
									id={`explorer-${p.key}`}
									value={values[p.key] ?? ''}
									onChange={e => set(p.key, e.target.value)}
									placeholder={p.placeholder}
									rows={2}
									className={`${inputCls} resize-none font-mono`}
								/>
							) : (
								<input
									id={`explorer-${p.key}`}
									type={p.type}
									value={values[p.key] ?? ''}
									onChange={e => set(p.key, e.target.value)}
									placeholder={p.placeholder}
									className={`${inputCls} ${p.key === 'url' ? 'font-mono' : ''}`}
								/>
							)}
						</div>
					))}
				</div>
			</div>

			<div className="rounded-lg border border-fd-border bg-fd-card p-4">
				<div className="mb-2 flex items-center justify-between">
					<h3 className="text-sm font-semibold">Generated cURL</h3>
					<button
						type="button"
						onClick={() => handleCopy(buildCurl())}
						className="inline-flex cursor-pointer items-center gap-1 text-xs text-fd-muted-foreground hover:text-fd-foreground"
					>
						{copied ? (
							<Check className="h-3.5 w-3.5" />
						) : (
							<Copy className="h-3.5 w-3.5" />
						)}
						{copied ? 'Copied' : 'Copy'}
					</button>
				</div>
				<pre className="overflow-x-auto rounded-md bg-fd-secondary p-3 font-mono text-xs leading-relaxed">
					{buildCurl()}
				</pre>
			</div>

			<div className="rounded-lg border border-fd-border bg-fd-card p-4">
				<div className="mb-2 flex items-center justify-between">
					<h3 className="text-sm font-semibold">
						Generated JavaScript
					</h3>
					<button
						type="button"
						onClick={() => handleCopy(buildFetch())}
						className="inline-flex cursor-pointer items-center gap-1 text-xs text-fd-muted-foreground hover:text-fd-foreground"
					>
						{copied ? (
							<Check className="h-3.5 w-3.5" />
						) : (
							<Copy className="h-3.5 w-3.5" />
						)}
						{copied ? 'Copied' : 'Copy'}
					</button>
				</div>
				<pre className="overflow-x-auto rounded-md bg-fd-secondary p-3 font-mono text-xs leading-relaxed">
					{buildFetch()}
				</pre>
			</div>

			{apiKey && values.url && (
				<div className="rounded-lg border border-fd-border bg-fd-card p-4">
					<button
						type="button"
						onClick={handleExecute}
						disabled={loading}
						className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-fd-primary px-4 py-2.5 text-sm font-medium text-fd-primary-foreground transition-colors hover:bg-fd-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{loading ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />{' '}
								Executing...
							</>
						) : (
							<>
								<Play className="h-4 w-4" /> Execute Request
							</>
						)}
					</button>

					{error && (
						<div className="mt-4 rounded-md border border-red-500/30 bg-red-50 p-3 dark:bg-red-950/20">
							<div className="flex items-center gap-2">
								<AlertTriangle className="h-4 w-4 text-red-600" />
								<p className="text-sm text-red-600">{error}</p>
							</div>
						</div>
					)}

					{result && (
						<div className="mt-4 overflow-hidden rounded-md border border-fd-border">
							<img
								src={result}
								alt="API result"
								className="w-full"
							/>
						</div>
					)}
				</div>
			)}
		</div>
	)
}
