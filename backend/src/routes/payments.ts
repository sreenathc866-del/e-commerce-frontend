import express from 'express';
import { createOrder, verifyPayment } from '../controllers/paymentController';
import { authenticate } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validationMiddleware';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Stricter rate limit for payments
const paymentLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute per IP
  message: 'Too many payment requests, please try again later'
});

const createOrderSchema = z.object({
  body: z.object({
    customerId: z.string().uuid(),
    addressId: z.string().uuid(),
    items: z.array(z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().positive()
    }))
  })
});

const verifyPaymentSchema = z.object({
  body: z.object({
    razorpay_order_id: z.string().min(1),
    razorpay_payment_id: z.string().min(1),
    razorpay_signature: z.string().min(1)
  })
});

router.post('/create-order', authenticate, paymentLimiter, validateRequest(createOrderSchema), createOrder);
router.post('/verify-payment', authenticate, paymentLimiter, validateRequest(verifyPaymentSchema), verifyPayment);

export default router;
