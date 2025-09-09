// CHALLENGE 3: Test cases for OrdersService
// This file contains comprehensive test cases for the OrdersService class

import { OrdersService } from './orders-service'
import { supabase } from '@/lib/supabase/server'
import { Order } from './types'

// Mock the supabase client
jest.mock('@/lib/supabase/server', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn()
        }))
      }))
    }))
  }
}))

describe('OrdersService', () => {
  let ordersService: OrdersService
  const mockSupabase = supabase as any

  beforeEach(() => {
    ordersService = new OrdersService()
    jest.clearAllMocks()
    // Clear console.error mock
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getOrders()', () => {
    test('should return array of orders, never undefined', async () => {
      // Mock successful response with orders data
      const mockOrders: Order[] = [
        {
          id: '1',
          customer_id: 'customer-1',
          total_amount: 299.99,
          status: 'completed',
          created_at: new Date('2024-01-01T10:00:00Z'),
          updated_at: new Date('2024-01-01T10:00:00Z')
        },
        {
          id: '2',
          customer_id: 'customer-2',
          total_amount: 159.50,
          status: 'pending',
          created_at: new Date('2024-01-02T10:00:00Z'),
          updated_at: new Date('2024-01-02T10:00:00Z')
        }
      ]

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: mockOrders,
          error: null
        })
      })

      const orders = await ordersService.getOrders()
      
      expect(Array.isArray(orders)).toBe(true)
      expect(orders).not.toBeUndefined()
      expect(orders).toHaveLength(2)
      expect(orders[0].id).toBe('1')
      expect(orders[0].total_amount).toBe(299.99)
      expect(orders[1].status).toBe('pending')
    })

    test('should return empty array when no orders exist', async () => {
      // Mock empty result
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: [],
          error: null
        })
      })

      const orders = await ordersService.getOrders()
      
      expect(Array.isArray(orders)).toBe(true)
      expect(orders).toHaveLength(0)
      expect(orders).toEqual([])
    })

    test('should return empty array when data is null', async () => {
      // Mock null data (edge case)
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: null,
          error: null
        })
      })

      const orders = await ordersService.getOrders()
      
      expect(Array.isArray(orders)).toBe(true)
      expect(orders).toHaveLength(0)
      expect(orders).toEqual([])
    })

    test('should handle database connection errors gracefully', async () => {
      // Mock database connection error
      const mockError = {
        message: 'Connection to database failed',
        code: 'PGRST301'
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: null,
          error: mockError
        })
      })

      await expect(ordersService.getOrders()).rejects.toThrow('Connection to database failed')
      expect(console.error).toHaveBeenCalledWith('Error fetching orders:', 'Connection to database failed')
    })

    test('should handle query syntax errors', async () => {
      // Mock query syntax error
      const mockError = {
        message: 'syntax error in query',
        code: 'PGRST102'
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: null,
          error: mockError
        })
      })

      await expect(ordersService.getOrders()).rejects.toThrow('syntax error in query')
      expect(console.error).toHaveBeenCalledWith('Error fetching orders:', 'syntax error in query')
    })

    test('should handle permission errors', async () => {
      // Mock permission error
      const mockError = {
        message: 'permission denied for table orders',
        code: '42501'
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: null,
          error: mockError
        })
      })

      await expect(ordersService.getOrders()).rejects.toThrow('permission denied for table orders')
    })

    test('should verify correct table and query are used', async () => {
      const mockSelect = jest.fn().mockResolvedValue({
        data: [],
        error: null
      })

      const mockFrom = jest.fn().mockReturnValue({
        select: mockSelect
      })

      mockSupabase.from = mockFrom

      await ordersService.getOrders()

      expect(mockFrom).toHaveBeenCalledWith('orders')
      expect(mockSelect).toHaveBeenCalledWith('*')
    })
  })

  describe('getOrderById()', () => {
    test('should return order for valid ID', async () => {
      // Mock successful single order response
      const mockOrder: Order = {
        id: 'valid-order-id',
        customer_id: 'customer-1',
        total_amount: 299.99,
        status: 'completed',
        created_at: new Date('2024-01-01T10:00:00Z'),
        updated_at: new Date('2024-01-01T10:00:00Z')
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockOrder,
              error: null
            })
          })
        })
      })

      const order = await ordersService.getOrderById('valid-order-id')
      
      expect(order).not.toBeNull()
      expect(order?.id).toBe('valid-order-id')
      expect(order?.total_amount).toBe(299.99)
      expect(order?.status).toBe('completed')
    })

    test('should throw error for invalid order ID (PGRST116)', async () => {
      // Mock "not found" error
      const mockError = {
        message: 'The result contains 0 rows',
        code: 'PGRST116'
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: mockError
            })
          })
        })
      })

      await expect(ordersService.getOrderById('invalid-id')).rejects.toThrow('No order found with id: invalid-id')
      expect(console.error).toHaveBeenCalledWith('Error fetching order by id:invalid-id', 'The result contains 0 rows')
    })

    test('should handle database errors for getOrderById', async () => {
      // Mock database error (not PGRST116)
      const mockError = {
        message: 'Connection timeout',
        code: 'PGRST301'
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: mockError
            })
          })
        })
      })

      await expect(ordersService.getOrderById('some-id')).rejects.toThrow('PGRST301:Connection timeout')
      expect(console.error).toHaveBeenCalledWith('Error fetching order by id:some-id', 'Connection timeout')
    })

    test('should handle empty string ID', async () => {
      // Mock error for empty ID
      const mockError = {
        message: 'invalid input syntax for type uuid',
        code: '22P02'
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: mockError
            })
          })
        })
      })

      await expect(ordersService.getOrderById('')).rejects.toThrow('22P02:invalid input syntax for type uuid')
    })

    test('should handle malformed UUID', async () => {
      // Mock error for malformed UUID
      const mockError = {
        message: 'invalid input syntax for type uuid: "not-a-uuid"',
        code: '22P02'
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: mockError
            })
          })
        })
      })

      await expect(ordersService.getOrderById('not-a-uuid')).rejects.toThrow('22P02:invalid input syntax for type uuid: "not-a-uuid"')
    })

    test('should verify correct query parameters for getOrderById', async () => {
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' }
      })

      const mockEq = jest.fn().mockReturnValue({
        single: mockSingle
      })

      const mockSelect = jest.fn().mockReturnValue({
        eq: mockEq
      })

      const mockFrom = jest.fn().mockReturnValue({
        select: mockSelect
      })

      mockSupabase.from = mockFrom

      try {
        await ordersService.getOrderById('test-id')
      } catch (error) {
        // Expected to throw
      }

      expect(mockFrom).toHaveBeenCalledWith('orders')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(mockEq).toHaveBeenCalledWith('id', 'test-id')
      expect(mockSingle).toHaveBeenCalled()
    })

    test('should handle null data response gracefully', async () => {
      // Mock null data without error (edge case)
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: null
            })
          })
        })
      })

      const order = await ordersService.getOrderById('some-id')
      
      expect(order).toBeNull()
    })

    test('should handle undefined data response gracefully', async () => {
      // Mock undefined data without error (edge case)
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: undefined,
              error: null
            })
          })
        })
      })

      const order = await ordersService.getOrderById('some-id')
      
      expect(order).toBeUndefined()
    })
  })

  describe('Edge Cases and Error Scenarios', () => {
    test('should handle network timeout errors', async () => {
      const mockError = {
        message: 'Network timeout',
        code: 'NETWORK_ERROR'
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: null,
          error: mockError
        })
      })

      await expect(ordersService.getOrders()).rejects.toThrow('Network timeout')
    })

    test('should handle very large order amounts', async () => {
      const mockOrder: Order = {
        id: 'large-order',
        customer_id: 'customer-1',
        total_amount: 999999999.99,
        status: 'completed',
        created_at: new Date('2024-01-01T10:00:00Z'),
        updated_at: new Date('2024-01-01T10:00:00Z')
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockOrder,
              error: null
            })
          })
        })
      })

      const order = await ordersService.getOrderById('large-order')
      
      expect(order?.total_amount).toBe(999999999.99)
    })

    test('should handle orders with special characters in status', async () => {
      const mockOrder: Order = {
        id: 'special-order',
        customer_id: 'customer-1',
        total_amount: 100.00,
        status: 'pending-review@#$%',
        created_at: new Date('2024-01-01T10:00:00Z'),
        updated_at: new Date('2024-01-01T10:00:00Z')
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockOrder,
              error: null
            })
          })
        })
      })

      const order = await ordersService.getOrderById('special-order')
      
      expect(order?.status).toBe('pending-review@#$%')
    })
  })
})
