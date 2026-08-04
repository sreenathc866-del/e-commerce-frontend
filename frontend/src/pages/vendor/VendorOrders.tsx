import { useState, useEffect } from 'react';
import { Package, Search, Filter, CheckCircle2, XCircle, Truck, Clock, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

export default function VendorOrders() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchVendorOrders() {
      if (!user) return;
      try {
        // 1. Get Vendor's Shop
        const { data: shop } = await supabase
          .from('shops')
          .select('id')
          .eq('vendor_id', user.id)
          .single();

        if (!shop) {
          setIsLoading(false);
          return;
        }

        // 2. Fetch order items for this shop with related orders, products, and customer details
        const { data: orderItems, error } = await supabase
          .from('order_items')
          .select(`
            id,
            quantity,
            unit_price,
            product_id,
            products ( title ),
            order_id,
            orders (
              id,
              status,
              created_at,
              profiles ( full_name ),
              addresses ( address_line1, city, state, zip_code ),
              transactions ( payment_id )
            )
          `)
          .eq('shop_id', shop.id);

        if (error) throw error;

        // 3. Group by order
        const groupedOrders = new Map<string, any>();
        
        if (orderItems) {
          orderItems.forEach((item: any) => {
            const orderData = Array.isArray(item.orders) ? item.orders[0] : item.orders;
            if (!orderData || orderData.status === 'pending') return;
            const orderId = orderData.id;
            
            if (!groupedOrders.has(orderId)) {
              const customerData = Array.isArray(orderData.profiles) ? orderData.profiles[0] : orderData.profiles;
              const addressData = Array.isArray(orderData.addresses) ? orderData.addresses[0] : orderData.addresses;
              
              const addressStr = addressData 
                ? `${addressData.address_line1}, ${addressData.city}, ${addressData.state} ${addressData.zip_code}` 
                : 'No address provided';

              const txData = Array.isArray(orderData.transactions) ? orderData.transactions[0] : orderData.transactions;

              groupedOrders.set(orderId, {
                id: orderId,
                customer: customerData?.full_name || 'Unknown Customer',
                date: orderData.created_at,
                total: 0,
                status: orderData.status,
                items: [],
                address: addressStr,
                paymentId: txData?.payment_id || null
              });
            }

            const currentOrder = groupedOrders.get(orderId);
            const productData = Array.isArray(item.products) ? item.products[0] : item.products;
            
            currentOrder.items.push({
              name: productData?.title || 'Unknown Product',
              qty: item.quantity,
              price: item.unit_price
            });
            
            currentOrder.total += (item.quantity * item.unit_price);
          });
        }

        // Convert Map to Array and sort by date descending
        const finalOrders = Array.from(groupedOrders.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setOrders(finalOrders);

      } catch (e) {
        console.error("Error fetching vendor orders:", e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchVendorOrders();
  }, [user]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      // Note: we update the main 'orders' table status. 
      // If a vendor shares an order with another vendor, updating the whole order status might affect the other vendor.
      // Usually, statuses should be per-item or split orders, but for simplicity here we update the whole order.
      const statusValue = newStatus.toLowerCase(); // 'pending', 'packed', 'shipped', 'delivered'
      const { error } = await supabase.from('orders').update({ status: statusValue }).eq('id', orderId);
      if (error) throw error;
      
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: statusValue } : o));
      setSelectedOrder((prev: any) => prev?.id === orderId ? { ...prev, status: statusValue } : prev);
    } catch (e) {
      console.error("Failed to update status", e);
      alert("Failed to update order status");
    }
  };

  const handleRefund = async (orderId: string, paymentId: string, amount: number) => {
    if (!paymentId) {
      alert("No payment ID found for this order. Cannot process refund.");
      return;
    }
    const confirmRefund = window.confirm(`Are you sure you want to refund ₹${amount}? This cannot be undone.`);
    if (!confirmRefund) return;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const res = await fetch(`${import.meta.env.VITE_API_URL.endsWith('/api') ? import.meta.env.VITE_API_URL : import.meta.env.VITE_API_URL + '/api'}/refunds/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionData.session?.access_token}`
        },
        body: JSON.stringify({
          paymentId,
          amount,
          orderId,
          reason: 'Vendor cancelled order'
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to process refund');
      }

      alert('Refund processed successfully!');
      updateOrderStatus(orderId, 'cancelled');
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Error processing refund');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order Management</h1>
          <p className="text-sm text-gray-500">Manage fulfillments and track shipments.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
            <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{orders.length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
            <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{orders.filter(o => o.status === 'pending').length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
            <Truck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Shipped</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{orders.filter(o => o.status === 'shipped').length}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Delivered</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{orders.filter(o => o.status === 'delivered').length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col lg:flex-row min-h-[600px]">
        
        {/* Order List */}
        <div className={`w-full ${selectedOrder ? 'hidden lg:block lg:w-1/3 border-r border-gray-100 dark:border-gray-800' : ''}`}>
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search orders..." 
                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm"
              />
            </div>
          </div>
          <div className="overflow-y-auto h-[600px] divide-y divide-gray-100 dark:divide-gray-800">
            {orders.map(order => (
              <div 
                key={order.id} 
                onClick={() => setSelectedOrder(order)}
                className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${selectedOrder?.id === order.id ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white">{order.id}</h4>
                  <span className="text-xs font-medium text-gray-500">{new Date(order.date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-end">
                  <p className="text-sm text-gray-600 dark:text-gray-400">{order.customer}</p>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    order.status === 'pending' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30' :
                    order.status === 'packed' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30' :
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30' :
                    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Details Panel */}
        {selectedOrder ? (
          <div className="flex-1 flex flex-col h-[600px] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10">
              <div>
                <button onClick={() => setSelectedOrder(null)} className="lg:hidden text-sm text-indigo-600 mb-2">&larr; Back to Orders</button>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  {selectedOrder.id}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    selectedOrder.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                    selectedOrder.status === 'packed' ? 'bg-indigo-100 text-indigo-800' :
                    selectedOrder.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                    'bg-emerald-100 text-emerald-800'
                  }`}>
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </span>
                </h2>
                <p className="text-sm text-gray-500 mt-1">Placed on {new Date(selectedOrder.date).toLocaleDateString()} by {selectedOrder.customer}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Order Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{selectedOrder.total.toFixed(2)}</p>
              </div>
            </div>

            <div className="p-6 space-y-8 flex-1">
              
              {/* Items */}
              <div>
                <h3 className="font-bold text-sm uppercase text-gray-500 mb-4">Items to Fulfill</h3>
                <div className="bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
                  {selectedOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                      </div>
                      <p className="font-bold">₹{(item.price * item.qty).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div>
                <h3 className="font-bold text-sm uppercase text-gray-500 mb-4">Shipping Address</h3>
                <div className="p-4 bg-gray-50 dark:bg-gray-950 rounded-xl border border-gray-100 dark:border-gray-800 text-sm">
                  <p className="font-medium text-gray-900 dark:text-white">{selectedOrder.customer}</p>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{selectedOrder.address}</p>
                </div>
              </div>

            </div>

            {/* Actions */}
            <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 sticky bottom-0">
              <h3 className="font-bold text-sm uppercase text-gray-500 mb-4">Update Order Status</h3>
              <div className="flex flex-wrap gap-3">
                {selectedOrder.status === 'pending' && (
                  <button onClick={() => updateOrderStatus(selectedOrder.id, 'packed')} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2">
                    <Package className="w-4 h-4" /> Mark as Packed
                  </button>
                )}
                {selectedOrder.status === 'packed' && (
                  <button onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Truck className="w-4 h-4" /> Mark as Shipped
                  </button>
                )}
                {selectedOrder.status === 'shipped' && (
                  <button onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')} className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Mark as Delivered
                  </button>
                )}
                {selectedOrder.status !== 'cancelled' && (
                  <button 
                    onClick={() => handleRefund(selectedOrder.id, selectedOrder.paymentId, selectedOrder.total)} 
                    className="px-6 py-2.5 border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" /> Cancel & Refund
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50 dark:bg-gray-950 p-8 text-center">
            <div>
              <Package className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Select an order</h3>
              <p className="text-gray-500">Choose an order from the list to view details and manage fulfillment.</p>
            </div>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );
}
