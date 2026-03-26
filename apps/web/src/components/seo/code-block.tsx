export function CodeBlock({
	language,
	title,
	code
}: {
	language: string
	title?: string
	code: string
}) {
	return (
		<div className="overflow-hidden rounded-xl border border-border bg-[oklch(0.17_0_0)]">
			<div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
				<div className="h-2.5 w-2.5 rounded-full bg-white/20" />
				<div className="h-2.5 w-2.5 rounded-full bg-white/20" />
				<div className="h-2.5 w-2.5 rounded-full bg-white/20" />
				<span className="ml-2 text-xs text-white/40">
					{title ?? language}
				</span>
			</div>
			<pre className="overflow-x-auto p-4 text-sm leading-relaxed">
				<code className="text-gray-300">{code}</code>
			</pre>
		</div>
	)
}
