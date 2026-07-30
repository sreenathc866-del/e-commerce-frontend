import { Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';

export const getWallet = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = (req as any).user?.id;
    if (!vendorId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { data: wallet, error } = await supabaseAdmin
      .from('vendor_wallet')
      .select('*')
      .eq('vendor_id', vendorId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    res.status(200).json(wallet || { available_balance: 0, pending_balance: 0 });
  } catch (error: any) {
    console.error('Error fetching wallet:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

export const getWalletHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const vendorId = (req as any).user?.id;
    if (!vendorId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { data: history, error } = await supabaseAdmin
      .from('vendor_wallet_transactions')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json(history || []);
  } catch (error: any) {
    console.error('Error fetching wallet history:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};
