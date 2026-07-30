"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPayment = exports.createOrder = void 0;
const razorpay_1 = require("../config/razorpay");
const crypto_1 = __importDefault(require("crypto"));
const supabase_1 = require("../config/supabase");
const walletService_1 = require("../services/walletService");
const walletService = new walletService_1.WalletService();
// Helper to handle creating a new order
const createOrder = async (req, res) => {
    try {
        const { customerId, addressId, items } = req.body;
        if (!customerId || !addressId || !items || !Array.isArray(items) || items.length === 0) {
            res.status(400).json({ error: 'Missing required fields: customerId, addressId, items' });
            return;
        }
        // 1. Calculate the final amount securely on the backend
        const productIds = items.map(item => item.productId);
        const { data: dbProducts, error: dbProductsError } = await supabase_1.supabaseAdmin
            .from('products')
            .select(`
        id, 
        price, 
        shop_id,
        shops ( vendor_id )
      `)
            .in('id', productIds);
        if (dbProductsError || !dbProducts) {
            res.status(400).json({ error: 'Failed to fetch product pricing' });
            return;
        }
        // Map products for fast lookup
        const productMap = new Map(dbProducts.map(p => [p.id, p]));
        // Calculate total item price and grouped transfers
        let grossAmount = 0;
        const orderItemsRows = [];
        const shopTotals = {};
        for (const item of items) {
            const dbProduct = productMap.get(item.productId);
            if (!dbProduct) {
                res.status(400).json({ error: 'Product not found: ' + item.productId });
                return;
            }
            const itemGross = dbProduct.price * item.quantity;
            grossAmount += itemGross;
            const vendorId = Array.isArray(dbProduct.shops) ? dbProduct.shops[0]?.vendor_id : dbProduct.shops?.vendor_id;
            // Calculate 95% for vendor, 5% for platform (can be from .env)
            const commissionPercentage = Number(process.env.PLATFORM_COMMISSION_PERCENTAGE || 5);
            const commissionAmount = (itemGross * commissionPercentage) / 100;
            const vendorAmount = itemGross - commissionAmount;
            orderItemsRows.push({
                product_id: item.productId,
                shop_id: dbProduct.shop_id,
                quantity: item.quantity,
                unit_price: dbProduct.price,
                gross_amount: itemGross,
                commission: commissionAmount,
                vendor_amount: vendorAmount
            });
        }
        // Note: We are ignoring shipping and tax in this simplified backend calculation for now,
        // but in a real app, we would fetch those from the shop settings and add them.
        const finalAmount = grossAmount;
        // 2. Create the Razorpay Order (Standard Checkout)
        const options = {
            amount: Math.round(finalAmount * 100), // amount in paise
            currency: 'INR',
            receipt: 'rcpt_' + Date.now()
        };
        const razorpayOrder = await razorpay_1.razorpay.orders.create(options);
        // 3. Create the pending order in the database
        const { data: order, error: orderError } = await supabase_1.supabaseAdmin
            .from('orders')
            .insert({
            customer_id: customerId,
            shipping_address_id: addressId,
            total_amount: finalAmount,
            status: 'pending',
            payment_status: 'pending',
            payment_method: 'razorpay',
            razorpay_order_id: razorpayOrder.id
        })
            .select()
            .single();
        if (orderError) {
            console.error('Failed to insert order', orderError);
            res.status(500).json({ error: 'Failed to insert order in database' });
            return;
        }
        // 4. Create the order items
        const orderItemsWithOrderId = orderItemsRows.map(row => ({
            ...row,
            order_id: order.id
        }));
        const { error: itemsError } = await supabase_1.supabaseAdmin
            .from('order_items')
            .insert(orderItemsWithOrderId);
        if (itemsError) {
            console.error('Failed to insert order items', itemsError);
            res.status(500).json({ error: 'Failed to insert order items in database' });
            return;
        }
        // 5. Return the Razorpay order parameters to the client
        res.status(200).json(razorpayOrder);
    }
    catch (error) {
        console.error('Error in createOrder:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};
exports.createOrder = createOrder;
// Helper to verify a payment
const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            res.status(400).json({ error: 'Missing required Razorpay verification fields' });
            return;
        }
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto_1.default
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
            .update(sign.toString())
            .digest('hex');
        if (razorpay_signature !== expectedSign) {
            res.status(400).json({ error: 'Invalid payment signature' });
            return;
        }
        const { data: order, error: fetchError } = await supabase_1.supabaseAdmin
            .from('orders')
            .select('id, status')
            .eq('razorpay_order_id', razorpay_order_id)
            .single();
        if (fetchError || !order) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }
        const { data: updatedOrder, error: updateError } = await supabase_1.supabaseAdmin
            .from('orders')
            .update({
            status: 'confirmed',
            payment_status: 'paid',
            razorpay_payment_id: razorpay_payment_id
        })
            .eq('id', order.id)
            .select()
            .single();
        if (updateError || !updatedOrder) {
            res.status(404).json({ error: 'Order not found for this payment' });
            return;
        }
        // removed payment_logs insertion since table doesn't exist
        // 4. Update the order items and credit vendor wallets
        const { data: orderItems, error: fetchItemsError } = await supabase_1.supabaseAdmin
            .from('order_items')
            .select(`
        id, 
        gross_amount, 
        commission, 
        vendor_amount,
        shops ( vendor_id )
      `)
            .eq('order_id', updatedOrder.id);
        if (orderItems && !fetchItemsError) {
            for (const item of orderItems) {
                const vendorId = Array.isArray(item.shops) ? item.shops[0]?.vendor_id : item.shops?.vendor_id;
                // if (vendorId) {
                //   await walletService.creditVendor(
                //     vendorId, 
                //     updatedOrder.id, 
                //     Number(item.gross_amount), 
                //     Number(item.commission), 
                //     Number(item.vendor_amount)
                //   );
                // }
            }
        }
        // 5. Store the transaction details
        await supabase_1.supabaseAdmin
            .from('transactions')
            .insert({
            order_id: updatedOrder.id,
            payment_id: razorpay_payment_id,
            amount: updatedOrder.total_amount,
            status: 'success'
        });
        res.status(200).json({ message: 'Payment verified successfully' });
    }
    catch (error) {
        console.error('Error in verifyPayment:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};
exports.verifyPayment = verifyPayment;
