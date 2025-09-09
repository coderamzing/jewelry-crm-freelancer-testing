// CHALLENGE 5: Test cases for OrderAnalyticsService
// This file contains comprehensive test cases for the OrderAnalyticsService class

import { OrderAnalyticsService } from './order-analytics-service'
import { Order, OrderItem, OrderTotals, OrderStatistics } from './types'

describe('OrderAnalyticsService', () => {
  let service: OrderAnalyticsService

  beforeEach(() => {
    service = new OrderAnalyticsService()
  })

  describe('calculateOrderTotals()', () => {
    test('should calculate totals for valid data', async () => {
      const orders: Order[] = [
        {
          id: '1',
          customer_id: 'customer-1',
          total_amount: 250,
          status: 'completed',
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z',
          items: [
            { id: '1', product_id: 'product-1', price: 100, quantity: 2 },
            { id: '2', product_id: 'product-2', price: 50, quantity: 1 }
          ]
        }
      ]
      
      const totals = await service.calculateOrderTotals(orders)
      
      expect(totals.totalRevenue).toBe(250) // (100*2) + (50*1)
      expect(totals.averageOrderValue).toBe(250) // 250/1
      expect(totals.totalItems).toBe(2) // 2 distinct items
    })

    test('should handle empty array', async () => {
      const totals = await service.calculateOrderTotals([])
      
      expect(totals.totalRevenue).toBe(0)
      expect(totals.averageOrderValue).toBe(0)
      expect(totals.totalItems).toBe(0)
    })

    test('should handle undefined data', async () => {
      // Test undefined data scenario - this should be handled gracefully
      const totals = await service.calculateOrderTotals(undefined as any)
      
      expect(totals.totalRevenue).toBe(0)
      expect(totals.averageOrderValue).toBe(0)
      expect(totals.totalItems).toBe(0)
    })

    test('should handle missing items', async () => {
      // Test orders with missing items property
      const ordersWithMissingItems: Order[] = [
        {
          id: '1',
          customer_id: 'customer-1',
          total_amount: 100,
          status: 'completed',
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z',
          items: undefined as any
        }
      ]
      
      const totals = await service.calculateOrderTotals(ordersWithMissingItems)
      
      expect(totals.totalRevenue).toBe(0)
      expect(totals.averageOrderValue).toBe(0)
      expect(totals.totalItems).toBe(0)
    })

    test('should handle multiple orders with different items', async () => {
      const orders: Order[] = [
        {
          id: '1',
          customer_id: 'customer-1',
          total_amount: 300,
          status: 'completed',
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z',
          items: [
            { id: '1', product_id: 'product-1', price: 100, quantity: 2 },
            { id: '2', product_id: 'product-2', price: 50, quantity: 2 }
          ]
        },
        {
          id: '2',
          customer_id: 'customer-2',
          total_amount: 150,
          status: 'pending',
          created_at: '2024-01-02T10:00:00Z',
          updated_at: '2024-01-02T10:00:00Z',
          items: [
            { id: '3', product_id: 'product-3', price: 75, quantity: 2 }
          ]
        }
      ]
      
      const totals = await service.calculateOrderTotals(orders)
      
      expect(totals.totalRevenue).toBe(450) // (100*2 + 50*2) + (75*2)
      expect(totals.averageOrderValue).toBe(225) // 450/2
      expect(totals.totalItems).toBe(3) // 2 items + 1 item
    })

    test('should handle orders with zero quantities', async () => {
      const orders: Order[] = [
        {
          id: '1',
          customer_id: 'customer-1',
          total_amount: 0,
          status: 'cancelled',
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z',
          items: [
            { id: '1', product_id: 'product-1', price: 100, quantity: 0 }
          ]
        }
      ]
      
      const totals = await service.calculateOrderTotals(orders)
      
      expect(totals.totalRevenue).toBe(0)
      expect(totals.averageOrderValue).toBe(0)
      expect(totals.totalItems).toBe(1) // Still counts as 1 item even with 0 quantity
    })

    test('should handle orders with negative prices (refunds)', async () => {
      const orders: Order[] = [
        {
          id: '1',
          customer_id: 'customer-1',
          total_amount: -50,
          status: 'refunded',
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z',
          items: [
            { id: '1', product_id: 'product-1', price: -50, quantity: 1 }
          ]
        }
      ]
      
      const totals = await service.calculateOrderTotals(orders)
      
      expect(totals.totalRevenue).toBe(-50)
      expect(totals.averageOrderValue).toBe(-50)
      expect(totals.totalItems).toBe(1)
    })

    test('should handle orders with empty items array', async () => {
      const orders: Order[] = [
        {
          id: '1',
          customer_id: 'customer-1',
          total_amount: 0,
          status: 'pending',
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z',
          items: []
        }
      ]
      
      const totals = await service.calculateOrderTotals(orders)
      
      expect(totals.totalRevenue).toBe(0)
      expect(totals.averageOrderValue).toBe(0)
      expect(totals.totalItems).toBe(0)
    })

    test('should handle very large numbers', async () => {
      const orders: Order[] = [
        {
          id: '1',
          customer_id: 'customer-1',
          total_amount: 999999999,
          status: 'completed',
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z',
          items: [
            { id: '1', product_id: 'product-1', price: 999999999, quantity: 1 }
          ]
        }
      ]
      
      const totals = await service.calculateOrderTotals(orders)
      
      expect(totals.totalRevenue).toBe(999999999)
      expect(totals.averageOrderValue).toBe(999999999)
      expect(totals.totalItems).toBe(1)
    })

    test('should handle decimal prices correctly', async () => {
      const orders: Order[] = [
        {
          id: '1',
          customer_id: 'customer-1',
          total_amount: 123.45,
          status: 'completed',
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z',
          items: [
            { id: '1', product_id: 'product-1', price: 12.34, quantity: 5 },
            { id: '2', product_id: 'product-2', price: 61.75, quantity: 1 }
          ]
        }
      ]
      
      const totals = await service.calculateOrderTotals(orders)
      
      expect(totals.totalRevenue).toBe(123.45) // (12.34*5) + (61.75*1)
      expect(totals.averageOrderValue).toBe(123.45)
      expect(totals.totalItems).toBe(2)
    })
  })

  describe('getOrderStatistics()', () => {
    test('should calculate order statistics for valid data', async () => {
      const orders: Order[] = [
        {
          id: '1',
          customer_id: 'customer-1',
          total_amount: 100,
          status: 'completed',
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z',
          items: []
        },
        {
          id: '2',
          customer_id: 'customer-2',
          total_amount: 200,
          status: 'pending',
          created_at: '2024-01-02T10:00:00Z',
          updated_at: '2024-01-02T10:00:00Z',
          items: []
        },
        {
          id: '3',
          customer_id: 'customer-3',
          total_amount: 150,
          status: 'completed',
          created_at: '2024-01-03T10:00:00Z',
          updated_at: '2024-01-03T10:00:00Z',
          items: []
        }
      ]
      
      const stats = await service.getOrderStatistics(orders)
      
      expect(stats.totalOrders).toBe(3)
      expect(stats.statusCounts).toEqual({
        'completed': 2,
        'pending': 1
      })
    })

    test('should handle empty array for statistics', async () => {
      const stats = await service.getOrderStatistics([])
      
      expect(stats.totalOrders).toBe(0)
      expect(stats.statusCounts).toEqual({})
    })

    test('should handle undefined data for statistics', async () => {
      const stats = await service.getOrderStatistics(undefined as any)
      
      expect(stats.totalOrders).toBe(0)
      expect(stats.statusCounts).toEqual({})
    })

    test('should handle orders with duplicate statuses', async () => {
      const orders: Order[] = [
        {
          id: '1',
          customer_id: 'customer-1',
          total_amount: 100,
          status: 'pending',
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z',
          items: []
        },
        {
          id: '2',
          customer_id: 'customer-2',
          total_amount: 200,
          status: 'pending',
          created_at: '2024-01-02T10:00:00Z',
          updated_at: '2024-01-02T10:00:00Z',
          items: []
        },
        {
          id: '3',
          customer_id: 'customer-3',
          total_amount: 150,
          status: 'pending',
          created_at: '2024-01-03T10:00:00Z',
          updated_at: '2024-01-03T10:00:00Z',
          items: []
        }
      ]
      
      const stats = await service.getOrderStatistics(orders)
      
      expect(stats.totalOrders).toBe(3)
      expect(stats.statusCounts).toEqual({
        'pending': 3
      })
    })

    test('should handle orders with special character statuses', async () => {
      const orders: Order[] = [
        {
          id: '1',
          customer_id: 'customer-1',
          total_amount: 100,
          status: 'pending-review@#$',
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z',
          items: []
        }
      ]
      
      const stats = await service.getOrderStatistics(orders)
      
      expect(stats.totalOrders).toBe(1)
      expect(stats.statusCounts).toEqual({
        'pending-review@#$': 1
      })
    })
  })

  describe('Edge Cases and Error Scenarios', () => {
    test('should handle null orders array', async () => {
      const totals = await service.calculateOrderTotals(null as any)
      
      expect(totals.totalRevenue).toBe(0)
      expect(totals.averageOrderValue).toBe(0)
      expect(totals.totalItems).toBe(0)
    })

    test('should handle orders with null items', async () => {
      const orders: Order[] = [
        {
          id: '1',
          customer_id: 'customer-1',
          total_amount: 100,
          status: 'completed',
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z',
          items: null as any
        }
      ]
      
      const totals = await service.calculateOrderTotals(orders)
      
      expect(totals.totalRevenue).toBe(0)
      expect(totals.averageOrderValue).toBe(0)
      expect(totals.totalItems).toBe(0)
    })

    test('should handle mixed valid and invalid orders', async () => {
      const orders: Order[] = [
        {
          id: '1',
          customer_id: 'customer-1',
          total_amount: 100,
          status: 'completed',
          created_at: '2024-01-01T10:00:00Z',
          updated_at: '2024-01-01T10:00:00Z',
          items: [
            { id: '1', product_id: 'product-1', price: 100, quantity: 1 }
          ]
        },
        {
          id: '2',
          customer_id: 'customer-2',
          total_amount: 50,
          status: 'pending',
          created_at: '2024-01-02T10:00:00Z',
          updated_at: '2024-01-02T10:00:00Z',
          items: undefined as any
        }
      ]
      
      const totals = await service.calculateOrderTotals(orders)
      
      expect(totals.totalRevenue).toBe(100) // Only valid order counted
      expect(totals.averageOrderValue).toBe(50) // 100/2 orders
      expect(totals.totalItems).toBe(1) // Only valid items counted
    })
  })
})