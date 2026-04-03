import path from 'node:path'
import { createMDX } from 'fumadocs-mdx/next'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	// Monorepo: trace from workspace root so hoisted packages ship with the
	// serverless bundle (next build cwd is apps/web).
	outputFileTracingRoot: path.join(process.cwd(), '../..'),
	transpilePackages: [
		'@screenshot-saas/server',
		'@screenshot-saas/db',
		'@screenshot-saas/config'
	],
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
