import { Request, Response } from 'express';
import { RefundService } from '../services/refundService';

const refundService = new RefundService();

export const createRefund = async (req: Request, res: Response) => {
  try {
    const { paymentId, amount, orderId, reason } = req.body;
    
    if (!paymentId || !amount || !orderId) {
      return res.status(400).json({ error: 'paymentId, amount, and orderId are required' });
    }

    const refund = await refundService.processRefund(orderId);
    
    res.status(200).json({ success: true, refund });
  } catch (error: any) {
    console.error('Error creating refund:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};
