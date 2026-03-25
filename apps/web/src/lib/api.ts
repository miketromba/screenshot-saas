import { treaty } from '@elysiajs/eden'
import type { App } from '@screenshot-saas/server/app'

const baseUrl =
	typeof window !== 'undefined'
		? window.location.origin
		: (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000')

// @ts-expect-error — elysia type mismatch due to bun monorepo dual resolution
export const api = treaty<App>(baseUrl).api
