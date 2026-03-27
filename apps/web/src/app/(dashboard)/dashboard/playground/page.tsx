'use client'

import { useQueryClient } from '@tanstack/react-query'
import {
	AlertTriangle,
	Check,
	ImageIcon,
	Loader2,
	Play,
	Share2
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useCredits, useUser } from '@/hooks/use-queries'

interface ScreenshotResult {
	imageUrl: string
	creditsRemaining: string | null
	screenshotId: string | null
	durationMs: string | null
	usageSource: string | null
}

function usePlaygroundParams() {
	const [initialized, setInitialized] = useState(false)

	const [url, setUrl] = useState('')
	const [width, setWidth] = useState('1280')
	const [height, setHeight] = useState('720')
	const [format, setFormat] = useState<'png' | 'jpeg' | 'webp' | 'pdf'>('png')
	const [quality, setQuality] = useState('80')
	const [fullPage, setFullPage] = useState(false)
	const [colorScheme, setColorScheme] = useState<'light' | 'dark' | ''>('')
	const [waitUntil, setWaitUntil] = useState('')
	const [waitForSelector, setWaitForSelector] = useState('')
	const [delay, setDelay] = useState('')
	const [blockAds, setBlockAds] = useState(false)
	const [removeCookieBanners, setRemoveCookieBanners] = useState(false)
	const [stealthMode, setStealthMode] = useState(false)
	const [cssInject, setCssInject] = useState('')
	const [jsInject, setJsInject] = useState('')
	const [devicePixelRatio, setDevicePixelRatio] = useState('')
	const [timezone, setTimezone] = useState('')
	const [locale, setLocale] = useState('')
	const [preloadFonts, setPreloadFonts] = useState(false)
	const [removeElements, setRemoveElements] = useState('')
	const [removePopups, setRemovePopups] = useState(false)
	const [mockupDevice, setMockupDevice] = useState('')

	useEffect(() => {
		if (initialized) return
		const params = new URLSearchParams(window.location.search)
		if (params.get('url')) setUrl(params.get('url')!)
		if (params.get('width')) setWidth(params.get('width')!)
		if (params.get('height')) setHeight(params.get('height')!)
		if (params.get('type'))
			setFormat(params.get('type') as 'png' | 'jpeg' | 'webp' | 'pdf')
		if (params.get('quality')) setQuality(params.get('quality')!)
		if (params.get('fullPage') === 'true') setFullPage(true)
		if (params.get('colorScheme'))
			setColorScheme(params.get('colorScheme') as 'light' | 'dark')
		if (params.get('waitUntil')) setWaitUntil(params.get('waitUntil')!)
		if (params.get('waitForSelector'))
			setWaitForSelector(params.get('waitForSelector')!)
		if (params.get('delay')) setDelay(params.get('delay')!)
		if (params.get('blockAds') === 'true') setBlockAds(true)
		if (params.get('removeCookieBanners') === 'true')
			setRemoveCookieBanners(true)
		if (params.get('stealthMode') === 'true') setStealthMode(true)
		if (params.get('cssInject')) setCssInject(params.get('cssInject')!)
		if (params.get('jsInject')) setJsInject(params.get('jsInject')!)
		if (params.get('devicePixelRatio'))
			setDevicePixelRatio(params.get('devicePixelRatio')!)
		if (params.get('timezone')) setTimezone(params.get('timezone')!)
		if (params.get('locale')) setLocale(params.get('locale')!)
		if (params.get('preloadFonts') === 'true') setPreloadFonts(true)
		if (params.get('removeElements'))
			setRemoveElements(params.get('removeElements')!)
		if (params.get('removePopups') === 'true') setRemovePopups(true)
		if (params.get('mockupDevice'))
			setMockupDevice(params.get('mockupDevice')!)
		setInitialized(true)
	}, [initialized])

	const buildShareUrl = useCallback(() => {
		const params = new URLSearchParams()
		if (url) params.set('url', url)
		if (width && width !== '1280') params.set('width', width)
		if (height && height !== '720') params.set('height', height)
		if (format !== 'png') params.set('type', format)
		if (quality && quality !== '80' && format !== 'png' && format !== 'pdf')
			params.set('quality', quality)
		if (fullPage) params.set('fullPage', 'true')
		if (colorScheme) params.set('colorScheme', colorScheme)
		if (waitUntil) params.set('waitUntil', waitUntil)
		if (waitForSelector) params.set('waitForSelector', waitForSelector)
		if (delay) params.set('delay', delay)
		if (blockAds) params.set('blockAds', 'true')
		if (removeCookieBanners) params.set('removeCookieBanners', 'true')
		if (stealthMode) params.set('stealthMode', 'true')
		if (cssInject) params.set('cssInject', cssInject)
		if (jsInject) params.set('jsInject', jsInject)
		if (devicePixelRatio) params.set('devicePixelRatio', devicePixelRatio)
		if (timezone) params.set('timezone', timezone)
		if (locale) params.set('locale', locale)
		if (preloadFonts) params.set('preloadFonts', 'true')
		if (removeElements) params.set('removeElements', removeElements)
		if (removePopups) params.set('removePopups', 'true')
		if (mockupDevice) params.set('mockupDevice', mockupDevice)
		const qs = params.toString()
		return `${window.location.origin}${window.location.pathname}${qs ? `?${qs}` : ''}`
	}, [
		url,
		width,
		height,
		format,
		quality,
		fullPage,
		colorScheme,
		waitUntil,
		waitForSelector,
		delay,
		blockAds,
		removeCookieBanners,
		stealthMode,
		cssInject,
		jsInject,
		devicePixelRatio,
		timezone,
		locale,
		preloadFonts,
		removeElements,
		removePopups,
		mockupDevice
	])

	useEffect(() => {
		if (!initialized) return
		const shareUrl = buildShareUrl()
		const currentUrl =
			window.location.origin +
			window.location.pathname +
			window.location.search
		if (shareUrl !== currentUrl) {
			window.history.replaceState(null, '', shareUrl)
		}
	}, [initialized, buildShareUrl])

	return {
		url,
		setUrl,
		width,
		setWidth,
		height,
		setHeight,
		format,
		setFormat,
		quality,
		setQuality,
		fullPage,
		setFullPage,
		colorScheme,
		setColorScheme,
		waitUntil,
		setWaitUntil,
		waitForSelector,
		setWaitForSelector,
		delay,
		setDelay,
		blockAds,
		setBlockAds,
		removeCookieBanners,
		setRemoveCookieBanners,
		stealthMode,
		setStealthMode,
		cssInject,
		setCssInject,
		jsInject,
		setJsInject,
		devicePixelRatio,
		setDevicePixelRatio,
		timezone,
		setTimezone,
		locale,
		setLocale,
		preloadFonts,
		setPreloadFonts,
		removeElements,
		setRemoveElements,
		removePopups,
		setRemovePopups,
		mockupDevice,
		setMockupDevice,
		buildShareUrl
	}
}

