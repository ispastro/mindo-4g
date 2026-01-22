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
  const query = params.get("query") || undefined
  const useAI = params.get("useAI") === "true"

  let response
  if (query && useAI) {
    // Use AI search for natural language queries
    response = await apiClient.searchItemsAI(query, page, pageSize)
  } else {
    // Use regular search for simple keyword matching
    response = await apiClient.getItems(page, pageSize, query)
  }

  if (!response.success || !response.data) {
    // Fallback to local storage if API fails
    return getLocalItems(page, pageSize, query)
  }

  return response.data
}

// Helper to get items from local storage as fallback
function getLocalItems(page: number, pageSize: number, query?: string): PaginatedResponse<Item> {
  if (typeof window === "undefined") {
    return {
      data: [],
      pagination: { page, page_size: pageSize, total_items: 0, total_pages: 0, has_next_page: false, has_previous_page: false },
    }
  }

  const stored = localStorage.getItem(STORAGE_KEY)
  let items: Item[] = []

  if (stored) {
    try {
      items = JSON.parse(stored)
    } catch (e) {
      console.error("Failed to parse stored items:", e)
    }
  }

  // Filter by search
  if (query) {
    const lowerQuery = query.toLowerCase()
    items = items.filter(
      (item) => item.name.toLowerCase().includes(lowerQuery) || item.location.toLowerCase().includes(lowerQuery),
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
      page_size: pageSize,
      total_items: totalItems,
      total_pages: totalPages,
      has_next_page: page < totalPages,
      has_previous_page: page > 1,
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

export function useItems(options: { page?: number; pageSize?: number; query?: string } = {}) {
  const { page = 1, pageSize = 10, query } = options
  const [isCreating, setIsCreating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  // Detect if query is natural language (AI search) or simple keyword
  const isNaturalLanguage = query && (query.includes(" ") && query.split(" ").length > 2)

  // Build the SWR key
  const params = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
  })
  if (query) params.append("query", query)
  if (isNaturalLanguage) params.append("useAI", "true")
  const swrKey = `/api/items?${params}`

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<Item>>(swrKey, fetcher, {
    // Use local storage data as fallback while loading
    fallbackData: typeof window !== "undefined" ? getLocalItems(page, pageSize, query) : undefined,
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
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
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
              total_items: current.pagination.total_items + 1,
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
              total_items: current.pagination.total_items - 1,
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

  const updateItem = useCallback(
    async (id: string, input: { name: string; location: string }) => {
      try {
        // Optimistically update UI
        mutate((current) => {
          if (!current) return current
          return {
            ...current,
            data: current.data.map((item) =>
              item.id === id ? { ...item, ...input, updated_at: new Date().toISOString() } : item
            ),
          }
        }, false)

        // Call API
        const response = await apiClient.updateItem(id, input)

        if (!response.success) {
          mutate() // Revert on error
          throw new Error(response.error)
        }

        // Revalidate
        mutate()

        return { success: true }
      } catch (error) {
        console.error("Failed to update item:", error)
        mutate() // Revert on error
        return { success: false, error: "Failed to update item" }
      }
    },
    [mutate],
  )

  return {
    items: data?.data || [],
    pagination: data?.pagination || {
      page: 1,
      page_size: 10,
      total_items: 0,
      total_pages: 0,
      has_next_page: false,
      has_previous_page: false,
    },
    isLoading,
    isCreating,
    isDeleting,
    error,
    addItem,
    removeItem,
    updateItem,
    refresh: () => mutate(),
  }
}
