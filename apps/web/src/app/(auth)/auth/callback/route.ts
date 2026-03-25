import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
	const { searchParams, origin } = new URL(request.url)
	const code = searchParams.get('code')
	const redirect = searchParams.get('redirect') ?? '/dashboard'

	if (code) {
		const supabase = await createClient()
		const { error } = await supabase.auth.exchangeCodeForSession(code)

		if (!error) {
			const forwardedHost = request.headers.get('x-forwarded-host')
			const isLocalEnv = process.env.NODE_ENV === 'development'

			if (isLocalEnv) {
				return NextResponse.redirect(`${origin}${redirect}`)
			}
			if (forwardedHost) {
				return NextResponse.redirect(
					`https://${forwardedHost}${redirect}`
				)
			}
			return NextResponse.redirect(`${origin}${redirect}`)
		}
	}

	return NextResponse.redirect(`${origin}/sign-in?error=auth_failed`)
}