export default function PlaygroundPage() {
	const { data: credits } = useCredits()
	const { data: user } = useUser()
	const queryClient = useQueryClient()

	const params = usePlaygroundParams()
	const {
		url,
		setUrl,
		width,
		setWidth,
		height,
		setHeight,
		format,
		setFormat,
		quality,
		setQuality,
		fullPage,
		setFullPage,
		colorScheme,
		setColorScheme,
		waitUntil,
		setWaitUntil,
		waitForSelector,
		setWaitForSelector,
		delay,
		setDelay,
		blockAds,
		setBlockAds,
		removeCookieBanners,
		setRemoveCookieBanners,
		stealthMode,
		setStealthMode,
		cssInject,
		setCssInject,
		jsInject,
		setJsInject,
		devicePixelRatio,
		setDevicePixelRatio,
		timezone,
		setTimezone,
		locale,
		setLocale,
		preloadFonts,
		setPreloadFonts,
		removeElements,
		setRemoveElements,
		removePopups,
		setRemovePopups,
		mockupDevice,
		setMockupDevice,
		buildShareUrl
	} = params

	const [loading, setLoading] = useState(false)
	const [result, setResult] = useState<ScreenshotResult | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [copied, setCopied] = useState(false)

	const sub = user?.subscription

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setLoading(true)
		setError(null)
		setResult(null)

		const qp = new URLSearchParams({ url })
		if (width) qp.set('width', width)
		if (height) qp.set('height', height)
		if (format) qp.set('type', format)
		if (quality && format !== 'png' && format !== 'pdf')
			qp.set('quality', quality)
		if (fullPage) qp.set('fullPage', 'true')
		if (colorScheme) qp.set('colorScheme', colorScheme)
		if (waitUntil) qp.set('waitUntil', waitUntil)
		if (waitForSelector) qp.set('waitForSelector', waitForSelector)
		if (delay) qp.set('delay', delay)
		if (blockAds) qp.set('blockAds', 'true')
		if (removeCookieBanners) qp.set('removeCookieBanners', 'true')
		if (stealthMode) qp.set('stealthMode', 'true')
		if (cssInject) qp.set('cssInject', cssInject)
		if (jsInject) qp.set('jsInject', jsInject)
		if (devicePixelRatio) qp.set('devicePixelRatio', devicePixelRatio)
		if (timezone) qp.set('timezone', timezone)
		if (locale) qp.set('locale', locale)
		if (preloadFonts) qp.set('preloadFonts', 'true')
		if (removeElements) qp.set('removeElements', removeElements)
		if (removePopups) qp.set('removePopups', 'true')
		if (mockupDevice) qp.set('mockupDevice', mockupDevice)

		try {
			const response = await fetch(
				`/api/v1/playground/screenshot?${qp.toString()}`
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
				durationMs: response.headers.get('x-duration-ms'),
				usageSource: response.headers.get('x-usage-source')
			})

			queryClient.invalidateQueries({ queryKey: ['credits'] })
			queryClient.invalidateQueries({ queryKey: ['user'] })
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Screenshot failed')
		} finally {
			setLoading(false)
		}
	}

	function handleShare() {
		const shareUrl = buildShareUrl()
		navigator.clipboard.writeText(shareUrl)
		setCopied(true)
		setTimeout(() => setCopied(false), 2000)
	}

	const inputClass =
		'w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring'
	const selectClass =
		'w-full cursor-pointer rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring'
	const labelClass = 'block text-sm font-medium mb-1.5'

	function Toggle({
		checked,
		onChange,
		label
	}: {
		checked: boolean
		onChange: (v: boolean) => void
		label: string
	}) {
		return (
			<div className="flex items-center gap-3">
				<button
					type="button"
					role="switch"
					aria-checked={checked}
					onClick={() => onChange(!checked)}
					className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
						checked ? 'bg-primary' : 'bg-input'
					}`}
				>
					<span
						className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
							checked ? 'translate-x-5' : 'translate-x-0'
						}`}
					/>
				</button>
				<span
					className="cursor-pointer text-sm font-medium"
					onClick={() => onChange(!checked)}
					onKeyDown={e => {
						if (e.key === 'Enter' || e.key === ' ')
							onChange(!checked)
					}}
					role="button"
					tabIndex={0}
				>
					{label}
				</span>
			</div>
		)
	}

	return (
		<div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
			<div className="mb-8 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">
						Playground
					</h1>
					<p className="mt-1 text-sm text-muted-foreground">
						Test the Screenshot API using your session — no API key
						needed
					</p>
				</div>
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={handleShare}
						className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
					>
						{copied ? (
							<Check className="h-3.5 w-3.5" />
						) : (
							<Share2 className="h-3.5 w-3.5" />
						)}
						{copied ? 'Copied!' : 'Share'}
					</button>
					{sub && (
						<div className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm">
							<span className="text-muted-foreground">
								Plan:{' '}
							</span>
							<span className="font-semibold capitalize">
								{sub.plan}
							</span>
							<span className="text-muted-foreground">
								{' '}
								({sub.screenshotsUsedThisMonth}/
								{sub.screenshotsPerMonth})
							</span>
						</div>
					)}
					{credits && (
						<div className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm">
							<span className="text-muted-foreground">
								Credits:{' '}
							</span>
							<span className="font-semibold tabular-nums">
								{credits.balance}
							</span>
						</div>
					)}
				</div>
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
												| 'pdf'
										)
									}
									className={selectClass}
								>
									<option value="png">PNG</option>
									<option value="jpeg">JPEG</option>
									<option value="webp">WebP</option>
									<option value="pdf">PDF</option>
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
									disabled={
										format === 'png' || format === 'pdf'
									}
									className={`${inputClass} disabled:opacity-50`}
								/>
							</div>
						</div>

						<Toggle
							checked={fullPage}
							onChange={setFullPage}
							label="Full Page Screenshot"
						/>
						<Toggle
							checked={blockAds}
							onChange={setBlockAds}
							label="Block Ads"
						/>
						<Toggle
							checked={removeCookieBanners}
							onChange={setRemoveCookieBanners}
							label="Remove Cookie Banners"
						/>
						<Toggle
							checked={removePopups}
							onChange={setRemovePopups}
							label="Remove Popups & Overlays"
						/>
						<Toggle
							checked={stealthMode}
							onChange={setStealthMode}
							label="Stealth Mode"
						/>
						<Toggle
							checked={preloadFonts}
							onChange={setPreloadFonts}
							label="Preload Google Fonts"
						/>

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
								<option value="">Default (networkidle2)</option>
								<option value="load">load</option>
								<option value="domcontentloaded">
									domcontentloaded
								</option>
								<option value="networkidle0">
									networkidle0
								</option>
								<option value="networkidle2">
									networkidle2
								</option>
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

					<div className="space-y-4 rounded-xl border border-border bg-card p-5">
						<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
							Advanced
						</p>

						<div className="grid grid-cols-2 gap-3">
							<div>
								<label htmlFor="pg-dpr" className={labelClass}>
									Device Pixel Ratio
								</label>
								<select
									id="pg-dpr"
									value={devicePixelRatio}
									onChange={e =>
										setDevicePixelRatio(e.target.value)
									}
									className={selectClass}
								>
									<option value="">1x (default)</option>
									<option value="2">2x (Retina)</option>
									<option value="3">3x</option>
								</select>
							</div>
							<div>
								<label
									htmlFor="pg-mockup"
									className={labelClass}
								>
									Device Mockup
								</label>
								<select
									id="pg-mockup"
									value={mockupDevice}
									onChange={e =>
										setMockupDevice(e.target.value)
									}
									className={selectClass}
								>
									<option value="">None</option>
									<option value="browser">Browser</option>
									<option value="iphone">iPhone</option>
									<option value="macbook">MacBook</option>
								</select>
							</div>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div>
								<label
									htmlFor="pg-timezone"
									className={labelClass}
								>
									Timezone
								</label>
								<input
									id="pg-timezone"
									type="text"
									value={timezone}
									onChange={e => setTimezone(e.target.value)}
									placeholder="America/New_York"
									className={inputClass}
								/>
							</div>
							<div>
								<label
									htmlFor="pg-locale"
									className={labelClass}
								>
									Locale
								</label>
								<input
									id="pg-locale"
									type="text"
									value={locale}
									onChange={e => setLocale(e.target.value)}
									placeholder="en-US"
									className={inputClass}
								/>
							</div>
						</div>

						<div>
							<label
								htmlFor="pg-remove-elements"
								className={labelClass}
							>
								Remove Elements (comma-separated selectors)
							</label>
							<input
								id="pg-remove-elements"
								type="text"
								value={removeElements}
								onChange={e =>
									setRemoveElements(e.target.value)
								}
								placeholder=".popup, #banner, .newsletter-signup"
								className={`${inputClass} font-(family-name:--font-geist-mono)`}
							/>
						</div>

						<div>
							<label
								htmlFor="pg-css-inject"
								className={labelClass}
							>
								CSS Injection
							</label>
							<textarea
								id="pg-css-inject"
								value={cssInject}
								onChange={e => setCssInject(e.target.value)}
								placeholder="body { background: white; }"
								rows={2}
								className={`${inputClass} font-(family-name:--font-geist-mono) resize-none`}
							/>
						</div>

						<div>
							<label
								htmlFor="pg-js-inject"
								className={labelClass}
							>
								JS Injection
							</label>
							<textarea
								id="pg-js-inject"
								value={jsInject}
								onChange={e => setJsInject(e.target.value)}
								placeholder="document.querySelector('.popup')?.remove()"
								rows={2}
								className={`${inputClass} font-(family-name:--font-geist-mono) resize-none`}
							/>
						</div>
					</div>

					<button
						type="submit"
						disabled={loading || !url}
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
								<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
									{result.creditsRemaining !== null && (
										<div>
											<p className="text-xs text-muted-foreground">
												Remaining
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
									{result.usageSource && (
										<div>
											<p className="text-xs text-muted-foreground">
												Source
											</p>
											<p className="text-sm font-semibold capitalize">
												{result.usageSource}
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

							{format === 'pdf' ? (
								<div className="rounded-xl border border-border bg-card p-8 text-center">
									<p className="text-sm text-muted-foreground">
										PDF generated successfully
									</p>
									<a
										href={result.imageUrl}
										download="screenshot.pdf"
										className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
									>
										Download PDF
									</a>
								</div>
							) : (
								<div className="overflow-hidden rounded-xl border border-border bg-card">
									<img
										src={result.imageUrl}
										alt="Screenshot result"
										className="w-full"
									/>
								</div>
							)}
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
