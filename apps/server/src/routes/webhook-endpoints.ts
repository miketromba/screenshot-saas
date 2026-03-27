import { Elysia, t } from 'elysia'
import { sessionAuth } from '../middleware/session-auth'
import {
	createWebhookEndpoint,
	deleteWebhookEndpoint,
	listWebhookEndpoints
} from '../services/webhook'

export const webhookEndpointRoutes = new Elysia({
	name: 'webhook-endpoint-routes',
	prefix: '/webhooks'
})
	.use(sessionAuth)
	.get('/', async ({ user }) => {
		return listWebhookEndpoints(user.id)
	})
	.post(
		'/',
		async ({ body, user }) => {
			const endpoint = await createWebhookEndpoint({
				userId: user.id,
				url: body.url,
				events: body.events
			})
			return {
				id: endpoint.id,
				url: endpoint.url,
				secret: endpoint.secret,
				events: endpoint.events,
				createdAt: endpoint.createdAt
			}
		},
		{
			body: t.Object({
				url: t.String({ format: 'uri' }),
				events: t.Array(t.String())
			})
		}
	)
	.delete(
		'/:id',
		async ({ params, user, set }) => {
			const deleted = await deleteWebhookEndpoint({
				userId: user.id,
				endpointId: params.id
			})
			if (!deleted) {
				set.status = 404
				return { error: 'Webhook endpoint not found' }
			}
			return { success: true }
		},
		{
			params: t.Object({
				id: t.String()
			})
		}
	)
