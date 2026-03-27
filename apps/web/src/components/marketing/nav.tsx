'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState
} from 'react'

const DROPDOWN_TABS = ['use-cases', 'compare', 'integrations'] as const
type DropdownTab = (typeof DROPDOWN_TABS)[number]

const TAB_LABELS: Record<DropdownTab, string> = {
	'use-cases': 'Use Cases',
	compare: 'Compare',
	integrations: 'Integrations'
}

const TAB_HREFS: Record<DropdownTab, string> = {
	'use-cases': '/use-cases',
	compare: '/compare',
	integrations: '/integrations'
}

const PANEL_WIDTHS: Record<DropdownTab, number> = {
	'use-cases': 580,
	compare: 500,
	integrations: 560
}

function DropdownLink({
	href,
	title,
	desc
}: {
	href: string
	title: string
	desc: string
}) {
	return (
		<Link
			href={href}
			className="group/link -mx-2 flex cursor-pointer gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/60"
		>
			<div className="min-w-0">
				<div className="text-sm font-medium text-foreground group-hover/link:text-primary">
					{title}
				</div>
				<div className="mt-0.5 text-xs leading-snug text-muted-foreground">
					{desc}
				</div>
			</div>
		</Link>
	)
}

function SectionLabel({ children }: { children: React.ReactNode }) {
	return (
		<div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
			{children}
		</div>
	)
}

function PanelFooter({
	href,
	children
}: {
	href: string
	children: React.ReactNode
}) {
	return (
		<div className="mt-3 border-t border-border/60 pt-3">
			<Link
				href={href}
				className="cursor-pointer text-[13px] font-medium text-primary transition-colors hover:text-primary/80"
			>
				{children}
			</Link>
		</div>
	)
}

function UseCasesPanel() {
	return (
		<div className="p-5">
			<div className="grid grid-cols-2 gap-x-8">
				<div>
					<SectionLabel>Generate</SectionLabel>
					<div className="space-y-0.5">
						<DropdownLink
							href="/use-cases/og-image-generation"
							title="OG Images"
							desc="Dynamic social sharing images"
						/>
						<DropdownLink
							href="/use-cases/link-previews"
							title="Link Previews"
							desc="Rich thumbnails for any URL"
						/>
						<DropdownLink
							href="/use-cases/social-media-automation"
							title="Social Cards"
							desc="Branded images at scale"
						/>
						<DropdownLink
							href="/use-cases/pdf-generation"
							title="PDF Export"
							desc="Convert any URL to PDF"
						/>
						<DropdownLink
							href="/use-cases/directory-thumbnails"
							title="Thumbnails"
							desc="Website directory listings"
						/>
					</div>
				</div>
				<div>
					<SectionLabel>Monitor & Record</SectionLabel>
					<div className="space-y-0.5">
						<DropdownLink
							href="/use-cases/website-monitoring"
							title="Website Monitoring"
							desc="Track visual changes over time"
						/>
						<DropdownLink
							href="/use-cases/competitor-monitoring"
							title="Competitor Intel"
							desc="Detect competitor changes"
						/>
						<DropdownLink
							href="/use-cases/visual-regression-testing"
							title="Visual Testing"
							desc="Catch UI bugs in CI/CD"
						/>
						<DropdownLink
							href="/use-cases/archiving"
							title="Archiving"
							desc="Preserve web snapshots"
						/>
						<DropdownLink
							href="/use-cases/reporting"
							title="Reporting"
							desc="Automated dashboard screenshots"
						/>
					</div>
				</div>
			</div>
			<PanelFooter href="/use-cases">
				View all use cases &rarr;
			</PanelFooter>
		</div>
	)
}

