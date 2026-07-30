import express from 'express';
import { getTransactions, getAllWithdrawals, updateWithdrawalStatus } from '../controllers/adminController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/transactions', authenticate, getTransactions);
router.get('/withdrawals', authenticate, getAllWithdrawals);
router.patch('/withdrawals/:id', authenticate, updateWithdrawalStatus);

export default router;
