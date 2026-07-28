import { motion } from 'framer-motion';
import { Star, MapPin, Package, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface ShopCardProps {
  id: string;
  name: string;
  category: string;
  rating: number;
  totalProducts: number;
  address: string;
  banner: string;
  logo: string;
  isVerified?: boolean;
}

export default function ShopCard({ id, name, category, rating, totalProducts, address, banner, logo, isVerified }: ShopCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group flex flex-col bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 transition-all hover:shadow-xl dark:hover:shadow-black/50"
    >
      {/* Banner */}
      <div className="relative h-32 sm:h-40 overflow-hidden bg-gray-100 dark:bg-gray-800">
        <img 
          src={banner} 
          alt={name} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        {/* Verification Badge */}
        {isVerified && (
          <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/90 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-bold text-gray-900 dark:text-white">Verified</span>
          </div>
        )}
      </div>

      <div className="relative px-5 pb-5 flex-1 flex flex-col">
        {/* Logo Avatar */}
        <div className="absolute -top-10 left-5">
          <div className="w-20 h-20 rounded-2xl border-4 border-white dark:border-gray-900 overflow-hidden bg-white shadow-sm group-hover:-translate-y-2 transition-transform duration-300">
            <img src={logo} alt={name} className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="pt-12">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <Link to={`/customer/shops/${id}`} className="hover:underline">
                <h3 className="font-bold text-xl text-gray-900 dark:text-white line-clamp-1">{name}</h3>
              </Link>
              <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">{category}</span>
            </div>
            <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded-lg">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-bold text-yellow-700 dark:text-yellow-500">{rating}</span>
            </div>
          </div>

          <div className="space-y-2 mt-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span>{totalProducts} published products</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="line-clamp-1">{address}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Link 
            to={`/customer/shops/${id}`}
            className="flex items-center justify-center w-full py-2.5 bg-gray-50 dark:bg-gray-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black rounded-xl font-medium transition-colors text-sm"
          >
            Visit Shop
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