function ComparePanel() {
	return (
		<div className="p-5">
			<div className="grid grid-cols-2 gap-x-8">
				<div>
					<SectionLabel>Head-to-Head</SectionLabel>
					<div className="space-y-0.5">
						<DropdownLink
							href="/compare/screenshotapi-vs-puppeteer"
							title="vs Puppeteer"
							desc="Managed API vs self-hosted"
						/>
						<DropdownLink
							href="/compare/screenshotapi-vs-playwright"
							title="vs Playwright"
							desc="API vs browser framework"
						/>
						<DropdownLink
							href="/compare/screenshotapi-vs-urlbox"
							title="vs Urlbox"
							desc="Feature and pricing comparison"
						/>
						<DropdownLink
							href="/compare/screenshotapi-vs-browserless"
							title="vs Browserless"
							desc="Screenshot API vs headless cloud"
						/>
						<DropdownLink
							href="/compare/screenshotapi-vs-scrapingbee"
							title="vs ScrapingBee"
							desc="Screenshots vs scraping"
						/>
					</div>
				</div>
				<div>
					<SectionLabel>Guides</SectionLabel>
					<div className="space-y-0.5">
						<DropdownLink
							href="/compare/best-screenshot-api"
							title="Best Screenshot API"
							desc="Top APIs compared for 2026"
						/>
						<DropdownLink
							href="/compare/free-screenshot-api"
							title="Free Screenshot APIs"
							desc="Best free options available"
						/>
					</div>
					<div className="mt-4">
						<SectionLabel>Alternatives</SectionLabel>
						<div className="space-y-0.5">
							<DropdownLink
								href="/compare/apiflash-alternatives"
								title="APIFlash Alternatives"
								desc="Better options to consider"
							/>
							<DropdownLink
								href="/compare/urlbox-alternatives"
								title="Urlbox Alternatives"
								desc="Top Urlbox replacements"
							/>
						</div>
					</div>
				</div>
			</div>
			<PanelFooter href="/compare">
				View all comparisons &rarr;
			</PanelFooter>
		</div>
	)
}

function IntegrationsPanel() {
	return (
		<div className="p-5">
			<div className="grid grid-cols-3 gap-x-6">
				<div>
					<SectionLabel>Frameworks</SectionLabel>
					<div className="space-y-0.5">
						<DropdownLink
							href="/integrations/nextjs"
							title="Next.js"
							desc="React framework"
						/>
						<DropdownLink
							href="/integrations/react"
							title="React"
							desc="UI library"
						/>
						<DropdownLink
							href="/integrations/django"
							title="Django"
							desc="Python framework"
						/>
						<DropdownLink
							href="/integrations/laravel"
							title="Laravel"
							desc="PHP framework"
						/>
						<DropdownLink
							href="/integrations/express"
							title="Express"
							desc="Node.js framework"
						/>
					</div>
				</div>
				<div>
					<SectionLabel>Platforms</SectionLabel>
					<div className="space-y-0.5">
						<DropdownLink
							href="/integrations/vercel"
							title="Vercel"
							desc="Edge deployment"
						/>
						<DropdownLink
							href="/integrations/aws-lambda"
							title="AWS Lambda"
							desc="Serverless functions"
						/>
						<DropdownLink
							href="/integrations/cloudflare-workers"
							title="Cloudflare Workers"
							desc="Edge compute"
						/>
						<DropdownLink
							href="/integrations/docker"
							title="Docker"
							desc="Container deployment"
						/>
					</div>
				</div>
				<div>
					<SectionLabel>Automation</SectionLabel>
					<div className="space-y-0.5">
						<DropdownLink
							href="/integrations/zapier"
							title="Zapier"
							desc="No-code workflows"
						/>
						<DropdownLink
							href="/integrations/n8n"
							title="n8n"
							desc="Open-source automation"
						/>
						<DropdownLink
							href="/integrations/make"
							title="Make"
							desc="Visual automations"
						/>
						<DropdownLink
							href="/integrations/retool"
							title="Retool"
							desc="Internal tools"
						/>
					</div>
				</div>
			</div>
			<PanelFooter href="/integrations">
				View all 30+ integrations &rarr;
			</PanelFooter>
		</div>
	)
}

const EASING = 'cubic-bezier(0.16, 1, 0.3, 1)'
const MORPH_MS = 280
const FADE_MS = 180
const CLOSE_GRACE_MS = 200

