import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Truck, CheckCircle2, ChevronRight, Download, Search, SearchX } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const MOCK_ORDERS = [
  {
    id: 'ORD-2026-8921',
    date: '2026-07-22',
    status: 'Shipped',
    total: 345.50,
    items: [
      { name: 'Wireless Noise-Canceling Headphones', vendor: 'AudioTech', qty: 1, price: 299.99, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80' },
      { name: 'USB-C Charging Cable', vendor: 'AudioTech', qty: 2, price: 15.00, image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=200&q=80' }
    ],
    timeline: [
      { status: 'Order Placed', date: '2026-07-22 10:00 AM', completed: true },
      { status: 'Order Confirmed', date: '2026-07-22 10:30 AM', completed: true },
      { status: 'Packed', date: '2026-07-22 02:00 PM', completed: true },
      { status: 'Shipped', date: '2026-07-23 09:00 AM', completed: true },
      { status: 'Out for Delivery', date: '', completed: false },
      { status: 'Delivered', date: '', completed: false },
    ]
  },
  {
    id: 'ORD-2026-7734',
    date: '2026-07-15',
    status: 'Delivered',
    total: 89.00,
    items: [
      { name: 'Minimalist Desk Lamp', vendor: 'Lumina Design', qty: 1, price: 89.00, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=200&q=80' }
    ],
    timeline: [
      { status: 'Order Placed', date: '2026-07-15 11:00 AM', completed: true },
      { status: 'Order Confirmed', date: '2026-07-15 11:30 AM', completed: true },
      { status: 'Packed', date: '2026-07-15 03:00 PM', completed: true },
      { status: 'Shipped', date: '2026-07-16 10:00 AM', completed: true },
      { status: 'Out for Delivery', date: '2026-07-18 08:00 AM', completed: true },
      { status: 'Delivered', date: '2026-07-18 02:30 PM', completed: true },
    ]
  }
];

export default function Orders() {
  const [searchParams] = useSearchParams();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const showSuccess = searchParams.get('success') === 'true';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Order History</h1>
        <p className="text-gray-500 mt-2">Track, manage, and review your past purchases.</p>
      </div>

      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="mb-8 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-400 p-6 rounded-2xl flex items-start gap-4 shadow-sm"
          >
            <CheckCircle2 className="w-8 h-8 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-lg mb-1">Order Placed Successfully!</h3>
              <p>Thank you for your purchase. We have received your order and are processing it now. You will receive an email confirmation shortly.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white dark:bg-gray-900 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden">
        
        {/* Header & Search */}
        <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by order ID or product..." 
              className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-black dark:focus:ring-white transition-all text-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <select className="px-4 py-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium focus:ring-black dark:focus:ring-white">
              <option>Last 30 Days</option>
              <option>Last 3 Months</option>
              <option>2026</option>
            </select>
          </div>
        </div>

        {/* Order List */}
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {MOCK_ORDERS.map((order) => (
            <div key={order.id} className="p-6 md:p-8 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex flex-col lg:flex-row gap-6">
                
                {/* Info */}
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">{order.id}</h3>
                      <p className="text-sm text-gray-500">Placed on {new Date(order.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-900 dark:text-white">${order.total.toFixed(2)}</p>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold mt-1 ${
                        order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-gray-700" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{item.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.qty} • {item.vendor}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-gray-800 pt-4 lg:pt-0 lg:pl-8">
                  <button 
                    onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                    className="px-6 py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-xl text-sm font-bold shadow-sm hover:scale-105 transition-all w-full lg:w-auto"
                  >
                    Track Order
                  </button>
                  <button className="px-6 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 w-full lg:w-auto text-gray-700 dark:text-gray-300">
                    <Download className="w-4 h-4" /> Invoice
                  </button>
                </div>
              </div>

              {/* Tracking Timeline (Expanded) */}
              <AnimatePresence>
                {expandedOrderId === order.id && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                      <h4 className="font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Truck className="w-5 h-5 text-indigo-500" /> Live Tracking
                      </h4>
                      <div className="relative">
                        <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800 -translate-x-1/2" />
                        
                        <div className="space-y-6">
                          {order.timeline.map((step, idx) => (
                            <div key={idx} className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 pl-12 sm:pl-0">
                              <div className="sm:w-1/2 sm:pr-8 text-left sm:text-right order-2 sm:order-1">
                                <h5 className={`font-bold ${step.completed ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>{step.status}</h5>
                                {step.date && <p className="text-xs text-gray-500 mt-1">{step.date}</p>}
                              </div>
                              
                              <div className={`absolute left-4 sm:left-1/2 w-8 h-8 rounded-full border-4 border-white dark:border-gray-900 -translate-x-1/2 flex items-center justify-center z-10 order-1 sm:order-2 ${
                                step.completed ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-800'
                              }`}>
                                {step.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                              </div>

                              <div className="sm:w-1/2 sm:pl-8 order-3" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
