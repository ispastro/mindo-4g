// API client for making requests to backend
import type { Item, CreateItemInput, UpdateItemInput, PaginatedResponse, ApiResponse, User, LoginRequest, SignupRequest } from "./types"

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

class ApiClient {
  private getToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("access_token")
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const token = this.getToken()
      const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...options?.headers,
      }
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }

      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers,
        ...options,
      })

      if (response.status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("access_token")
          window.location.href = "/login"
        }
        return {
          success: false,
          error: "Unauthorized",
        }
      }

      const data = await response.json()

      if (!response.ok) {
        return {
          success: false,
          error: data.detail || "An error occurred",
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
  async getItems(page = 1, pageSize = 10, query?: string): Promise<ApiResponse<PaginatedResponse<Item>>> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    })
    if (query) params.append("query", query)

    return this.request<PaginatedResponse<Item>>(`/items?${params}`)
  }

  async searchItemsAI(query: string, page = 1, pageSize = 10): Promise<ApiResponse<PaginatedResponse<Item>>> {
    const params = new URLSearchParams({
      query,
      page: page.toString(),
      page_size: pageSize.toString(),
    })

    return this.request<PaginatedResponse<Item>>(`/items/search/ai?${params}`)
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

  // Auth API
  async signup(data: SignupRequest): Promise<ApiResponse<User>> {
    return this.request<User>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async login(data: LoginRequest): Promise<ApiResponse<{ access_token: string; token_type: string; user: User }>> {
    const response = await this.request<{ access_token: string; token_type: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    })
    
    if (response.success && response.data && typeof window !== "undefined") {
      localStorage.setItem("access_token", response.data.access_token)
    }
    
    return response
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>("/auth/me")
  }

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token")
    }
  }
}

// Singleton instance
export const apiClient = new ApiClient()

// Type for the User
import type { User } from "./types"
