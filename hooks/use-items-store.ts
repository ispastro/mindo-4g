"use client"

import { useState, useEffect, useCallback } from "react"

export interface Item {
  id: string
  name: string
  location: string
  createdAt: Date
}

const STORAGE_KEY = "rememberwhere-items"

export function useItemsStore() {
  const [items, setItems] = useState<Item[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoaded, setIsLoaded] = useState(false)

  // Load items from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        const itemsWithDates = parsed.map((item: Item) => ({
          ...item,
          createdAt: new Date(item.createdAt),
        }))
        setItems(itemsWithDates)
      } catch (e) {
        console.error("Failed to parse stored items:", e)
      }
    }
    setIsLoaded(true)
  }, [])

  // Save items to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    }
  }, [items, isLoaded])

  const addItem = useCallback((item: Omit<Item, "id" | "createdAt">) => {
    const newItem: Item = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    }
    setItems((prev) => [newItem, ...prev])
  }, [])

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const updateItem = useCallback((id: string, updates: Partial<Omit<Item, "id">>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updates } : item)))
  }, [])

  const clearAll = useCallback(() => {
    setItems([])
  }, [])

  return {
    items,
    searchQuery,
    setSearchQuery,
    addItem,
    removeItem,
    updateItem,
    clearAll,
  }
}
