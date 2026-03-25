import { Elysia } from 'elysia'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL!,
	process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const authGuard = new Elysia({ name: 'auth-guard' }).derive(
	async ({ headers, set }) => {
		const token = headers.authorization?.replace('Bearer ', '')

		if (!token) {
			set.status = 401
			throw new Error('Missing authorization token')
		}

		const {
			data: { user },
			error
		} = await supabase.auth.getUser(token)

		if (error || !user) {
			set.status = 401
			throw new Error('Invalid or expired token')
		}

		return { user }
	}
)
