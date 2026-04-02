import path from 'node:path'
import { createMDX } from 'fumadocs-mdx/next'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
	// Monorepo: trace from workspace root so hoisted packages ship with the
	// serverless bundle (next build cwd is apps/web).
	outputFileTracingRoot: path.join(process.cwd(), '../..'),
	// Turbopack leaves bare `require("is-plain-object")` inside puppeteer-extra;
	// Next traces `next/dist/.../is-plain-object.js` instead of the npm package.
	// Picomatch key `/api/*` matches `/api/[[...slugs]]` (single dynamic segment).
	outputFileTracingIncludes: {
		'/api/*': [
			'../../node_modules/.bun/is-plain-object@2.0.4/node_modules/is-plain-object/**/*'
		]
	},
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
