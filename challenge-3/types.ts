// CHALLENGE 3: TypeScript types for OrdersService
// This file should contain your TypeScript type definitions

import { Communication } from "@/challenge-2/types"

// TODO: Define the TypeScript types here
// You should include:
// 1. Order type
// 2. Service response types
// 3. Error types
// 4. Method parameter types

// Example structure (you need to complete this):
/*
export interface Order {
  id: string
  customer_id: string
  total_amount: number
  status: string
  created_at: string
  updated_at: string
}

export interface ServiceResponse<T> {
  data: T
  error?: string
}

export interface ServiceError {
  message: string
  code?: string
}
*/

export interface Order {
  id: string
  customer_id: string
  total_amount: number
  status: string
  created_at: Date
  updated_at: Date
}

export interface ServiceResponse<T> {
  data: T
  error?: string
}

export interface ServiceError {
  message: string
  code?: string
}

export interface OrderListResponse {
  success: boolean
  data: Communication[]
}


// 3. Error response types
export interface OrderListErrorResponse {
  error: string
  code: string
  success: boolean
}


// 2. Function return type
export type OrderListAPIResponse =
  | OrderListResponse
  | OrderListErrorResponse


export interface OrderResponse {
  success: boolean
  data: Order
}


// 3. Error response types
export interface OrderErrorResponse {
  error: string
  code: string
  success: boolean
}


// 2. Function return type
export type OrderAPIResponse =
  | OrderResponse
  | OrderErrorResponse
