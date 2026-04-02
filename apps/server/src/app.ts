import { cors } from '@elysiajs/cors'
import { Elysia } from 'elysia'
import { apiKeyRoutes } from './routes/api-keys'
import { creditRoutes } from './routes/credits'
import { playgroundRoutes } from './routes/playground'
import { screenshotRoutes } from './routes/screenshot'
import { subscriptionRoutes } from './routes/subscription'
import { usageRoutes } from './routes/usage'
import { userRoutes } from './routes/user'
import { webhookEndpointRoutes } from './routes/webhook-endpoints'
import { webhookRoutes } from './routes/webhooks'
import { cleanExpiredCache } from './services/cache'

export const app = new Elysia({ prefix: '/api' })
	.use(cors())
	.get('/health', () => ({
		status: 'ok',
		timestamp: new Date().toISOString()
	}))
	.post('/cache/cleanup', async ({ set, request }) => {
		const secret = process.env.CACHE_CLEANUP_SECRET
		const token = request.headers
			.get('authorization')
			?.replace('Bearer ', '')
		if (!secret || token !== secret) {
			set.status = 401
			return { error: 'Unauthorized' }
		}

		const deleted = await cleanExpiredCache()
		return { deleted, timestamp: new Date().toISOString() }
	})
	.group('/v1', app =>
		app
			.use(screenshotRoutes)
			.use(apiKeyRoutes)
			.use(creditRoutes)
			.use(subscriptionRoutes)
			.use(usageRoutes)
			.use(userRoutes)
			.use(playgroundRoutes)
			.use(webhookEndpointRoutes)
	)
	.use(webhookRoutes)

export type App = typeof app
