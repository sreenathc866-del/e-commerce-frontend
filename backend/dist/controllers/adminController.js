"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWithdrawalStatus = exports.getAllWithdrawals = exports.getTransactions = void 0;
const adminService_1 = require("../services/adminService");
const supabase_1 = require("../config/supabase");
const adminService = new adminService_1.AdminService();
const getTransactions = async (req, res) => {
    try {
        const stats = await adminService.getDashboardStats();
        res.status(200).json(stats);
    }
    catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};
exports.getTransactions = getTransactions;
const getAllWithdrawals = async (req, res) => {
    try {
        const { data, error } = await supabase_1.supabaseAdmin
            .from('withdrawal_requests')
            .select(`
        *,
        vendor_bank_accounts (*)
      `)
            .order('requested_at', { ascending: false });
        if (error)
            throw error;
        res.status(200).json(data);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getAllWithdrawals = getAllWithdrawals;
const updateWithdrawalStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // Approved, Rejected, Paid
        if (!['Approved', 'Rejected', 'Paid'].includes(status)) {
            res.status(400).json({ error: 'Invalid status' });
            return;
        }
        // Fetch the request
        const { data: request, error: fetchError } = await supabase_1.supabaseAdmin
            .from('withdrawal_requests')
            .select('*')
            .eq('id', id)
            .single();
        if (fetchError || !request) {
            res.status(404).json({ error: 'Request not found' });
            return;
        }
        if (request.status === 'Paid' || request.status === 'Rejected') {
            res.status(400).json({ error: `Cannot update a ${request.status} request` });
            return;
        }
        const updates = { status };
        if (status === 'Approved')
            updates.approved_at = new Date().toISOString();
        if (status === 'Paid')
            updates.paid_at = new Date().toISOString();
        const { data: updatedRequest, error: updateError } = await supabase_1.supabaseAdmin
            .from('withdrawal_requests')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (updateError)
            throw updateError;
        // Handle wallet balances if Paid or Rejected
        const { data: wallet, error: walletError } = await supabase_1.supabaseAdmin
            .from('vendor_wallet')
            .select('*')
            .eq('vendor_id', request.vendor_id)
            .single();
        if (wallet && !walletError) {
            if (status === 'Paid') {
                // Remove from pending_balance entirely
                const newPending = Number(wallet.pending_balance) - Number(request.amount);
                await supabase_1.supabaseAdmin
                    .from('vendor_wallet')
                    .update({ pending_balance: Math.max(0, newPending) })
                    .eq('id', wallet.id);
            }
            else if (status === 'Rejected') {
                // Return to available, subtract from pending
                const newPending = Number(wallet.pending_balance) - Number(request.amount);
                const newAvailable = Number(wallet.available_balance) + Number(request.amount);
                await supabase_1.supabaseAdmin
                    .from('vendor_wallet')
                    .update({
                    available_balance: newAvailable,
                    pending_balance: Math.max(0, newPending)
                })
                    .eq('id', wallet.id);
                // Revert transaction log
                await supabase_1.supabaseAdmin
                    .from('vendor_wallet_transactions')
                    .insert({
                    vendor_id: request.vendor_id,
                    gross_amount: Number(request.amount),
                    commission: 0,
                    net_amount: Number(request.amount),
                    transaction_type: 'Refund/Adjustment'
                });
            }
        }
        res.status(200).json(updatedRequest);
    }
    catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ error: error.message });
    }
};
exports.updateWithdrawalStatus = updateWithdrawalStatus;
