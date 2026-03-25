export interface ScreenshotAPIConfig {
	apiKey: string
	baseUrl?: string
	timeout?: number
}

export interface ScreenshotOptions {
	url: string
	width?: number
	height?: number
	fullPage?: boolean
	type?: 'png' | 'jpeg' | 'webp'
	quality?: number
	colorScheme?: 'light' | 'dark'
	waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2'
	waitForSelector?: string
	delay?: number
}

export interface ScreenshotMetadata {
	creditsRemaining: number
	screenshotId: string
	durationMs: number
}

export interface ScreenshotResult {
	image: ArrayBuffer
	metadata: ScreenshotMetadata
	contentType: string
}
