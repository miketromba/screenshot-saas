import { cors } from '@elysiajs/cors'
import { Elysia } from 'elysia'
import { apiKeyRoutes } from './routes/api-keys'
import { autoTopupRoutes } from './routes/auto-topup'
import { creditRoutes } from './routes/credits'
import { screenshotRoutes } from './routes/screenshot'
import { usageRoutes } from './routes/usage'
import { userRoutes } from './routes/user'
import { webhookRoutes } from './routes/webhooks'

export const app = new Elysia({ prefix: '/api' })
	.use(cors())
	.get('/health', () => ({
		status: 'ok',
		timestamp: new Date().toISOString()
	}))
	.group('/v1', app =>
		app
			.use(screenshotRoutes)
			.use(apiKeyRoutes)
			.use(creditRoutes)
			.use(usageRoutes)
			.use(userRoutes)
			.use(autoTopupRoutes)
	)
	.use(webhookRoutes)

export type App = typeof app
