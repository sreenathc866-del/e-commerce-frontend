"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWalletHistory = exports.getWallet = void 0;
const supabase_1 = require("../config/supabase");
const getWallet = async (req, res) => {
    try {
        const vendorId = req.user?.id;
        if (!vendorId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { data: wallet, error } = await supabase_1.supabaseAdmin
            .from('vendor_wallet')
            .select('*')
            .eq('vendor_id', vendorId)
            .single();
        if (error && error.code !== 'PGRST116') {
            throw error;
        }
        res.status(200).json(wallet || { available_balance: 0, pending_balance: 0 });
    }
    catch (error) {
        console.error('Error fetching wallet:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};
exports.getWallet = getWallet;
const getWalletHistory = async (req, res) => {
    try {
        const vendorId = req.user?.id;
        if (!vendorId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { data: history, error } = await supabase_1.supabaseAdmin
            .from('vendor_wallet_transactions')
            .select('*')
            .eq('vendor_id', vendorId)
            .order('created_at', { ascending: false });
        if (error)
            throw error;
        res.status(200).json(history || []);
    }
    catch (error) {
        console.error('Error fetching wallet history:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};
exports.getWalletHistory = getWalletHistory;
