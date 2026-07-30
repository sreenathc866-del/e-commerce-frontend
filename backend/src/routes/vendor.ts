import express from 'express';
import { getBalance } from '../controllers/vendorController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();
router.get('/balance', authenticate, getBalance);

export default router;
