import express from 'express';
import { createRefund } from '../controllers/refundController';
import { authenticate } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/create', authenticate, createRefund);

export default router;
