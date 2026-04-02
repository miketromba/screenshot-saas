import { beforeEach, describe, expect, it, mock } from 'bun:test'

const mockLookup = mock(() =>
	Promise.resolve([{ address: '93.184.216.34', family: 4 }])
)
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
const mockCdpSend = mock(() => Promise.resolve())
const mockCreateCDPSession = mock(() =>
	Promise.resolve({
		send: mockCdpSend
	})
)
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
		createCDPSession: mockCreateCDPSession,
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
const mockPluginUse = mock(() => undefined)
const mockPluginLaunch = mock(() =>
	Promise.resolve({
		newPage: mockNewPage,
		close: mockClose,
		defaultBrowserContext: mockDefaultBrowserContext
	})
)
const mockAddExtra = mock(() => ({
	use: mockPluginUse,
	launch: mockPluginLaunch
}))
const mockStealthPluginFactory = mock(() => ({ name: 'stealth-plugin' }))
const mockAdblockerPluginFactory = mock(() => ({ name: 'adblocker-plugin' }))

mock.module('node:dns/promises', () => ({
	lookup: mockLookup
}))

mock.module('puppeteer-core', () => ({
	default: { launch: mockLaunch }
}))

mock.module('puppeteer-extra', () => ({
	addExtra: mockAddExtra
}))

mock.module('puppeteer-extra-plugin-stealth', () => ({
	default: mockStealthPluginFactory
}))

