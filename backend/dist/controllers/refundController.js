"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRefund = void 0;
const refundService_1 = require("../services/refundService");
const refundService = new refundService_1.RefundService();
const createRefund = async (req, res) => {
    try {
        const { paymentId, amount, orderId, reason } = req.body;
        if (!paymentId || !amount || !orderId) {
            return res.status(400).json({ error: 'paymentId, amount, and orderId are required' });
        }
        const refund = await refundService.processRefund(orderId);
        res.status(200).json({ success: true, refund });
    }
    catch (error) {
        console.error('Error creating refund:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};
exports.createRefund = createRefund;
