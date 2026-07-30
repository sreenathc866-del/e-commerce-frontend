import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Trash2, Heart, Plus, Minus, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, getSubtotal, getDiscount, getTotal, getTotalShipping } = useCartStore();
  const { addItem: addToWishlist } = useWishlistStore();
  const navigate = useNavigate();

  const handleMoveToWishlist = (item: any) => {
    addToWishlist({
      productId: item.productId,
      name: item.name,
      vendorName: item.vendorName,
      image: item.image,
      price: item.price,
      discount: item.discount,
      status: item.stock > 0 ? 'In Stock' : 'Out of Stock'
    });
    removeItem(item.id);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 text-center max-w-md">
          Looks like you haven't added anything to your cart yet. Discover our premium collection of products.
        </p>
        <Link 
          to="/products"
          className="px-8 py-4 bg-black text-white dark:bg-white dark:text-black rounded-full font-bold shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  const shipping = getTotalShipping();
  const grandTotal = getTotal() + shipping;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Shopping Cart</h1>
        <span className="text-gray-500 font-medium">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        
        {/* Cart Items */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Items</h3>
            <button 
              onClick={clearCart}
              className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors"
            >
              Clear Cart
            </button>
          </div>

          <div className="space-y-6">
            {items.map((item) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={item.id} 
                className="flex flex-col sm:flex-row gap-6 p-4 sm:p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm"
              >
                <div className="w-full sm:w-32 h-32 flex-shrink-0 bg-gray-50 dark:bg-gray-950 rounded-2xl overflow-hidden">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <Link to={`/products/${item.productId}`} className="hover:underline">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{item.name}</h3>
                      </Link>
                      <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mt-1">{item.vendorName}</p>
                      {item.variant && <p className="text-sm text-gray-500 mt-1">Variant: {item.variant}</p>}
                    </div>
                    <div className="text-right">
                      {item.discount ? (
                        <>
                          <p className="text-sm text-gray-400 line-through">₹{(item.price * item.quantity).toFixed(2)}</p>
                          <p className="font-bold text-lg text-gray-900 dark:text-white">
                            ₹{((item.price - (item.price * (item.discount / 100))) * item.quantity).toFixed(2)}
                          </p>
                        </>
                      ) : (
                        <p className="font-bold text-lg text-gray-900 dark:text-white">₹{(item.price * item.quantity).toFixed(2)}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto pt-6 flex items-center justify-between">
                    <div className="inline-flex items-center bg-gray-100 dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-1">
                      <button 
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="p-1.5 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-semibold text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, Math.min(item.stock, item.quantity + 1))}
                        className="p-1.5 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleMoveToWishlist(item)}
                        className="p-2 text-gray-400 hover:text-indigo-500 transition-colors" 
                        title="Move to Wishlist"
                      >
                        <Heart className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors" 
                        title="Remove Item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-xl p-8 sticky top-32">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Order Summary</h3>
            
            <div className="space-y-4 mb-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Subtotal ({items.length} items)</span>
                <span className="font-medium text-gray-900 dark:text-white">₹{getSubtotal().toFixed(2)}</span>
              </div>
              {getDiscount() > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Discount</span>
                  <span className="font-medium">-₹{getDiscount().toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping charge</span>
                <span className="font-medium text-gray-900 dark:text-white">₹{shipping.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-gray-800 mb-8">
              <div className="flex justify-between items-end">
                <span className="font-bold text-gray-900 dark:text-white">Total</span>
                <span className="font-extrabold text-3xl text-gray-900 dark:text-white">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button 
              onClick={() => navigate('/customer/checkout')}
              className="w-full flex items-center justify-center gap-2 py-4 bg-black text-white dark:bg-white dark:text-black rounded-2xl font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
            >
              Proceed to Checkout <ArrowRight className="w-5 h-5" />
            </button>
            
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 flex items-center justify-center gap-2 text-sm text-gray-500">
              <ShieldCheck className="w-5 h-5 text-indigo-500" />
              <span>Secure Encrypted Checkout</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
