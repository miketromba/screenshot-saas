import { NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function GET(request: Request) {
	const authHeader = request.headers.get('authorization')
	if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	const cleanupSecret = process.env.CACHE_CLEANUP_SECRET
	if (!cleanupSecret) {
		return NextResponse.json(
			{ error: 'CACHE_CLEANUP_SECRET not configured' },
			{ status: 500 }
		)
	}

	const response = await fetch(`${API_URL}/api/cache/cleanup`, {
		method: 'POST',
		headers: {
			authorization: `Bearer ${cleanupSecret}`
		}
	})

	const body = await response.json()

	return NextResponse.json(body, { status: response.status })
}
