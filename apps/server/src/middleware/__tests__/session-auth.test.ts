import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { Elysia } from 'elysia'

const mockGetUser = mock(() =>
	Promise.resolve({
		data: {
			user: {
				id: 'user-uuid-1',
				email: 'test@example.com',
				aud: 'authenticated'
			}
		},
		error: null
	})
)

const mockCreateServerClient = mock(
	(_url: string, _key: string, _opts: unknown) => ({
		auth: { getUser: mockGetUser }
	})
)

mock.module('@supabase/ssr', () => ({
	createServerClient: mockCreateServerClient
}))

const _originalEnv = { ...process.env }

const { sessionAuth } = await import('../session-auth')

function createApp() {
	return new Elysia().use(sessionAuth).get('/protected', ({ user }) => ({
		ok: true,
		userId: user.id,
		email: user.email
	}))
}

describe('sessionAuth middleware', () => {
	beforeEach(() => {
		mockGetUser.mockReset()
		mockCreateServerClient.mockReset()

		process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

		mockCreateServerClient.mockReturnValue({
			auth: { getUser: mockGetUser }
		})
		mockGetUser.mockReturnValue(
			Promise.resolve({
				data: {
					user: {
						id: 'user-uuid-1',
						email: 'test@example.com',
						aud: 'authenticated'
					}
				},
				error: null
			})
		)
	})

	it('returns 401 when no cookie is present (getUser returns null)', async () => {
		mockGetUser.mockReturnValue(
			Promise.resolve({ data: { user: null }, error: null })
		)
		const app = createApp()
		const res = await app.handle(new Request('http://localhost/protected'))
		expect(res.status).toBe(401)
		const body = await res.json()
		expect(body.error).toBe('Unauthorized')
	})

	it('returns 401 when session is invalid', async () => {
		mockGetUser.mockReturnValue(
			Promise.resolve({
				data: { user: null },
				error: { message: 'Invalid session' }
			})
		)
		const app = createApp()
		const res = await app.handle(
			new Request('http://localhost/protected', {
				headers: { cookie: 'sb-token=invalid-token' }
			})
		)
		expect(res.status).toBe(401)
		const body = await res.json()
		expect(body.error).toBe('Unauthorized')
	})

	it('succeeds with valid session and returns user data', async () => {
		const app = createApp()
		const res = await app.handle(
			new Request('http://localhost/protected', {
				headers: { cookie: 'sb-token=valid-session-token' }
			})
		)
		expect(res.status).toBe(200)
		const body = await res.json()
		expect(body.ok).toBe(true)
		expect(body.userId).toBe('user-uuid-1')
		expect(body.email).toBe('test@example.com')
	})

	it('passes cookie data to createServerClient', async () => {
		const app = createApp()
		await app.handle(
			new Request('http://localhost/protected', {
				headers: { cookie: 'sb-token=abc123; other=val' }
			})
		)
		expect(mockCreateServerClient).toHaveBeenCalledWith(
			expect.any(String),
			expect.any(String),
			expect.objectContaining({
				cookies: expect.objectContaining({
					getAll: expect.any(Function),
					setAll: expect.any(Function)
				})
			})
		)
	})

	it('calls getUser exactly once per request', async () => {
		const app = createApp()
		await app.handle(
			new Request('http://localhost/protected', {
				headers: { cookie: 'sb-token=valid' }
			})
		)
		expect(mockGetUser).toHaveBeenCalledTimes(1)
	})

	it('provides supabase client in context on success', async () => {
		let capturedSupabase: unknown = null
		const app = new Elysia().use(sessionAuth).get('/protected', ctx => {
			capturedSupabase = ctx.supabase
			return { ok: true }
		})

		await app.handle(
			new Request('http://localhost/protected', {
				headers: { cookie: 'sb-token=valid' }
			})
		)
		expect(capturedSupabase).toBeDefined()
		expect(capturedSupabase).toHaveProperty('auth')
	})
})
