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

  describe('getOrders() - Always returns [], never undefined', () => {
    test('should return array of orders for valid data', async () => {
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

    test('should return empty array even when database connection fails', async () => {
      // Mock database connection error - should still return []
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

      const orders = await ordersService.getOrders()
      
      // Should return empty array, not throw error
      expect(Array.isArray(orders)).toBe(true)
      expect(orders).toHaveLength(0)
      expect(orders).toEqual([])
      expect(console.error).toHaveBeenCalledWith('Error fetching orders:', 'Connection to database failed')
    })

    test('should return empty array even when query syntax error occurs', async () => {
      // Mock query syntax error - should still return []
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

      const orders = await ordersService.getOrders()
      
      // Should return empty array, not throw error
      expect(Array.isArray(orders)).toBe(true)
      expect(orders).toHaveLength(0)
      expect(orders).toEqual([])
      expect(console.error).toHaveBeenCalledWith('Error fetching orders:', 'syntax error in query')
    })

    test('should return empty array even when permission denied', async () => {
      // Mock permission error - should still return []
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

      const orders = await ordersService.getOrders()
      
      // Should return empty array, not throw error
      expect(Array.isArray(orders)).toBe(true)
      expect(orders).toHaveLength(0)
      expect(orders).toEqual([])
    })

    test('should return empty array even when network timeout occurs', async () => {
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

      const orders = await ordersService.getOrders()
      
      // Should return empty array, not throw error
      expect(Array.isArray(orders)).toBe(true)
      expect(orders).toHaveLength(0)
      expect(orders).toEqual([])
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

  describe('getOrderById() - Returns order or null, throws errors for non-404', () => {
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

    test('should throw error for invalid order ID (PGRST116 - not found)', async () => {
      // Mock "not found" error - should throw specific error
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
    
    test('should verify correct query parameters for getOrderById', async () => {
      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: null
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

      await ordersService.getOrderById('test-id')

      expect(mockFrom).toHaveBeenCalledWith('orders')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(mockEq).toHaveBeenCalledWith('id', 'test-id')
      expect(mockSingle).toHaveBeenCalled()
    })
  })

  describe('Edge Cases and Boundary Testing', () => {
    test('getOrders should handle very large datasets gracefully', async () => {
      // Mock large dataset
      const largeOrderSet: Order[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `order-${i}`,
        customer_id: `customer-${i}`,
        total_amount: Math.random() * 1000,
        status: i % 2 === 0 ? 'completed' : 'pending',
        created_at: new Date(),
        updated_at: new Date()
      }))

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: largeOrderSet,
          error: null
        })
      })

      const orders = await ordersService.getOrders()
      
      expect(Array.isArray(orders)).toBe(true)
      expect(orders).toHaveLength(1000)
    })

    test('getOrderById should handle very long UUID strings', async () => {
      const mockOrder: Order = {
        id: 'very-long-uuid-string-that-might-cause-issues',
        customer_id: 'customer-1',
        total_amount: 100,
        status: 'completed',
        created_at: new Date(),
        updated_at: new Date()
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

      const order = await ordersService.getOrderById('very-long-uuid-string-that-might-cause-issues')
      
      expect(order?.id).toBe('very-long-uuid-string-that-might-cause-issues')
    })

    test('getOrders should handle orders with extreme values', async () => {
      const extremeOrders: Order[] = [
        {
          id: '1',
          customer_id: 'customer-1',
          total_amount: 0, // Zero amount
          status: '',     // Empty status
          created_at: new Date('1970-01-01'), // Very old date
          updated_at: new Date('2099-12-31')  // Future date
        },
        {
          id: '2',
          customer_id: 'customer-2',
          total_amount: 999999999.99, // Very large amount
          status: 'a'.repeat(1000),   // Very long status
          created_at: new Date(),
          updated_at: new Date()
        }
      ]

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({
          data: extremeOrders,
          error: null
        })
      })

      const orders = await ordersService.getOrders()
      
      expect(Array.isArray(orders)).toBe(true)
      expect(orders).toHaveLength(2)
      expect(orders[0].total_amount).toBe(0)
      expect(orders[1].total_amount).toBe(999999999.99)
    })
  })
})
