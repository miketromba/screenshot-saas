import { afterAll, describe, expect, it } from 'bun:test'
import { apiDelete, apiGet, apiPost, apiRaw } from './helpers'

const TEST_URL = 'https://example.com'

// ─── Health ──────────────────────────────────────────────────────────

describe('Health', () => {
	it('GET /api/health returns ok', async () => {
		const res = await apiRaw('/api/health')
		expect(res.status).toBe(200)
		const body = await res.json()
		expect(body.status).toBe('ok')
		expect(body.timestamp).toBeDefined()
	})
})

// ─── Screenshot API (core product) ──────────────────────────────────

describe('Screenshot API', () => {
	it('GET /api/v1/screenshot returns a PNG image with expected headers', async () => {
		const res = await apiGet(
			`/api/v1/screenshot?url=${encodeURIComponent(TEST_URL)}`
		)
		expect(res.status).toBe(200)

		const contentType = res.headers.get('content-type')
		expect(contentType).toMatch(/^image\//)

		const buffer = await res.arrayBuffer()
		expect(buffer.byteLength).toBeGreaterThan(100)

		expect(res.headers.get('x-screenshot-id')).toBeTruthy()
		expect(res.headers.get('x-duration-ms')).toBeTruthy()
		expect(res.headers.get('x-credits-remaining')).toBeTruthy()
		expect(res.headers.get('x-usage-source')).toBeTruthy()
		expect(res.headers.get('x-cache')).toBe('MISS')
	}, 60_000)

	it('POST /api/v1/screenshot with HTML body returns an image', async () => {
		const res = await apiPost('/api/v1/screenshot', {
			html: '<html><body style="background:#1a1a2e;color:#eee;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><h1>E2E Smoke Test</h1></body></html>',
			width: 800,
			height: 600
		})
		expect(res.status).toBe(200)

		const contentType = res.headers.get('content-type')
		expect(contentType).toMatch(/^image\//)

		const buffer = await res.arrayBuffer()
		expect(buffer.byteLength).toBeGreaterThan(100)
	}, 60_000)

	it('GET screenshot with custom dimensions and webp format', async () => {
		const params = new URLSearchParams({
			url: TEST_URL,
			width: '1280',
			height: '720',
			type: 'webp'
		})
		const res = await apiGet(`/api/v1/screenshot?${params}`)
		expect(res.status).toBe(200)

		const contentType = res.headers.get('content-type')
		expect(contentType).toContain('webp')
	}, 60_000)

	it('GET screenshot with dark color scheme', async () => {
		const params = new URLSearchParams({
			url: TEST_URL,
			colorScheme: 'dark'
		})
		const res = await apiGet(`/api/v1/screenshot?${params}`)
		expect(res.status).toBe(200)

		const contentType = res.headers.get('content-type')
		expect(contentType).toMatch(/^image\//)
	}, 60_000)

	it('GET screenshot with full page capture', async () => {
		const params = new URLSearchParams({
			url: TEST_URL,
			fullPage: 'true'
		})
		const res = await apiGet(`/api/v1/screenshot?${params}`)
		expect(res.status).toBe(200)

		const buffer = await res.arrayBuffer()
		expect(buffer.byteLength).toBeGreaterThan(100)
	}, 60_000)

	it('GET screenshot with blockAds and removeCookieBanners', async () => {
		const params = new URLSearchParams({
			url: TEST_URL,
			blockAds: 'true',
			removeCookieBanners: 'true'
		})
		const res = await apiGet(`/api/v1/screenshot?${params}`)
		expect(res.status).toBe(200)
	}, 60_000)

	it('GET screenshot with caching returns HIT on second request', async () => {
		const cacheBuster = Date.now()
		const params = new URLSearchParams({
			url: `${TEST_URL}?_e2e=${cacheBuster}`,
			cacheTtl: '300'
		})
		const path = `/api/v1/screenshot?${params}`

		const first = await apiGet(path)
		expect(first.status).toBe(200)
		expect(first.headers.get('x-cache')).toBe('MISS')

		const second = await apiGet(path)
		expect(second.status).toBe(200)
		expect(second.headers.get('x-cache')).toBe('HIT')
	}, 120_000)
})

// ─── Screenshot API — Phase 3 features ──────────────────────────────

describe('Screenshot API — PDF export', () => {
	it('GET screenshot with type=pdf returns application/pdf', async () => {
		const params = new URLSearchParams({
			url: TEST_URL,
			type: 'pdf'
		})
		const res = await apiGet(`/api/v1/screenshot?${params}`)
		expect(res.status).toBe(200)

		const contentType = res.headers.get('content-type')
		expect(contentType).toContain('pdf')

		const buffer = new Uint8Array(await res.arrayBuffer())
		const header = String.fromCharCode(...buffer.slice(0, 4))
		expect(header).toBe('%PDF')
	}, 60_000)
})

describe('Screenshot API — stealth mode', () => {
	it('GET screenshot with stealthMode returns an image', async () => {
		const params = new URLSearchParams({
			url: TEST_URL,
			stealthMode: 'true'
		})
		const res = await apiGet(`/api/v1/screenshot?${params}`)
		expect(res.status).toBe(200)
		expect(res.headers.get('content-type')).toMatch(/^image\//)
	}, 60_000)
})

describe('Screenshot API — Retina/HiDPI', () => {
	it('GET screenshot with devicePixelRatio=2 returns an image', async () => {
		const params = new URLSearchParams({
			url: TEST_URL,
			width: '400',
			height: '300',
			devicePixelRatio: '2'
		})
		const res = await apiGet(`/api/v1/screenshot?${params}`)
		expect(res.status).toBe(200)

		const buffer = await res.arrayBuffer()
		expect(buffer.byteLength).toBeGreaterThan(100)
	}, 60_000)
})

describe('Screenshot API — timezone & locale emulation', () => {
	it('GET screenshot with timezone set succeeds', async () => {
		const params = new URLSearchParams({
			url: TEST_URL,
			timezone: 'Asia/Tokyo'
		})
		const res = await apiGet(`/api/v1/screenshot?${params}`)
		expect(res.status).toBe(200)
	}, 60_000)

	it('GET screenshot with locale set succeeds', async () => {
		const params = new URLSearchParams({
			url: TEST_URL,
			locale: 'de-DE'
		})
		const res = await apiGet(`/api/v1/screenshot?${params}`)
		expect(res.status).toBe(200)
	}, 60_000)
})

describe('Screenshot API — CSS/JS injection', () => {
	it('GET screenshot with cssInject succeeds', async () => {
		const params = new URLSearchParams({
			url: TEST_URL,
			cssInject: 'body { background: red !important; }'
		})
		const res = await apiGet(`/api/v1/screenshot?${params}`)
		expect(res.status).toBe(200)
	}, 60_000)

	it('GET screenshot with jsInject succeeds', async () => {
		const params = new URLSearchParams({
			url: TEST_URL,
			jsInject: 'document.title = "injected"'
		})
		const res = await apiGet(`/api/v1/screenshot?${params}`)
		expect(res.status).toBe(200)
	}, 60_000)
})

describe('Screenshot API — Google Fonts preloading', () => {
	it('GET screenshot with preloadFonts=true succeeds', async () => {
		const params = new URLSearchParams({
			url: TEST_URL,
			preloadFonts: 'true'
		})
		const res = await apiGet(`/api/v1/screenshot?${params}`)
		expect(res.status).toBe(200)

		const buffer = await res.arrayBuffer()
		expect(buffer.byteLength).toBeGreaterThan(100)
	}, 60_000)
})

describe('Screenshot API — element removal', () => {
	it('GET screenshot with removeElements succeeds', async () => {
		const params = new URLSearchParams({
			url: TEST_URL,
			removeElements: 'footer, .ad-banner, #cookie-popup'
		})
		const res = await apiGet(`/api/v1/screenshot?${params}`)
		expect(res.status).toBe(200)
	}, 60_000)
})

describe('Screenshot API — popup removal', () => {
	it('GET screenshot with removePopups=true succeeds', async () => {
		const params = new URLSearchParams({
			url: TEST_URL,
			removePopups: 'true'
		})
		const res = await apiGet(`/api/v1/screenshot?${params}`)
		expect(res.status).toBe(200)
	}, 60_000)
})

describe('Screenshot API — device mockup frames', () => {
	it('GET screenshot with mockupDevice=browser returns PNG', async () => {
		const params = new URLSearchParams({
			url: TEST_URL,
			width: '400',
			height: '300',
			mockupDevice: 'browser'
		})
		const res = await apiGet(`/api/v1/screenshot?${params}`)
		expect(res.status).toBe(200)

		const contentType = res.headers.get('content-type')
		expect(contentType).toContain('png')
	}, 120_000)

	it('GET screenshot with mockupDevice=iphone returns PNG', async () => {
		const params = new URLSearchParams({
			url: TEST_URL,
			width: '390',
			height: '844',
			mockupDevice: 'iphone'
		})
		const res = await apiGet(`/api/v1/screenshot?${params}`)
		expect(res.status).toBe(200)
		expect(res.headers.get('content-type')).toContain('png')
	}, 120_000)

	it('GET screenshot with mockupDevice=macbook returns PNG', async () => {
		const params = new URLSearchParams({
			url: TEST_URL,
			width: '400',
			height: '300',
			mockupDevice: 'macbook'
		})
		const res = await apiGet(`/api/v1/screenshot?${params}`)
		expect(res.status).toBe(200)
		expect(res.headers.get('content-type')).toContain('png')
	}, 120_000)
})

describe('Screenshot API — geolocation', () => {
	it('GET screenshot with geoLatitude/geoLongitude succeeds', async () => {
		const params = new URLSearchParams({
			url: TEST_URL,
			geoLatitude: '40.7128',
			geoLongitude: '-74.0060'
		})
		const res = await apiGet(`/api/v1/screenshot?${params}`)
		expect(res.status).toBe(200)
	}, 60_000)

	it('GET screenshot with geoAccuracy succeeds', async () => {
		const params = new URLSearchParams({
			url: TEST_URL,
			geoLatitude: '51.5074',
			geoLongitude: '-0.1278',
			geoAccuracy: '10'
		})
		const res = await apiGet(`/api/v1/screenshot?${params}`)
		expect(res.status).toBe(200)
	}, 60_000)
})

describe('Screenshot API — POST with all new features', () => {
	it('POST screenshot with new body params succeeds', async () => {
		const res = await apiPost('/api/v1/screenshot', {
			url: TEST_URL,
			width: 800,
			height: 600,
			preloadFonts: true,
			removePopups: true,
			removeElements: ['footer'],
			geoLocation: { latitude: 48.8566, longitude: 2.3522 }
		})
		expect(res.status).toBe(200)

		const contentType = res.headers.get('content-type')
		expect(contentType).toMatch(/^image\//)
	}, 60_000)

	it('POST screenshot with mockupDevice succeeds', async () => {
		const res = await apiPost('/api/v1/screenshot', {
			url: TEST_URL,
			width: 400,
			height: 300,
			mockupDevice: 'browser'
		})
		expect(res.status).toBe(200)
		expect(res.headers.get('content-type')).toContain('png')
	}, 120_000)
})

describe('Screenshot API — combined kitchen sink', () => {
	it('GET screenshot with every feature flag set succeeds', async () => {
		const params = new URLSearchParams({
			url: TEST_URL,
			width: '800',
			height: '600',
			type: 'webp',
			quality: '80',
			fullPage: 'false',
			colorScheme: 'dark',
			waitUntil: 'networkidle2',
			delay: '100',
			blockAds: 'true',
			removeCookieBanners: 'true',
			removePopups: 'true',
			removeElements: 'footer',
			stealthMode: 'true',
			preloadFonts: 'true',
			devicePixelRatio: '2',
			timezone: 'America/Los_Angeles',
			locale: 'ja-JP',
			cssInject: 'body { opacity: 1; }',
			geoLatitude: '35.6762',
			geoLongitude: '139.6503'
		})
		const res = await apiGet(`/api/v1/screenshot?${params}`)
		expect(res.status).toBe(200)

		const contentType = res.headers.get('content-type')
		expect(contentType).toContain('webp')
	}, 120_000)
})

// ─── Auth enforcement ───────────────────────────────────────────────

describe('Auth enforcement', () => {
	it('GET /api/v1/screenshot without any auth returns 401', async () => {
		const res = await apiRaw(
			`/api/v1/screenshot?url=${encodeURIComponent(TEST_URL)}`
		)
		expect(res.status).toBe(401)
	})

	it('GET /api/v1/screenshot with invalid API key returns 403', async () => {
		const res = await apiRaw(
			`/api/v1/screenshot?url=${encodeURIComponent(TEST_URL)}`,
			{ headers: { 'x-api-key': 'sk_live_invalid_key_1234' } }
		)
		expect(res.status).toBe(403)
	})

	it('GET /api/v1/user/me without auth returns 401', async () => {
		const res = await apiRaw('/api/v1/user/me')
		expect(res.status).toBe(401)
	})
})

// ─── Credits API ────────────────────────────────────────────────────

describe('Credits API', () => {
	it('GET /api/v1/credits/packs returns packs (public)', async () => {
		const res = await apiRaw('/api/v1/credits/packs')
		expect(res.status).toBe(200)
		const body = await res.json()
		expect(Array.isArray(body)).toBe(true)
	})

	it('GET /api/v1/credits returns balance', async () => {
		const res = await apiGet('/api/v1/credits')
		expect(res.status).toBe(200)
		const body = (await res.json()) as { balance: number }
		expect(typeof body.balance).toBe('number')
		expect(body.balance).toBeGreaterThanOrEqual(0)
	})

	it('GET /api/v1/credits/transactions returns list', async () => {
		const res = await apiGet('/api/v1/credits/transactions?limit=10')
		expect(res.status).toBe(200)
		const body = await res.json()
		expect(Array.isArray(body)).toBe(true)
	})

	it('POST /api/v1/credits/initialize succeeds', async () => {
		const res = await apiPost('/api/v1/credits/initialize', {})
		expect(res.status).toBe(200)
		const body = (await res.json()) as { balance: number }
		expect(typeof body.balance).toBe('number')
	})
})

// ─── Subscription API ───────────────────────────────────────────────

describe('Subscription API', () => {
	it('GET /api/v1/subscription/plans returns plans (public)', async () => {
		const res = await apiRaw('/api/v1/subscription/plans')
		expect(res.status).toBe(200)
		const body = (await res.json()) as Array<{
			id: string
			name: string
			screenshotsPerMonth: number
		}>
		expect(Array.isArray(body)).toBe(true)
		expect(body.length).toBeGreaterThan(0)

		const plan = body[0]!
		expect(plan.id).toBeDefined()
		expect(plan.name).toBeDefined()
		expect(typeof plan.screenshotsPerMonth).toBe('number')
	})

	it('GET /api/v1/subscription returns E2E test subscription', async () => {
		const res = await apiGet('/api/v1/subscription')
		expect(res.status).toBe(200)
		const body = (await res.json()) as {
			plan: string
			status: string
			screenshotsPerMonth: number
		}
		expect(body.plan).toBe('scale')
		expect(body.status).toBe('active')
		expect(body.screenshotsPerMonth).toBe(999999)
	})
})

// ─── Usage API ──────────────────────────────────────────────────────

describe('Usage API', () => {
	it('GET /api/v1/usage returns screenshot log', async () => {
		const res = await apiGet('/api/v1/usage?limit=10')
		expect(res.status).toBe(200)
		const body = await res.json()
		expect(Array.isArray(body)).toBe(true)
	})

	it('GET /api/v1/usage/stats returns aggregated stats', async () => {
		const res = await apiGet('/api/v1/usage/stats')
		expect(res.status).toBe(200)
		const body = (await res.json()) as {
			totalScreenshots: number
			last30Days: number
			failedScreenshots: number
			avgDurationMs: number
		}
		expect(typeof body.totalScreenshots).toBe('number')
		expect(typeof body.last30Days).toBe('number')
		expect(typeof body.failedScreenshots).toBe('number')
		expect(typeof body.avgDurationMs).toBe('number')
	})
})

// ─── User API ───────────────────────────────────────────────────────

describe('User API', () => {
	it('GET /api/v1/user/me returns E2E test user profile', async () => {
		const res = await apiGet('/api/v1/user/me')
		expect(res.status).toBe(200)
		const body = (await res.json()) as {
			id: string
			email: string
			balance: number
			subscription: { plan: string }
		}
		expect(body.id).toBeDefined()
		expect(body.email).toContain('e2e-test')
		expect(typeof body.balance).toBe('number')
		expect(body.subscription).toBeDefined()
		expect(body.subscription.plan).toBe('scale')
	})
})

// ─── API Key Management ─────────────────────────────────────────────

describe('API Key Management', () => {
	let createdKeyId: string | null = null

	it('POST /api/v1/api-keys creates a new key', async () => {
		const res = await apiPost('/api/v1/api-keys', {
			name: 'E2E Smoke Test Key'
		})
		expect(res.status).toBe(200)
		const body = (await res.json()) as {
			id: string
			key: string
			name: string
		}
		expect(body.id).toBeDefined()
		expect(body.key).toMatch(/^sk_live_/)
		expect(body.name).toBe('E2E Smoke Test Key')
		createdKeyId = body.id
	})

	it('GET /api/v1/api-keys lists keys including the new one', async () => {
		const res = await apiGet('/api/v1/api-keys')
		expect(res.status).toBe(200)
		const body = (await res.json()) as Array<{ id: string }>
		expect(Array.isArray(body)).toBe(true)

		if (createdKeyId) {
			const found = body.find(k => k.id === createdKeyId)
			expect(found).toBeTruthy()
		}
	})

	it('DELETE /api/v1/api-keys/:id revokes the key', async () => {
		if (!createdKeyId) return
		const res = await apiDelete(`/api/v1/api-keys/${createdKeyId}`)
		expect(res.status).toBe(200)
		const body = (await res.json()) as { success: boolean }
		expect(body.success).toBe(true)
	})

	it('GET /api/v1/api-keys no longer includes the revoked key', async () => {
		if (!createdKeyId) return
		const res = await apiGet('/api/v1/api-keys')
		expect(res.status).toBe(200)
		const body = (await res.json()) as Array<{ id: string }>
		const found = body.find(k => k.id === createdKeyId)
		expect(found).toBeFalsy()
	})

	afterAll(() => {
		createdKeyId = null
	})
})

// ─── Webhook Endpoint Management ────────────────────────────────────

describe('Webhook Endpoint Management', () => {
	let createdEndpointId: string | null = null

	it('POST /api/v1/webhooks creates an endpoint', async () => {
		const res = await apiPost('/api/v1/webhooks', {
			url: 'https://httpbin.org/post',
			events: ['screenshot.completed']
		})
		expect(res.status).toBe(200)
		const body = (await res.json()) as {
			id: string
			secret: string
			url: string
			events: string[]
		}
		expect(body.id).toBeDefined()
		expect(body.secret).toBeDefined()
		expect(body.url).toBe('https://httpbin.org/post')
		expect(body.events).toContain('screenshot.completed')
		createdEndpointId = body.id
	})

	it('GET /api/v1/webhooks lists endpoints', async () => {
		const res = await apiGet('/api/v1/webhooks')
		expect(res.status).toBe(200)
		const body = (await res.json()) as Array<{ id: string }>
		expect(Array.isArray(body)).toBe(true)

		if (createdEndpointId) {
			const found = body.find(e => e.id === createdEndpointId)
			expect(found).toBeTruthy()
		}
	})

	it('DELETE /api/v1/webhooks/:id removes the endpoint', async () => {
		if (!createdEndpointId) return
		const res = await apiDelete(`/api/v1/webhooks/${createdEndpointId}`)
		expect(res.status).toBe(200)
		const body = (await res.json()) as { success: boolean }
		expect(body.success).toBe(true)
	})

	afterAll(() => {
		createdEndpointId = null
	})
})

// ─── Error handling ─────────────────────────────────────────────────

describe('Error handling', () => {
	it('Screenshot with unreachable URL returns 500 with structured error', async () => {
		const params = new URLSearchParams({
			url: 'https://this-domain-does-not-exist-e2e-smoke.invalid'
		})
		const res = await apiGet(`/api/v1/screenshot?${params}`)
		expect(res.status).toBe(500)

		const body = (await res.json()) as {
			error: string
			message: string
		}
		expect(body.error).toBeDefined()
		expect(body.message).toBeDefined()
	}, 60_000)
})
