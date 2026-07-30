import { Router } from 'express';
import { getWallet, getWalletHistory } from '../controllers/walletController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Protect endpoints for vendors only
router.use(authenticate);

router.get('/', getWallet);
router.get('/history', getWalletHistory);

export default router;
