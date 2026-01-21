// Shared types for the application

export interface Item {
  id: string
  name: string
  location: string
  user_id?: string
  created_at: string
  updated_at: string
}

export interface CreateItemInput {
  name: string
  location: string
}

export interface UpdateItemInput {
  name?: string
  location?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    page_size: number
    total_items: number
    total_pages: number
    has_next_page: boolean
    has_previous_page: boolean
  }
  ai_metadata?: {
    original_query: string
    extracted_terms: string
  }
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface User {
  id: string
  email: string
  name?: string
  created_at: string
}

export interface AuthSession {
  user: User | null
  isAuthenticated: boolean
}

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  email: string
  password: string
  name?: string
}
