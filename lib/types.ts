// Shared types for the application

export interface Item {
  id: string
  name: string
  location: string
  userId?: string
  createdAt: Date
  updatedAt?: Date
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
    pageSize: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
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
  createdAt: Date
}

export interface AuthSession {
  user: User | null
  isAuthenticated: boolean
}
