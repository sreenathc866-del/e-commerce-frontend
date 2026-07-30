"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const supabase_1 = require("../config/supabase");
class WalletService {
    /**
     * Adds earnings to a vendor's wallet.
     * @param vendorId The UUID of the vendor
     * @param orderId The UUID of the order
     * @param grossAmount Total product price
     * @param commission Platform commission deducted
     * @param netAmount Final amount credited to vendor
     */
    async creditVendor(vendorId, orderId, grossAmount, commission, netAmount) {
        // 1. Get or create wallet for vendor
        const { data: wallet, error: walletError } = await supabase_1.supabaseAdmin
            .from('vendor_wallet')
            .select('*')
            .eq('vendor_id', vendorId)
            .single();
        if (walletError && walletError.code !== 'PGRST116') {
            console.error('Error fetching wallet:', walletError);
            throw walletError;
        }
        if (!wallet) {
            // Create wallet
            const { error: insertError } = await supabase_1.supabaseAdmin.from('vendor_wallet').insert({
                vendor_id: vendorId,
                available_balance: netAmount,
                pending_balance: 0
            });
            if (insertError)
                throw insertError;
        }
        else {
            // Update wallet balance
            const { error: updateError } = await supabase_1.supabaseAdmin.from('vendor_wallet').update({
                available_balance: Number(wallet.available_balance) + netAmount,
                updated_at: new Date().toISOString()
            }).eq('id', wallet.id);
            if (updateError)
                throw updateError;
        }
        // 2. Insert transaction log
        const { error: txError } = await supabase_1.supabaseAdmin.from('vendor_wallet_transactions').insert({
            vendor_id: vendorId,
            order_id: orderId,
            gross_amount: grossAmount,
            commission: commission,
            net_amount: netAmount,
            transaction_type: 'Order Credit'
        });
        if (txError)
            throw txError;
    }
}
exports.WalletService = WalletService;
