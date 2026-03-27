import { createHmac, timingSafeEqual } from 'node:crypto'

const SIGNATURE_PARAM = 'sig'
const EXPIRES_PARAM = 'expires'

export function generateSignedUrl({
	baseUrl,
	apiKeySecret,
	params,
	expiresInSeconds = 3600
}: {
	baseUrl: string
	apiKeySecret: string
	params: Record<string, string>
	expiresInSeconds?: number
}): string {
	const url = new URL(baseUrl)

	for (const [key, value] of Object.entries(params)) {
		url.searchParams.set(key, value)
	}

	const expires = Math.floor(Date.now() / 1000) + expiresInSeconds
	url.searchParams.set(EXPIRES_PARAM, String(expires))

	const sortedParams = new URLSearchParams(
		[...url.searchParams.entries()].sort(([a], [b]) => a.localeCompare(b))
	)

	const signature = createHmac('sha256', apiKeySecret)
		.update(sortedParams.toString())
		.digest('hex')

	url.searchParams.set(SIGNATURE_PARAM, signature)
	return url.toString()
}

export function verifySignedUrl({
	url,
	apiKeySecret
}: {
	url: string
	apiKeySecret: string
}): { valid: boolean; reason?: string; params: Record<string, string> } {
	const parsed = new URL(url)
	const signature = parsed.searchParams.get(SIGNATURE_PARAM)
	const expires = parsed.searchParams.get(EXPIRES_PARAM)

	if (!signature || !expires) {
		return {
			valid: false,
			reason: 'Missing signature or expiration',
			params: {}
		}
	}

	const expiresNum = Number(expires)
	if (
		Number.isNaN(expiresNum) ||
		expiresNum < Math.floor(Date.now() / 1000)
	) {
		return { valid: false, reason: 'Signed URL has expired', params: {} }
	}

	const paramsForSigning = new URLSearchParams(parsed.searchParams)
	paramsForSigning.delete(SIGNATURE_PARAM)

	const sortedParams = new URLSearchParams(
		[...paramsForSigning.entries()].sort(([a], [b]) => a.localeCompare(b))
	)

	const expectedSignature = createHmac('sha256', apiKeySecret)
		.update(sortedParams.toString())
		.digest('hex')

	const sigBuffer = Buffer.from(signature, 'hex')
	const expectedBuffer = Buffer.from(expectedSignature, 'hex')

	if (
		sigBuffer.length !== expectedBuffer.length ||
		!timingSafeEqual(sigBuffer, expectedBuffer)
	) {
		return { valid: false, reason: 'Invalid signature', params: {} }
	}

	const params: Record<string, string> = {}
	for (const [key, value] of parsed.searchParams.entries()) {
		if (key !== SIGNATURE_PARAM && key !== EXPIRES_PARAM) {
			params[key] = value
		}
	}

	return { valid: true, params }
}
