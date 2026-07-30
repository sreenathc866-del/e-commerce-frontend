import { Router } from 'express';
import { getWithdrawals, requestWithdrawal, getBankAccounts, addBankAccount } from '../controllers/withdrawalController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getWithdrawals);
router.post('/', requestWithdrawal);

router.get('/banks', getBankAccounts);
router.post('/banks', addBankAccount);

export default router;
