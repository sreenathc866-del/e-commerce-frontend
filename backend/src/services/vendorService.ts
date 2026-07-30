import { supabaseAdmin } from '../config/supabase';

export class VendorService {
  /**
   * Fetch total balance / payouts / stats for a vendor
   */
  async getVendorBalance(userId: string) {
    const { data: shop } = await supabaseAdmin
      .from('shops')
      .select('id')
      .eq('vendor_id', userId)
      .single();

    if (!shop) throw new Error('Shop not found');

    // 1. Fetch Earnings & Orders
    const { data: orderItems } = await supabaseAdmin
      .from('order_items')
      .select('vendor_amount, commission, order_id')
      .eq('vendor_id', userId);

    let revenue = 0;
    let commissionDeducted = 0;
    const uniqueOrders = new Set();

    orderItems?.forEach(item => {
      revenue += Number(item.vendor_amount);
      commissionDeducted += Number(item.commission || 0);
      uniqueOrders.add(item.order_id);
    });

    return { 
      total_payouts: 0, 
      pending: 0,
      revenue,
      commission_deducted: commissionDeducted,
      orders_count: uniqueOrders.size,
      recent_transfers: []
    };
  }
}
