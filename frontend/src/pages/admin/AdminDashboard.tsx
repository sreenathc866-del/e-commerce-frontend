import { Users, Store, Package, ShoppingBag, IndianRupee, TrendingUp, AlertTriangle, Cuboid } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const DATA = [
  { name: 'Mon', revenue: 4000, orders: 24 },
  { name: 'Tue', revenue: 3000, orders: 18 },
  { name: 'Wed', revenue: 5000, orders: 35 },
  { name: 'Thu', revenue: 2780, orders: 15 },
  { name: 'Fri', revenue: 6890, orders: 48 },
  { name: 'Sat', revenue: 8390, orders: 62 },
  { name: 'Sun', revenue: 7490, orders: 55 },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/transactions`, {
          headers: {
            'Authorization': `Bearer ${sessionData.session?.access_token}`
          }
        });
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;
  if (!stats) return <div className="p-8 text-center text-red-500">Failed to load dashboard.</div>;

  const formatCurrency = (val: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);

  const STATS = [
    { name: 'Total Revenue', value: formatCurrency(stats.totalRevenue), change: 'Total', icon: IndianRupee, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { name: 'Platform Commission', value: formatCurrency(stats.totalCommission), change: 'Total', icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
    { name: 'Vendor Payouts', value: formatCurrency(stats.vendorPayouts), change: 'Processed', icon: Store, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { name: 'Pending Transfers', value: formatCurrency(stats.pendingTransfers), change: 'Pending', icon: ShoppingBag, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-500/10' },
    { name: 'Active Vendors', value: stats.activeVendors.toString(), change: 'Platform', icon: Users, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
    { name: 'Success Rate', value: `${stats.successRate}%`, change: 'Rate', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { name: 'Failed Payments', value: stats.failedPayments.toString(), change: 'Total', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' },
    { name: 'Total Products', value: 'Live', change: 'Beta', icon: Package, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <div key={stat.name} className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400`}>
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{stat.name}</p>
              <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Revenue Overview</h3>
              <p className="text-sm text-gray-500">Last 7 days performance (Demo)</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={(val) => `₹${val/1000}k`} />
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.1} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111827', borderRadius: '12px', border: 'none', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Latest Transactions</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-6">
            {stats.recentTransactions.map((tx: any) => (
              <div key={tx.id} className="flex gap-4 items-start relative">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-emerald-50 dark:bg-emerald-900/30">
                  <IndianRupee className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">Transaction: {tx.payment_id || tx.id}</h4>
                  <p className="text-xs text-gray-500 mt-1">{formatCurrency(tx.amount)} - {tx.status}</p>
                </div>
              </div>
            ))}
            {stats.recentTransactions.length === 0 && (
              <p className="text-sm text-gray-500 text-center mt-4">No transactions yet.</p>
            )}
          </div>
          <button className="w-full mt-6 py-2.5 bg-gray-50 dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-sm font-bold transition-colors">
            View All Logs
          </button>
        </div>

      </div>
    </div>
  );
}
