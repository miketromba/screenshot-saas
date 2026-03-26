import Link from 'next/link'

export function LogoIcon({ className }: { className?: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<circle cx="12" cy="12" r="2" />
			<circle cx="12" cy="12" r="5" strokeWidth={1} />
			<path d="M3 7V5a2 2 0 0 1 2-2h2" />
			<path d="M17 3h2a2 2 0 0 1 2 2v2" />
			<path d="M21 17v2a2 2 0 0 1-2 2h-2" />
			<path d="M7 21H5a2 2 0 0 1-2-2v-2" />
		</svg>
	)
}

export function LogoMark({ size = 'md' }: { size?: 'sm' | 'md' }) {
	const sizeClasses = size === 'sm' ? 'h-7 w-7' : 'h-9 w-9'
	const iconClasses = size === 'sm' ? 'h-3.5 w-3.5' : 'h-[18px] w-[18px]'

	return (
		<div
			className={`flex items-center justify-center rounded-full bg-gradient-to-br from-gray-800 to-gray-950 text-white ${sizeClasses}`}
		>
			<LogoIcon className={iconClasses} />
		</div>
	)
}

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' }) {
	const textClasses =
		size === 'sm' ? 'text-sm font-medium' : 'text-lg font-medium'

	return (
		<Link href="/" className="flex cursor-pointer items-center gap-2">
			<LogoMark size={size} />
			<span className={`${textClasses} tracking-normal`}>
				ScreenshotAPI
			</span>
		</Link>
	)
}