mock.module('puppeteer-extra-plugin-adblocker', () => ({
	default: mockAdblockerPluginFactory
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
		delete process.env.SCREENSHOT_ALLOW_PRIVATE_NETWORK
		mockLookup.mockReset()
		mockScreenshot.mockReset()
		mockSetViewport.mockReset()
		mockGoto.mockReset()
		mockEmulateMediaFeatures.mockReset()
		mockWaitForSelector.mockReset()
		mockEvaluate.mockReset()
		mockNewPage.mockReset()
		mockClose.mockReset()
		mockLaunch.mockReset()
		mockPluginUse.mockReset()
		mockPluginLaunch.mockReset()
		mockAddExtra.mockReset()
		mockStealthPluginFactory.mockReset()
		mockAdblockerPluginFactory.mockReset()
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
		mockCdpSend.mockReset()
		mockCreateCDPSession.mockReset()
		mockPageClose.mockReset()
		mockDollar.mockReset()
		mockOverridePermissions.mockReset()
		mockDefaultBrowserContext.mockReset()

		mockLookup.mockReturnValue(
			Promise.resolve([{ address: '93.184.216.34', family: 4 }])
		)
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
		mockCdpSend.mockReturnValue(Promise.resolve())
		mockCreateCDPSession.mockReturnValue(
			Promise.resolve({
				send: mockCdpSend
			})
		)
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
				createCDPSession: mockCreateCDPSession,
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
		mockPluginUse.mockReturnValue(undefined)
		mockPluginLaunch.mockReturnValue(
			Promise.resolve({
				newPage: mockNewPage,
				close: mockClose,
				defaultBrowserContext: mockDefaultBrowserContext
			})
		)
		mockAddExtra.mockReturnValue({
			use: mockPluginUse,
			launch: mockPluginLaunch
		})
		mockStealthPluginFactory.mockReturnValue({ name: 'stealth-plugin' })
		mockAdblockerPluginFactory.mockReturnValue({
			name: 'adblocker-plugin'
		})

		process.env.VERCEL = '1'
	})

	it('returns buffer and content type', async () => {
		const result = await takeScreenshot({ url: 'https://example.com' })
		expect(result.buffer).toBeInstanceOf(Buffer)
		expect(result.contentType).toBe('image/png')
	})

	it('rejects unsafe targets before navigation', async () => {
		mockLookup.mockReturnValue(
			Promise.resolve([{ address: '127.0.0.1', family: 4 }])
		)

		await expect(
			takeScreenshot({ url: 'http://localhost:3000' })
		).rejects.toThrow('Local and internal hostnames are not allowed.')
		expect(mockGoto).not.toHaveBeenCalled()
	})

	it('allows private targets when explicitly enabled', async () => {
		process.env.SCREENSHOT_ALLOW_PRIVATE_NETWORK = 'true'

		await takeScreenshot({ url: 'http://localhost:3000' })
		expect(mockGoto).toHaveBeenCalledWith('http://localhost:3000', {
			waitUntil: 'networkidle2',
			timeout: 30_000
		})
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
		it('registers the adblocker plugin when blockAds is true', async () => {
			await takeScreenshot({ url: 'https://example.com', blockAds: true })
			expect(mockAddExtra).toHaveBeenCalled()
			expect(mockAdblockerPluginFactory).toHaveBeenCalledWith({
				blockTrackers: true
			})
			expect(mockPluginUse).toHaveBeenCalledWith({
				name: 'adblocker-plugin'
			})
		})

		it('does NOT register adblocker plugin when blockAds is false', async () => {
			await takeScreenshot({
				url: 'https://example.com',
				blockAds: false
			})
			expect(mockAdblockerPluginFactory).not.toHaveBeenCalled()
		})

		it('still enables request interception for network safety', async () => {
			await takeScreenshot({ url: 'https://example.com' })
			expect(mockSetRequestInterception).toHaveBeenCalledWith(true)
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

		it('throws a descriptive error when JS injection errors', async () => {
			mockEvaluate.mockImplementation((arg: unknown) => {
				if (typeof arg === 'string') {
					return Promise.reject(new Error('JS error'))
				}
				return Promise.resolve()
			})

			await expect(
				takeScreenshot({
					url: 'https://example.com',
					jsInject: 'throw new Error("boom")'
				})
			).rejects.toThrow('jsInject failed: JS error')
		})
	})

	describe('stealth mode', () => {
		it('uses puppeteer-extra with stealth plugin when stealthMode is true', async () => {
			await takeScreenshot({
				url: 'https://example.com',
				stealthMode: true
			})
			expect(mockAddExtra).toHaveBeenCalled()
			expect(mockStealthPluginFactory).toHaveBeenCalled()
			expect(mockPluginUse).toHaveBeenCalledWith({
				name: 'stealth-plugin'
			})
			expect(mockPluginLaunch).toHaveBeenCalled()
		})

		it('does NOT use puppeteer-extra when stealthMode is false and blockAds is false', async () => {
			await takeScreenshot({
				url: 'https://example.com',
				stealthMode: false
			})
			expect(mockAddExtra).not.toHaveBeenCalled()
			expect(mockPluginLaunch).not.toHaveBeenCalled()
		})

		it('uses both stealth and adblocker plugins together', async () => {
			await takeScreenshot({
				url: 'https://example.com',
				stealthMode: true,
				blockAds: true
			})
			expect(mockAddExtra).toHaveBeenCalled()
			expect(mockStealthPluginFactory).toHaveBeenCalled()
			expect(mockAdblockerPluginFactory).toHaveBeenCalled()
			expect(mockPluginUse).toHaveBeenCalledTimes(2)
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
				'Accept-Language': 'fr-FR,fr;q=0.9'
			})
		})

		it('calls CDP locale override when locale is provided', async () => {
			await takeScreenshot({
				url: 'https://example.com',
				locale: 'fr-FR'
			})

			expect(mockCreateCDPSession).toHaveBeenCalled()
			expect(mockCdpSend).toHaveBeenCalledWith(
				'Emulation.setLocaleOverride',
				{ locale: 'fr-FR' }
			)
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

		it('throws when removeElements includes an invalid selector', async () => {
			mockEvaluate.mockImplementation(
				(_arg: unknown, selectors: unknown) => {
					if (
						Array.isArray(selectors) &&
						selectors.includes('[broken')
					) {
						return Promise.resolve(['[broken'])
					}
					return Promise.resolve()
				}
			)

			await expect(
				takeScreenshot({
					url: 'https://example.com',
					removeElements: ['[broken']
				})
			).rejects.toThrow(
				'removeElements contains invalid selector: [broken'
			)
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
