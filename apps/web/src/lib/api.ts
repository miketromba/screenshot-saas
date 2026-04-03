import { treaty } from '@elysiajs/eden'
import type { App } from '@screenshot-saas/server/app'

const baseUrl =
	typeof window !== 'undefined'
		? window.location.origin
		: (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000')

// @ts-expect-error — elysia type mismatch under bun isolated linker (hoisted is fine)
export const api = treaty<App>(baseUrl).api
