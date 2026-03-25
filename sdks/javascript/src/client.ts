import {
	AuthenticationError,
	InsufficientCreditsError,
	InvalidAPIKeyError,
	ScreenshotAPIError,
	ScreenshotFailedError
} from './errors'
import type {
	ScreenshotAPIConfig,
	ScreenshotMetadata,
	ScreenshotOptions,
	ScreenshotResult
} from './types'

const DEFAULT_BASE_URL = 'https://screenshotapi.dev'
const DEFAULT_TIMEOUT = 60_000

export class ScreenshotAPI {
	private readonly apiKey: string
	private readonly baseUrl: string
	private readonly timeout: number

	constructor(config: ScreenshotAPIConfig) {
		if (!config.apiKey) {
			throw new Error('API key is required')
		}
		this.apiKey = config.apiKey
		this.baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, '')
		this.timeout = config.timeout ?? DEFAULT_TIMEOUT
	}

	async screenshot(options: ScreenshotOptions): Promise<ScreenshotResult> {
		if (!options.url) {
			throw new Error('URL is required')
		}

		const params = new URLSearchParams({ url: options.url })
		if (options.width !== undefined)
			params.set('width', String(options.width))
		if (options.height !== undefined)
			params.set('height', String(options.height))
		if (options.fullPage !== undefined)
			params.set('fullPage', String(options.fullPage))
		if (options.type !== undefined) params.set('type', options.type)
		if (options.quality !== undefined)
			params.set('quality', String(options.quality))
		if (options.colorScheme !== undefined)
			params.set('colorScheme', options.colorScheme)
		if (options.waitUntil !== undefined)
			params.set('waitUntil', options.waitUntil)
		if (options.waitForSelector !== undefined)
			params.set('waitForSelector', options.waitForSelector)
		if (options.delay !== undefined)
			params.set('delay', String(options.delay))

		const url = `${this.baseUrl}/api/v1/screenshot?${params.toString()}`

		const controller = new AbortController()
		const timer = setTimeout(() => controller.abort(), this.timeout)

		try {
			const response = await fetch(url, {
				method: 'GET',
				headers: { 'x-api-key': this.apiKey },
				signal: controller.signal
			})

			if (!response.ok) {
				await this.handleError(response)
			}

			const image = await response.arrayBuffer()
			const metadata: ScreenshotMetadata = {
				creditsRemaining: Number(
					response.headers.get('x-credits-remaining') ?? 0
				),
				screenshotId: response.headers.get('x-screenshot-id') ?? '',
				durationMs: Number(response.headers.get('x-duration-ms') ?? 0)
			}

			return {
				image,
				metadata,
				contentType: response.headers.get('content-type') ?? 'image/png'
			}
		} finally {
			clearTimeout(timer)
		}
	}

	async save(
		options: ScreenshotOptions & { path: string }
	): Promise<ScreenshotMetadata> {
		const { path, ...screenshotOptions } = options
		const result = await this.screenshot(screenshotOptions)

		if (typeof globalThis.process !== 'undefined') {
			const { writeFile } = await import('node:fs/promises')
			await writeFile(path, Buffer.from(result.image))
		} else {
			throw new Error('save() is only available in Node.js environments')
		}

		return result.metadata
	}

	private async handleError(response: Response): Promise<never> {
		let body: Record<string, unknown>
		try {
			body = (await response.json()) as Record<string, unknown>
		} catch {
			throw new ScreenshotAPIError(
				`HTTP ${response.status}: ${response.statusText}`,
				response.status,
				'unknown_error'
			)
		}

		const message = String(body.error ?? body.message ?? 'Unknown error')

		switch (response.status) {
			case 401:
				throw new AuthenticationError(message)
			case 402:
				throw new InsufficientCreditsError(
					message,
					Number(body.balance ?? 0)
				)
			case 403:
				throw new InvalidAPIKeyError(message)
			case 500:
				throw new ScreenshotFailedError(
					String(body.message ?? body.error ?? 'Screenshot failed')
				)
			default:
				throw new ScreenshotAPIError(
					message,
					response.status,
					'unknown_error'
				)
		}
	}
}
