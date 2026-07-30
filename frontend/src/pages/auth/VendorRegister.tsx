import { motion } from 'framer-motion';
import { Store } from 'lucide-react';
import VendorSignupForm from '../../components/auth/VendorSignupForm';
import { Link } from 'react-router-dom';

export default function VendorRegister() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden dark:bg-gray-950 transition-colors duration-500">
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
            <Store className="w-8 h-8" strokeWidth={1.5} />
          </div>
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight"
        >
          Vendor Registration
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400"
        >
          Join our premium marketplace to sell your products.
        </motion.p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="mt-8 sm:mx-auto sm:w-full max-w-3xl relative z-10"
      >
        <div className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-3xl sm:px-10 border border-gray-100 dark:border-gray-800">
          <VendorSignupForm />
          
          <div className="mt-6 text-center">
            <Link
              to="/auth"
              className="text-sm font-medium text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              Already have a vendor account? Sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
