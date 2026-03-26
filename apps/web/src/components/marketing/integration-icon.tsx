import { FunctionSquare } from 'lucide-react'
import type { SimpleIcon } from 'simple-icons'
import {
	siAngular,
	siAstro,
	siBitbucket,
	siCloudflareworkers,
	siDeno,
	siDjango,
	siDocker,
	siDotnet,
	siExpress,
	siFastapi,
	siFlask,
	siGin,
	siGithubactions,
	siGitlab,
	siGooglecloud,
	siLaravel,
	siMake,
	siN8n,
	siNetlify,
	siNextdotjs,
	siReact,
	siRemix,
	siRetool,
	siRubyonrails,
	siRubysinatra,
	siSpringboot,
	siSupabase,
	siSvelte,
	siVercel,
	siVuedotjs,
	siWordpress,
	siZapier
} from 'simple-icons'

const GENERIC_FUNCTION_HEX: Record<string, string> = {
	'aws-lambda': 'FF9900',
	'azure-functions': '0078D4'
}

const HEX_OVERRIDES: Record<string, string> = {
	retool: '8F8F8F'
}

const ICONS: Record<string, SimpleIcon> = {
	nextjs: siNextdotjs,
	react: siReact,
	vue: siVuedotjs,
	angular: siAngular,
	svelte: siSvelte,
	remix: siRemix,
	astro: siAstro,
	django: siDjango,
	flask: siFlask,
	rails: siRubyonrails,
	laravel: siLaravel,
	express: siExpress,
	fastapi: siFastapi,
	'spring-boot': siSpringboot,
	dotnet: siDotnet,
	gin: siGin,
	sinatra: siRubysinatra,
	deno: siDeno,
	wordpress: siWordpress,
	vercel: siVercel,
	'cloudflare-workers': siCloudflareworkers,
	'google-cloud-functions': siGooglecloud,
	netlify: siNetlify,
	'supabase-edge-functions': siSupabase,
	docker: siDocker,
	zapier: siZapier,
	n8n: siN8n,
	make: siMake,
	retool: siRetool,
	'github-actions': siGithubactions,
	'gitlab-ci': siGitlab,
	'bitbucket-pipelines': siBitbucket
}

function hexIsDark(hex: string): boolean {
	const r = Number.parseInt(hex.slice(0, 2), 16)
	const g = Number.parseInt(hex.slice(2, 4), 16)
	const b = Number.parseInt(hex.slice(4, 6), 16)
	return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.15
}

function resolveColor(slug: string): { hex: string; dark: boolean } | null {
	const genericHex = GENERIC_FUNCTION_HEX[slug]
	if (genericHex) return { hex: genericHex, dark: false }
	const icon = ICONS[slug]
	if (!icon) return null
	const hex = HEX_OVERRIDES[slug] ?? icon.hex
	return { hex, dark: hexIsDark(hex) }
}

export function IntegrationIcon({
	slug,
	size = 'sm'
}: {
	slug: string
	size?: 'sm' | 'lg'
}) {
	const genericHex = GENERIC_FUNCTION_HEX[slug]
	const icon = ICONS[slug]
	const color = resolveColor(slug)

	if (!color && !genericHex && !icon) return null

	const tile = size === 'lg' ? 'h-14 w-14' : 'h-10 w-10'
	const glyph = size === 'lg' ? 'h-7 w-7' : 'h-5 w-5'

	if (genericHex) {
		return (
			<div
				className={`flex ${tile} shrink-0 items-center justify-center rounded-lg bg-muted/60`}
			>
				<FunctionSquare
					className={glyph}
					style={{ color: `#${genericHex}` }}
					strokeWidth={1.5}
					aria-hidden
				/>
			</div>
		)
	}

	if (!icon || !color) return null

	return (
		<div
			className={`flex ${tile} shrink-0 items-center justify-center rounded-lg bg-muted/60`}
		>
			<svg
				viewBox="0 0 24 24"
				fill="currentColor"
				className={color.dark ? `${glyph} text-foreground` : glyph}
				style={color.dark ? undefined : { color: `#${color.hex}` }}
			>
				<path d={icon.path} />
			</svg>
		</div>
	)
}
