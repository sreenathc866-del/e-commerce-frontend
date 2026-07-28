import { motion } from 'framer-motion';
import { Heart, Star, ShoppingCart, Eye } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';

export interface ProductCardProps {
  id: string;
  name: string;
  vendorName: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  discount?: number;
}

export default function ProductCard({ id, name, vendorName, price, image, rating, reviews, status, discount }: ProductCardProps) {
  const { user } = useAuthStore();
  const { addItem } = useCartStore();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={() => navigate(`/customer/product/${id}`)}
      className="group flex flex-col bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 transition-all hover:shadow-xl dark:hover:shadow-black/50 cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 dark:bg-gray-950">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {discount && (
            <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-sm">
              -{discount}%
            </span>
          )}
          {status === 'Out of Stock' && (
            <span className="px-2.5 py-1 bg-gray-900/80 backdrop-blur-md text-white text-xs font-bold rounded-full shadow-sm">
              Out of Stock
            </span>
          )}
        </div>

        {/* Hover Actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
          <button 
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
            className="p-2.5 bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-full text-gray-700 dark:text-gray-300 hover:text-red-500 hover:scale-110 shadow-sm transition-all"
          >
            <Heart className="w-5 h-5" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
            className="p-2.5 bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-full text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white hover:scale-110 shadow-sm transition-all"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{vendorName}</span>
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{rating} <span className="text-gray-400">({reviews})</span></span>
          </div>
        </div>
        
        <h3 className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 font-semibold text-gray-900 dark:text-white leading-tight mb-2">
          {name}
        </h3>
        
        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="flex flex-col">
            {discount ? (
              <>
                <span className="text-xs text-gray-400 line-through">₹{price.toFixed(2)}</span>
                <span className="font-bold text-lg text-gray-900 dark:text-white">₹{(price - (price * (discount/100))).toFixed(2)}</span>
              </>
            ) : (
              <span className="font-bold text-lg text-gray-900 dark:text-white">₹{price.toFixed(2)}</span>
            )}
          </div>
          
          <button 
            disabled={status === 'Out of Stock'}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              // Guests can add to cart now
              addItem({
                id: Math.random().toString(36).substr(2, 9),
                productId: id,
                name,
                vendorName,
                image,
                price: discount ? price - (price * (discount/100)) : price,
                quantity: 1,
                stock: 10,
                variant: 'Default'
              });
            }}
            className={clsx(
              "p-2.5 rounded-xl flex items-center justify-center transition-all",
              status === 'Out of Stock' 
                ? "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
                : "bg-black text-white dark:bg-white dark:text-black hover:scale-105 active:scale-95 shadow-sm"
            )}
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
