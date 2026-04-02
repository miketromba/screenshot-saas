import type {
	GeoLocationOptions,
	ScreenshotOptions
} from '../services/screenshot'

export const MAX_VIEWPORT_WIDTH = 1920
export const MAX_VIEWPORT_HEIGHT = 10_000
export const MAX_DELAY_MS = 30_000
export const MAX_CACHE_TTL_SECONDS = 60 * 60 * 24 * 7
export const MAX_INJECT_LENGTH = 10_000
export const MAX_WAIT_FOR_SELECTOR_LENGTH = 500
export const MAX_REMOVE_ELEMENTS = 25

const VALID_TYPES = new Set<ScreenshotOptions['type']>([
	'png',
	'jpeg',
	'webp',
	'pdf'
])

const VALID_COLOR_SCHEMES = new Set<
	NonNullable<ScreenshotOptions['colorScheme']>
>(['light', 'dark'])

const VALID_WAIT_UNTIL = new Set<NonNullable<ScreenshotOptions['waitUntil']>>([
	'load',
	'domcontentloaded',
	'networkidle0',
	'networkidle2'
])

const VALID_DEVICE_PIXEL_RATIOS = new Set([1, 2, 3])

const VALID_MOCKUP_DEVICES = new Set<
	NonNullable<ScreenshotOptions['mockupDevice']>
>(['browser', 'iphone', 'macbook'])

type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: string }

export type ScreenshotValidationSource = 'get' | 'post'

function fail(error: string): ValidationResult<never> {
	return { ok: false, error }
}

function ok<T>(value: T): ValidationResult<T> {
	return { ok: true, value }
}

function normalizeOptionalString(
	value: string | undefined
): string | undefined {
	if (value === undefined) return undefined
	const trimmed = value.trim()
	return trimmed.length > 0 ? trimmed : undefined
}

function validateInteger(
	value: number | undefined,
	{
		field,
		min,
		max
	}: {
		field: string
		min: number
		max: number
	}
): ValidationResult<number | undefined> {
	if (value === undefined) return ok(undefined)
	if (!Number.isFinite(value) || !Number.isInteger(value)) {
		return fail(`${field} must be an integer.`)
	}
	if (value < min || value > max) {
		return fail(`${field} must be between ${min} and ${max}.`)
	}
	return ok(value)
}

function validateUrl(
	url: string | undefined,
	{
		allowAboutBlank
	}: {
		allowAboutBlank: boolean
	}
): ValidationResult<string | undefined> {
	if (!url) return ok(undefined)
	if (allowAboutBlank && url === 'about:blank') return ok(url)

	try {
		const parsed = new URL(url)
		if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
			return fail('url must use http or https.')
		}
		return ok(parsed.toString())
	} catch {
		return fail('url must be a valid absolute URL.')
	}
}

function validateTimezone(
	timezone: string | undefined
): ValidationResult<string | undefined> {
	if (!timezone) return ok(undefined)
	try {
		const normalized = new Intl.DateTimeFormat('en-US', {
			timeZone: timezone
		}).resolvedOptions().timeZone
		return ok(normalized || timezone)
	} catch {
		return fail('timezone must be a valid IANA timezone.')
	}
}

function normalizeLocale(
	locale: string | undefined
): ValidationResult<string | undefined> {
	if (!locale) return ok(undefined)
	try {
		const normalized = Intl.getCanonicalLocales(locale)[0]
		return normalized ? ok(normalized) : fail('locale must be valid.')
	} catch {
		return fail('locale must be a valid BCP 47 locale tag.')
	}
}

function validateGeoLocation(
	geoLocation: GeoLocationOptions | undefined
): ValidationResult<GeoLocationOptions | undefined> {
	if (!geoLocation) return ok(undefined)
	if (
		!Number.isFinite(geoLocation.latitude) ||
		!Number.isFinite(geoLocation.longitude)
	) {
		return fail(
			'geoLocation latitude and longitude must be finite numbers.'
		)
	}
	if (geoLocation.latitude < -90 || geoLocation.latitude > 90) {
		return fail('geoLocation latitude must be between -90 and 90.')
	}
	if (geoLocation.longitude < -180 || geoLocation.longitude > 180) {
		return fail('geoLocation longitude must be between -180 and 180.')
	}
	if (
		geoLocation.accuracy !== undefined &&
		(!Number.isFinite(geoLocation.accuracy) ||
			geoLocation.accuracy < 0 ||
			geoLocation.accuracy > 100_000)
	) {
		return fail('geoLocation accuracy must be between 0 and 100000.')
	}
	return ok(geoLocation)
}

function normalizeRemoveElements(
	removeElements: string[] | undefined
): ValidationResult<string[] | undefined> {
	if (!removeElements) return ok(undefined)

	const normalized = removeElements
		.map(selector => selector.trim())
		.filter(Boolean)

	if (normalized.length === 0) {
		return fail('removeElements must include at least one selector.')
	}
	if (normalized.length > MAX_REMOVE_ELEMENTS) {
		return fail(
			`removeElements can include at most ${MAX_REMOVE_ELEMENTS} selectors.`
		)
	}
	for (const selector of normalized) {
		if (selector.length > MAX_WAIT_FOR_SELECTOR_LENGTH) {
			return fail(
				'Each removeElements selector must be 500 characters or fewer.'
			)
		}
	}

	return ok(normalized)
}

export function buildAcceptLanguageHeader(locale: string): string {
	const baseLanguage = locale.split('-')[0]
	if (!baseLanguage || baseLanguage === locale) {
		return locale
	}
	return `${locale},${baseLanguage};q=0.9`
}

