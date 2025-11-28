// Server-side service layer for items
// This abstracts the data source (localStorage for now, database later)

import type { Item, CreateItemInput, UpdateItemInput, PaginatedResponse } from "./types"

// In-memory store for server-side (will be replaced with database)
// For now, this simulates what would be database operations
class ItemsService {
  // This will be replaced with actual database queries
  // For production, use Supabase, Neon, or another database

  async getItems(
    userId: string,
    options: { page?: number; pageSize?: number; search?: string } = {},
  ): Promise<PaginatedResponse<Item>> {
    const { page = 1, pageSize = 10, search } = options

    // TODO: Replace with database query
    // Example with Supabase:
    // const { data, count } = await supabase
    //   .from('items')
    //   .select('*', { count: 'exact' })
    //   .eq('user_id', userId)
    //   .ilike('name', `%${search}%`)
    //   .range((page - 1) * pageSize, page * pageSize - 1)
    //   .order('created_at', { ascending: false })

    // Placeholder response
    return {
      data: [],
      pagination: {
        page,
        pageSize,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: page > 1,
      },
    }
  }

  async getItem(id: string, userId: string): Promise<Item | null> {
    // TODO: Replace with database query
    // const { data } = await supabase
    //   .from('items')
    //   .select('*')
    //   .eq('id', id)
    //   .eq('user_id', userId)
    //   .single()
    return null
  }

  async createItem(input: CreateItemInput, userId: string): Promise<Item> {
    const now = new Date()
    const item: Item = {
      id: crypto.randomUUID(),
      ...input,
      userId,
      createdAt: now,
      updatedAt: now,
    }

    // TODO: Replace with database insert
    // const { data } = await supabase
    //   .from('items')
    //   .insert({ ...input, user_id: userId })
    //   .select()
    //   .single()

    return item
  }

  async updateItem(id: string, input: UpdateItemInput, userId: string): Promise<Item | null> {
    // TODO: Replace with database update
    // const { data } = await supabase
    //   .from('items')
    //   .update({ ...input, updated_at: new Date() })
    //   .eq('id', id)
    //   .eq('user_id', userId)
    //   .select()
    //   .single()
    return null
  }

  async deleteItem(id: string, userId: string): Promise<boolean> {
    // TODO: Replace with database delete
    // const { error } = await supabase
    //   .from('items')
    //   .delete()
    //   .eq('id', id)
    //   .eq('user_id', userId)
    return true
  }
}

export const itemsService = new ItemsService()
