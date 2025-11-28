"use client"

import useSWR from "swr"
import { apiClient } from "@/lib/api-client"
import type { AuthSession } from "@/lib/types"

const fetcher = async (): Promise<AuthSession> => {
  const response = await apiClient.getCurrentUser()

  if (!response.success || !response.data) {
    return { user: null, isAuthenticated: false }
  }

  return {
    user: response.data.user,
    isAuthenticated: !!response.data.user,
  }
}

export function useAuth() {
  const { data, error, isLoading, mutate } = useSWR<AuthSession>("/api/auth/me", fetcher, {
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    fallbackData: { user: null, isAuthenticated: false },
  })

  return {
    user: data?.user || null,
    isAuthenticated: data?.isAuthenticated || false,
    isLoading,
    error,
    refresh: () => mutate(),
  }
}
