import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Store, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';

type Tab = 'customer' | 'vendor';

export default function UnifiedLogin() {
  const [activeTab, setActiveTab] = useState<Tab>('customer');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const returnUrl = searchParams.get('returnUrl');
  
  const [email, setEmail] = useState('');
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${returnUrl || '/customer/home'}`
        }
      });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in with Google');
    }
  };

  const handleMagicLinkLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSendingMagicLink(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}${returnUrl || '/customer/home'}`
        }
      });
      if (error) throw error;
      toast.success('Magic sign-in link sent! Please check your email inbox.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send magic link');
    } finally {
      setIsSendingMagicLink(false);
    }
  };

  const handleGuestLogin = () => {
    // You could set a flag in localStorage or context if needed
    localStorage.setItem('guest_session', 'true');
    navigate(returnUrl || '/customer/home');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden dark:bg-gray-950 transition-colors duration-500">
      {/* Background Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 100, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-gradient-to-br from-indigo-100/40 to-purple-100/40 dark:from-indigo-900/20 dark:to-purple-900/20 blur-3xl opacity-50"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 120, ease: "linear" }}
          className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tr from-pink-100/40 to-orange-100/40 dark:from-pink-900/20 dark:to-orange-900/20 blur-3xl opacity-50"
        />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex justify-center"
        >
          <div className="bg-black dark:bg-white text-white dark:text-black p-3 rounded-2xl shadow-xl">
            {activeTab === 'customer' ? (
              <ShoppingBag className="w-8 h-8" strokeWidth={1.5} />
            ) : (
              <Store className="w-8 h-8" strokeWidth={1.5} />
            )}
          </div>
        </motion.div>
        <motion.h2 
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight"
        >
          {activeTab === 'customer' ? 'Welcome Back' : 'Vendor Portal'}
        </motion.h2>
        <motion.p 
          key={`desc-${activeTab}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400"
        >
          {activeTab === 'customer' 
            ? 'Sign in to manage your cart, wishlist, and orders.' 
            : 'Sign in to manage your store and orders.'}
        </motion.p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 sm:mx-auto sm:w-full max-w-md relative z-10"
      >
        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl py-6 px-4 shadow-2xl sm:rounded-3xl sm:px-10 border border-gray-100 dark:border-gray-800 overflow-hidden">
          
          {/* Custom Tabs */}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6 relative">
            <button
              onClick={() => setActiveTab('customer')}
              className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors relative z-10 ${
                activeTab === 'customer' ? 'text-black dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              Customer
            </button>
            <button
              onClick={() => setActiveTab('vendor')}
              className={`flex-1 text-sm font-medium py-2 rounded-lg transition-colors relative z-10 ${
                activeTab === 'vendor' ? 'text-black dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
              }`}
            >
              Vendor
            </button>
            <motion.div
              layoutId="activeTabIndicator"
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-gray-700 rounded-lg shadow-sm"
              animate={{
                left: activeTab === 'customer' ? '4px' : 'calc(50% + 0px)'
              }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          </div>

          {/* Form Area */}
          <div className="min-h-[220px]">
            <AnimatePresence mode="wait">
              {activeTab === 'customer' ? (
                <motion.div
                  key="customer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <button
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors mb-3"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      <path d="M1 1h22v22H1z" fill="none" />
                    </svg>
                    Continue with Google
                  </button>

                  <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200 dark:border-gray-800" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">Or sign in with email</span>
                    </div>
                  </div>

                  <form onSubmit={handleMagicLinkLogin} className="space-y-3">
                    <input
                      type="email"
                      required
                      placeholder="Enter your email (e.g. gmail)"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={isSendingMagicLink}
                      className="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-750 disabled:opacity-50 transition-colors"
                    >
                      {isSendingMagicLink ? 'Sending magic link...' : 'Send Magic Link'}
                    </button>
                  </form>

                  <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200 dark:border-gray-800" />
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">Or browse directly</span>
                    </div>
                  </div>

                  <button
                    onClick={handleGuestLogin}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl shadow-sm text-sm font-medium hover:bg-gray-900 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all"
                  >
                    Continue as Guest
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="vendor"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <LoginForm />
                  <div className="mt-6 text-center">
                    <Link
                      to="/vendor/signup"
                      className="text-sm font-medium text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
                    >
                      Don't have a vendor account? Register
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
