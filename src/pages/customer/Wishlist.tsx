import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useWishlistStore } from '../../store/wishlistStore';
import { useCartStore } from '../../store/cartStore';

export default function Wishlist() {
  const { items, removeItem } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();

  const handleMoveToCart = (item: any) => {
    addToCart({
      id: Math.random().toString(36).substr(2, 9),
      productId: item.productId,
      name: item.name,
      vendorName: item.vendorName,
      image: item.image,
      price: item.price,
      discount: item.discount,
      quantity: 1,
      stock: 10, // mock stock
    });
    removeItem(item.productId);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mb-6">
          <Heart className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your wishlist is empty</h2>
        <p className="text-gray-500 mb-8 text-center max-w-md">
          Save items you love here and review them anytime.
        </p>
        <Link 
          to="/products"
          className="px-8 py-4 bg-black text-white dark:bg-white dark:text-black rounded-full font-bold shadow-xl hover:scale-105 active:scale-95 transition-all"
        >
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
          <Heart className="w-8 h-8 text-indigo-500 fill-indigo-500/20" /> My Wishlist
        </h1>
        <span className="text-gray-500 font-medium">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            key={item.productId}
            className="flex flex-col bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm group"
          >
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-950 overflow-hidden">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <button 
                onClick={() => removeItem(item.productId)}
                className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-full text-gray-400 hover:text-red-500 transition-colors shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 flex flex-col flex-1">
              <Link to={`/products/${item.productId}`} className="hover:underline">
                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{item.name}</h3>
              </Link>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-1">{item.vendorName}</p>
              
              <div className="mt-3 flex items-center justify-between">
                <div className="flex flex-col">
                  {item.discount ? (
                    <>
                      <span className="text-xs text-gray-400 line-through">₹{item.price.toFixed(2)}</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        ₹{(item.price - (item.price * (item.discount / 100))).toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="font-bold text-gray-900 dark:text-white">₹{item.price.toFixed(2)}</span>
                  )}
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded-md ${item.status === 'In Stock' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' : 'bg-red-50 text-red-600 dark:bg-red-900/30'}`}>
                  {item.status}
                </span>
              </div>

              <button 
                onClick={() => handleMoveToCart(item)}
                disabled={item.status === 'Out of Stock'}
                className="mt-4 w-full py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-xl font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-4 h-4" /> Move to Cart
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
