import { createServerClient } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'
import { Elysia } from 'elysia'
import { resolveE2EAuth } from '../services/e2e'

function createSupabaseFromRequest(request: Request) {
	const cookieHeader = request.headers.get('cookie') ?? ''
	return createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return cookieHeader
						.split(';')
						.map(c => {
							const [name, ...rest] = c.trim().split('=')
							return { name: name ?? '', value: rest.join('=') }
						})
						.filter(c => c.name)
				},
				setAll() {}
			}
		}
	)
}

export const sessionAuth = new Elysia({ name: 'session-auth' })
	.derive({ as: 'scoped' }, async ({ request }) => {
		const e2e = await resolveE2EAuth(request)
		if (e2e) {
			return {
				user: {
					id: e2e.userId,
					email: e2e.email,
					app_metadata: {},
					user_metadata: {},
					aud: 'authenticated',
					created_at: new Date().toISOString()
				} as User,
				supabase: null as unknown as ReturnType<
					typeof createServerClient
				>
			}
		}

		const supabase = createSupabaseFromRequest(request)
		const {
			data: { user }
		} = await supabase.auth.getUser()
		if (!user) throw new Error('UNAUTHORIZED')
		return { user, supabase }
	})
	.onError({ as: 'scoped' }, ({ error: err, set }) => {
		if (!(err instanceof Error)) return
		if (err.message === 'UNAUTHORIZED') {
			set.status = 401
			return { error: 'Unauthorized' }
		}
	})
