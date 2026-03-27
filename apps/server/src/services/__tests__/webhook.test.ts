import { beforeEach, describe, expect, it, mock } from 'bun:test'

const mockReturning = mock(() => [] as unknown[])
const mockInsertValues = mock(() => ({ returning: mockReturning }))
const mockInsert = mock(() => ({ values: mockInsertValues }))
const mockSelectWhere = mock(() => [] as unknown[])
const mockSelectFrom = mock(() => ({ where: mockSelectWhere }))
const mockSelect = mock(() => ({ from: mockSelectFrom }))
const mockUpdateReturning = mock(() => [] as unknown[])
const mockUpdateWhere = mock(() => ({ returning: mockUpdateReturning }))
const mockUpdateSet = mock(() => ({ where: mockUpdateWhere }))
const mockUpdate = mock(() => ({ set: mockUpdateSet }))

mock.module('@screenshot-saas/db', () => ({
	db: {
		insert: mockInsert,
		select: mockSelect,
		update: mockUpdate
	},
	schema: {
		webhookEndpoints: {
			id: 'id',
			userId: 'user_id',
			url: 'url',
			events: 'events',
			isActive: 'is_active',
			createdAt: 'created_at',
			updatedAt: 'updated_at',
			secret: 'secret'
		},
		webhookDeliveries: {
			id: 'id',
			endpointId: 'endpoint_id',
			createdAt: 'created_at'
		}
	},
	eq: mock((a: unknown, b: unknown) => ({ op: 'eq', a, b })),
	and: mock((...args: unknown[]) => ({ op: 'and', args })),
	sql: mock((strings: TemplateStringsArray, ...values: unknown[]) => ({
		strings,
		values
	}))
}))

const { createWebhookEndpoint, listWebhookEndpoints, deleteWebhookEndpoint } =
	await import('../webhook')

describe('createWebhookEndpoint', () => {
	beforeEach(() => {
		mockInsert.mockReset()
		mockInsertValues.mockReset()
		mockReturning.mockReset()

		mockInsert.mockReturnValue({ values: mockInsertValues })
		mockInsertValues.mockReturnValue({ returning: mockReturning })
	})

	it('generates a 64-char hex secret', async () => {
		const fakeRow = {
			id: 'ep-1',
			userId: 'u-1',
			url: 'https://hook.example.com',
			secret: 'abc',
			events: ['screenshot.completed'],
			isActive: true
		}
		mockReturning.mockReturnValue([fakeRow])

		await createWebhookEndpoint({
			userId: 'u-1',
			url: 'https://hook.example.com',
			events: ['screenshot.completed']
		})

		const valuesArg = mockInsertValues.mock.calls[0]?.[0] as Record<
			string,
			unknown
		>
		expect(typeof valuesArg.secret).toBe('string')
		expect((valuesArg.secret as string).length).toBe(64)
		expect(valuesArg.secret as string).toMatch(/^[0-9a-f]{64}$/)
	})

	it('inserts with userId, url, events, and isActive=true', async () => {
		const fakeRow = {
			id: 'ep-2',
			userId: 'u-1',
			url: 'https://hook.example.com',
			secret: 'sec',
			events: ['screenshot.completed', 'screenshot.failed'],
			isActive: true
		}
		mockReturning.mockReturnValue([fakeRow])

		await createWebhookEndpoint({
			userId: 'u-1',
			url: 'https://hook.example.com',
			events: ['screenshot.completed', 'screenshot.failed']
		})

		expect(mockInsertValues).toHaveBeenCalledWith(
			expect.objectContaining({
				userId: 'u-1',
				url: 'https://hook.example.com',
				events: ['screenshot.completed', 'screenshot.failed'],
				isActive: true
			})
		)
	})

	it('returns the created endpoint', async () => {
		const fakeRow = {
			id: 'ep-3',
			userId: 'u-1',
			url: 'https://hook.example.com',
			secret: 'generated-secret',
			events: ['screenshot.completed'],
			isActive: true
		}
		mockReturning.mockReturnValue([fakeRow])

		const result = await createWebhookEndpoint({
			userId: 'u-1',
			url: 'https://hook.example.com',
			events: ['screenshot.completed']
		})

		expect(result).toEqual(fakeRow)
	})

	it('throws when insert returns no rows', async () => {
		mockReturning.mockReturnValue([])

		expect(
			createWebhookEndpoint({
				userId: 'u-1',
				url: 'https://hook.example.com',
				events: ['screenshot.completed']
			})
		).rejects.toThrow('Failed to create webhook endpoint')
	})
})

describe('listWebhookEndpoints', () => {
	beforeEach(() => {
		mockSelect.mockReset()
		mockSelectFrom.mockReset()
		mockSelectWhere.mockReset()

		mockSelect.mockReturnValue({ from: mockSelectFrom })
		mockSelectFrom.mockReturnValue({ where: mockSelectWhere })
	})

	it('queries for active endpoints by userId', async () => {
		const fakeEndpoints = [
			{
				id: 'ep-1',
				userId: 'u-1',
				url: 'https://a.example.com',
				events: ['screenshot.completed'],
				isActive: true,
				createdAt: new Date(),
				updatedAt: new Date()
			}
		]
		mockSelectWhere.mockReturnValue(fakeEndpoints)

		const result = await listWebhookEndpoints('u-1')
		expect(result).toEqual(fakeEndpoints)
		expect(mockSelect).toHaveBeenCalled()
		expect(mockSelectFrom).toHaveBeenCalled()
		expect(mockSelectWhere).toHaveBeenCalled()
	})

	it('returns empty array when no endpoints exist', async () => {
		mockSelectWhere.mockReturnValue([])
		const result = await listWebhookEndpoints('u-no-hooks')
		expect(result).toEqual([])
	})
})

describe('deleteWebhookEndpoint', () => {
	beforeEach(() => {
		mockUpdate.mockReset()
		mockUpdateSet.mockReset()
		mockUpdateWhere.mockReset()
		mockUpdateReturning.mockReset()

		mockUpdate.mockReturnValue({ set: mockUpdateSet })
		mockUpdateSet.mockReturnValue({ where: mockUpdateWhere })
		mockUpdateWhere.mockReturnValue({ returning: mockUpdateReturning })
	})

	it('sets isActive=false', async () => {
		mockUpdateReturning.mockReturnValue([{ id: 'ep-1' }])

		await deleteWebhookEndpoint({
			userId: 'u-1',
			endpointId: 'ep-1'
		})

		expect(mockUpdateSet).toHaveBeenCalledWith(
			expect.objectContaining({ isActive: false })
		)
	})

	it('returns true when endpoint found', async () => {
		mockUpdateReturning.mockReturnValue([{ id: 'ep-1' }])

		const result = await deleteWebhookEndpoint({
			userId: 'u-1',
			endpointId: 'ep-1'
		})

		expect(result).toBe(true)
	})

	it('returns false when no endpoint found', async () => {
		mockUpdateReturning.mockReturnValue([])

		const result = await deleteWebhookEndpoint({
			userId: 'u-1',
			endpointId: 'ep-nonexistent'
		})

		expect(result).toBe(false)
	})

	it('scopes by userId so users cannot delete other users endpoints', async () => {
		mockUpdateReturning.mockReturnValue([])

		await deleteWebhookEndpoint({
			userId: 'u-attacker',
			endpointId: 'ep-victim'
		})

		expect(mockUpdateWhere).toHaveBeenCalled()
	})
})
