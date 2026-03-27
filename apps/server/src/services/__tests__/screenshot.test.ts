import { beforeEach, describe, expect, it, mock } from 'bun:test'

const mockScreenshot = mock(() => Promise.resolve(Buffer.from('fake-png')))
const mockEvaluate = mock(() => Promise.resolve())
const mockSetViewport = mock(() => Promise.resolve())
const mockGoto = mock(() => Promise.resolve())
const mockEmulateMediaFeatures = mock(() => Promise.resolve())
const mockWaitForSelector = mock(() => Promise.resolve())
const mockPdf = mock(() => Promise.resolve(Buffer.from('fake-pdf')))
const mockSetRequestInterception = mock(() => Promise.resolve())
const mockOn = mock(() => {})
const mockEvaluateOnNewDocument = mock(() => Promise.resolve())
const mockSetUserAgent = mock(() => Promise.resolve())
const mockSetExtraHTTPHeaders = mock(() => Promise.resolve())
const mockEmulateTimezone = mock(() => Promise.resolve())
const mockAddStyleTag = mock(() => Promise.resolve())
const mockSetContent = mock(() => Promise.resolve())
const mockSetGeolocation = mock(() => Promise.resolve())
const mockPageClose = mock(() => Promise.resolve())
const mockDollar = mock(() => Promise.resolve(null))
const mockOverridePermissions = mock(() => Promise.resolve())
const mockDefaultBrowserContext = mock(() => ({
	overridePermissions: mockOverridePermissions
}))
const mockNewPage = mock(() =>
	Promise.resolve({
		setViewport: mockSetViewport,
		goto: mockGoto,
		emulateMediaFeatures: mockEmulateMediaFeatures,
		waitForSelector: mockWaitForSelector,
		evaluate: mockEvaluate,
		screenshot: mockScreenshot,
		pdf: mockPdf,
		setRequestInterception: mockSetRequestInterception,
		on: mockOn,
		evaluateOnNewDocument: mockEvaluateOnNewDocument,
		setUserAgent: mockSetUserAgent,
		setExtraHTTPHeaders: mockSetExtraHTTPHeaders,
		emulateTimezone: mockEmulateTimezone,
		addStyleTag: mockAddStyleTag,
		setContent: mockSetContent,
		setGeolocation: mockSetGeolocation,
		close: mockPageClose,
		$: mockDollar
	})
)
const mockClose = mock(() => Promise.resolve())
const mockLaunch = mock(() =>
	Promise.resolve({
		newPage: mockNewPage,
		close: mockClose,
		defaultBrowserContext: mockDefaultBrowserContext
	})
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
		mockPdf.mockReset()
		mockSetRequestInterception.mockReset()
		mockOn.mockReset()
		mockEvaluateOnNewDocument.mockReset()
		mockSetUserAgent.mockReset()
		mockSetExtraHTTPHeaders.mockReset()
		mockEmulateTimezone.mockReset()
		mockAddStyleTag.mockReset()
		mockSetContent.mockReset()
		mockSetGeolocation.mockReset()
		mockPageClose.mockReset()
		mockDollar.mockReset()
		mockOverridePermissions.mockReset()
		mockDefaultBrowserContext.mockReset()

		mockScreenshot.mockReturnValue(Promise.resolve(Buffer.from('fake-png')))
		mockEvaluate.mockReturnValue(Promise.resolve())
		mockSetViewport.mockReturnValue(Promise.resolve())
		mockGoto.mockReturnValue(Promise.resolve())
		mockEmulateMediaFeatures.mockReturnValue(Promise.resolve())
		mockWaitForSelector.mockReturnValue(Promise.resolve())
		mockPdf.mockReturnValue(Promise.resolve(Buffer.from('fake-pdf')))
		mockSetRequestInterception.mockReturnValue(Promise.resolve())
		mockEvaluateOnNewDocument.mockReturnValue(Promise.resolve())
		mockSetUserAgent.mockReturnValue(Promise.resolve())
		mockSetExtraHTTPHeaders.mockReturnValue(Promise.resolve())
		mockEmulateTimezone.mockReturnValue(Promise.resolve())
		mockAddStyleTag.mockReturnValue(Promise.resolve())
		mockSetContent.mockReturnValue(Promise.resolve())
		mockSetGeolocation.mockReturnValue(Promise.resolve())
		mockPageClose.mockReturnValue(Promise.resolve())
		mockDollar.mockReturnValue(Promise.resolve(null))
		mockOverridePermissions.mockReturnValue(Promise.resolve())
		mockDefaultBrowserContext.mockReturnValue({
			overridePermissions: mockOverridePermissions
		})
		mockNewPage.mockReturnValue(
			Promise.resolve({
				setViewport: mockSetViewport,
				goto: mockGoto,
				emulateMediaFeatures: mockEmulateMediaFeatures,
				waitForSelector: mockWaitForSelector,
				evaluate: mockEvaluate,
				screenshot: mockScreenshot,
				pdf: mockPdf,
				setRequestInterception: mockSetRequestInterception,
				on: mockOn,
				evaluateOnNewDocument: mockEvaluateOnNewDocument,
				setUserAgent: mockSetUserAgent,
				setExtraHTTPHeaders: mockSetExtraHTTPHeaders,
				emulateTimezone: mockEmulateTimezone,
				addStyleTag: mockAddStyleTag,
				setContent: mockSetContent,
				setGeolocation: mockSetGeolocation,
				close: mockPageClose,
				$: mockDollar
			})
		)
		mockClose.mockReturnValue(Promise.resolve())
		mockLaunch.mockReturnValue(
			Promise.resolve({
				newPage: mockNewPage,
				close: mockClose,
				defaultBrowserContext: mockDefaultBrowserContext
			})
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
			height: 900,
			deviceScaleFactor: 1
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
			height: 600,
			deviceScaleFactor: 1
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

	describe('ad blocking', () => {
		it('calls page.setRequestInterception(true) when blockAds is true', async () => {
			await takeScreenshot({ url: 'https://example.com', blockAds: true })
			expect(mockSetRequestInterception).toHaveBeenCalledWith(true)
		})

		it('registers a request event listener when blockAds is true', async () => {
			await takeScreenshot({ url: 'https://example.com', blockAds: true })
			expect(mockOn).toHaveBeenCalledWith('request', expect.any(Function))
		})

		it('does NOT call setRequestInterception when blockAds is false', async () => {
			await takeScreenshot({
				url: 'https://example.com',
				blockAds: false
			})
			expect(mockSetRequestInterception).not.toHaveBeenCalled()
		})

		it('does NOT call setRequestInterception when blockAds is undefined', async () => {
			await takeScreenshot({ url: 'https://example.com' })
			expect(mockSetRequestInterception).not.toHaveBeenCalled()
		})
	})

	describe('cookie banner removal', () => {
		it('calls page.addStyleTag with cookie-hiding CSS when removeCookieBanners is true', async () => {
			await takeScreenshot({
				url: 'https://example.com',
				removeCookieBanners: true
			})
			expect(mockAddStyleTag).toHaveBeenCalledWith(
				expect.objectContaining({
					content: expect.stringContaining('cookie')
				})
			)
		})

		it('calls page.evaluate to click accept buttons when removeCookieBanners is true', async () => {
			await takeScreenshot({
				url: 'https://example.com',
				removeCookieBanners: true
			})
			const evaluateCalls = mockEvaluate.mock.calls
			const hasAcceptCall = evaluateCalls.some(
				(call: unknown[]) =>
					Array.isArray(call[1]) &&
					call[1].some(
						(s: string) =>
							typeof s === 'string' && s.includes('cookie')
					)
			)
			expect(hasAcceptCall).toBe(true)
		})

		it('does NOT add cookie styles when removeCookieBanners is false', async () => {
			await takeScreenshot({
				url: 'https://example.com',
				removeCookieBanners: false
			})
			expect(mockAddStyleTag).not.toHaveBeenCalled()
		})
	})

	describe('PDF export', () => {
		it('calls page.pdf with format A4 and printBackground true', async () => {
			await takeScreenshot({ url: 'https://example.com', type: 'pdf' })
			expect(mockPdf).toHaveBeenCalledWith({
				format: 'A4',
				printBackground: true
			})
		})

		it('returns contentType application/pdf', async () => {
			const result = await takeScreenshot({
				url: 'https://example.com',
				type: 'pdf'
			})
			expect(result.contentType).toBe('application/pdf')
		})

		it('does NOT call page.screenshot', async () => {
			await takeScreenshot({ url: 'https://example.com', type: 'pdf' })
			expect(mockScreenshot).not.toHaveBeenCalled()
		})
	})

	describe('HTML rendering', () => {
		it('calls page.setContent instead of page.goto when html is provided', async () => {
			await takeScreenshot({
				url: 'https://example.com',
				html: '<h1>Hello</h1>'
			})
			expect(mockSetContent).toHaveBeenCalled()
			expect(mockGoto).not.toHaveBeenCalled()
		})

		it('passes the HTML string to setContent', async () => {
			const html = '<div>Test Content</div>'
			await takeScreenshot({ url: 'https://example.com', html })
			expect(mockSetContent).toHaveBeenCalledWith(html, {
				waitUntil: 'networkidle2',
				timeout: 30_000
			})
		})

		it('calls page.goto with the URL when html is not provided', async () => {
			await takeScreenshot({ url: 'https://example.com' })
			expect(mockGoto).toHaveBeenCalledWith(
				'https://example.com',
				expect.any(Object)
			)
			expect(mockSetContent).not.toHaveBeenCalled()
		})
	})

	describe('CSS injection', () => {
		it('calls page.addStyleTag with the CSS content when cssInject is provided', async () => {
			await takeScreenshot({
				url: 'https://example.com',
				cssInject: 'body { background: red; }'
			})
			expect(mockAddStyleTag).toHaveBeenCalledWith({
				content: 'body { background: red; }'
			})
		})

		it('does NOT call addStyleTag when cssInject is not provided and no cookie banners', async () => {
			await takeScreenshot({ url: 'https://example.com' })
			expect(mockAddStyleTag).not.toHaveBeenCalled()
		})
	})

	describe('JS injection', () => {
		it('calls page.evaluate with the JS string when jsInject is provided', async () => {
			await takeScreenshot({
				url: 'https://example.com',
				jsInject: 'document.title = "injected"'
			})
			const evaluateCalls = mockEvaluate.mock.calls
			const hasJsCall = evaluateCalls.some(
				(call: unknown[]) => call[0] === 'document.title = "injected"'
			)
			expect(hasJsCall).toBe(true)
		})

		it('does not throw when JS injection errors', async () => {
			mockEvaluate.mockImplementation((arg: unknown) => {
				if (typeof arg === 'string') {
					return Promise.reject(new Error('JS error'))
				}
				return Promise.resolve()
			})
			const result = await takeScreenshot({
				url: 'https://example.com',
				jsInject: 'throw new Error("boom")'
			})
			expect(result.buffer).toBeInstanceOf(Buffer)
		})
	})

	describe('stealth mode', () => {
		it('calls page.evaluateOnNewDocument when stealthMode is true', async () => {
			await takeScreenshot({
				url: 'https://example.com',
				stealthMode: true
			})
			expect(mockEvaluateOnNewDocument).toHaveBeenCalled()
		})

		it('calls page.setUserAgent when stealthMode is true', async () => {
			await takeScreenshot({
				url: 'https://example.com',
				stealthMode: true
			})
			expect(mockSetUserAgent).toHaveBeenCalledWith(expect.any(String))
		})

		it('does NOT call evaluateOnNewDocument or setUserAgent when stealthMode is false', async () => {
			await takeScreenshot({
				url: 'https://example.com',
				stealthMode: false
			})
			expect(mockEvaluateOnNewDocument).not.toHaveBeenCalled()
			expect(mockSetUserAgent).not.toHaveBeenCalled()
		})
	})

	describe('device pixel ratio', () => {
		it('sets viewport with deviceScaleFactor 2 when devicePixelRatio is 2', async () => {
			await takeScreenshot({
				url: 'https://example.com',
				devicePixelRatio: 2
			})
			expect(mockSetViewport).toHaveBeenCalledWith(
				expect.objectContaining({ deviceScaleFactor: 2 })
			)
		})

		it('defaults deviceScaleFactor to 1', async () => {
			await takeScreenshot({ url: 'https://example.com' })
			expect(mockSetViewport).toHaveBeenCalledWith(
				expect.objectContaining({ deviceScaleFactor: 1 })
			)
		})
	})

	describe('timezone emulation', () => {
		it('calls page.emulateTimezone with the value when timezone is provided', async () => {
			await takeScreenshot({
				url: 'https://example.com',
				timezone: 'America/New_York'
			})
			expect(mockEmulateTimezone).toHaveBeenCalledWith('America/New_York')
		})

		it('does NOT call emulateTimezone when not provided', async () => {
			await takeScreenshot({ url: 'https://example.com' })
			expect(mockEmulateTimezone).not.toHaveBeenCalled()
		})
	})

	describe('locale emulation', () => {
		it('calls page.setExtraHTTPHeaders with Accept-Language when locale is provided', async () => {
			await takeScreenshot({
				url: 'https://example.com',
				locale: 'fr-FR'
			})
			expect(mockSetExtraHTTPHeaders).toHaveBeenCalledWith({
				'Accept-Language': 'fr-FR'
			})
		})

		it('does NOT call setExtraHTTPHeaders when locale is not provided', async () => {
			await takeScreenshot({ url: 'https://example.com' })
			expect(mockSetExtraHTTPHeaders).not.toHaveBeenCalled()
		})
	})

	describe('Google Fonts preloading', () => {
		it('calls page.evaluate with font loading logic when preloadFonts is true', async () => {
			await takeScreenshot({
				url: 'https://example.com',
				preloadFonts: true
			})
			const evaluateCalls = mockEvaluate.mock.calls
			expect(evaluateCalls.length).toBeGreaterThanOrEqual(2)
		})

		it('still calls document.fonts.ready even when preloadFonts is false', async () => {
			await takeScreenshot({ url: 'https://example.com' })
			expect(mockEvaluate).toHaveBeenCalled()
		})
	})

	describe('element removal', () => {
		it('calls page.evaluate with selectors when removeElements is provided', async () => {
			await takeScreenshot({
				url: 'https://example.com',
				removeElements: ['.popup', '#banner']
			})
			const evaluateCalls = mockEvaluate.mock.calls
			const hasRemoveCall = evaluateCalls.some(
				(call: unknown[]) =>
					Array.isArray(call[1]) &&
					call[1].includes('.popup') &&
					call[1].includes('#banner')
			)
			expect(hasRemoveCall).toBe(true)
		})

		it('does NOT add element removal when removeElements is empty', async () => {
			await takeScreenshot({
				url: 'https://example.com',
				removeElements: []
			})
			const evaluateCalls = mockEvaluate.mock.calls
			const hasRemoveCall = evaluateCalls.some(
				(call: unknown[]) =>
					Array.isArray(call[1]) && call[1].includes('.popup')
			)
			expect(hasRemoveCall).toBe(false)
		})

		it('does NOT add element removal when removeElements is not provided', async () => {
			await takeScreenshot({ url: 'https://example.com' })
			const evaluateCalls = mockEvaluate.mock.calls
			const hasRemoveCall = evaluateCalls.some(
				(call: unknown[]) =>
					Array.isArray(call[1]) && call[1].includes('.popup')
			)
			expect(hasRemoveCall).toBe(false)
		})
	})

	describe('popup removal', () => {
		it('calls page.addStyleTag with popup CSS when removePopups is true', async () => {
			await takeScreenshot({
				url: 'https://example.com',
				removePopups: true
			})
			expect(mockAddStyleTag).toHaveBeenCalledWith(
				expect.objectContaining({
					content: expect.stringContaining('modal')
				})
			)
		})

		it('calls page.evaluate with popup selectors when removePopups is true', async () => {
			await takeScreenshot({
				url: 'https://example.com',
				removePopups: true
			})
			const evaluateCalls = mockEvaluate.mock.calls
			const hasPopupCall = evaluateCalls.some(
				(call: unknown[]) =>
					Array.isArray(call[1]) &&
					call[1].some(
						(s: string) =>
							typeof s === 'string' && s.includes('modal')
					)
			)
			expect(hasPopupCall).toBe(true)
		})

		it('does NOT add popup removal when removePopups is false', async () => {
			await takeScreenshot({
				url: 'https://example.com',
				removePopups: false
			})
			const addStyleCalls = mockAddStyleTag.mock.calls
			const hasPopupCss = addStyleCalls.some(
				(call: unknown[]) =>
					typeof (call[0] as { content?: string })?.content ===
						'string' &&
					(call[0] as { content: string }).content.includes('modal')
			)
			expect(hasPopupCss).toBe(false)
		})
	})

	describe('geolocation', () => {
		it('calls page.setGeolocation when geoLocation is provided', async () => {
			await takeScreenshot({
				url: 'https://example.com',
				geoLocation: { latitude: 40.7128, longitude: -74.006 }
			})
			expect(mockSetGeolocation).toHaveBeenCalledWith({
				latitude: 40.7128,
				longitude: -74.006,
				accuracy: 100
			})
		})

		it('overrides permissions when geoLocation is provided', async () => {
			await takeScreenshot({
				url: 'https://example.com',
				geoLocation: { latitude: 51.5074, longitude: -0.1278 }
			})
			expect(mockOverridePermissions).toHaveBeenCalledWith(
				'https://example.com',
				['geolocation']
			)
		})

		it('uses custom accuracy when provided', async () => {
			await takeScreenshot({
				url: 'https://example.com',
				geoLocation: {
					latitude: 35.6762,
					longitude: 139.6503,
					accuracy: 50
				}
			})
			expect(mockSetGeolocation).toHaveBeenCalledWith({
				latitude: 35.6762,
				longitude: 139.6503,
				accuracy: 50
			})
		})

		it('does NOT call setGeolocation when geoLocation is not provided', async () => {
			await takeScreenshot({ url: 'https://example.com' })
			expect(mockSetGeolocation).not.toHaveBeenCalled()
		})
	})

	describe('device mockup frames', () => {
		it('creates a second page for browser mockup rendering', async () => {
			await takeScreenshot({
				url: 'https://example.com',
				mockupDevice: 'browser'
			})
			expect(mockNewPage.mock.calls.length).toBeGreaterThanOrEqual(2)
		})

		it('creates a second page for iphone mockup rendering', async () => {
			await takeScreenshot({
				url: 'https://example.com',
				mockupDevice: 'iphone'
			})
			expect(mockNewPage.mock.calls.length).toBeGreaterThanOrEqual(2)
		})

		it('creates a second page for macbook mockup rendering', async () => {
			await takeScreenshot({
				url: 'https://example.com',
				mockupDevice: 'macbook'
			})
			expect(mockNewPage.mock.calls.length).toBeGreaterThanOrEqual(2)
		})

		it('does NOT create a second page when no mockupDevice', async () => {
			await takeScreenshot({ url: 'https://example.com' })
			expect(mockNewPage).toHaveBeenCalledTimes(1)
		})

		it('does NOT apply mockup for PDF type', async () => {
			await takeScreenshot({
				url: 'https://example.com',
				type: 'pdf',
				mockupDevice: 'browser'
			})
			expect(mockNewPage).toHaveBeenCalledTimes(1)
		})
	})
})
