import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import ProductCard from '../../components/customer/ProductCard';
import { supabase } from '../../lib/supabase';

// Removed MOCK products as per user request

export default function ProductListing() {
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          id, title, price, compare_at_price, rating, status,
          shops ( name ),
          product_images ( image_url )
        `)
        .eq('status', 'published');

      if (data && data.length > 0) {
        const formatted = data.map((p: any) => ({
          id: p.id,
          name: p.title,
          vendorName: p.shops?.name || 'Unknown Vendor',
          price: Number(p.price),
          image: p.product_images?.[0]?.image_url || 'https://placehold.co/600x600/f9fafb/9ca3af.png?text=No+Image+Provided',
          rating: Number(p.rating) || 0,
          reviews: 0,
          status: 'In Stock' as const,
          discount: p.compare_at_price > p.price ? Math.round(((p.compare_at_price - p.price) / p.compare_at_price) * 100) : undefined
        }));
        setProducts(formatted);
      }
      setIsLoading(false);
    }
    loadProducts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      
      {/* Header */}
      <div className="flex items-end justify-between border-b border-gray-200 dark:border-gray-800 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">All Products</h1>
          <p className="text-gray-500 mt-2">Showing 1-6 of 24 results</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMobileFiltersOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-xl"
          >
            <Filter className="w-4 h-4" /> Filters
          </button>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select className="bg-transparent text-sm font-medium focus:ring-0 cursor-pointer">
              <option>Recommended</option>
              <option>Newest Arrivals</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Desktop Filters Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0 space-y-8">
          <div>
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Categories</h3>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center justify-between cursor-pointer hover:text-black dark:hover:text-white font-medium text-black dark:text-white">
                <span>All Products</span>
                <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-xs">24</span>
              </li>
              <li className="flex items-center justify-between cursor-pointer hover:text-black dark:hover:text-white">
                <span>Electronics</span>
                <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-xs">12</span>
              </li>
              <li className="flex items-center justify-between cursor-pointer hover:text-black dark:hover:text-white">
                <span>Home & Living</span>
                <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-xs">8</span>
              </li>
              <li className="flex items-center justify-between cursor-pointer hover:text-black dark:hover:text-white">
                <span>Fashion</span>
                <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-xs">4</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Price Range</h3>
            <div className="space-y-4">
              <input type="range" className="w-full accent-black dark:accent-white" />
              <div className="flex items-center justify-between gap-4">
                <input type="text" placeholder="₹0" className="w-full text-sm px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-center" />
                <span className="text-gray-400">-</span>
                <input type="text" placeholder="₹1000+" className="w-full text-sm px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-center" />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Availability</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black" defaultChecked />
                <span className="text-sm text-gray-600 dark:text-gray-400">In Stock</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Out of Stock</span>
              </label>
            </div>
          </div>
        </div>

        {/* Mobile Filters Modal */}
        <AnimatePresence>
          {isMobileFiltersOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsMobileFiltersOpen(false)}
                className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
              />
              <motion.div
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                className="fixed inset-x-0 bottom-0 z-50 h-[80vh] bg-white dark:bg-gray-950 rounded-t-3xl shadow-2xl p-6 flex flex-col lg:hidden"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-xl">Filters</h3>
                  <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {/* Reuse filters content here in a real app */}
                  <p className="text-gray-500">Filters content goes here...</p>
                </div>
                <div className="pt-6 border-t border-gray-200 dark:border-gray-800 flex gap-4">
                  <button className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl font-medium">Clear All</button>
                  <button onClick={() => setIsMobileFiltersOpen(false)} className="flex-1 py-3 bg-black text-white dark:bg-white dark:text-black rounded-xl font-medium">Apply</button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Product Grid */}
        <div className="flex-1">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex justify-center items-center h-64 text-gray-500">
              No products found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}

          <div className="mt-12 flex justify-center">
            <button className="px-6 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm">
              Load More Products
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
