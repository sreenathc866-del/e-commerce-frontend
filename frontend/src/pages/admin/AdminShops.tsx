import { useState } from 'react';
import { Search, Filter, MoreVertical, Store, Star, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_SHOPS = [
  { id: 'S-001', name: 'AudioTech', vendor: 'John Doe', category: 'Electronics', rating: 4.8, products: 124, address: '123 Tech Park, CA', status: 'Active' },
  { id: 'S-002', name: 'Lumina Design', vendor: 'Alice Smith', category: 'Home & Garden', rating: 0, products: 12, address: '45 Design Blvd, NY', status: 'Pending Approval' },
  { id: 'S-003', name: 'SneakerHead', vendor: 'Bob Johnson', category: 'Fashion', rating: 4.2, products: 45, address: '78 Street Style, TX', status: 'Suspended' },
  { id: 'S-004', name: 'CozyHome', vendor: 'Emma Wilson', category: 'Home & Garden', rating: 4.9, products: 310, address: '99 Comfort Ave, WA', status: 'Active' },
];

export default function AdminShops() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shop Management</h1>
          <p className="text-sm text-gray-500">Monitor and manage all vendor shops on the platform.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search shops..." 
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:ring-black dark:focus:ring-white"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-950 transition-colors flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
                <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Shop Details</th>
                <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Vendor</th>
                <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {MOCK_SHOPS.map((shop) => (
                <tr key={shop.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                        <Store className="w-6 h-6 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{shop.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{shop.category} • {shop.products} Products</p>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {shop.address}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{shop.vendor}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{shop.rating > 0 ? shop.rating : 'N/A'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                      shop.status === 'Active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' :
                      shop.status === 'Pending Approval' ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30' :
                      'bg-red-50 text-red-600 dark:bg-red-900/30'
                    }`}>
                      {shop.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right relative">
                    <button 
                      onClick={() => setActiveMenu(activeMenu === shop.id ? null : shop.id)}
                      className="p-2 text-gray-400 hover:text-black dark:hover:text-white rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {/* Action Dropdown Menu */}
                    <AnimatePresence>
                      {activeMenu === shop.id && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute right-8 top-12 w-48 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl rounded-xl z-10 py-1"
                        >
                          <button className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">View Shop</button>
                          {shop.status === 'Pending Approval' && (
                            <button className="w-full text-left px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">Approve Shop</button>
                          )}
                          {shop.status === 'Active' && (
                            <button className="w-full text-left px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20">Suspend Shop</button>
                          )}
                          <button className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Delete Shop</button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
