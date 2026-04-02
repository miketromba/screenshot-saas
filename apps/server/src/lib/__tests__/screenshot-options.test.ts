import { describe, expect, it } from 'bun:test'
import {
	buildAcceptLanguageHeader,
	validateAndNormalizeScreenshotOptions
} from '../screenshot-options'

describe('buildAcceptLanguageHeader', () => {
	it('adds a base language fallback when a region is present', () => {
		expect(buildAcceptLanguageHeader('fr-FR')).toBe('fr-FR,fr;q=0.9')
	})

	it('returns the locale as-is when there is no region', () => {
		expect(buildAcceptLanguageHeader('de')).toBe('de')
	})
})

describe('validateAndNormalizeScreenshotOptions', () => {
	it('normalizes valid GET options', () => {
		const result = validateAndNormalizeScreenshotOptions(
			{
				url: 'https://example.com',
				width: 1280,
				height: 720,
				type: 'png',
				quality: 90,
				locale: 'fr-fr',
				timezone: 'Asia/Tokyo',
				removeElements: [' footer ', ' .promo-modal '],
				devicePixelRatio: 2
			},
			'get'
		)

		expect(result.ok).toBe(true)
		if (!result.ok) return

		expect(result.value.url).toBe('https://example.com/')
		expect(result.value.quality).toBeUndefined()
		expect(result.value.locale).toBe('fr-FR')
		expect(result.value.timezone).toBe('Asia/Tokyo')
		expect(result.value.removeElements).toEqual(['footer', '.promo-modal'])
	})

	it('rejects html rendering on GET', () => {
		const result = validateAndNormalizeScreenshotOptions(
			{
				url: 'https://example.com',
				html: '<h1>Hello</h1>'
			},
			'get'
		)

		expect(result).toEqual({
			ok: false,
			error: 'Use POST /api/v1/screenshot for html rendering.'
		})
	})

	it('allows HTML rendering on POST without a url', () => {
		const result = validateAndNormalizeScreenshotOptions(
			{
				html: '<h1>Hello</h1>',
				width: 800,
				height: 600
			},
			'post'
		)

		expect(result.ok).toBe(true)
		if (!result.ok) return

		expect(result.value.url).toBe('about:blank')
		expect(result.value.html).toBe('<h1>Hello</h1>')
	})

	it('rejects invalid mockup combinations', () => {
		const fullPageResult = validateAndNormalizeScreenshotOptions(
			{
				url: 'https://example.com',
				fullPage: true,
				mockupDevice: 'browser'
			},
			'post'
		)

		const pdfResult = validateAndNormalizeScreenshotOptions(
			{
				url: 'https://example.com',
				type: 'pdf',
				mockupDevice: 'browser'
			},
			'post'
		)

		expect(fullPageResult).toEqual({
			ok: false,
			error: 'mockupDevice cannot be combined with fullPage.'
		})
		expect(pdfResult).toEqual({
			ok: false,
			error: 'mockupDevice cannot be combined with type=pdf.'
		})
	})

	it('rejects invalid numeric ranges and selectors', () => {
		const widthResult = validateAndNormalizeScreenshotOptions(
			{
				url: 'https://example.com',
				width: 0
			},
			'get'
		)

		const removeElementsResult = validateAndNormalizeScreenshotOptions(
			{
				url: 'https://example.com',
				removeElements: ['   ']
			},
			'get'
		)

		expect(widthResult).toEqual({
			ok: false,
			error: 'width must be between 1 and 1920.'
		})
		expect(removeElementsResult).toEqual({
			ok: false,
			error: 'removeElements must include at least one selector.'
		})
	})
})
