import { describe, expect, test } from 'bun:test'
import {
	AuthenticationError,
	InsufficientCreditsError,
	InvalidAPIKeyError,
	ScreenshotAPIError,
	ScreenshotFailedError
} from '../errors'

describe('ScreenshotAPIError', () => {
	test('stores message, status, and code', () => {
		const err = new ScreenshotAPIError('something broke', 418, 'teapot')
		expect(err.message).toBe('something broke')
		expect(err.status).toBe(418)
		expect(err.code).toBe('teapot')
	})

	test('has name set to ScreenshotAPIError', () => {
		const err = new ScreenshotAPIError('x', 500, 'err')
		expect(err.name).toBe('ScreenshotAPIError')
	})

	test('extends Error', () => {
		const err = new ScreenshotAPIError('x', 500, 'err')
		expect(err).toBeInstanceOf(Error)
	})
})

describe('AuthenticationError', () => {
	test('has status 401 and code authentication_error', () => {
		const err = new AuthenticationError('bad creds')
		expect(err.status).toBe(401)
		expect(err.code).toBe('authentication_error')
		expect(err.message).toBe('bad creds')
	})

	test('is instanceof ScreenshotAPIError', () => {
		expect(new AuthenticationError('x')).toBeInstanceOf(ScreenshotAPIError)
	})

	test('has name set to AuthenticationError', () => {
		expect(new AuthenticationError('x').name).toBe('AuthenticationError')
	})
})

describe('InsufficientCreditsError', () => {
	test('has status 402, code insufficient_credits, and balance', () => {
		const err = new InsufficientCreditsError('no credits', 42)
		expect(err.status).toBe(402)
		expect(err.code).toBe('insufficient_credits')
		expect(err.message).toBe('no credits')
		expect(err.balance).toBe(42)
	})

	test('is instanceof ScreenshotAPIError', () => {
		expect(new InsufficientCreditsError('x', 0)).toBeInstanceOf(
			ScreenshotAPIError
		)
	})

	test('stores zero balance', () => {
		expect(new InsufficientCreditsError('x', 0).balance).toBe(0)
	})
})

describe('InvalidAPIKeyError', () => {
	test('has status 403 and code invalid_api_key', () => {
		const err = new InvalidAPIKeyError('bad key')
		expect(err.status).toBe(403)
		expect(err.code).toBe('invalid_api_key')
		expect(err.message).toBe('bad key')
	})

	test('is instanceof ScreenshotAPIError', () => {
		expect(new InvalidAPIKeyError('x')).toBeInstanceOf(ScreenshotAPIError)
	})

	test('has name set to InvalidAPIKeyError', () => {
		expect(new InvalidAPIKeyError('x').name).toBe('InvalidAPIKeyError')
	})
})

describe('ScreenshotFailedError', () => {
	test('has status 500 and code screenshot_failed', () => {
		const err = new ScreenshotFailedError('render failed')
		expect(err.status).toBe(500)
		expect(err.code).toBe('screenshot_failed')
		expect(err.message).toBe('render failed')
	})

	test('is instanceof ScreenshotAPIError', () => {
		expect(new ScreenshotFailedError('x')).toBeInstanceOf(
			ScreenshotAPIError
		)
	})

	test('has name set to ScreenshotFailedError', () => {
		expect(new ScreenshotFailedError('x').name).toBe(
			'ScreenshotFailedError'
		)
	})
})
