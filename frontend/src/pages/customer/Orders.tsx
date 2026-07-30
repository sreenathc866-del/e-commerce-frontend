import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Truck, CheckCircle2, ChevronRight, Download, Search, SearchX } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

interface OrderData {
  id: string;
  date: string;
  status: string;
  total: number;
  items: any[];
  timeline: any[];
}

export default function Orders() {
  const [searchParams] = useSearchParams();
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const showSuccess = searchParams.get('success') === 'true';
  const { user } = useAuthStore();
  
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            created_at,
            status,
            total_amount,
            order_items (
              quantity,
              unit_price,
              products ( title, product_images ( image_url ) ),
              shops ( name )
            )
          `)
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const formattedOrders = data.map((order: any) => {
            
            const s = (order.status || 'pending').toLowerCase();
            const completedLevels = {
              'pending': 1,
              'paid': 2,
              'processing': 2,
              'shipped': 3,
              'delivered': 4,
              'cancelled': 1
            }[s as string] || 1;

            const dateStr = new Date(order.created_at).toLocaleString();
            
            let timeline = [];
            if (s === 'cancelled') {
              timeline = [
                { status: 'Order Placed', date: dateStr, completed: true },
                { status: 'Cancelled', date: dateStr, completed: true },
              ];
            } else {
              timeline = [
                { status: 'Order Placed', date: dateStr, completed: true },
                { status: 'Payment Confirmed', date: completedLevels >= 2 ? dateStr : '', completed: completedLevels >= 2 },
                { status: 'Shipped', date: completedLevels >= 3 ? dateStr : '', completed: completedLevels >= 3 },
                { status: 'Delivered', date: completedLevels >= 4 ? dateStr : '', completed: completedLevels >= 4 },
              ];
            }

            return {
              id: order.id,
              date: order.created_at,
              status: order.status,
              total: Number(order.total_amount) || 0,
              timeline,
              items: (order.order_items || []).map((item: any) => {
                const product = Array.isArray(item.products) ? item.products[0] : item.products;
                const shop = Array.isArray(item.shops) ? item.shops[0] : item.shops;
                const images = product?.product_images;
                const imageUrl = (Array.isArray(images) && images.length > 0) ? images[0].image_url : 'https://placehold.co/600x600/f9fafb/9ca3af.png?text=No+Image';

                return {
                  name: product?.title || 'Unknown Product',
                  vendor: shop?.name || 'Unknown Vendor',
                  qty: item.quantity,
                  price: Number(item.unit_price) || 0,
                  image: imageUrl
                };
              })
            };
          });

          setOrders(formattedOrders);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [user]);

  const generateInvoice = (order: OrderData) => {
    const invoiceWindow = window.open('', '_blank');
    if (!invoiceWindow) return;
    
    const html = \`
      <html>
        <head>
          <title>Invoice - \${order.id}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; color: #111; max-width: 800px; margin: 0 auto; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 40px; }
            .title { font-size: 32px; font-weight: 800; margin: 0; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #eee; }
            .table th { background: #f9fafb; font-weight: 600; text-transform: uppercase; font-size: 12px; color: #6b7280; }
            .totals { width: 300px; margin-left: auto; }
            .totals-row { display: flex; justify-content: space-between; padding: 8px 0; }
            .totals-row.bold { font-weight: bold; font-size: 1.2em; border-top: 2px solid #eee; padding-top: 12px; }
            .btn-print { padding: 10px 20px; background: #000; color: #fff; border: none; border-radius: 8px; cursor: pointer; margin-top: 20px; font-weight: bold; }
            @media print { body { padding: 0; } .no-print { display: none !important; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1 class="title">AURA INVOICE</h1>
              <p style="color: #6b7280; font-size: 14px; margin-top: 8px;">Order ID: \${order.id}<br>Date: \${new Date(order.date).toLocaleString()}</p>
            </div>
            <div style="text-align: right; color: #4b5563; font-size: 14px;">
              <p><strong>Aura Platform</strong><br>123 Commerce St.<br>Tech City, TC 12345</p>
            </div>
          </div>
          
          <table class="table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Vendor</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              \${order.items.map(item => \`
                <tr>
                  <td>\${item.name}</td>
                  <td>\${item.vendor}</td>
                  <td>\${item.qty}</td>
                  <td>₹\${item.price.toFixed(2)}</td>
                  <td style="text-align: right;">₹\${(item.qty * item.price).toFixed(2)}</td>
                </tr>
              \`).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-row bold">
              <span>Total Amount Paid</span>
              <span>₹\${order.total.toFixed(2)}</span>
            </div>
          </div>

          <div style="margin-top: 60px; font-size: 0.9em; color: #666; text-align: center;">
            <p>Thank you for shopping with Aura!</p>
            <button class="btn-print no-print" onclick="window.print()">Print Invoice</button>
          </div>
        </body>
      </html>
    \`;
    
    invoiceWindow.document.write(html);
    invoiceWindow.document.close();
  };

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
        <div className="divide-y divide-gray-100 dark:divide-gray-800 min-h-[400px]">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading your orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center">
              <SearchX className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No orders found</h3>
              <p className="text-gray-500">You haven't placed any orders yet.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="p-6 md:p-8 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex flex-col lg:flex-row gap-6">
                  
                  {/* Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white cursor-pointer" onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}>{order.id}</h3>
                        <p className="text-sm text-gray-500">Placed on {new Date(order.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-900 dark:text-white">₹{order.total.toFixed(2)}</p>
                        <span className={\`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold mt-1 uppercase \${
                          order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          order.status === 'shipped' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                          order.status === 'paid' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }\`}>
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
                      {expandedOrderId === order.id ? 'Hide Tracking' : 'Track Order'}
                    </button>
                    <button 
                      onClick={() => generateInvoice(order)}
                      className="px-6 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 w-full lg:w-auto text-gray-700 dark:text-gray-300"
                    >
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
                                  <h5 className={\`font-bold \${step.completed ? 'text-gray-900 dark:text-white' : 'text-gray-400'}\`}>{step.status}</h5>
                                  {step.date && <p className="text-xs text-gray-500 mt-1">{step.date}</p>}
                                </div>
                                
                                <div className={\`absolute left-4 sm:left-1/2 w-8 h-8 rounded-full border-4 border-white dark:border-gray-900 -translate-x-1/2 flex items-center justify-center z-10 order-1 sm:order-2 \${
                                  step.completed ? (step.status === 'Cancelled' ? 'bg-red-600' : 'bg-indigo-600') : 'bg-gray-200 dark:bg-gray-800'
                                }\`}>
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}
