import { createHmac, randomBytes } from 'node:crypto'
import { and, db, eq, schema, sql } from '@screenshot-saas/db'

function signPayload(payload: string, secret: string): string {
	return createHmac('sha256', secret).update(payload).digest('hex')
}

function truncateResponse(text: string): string {
	return text.length > 1000 ? text.slice(0, 1000) : text
}

export async function createWebhookEndpoint({
	userId,
	url,
	events
}: {
	userId: string
	url: string
	events: string[]
}) {
	const secret = randomBytes(32).toString('hex')
	const [row] = await db
		.insert(schema.webhookEndpoints)
		.values({
			userId,
			url,
			secret,
			events,
			isActive: true
		})
		.returning()

	if (!row) {
		throw new Error('Failed to create webhook endpoint')
	}
	return row
}

export async function listWebhookEndpoints(userId: string) {
	return db
		.select({
			id: schema.webhookEndpoints.id,
			userId: schema.webhookEndpoints.userId,
			url: schema.webhookEndpoints.url,
			events: schema.webhookEndpoints.events,
			isActive: schema.webhookEndpoints.isActive,
			createdAt: schema.webhookEndpoints.createdAt,
			updatedAt: schema.webhookEndpoints.updatedAt
		})
		.from(schema.webhookEndpoints)
		.where(
			and(
				eq(schema.webhookEndpoints.userId, userId),
				eq(schema.webhookEndpoints.isActive, true)
			)
		)
}

export async function deleteWebhookEndpoint({
	userId,
	endpointId
}: {
	userId: string
	endpointId: string
}): Promise<boolean> {
	const result = await db
		.update(schema.webhookEndpoints)
		.set({ isActive: false, updatedAt: new Date() })
		.where(
			and(
				eq(schema.webhookEndpoints.id, endpointId),
				eq(schema.webhookEndpoints.userId, userId)
			)
		)
		.returning({ id: schema.webhookEndpoints.id })

	return result.length > 0
}

export async function deliverWebhook({
	endpointId,
	event,
	payload
}: {
	endpointId: string
	event: string
	payload: unknown
}): Promise<void> {
	try {
		const [endpoint] = await db
			.select()
			.from(schema.webhookEndpoints)
			.where(eq(schema.webhookEndpoints.id, endpointId))
			.limit(1)

		if (!endpoint) {
			return
		}

		const bodyObj = {
			event,
			data: payload,
			timestamp: new Date().toISOString()
		}
		const bodyString = JSON.stringify(bodyObj)
		const signature = signPayload(bodyString, endpoint.secret)

		const [delivery] = await db
			.insert(schema.webhookDeliveries)
			.values({
				endpointId,
				event,
				payload,
				attempts: 1
			})
			.returning({ id: schema.webhookDeliveries.id })

		if (!delivery) {
			return
		}

		let statusCode: number | null = null
		let responseText: string

		try {
			const res = await fetch(endpoint.url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-webhook-signature': signature
				},
				body: bodyString
			})
			statusCode = res.status
			responseText = truncateResponse(await res.text())
		} catch (err) {
			responseText = truncateResponse(
				err instanceof Error ? err.message : String(err)
			)
		}

		await db
			.update(schema.webhookDeliveries)
			.set({
				statusCode,
				response: responseText,
				deliveredAt: new Date()
			})
			.where(eq(schema.webhookDeliveries.id, delivery.id))
	} catch {
		// fire-and-forget: never throw
	}
}

export async function dispatchWebhookEvent({
	userId,
	event,
	payload
}: {
	userId: string
	event: string
	payload: unknown
}): Promise<void> {
	const endpoints = await db
		.select({ id: schema.webhookEndpoints.id })
		.from(schema.webhookEndpoints)
		.where(
			and(
				eq(schema.webhookEndpoints.userId, userId),
				eq(schema.webhookEndpoints.isActive, true),
				sql`${schema.webhookEndpoints.events}::jsonb @> ${JSON.stringify([event])}::jsonb`
			)
		)

	await Promise.allSettled(
		endpoints.map(ep =>
			deliverWebhook({ endpointId: ep.id, event, payload })
		)
	)
}
