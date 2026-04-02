import { beforeEach, describe, expect, it, mock } from 'bun:test'

const mockLookup = mock(() => Promise.resolve([{ address: '93.184.216.34' }]))

mock.module('node:dns/promises', () => ({
	lookup: mockLookup
}))

const {
	UnsafeTargetError,
	assertSafeTargetUrl,
	isExplicitlyUnsafeHostname,
	isPrivateOrReservedIpAddress
} = await import('../network-safety')

describe('isExplicitlyUnsafeHostname', () => {
	it('flags localhost and internal suffixes', () => {
		expect(isExplicitlyUnsafeHostname('localhost')).toBe(true)
		expect(isExplicitlyUnsafeHostname('api.localhost')).toBe(true)
		expect(isExplicitlyUnsafeHostname('printer.local')).toBe(true)
		expect(isExplicitlyUnsafeHostname('db.internal')).toBe(true)
		expect(isExplicitlyUnsafeHostname('example.com')).toBe(false)
	})
})

describe('isPrivateOrReservedIpAddress', () => {
	it('flags private and reserved IPv4 ranges', () => {
		expect(isPrivateOrReservedIpAddress('127.0.0.1')).toBe(true)
		expect(isPrivateOrReservedIpAddress('10.0.0.1')).toBe(true)
		expect(isPrivateOrReservedIpAddress('172.16.0.1')).toBe(true)
		expect(isPrivateOrReservedIpAddress('192.168.1.1')).toBe(true)
		expect(isPrivateOrReservedIpAddress('169.254.1.1')).toBe(true)
		expect(isPrivateOrReservedIpAddress('93.184.216.34')).toBe(false)
	})

	it('flags private and reserved IPv6 ranges', () => {
		expect(isPrivateOrReservedIpAddress('::1')).toBe(true)
		expect(isPrivateOrReservedIpAddress('fc00::1')).toBe(true)
		expect(isPrivateOrReservedIpAddress('fd12:3456:789a::1')).toBe(true)
		expect(isPrivateOrReservedIpAddress('fe80::1')).toBe(true)
		expect(isPrivateOrReservedIpAddress('2001:db8::1')).toBe(true)
		expect(
			isPrivateOrReservedIpAddress('2606:2800:220:1:248:1893:25c8:1946')
		).toBe(false)
	})
})

describe('assertSafeTargetUrl', () => {
	beforeEach(() => {
		mockLookup.mockReset()
		mockLookup.mockReturnValue(
			Promise.resolve([{ address: '93.184.216.34' }])
		)
		delete process.env.SCREENSHOT_ALLOW_PRIVATE_NETWORK
	})

	it('allows public targets', async () => {
		await expect(
			assertSafeTargetUrl('https://example.com/path')
		).resolves.toBeUndefined()
		expect(mockLookup).toHaveBeenCalledWith('example.com', {
			all: true,
			verbatim: true
		})
	})

	it('rejects localhost and private addresses', async () => {
		await expect(
			assertSafeTargetUrl('http://localhost:3000')
		).rejects.toBeInstanceOf(UnsafeTargetError)

		await expect(
			assertSafeTargetUrl('http://10.0.0.5/admin')
		).rejects.toBeInstanceOf(UnsafeTargetError)
	})

	it('rejects public hostnames that resolve privately', async () => {
		mockLookup.mockReturnValue(Promise.resolve([{ address: '10.0.0.5' }]))

		await expect(
			assertSafeTargetUrl('https://customer.example.com')
		).rejects.toBeInstanceOf(UnsafeTargetError)
	})

	it('allows private targets when explicitly enabled', async () => {
		process.env.SCREENSHOT_ALLOW_PRIVATE_NETWORK = 'true'

		await expect(
			assertSafeTargetUrl('http://localhost:3000')
		).resolves.toBeUndefined()
		expect(mockLookup).not.toHaveBeenCalled()
	})
})
