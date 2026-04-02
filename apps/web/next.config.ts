import { createMDX } from 'fumadocs-mdx/next'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	transpilePackages: [
		'@screenshot-saas/server',
		'@screenshot-saas/db',
		'@screenshot-saas/config'
	],
	// Keep only native/heavy deps external. puppeteer-extra + plugins must be
	// bundled: Vercel's Bun copyfile layout leaves broken paths under
	// node_modules/.bun/... for transitive requires (e.g. kind-of) when external.
	serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium'],
	async rewrites() {
		return [
			{
				source: '/docs/:path*.md',
				destination: '/llms.md/docs/:path*'
			}
		]
	}
}

const withMDX = createMDX()

export default withMDX(nextConfig)
