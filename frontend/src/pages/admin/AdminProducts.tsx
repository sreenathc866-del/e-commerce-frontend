import { useState } from 'react';
import { Search, Filter, MoreVertical, Package, AlertTriangle, Eye, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_PRODUCTS = [
  { id: 'P-101', name: 'Sony WH-1000XM5', shop: 'AudioTech', category: 'Electronics', price: 348.00, stock: 45, status: 'Active', '3dModel': true },
  { id: 'P-102', name: 'Leather Accent Chair', shop: 'CozyHome', category: 'Furniture', price: 299.99, stock: 0, status: 'Out of Stock', '3dModel': false },
  { id: 'P-103', name: 'Air Jordan 1 Retro', shop: 'SneakerHead', category: 'Fashion', price: 180.00, stock: 12, status: 'Hidden', '3dModel': true },
  { id: 'P-104', name: 'Smart Plant Monitor', shop: 'Lumina Design', category: 'Home & Garden', price: 49.50, stock: 120, status: 'Active', '3dModel': false },
];

export default function AdminProducts() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Product Management</h1>
          <p className="text-sm text-gray-500">Monitor all items across the marketplace.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
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
                <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Product Info</th>
                <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Shop</th>
                <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {MOCK_PRODUCTS.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white line-clamp-1">{product.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{product.category}</p>
                        {product['3dModel'] && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 mt-1">
                            3D Model Enabled
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{product.shop}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">₹{product.price.toFixed(2)}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      product.stock > 10 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' :
                      product.stock > 0 ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30' :
                      'bg-red-50 text-red-600 dark:bg-red-900/30'
                    }`}>
                      {product.stock === 0 && <AlertTriangle className="w-3 h-3" />}
                      {product.stock} units
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      product.status === 'Active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' :
                      product.status === 'Out of Stock' ? 'bg-red-50 text-red-600 dark:bg-red-900/30' :
                      'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {product.status === 'Active' && <CheckCircle2 className="w-3 h-3" />}
                      {product.status === 'Hidden' && <Eye className="w-3 h-3" />}
                      {product.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right relative">
                    <button 
                      onClick={() => setActiveMenu(activeMenu === product.id ? null : product.id)}
                      className="p-2 text-gray-400 hover:text-black dark:hover:text-white rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {/* Action Dropdown Menu */}
                    <AnimatePresence>
                      {activeMenu === product.id && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute right-8 top-12 w-48 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl rounded-xl z-10 py-1"
                        >
                          <button className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Preview Product</button>
                          <button className="w-full text-left px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20">Hide Product</button>
                          <button className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Delete Product</button>
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
