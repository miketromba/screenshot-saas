import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { authGuard } from './middleware/auth'

export const app = new Elysia({ prefix: '/api' })
	.use(cors())
	.get('/health', () => ({ status: 'ok', uptime: process.uptime() }))

export type App = typeof app
