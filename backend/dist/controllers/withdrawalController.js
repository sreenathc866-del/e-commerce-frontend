"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addBankAccount = exports.getBankAccounts = exports.getWithdrawals = exports.requestWithdrawal = void 0;
const supabase_1 = require("../config/supabase");
// Withdrawals
const requestWithdrawal = async (req, res) => {
    try {
        const vendorId = req.user?.id;
        const { amount, bankAccountId } = req.body;
        if (!vendorId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        if (!amount || amount <= 0) {
            res.status(400).json({ error: 'Invalid amount' });
            return;
        }
        // Check bank account exists
        const { data: bankAccount } = await supabase_1.supabaseAdmin
            .from('vendor_bank_accounts')
            .select('*')
            .eq('id', bankAccountId)
            .eq('vendor_id', vendorId)
            .single();
        if (!bankAccount) {
            res.status(400).json({ error: 'Bank account not found' });
            return;
        }
        // Check wallet balance
        const { data: wallet, error: walletError } = await supabase_1.supabaseAdmin
            .from('vendor_wallet')
            .select('*')
            .eq('vendor_id', vendorId)
            .single();
        if (walletError || !wallet || Number(wallet.available_balance) < Number(amount)) {
            res.status(400).json({ error: 'Insufficient available balance' });
            return;
        }
        // Update wallet: deduct from available, add to pending
        const newAvailable = Number(wallet.available_balance) - Number(amount);
        const newPending = Number(wallet.pending_balance) + Number(amount);
        const { error: updateError } = await supabase_1.supabaseAdmin
            .from('vendor_wallet')
            .update({
            available_balance: newAvailable,
            pending_balance: newPending,
            updated_at: new Date().toISOString()
        })
            .eq('id', wallet.id);
        if (updateError)
            throw updateError;
        // Insert withdrawal request
        const { data: withdrawal, error: insertError } = await supabase_1.supabaseAdmin
            .from('withdrawal_requests')
            .insert({
            vendor_id: vendorId,
            amount: Number(amount),
            bank_account_id: bankAccountId,
            status: 'Pending'
        })
            .select()
            .single();
        if (insertError)
            throw insertError;
        // Log the transaction
        await supabase_1.supabaseAdmin
            .from('vendor_wallet_transactions')
            .insert({
            vendor_id: vendorId,
            gross_amount: Number(amount),
            commission: 0,
            net_amount: Number(amount),
            transaction_type: 'Withdrawal'
        });
        res.status(200).json({ message: 'Withdrawal requested successfully', withdrawal });
    }
    catch (error) {
        console.error('Error requesting withdrawal:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};
exports.requestWithdrawal = requestWithdrawal;
const getWithdrawals = async (req, res) => {
    try {
        const vendorId = req.user?.id;
        if (!vendorId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { data: withdrawals, error } = await supabase_1.supabaseAdmin
            .from('withdrawal_requests')
            .select(`
        *,
        vendor_bank_accounts (*)
      `)
            .eq('vendor_id', vendorId)
            .order('requested_at', { ascending: false });
        if (error)
            throw error;
        res.status(200).json(withdrawals || []);
    }
    catch (error) {
        console.error('Error fetching withdrawals:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};
exports.getWithdrawals = getWithdrawals;
// Bank Accounts
const getBankAccounts = async (req, res) => {
    try {
        const vendorId = req.user?.id;
        if (!vendorId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { data, error } = await supabase_1.supabaseAdmin
            .from('vendor_bank_accounts')
            .select('*')
            .eq('vendor_id', vendorId);
        if (error)
            throw error;
        res.status(200).json(data || []);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getBankAccounts = getBankAccounts;
const addBankAccount = async (req, res) => {
    try {
        const vendorId = req.user?.id;
        if (!vendorId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { account_holder_name, account_number, ifsc, bank_name } = req.body;
        if (!account_holder_name || !account_number || !ifsc || !bank_name) {
            res.status(400).json({ error: 'Missing required bank details' });
            return;
        }
        const { data, error } = await supabase_1.supabaseAdmin
            .from('vendor_bank_accounts')
            .insert({
            vendor_id: vendorId,
            account_holder_name,
            account_number,
            ifsc,
            bank_name,
            is_verified: true // Setting to true by default for demo
        })
            .select()
            .single();
        if (error)
            throw error;
        res.status(200).json(data);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.addBankAccount = addBankAccount;
