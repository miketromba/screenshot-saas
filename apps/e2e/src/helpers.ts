function requireEnv(name: string): string {
	const value = process.env[name]
	if (!value) {
		throw new Error(`${name} is required but not set.`)
	}
	return value
}

const TARGET_URL = requireEnv('E2E_TARGET_URL')
const E2E_SECRET = requireEnv('E2E_TEST_SECRET')

function e2eHeaders(): Record<string, string> {
	return { 'x-e2e-token': E2E_SECRET }
}

export async function apiGet(
	path: string,
	options?: { headers?: Record<string, string> }
): Promise<Response> {
	return fetch(`${TARGET_URL}${path}`, {
		headers: {
			...e2eHeaders(),
			...options?.headers
		}
	})
}

export async function apiPost(
	path: string,
	body: unknown,
	options?: { headers?: Record<string, string> }
): Promise<Response> {
	return fetch(`${TARGET_URL}${path}`, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			...e2eHeaders(),
			...options?.headers
		},
		body: JSON.stringify(body)
	})
}

export async function apiDelete(
	path: string,
	options?: { headers?: Record<string, string> }
): Promise<Response> {
	return fetch(`${TARGET_URL}${path}`, {
		method: 'DELETE',
		headers: {
			...e2eHeaders(),
			...options?.headers
		}
	})
}

export async function apiRaw(
	path: string,
	options?: { headers?: Record<string, string> }
): Promise<Response> {
	return fetch(`${TARGET_URL}${path}`, {
		headers: options?.headers
	})
}
