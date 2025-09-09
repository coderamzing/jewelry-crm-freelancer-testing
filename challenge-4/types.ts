// CHALLENGE 4: TypeScript types for protected route
// This file should contain your TypeScript type definitions

// TODO: Define the TypeScript types here
// You should include:
// 1. User type
// 2. API response types
// 3. Error response types
// 4. Authentication status types

// Example structure (you need to complete this):
/*
export interface User {
  id: string
  email: string
  // Add other user properties
}

export interface ProtectedRouteResponse {
  success: boolean
  data?: any
  error?: string
}

export interface AuthenticationError {
  error: string
  status: number
}
*/
export interface User {
  id: string
  email: string
}

export interface ProtectedRouteResponse {
  success: boolean
  data?: any
  error?: string
}

export interface AuthenticationError {
  error: string
  status: number
}

export interface AuthResponse {
  success: boolean
  data: User[]
}


// 3. Error response types
export interface AuthErrorResponse {
  error: string
  code: string
  success: boolean
}


// 2. Function return type
export type AuthAPIResponse =
  | AuthResponse
  | AuthErrorResponse