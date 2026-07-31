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
    const shopId = shop.id;

    // 1. Fetch Earnings & Orders, joining orders
    const { data: orderItems } = await supabaseAdmin
      .from('order_items')
      .select(`
        vendor_amount,
        commission,
        order_id,
        quantity,
        unit_price,
        orders (id, status, customer_id)
      `)
      .eq('shop_id', shopId);

    let revenue = 0;
    let commissionDeducted = 0;
    const uniqueOrders = new Set();
    const uniqueCustomers = new Set();

    let pending = 0;
    let processing = 0;
    let shipped = 0;
    let delivered = 0;

    orderItems?.forEach((item: any) => {
      const order = Array.isArray(item.orders) ? item.orders[0] : item.orders;
      const status = (order?.status || '').toLowerCase();
      if (!order || status === 'pending') return; // Skip pending/unpaid orders

      // Calculate revenue (vendor_amount or fallback to gross amount)
      const gross = (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);
      revenue += item.vendor_amount !== null ? Number(item.vendor_amount) : gross;
      commissionDeducted += Number(item.commission || 0);

      if (!uniqueOrders.has(item.order_id)) {
        uniqueOrders.add(item.order_id);
        uniqueCustomers.add(order.customer_id);
        if (status === 'confirmed' || status === 'packed') processing++;
        else if (status === 'shipped') shipped++;
        else if (status === 'delivered') delivered++;
      }
    });

    // Fetch Products Count
    const { count: productsCount } = await supabaseAdmin
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('shop_id', shopId);

    // Fetch Out of Stock Inventory
    // products!inner(shop_id) ensures we only check products belonging to this shop
    const { data: inventory } = await supabaseAdmin
      .from('inventory')
      .select('stock_quantity, products!inner(shop_id)')
      .eq('products.shop_id', shopId)
      .eq('stock_quantity', 0);

    const outOfStock = inventory?.length || 0;

    return { 
      total_payouts: 0, 
      pending: 0, // Pending payouts
      revenue,
      commission_deducted: commissionDeducted,
      orders_count: uniqueOrders.size,
      customers_count: uniqueCustomers.size,
      products_count: productsCount || 0,
      order_statuses: {
        pending,
        processing,
        shipped,
        delivered,
        outOfStock
      },
      recent_transfers: []
    };
  }
}
