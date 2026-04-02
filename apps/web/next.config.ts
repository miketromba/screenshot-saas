import { createMDX } from 'fumadocs-mdx/next'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	transpilePackages: [
		'@screenshot-saas/server',
		'@screenshot-saas/db',
		'@screenshot-saas/config'
	],
	serverExternalPackages: [
		'puppeteer-core',
		'@sparticuz/chromium',
		'puppeteer-extra',
		'puppeteer-extra-plugin-stealth',
		'puppeteer-extra-plugin-adblocker'
	],
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
