import { Request, Response } from 'express';
import { AdminService } from '../services/adminService';
import { supabaseAdmin } from '../config/supabase';

const adminService = new AdminService();

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.status(200).json(stats);
  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const getAllWithdrawals = async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('withdrawal_requests')
      .select(`
        *,
        vendor_bank_accounts (*)
      `)
      .order('requested_at', { ascending: false });

    if (error) throw error;
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateWithdrawalStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // Approved, Rejected, Paid

    if (!['Approved', 'Rejected', 'Paid'].includes(status)) {
      res.status(400).json({ error: 'Invalid status' });
      return;
    }

    // Fetch the request
    const { data: request, error: fetchError } = await supabaseAdmin
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

    const updates: any = { status };
    if (status === 'Approved') updates.approved_at = new Date().toISOString();
    if (status === 'Paid') updates.paid_at = new Date().toISOString();

    const { data: updatedRequest, error: updateError } = await supabaseAdmin
      .from('withdrawal_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Handle wallet balances if Paid or Rejected
    const { data: wallet, error: walletError } = await supabaseAdmin
      .from('vendor_wallet')
      .select('*')
      .eq('vendor_id', request.vendor_id)
      .single();

    if (wallet && !walletError) {
      if (status === 'Paid') {
        // Remove from pending_balance entirely
        const newPending = Number(wallet.pending_balance) - Number(request.amount);
        await supabaseAdmin
          .from('vendor_wallet')
          .update({ pending_balance: Math.max(0, newPending) })
          .eq('id', wallet.id);
      } else if (status === 'Rejected') {
        // Return to available, subtract from pending
        const newPending = Number(wallet.pending_balance) - Number(request.amount);
        const newAvailable = Number(wallet.available_balance) + Number(request.amount);
        await supabaseAdmin
          .from('vendor_wallet')
          .update({ 
            available_balance: newAvailable, 
            pending_balance: Math.max(0, newPending) 
          })
          .eq('id', wallet.id);
          
        // Revert transaction log
        await supabaseAdmin
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
  } catch (error: any) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: error.message });
  }
};
