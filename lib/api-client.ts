// API client for making requests to backend
import type { Item, CreateItemInput, UpdateItemInput, PaginatedResponse, ApiResponse } from "./types"

const API_BASE = "/api"

class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.error || "An error occurred",
        }
      }

      return {
        success: true,
        data: data,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Network error",
      }
    }
  }

  // Items API
  async getItems(page = 1, pageSize = 10, search?: string): Promise<ApiResponse<PaginatedResponse<Item>>> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    })
    if (search) params.append("search", search)

    return this.request<PaginatedResponse<Item>>(`/items?${params}`)
  }

  async getItem(id: string): Promise<ApiResponse<Item>> {
    return this.request<Item>(`/items/${id}`)
  }

  async createItem(input: CreateItemInput): Promise<ApiResponse<Item>> {
    return this.request<Item>("/items", {
      method: "POST",
      body: JSON.stringify(input),
    })
  }

  async updateItem(id: string, input: UpdateItemInput): Promise<ApiResponse<Item>> {
    return this.request<Item>(`/items/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    })
  }

  async deleteItem(id: string): Promise<ApiResponse<{ deleted: boolean }>> {
    return this.request<{ deleted: boolean }>(`/items/${id}`, {
      method: "DELETE",
    })
  }

  // Auth API (placeholder for future implementation)
  async getCurrentUser(): Promise<ApiResponse<{ user: User | null }>> {
    return this.request<{ user: User | null }>("/auth/me")
  }
}

// Singleton instance
export const apiClient = new ApiClient()

// Type for the User
import type { User } from "./types"
