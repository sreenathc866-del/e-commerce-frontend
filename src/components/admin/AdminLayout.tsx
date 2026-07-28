import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Users, Store, Package, ShoppingBag, 
  Settings, LogOut, Menu, X, ShieldAlert, BarChart3, Bell
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import ThemeToggle from '../ThemeToggle';
import clsx from 'clsx';

const NAVIGATION = [
  { name: 'Overview', path: '/dashboard/admin', icon: LayoutDashboard },
  { name: 'Vendors', path: '/dashboard/admin/vendors', icon: Store },
  { name: 'Customers', path: '/dashboard/admin/customers', icon: Users },
  { name: 'Shops', path: '/dashboard/admin/shops', icon: Store },
  { name: 'Products', path: '/dashboard/admin/products', icon: Package },
  { name: 'Orders', path: '/dashboard/admin/orders', icon: ShoppingBag },
  { name: 'Analytics', path: '/dashboard/admin/analytics', icon: BarChart3 },
  { name: 'Settings', path: '/dashboard/admin/settings', icon: Settings },
];

export default function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex transition-colors duration-500">
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 fixed inset-y-0 z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-black dark:bg-white rounded-xl flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-white dark:text-black" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">Super Admin</h1>
            <p className="text-xs font-medium text-gray-500">Platform Control</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {NAVIGATION.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                  isActive 
                    ? "bg-black dark:bg-white text-white dark:text-black font-bold shadow-lg" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-black dark:hover:text-white font-medium"
                )}
              >
                <item.icon className={clsx("w-5 h-5", isActive ? "" : "group-hover:scale-110 transition-transform")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <button 
            onClick={() => logout()}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-bold transition-colors"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:pl-72 flex flex-col min-h-screen relative">
        
        {/* Top Navbar */}
        <header className="h-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white hidden sm:block">
              {NAVIGATION.find(n => n.path === location.pathname)?.name || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <button className="relative p-2 text-gray-500 hover:text-black dark:hover:text-white transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-ping" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-800">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{user?.full_name || 'Admin User'}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-sm">
                <span className="font-bold text-indigo-700 dark:text-indigo-300">A</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-8 flex-1">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col lg:hidden"
            >
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black dark:bg-white rounded-xl flex items-center justify-center">
                    <ShieldAlert className="w-6 h-6 text-white dark:text-black" />
                  </div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin</h1>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
                {NAVIGATION.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={clsx(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                      location.pathname === item.path
                        ? "bg-black dark:bg-white text-white dark:text-black font-bold" 
                        : "text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                ))}
              </nav>
              <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); logout(); }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-bold transition-colors"
                >
                  <LogOut className="w-5 h-5" /> Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
