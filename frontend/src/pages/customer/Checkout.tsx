import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Truck, CreditCard, FileText, CheckCircle2, ChevronRight, Lock } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';
import { useEffect } from 'react';
import { supabase } from '../../lib/supabase';


const STEPS = [
  { id: 1, name: 'Address', icon: MapPin },
  { id: 2, name: 'Shipping', icon: Truck },
  { id: 3, name: 'Payment', icon: CreditCard },
  { id: 4, name: 'Summary', icon: FileText },
];

export default function Checkout() {
  const [currentStep, setCurrentStep] = useState(1);
  const { items, getSubtotal, getTotal, getTotalShipping, clearCart, updatePrice } = useCartStore();
  const navigate = useNavigate();

  const { user } = useAuthStore();
  
  const [address, setAddress] = useState({
    fullName: '', mobile: '', house: '', street: '', city: '', state: '', zip: '', country: 'US'
  });
  
  const [shippingMethod, setShippingMethod] = useState('standard');
  // force cache invalidation for frontend deployment build
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showProfileCompleteModal, setShowProfileCompleteModal] = useState(false);

  // Add a premium for express if selected, otherwise use shop shipping charge
  const shippingCost = shippingMethod === 'express' ? getTotalShipping() + 10.00 : getTotalShipping();
  const grandTotal = getTotal() + shippingCost;

  useEffect(() => {
    async function loadDefaultAddress() {
      if (user) {
        // Fetch default address
        const { data: defaultAddr } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_default', true)
          .maybeSingle();

        if (defaultAddr) {
          setAddress({
            fullName: defaultAddr.full_name || '',
            mobile: defaultAddr.mobile || user.phone || '',
            house: defaultAddr.address_line1 || '',
            street: defaultAddr.address_line2 || '',
            city: defaultAddr.city || '',
            state: defaultAddr.state || '',
            zip: defaultAddr.zip_code || '',
            country: defaultAddr.country || 'US'
          });
        } else {
          setAddress(prev => ({
            ...prev,
            fullName: user.full_name || '',
            mobile: user.phone || ''
          }));
        }
      }
    }
    loadDefaultAddress();
  }, [user]);

  // Sync cart prices with latest database prices to avoid Razorpay mismatches
  useEffect(() => {
    async function syncCartPrices() {
      if (!items || items.length === 0) return;
      const productIds = items.map(item => item.productId);
      
      const { data: latestProducts } = await supabase
        .from('products')
        .select('id, price')
        .in('id', productIds);
        
      if (latestProducts) {
        latestProducts.forEach(product => {
          const cartItem = items.find(i => i.productId === product.id);
          if (cartItem && cartItem.price !== Number(product.price)) {
            updatePrice(product.id, Number(product.price));
          }
        });
      }
    }
    syncCartPrices();
  }, [items.length]); // Only run when items array length changes, or on mount

  const getOrCreateAddress = async () => {
    let addressId = '';
    const { data: existingAddr } = await supabase
      .from('addresses')
      .select('id')
      .eq('user_id', user!.id)
      .eq('address_line1', address.house)
      .eq('zip_code', address.zip)
      .maybeSingle();

    if (existingAddr) {
      addressId = existingAddr.id;
    } else {
      const { data: newAddr, error: addrError } = await supabase
        .from('addresses')
        .insert({
          user_id: user!.id,
          full_name: address.fullName,
          mobile: address.mobile,
          address_line1: address.house,
          address_line2: address.street,
          city: address.city,
          state: address.state,
          zip_code: address.zip,
          country: address.country
        })
        .select()
        .single();

      if (addrError) throw addrError;
      addressId = newAddr.id;
    }
    return addressId;
  };

  const handleRazorpayPayment = async () => {
    if (!user) return;
    
    // Check if profile has phone number
    if (!user.phone && !address.mobile) {
      setShowProfileCompleteModal(true);
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Get or create address
      const addressId = await getOrCreateAddress();

      // 2. Create order on Backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          customerId: user.id,
          addressId: addressId,
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          }))
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to initiate payment');
      }

      const orderData = await response.json();

      // 3. Open Razorpay Checkout Modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Aura',
        description: 'Store Purchase',
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch(`${import.meta.env.VITE_API_URL}/payments/verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            if (!verifyRes.ok) {
              const errData = await verifyRes.json().catch(() => ({}));
              throw new Error(errData.error || 'Payment verification failed');
            }

            clearCart();
            navigate('/customer/orders?success=true');
          } catch (err: any) {
            toast.error(err.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: address.fullName,
          email: user.email,
          contact: address.mobile || user.phone || '9999999999'
        },
        theme: {
          color: '#000000'
        }
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.on('payment.failed', function (response: any) {
        toast.error(`Payment failed: ${response.error.description}`);
      });
      rzp1.open();
      
      setIsProcessing(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to place order');
      setIsProcessing(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!address.fullName || !address.mobile || !address.house || !address.street || !address.city || !address.state || !address.zip) {
        toast.error("Please fill in all address fields to continue");
        return;
      }
    }
    
    if (currentStep < 4) {
      setCurrentStep(s => s + 1);
    } else if (currentStep === 4) {
      if (paymentMethod === 'razorpay') {
        handleRazorpayPayment();
      } else {
        // Handle COD flow here later...
        toast.info('Cash on Delivery selected (Mocked)');
      }
    }
  };

  if (items.length === 0 && !isProcessing) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <button onClick={() => navigate('/customer/search')} className="px-6 py-3 bg-black text-white rounded-full">Continue Shopping</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="mb-12">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">Checkout</h1>
        
        {/* Stepper */}
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-gray-800 -z-10 rounded-full" />
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-black dark:bg-white -z-10 rounded-full transition-all duration-500" 
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          />
          
          {STEPS.map((step) => (
            <div key={step.id} className="flex flex-col items-center gap-2 bg-gray-50 dark:bg-gray-950 px-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                currentStep >= step.id 
                  ? 'bg-black text-white dark:bg-white dark:text-black' 
                  : 'bg-gray-200 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
              }`}>
                {currentStep > step.id ? <CheckCircle2 className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
              </div>
              <span className={`text-xs font-bold ${currentStep >= step.id ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                {step.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        
        {/* Left Form Area */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-xl font-bold mb-6">Delivery Address</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Full Name" value={address.fullName} onChange={e => setAddress({...address, fullName: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900" />
                  <input type="tel" placeholder="Mobile Number" value={address.mobile} onChange={e => setAddress({...address, mobile: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900" />
                  <input type="text" placeholder="House / Flat No." value={address.house} onChange={e => setAddress({...address, house: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 md:col-span-2" />
                  <input type="text" placeholder="Street / Landmark" value={address.street} onChange={e => setAddress({...address, street: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 md:col-span-2" />
                  <input type="text" placeholder="City" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900" />
                  <input type="text" placeholder="State" value={address.state} onChange={e => setAddress({...address, state: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900" />
                  <input type="text" placeholder="PIN Code" value={address.zip} onChange={e => setAddress({...address, zip: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900" />
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-xl font-bold mb-6">Shipping Method</h2>
                <div className="space-y-4">
                  <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${shippingMethod === 'standard' ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-900' : 'border-gray-200 dark:border-gray-800'}`}>
                    <div className="flex items-center gap-4">
                      <input type="radio" name="shipping" checked={shippingMethod === 'standard'} onChange={() => setShippingMethod('standard')} className="w-5 h-5 text-black focus:ring-black" />
                      <div>
                        <h4 className="font-bold">Standard Delivery</h4>
                        <p className="text-sm text-gray-500">3-5 business days</p>
                      </div>
                    </div>
                    <span className="font-bold">₹15.00</span>
                  </label>
                  <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${shippingMethod === 'express' ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-900' : 'border-gray-200 dark:border-gray-800'}`}>
                    <div className="flex items-center gap-4">
                      <input type="radio" name="shipping" checked={shippingMethod === 'express'} onChange={() => setShippingMethod('express')} className="w-5 h-5 text-black focus:ring-black" />
                      <div>
                        <h4 className="font-bold">Express Delivery</h4>
                        <p className="text-sm text-gray-500">1-2 business days</p>
                      </div>
                    </div>
                    <span className="font-bold">₹25.00</span>
                  </label>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-xl font-bold mb-6">Payment Method</h2>
                <div className="space-y-4">
                  <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'razorpay' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-800'}`}>
                    <div className="flex items-center gap-4">
                      <input type="radio" name="payment" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className="w-5 h-5 text-indigo-600 focus:ring-indigo-600" />
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">Pay with Razorpay</h4>
                        <p className="text-sm text-gray-500">UPI, Cards, NetBanking, Wallets</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-10 h-6 bg-blue-600 rounded text-white text-[8px] font-bold flex items-center justify-center">VISA</div>
                      <div className="w-10 h-6 bg-red-500 rounded text-white text-[8px] font-bold flex items-center justify-center">MC</div>
                    </div>
                  </label>
                  <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-black dark:border-white bg-gray-50 dark:bg-gray-900' : 'border-gray-200 dark:border-gray-800'}`}>
                    <div className="flex items-center gap-4">
                      <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-5 h-5 text-black focus:ring-black" />
                      <div>
                        <h4 className="font-bold">Cash on Delivery</h4>
                        <p className="text-sm text-gray-500">Pay when you receive</p>
                      </div>
                    </div>
                  </label>
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-xl font-bold mb-6">Review Order</h2>
                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Shipping To</h4>
                    <p className="font-medium text-gray-900 dark:text-white">{address.fullName}, {address.house}</p>
                    <p className="text-gray-500">{address.street}, {address.city}, {address.state} {address.zip}, {address.mobile}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Method</h4>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">{shippingMethod} Delivery - {paymentMethod === 'razorpay' ? 'Paid via Razorpay' : 'Cash on Delivery'}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 flex items-center gap-4">
            {currentStep > 1 && (
              <button 
                onClick={() => setCurrentStep(s => s - 1)}
                className="px-6 py-3 rounded-full font-bold text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Back
              </button>
            )}
            <button 
              onClick={handleNext}
              disabled={isProcessing}
              className="px-8 py-3 bg-black text-white dark:bg-white dark:text-black rounded-full font-bold shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 ml-auto disabled:opacity-70 disabled:cursor-wait"
            >
              {isProcessing ? 'Processing Payment...' : currentStep === 4 ? `Pay ₹${grandTotal.toFixed(2)}` : 'Continue'} 
              {!isProcessing && currentStep < 4 && <ChevronRight className="w-5 h-5" />}
              {!isProcessing && currentStep === 4 && <Lock className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-xl p-8 sticky top-32">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Order Summary</h3>
            
            <div className="space-y-4 mb-6 max-h-[30vh] overflow-y-auto pr-2">
              {items.map(item => (
                <div key={item.id} className="flex gap-4">
                  <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
                  <div className="flex-1">
                    <h4 className="font-bold text-sm line-clamp-1">{item.name}</h4>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    <p className="font-bold text-sm">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 mb-6 text-sm text-gray-600 dark:text-gray-400 pt-6 border-t border-gray-100 dark:border-gray-800">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900 dark:text-white">₹{getSubtotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-medium text-gray-900 dark:text-white">₹{shippingCost.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
              <div className="flex justify-between items-end">
                <span className="font-bold text-gray-900 dark:text-white">Total</span>
                <span className="font-extrabold text-3xl text-gray-900 dark:text-white">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Mock Payment Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl border border-gray-100 dark:border-gray-800"
            >
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CreditCard className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-pulse" />
              </div>
              <h3 className="text-xl font-bold mb-2">Processing Payment...</h3>
              <p className="text-gray-500 text-sm mb-6">Please do not close this window or press back. We are securely communicating with Razorpay.</p>
              <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2.5, ease: "linear" }}
                  className="h-full bg-indigo-600"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Incomplete Profile Redirect Popup */}
      <AnimatePresence>
        {showProfileCompleteModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl border border-gray-100 dark:border-gray-800"
            >
              <h3 className="text-xl font-bold mb-2">Profile Incomplete</h3>
              <p className="text-gray-500 text-sm mb-6">You must provide a phone number and shipping address before placing an order.</p>
              <button 
                onClick={() => {
                  setShowProfileCompleteModal(false);
                  navigate('/customer/profile');
                }}
                className="w-full py-3 bg-black text-white dark:bg-white dark:text-black font-semibold rounded-xl text-sm hover:opacity-90"
              >
                Go to Profile
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
