import { useState } from 'react';
import { Search, Filter, MoreVertical, PackageCheck, Truck, XCircle, CreditCard, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_ORDERS = [
  { id: 'ORD-8921', customer: 'Michael Chen', vendor: 'AudioTech', items: 2, total: 1240.00, status: 'Processing', payment: 'Paid', date: '2026-07-23 14:30' },
  { id: 'ORD-8922', customer: 'Sarah Williams', vendor: 'CozyHome', items: 1, total: 299.99, status: 'Shipped', payment: 'Paid', date: '2026-07-22 09:15' },
  { id: 'ORD-8923', customer: 'David Miller', vendor: 'SneakerHead', items: 1, total: 180.00, status: 'Cancelled', payment: 'Refunded', date: '2026-07-21 16:45' },
  { id: 'ORD-8924', customer: 'Jessica Taylor', vendor: 'Lumina Design', items: 4, total: 198.00, status: 'Delivered', payment: 'Paid', date: '2026-07-20 11:20' },
];

export default function AdminOrders() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order Management</h1>
          <p className="text-sm text-gray-500">Monitor all transactions and deliveries across the platform.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by Order ID or Customer..." 
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
                <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Customer / Vendor</th>
                <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {MOCK_ORDERS.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                  <td className="py-4 px-6">
                    <span className="font-bold text-gray-900 dark:text-white">{order.id}</span>
                    <p className="text-xs text-gray-500 mt-1">{order.date}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{order.customer}</p>
                    <p className="text-xs text-gray-500 mt-1">from <span className="font-medium text-gray-700 dark:text-gray-400">{order.vendor}</span></p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="font-bold text-gray-900 dark:text-white">₹{order.total.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 mt-1">{order.items} items</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      order.payment === 'Paid' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' :
                      order.payment === 'Refunded' ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' :
                      'bg-orange-50 text-orange-600 dark:bg-orange-900/30'
                    }`}>
                      <CreditCard className="w-3 h-3" />
                      {order.payment}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                      order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' :
                      order.status === 'Shipped' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30' :
                      order.status === 'Processing' ? 'bg-orange-50 text-orange-600 dark:bg-orange-900/30' :
                      'bg-red-50 text-red-600 dark:bg-red-900/30'
                    }`}>
                      {order.status === 'Delivered' && <PackageCheck className="w-3 h-3" />}
                      {order.status === 'Shipped' && <Truck className="w-3 h-3" />}
                      {order.status === 'Processing' && <Clock className="w-3 h-3" />}
                      {order.status === 'Cancelled' && <XCircle className="w-3 h-3" />}
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right relative">
                    <button 
                      onClick={() => setActiveMenu(activeMenu === order.id ? null : order.id)}
                      className="p-2 text-gray-400 hover:text-black dark:hover:text-white rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {/* Action Dropdown Menu */}
                    <AnimatePresence>
                      {activeMenu === order.id && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          className="absolute right-8 top-12 w-48 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl rounded-xl z-10 py-1"
                        >
                          <button className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">View Order Details</button>
                          <button className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Download Invoice</button>
                          {order.payment === 'Paid' && (
                            <button className="w-full text-left px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20">Refund Payment</button>
                          )}
                          {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
                            <button className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Cancel Order</button>
                          )}
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
