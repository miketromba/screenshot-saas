import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

function unwrap<T>(res: { data: unknown; error: unknown }): T {
	if (res.error) throw res.error
	return res.data as T
}

export function useUser() {
	return useQuery({
		queryKey: ['user'],
		queryFn: async () =>
			unwrap<{
				id: string
				email: string
				displayName: string | null
				balance: number
				autoTopup: {
					enabled: boolean
					threshold: number
					packId: string | null
				} | null
				createdAt: string | null
			}>(await api.v1.user.me.get())
	})
}

export function useApiKeys() {
	return useQuery({
		queryKey: ['api-keys'],
		queryFn: async () =>
			unwrap<
				{
					id: string
					name: string
					keyPrefix: string
					lastUsedAt: string | null
					createdAt: string
				}[]
			>(await api.v1['api-keys'].get())
	})
}

export function useCreateApiKey() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (name: string) =>
			unwrap<{
				id: string
				name: string
				key: string
				keyPrefix: string
				createdAt: string
			}>(await api.v1['api-keys'].post({ name })),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['api-keys'] })
			queryClient.invalidateQueries({ queryKey: ['user'] })
		}
	})
}

export function useRevokeApiKey() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (id: string) =>
			unwrap<{ success: boolean }>(
				await api.v1['api-keys']({ id }).delete()
			),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['api-keys'] })
		}
	})
}

export function useCredits() {
	return useQuery({
		queryKey: ['credits'],
		queryFn: async () =>
			unwrap<{ balance: number }>(await api.v1.credits.get())
	})
}

export function useCreditPacks() {
	return useQuery({
		queryKey: ['credit-packs'],
		queryFn: async () =>
			unwrap<
				{
					id: string
					name: string
					credits: number
					priceCents: number
					isPopular: boolean | null
				}[]
			>(await api.v1.credits.packs.get())
	})
}

export function useTransactions({
	limit = 50,
	offset = 0
}: {
	limit?: number
	offset?: number
} = {}) {
	return useQuery({
		queryKey: ['transactions', limit, offset],
		queryFn: async () =>
			unwrap<
				{
					id: string
					userId: string
					amount: number
					type: string
					description: string | null
					referenceId: string | null
					createdAt: string
				}[]
			>(
				await api.v1.credits.transactions.get({
					query: { limit: String(limit), offset: String(offset) }
				})
			)
	})
}

export function usePurchaseCredits() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (packId: string) =>
			unwrap<{ checkoutUrl: string | null }>(
				await api.v1.credits.purchase.post({ packId })
			),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['credits'] })
			queryClient.invalidateQueries({ queryKey: ['user'] })
			queryClient.invalidateQueries({ queryKey: ['transactions'] })
		}
	})
}

export function useUsageLogs({
	limit = 50,
	offset = 0
}: {
	limit?: number
	offset?: number
} = {}) {
	return useQuery({
		queryKey: ['usage-logs', limit, offset],
		queryFn: async () =>
			unwrap<
				{
					id: string
					url: string
					status: string
					durationMs: number | null
					errorMessage: string | null
					createdAt: string
				}[]
			>(
				await api.v1.usage.get({
					query: { limit: String(limit), offset: String(offset) }
				})
			)
	})
}

export function useUsageStats() {
	return useQuery({
		queryKey: ['usage-stats'],
		queryFn: async () =>
			unwrap<{
				totalScreenshots: number
				last30Days: number
				failedScreenshots: number
				avgDurationMs: number
			}>(await api.v1.usage.stats.get())
	})
}

export function useAutoTopup() {
	return useQuery({
		queryKey: ['auto-topup'],
		queryFn: async () =>
			unwrap<{
				enabled: boolean
				threshold: number
				packId: string | null
				hasPaymentMethod: boolean
			}>(await api.v1['auto-topup'].get())
	})
}

export function useUpdateAutoTopup() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (body: {
			enabled: boolean
			threshold?: number
			packId?: string
		}) =>
			unwrap<{ success: boolean }>(await api.v1['auto-topup'].put(body)),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['auto-topup'] })
			queryClient.invalidateQueries({ queryKey: ['user'] })
		}
	})
}

export function useInitializeCredits() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async () =>
			unwrap<{ balance: number }>(
				await api.v1.credits.initialize.post({})
			),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['credits'] })
			queryClient.invalidateQueries({ queryKey: ['user'] })
		}
	})
}
