"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const paymentController_1 = require("../controllers/paymentController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const validationMiddleware_1 = require("../middleware/validationMiddleware");
const zod_1 = require("zod");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const router = express_1.default.Router();
// Stricter rate limit for payments
const paymentLimiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5, // 5 requests per minute per IP
    message: 'Too many payment requests, please try again later'
});
const createOrderSchema = zod_1.z.object({
    body: zod_1.z.object({
        customerId: zod_1.z.string().uuid(),
        addressId: zod_1.z.string().uuid(),
        items: zod_1.z.array(zod_1.z.object({
            productId: zod_1.z.string().uuid(),
            quantity: zod_1.z.number().int().positive()
        }))
    })
});
const verifyPaymentSchema = zod_1.z.object({
    body: zod_1.z.object({
        razorpay_order_id: zod_1.z.string().min(1),
        razorpay_payment_id: zod_1.z.string().min(1),
        razorpay_signature: zod_1.z.string().min(1)
    })
});
router.post('/create-order', authMiddleware_1.authenticate, paymentLimiter, (0, validationMiddleware_1.validateRequest)(createOrderSchema), paymentController_1.createOrder);
router.post('/verify-payment', authMiddleware_1.authenticate, paymentLimiter, (0, validationMiddleware_1.validateRequest)(verifyPaymentSchema), paymentController_1.verifyPayment);
exports.default = router;
