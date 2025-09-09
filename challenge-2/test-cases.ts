// CHALLENGE 2: Test cases for communications API
// This file contains comprehensive test cases for the communications API route

import { NextRequest } from 'next/server'
import { GET } from '../app/api/communications/route'
import { supabase } from '@/lib/supabase/server'
import { Communication, CommunicationListAPIResponse } from './types'

// Mock the supabase client
jest.mock('@/lib/supabase/server', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          data: null,
          error: null
        }))
      }))
    }))
  }
}))

describe('Communications API - GET /api/communications', () => {
  const mockSupabase = supabase as any
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should return communications with user names successfully', async () => {
    // Mock successful response with communications data
    const mockCommunications: Communication[] = [
      {
        id: '1',
        message: 'Hello, how are you?',
        sender_id: 'user-1',
        recipient_id: 'user-2',
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z',
        sender: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
          created_at: new Date('2024-01-01T09:00:00Z'),
          updated_at: new Date('2024-01-01T09:00:00Z')
        },
        recipient: {
          id: 'user-2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          created_at: new Date('2024-01-01T09:00:00Z'),
          updated_at: new Date('2024-01-01T09:00:00Z')
        }
      },
      {
        id: '2',
        message: 'Meeting at 3 PM',
        sender_id: 'user-2',
        recipient_id: 'user-1',
        created_at: '2024-01-01T11:00:00Z',
        updated_at: '2024-01-01T11:00:00Z',
        sender: {
          id: 'user-2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          created_at: new Date('2024-01-01T09:00:00Z'),
          updated_at: new Date('2024-01-01T09:00:00Z')
        },
        recipient: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
          created_at: new Date('2024-01-01T09:00:00Z'),
          updated_at: new Date('2024-01-01T09:00:00Z')
        }
      }
    ]

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: mockCommunications,
          error: null
        })
      })
    })

    const request = new NextRequest('http://localhost:3000/api/communications')
    const response = await GET(request)
    
    expect(response.status).toBe(200)
    const responseData = await response.json()
    
    expect(responseData.success).toBe(true)
    expect(Array.isArray(responseData.data)).toBe(true)
    expect(responseData.data).toHaveLength(2)
    expect(responseData.data[0]).toHaveProperty('sender')
    expect(responseData.data[0]).toHaveProperty('recipient')
    expect(responseData.data[0].sender.name).toBe('John Doe')
    expect(responseData.data[0].recipient.name).toBe('Jane Smith')
  })

  test('should return empty array when no communications exist', async () => {
    // Mock empty result
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      })
    })

    const request = new NextRequest('http://localhost:3000/api/communications')
    const response = await GET(request)
    
    expect(response.status).toBe(200)
    const responseData = await response.json()
    
    expect(responseData.success).toBe(true)
    expect(Array.isArray(responseData.data)).toBe(true)
    expect(responseData.data).toHaveLength(0)
  })

  test('should handle database connection error gracefully', async () => {
    // Mock database error
    const mockError = {
      message: 'Connection to database failed',
      code: 'PGRST301',
      details: 'Could not connect to PostgreSQL server'
    }

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: null,
          error: mockError
        })
      })
    })

    const request = new NextRequest('http://localhost:3000/api/communications')
    const response = await GET(request)
    
    expect(response.status).toBe(500)
    const responseData = await response.json()
    
    expect(responseData.success).toBe(false)
    expect(responseData.error).toBe('Connection to database failed')
    expect(responseData.code).toBe('PGRST301')
  })

  test('should handle query syntax error', async () => {
    // Mock query syntax error
    const mockError = {
      message: 'syntax error in query',
      code: 'PGRST102',
      details: 'Invalid column reference'
    }

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: null,
          error: mockError
        })
      })
    })

    const request = new NextRequest('http://localhost:3000/api/communications')
    const response = await GET(request)
    
    expect(response.status).toBe(500)
    const responseData = await response.json()
    
    expect(responseData.success).toBe(false)
    expect(responseData.error).toBe('syntax error in query')
    expect(responseData.code).toBe('PGRST102')
  })

  test('should handle foreign key constraint errors', async () => {
    // Mock foreign key error
    const mockError = {
      message: 'foreign key violation',
      code: '23503',
      details: 'Referenced table does not exist'
    }

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: null,
          error: mockError
        })
      })
    })

    const request = new NextRequest('http://localhost:3000/api/communications')
    const response = await GET(request)
    
    expect(response.status).toBe(500)
    const responseData = await response.json()
    
    expect(responseData.success).toBe(false)
    expect(responseData.error).toBe('foreign key violation')
    expect(responseData.code).toBe('23503')
  })

  test('should handle communications with null sender or recipient', async () => {
    // Mock communications with null relationships
    const mockCommunications: Communication[] = [
      {
        id: '3',
        message: 'System message',
        sender_id: null,
        recipient_id: 'user-1',
        created_at: '2024-01-01T12:00:00Z',
        updated_at: '2024-01-01T12:00:00Z',
        sender: null,
        recipient: {
          id: 'user-1',
          name: 'John Doe',
          email: 'john@example.com',
          created_at: new Date('2024-01-01T09:00:00Z'),
          updated_at: new Date('2024-01-01T09:00:00Z')
        }
      }
    ]

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: mockCommunications,
          error: null
        })
      })
    })

    const request = new NextRequest('http://localhost:3000/api/communications')
    const response = await GET(request)
    
    expect(response.status).toBe(200)
    const responseData = await response.json()
    
    expect(responseData.success).toBe(true)
    expect(responseData.data[0].sender).toBeNull()
    expect(responseData.data[0].recipient).not.toBeNull()
    expect(responseData.data[0].recipient.name).toBe('John Doe')
  })

  test('should verify correct query parameters are used', async () => {
    const mockSelect = jest.fn().mockReturnValue({
      order: jest.fn().mockResolvedValue({
        data: [],
        error: null
      })
    })
    
    const mockFrom = jest.fn().mockReturnValue({
      select: mockSelect
    })

    mockSupabase.from = mockFrom

    const request = new NextRequest('http://localhost:3000/api/communications')
    await GET(request)
    
    // Verify correct table is queried
    expect(mockFrom).toHaveBeenCalledWith('communications')
    
    // Verify correct select query with relationships
    expect(mockSelect).toHaveBeenCalledWith('*, recipient:users!fk_communications_recipient(*), sender:users!fk_communications_sender(*)')
  })

  test('should verify correct ordering is applied', async () => {
    const mockOrder = jest.fn().mockResolvedValue({
      data: [],
      error: null
    })
    
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: mockOrder
      })
    })

    const request = new NextRequest('http://localhost:3000/api/communications')
    await GET(request)
    
    // Verify correct ordering
    expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
  })

  test('should handle unexpected errors gracefully', async () => {
    // Mock unexpected runtime error
    mockSupabase.from.mockImplementation(() => {
      throw new Error('Unexpected runtime error')
    })

    const request = new NextRequest('http://localhost:3000/api/communications')
    const response = await GET(request)
    
    expect(response.status).toBe(500)
    const responseData = await response.json()
    
    expect(responseData.success).toBe(false)
    expect(responseData.error).toBe('Unexpected runtime error')
  })

  test('should return communications ordered by created_at descending', async () => {
    // Mock communications with different timestamps
    const mockCommunications: Communication[] = [
      {
        id: '2',
        message: 'Latest message',
        sender_id: 'user-1',
        recipient_id: 'user-2',
        created_at: '2024-01-02T10:00:00Z',
        updated_at: '2024-01-02T10:00:00Z',
        sender: null,
        recipient: null
      },
      {
        id: '1',
        message: 'Earlier message',
        sender_id: 'user-2',
        recipient_id: 'user-1',
        created_at: '2024-01-01T10:00:00Z',
        updated_at: '2024-01-01T10:00:00Z',
        sender: null,
        recipient: null
      }
    ]

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: mockCommunications,
          error: null
        })
      })
    })

    const request = new NextRequest('http://localhost:3000/api/communications')
    const response = await GET(request)
    
    expect(response.status).toBe(200)
    const responseData = await response.json()
    
    expect(responseData.success).toBe(true)
    expect(responseData.data[0].created_at > responseData.data[1].created_at).toBe(true)
    expect(responseData.data[0].message).toBe('Latest message')
  })
})
