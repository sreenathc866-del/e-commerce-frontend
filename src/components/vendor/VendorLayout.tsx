import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, Store, Package, Layers, 
  ClipboardList, Users, BarChart3, DollarSign, 
  MessageSquare, Bell, Settings, LogOut, Menu, X, CheckCircle2, ShoppingBag, User, ChevronDown
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import ThemeToggle from '../ThemeToggle';
import clsx from 'clsx';

const navItems = [
  { name: 'Dashboard', path: '/dashboard/vendor', icon: LayoutDashboard, exact: true },
  { name: 'Shop Profile', path: '#shop-section', icon: Store },
  { name: 'Products', path: '#products-section', icon: Package },
  { name: 'Orders', path: '#orders-section', icon: ShoppingBag },
  { name: 'Categories', path: '/dashboard/vendor/categories', icon: Layers },
  { name: 'Inventory', path: '/dashboard/vendor/inventory', icon: ClipboardList },
  { name: 'Customers', path: '/dashboard/vendor/customers', icon: Users },
  { name: 'Analytics', path: '/dashboard/vendor/analytics', icon: BarChart3 },
  { name: 'Revenue', path: '/dashboard/vendor/revenue', icon: DollarSign },
  { name: 'Reviews', path: '/dashboard/vendor/reviews', icon: MessageSquare },
  { name: 'Notifications', path: '/dashboard/vendor/notifications', icon: Bell },
  { name: 'Settings', path: '/dashboard/vendor/settings', icon: Settings },
];

export default function VendorLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex transition-colors duration-300">
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isSidebarOpen ? 0 : -320 }}
        className={clsx(
          "fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-2xl lg:shadow-none lg:static lg:translate-x-0 transition-transform duration-300 ease-in-out flex flex-col"
        )}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-white dark:text-black" />
            </div>
            <span className="font-bold text-lg text-gray-900 dark:text-white">Vendor Portal</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-black dark:hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-hide">
          {navItems.map((item) => {
            if (item.path.startsWith('#')) {
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setIsSidebarOpen(false);
                    // Navigate to root then scroll, or just scroll if we're already on it
                    if (window.location.pathname !== '/dashboard/vendor') {
                      navigate('/dashboard/vendor');
                      setTimeout(() => {
                        const el = document.querySelector(item.path);
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    } else {
                      const el = document.querySelector(item.path);
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                >
                  <item.icon className="w-5 h-5" strokeWidth={1.5} />
                  {item.name}
                </button>
              );
            }
            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.exact}
                className={({ isActive }) => clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium",
                  isActive 
                    ? "bg-black text-white dark:bg-white dark:text-black shadow-md" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                )}
                onClick={() => setIsSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5" strokeWidth={1.5} />
                {item.name}
              </NavLink>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-gray-100 dark:bg-gray-800">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
              {user?.full_name?.charAt(0) || 'V'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.full_name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <button className="relative p-2 text-gray-500 hover:text-black dark:hover:text-white transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
              <Bell className="w-6 h-6" strokeWidth={1.5} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
            </button>
            
            {/* User Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                  {user?.full_name?.charAt(0) || 'V'}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
              </button>

              <AnimatePresence>
                {isProfileMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsProfileMenuOpen(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-xl rounded-2xl py-2 z-50 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 mb-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.full_name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      
                      <button 
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          if (window.location.pathname !== '/dashboard/vendor') {
                            navigate('/dashboard/vendor');
                            setTimeout(() => {
                              const el = document.querySelector('#shop-section');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }, 100);
                          } else {
                            const el = document.querySelector('#shop-section');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-black dark:hover:text-white transition-colors"
                      >
                        <Store className="w-4 h-4" /> Add / Edit Shop Details
                      </button>
                      
                      <button 
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          navigate('/dashboard/vendor/settings');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-black dark:hover:text-white transition-colors"
                      >
                        <Settings className="w-4 h-4" /> Account Settings
                      </button>

                      <div className="h-px bg-gray-100 dark:bg-gray-800 my-2" />

                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
