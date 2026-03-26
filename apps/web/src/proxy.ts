import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function proxy(request: NextRequest) {
	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
	const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

	if (!supabaseUrl || !supabaseKey) {
		return NextResponse.next({ request })
	}

	let response = NextResponse.next({ request })

	const supabase = createServerClient(supabaseUrl, supabaseKey, {
		cookies: {
			getAll() {
				return request.cookies.getAll()
			},
			setAll(cookiesToSet) {
				for (const { name, value } of cookiesToSet) {
					request.cookies.set(name, value)
				}
				response = NextResponse.next({ request })
				for (const { name, value, options } of cookiesToSet) {
					response.cookies.set(name, value, options)
				}
			}
		}
	})

	const {
		data: { user }
	} = await supabase.auth.getUser()

	if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
		const url = request.nextUrl.clone()
		url.pathname = '/sign-in'
		url.searchParams.set('redirect', request.nextUrl.pathname)
		return NextResponse.redirect(url)
	}

	if (
		user &&
		(request.nextUrl.pathname === '/sign-in' ||
			request.nextUrl.pathname === '/sign-up')
	) {
		const url = request.nextUrl.clone()
		url.pathname = '/dashboard'
		return NextResponse.redirect(url)
	}

	return response
}

export const config = {
	matcher: ['/dashboard/:path*', '/sign-in', '/sign-up']
}
