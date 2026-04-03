import { treaty } from '@elysiajs/eden'
import type { App } from '@screenshot-saas/server/app'

const baseUrl =
	typeof window !== 'undefined'
		? window.location.origin
		: (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000')

// biome-ignore lint/suspicious/noTsIgnore: must use @ts-ignore; type error only exists under bun isolated linker, not hoisted
// @ts-ignore
export const api = treaty<App>(baseUrl).api
