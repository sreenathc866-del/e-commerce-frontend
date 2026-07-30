import { Request, Response } from 'express';
import { VendorService } from '../services/vendorService';

const vendorService = new VendorService();

export const getBalance = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const balance = await vendorService.getVendorBalance(user.id);
    res.status(200).json(balance);
  } catch (error: any) {
    console.error('Error fetching vendor balance:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};
