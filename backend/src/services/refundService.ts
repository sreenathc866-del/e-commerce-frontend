import { supabaseAdmin } from '../config/supabase';

export class RefundService {
  async processRefund(orderId: string) {
    // Update order status in DB
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update({ status: 'refunded', payment_status: 'refunded' })
      .eq('id', orderId)
      .select()
      .single();

    if (error || !data) {
      throw new Error('Failed to update order status');
    }

    return data;
  }
}
