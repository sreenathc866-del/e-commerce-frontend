import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { Shield, ShieldCheck, Truck, Lock, Star, ArrowRight, Zap, TrendingUp, Grid, HeadphonesIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/customer/ProductCard';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

gsap.registerPlugin(ScrollTrigger);

const categories = [
  { name: 'Electronics', icon: '📱', color: 'bg-blue-500/10 text-blue-600' },
  { name: 'Fashion', icon: '👕', color: 'bg-pink-500/10 text-pink-600' },
  { name: 'Home & Living', icon: '🛋️', color: 'bg-amber-500/10 text-amber-600' },
  { name: 'Beauty', icon: '✨', color: 'bg-purple-500/10 text-purple-600' },
  { name: 'Sports', icon: '🏃‍♂️', color: 'bg-green-500/10 text-green-600' },
  { name: 'Toys', icon: '🎮', color: 'bg-red-500/10 text-red-600' },
];

export default function Home() {
  const { user } = useAuthStore();
  const [isGuest, setIsGuest] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const trustSectionRef = useRef(null);

  const handleEnterAsGuest = () => {
    localStorage.setItem('guest_session', 'true');
    setIsGuest(true);
    // Notify navigation bar / layout of guest session change
    window.dispatchEvent(new Event('storage'));
    
    // Smooth scroll to the welcome section after it renders
    setTimeout(() => {
      document.getElementById('welcome-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const isLoggedIn = !!user;

  console.log("Home Page State - user:", user, "isGuest:", isGuest, "isLoggedIn:", isLoggedIn);

  useGSAP(() => {
    gsap.from('.trust-stat', {
      scrollTrigger: {
        trigger: trustSectionRef.current,
        start: 'top 75%',
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: 'back.out(1.5)',
    });

    gsap.from('.trust-card', {
      scrollTrigger: {
        trigger: '.trust-card-container',
        start: 'top 80%',
      },
      scale: 0.9,
      opacity: 0,
      y: 20,
      duration: 0.6,
      stagger: 0.15,
      ease: 'power2.out',
    });

    gsap.from('.category-card', {
      scrollTrigger: {
        trigger: '.categories-section',
        start: 'top 80%',
      },
      y: 30,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      ease: 'back.out(1.2)',
    });
  }, { scope: trustSectionRef });

  useEffect(() => {
    async function loadProducts() {
      // Fetch Featured Products (using latest published)
      const { data: featuredData } = await supabase
        .from('products')
        .select(`
          id, title, price, compare_at_price, rating, status,
          shops!inner ( name, is_verified ),
          product_images ( image_url )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(4);

      if (featuredData) {
        setFeaturedProducts(featuredData.map((p: any) => ({
          id: p.id,
          name: p.title,
          vendorName: p.shops?.name || 'Unknown Vendor',
          price: Number(p.price),
          image: p.product_images?.[0]?.image_url || 'https://placehold.co/600x600/f9fafb/9ca3af.png?text=No+Image+Provided',
          rating: Number(p.rating) || 0,
          reviews: Math.floor(Math.random() * 100), // mock reviews for now
          status: 'In Stock' as const,
          compareAtPrice: p.compare_at_price ? Number(p.compare_at_price) : undefined,
          discount: p.compare_at_price > p.price ? Math.round(((p.compare_at_price - p.price) / p.compare_at_price) * 100) : undefined
        })));
      }

      // Fetch Trending Products (highest rating)
      const { data: trendingData } = await supabase
        .from('products')
        .select(`
          id, title, price, compare_at_price, rating, status,
          shops!inner ( name, is_verified ),
          product_images ( image_url )
        `)
        .eq('status', 'published')
        .order('rating', { ascending: false })
        .limit(4);

      if (trendingData) {
        setTrendingProducts(trendingData.map((p: any) => ({
          id: p.id,
          name: p.title,
          vendorName: p.shops?.name || 'Unknown Vendor',
          price: Number(p.price),
          image: p.product_images?.[0]?.image_url || 'https://placehold.co/600x600/f9fafb/9ca3af.png?text=No+Image+Provided',
          rating: Number(p.rating) || 0,
          reviews: Math.floor(Math.random() * 200),
          status: 'In Stock' as const,
          compareAtPrice: p.compare_at_price ? Number(p.compare_at_price) : undefined,
          discount: p.compare_at_price > p.price ? Math.round(((p.compare_at_price - p.price) / p.compare_at_price) * 100) : undefined
        })));
      }
      setIsLoading(false);
    }
    loadProducts();
  }, []);

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">

      {/* 1. Trust Section / Hero (Only visible before login or guest) */}
      {!isLoggedIn && (
        <section ref={trustSectionRef} className="py-24 bg-[#0a0a0a] relative overflow-hidden flex-1 flex flex-col justify-center min-h-[calc(100vh-80px)]">
          {/* Animated Background Elements (Minimum Animation) */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#ffffff10_1px,_transparent_1px)] bg-[length:24px_24px] opacity-20" />
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] rounded-full bg-indigo-500/10 blur-[100px]"
            />
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.15, 0.1] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-1/4 right-1/4 w-[30vw] h-[30vw] rounded-full bg-orange-500/10 blur-[100px]"
            />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight">
                Trusted by Thousands of <br /> <span className="text-orange-400">Sellers & Buyers</span>
              </h2>
              <p className="text-gray-400 text-lg md:text-xl mb-12">
                Every vendor verified, every payment secured, every review real. A marketplace built on trust, not promises.
              </p>

              <div className="flex flex-wrap justify-center gap-4 mb-16">
                <Link to="/auth" className="px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold shadow-lg transition-colors">
                  Sign In / Register
                </Link>
                <button
                  onClick={handleEnterAsGuest}
                  className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-bold border border-white/20 transition-colors"
                >
                  Browse as Guest
                </button>
              </div>

              <div className="flex flex-wrap justify-center gap-8 md:gap-16 border-t border-white/10 pt-10">
                <div className="trust-stat">
                  <div className="text-3xl md:text-5xl font-bold text-white mb-2">2,480+</div>
                  <div className="text-[10px] md:text-xs font-semibold tracking-widest text-gray-500 uppercase">Verified Vendors</div>
                </div>
                <div className="trust-stat">
                  <div className="text-3xl md:text-5xl font-bold text-white mb-2">86k+</div>
                  <div className="text-[10px] md:text-xs font-semibold tracking-widest text-gray-500 uppercase">Active Buyers</div>
                </div>
                <div className="trust-stat">
                  <div className="text-3xl md:text-5xl font-bold text-white mb-2">4.9</div>
                  <div className="text-[10px] md:text-xs font-semibold tracking-widest text-gray-500 uppercase">Avg. Rating</div>
                </div>
              </div>
            </div>

            <div className="trust-card-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1 */}
              <div className="trust-card bg-[#111] border border-white/10 rounded-3xl p-6 flex flex-col backdrop-blur-sm hover:border-white/20 transition-colors group">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-6 h-6 text-emerald-400" />
                  </div>
                  <span className="px-3 py-1 bg-emerald-400/10 text-emerald-400 text-[10px] font-bold rounded-full uppercase tracking-wider">Verified</span>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Verified Vendors</h3>
                <p className="text-gray-400 text-sm mb-6 flex-1">ID checked & business approved before listing</p>
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                  <div className="flex -space-x-2">
                    <div className="w-5 h-5 rounded-full bg-gray-700 border border-[#111]"></div>
                    <div className="w-5 h-5 rounded-full bg-gray-600 border border-[#111]"></div>
                    <div className="w-5 h-5 rounded-full bg-gray-500 border border-[#111]"></div>
                  </div>
                  +2.4k verified today
                </div>
              </div>

              {/* Card 2 */}
              <div className="trust-card bg-[#111] border border-white/10 rounded-3xl p-6 flex flex-col backdrop-blur-sm hover:border-white/20 transition-colors group">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                    <Lock className="w-6 h-6 text-gray-400" />
                  </div>
                  <span className="px-3 py-1 bg-black text-white text-[10px] font-bold rounded-full border border-white/10 uppercase tracking-wider">Encrypted</span>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Secure Payments</h3>
                <p className="text-gray-400 text-sm mb-6 flex-1">256-bit SSL & escrow protection on every order</p>
                <div className="flex gap-2 mt-auto">
                  <span className="px-2 py-1 bg-white/5 rounded text-[10px] font-bold text-gray-400">VISA</span>
                  <span className="px-2 py-1 bg-white/5 rounded text-[10px] font-bold text-gray-400">MC</span>
                  <span className="px-2 py-1 bg-white/5 rounded text-[10px] font-bold text-gray-400">PP</span>
                  <span className="px-2 py-1 text-[10px] font-medium text-gray-500 flex items-center">+ more</span>
                </div>
              </div>

              {/* Card 3 */}
              <div className="trust-card bg-[#111] border border-white/10 rounded-3xl p-6 flex flex-col backdrop-blur-sm hover:border-white/20 transition-colors group">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-1 group-hover:scale-105 transition-transform">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 text-orange-400 fill-orange-400" />)}
                  </div>
                  <span className="px-3 py-1 bg-orange-400/10 text-orange-400 text-[10px] font-bold rounded-full uppercase tracking-wider">4.9 ★</span>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Real Reviews</h3>
                <p className="text-gray-400 text-sm mb-6 flex-1">Verified buyers only — no fake feedback</p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="w-6 h-6 rounded-full bg-gray-800 text-white flex items-center justify-center text-[10px] font-bold">A</div>
                  <span className="text-[10px] text-gray-500 font-medium">2m ago</span>
                </div>
              </div>

              {/* Card 4 */}
              <div className="trust-card bg-[#111] border border-white/10 rounded-3xl p-6 flex flex-col backdrop-blur-sm hover:border-white/20 transition-colors group">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center border border-white/5 relative overflow-hidden group-hover:scale-110 transition-transform">
                    <Truck className="w-6 h-6 text-orange-200 z-10" />
                    <motion.div
                      animate={{ x: [-20, 20] }}
                      transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                      className="absolute bottom-2 h-[2px] w-4 bg-orange-500/50 rounded-full"
                    />
                  </div>
                  <span className="px-3 py-1 bg-orange-400/10 text-orange-400 text-[10px] font-bold rounded-full uppercase tracking-wider">Live</span>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Fast Delivery</h3>
                <p className="text-gray-400 text-sm mb-6 flex-1">Avg. 2.1 days — tracked from warehouse</p>
                <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden mt-auto">
                  <motion.div
                    initial={{ width: "0%" }}
                    whileInView={{ width: "80%" }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    viewport={{ once: true }}
                    className="h-full bg-orange-400 rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. Welcome banner & Storefront items (Only visible after login or guest) */}
      {(isLoggedIn || isGuest) && (
        <>
          {/* Welcome Banner */}
          <section id="welcome-section" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-orange-500 to-indigo-600 p-8 md:p-12 shadow-xl">
              <div className="absolute inset-0 bg-black/10" />
              <div className="relative z-10 max-w-2xl">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 text-white text-xs font-semibold rounded-full backdrop-blur-md mb-4">
                  <Zap className="w-3 h-3 fill-white" /> Exclusive Offers
                </span>
                <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">
                  {user ? `Welcome back, ${user.full_name || 'Shopper'}!` : 'Welcome to Aura Marketplace!'}
                </h1>
                <p className="text-white/90 text-sm md:text-base mb-6 max-w-lg">
                  Explore handpicked premium goods, immersive 3D product previews, and verified vendor deals created just for you.
                </p>
                <Link to="/customer/products" className="inline-flex items-center gap-2 bg-white text-black hover:bg-gray-100 px-6 py-3 rounded-xl text-sm font-semibold transition-all">
                  Start Shopping <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="absolute right-0 bottom-0 top-0 w-1/3 hidden md:block bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-white/20 to-transparent rounded-l-full" />
            </div>
          </section>

          {/* Categories Grid */}
          <section className="categories-section py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
            <div className="flex items-center gap-3 mb-10">
              <Grid className="w-6 h-6 text-gray-900 dark:text-white" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Shop by Category</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  to={`/customer/category/${category.name.toLowerCase()}`}
                  className="category-card flex flex-col items-center justify-center p-6 bg-white dark:bg-[#111] rounded-3xl border border-gray-100 dark:border-white/5 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 hover:shadow-xl dark:hover:shadow-indigo-500/10 transition-all group"
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform ${category.color}`}>
                    {category.icon}
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm text-center">{category.name}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* Featured Products */}
          <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Drops</h2>
                </div>
                <p className="text-gray-500 dark:text-gray-400">Handpicked selections from top vendors.</p>
              </div>
              <Link to="/customer/search" className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:gap-3 transition-all">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-[4/5] bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
                ))
              ) : featuredProducts.length > 0 ? (
                featuredProducts.map(product => (
                  <ProductCard key={product.id} {...product} />
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-gray-500">
                  <p>No featured products available at the moment.</p>
                </div>
              )}
            </div>
          </section>

          {/* Promotional Banner */}
          <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
            <div className="relative rounded-[3rem] overflow-hidden bg-black px-8 py-16 md:px-16 md:py-24 flex flex-col md:flex-row items-center justify-between gap-12 group">
              <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-700">
                <img src="https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2000" alt="Promo" className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />

              <div className="relative z-10 max-w-xl">
                <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-bold tracking-wide mb-6">
                  NEW FEATURE
                </span>
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                  Interact before you buy.
                </h2>
                <p className="text-lg text-gray-300 mb-8">
                  Select products now support full 3D interaction. Rotate, zoom, and inspect every detail right from your browser.
                </p>
                <Link to="/customer/search?has3d=true" className="inline-flex items-center justify-center px-8 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform">
                  Explore 3D Catalog
                </Link>
              </div>
            </div>
          </section>

          {/* Trending Products */}
          <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Trending Now</h2>
                </div>
                <p className="text-gray-500 dark:text-gray-400">Highest rated products this week.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <div key={i} className="aspect-[4/5] bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
                ))
              ) : trendingProducts.length > 0 ? (
                trendingProducts.map(product => (
                  <ProductCard key={product.id} {...product} />
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-gray-500">
                  <p>No trending products right now.</p>
                </div>
              )}
            </div>
          </section>
        </>
      )}

      {/* Features/Trust Footer (Always visible) */}
      <section className="py-20 bg-white dark:bg-[#111] border-t border-gray-100 dark:border-white/5 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Free Shipping</h3>
              <p className="text-gray-500 dark:text-gray-400">On all orders over ₹50</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Secure Payments</h3>
              <p className="text-gray-500 dark:text-gray-400">256-bit SSL encryption</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-6">
                <HeadphonesIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">24/7 Support</h3>
              <p className="text-gray-500 dark:text-gray-400">Always here to help you</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
