import { useState } from 'react';
import { Search, Filter, MoreVertical, ShieldCheck, Ban, CheckCircle2, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_VENDORS = [
  { id: 'V-001', name: 'John Doe', shopName: 'AudioTech', email: 'john@audiotech.com', status: 'Active', revenue: 45200, joined: '2026-01-15', products: 124 },
  { id: 'V-002', name: 'Alice Smith', shopName: 'Lumina Design', email: 'alice@lumina.com', status: 'Pending', revenue: 0, joined: '2026-07-20', products: 12 },
  { id: 'V-003', name: 'Bob Johnson', shopName: 'SneakerHead', email: 'bob@sneakerhead.com', status: 'Suspended', revenue: 12450, joined: '2025-11-05', products: 45 },
  { id: 'V-004', name: 'Emma Wilson', shopName: 'CozyHome', email: 'emma@cozyhome.com', status: 'Active', revenue: 89000, joined: '2024-03-12', products: 310 },
];

export default function AdminVendors() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vendor Management</h1>
          <p className="text-sm text-gray-500">Approve, suspend, and monitor all platform sellers.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-xl font-bold hover:scale-105 transition-all text-sm">
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search vendors or shops..." 
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
                <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Vendor Info</th>
                <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Shop</th>
                <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Revenue</th>
                <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Products</th>
                <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {MOCK_VENDORS.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {vendor.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">{vendor.name}</p>
                        <p className="text-xs text-gray-500">{vendor.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white text-sm">{vendor.shopName}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      vendor.status === 'Active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' :
                      vendor.status === 'Pending' ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30' :
                      'bg-red-50 text-red-600 dark:bg-red-900/30'
                    }`}>
                      {vendor.status === 'Active' ? <CheckCircle2 className="w-3 h-3" /> : vendor.status === 'Pending' ? <ShieldCheck className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                      {vendor.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-bold text-gray-900 dark:text-white">${vendor.revenue.toLocaleString()}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-gray-600 dark:text-gray-400 font-medium">{vendor.products} items</span>
                  </td>
                  <td className="py-4 px-6 text-right relative">
                    <button 
                      onClick={() => setActiveMenu(activeMenu === vendor.id ? null : vendor.id)}
                      className="p-2 text-gray-400 hover:text-black dark:hover:text-white rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {/* Action Dropdown Menu */}
                    <AnimatePresence>
                      {activeMenu === vendor.id && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute right-8 top-12 w-48 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl rounded-xl z-10 py-1"
                        >
                          {vendor.status === 'Pending' && (
                            <button className="w-full text-left px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">Approve Vendor</button>
                          )}
                          {vendor.status === 'Active' && (
                            <button className="w-full text-left px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20">Suspend Vendor</button>
                          )}
                          {vendor.status === 'Suspended' && (
                            <button className="w-full text-left px-4 py-2 text-sm font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">Reactivate Vendor</button>
                          )}
                          <button className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">View Shop</button>
                          <button className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Delete Account</button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-sm">
          <span className="text-gray-500">Showing 1 to 4 of 142 vendors</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-200 dark:border-gray-800 rounded-lg disabled:opacity-50">Prev</button>
            <button className="px-3 py-1 border border-gray-200 dark:border-gray-800 rounded-lg bg-black text-white dark:bg-white dark:text-black">1</button>
            <button className="px-3 py-1 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900">2</button>
            <button className="px-3 py-1 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
