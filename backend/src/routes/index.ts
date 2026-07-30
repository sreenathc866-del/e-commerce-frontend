import { Router } from 'express';
import authRoutes from './auth';
import vendorRoutes from './vendor';
import customerRoutes from './customer';
import productRoutes from './products';
import orderRoutes from './orders';
import paymentRoutes from './payments';
import adminRoutes from './admin';
import refundRoutes from './refunds';
import walletRoutes from './wallet';
import withdrawalRoutes from './withdrawals';

const router = Router();

router.use('/auth', authRoutes);
router.use('/vendor', vendorRoutes);
router.use('/customer', customerRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/admin', adminRoutes);
router.use('/refunds', refundRoutes);
router.use('/wallet', walletRoutes);
router.use('/withdrawals', withdrawalRoutes);
export default router;
