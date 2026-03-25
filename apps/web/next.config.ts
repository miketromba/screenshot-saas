import { createMDX } from 'fumadocs-mdx/next'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	transpilePackages: [
		'@screenshot-saas/server',
		'@screenshot-saas/db',
		'@screenshot-saas/config'
	],
	serverExternalPackages: ['puppeteer-core', '@sparticuz/chromium']
}

const withMDX = createMDX()

export default withMDX(nextConfig)