export function MarketingNav() {
	const [activeTab, setActiveTab] = useState<DropdownTab | null>(null)
	const [isVisible, setIsVisible] = useState(false)
	const [morphEnabled, setMorphEnabled] = useState(false)

	const stateRef = useRef({ visible: false, tab: null as DropdownTab | null })
	const timers = useRef({ leave: 0, cleanup: 0, reveal: 0 })

	const navRef = useRef<HTMLDivElement>(null)
	const triggerRefs = useRef<Record<string, HTMLElement | null>>({})
	const contentRefs = useRef<Record<string, HTMLDivElement | null>>({})

	const [panelStyle, setPanelStyle] = useState({
		x: 0,
		arrowX: 0,
		width: 0,
		height: 0
	})

	const clearAllTimers = useCallback(() => {
		clearTimeout(timers.current.leave)
		clearTimeout(timers.current.cleanup)
		clearTimeout(timers.current.reveal)
	}, [])

	const recalculate = useCallback((tab: DropdownTab) => {
		const nav = navRef.current
		const trigger = triggerRefs.current[tab]
		const content = contentRefs.current[tab]
		if (!nav || !trigger) return

		const navRect = nav.getBoundingClientRect()
		const triggerRect = trigger.getBoundingClientRect()

		const width = PANEL_WIDTHS[tab]
		const height = content?.offsetHeight ?? 200
		const triggerCenter =
			triggerRect.left - navRect.left + triggerRect.width / 2

		let x = triggerCenter - width / 2
		x = Math.max(-60, Math.min(x, navRect.width - width + 60))

		const arrowX = triggerCenter - x

		setPanelStyle({ x, arrowX, width, height })
	}, [])

	const closeNow = useCallback(() => {
		clearAllTimers()
		setIsVisible(false)
		setActiveTab(null)
		setMorphEnabled(false)
		stateRef.current = { visible: false, tab: null }
	}, [clearAllTimers])

	const openTab = useCallback(
		(tab: DropdownTab) => {
			clearAllTimers()

			setActiveTab(tab)
			stateRef.current.tab = tab

			if (stateRef.current.visible) {
				recalculate(tab)
				return
			}

			setMorphEnabled(false)
			recalculate(tab)

			// setTimeout is more reliable than double-rAF across browsers.
			// 34ms ≈ 2 frames at 60fps, enough for the browser to paint the
			// positioned-but-invisible panel before we fade it in.
			timers.current.reveal = window.setTimeout(() => {
				setMorphEnabled(true)
				setIsVisible(true)
				stateRef.current.visible = true
			}, 34)
		},
		[clearAllTimers, recalculate]
	)

	const startClose = useCallback(() => {
		clearAllTimers()
		timers.current.leave = window.setTimeout(() => {
			setIsVisible(false)
			stateRef.current.visible = false
			timers.current.cleanup = window.setTimeout(() => {
				setActiveTab(null)
				setMorphEnabled(false)
				stateRef.current.tab = null
			}, FADE_MS + 50)
		}, CLOSE_GRACE_MS)
	}, [clearAllTimers])

	const cancelClose = useCallback(() => {
		clearTimeout(timers.current.leave)
		clearTimeout(timers.current.cleanup)
	}, [])

	// Close dropdown when any link inside it is clicked (event delegation)
	const handlePanelClick = useCallback(
		(e: React.MouseEvent) => {
			if ((e.target as HTMLElement).closest('a')) {
				closeNow()
			}
		},
		[closeNow]
	)

	// Close on route change
	const pathname = usePathname()
	const prevPathname = useRef(pathname)
	useEffect(() => {
		if (prevPathname.current !== pathname) {
			prevPathname.current = pathname
			closeNow()
		}
	}, [pathname, closeNow])

	// Close on click outside nav area
	useEffect(() => {
		if (!stateRef.current.visible) return
		const handler = (e: MouseEvent) => {
			if (navRef.current && !navRef.current.contains(e.target as Node)) {
				closeNow()
			}
		}
		document.addEventListener('pointerdown', handler)
		return () => document.removeEventListener('pointerdown', handler)
	})

	// Close on Escape
	useEffect(() => {
		if (!stateRef.current.visible) return
		const handler = (e: KeyboardEvent) => {
			if (e.key === 'Escape') closeNow()
		}
		document.addEventListener('keydown', handler)
		return () => document.removeEventListener('keydown', handler)
	})

	useLayoutEffect(() => {
		if (activeTab) recalculate(activeTab)
	}, [activeTab, recalculate])

	useEffect(() => {
		return clearAllTimers
	}, [clearAllTimers])

	const morphTransition = morphEnabled
		? `transform ${MORPH_MS}ms ${EASING}, width ${MORPH_MS}ms ${EASING}, height ${MORPH_MS}ms ${EASING}, opacity ${FADE_MS}ms ease`
		: 'none'

	const arrowTransition = morphEnabled
		? `left ${MORPH_MS}ms ${EASING}`
		: 'none'

	return (
		<div
			ref={navRef}
			className="relative"
			onMouseEnter={cancelClose}
			onMouseLeave={startClose}
		>
			<div className="flex items-center gap-0.5">
				{DROPDOWN_TABS.map(tab => (
					<Link
						key={tab}
						href={TAB_HREFS[tab]}
						data-nav-trigger={tab}
						ref={(el: HTMLAnchorElement | null) => {
							triggerRefs.current[tab] = el
						}}
						onMouseEnter={() => openTab(tab)}
						onClick={closeNow}
						className={`inline-flex cursor-pointer items-center gap-1 rounded-md px-3 py-2 text-sm transition-colors ${
							activeTab === tab
								? 'text-foreground'
								: 'text-muted-foreground hover:text-foreground'
						}`}
					>
						{TAB_LABELS[tab]}
						<svg
							className={`h-3 w-3 transition-transform duration-200 ${activeTab === tab && isVisible ? 'rotate-180' : ''}`}
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={2.5}
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M19.5 8.25l-7.5 7.5-7.5-7.5"
							/>
						</svg>
					</Link>
				))}

				<Link
					href="/pricing"
					className="cursor-pointer rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
					onMouseEnter={startClose}
				>
					Pricing
				</Link>
				<Link
					href="/docs"
					className="cursor-pointer rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
					onMouseEnter={startClose}
				>
					Docs
				</Link>
			</div>

			{/* Invisible bridge between triggers and dropdown panel */}
			<div
				className="absolute left-0 right-0 top-full h-4"
				onMouseEnter={cancelClose}
			/>

			{/* Floating dropdown panel */}
			<div
				className="absolute left-0 right-0 top-[calc(100%+12px)]"
				style={{ pointerEvents: isVisible ? 'auto' : 'none' }}
				onMouseEnter={cancelClose}
				onMouseLeave={startClose}
				onClick={handlePanelClick}
				onKeyDown={e => {
					if (e.key === 'Escape') closeNow()
				}}
			>
				{/* Morphing container */}
				<div
					className="absolute rounded-xl border border-border bg-popover shadow-xl shadow-black/8"
					style={{
						transform: `translateX(${panelStyle.x}px)`,
						width: panelStyle.width || undefined,
						height: panelStyle.height || undefined,
						opacity: isVisible ? 1 : 0,
						transition: morphTransition
					}}
				>
					{/* Arrow */}
					<div
						className="absolute -top-[6px] z-10 h-3 w-3 rotate-45 rounded-sm border-l border-t border-border bg-popover"
						style={{
							left: panelStyle.arrowX - 6,
							transition: arrowTransition
						}}
					/>

					{/* Stacked content panels */}
					<div
						className="relative overflow-hidden rounded-xl"
						style={{
							width: panelStyle.width || undefined,
							height: panelStyle.height || undefined,
							transition: morphEnabled
								? `width ${MORPH_MS}ms ${EASING}, height ${MORPH_MS}ms ${EASING}`
								: 'none'
						}}
					>
						{DROPDOWN_TABS.map(tab => (
							<div
								key={tab}
								ref={el => {
									contentRefs.current[tab] = el
								}}
								className="absolute left-0 top-0"
								style={{
									width: PANEL_WIDTHS[tab],
									opacity: activeTab === tab ? 1 : 0,
									transition: `opacity ${FADE_MS}ms ease`,
									pointerEvents:
										activeTab === tab ? 'auto' : 'none'
								}}
							>
								{tab === 'use-cases' && <UseCasesPanel />}
								{tab === 'compare' && <ComparePanel />}
								{tab === 'integrations' && (
									<IntegrationsPanel />
								)}
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	)
}
