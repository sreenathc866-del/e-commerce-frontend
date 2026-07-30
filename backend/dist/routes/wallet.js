"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const walletController_1 = require("../controllers/walletController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Protect endpoints for vendors only
router.use(authMiddleware_1.authenticate);
router.get('/', walletController_1.getWallet);
router.get('/history', walletController_1.getWalletHistory);
exports.default = router;
