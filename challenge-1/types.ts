// CHALLENGE 1: TypeScript types for the update_customer_company function
// This file should contain your TypeScript type definitions

// TODO: Define the TypeScript types here
// You should include:
// 1. Function parameter types
// 2. Function return type
// 3. Error response types
// 4. Success response types

// Example structure (you need to complete this):
/*
export interface UpdateCustomerCompanyParams {
  // Define the parameters here
}

export interface UpdateCustomerCompanyResponse {
  // Define the response type here
}

export interface UpdateCustomerCompanyError {
  // Define the error type here
}
*/


export interface Customer {
  id: string
  name: string
  email: string
  company: string
  created_at: Date
  updated_at: Date
}

// 1. Function parameter types
export interface UpdateCustomerCompanyParams {
  params: {
    id: string
  }
}

export interface UpdateCustomerCompanyRequestBody {
  company: string
}

// 3. Error response types
export interface UpdateCustomerCompanyErrorResponse {
  error: string
  code: string
  success: boolean
}

// 4. Success response types
export interface UpdateCustomerCompanySuccessResponse {
  success: boolean
  data: Customer
}

// 2. Function return type
export type UpdateCustomerCompanyAPIResponse =
  | UpdateCustomerCompanySuccessResponse
  | UpdateCustomerCompanyErrorResponse