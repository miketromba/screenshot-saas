import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'

const PRIVATE_NETWORK_OVERRIDE_ENV = 'SCREENSHOT_ALLOW_PRIVATE_NETWORK'

export class UnsafeTargetError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'UnsafeTargetError'
	}
}

function ipv4ToNumber(address: string): number {
	const octets = address.split('.').map(part => Number.parseInt(part, 10))
	const [a = 0, b = 0, c = 0, d = 0] = octets
	return a * 256 ** 3 + b * 256 ** 2 + c * 256 + d
}

function isIpv4InRange(address: string, start: string, end: string): boolean {
	const value = ipv4ToNumber(address)
	return value >= ipv4ToNumber(start) && value <= ipv4ToNumber(end)
}

function expandIpv6(address: string): number[] {
	const normalized = address.toLowerCase()
	if (normalized.includes('.')) {
		const [head, tail] = normalized.split(/:(?=[^:]+$)/)
		const octets = (tail ?? '')
			.split('.')
			.map(part => Number.parseInt(part, 10))
		const [a = 0, b = 0, c = 0, d = 0] = octets
		const high = ((a << 8) | b).toString(16)
		const low = ((c << 8) | d).toString(16)
		return expandIpv6(`${head}:${high}:${low}`)
	}

	const [left, right] = normalized.split('::')
	const leftParts = left ? left.split(':').filter(Boolean) : []
	const rightParts = right ? right.split(':').filter(Boolean) : []
	const missingGroups = 8 - (leftParts.length + rightParts.length)
	const groups = [
		...leftParts,
		...Array.from({ length: missingGroups }, () => '0'),
		...rightParts
	]

	return groups.flatMap(group => {
		const value = Number.parseInt(group || '0', 16)
		return [(value >> 8) & 0xff, value & 0xff]
	})
}

function isPrivateOrReservedIpv4(address: string): boolean {
	return (
		isIpv4InRange(address, '0.0.0.0', '0.255.255.255') ||
		isIpv4InRange(address, '10.0.0.0', '10.255.255.255') ||
		isIpv4InRange(address, '100.64.0.0', '100.127.255.255') ||
		isIpv4InRange(address, '127.0.0.0', '127.255.255.255') ||
		isIpv4InRange(address, '169.254.0.0', '169.254.255.255') ||
		isIpv4InRange(address, '172.16.0.0', '172.31.255.255') ||
		isIpv4InRange(address, '192.0.0.0', '192.0.0.255') ||
		isIpv4InRange(address, '192.0.2.0', '192.0.2.255') ||
		isIpv4InRange(address, '192.168.0.0', '192.168.255.255') ||
		isIpv4InRange(address, '198.18.0.0', '198.19.255.255') ||
		isIpv4InRange(address, '198.51.100.0', '198.51.100.255') ||
		isIpv4InRange(address, '203.0.113.0', '203.0.113.255') ||
		isIpv4InRange(address, '224.0.0.0', '255.255.255.255')
	)
}

function isPrivateOrReservedIpv6(address: string): boolean {
	const bytes = expandIpv6(address)

	const isLoopback = bytes.every((byte, index) =>
		index === bytes.length - 1 ? byte === 1 : byte === 0
	)
	if (isLoopback) {
		return true
	}

	const isUnspecified = bytes.every(byte => byte === 0)
	if (isUnspecified) {
		return true
	}

	const firstByte = bytes[0] ?? 0
	const secondByte = bytes[1] ?? 0

	const isUniqueLocal = (firstByte & 0xfe) === 0xfc
	const isLinkLocal = firstByte === 0xfe && (secondByte & 0xc0) === 0x80
	const isMulticast = firstByte === 0xff
	const isDocumentation =
		firstByte === 0x20 &&
		secondByte === 0x01 &&
		(bytes[2] ?? 0) === 0x0d &&
		(bytes[3] ?? 0) === 0xb8

	if (isUniqueLocal || isLinkLocal || isMulticast || isDocumentation) {
		return true
	}

	const isIpv4Mapped =
		bytes.slice(0, 10).every(byte => byte === 0) &&
		bytes[10] === 0xff &&
		bytes[11] === 0xff

	if (isIpv4Mapped) {
		return isPrivateOrReservedIpv4(bytes.slice(12).join('.'))
	}

	return false
}

export function shouldAllowPrivateNetworkAccess(): boolean {
	return process.env[PRIVATE_NETWORK_OVERRIDE_ENV] === 'true'
}

export function isExplicitlyUnsafeHostname(hostname: string): boolean {
	const normalized = hostname.trim().toLowerCase()
	return (
		normalized === 'localhost' ||
		normalized.endsWith('.localhost') ||
		normalized.endsWith('.local') ||
		normalized.endsWith('.internal')
	)
}

export function isPrivateOrReservedIpAddress(address: string): boolean {
	const version = isIP(address)
	if (version === 4) {
		return isPrivateOrReservedIpv4(address)
	}
	if (version === 6) {
		return isPrivateOrReservedIpv6(address)
	}
	return false
}

async function assertSafeHostname(
	hostname: string,
	resolutionCache: Map<string, Promise<void>>
): Promise<void> {
	const normalized = hostname.toLowerCase()

	if (isExplicitlyUnsafeHostname(normalized)) {
		throw new UnsafeTargetError(
			'Local and internal hostnames are not allowed.'
		)
	}

	if (isPrivateOrReservedIpAddress(normalized)) {
		throw new UnsafeTargetError(
			'Private and reserved IP addresses are not allowed.'
		)
	}

	const cached = resolutionCache.get(normalized)
	if (cached) {
		return cached
	}

	const resolution = (async () => {
		const addresses = await lookup(normalized, {
			all: true,
			verbatim: true
		})

		if (
			addresses.some(entry => isPrivateOrReservedIpAddress(entry.address))
		) {
			throw new UnsafeTargetError(
				'Target URL resolves to a private or reserved network address.'
			)
		}
	})()

	resolutionCache.set(normalized, resolution)

	try {
		await resolution
	} catch (error) {
		resolutionCache.delete(normalized)
		throw error
	}
}

export async function assertSafeTargetUrl(
	targetUrl: string,
	resolutionCache = new Map<string, Promise<void>>()
): Promise<void> {
	if (shouldAllowPrivateNetworkAccess()) {
		return
	}

	const parsed = new URL(targetUrl)
	if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
		return
	}

	await assertSafeHostname(parsed.hostname, resolutionCache)
}
