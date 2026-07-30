import { useState, useEffect } from 'react';
import { Store, Search, Filter } from 'lucide-react';
import ShopCard from '../../components/customer/ShopCard';
import { supabase } from '../../lib/supabase';

// Removed MOCK shops as per user request

export default function ShopListing() {
  const [shops, setShops] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadShops() {
      setIsLoading(true);
        const { data: shopsData } = await supabase
          .from('shops')
          .select('*, products(id, status)');

        if (shopsData && shopsData.length > 0) {
          const formatted = shopsData.map((s: any) => {
            const publishedProducts = s.products ? s.products.filter((p: any) => p.status === 'published').length : 0;
            return {
              id: s.id,
              name: s.name,
              category: s.category || 'General Store',
              rating: 0,
              totalProducts: publishedProducts,
          address: s.address || 'Online Store',
          banner: s.banner_url || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&q=80',
          logo: s.logo_url || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&q=80',
          isVerified: s.is_verified || false
            };
          });
          setShops(formatted);
      }
      setIsLoading(false);
    }
    loadShops();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200 dark:border-gray-800 pb-8 mb-8 gap-6">
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Store className="w-8 h-8 text-indigo-600 dark:text-indigo-400" /> 
            Discover Independent Shops
          </h1>
          <p className="text-gray-500 mt-3 text-lg leading-relaxed">
            Support creators and businesses from around the world. Browse our curated list of verified vendors offering premium, high-quality products.
          </p>
        </div>
        
        <div className="flex w-full md:w-auto gap-3">
          <div className="relative flex-1 md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              type="text" 
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-black dark:focus:ring-white bg-gray-50 dark:bg-gray-950 text-sm"
              placeholder="Search shops..."
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white" />
        </div>
      ) : shops.length === 0 ? (
        <div className="flex justify-center items-center h-64 text-gray-500">
          No shops found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {shops.map((shop: any) => (
            <ShopCard key={shop.id} {...shop} />
          ))}
        </div>
      )}

    </div>
  );
}
