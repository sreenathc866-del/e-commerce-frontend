import { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from '../ThemeToggle';
import AIChatbot from './AIChatbot';
import { 
  ShoppingBag, Search, Heart, ShoppingCart, User, 
  Menu, X, Store, LayoutGrid, ArrowRight
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import clsx from 'clsx';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';

// Onboarding Modal Component
interface OnboardingModalProps {
  user: any;
  onComplete: () => void;
  onClose: () => void;
}

function OnboardingModal({ user, onComplete, onClose }: OnboardingModalProps) {
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState('');
  const [house, setHouse] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('US');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !house || !street || !city || !state || !zip) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Update Profile (Name and Phone)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ full_name: fullName, phone })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 2. Insert Default Shipping Address
      const { error: addressError } = await supabase
        .from('addresses')
        .insert({
          user_id: user.id,
          full_name: fullName,
          mobile: phone,
          address_line1: house,
          address_line2: street,
          city,
          state,
          zip_code: zip,
          country,
          is_default: true
        });

      if (addressError) throw addressError;

      toast.success('Profile completed successfully!');
      onComplete();
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to complete profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-900 rounded-[2rem] w-full max-w-lg p-8 shadow-2xl border border-gray-100 dark:border-gray-800 overflow-y-auto max-h-[90vh]"
      >
        <div className="text-center mb-6">
          <span className="text-3xl">👋</span>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mt-2">Complete Your Profile</h2>
          <p className="text-sm text-gray-500 mt-1">To ensure smooth delivery, please complete your details before shopping.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Full Name</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Doe" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-sm" required />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Phone Number</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 234 567 8900" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-sm" required />
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-4 mt-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Default Shipping Address</h3>
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="House / Flat No." value={house} onChange={e => setHouse(e.target.value)} className="col-span-2 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-sm" required />
              <input type="text" placeholder="Street / Area" value={street} onChange={e => setStreet(e.target.value)} className="col-span-2 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-sm" required />
              <input type="text" placeholder="City" value={city} onChange={e => setCity(e.target.value)} className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-sm" required />
              <input type="text" placeholder="State" value={state} onChange={e => setState(e.target.value)} className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-sm" required />
              <input type="text" placeholder="ZIP / Pincode" value={zip} onChange={e => setZip(e.target.value)} className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-sm" required />
              <input type="text" placeholder="Country" value={country} onChange={e => setCountry(e.target.value)} className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-sm" required />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">
              Skip for Now
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-black text-white dark:bg-white dark:text-black rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center">
              {isSubmitting ? 'Saving...' : 'Save & Continue'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function CustomerLayout() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, logout, checkSession } = useAuthStore();
  const [isGuest, setIsGuest] = useState(localStorage.getItem('guest_session') === 'true');
  const navigate = useNavigate();
  const wishlistItems = useWishlistStore((state) => state.items);
  const cartItems = useCartStore((state) => state.items);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleStorageChange = () => {
      setIsGuest(localStorage.getItem('guest_session') === 'true');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const [showOnboarding, setShowOnboarding] = useState(false);

  const headerTextClass = isHome && !isScrolled ? "text-white" : "text-gray-900 dark:text-white";
  const headerIconClass = isHome && !isScrolled ? "text-white hover:text-white" : "text-gray-500 hover:text-black dark:hover:text-white";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if registered customer profile details are missing
  useEffect(() => {
    const isGuest = localStorage.getItem('guest_session') === 'true';
    if (user && user.role === 'customer' && !isGuest) {
      const checkOnboardingStatus = async () => {
        // Fetch addresses for the user
        const { data: addresses } = await supabase
          .from('addresses')
          .select('id')
          .eq('user_id', user.id);
        
        const hasAddress = addresses && addresses.length > 0;
        const hasPhone = !!user.phone;

        if (!hasAddress || !hasPhone) {
          setShowOnboarding(true);
        }
      };
      checkOnboardingStatus();
    }
  }, [user]);

  const navLinks = [
    { name: 'Products', path: '/customer/search' },
    { name: 'Categories', path: '/customer/search' },
    { name: 'Shops', path: '/customer/shops' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col transition-colors duration-300">
      
      {/* Onboarding Modal Overlay */}
      <AnimatePresence>
        {showOnboarding && user && (
          <OnboardingModal 
            user={user}
            onComplete={() => {
              setShowOnboarding(false);
              checkSession(); // refresh user session inside global authStore
            }}
            onClose={() => setShowOnboarding(false)}
          />
        )}
      </AnimatePresence>

      {/* Sticky Navbar */}
      <header className={clsx(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300 border-b",
        isScrolled 
          ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-gray-200 dark:border-gray-800 shadow-sm py-3" 
          : isHome 
            ? "bg-transparent border-transparent py-5" 
            : "bg-white dark:bg-gray-950 border-transparent py-5"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-6">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-black dark:bg-white rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
                <ShoppingBag className="w-6 h-6 text-white dark:text-black" strokeWidth={1.5} />
              </div>
              <span className={clsx("font-bold text-xl tracking-tight hidden sm:block", headerTextClass)}>Aura</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map(link => (
                <NavLink 
                  key={link.name} 
                  to={link.path}
                  className={({ isActive }) => clsx(
                    "text-sm font-medium transition-colors hover:text-black dark:hover:text-white",
                    isActive ? headerTextClass : (isHome && !isScrolled ? "text-white/80 hover:text-white" : "text-gray-500 dark:text-gray-400")
                  )}
                >
                  {link.name}
                </NavLink>
              ))}
            </nav>

            {/* Search Bar (Desktop) */}
            <div className="hidden lg:flex flex-1 max-w-md relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="text" 
                className={clsx("w-full pl-10 pr-4 py-2.5 border-transparent rounded-full text-sm transition-all focus:ring-0", isHome && !isScrolled ? "bg-white/20 text-white placeholder:text-white/60 focus:bg-white focus:text-gray-900" : "bg-gray-100 dark:bg-gray-900 focus:border-gray-300 dark:focus:border-gray-700 focus:bg-white dark:focus:bg-gray-800 text-gray-900 dark:text-white")}
                placeholder="Search products, brands, shops..." 
              />
            </div>

            {/* Icons */}
            <div className="flex items-center gap-2 sm:gap-4">
              <ThemeToggle />
              <button className={clsx("lg:hidden p-2", headerIconClass)}>
                <Search className="w-6 h-6" strokeWidth={1.5} />
              </button>
              
              {(user || isGuest) ? (
                <>
                  <Link to="/customer/wishlist" className={clsx("p-2 relative transition-colors", headerIconClass)}>
                    <Heart className="w-6 h-6" strokeWidth={1.5} />
                    {wishlistItems.length > 0 && (
                      <span className="absolute top-1 right-0 w-4 h-4 bg-indigo-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                        {wishlistItems.length}
                      </span>
                    )}
                  </Link>
                  <Link to="/customer/cart" className={clsx("p-2 relative transition-colors", headerIconClass)}>
                    <ShoppingCart className="w-6 h-6" strokeWidth={1.5} />
                    {cartItems.length > 0 && (
                      <span className="absolute top-1 right-0 w-4 h-4 bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                        {cartItems.length}
                      </span>
                    )}
                  </Link>
                  
                  {user ? (
                    user.role === 'vendor' ? (
                      <Link to="/dashboard/vendor" className={clsx("p-2 transition-colors", headerIconClass)}>
                        <User className="w-6 h-6" strokeWidth={1.5} />
                      </Link>
                    ) : (
                      <div className="relative">
                        <button 
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-800 border-2 border-transparent hover:border-indigo-500 overflow-hidden flex items-center justify-center transition-all"
                        >
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-sm text-gray-700 dark:text-gray-300">
                              {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                            </span>
                          )}
                        </button>

                        <AnimatePresence>
                          {isDropdownOpen && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                              <motion.div 
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-3 w-56 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl p-2 z-20"
                              >
                                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.full_name || 'Customer'}</p>
                                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                </div>
                                <div className="py-1">
                                  <Link to="/customer/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                    My Profile
                                  </Link>
                                  <Link to="/customer/orders" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                    My Orders
                                  </Link>
                                  <Link to="/customer/wishlist" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                    Wishlist
                                  </Link>
                                  <Link to="/customer/cart" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                    Cart
                                  </Link>
                                </div>
                                <div className="border-t border-gray-100 dark:border-gray-800 pt-1 mt-1">
                                  <button 
                                    onClick={() => { logout(); setIsDropdownOpen(false); navigate('/auth'); }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                                  >
                                    Logout
                                  </button>
                                </div>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500 font-medium hidden sm:inline">Guest</span>
                      <Link to="/auth" className={clsx("px-4 py-2 rounded-full text-xs font-semibold hover:opacity-90 transition-opacity", isHome && !isScrolled ? "bg-white text-black" : "bg-black text-white dark:bg-white dark:text-black")}>
                        Sign In
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <Link to="/auth" className={clsx("hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity", isHome && !isScrolled ? "bg-white text-black" : "bg-black text-white dark:bg-white dark:text-black")}>
                  Sign In <ArrowRight className="w-4 h-4" />
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className={clsx("md:hidden p-2 transition-colors", headerIconClass)}
              >
                <Menu className="w-6 h-6" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed inset-y-0 right-0 z-[70] w-full max-w-sm bg-white dark:bg-gray-950 shadow-2xl flex flex-col md:hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                <span className="font-bold text-xl text-gray-900 dark:text-white">Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-500 hover:text-black dark:hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                {navLinks.map(link => (
                  <Link 
                    key={link.name} 
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-4 py-3 rounded-xl text-base font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900"
                  >
                    {link.name}
                  </Link>
                ))}
                {!user && (
                  <div className="pt-6 mt-6 border-t border-gray-100 dark:border-gray-800">
                    <Link 
                      to="/auth"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex justify-center w-full bg-black text-white dark:bg-white dark:text-black px-5 py-3 rounded-xl text-base font-medium"
                    >
                      Sign In / Register
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content (Spacer for Sticky Header) */}
      <main className="flex-1 pt-24 pb-12 flex flex-col">
        <Outlet />
      </main>

      <AIChatbot />

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div className="space-y-4">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-white dark:text-black" strokeWidth={1.5} />
                </div>
                <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">Aura</span>
              </Link>
              <p className="text-gray-500 text-sm leading-relaxed">
                The premium destination for curated products, immersive 3D shopping, and independent vendors.
              </p>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold">GH</div>
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold">TW</div>
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-[10px] font-bold">IG</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-6">Shop</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li><Link to="/products" className="hover:text-black dark:hover:text-white transition-colors">All Products</Link></li>
                <li><Link to="/categories" className="hover:text-black dark:hover:text-white transition-colors">Categories</Link></li>
                <li><Link to="/shops" className="hover:text-black dark:hover:text-white transition-colors">Featured Shops</Link></li>
                <li><Link to="/trending" className="hover:text-black dark:hover:text-white transition-colors">Trending Now</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-6">Support</h4>
              <ul className="space-y-4 text-sm text-gray-500">
                <li><Link to="/faq" className="hover:text-black dark:hover:text-white transition-colors">FAQ</Link></li>
                <li><Link to="/shipping" className="hover:text-black dark:hover:text-white transition-colors">Shipping & Returns</Link></li>
                <li><Link to="/contact" className="hover:text-black dark:hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/track" className="hover:text-black dark:hover:text-white transition-colors">Track Order</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-6">Stay in the loop</h4>
              <p className="text-sm text-gray-500 mb-4">Subscribe to receive updates, access to exclusive deals, and more.</p>
              <form className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-black dark:focus:ring-white transition-shadow"
                />
                <button type="submit" className="px-4 py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p>© 2026 Aura Platform. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/privacy" className="hover:text-black dark:hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-black dark:hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
