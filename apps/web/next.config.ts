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
	serverExternalPackages: [
		'puppeteer-core',
		'@sparticuz/chromium',
		'puppeteer-extra',
		'puppeteer-extra-plugin-stealth',
		'puppeteer-extra-plugin-adblocker'
	],
	// puppeteer-extra + plugins are externalized above, but their transitive
	// CJS deps (kind-of, is-plain-object, etc.) aren't auto-traced. Include
	// the entire dependency subtree so the serverless bundle has them.
	outputFileTracingIncludes: {
		'/api/*': [
			'../../node_modules/puppeteer-extra/**/*',
			'../../node_modules/puppeteer-extra-plugin-stealth/**/*',
			'../../node_modules/puppeteer-extra-plugin-adblocker/**/*',
			'../../node_modules/puppeteer-extra-plugin/**/*',
			'../../node_modules/puppeteer-extra-plugin-user-data-dir/**/*',
			'../../node_modules/puppeteer-extra-plugin-user-preferences/**/*',
			'../../node_modules/deepmerge/**/*',
			'../../node_modules/merge-deep/**/*',
			'../../node_modules/clone-deep/**/*',
			'../../node_modules/shallow-clone/**/*',
			'../../node_modules/kind-of/**/*',
			'../../node_modules/is-plain-object/**/*',
			'../../node_modules/isobject/**/*',
			'../../node_modules/is-extendable/**/*',
			'../../node_modules/for-in/**/*',
			'../../node_modules/for-own/**/*',
			'../../node_modules/arr-union/**/*',
			'../../node_modules/mixin-object/**/*',
			'../../node_modules/lazy-cache/**/*',
			'../../node_modules/@cliqz/adblocker/**/*',
			'../../node_modules/@cliqz/adblocker-puppeteer/**/*',
			'../../node_modules/@cliqz/adblocker-content/**/*',
			'../../node_modules/@cliqz/adblocker-extended-selectors/**/*',
			'../../node_modules/@remusao/guess-url-type/**/*',
			'../../node_modules/@remusao/small/**/*',
			'../../node_modules/@remusao/smaz/**/*',
			'../../node_modules/@remusao/smaz-compress/**/*',
			'../../node_modules/@remusao/smaz-decompress/**/*',
			'../../node_modules/@remusao/trie/**/*',
			'../../node_modules/tldts-core/**/*',
			'../../node_modules/tldts-experimental/**/*',
			'../../node_modules/node-fetch/**/*',
			'../../node_modules/tr46/**/*',
			'../../node_modules/webidl-conversions/**/*',
			'../../node_modules/whatwg-url/**/*'
		]
	},
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
