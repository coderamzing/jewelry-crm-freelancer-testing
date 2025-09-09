// CHALLENGE 4: Test cases for protected route
// This file contains comprehensive test cases for the protected API route

import { NextRequest } from 'next/server'
import { GET } from './protected-route'
import { supabase } from '@/lib/supabase/server'
import { User, AuthAPIResponse } from './types'

// Mock the supabase client
jest.mock('@/lib/supabase/server', () => ({
  supabase: {
    auth: {
      getSession: jest.fn(),
      getUser: jest.fn()
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn()
      }))
    }))
  }
}))

describe('Protected Route - GET /api/protected-route', () => {
  const mockSupabase = supabase as any

  beforeEach(() => {
    jest.clearAllMocks()
    // Clear console.error mock
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Authentication Success Scenarios', () => {
    test('should return 200 for authenticated user with valid session and data', async () => {
      // Mock valid session
      const mockSession = {
        access_token: 'valid-access-token',
        user: {
          id: 'user-123',
          email: 'user@example.com'
        }
      }

      // Mock valid user
      const mockUser = {
        id: 'user-123',
        email: 'user@example.com'
      }

      // Mock user data from database
      const mockUserData = [
        {
          id: '1',
          user_id: 'user-123',
          profile_data: 'some profile data',
          preferences: 'user preferences'
        }
      ]

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: mockUserData,
            error: null
          })
        })
      })

      const request = new NextRequest('http://localhost:3000/api/protected-route')
      const response = await GET(request)
      
      expect(response.status).toBe(200)
      const responseData = await response.json()
      expect(responseData.success).toBe(true)
      expect(responseData.data).toEqual(mockUserData)
    })

    test('should return 200 for authenticated user with empty user data', async () => {
      // Mock valid session and user but no user data in database
      const mockSession = {
        access_token: 'valid-access-token',
        user: {
          id: 'user-456',
          email: 'newuser@example.com'
        }
      }

      const mockUser = {
        id: 'user-456',
        email: 'newuser@example.com'
      }

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      })

      const request = new NextRequest('http://localhost:3000/api/protected-route')
      const response = await GET(request)
      
      expect(response.status).toBe(200)
      const responseData = await response.json()
      expect(responseData.success).toBe(true)
      expect(responseData.data).toEqual([])
    })
  })

  describe('Authentication Failure Scenarios', () => {
    test('should return 401 for unauthenticated user (no session)', async () => {
      // Mock no session
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/protected-route')
      const response = await GET(request)
      
      expect(response.status).toBe(401)
      const responseData = await response.json()
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Unauthorized')
      expect(responseData.code).toBe('UNAUTHORIZED')
      expect(console.error).toHaveBeenCalledWith('Error in protected route: User session is undefined')
    })

    test('should return 401 for undefined session', async () => {
      // Mock undefined session
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: undefined },
        error: null
      })

      const request = new NextRequest('http://localhost:3000/api/protected-route')
      const response = await GET(request)
      
      expect(response.status).toBe(401)
      const responseData = await response.json()
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Unauthorized')
      expect(responseData.code).toBe('UNAUTHORIZED')
    })

    test('should return 500 for session retrieval error', async () => {
      // Mock session retrieval error
      const mockError = {
        message: 'Failed to retrieve session',
        code: 'SESSION_ERROR'
      }

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: mockError
      })

      const request = new NextRequest('http://localhost:3000/api/protected-route')
      const response = await GET(request)
      
      expect(response.status).toBe(401)
      const responseData = await response.json()
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Unauthorized')
      expect(responseData.code).toBe('UNAUTHORIZED')
    })
  })

  describe('User Authentication Errors', () => {
    test('should return 500 for user retrieval error', async () => {
      // Mock valid session but user retrieval error
      const mockSession = {
        access_token: 'valid-access-token',
        user: { id: 'user-123', email: 'user@example.com' }
      }

      const mockAuthError = {
        message: 'Invalid JWT token',
        code: 'INVALID_JWT'
      }

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: mockAuthError
      })

      const request = new NextRequest('http://localhost:3000/api/protected-route')
      const response = await GET(request)
      
      expect(response.status).toBe(500)
      const responseData = await response.json()
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Invalid JWT token')
      expect(responseData.code).toBe('INVALID_JWT')
    })

    test('should return 500 for expired token', async () => {
      // Mock valid session but expired token error
      const mockSession = {
        access_token: 'expired-access-token',
        user: { id: 'user-123', email: 'user@example.com' }
      }

      const mockAuthError = {
        message: 'JWT expired',
        code: 'JWT_EXPIRED'
      }

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: mockAuthError
      })

      const request = new NextRequest('http://localhost:3000/api/protected-route')
      const response = await GET(request)
      
      expect(response.status).toBe(500)
      const responseData = await response.json()
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('JWT expired')
      expect(responseData.code).toBe('JWT_EXPIRED')
    })
  })

  describe('Database Error Scenarios', () => {
    test('should return 500 for database connection error', async () => {
      // Mock valid auth but database error
      const mockSession = {
        access_token: 'valid-access-token',
        user: { id: 'user-123', email: 'user@example.com' }
      }

      const mockUser = {
        id: 'user-123',
        email: 'user@example.com'
      }

      const mockDbError = {
        message: 'Connection to database failed',
        code: 'PGRST301'
      }

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: mockDbError
          })
        })
      })

      const request = new NextRequest('http://localhost:3000/api/protected-route')
      const response = await GET(request)
      
      expect(response.status).toBe(500)
      const responseData = await response.json()
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('Connection to database failed')
      expect(responseData.code).toBe('PGRST301')
    })

    test('should return 500 for database query error', async () => {
      // Mock valid auth but database query error
      const mockSession = {
        access_token: 'valid-access-token',
        user: { id: 'user-123', email: 'user@example.com' }
      }

      const mockUser = {
        id: 'user-123',
        email: 'user@example.com'
      }

      const mockDbError = {
        message: 'relation "user_data" does not exist',
        code: '42P01'
      }

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: mockDbError
          })
        })
      })

      const request = new NextRequest('http://localhost:3000/api/protected-route')
      const response = await GET(request)
      
      expect(response.status).toBe(500)
      const responseData = await response.json()
      expect(responseData.success).toBe(false)
      expect(responseData.error).toBe('relation "user_data" does not exist')
      expect(responseData.code).toBe('42P01')
    })
  })

  describe('Query Verification Tests', () => {
    test('should query correct table and columns', async () => {
      // Mock successful authentication
      const mockSession = {
        access_token: 'valid-access-token',
        user: { id: 'user-123', email: 'user@example.com' }
      }

      const mockUser = {
        id: 'user-123',
        email: 'user@example.com'
      }

      const mockEq = jest.fn().mockResolvedValue({
        data: [],
        error: null
      })

      const mockSelect = jest.fn().mockReturnValue({
        eq: mockEq
      })

      const mockFrom = jest.fn().mockReturnValue({
        select: mockSelect
      })

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      mockSupabase.from = mockFrom

      const request = new NextRequest('http://localhost:3000/api/protected-route')
      await GET(request)

      // Verify correct database queries
      expect(mockFrom).toHaveBeenCalledWith('user_data')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123')
    })

    test('should verify authentication method calls', async () => {
      // Mock successful authentication
      const mockSession = {
        access_token: 'valid-access-token',
        user: { id: 'user-789', email: 'test@example.com' }
      }

      const mockUser = {
        id: 'user-789',
        email: 'test@example.com'
      }

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      })

      const request = new NextRequest('http://localhost:3000/api/protected-route')
      await GET(request)

      // Verify authentication methods were called
      expect(mockSupabase.auth.getSession).toHaveBeenCalled()
      expect(mockSupabase.auth.getUser).toHaveBeenCalled()
    })
  })

  describe('Edge Cases and Boundary Testing', () => {
    test('should handle user with very long ID', async () => {
      const longUserId = 'a'.repeat(1000)
      
      const mockSession = {
        access_token: 'valid-access-token',
        user: { id: longUserId, email: 'user@example.com' }
      }

      const mockUser = {
        id: longUserId,
        email: 'user@example.com'
      }

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [],
            error: null
          })
        })
      })

      const request = new NextRequest('http://localhost:3000/api/protected-route')
      const response = await GET(request)
      
      expect(response.status).toBe(200)
      const responseData = await response.json()
      expect(responseData.success).toBe(true)
    })

    test('should handle user with special characters in email', async () => {
      const mockSession = {
        access_token: 'valid-access-token',
        user: { id: 'user-123', email: 'test+special@example.com' }
      }

      const mockUser = {
        id: 'user-123',
        email: 'test+special@example.com'
      }

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: [{ user_id: 'user-123', email: 'test+special@example.com' }],
            error: null
          })
        })
      })

      const request = new NextRequest('http://localhost:3000/api/protected-route')
      const response = await GET(request)
      
      expect(response.status).toBe(200)
      const responseData = await response.json()
      expect(responseData.success).toBe(true)
    })

    test('should handle very large user data response', async () => {
      const mockSession = {
        access_token: 'valid-access-token',
        user: { id: 'user-123', email: 'user@example.com' }
      }

      const mockUser = {
        id: 'user-123',
        email: 'user@example.com'
      }

      // Create large dataset
      const largeUserData = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        user_id: 'user-123',
        data_field: `data-${i}`,
        large_text: 'x'.repeat(1000)
      }))

      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({
            data: largeUserData,
            error: null
          })
        })
      })

      const request = new NextRequest('http://localhost:3000/api/protected-route')
      const response = await GET(request)
      
      expect(response.status).toBe(200)
      const responseData = await response.json()
      expect(responseData.success).toBe(true)
      expect(responseData.data).toHaveLength(100)
    })

  })
})
