// CHALLENGE 3: Fixed OrdersService
// This file should contain your fixed service code

import {supabase} from '@/lib/supabase/server'
import { Order } from './types'

// TODO: Fix the OrdersService here
// You need to:
// 1. Handle undefined data properly
// 2. Add proper error handling
// 3. Add data validation
// 4. Add TypeScript types
// 5. Add logging for debugging

export class OrdersService {

  async getOrders(): Promise<Order[]> {
    // TODO: Fix this method
    const { data, error } = await supabase
      .from('orders')
      .select('*');

    if (error) {
      console.error("Error fetching orders:", error.message);
      return [];
    }
  
    // If data is undefined, return an empty array instead of undefined
    return data;
  }
  
  async getOrderById(id: string): Promise<Order | null> {
    // TODO: Fix this method
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error("Error fetching order by id:" +id, error.message);
      if(error.code === 'PGRST116'){
        throw new Error('No order found with id: ' + id);
      }
      return null;
    }

    // This can also be undefined
    return data
  }
}
