"use client"

import useSWR from "swr"
import { useCallback, useState } from "react"
import { apiClient } from "@/lib/api-client"
import type { Item, CreateItemInput, PaginatedResponse } from "@/lib/types"

// Local storage key for offline/fallback storage
const STORAGE_KEY = "mindo-items"

// Fetcher function for SWR
const fetcher = async (key: string): Promise<PaginatedResponse<Item>> => {
  const params = new URLSearchParams(key.split("?")[1] || "")
  const page = Number.parseInt(params.get("page") || "1")
  const pageSize = Number.parseInt(params.get("pageSize") || "10")
  const search = params.get("search") || undefined

  const response = await apiClient.getItems(page, pageSize, search)

  if (!response.success || !response.data) {
    // Fallback to local storage if API fails
    return getLocalItems(page, pageSize, search)
  }

  return response.data
}

// Helper to get items from local storage as fallback
function getLocalItems(page: number, pageSize: number, search?: string): PaginatedResponse<Item> {
  if (typeof window === "undefined") {
    return {
      data: [],
      pagination: { page, pageSize, totalItems: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
    }
  }

  const stored = localStorage.getItem(STORAGE_KEY)
  let items: Item[] = []

  if (stored) {
    try {
      items = JSON.parse(stored).map((item: Item) => ({
        ...item,
        createdAt: new Date(item.createdAt),
      }))
    } catch (e) {
      console.error("Failed to parse stored items:", e)
    }
  }

  // Filter by search
  if (search) {
    const lowerSearch = search.toLowerCase()
    items = items.filter(
      (item) => item.name.toLowerCase().includes(lowerSearch) || item.location.toLowerCase().includes(lowerSearch),
    )
  }

  // Paginate
  const totalItems = items.length
  const totalPages = Math.ceil(totalItems / pageSize)
  const start = (page - 1) * pageSize
  const paginatedItems = items.slice(start, start + pageSize)

  return {
    data: paginatedItems,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  }
}

// Save item to local storage (for offline support)
function saveToLocalStorage(item: Item) {
  if (typeof window === "undefined") return

  const stored = localStorage.getItem(STORAGE_KEY)
  let items: Item[] = []

  if (stored) {
    try {
      items = JSON.parse(stored)
    } catch (e) {
      console.error("Failed to parse stored items:", e)
    }
  }

  items.unshift(item)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

// Remove item from local storage
function removeFromLocalStorage(id: string) {
  if (typeof window === "undefined") return

  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return

  try {
    const items: Item[] = JSON.parse(stored)
    const filtered = items.filter((item) => item.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  } catch (e) {
    console.error("Failed to update stored items:", e)
  }
}

export function useItems(options: { page?: number; pageSize?: number; search?: string } = {}) {
  const { page = 1, pageSize = 10, search } = options
  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  // Build the SWR key
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  })
  if (search) params.append("search", search)
  const swrKey = `/api/items?${params}`

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Item>>(swrKey, fetcher, {
    // Use local storage data as fallback while loading
    fallbackData: typeof window !== "undefined" ? getLocalItems(page, pageSize, search) : undefined,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  })

  const addItem = useCallback(
    async (input: CreateItemInput) => {
      setIsCreating(true)
      try {
        // Optimistic update
        const tempItem: Item = {
          id: crypto.randomUUID(),
          ...input,
          createdAt: new Date(),
        }

        // Save to local storage immediately
        saveToLocalStorage(tempItem)

        // Optimistically update the SWR cache
        mutate((current) => {
          if (!current) return current
          return {
            ...current,
            data: [tempItem, ...current.data],
            pagination: {
              ...current.pagination,
              totalItems: current.pagination.totalItems + 1,
            },
          }
        }, false)

        // Call API (will fail gracefully in offline mode)
        const response = await apiClient.createItem(input)

        if (response.success && response.data) {
          // Update local storage with real ID if API succeeds
          removeFromLocalStorage(tempItem.id)
          saveToLocalStorage(response.data)
        }

        // Revalidate to sync with server
        mutate()

        return { success: true, item: response.data || tempItem }
      } catch (error) {
        console.error("Failed to add item:", error)
        return { success: false, error: "Failed to add item" }
      } finally {
        setIsCreating(false)
      }
    },
    [mutate],
  )

  const removeItem = useCallback(
    async (id: string) => {
      setIsDeleting(id)
      try {
        // Optimistically remove from UI
        mutate((current) => {
          if (!current) return current
          return {
            ...current,
            data: current.data.filter((item) => item.id !== id),
            pagination: {
              ...current.pagination,
              totalItems: current.pagination.totalItems - 1,
            },
          }
        }, false)

        // Remove from local storage
        removeFromLocalStorage(id)

        // Call API
        await apiClient.deleteItem(id)

        // Revalidate
        mutate()

        return { success: true }
      } catch (error) {
        console.error("Failed to remove item:", error)
        mutate() // Revert on error
        return { success: false, error: "Failed to remove item" }
      } finally {
        setIsDeleting(null)
      }
    },
    [mutate],
  )

  return {
    items: data?.data || [],
    pagination: data?.pagination || {
      page: 1,
      pageSize: 10,
      totalItems: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
    isLoading,
    isCreating,
    isDeleting,
    error,
    addItem,
    removeItem,
    refresh: () => mutate(),
  }
}
