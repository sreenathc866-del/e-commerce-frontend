import { Users, Store, Package, ShoppingBag, DollarSign, TrendingUp, AlertTriangle, Cuboid } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DATA = [
  { name: 'Mon', revenue: 4000, orders: 24 },
  { name: 'Tue', revenue: 3000, orders: 18 },
  { name: 'Wed', revenue: 5000, orders: 35 },
  { name: 'Thu', revenue: 2780, orders: 15 },
  { name: 'Fri', revenue: 6890, orders: 48 },
  { name: 'Sat', revenue: 8390, orders: 62 },
  { name: 'Sun', revenue: 7490, orders: 55 },
];

const STATS = [
  { name: 'Total Revenue', value: '$84,250', change: '+12.5%', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  { name: 'Platform Commission', value: '$8,425', change: '+14.2%', icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
  { name: 'Active Vendors', value: '142', change: '+4', icon: Store, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
  { name: 'Total Customers', value: '8,234', change: '+124', icon: Users, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
  { name: 'Total Products', value: '4,521', change: '+89', icon: Package, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-500/10' },
  { name: 'Pending Orders', value: '45', change: '-12', icon: ShoppingBag, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-500/10' },
  { name: 'AI Models Gen.', value: '1,204', change: '+55', icon: Cuboid, color: 'text-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-500/10' },
  { name: 'Low Stock Alerts', value: '12', change: '+2', icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' },
];

export default function AdminDashboard() {
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
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                stat.change.startsWith('+') ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'
              }`}>
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
              <p className="text-sm text-gray-500">Last 7 days performance</p>
            </div>
            <select className="px-3 py-1.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium">
              <option>This Week</option>
              <option>Last Week</option>
              <option>This Month</option>
            </select>
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
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={(val) => `$${val/1000}k`} />
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
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-6">
            {[
              { title: 'New Vendor Registered', desc: 'TechHaven Electronics joined the platform', time: '5m ago', type: 'vendor' },
              { title: 'Large Order Placed', desc: 'Order #ORD-8921 for $1,240.00', time: '12m ago', type: 'order' },
              { title: 'AI Model Generated', desc: '3D Model for "Leather Sofa" completed', time: '1h ago', type: 'ai' },
              { title: 'Product Out of Stock', desc: 'Vendor "Lumina" ran out of Desk Lamps', time: '2h ago', type: 'alert' },
              { title: 'Payout Processed', desc: '$4,200 transferred to "AudioTech"', time: '3h ago', type: 'payment' },
            ].map((activity, i) => (
              <div key={i} className="flex gap-4 items-start relative">
                {i !== 4 && <div className="absolute left-4 top-8 bottom-[-24px] w-0.5 bg-gray-100 dark:bg-gray-800 -z-10" />}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                  activity.type === 'vendor' ? 'bg-blue-100 text-blue-600' :
                  activity.type === 'order' ? 'bg-emerald-100 text-emerald-600' :
                  activity.type === 'ai' ? 'bg-indigo-100 text-indigo-600' :
                  activity.type === 'alert' ? 'bg-red-100 text-red-600' :
                  'bg-yellow-100 text-yellow-600'
                }`}>
                  <span className="w-2.5 h-2.5 rounded-full bg-current" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">{activity.title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{activity.desc}</p>
                  <p className="text-xs text-gray-400 font-medium mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2.5 bg-gray-50 dark:bg-gray-950 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-sm font-bold transition-colors">
            View All Logs
          </button>
        </div>

      </div>
    </div>
  );
}
