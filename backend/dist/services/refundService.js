"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefundService = void 0;
const supabase_1 = require("../config/supabase");
class RefundService {
    async processRefund(orderId) {
        // Update order status in DB
        const { data, error } = await supabase_1.supabaseAdmin
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
exports.RefundService = RefundService;