export function validateAndNormalizeScreenshotOptions(
	input: Partial<ScreenshotOptions>,
	source: ScreenshotValidationSource
): ValidationResult<ScreenshotOptions> {
	const html = normalizeOptionalString(input.html)
	const rawUrl = normalizeOptionalString(input.url)

	if (source === 'get' && html) {
		return fail('Use POST /api/v1/screenshot for html rendering.')
	}

	const allowAboutBlank = html !== undefined
	const validatedUrl = validateUrl(
		rawUrl ?? (html ? 'about:blank' : undefined),
		{ allowAboutBlank }
	)
	if (!validatedUrl.ok) return validatedUrl

	if (!validatedUrl.value && !html) {
		return fail('Provide a url or html to capture.')
	}

	const width = validateInteger(input.width, {
		field: 'width',
		min: 1,
		max: MAX_VIEWPORT_WIDTH
	})
	if (!width.ok) return width

	const height = validateInteger(input.height, {
		field: 'height',
		min: 1,
		max: MAX_VIEWPORT_HEIGHT
	})
	if (!height.ok) return height

	if (input.type !== undefined && !VALID_TYPES.has(input.type)) {
		return fail('type must be one of png, jpeg, webp, or pdf.')
	}

	const quality = validateInteger(input.quality, {
		field: 'quality',
		min: 1,
		max: 100
	})
	if (!quality.ok) return quality

	if (
		input.colorScheme !== undefined &&
		!VALID_COLOR_SCHEMES.has(input.colorScheme)
	) {
		return fail('colorScheme must be light or dark.')
	}

	if (
		input.waitUntil !== undefined &&
		!VALID_WAIT_UNTIL.has(input.waitUntil)
	) {
		return fail(
			'waitUntil must be one of load, domcontentloaded, networkidle0, or networkidle2.'
		)
	}

	const waitForSelector = normalizeOptionalString(input.waitForSelector)
	if (
		waitForSelector !== undefined &&
		waitForSelector.length > MAX_WAIT_FOR_SELECTOR_LENGTH
	) {
		return fail(
			`waitForSelector must be ${MAX_WAIT_FOR_SELECTOR_LENGTH} characters or fewer.`
		)
	}

	const delay = validateInteger(input.delay, {
		field: 'delay',
		min: 0,
		max: MAX_DELAY_MS
	})
	if (!delay.ok) return delay

	const devicePixelRatio = validateInteger(input.devicePixelRatio, {
		field: 'devicePixelRatio',
		min: 1,
		max: 3
	})
	if (!devicePixelRatio.ok) return devicePixelRatio
	if (
		devicePixelRatio.value !== undefined &&
		!VALID_DEVICE_PIXEL_RATIOS.has(devicePixelRatio.value)
	) {
		return fail('devicePixelRatio must be one of 1, 2, or 3.')
	}

	const timezone = validateTimezone(normalizeOptionalString(input.timezone))
	if (!timezone.ok) return timezone

	const locale = normalizeLocale(normalizeOptionalString(input.locale))
	if (!locale.ok) return locale

	const cacheTtl = validateInteger(input.cacheTtl, {
		field: 'cacheTtl',
		min: 1,
		max: MAX_CACHE_TTL_SECONDS
	})
	if (!cacheTtl.ok) return cacheTtl

	if (
		input.cssInject !== undefined &&
		input.cssInject.length > MAX_INJECT_LENGTH
	) {
		return fail(
			`cssInject must be ${MAX_INJECT_LENGTH} characters or fewer.`
		)
	}

	if (
		input.jsInject !== undefined &&
		input.jsInject.length > MAX_INJECT_LENGTH
	) {
		return fail(
			`jsInject must be ${MAX_INJECT_LENGTH} characters or fewer.`
		)
	}

	const removeElements = normalizeRemoveElements(input.removeElements)
	if (!removeElements.ok) return removeElements

	if (
		input.mockupDevice !== undefined &&
		!VALID_MOCKUP_DEVICES.has(input.mockupDevice)
	) {
		return fail('mockupDevice must be browser, iphone, or macbook.')
	}

	const geoLocation = validateGeoLocation(input.geoLocation)
	if (!geoLocation.ok) return geoLocation

	if (input.mockupDevice && input.fullPage) {
		return fail('mockupDevice cannot be combined with fullPage.')
	}

	if (input.mockupDevice && input.type === 'pdf') {
		return fail('mockupDevice cannot be combined with type=pdf.')
	}

	return ok({
		url: validatedUrl.value ?? 'about:blank',
		width: width.value,
		height: height.value,
		fullPage: input.fullPage,
		type: input.type,
		quality:
			input.type === 'jpeg' || input.type === 'webp'
				? quality.value
				: undefined,
		colorScheme: input.colorScheme,
		waitUntil: input.waitUntil,
		waitForSelector,
		delay: delay.value,
		blockAds: input.blockAds,
		removeCookieBanners: input.removeCookieBanners,
		html,
		cssInject: input.cssInject,
		jsInject: input.jsInject,
		stealthMode: input.stealthMode,
		devicePixelRatio: devicePixelRatio.value,
		timezone: timezone.value,
		locale: locale.value,
		cacheTtl: cacheTtl.value,
		preloadFonts: input.preloadFonts,
		removeElements: removeElements.value,
		removePopups: input.removePopups,
		mockupDevice: input.mockupDevice,
		geoLocation: geoLocation.value
	})
}
