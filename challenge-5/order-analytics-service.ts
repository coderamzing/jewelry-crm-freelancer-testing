// CHALLENGE 5: Fixed OrderAnalyticsService
// This file should contain your fixed service code

// TODO: Fix the OrderAnalyticsService here
// You need to:
// 1. Handle undefined data properly
// 2. Add proper error handling
// 3. Add data validation
// 4. Add TypeScript types
// 5. Add logging for debugging

import { Order, OrderTotals, OrderStatistics, OrderItem } from './types'

export class OrderAnalyticsService {

  orderItems(order: Order): OrderItem[] {
    return Array.isArray(order.items) ? order.items : [];
  }

  async calculateOrderTotals(orders: Order[]): Promise<OrderTotals> {
    
    if (!Array.isArray(orders) || orders.length === 0) {
      return { totalRevenue: 0, averageOrderValue: 0, totalItems: 0 };
    }

    const totalRevenue = orders.reduce((sum: number, order: Order) => {
      return sum + this.orderItems(order).reduce((itemSum: number, item: OrderItem) => {
        return itemSum + (item.price * item.quantity)
      }, 0)
    }, 0)
    
    const averageOrderValue = totalRevenue / orders.length
    
    const totalItems = orders.reduce((sum: number, order: Order) => {
      return sum + this.orderItems(order).length
    }, 0)
    
    return { totalRevenue, averageOrderValue, totalItems }
  }
  
  async getOrderStatistics(orders: Order[]): Promise<OrderStatistics> {
    if (!Array.isArray(orders) || orders.length === 0) {
      return { totalOrders: 0, statusCounts: {}};
    }

    const totalOrders = orders.length
    
    const statusCounts = orders.reduce((counts: Record<string, number>, order) => {
      counts[order.status] = (counts[order.status] || 0) + 1
      return counts
    }, {})
    
    return { totalOrders, statusCounts }
  }
}
