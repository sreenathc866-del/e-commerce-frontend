"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBalance = void 0;
const vendorService_1 = require("../services/vendorService");
const vendorService = new vendorService_1.VendorService();
const getBalance = async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const balance = await vendorService.getVendorBalance(user.id);
        res.status(200).json(balance);
    }
    catch (error) {
        console.error('Error fetching vendor balance:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};
exports.getBalance = getBalance;
