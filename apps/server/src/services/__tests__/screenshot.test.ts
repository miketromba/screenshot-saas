import { beforeEach, describe, expect, it, mock } from 'bun:test'

const mockScreenshot = mock(() => Promise.resolve(Buffer.from('fake-png')))
const mockEvaluate = mock(() => Promise.resolve())
const mockSetViewport = mock(() => Promise.resolve())
const mockGoto = mock(() => Promise.resolve())
const mockEmulateMediaFeatures = mock(() => Promise.resolve())
const mockWaitForSelector = mock(() => Promise.resolve())
const mockNewPage = mock(() =>
	Promise.resolve({
		setViewport: mockSetViewport,
		goto: mockGoto,
		emulateMediaFeatures: mockEmulateMediaFeatures,
		waitForSelector: mockWaitForSelector,
		evaluate: mockEvaluate,
		screenshot: mockScreenshot
	})
)
const mockClose = mock(() => Promise.resolve())
const mockLaunch = mock(() =>
	Promise.resolve({ newPage: mockNewPage, close: mockClose })
)

mock.module('puppeteer-core', () => ({
	default: { launch: mockLaunch }
}))

mock.module('@sparticuz/chromium', () => ({
	default: {
		args: ['--no-sandbox'],
		headless: true,
		executablePath: mock(() => Promise.resolve('/usr/bin/chromium'))
	}
}))

const { takeScreenshot } = await import('../screenshot')

describe('takeScreenshot', () => {
	beforeEach(() => {
		mockScreenshot.mockReset()
		mockSetViewport.mockReset()
		mockGoto.mockReset()
		mockEmulateMediaFeatures.mockReset()
		mockWaitForSelector.mockReset()
		mockEvaluate.mockReset()
		mockNewPage.mockReset()
		mockClose.mockReset()
		mockLaunch.mockReset()

		mockScreenshot.mockReturnValue(Promise.resolve(Buffer.from('fake-png')))
		mockEvaluate.mockReturnValue(Promise.resolve())
		mockSetViewport.mockReturnValue(Promise.resolve())
		mockGoto.mockReturnValue(Promise.resolve())
		mockEmulateMediaFeatures.mockReturnValue(Promise.resolve())
		mockWaitForSelector.mockReturnValue(Promise.resolve())
		mockNewPage.mockReturnValue(
			Promise.resolve({
				setViewport: mockSetViewport,
				goto: mockGoto,
				emulateMediaFeatures: mockEmulateMediaFeatures,
				waitForSelector: mockWaitForSelector,
				evaluate: mockEvaluate,
				screenshot: mockScreenshot
			})
		)
		mockClose.mockReturnValue(Promise.resolve())
		mockLaunch.mockReturnValue(
			Promise.resolve({ newPage: mockNewPage, close: mockClose })
		)

		process.env.VERCEL = '1'
	})

	it('returns buffer and content type', async () => {
		const result = await takeScreenshot({ url: 'https://example.com' })
		expect(result.buffer).toBeInstanceOf(Buffer)
		expect(result.contentType).toBe('image/png')
	})

	it('uses default viewport of 1440x900', async () => {
		await takeScreenshot({ url: 'https://example.com' })
		expect(mockSetViewport).toHaveBeenCalledWith({
			width: 1440,
			height: 900
		})
	})

	it('uses provided width and height options', async () => {
		await takeScreenshot({
			url: 'https://example.com',
			width: 800,
			height: 600
		})
		expect(mockSetViewport).toHaveBeenCalledWith({
			width: 800,
			height: 600
		})
	})

	it('sets content type based on format option', async () => {
		mockScreenshot.mockReturnValue(
			Promise.resolve(Buffer.from('fake-webp'))
		)
		const result = await takeScreenshot({
			url: 'https://example.com',
			type: 'webp'
		})
		expect(result.contentType).toBe('image/webp')
	})

	it('passes jpeg type to puppeteer screenshot', async () => {
		mockScreenshot.mockReturnValue(
			Promise.resolve(Buffer.from('fake-jpeg'))
		)
		await takeScreenshot({
			url: 'https://example.com',
			type: 'jpeg',
			quality: 80
		})
		expect(mockScreenshot).toHaveBeenCalledWith(
			expect.objectContaining({ type: 'jpeg', quality: 80 })
		)
	})

	it('does not pass quality for png', async () => {
		await takeScreenshot({ url: 'https://example.com', type: 'png' })
		expect(mockScreenshot).toHaveBeenCalledWith(
			expect.objectContaining({ type: 'png', quality: undefined })
		)
	})

	it('handles colorScheme option', async () => {
		await takeScreenshot({
			url: 'https://example.com',
			colorScheme: 'dark'
		})
		expect(mockEmulateMediaFeatures).toHaveBeenCalledWith([
			{ name: 'prefers-color-scheme', value: 'dark' }
		])
	})

	it('does not call emulateMediaFeatures when colorScheme is not set', async () => {
		await takeScreenshot({ url: 'https://example.com' })
		expect(mockEmulateMediaFeatures).not.toHaveBeenCalled()
	})

	it('handles waitForSelector option', async () => {
		await takeScreenshot({
			url: 'https://example.com',
			waitForSelector: '#content'
		})
		expect(mockWaitForSelector).toHaveBeenCalledWith('#content', {
			timeout: 30_000
		})
	})

	it('does not call waitForSelector when not set', async () => {
		await takeScreenshot({ url: 'https://example.com' })
		expect(mockWaitForSelector).not.toHaveBeenCalled()
	})

	it('handles delay option', async () => {
		const start = Date.now()
		await takeScreenshot({
			url: 'https://example.com',
			delay: 50
		})
		const elapsed = Date.now() - start
		expect(elapsed).toBeGreaterThanOrEqual(40)
	})

	it('does not delay when delay is 0', async () => {
		const start = Date.now()
		await takeScreenshot({
			url: 'https://example.com',
			delay: 0
		})
		const elapsed = Date.now() - start
		expect(elapsed).toBeLessThan(100)
	})

	it('passes fullPage option to screenshot', async () => {
		await takeScreenshot({
			url: 'https://example.com',
			fullPage: true
		})
		expect(mockScreenshot).toHaveBeenCalledWith(
			expect.objectContaining({ fullPage: true })
		)
	})

	it('navigates to the correct URL with waitUntil', async () => {
		await takeScreenshot({
			url: 'https://example.com',
			waitUntil: 'domcontentloaded'
		})
		expect(mockGoto).toHaveBeenCalledWith('https://example.com', {
			waitUntil: 'domcontentloaded',
			timeout: 30_000
		})
	})

	it('defaults waitUntil to networkidle2', async () => {
		await takeScreenshot({ url: 'https://example.com' })
		expect(mockGoto).toHaveBeenCalledWith('https://example.com', {
			waitUntil: 'networkidle2',
			timeout: 30_000
		})
	})

	it('closes browser on success', async () => {
		await takeScreenshot({ url: 'https://example.com' })
		expect(mockClose).toHaveBeenCalled()
	})

	it('closes browser on error', async () => {
		mockGoto.mockReturnValue(Promise.reject(new Error('Navigation failed')))
		try {
			await takeScreenshot({ url: 'https://example.com' })
		} catch {
			// expected
		}
		expect(mockClose).toHaveBeenCalled()
	})

	it('waits for fonts to be ready via page.evaluate', async () => {
		await takeScreenshot({ url: 'https://example.com' })
		expect(mockEvaluate).toHaveBeenCalled()
	})
})
