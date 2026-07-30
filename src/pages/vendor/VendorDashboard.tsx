import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  Package, ShoppingCart, Clock, Truck, CheckCircle, 
  Users, IndianRupee, AlertTriangle, XCircle, ArrowUpRight, ArrowDownRight, Loader2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import ProductsList from './ProductsList';
import VendorOrders from './VendorOrders';
import ShopProfile from './ShopProfile';

// Initial empty data, will be populated by fetch
const emptyData = [
  { name: 'Mon', sales: 0, revenue: 0 },
  { name: 'Tue', sales: 0, revenue: 0 },
  { name: 'Wed', sales: 0, revenue: 0 },
  { name: 'Thu', sales: 0, revenue: 0 },
  { name: 'Fri', sales: 0, revenue: 0 },
  { name: 'Sat', sales: 0, revenue: 0 },
  { name: 'Sun', sales: 0, revenue: 0 },
];

const StatCard = ({ title, value, icon: Icon, trend, trendUp, color }: any) => (
  <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-800">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <div className={`flex items-center text-sm font-medium ${trendUp ? 'text-emerald-500' : 'text-red-500'}`}>
          {trendUp ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
          {trend}
        </div>
      )}
    </div>
    <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
  </div>
);

export default function VendorDashboard() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  
  const [stats, setStats] = useState({
    revenue: 0,
    orders: 0,
    customers: 0,
    products: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    outOfStock: 0,
    commissionDeducted: 0,
    totalPayouts: 0,
    pendingPayouts: 0,
  });
  const [chartData, setChartData] = useState(emptyData);

  useEffect(() => {
    async function fetchDashboardStats() {
      if (!user) return;
      try {
        // 1. Get Vendor's Shop and Account info
        const { data: shopData } = await supabase
          .from('shops')
          .select(`
            id, 
            vendor_accounts ( razorpay_account_id, onboarding_status, kyc_status )
          `)
          .eq('vendor_id', user.id)
          .single();

        if (!shopData) {
          setIsLoading(false);
          return;
        }

        const sId = shopData.id;

        // 2. Get Products
        const { data: products } = await supabase
          .from('products')
          .select('id')
          .eq('shop_id', sId);

        const productIds = products?.map(p => p.id) || [];

        // 3. Get Inventory for Out of Stock
        let outOfStock = 0;
        if (productIds.length > 0) {
          const { data: inventory } = await supabase
            .from('inventory')
            .select('stock_quantity')
            .in('product_id', productIds);
          outOfStock = inventory?.filter(inv => inv.stock_quantity === 0).length || 0;
        }

        // 4. Get Order Items for this shop (to get revenue and unique orders)
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('order_id, quantity, unit_price')
          .eq('shop_id', sId);

        let revenue = 0;
        let orderIds = new Set<string>();

        if (orderItems) {
          orderItems.forEach(item => {
            revenue += item.quantity * item.unit_price;
            orderIds.add(item.order_id);
          });
        }

        const uniqueOrderIds = Array.from(orderIds);

        // 5. Get Orders for statuses and customers
        let pending = 0;
        let processing = 0;
        let shipped = 0;
        let delivered = 0;
        let customers = new Set<string>();

        if (uniqueOrderIds.length > 0) {
          const { data: orders } = await supabase
            .from('orders')
            .select('id, status, customer_id, created_at')
            .in('id', uniqueOrderIds);

          const orderMap = new Map();

          if (orders) {
            orders.forEach(order => {
              customers.add(order.customer_id);
              if (order.status === 'pending') pending++;
              if (order.status === 'confirmed' || order.status === 'packed') processing++;
              if (order.status === 'shipped') shipped++;
              if (order.status === 'delivered') delivered++;
              orderMap.set(order.id, order.created_at);
            });
          }

          // Build chart data for the last 7 days
          const last7Days = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return {
              dateString: d.toISOString().split('T')[0],
              name: d.toLocaleDateString('en-US', { weekday: 'short' }),
              sales: 0,
              revenue: 0
            };
          });

          if (orderItems) {
            orderItems.forEach(item => {
              const orderDateStr = orderMap.get(item.order_id);
              if (orderDateStr) {
                const itemDateStr = orderDateStr.split('T')[0];
                const dayObj = last7Days.find(d => d.dateString === itemDateStr);
                if (dayObj) {
                  dayObj.sales += item.quantity;
                  dayObj.revenue += item.quantity * item.unit_price;
                }
              }
            });
          }
          setChartData(last7Days);
        }

        // 6. Fetch real ledger payouts
        let ledgerRevenue = revenue;
        let ledgerOrders = uniqueOrderIds.length;
        let commissionDeducted = 0;
        let totalPayouts = 0;
        let pendingPayouts = 0;

        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/vendor/balance`, {
            headers: {
              'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
            }
          });
          if (res.ok) {
            const data = await res.json();
            ledgerRevenue = data.revenue || revenue;
            commissionDeducted = data.commission_deducted || 0;
            totalPayouts = data.total_payouts || 0;
            pendingPayouts = data.pending || 0;
            ledgerOrders = data.orders_count || uniqueOrderIds.length;
          }
        } catch (e) {
          console.error('Failed to fetch ledger balance', e);
        }

        setStats({
          revenue: ledgerRevenue,
          orders: ledgerOrders,
          customers: customers.size,
          products: productIds.length,
          pending,
          processing,
          shipped,
          delivered,
          outOfStock,
          commissionDeducted,
          totalPayouts,
          pendingPayouts
        });

      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardStats();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Welcome back, here's what's happening with your store today.</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-sm rounded-xl px-4 py-2 focus:ring-black dark:focus:ring-white">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>This Year</option>
          </select>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={`₹${stats.revenue.toFixed(2)}`} icon={IndianRupee} trend={stats.revenue > 0 ? "+0.0%" : undefined} trendUp={true} color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" />
        <StatCard title="Platform Commission" value={`₹${stats.commissionDeducted.toFixed(2)}`} icon={AlertTriangle} color="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" />
        <StatCard title="Total Payouts" value={`₹${stats.totalPayouts.toFixed(2)}`} icon={CheckCircle} color="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" />
        <StatCard title="Pending Payouts" value={`₹${stats.pendingPayouts.toFixed(2)}`} icon={Clock} color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Orders" value={stats.orders} icon={ShoppingCart} trend={stats.orders > 0 ? "+0.0%" : undefined} trendUp={true} color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" />
        <StatCard title="Total Customers" value={stats.customers} icon={Users} color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" />
        <StatCard title="Total Products" value={stats.products} icon={Package} color="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" />
      </div>

      {/* Order Status Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-4">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-xl"><Clock className="w-5 h-5" /></div>
          <div><p className="text-sm text-gray-500">Pending</p><p className="font-semibold text-lg">{stats.pending}</p></div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl"><Package className="w-5 h-5" /></div>
          <div><p className="text-sm text-gray-500">Processing</p><p className="font-semibold text-lg">{stats.processing}</p></div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-4">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-xl"><Truck className="w-5 h-5" /></div>
          <div><p className="text-sm text-gray-500">Shipped</p><p className="font-semibold text-lg">{stats.shipped}</p></div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-4">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-xl"><CheckCircle className="w-5 h-5" /></div>
          <div><p className="text-sm text-gray-500">Delivered</p><p className="font-semibold text-lg">{stats.delivered}</p></div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-4 col-span-2 lg:col-span-1">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl"><XCircle className="w-5 h-5" /></div>
          <div><p className="text-sm text-gray-500">Out of Stock</p><p className="font-semibold text-lg">{stats.outOfStock}</p></div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Revenue Overview</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ stroke: '#e5e7eb', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
          <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Sales Volume</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f3f4f6' }}
                />
                <Bar dataKey="sales" fill="#aa3bff" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 my-8"></div>

      {/* Orders Section */}
      <section id="orders-section" className="scroll-mt-24">
        <VendorOrders />
      </section>

      <div className="border-t border-gray-200 dark:border-gray-800 my-8"></div>

      {/* Products Section */}
      <section id="products-section" className="scroll-mt-24">
        <ProductsList />
      </section>

      <div className="border-t border-gray-200 dark:border-gray-800 my-8"></div>

      {/* Shop Profile Section */}
      <section id="shop-section" className="scroll-mt-24">
        <ShopProfile />
      </section>

    </div>
  );
}
