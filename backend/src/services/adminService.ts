import { supabaseAdmin } from '../config/supabase';

export class AdminService {
  /**
   * Fetch comprehensive stats for the Admin Dashboard
   */
  async getDashboardStats() {
    // 1. Transactions (Revenue, Success Rate, Failed Payments, Recent)
    const { data: transactions, error: txError } = await supabaseAdmin
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (txError) throw new Error(txError.message);

    let totalRevenue = 0;
    let successCount = 0;
    let failedCount = 0;

    transactions.forEach(tx => {
      if (tx.status === 'success') {
        totalRevenue += Number(tx.amount);
        successCount++;
      } else if (tx.status === 'failed') {
        failedCount++;
      }
    });

    const successRate = (successCount + failedCount) > 0 
      ? Math.round((successCount / (successCount + failedCount)) * 100) 
      : 0;

    // 2. Commission
    const { data: orderItems, error: itemsError } = await supabaseAdmin
      .from('order_items')
      .select('commission, vendor_amount');

    let totalCommission = 0;
    if (!itemsError && orderItems) {
      orderItems.forEach(item => {
        if (item.commission) totalCommission += Number(item.commission);
      });
    }

    // 3. Vendor Payouts & Pending Transfers
    const { data: transfers, error: tfError } = await supabaseAdmin
      .from('razorpay_transfers')
      .select('amount, status');

    let vendorPayouts = 0;
    let pendingTransfers = 0;

    if (!tfError && transfers) {
      transfers.forEach(tf => {
        if (tf.status === 'processed') vendorPayouts += Number(tf.amount);
        else pendingTransfers += Number(tf.amount);
      });
    }

    // 4. Vendors Count
    const { count: vendorCount } = await supabaseAdmin
      .from('vendors')
      .select('*', { count: 'exact', head: true });

    return {
      totalRevenue,
      totalCommission,
      vendorPayouts,
      pendingTransfers,
      failedPayments: failedCount,
      successRate,
      activeVendors: vendorCount || 0,
      recentTransactions: transactions.slice(0, 10)
    };
  }
}
