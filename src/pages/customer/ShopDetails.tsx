import { ShieldCheck, MapPin, Star, Share2 } from 'lucide-react';
import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ProductCard from '../../components/customer/ProductCard';
import { supabase } from '../../lib/supabase';

export default function ShopDetails() {
  const { id } = useParams();
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadShopData() {
      if (!id) return;
      setIsLoading(true);

      // Fetch shop details
      const { data: shopData } = await supabase
        .from('shops')
        .select('*')
        .eq('id', id)
        .single();

      if (shopData) {
        setShop({
          id: shopData.id,
          name: shopData.name,
          category: shopData.category || 'General Store',
          rating: 0,
          reviews: 0,
          totalProducts: 0,
          address: shopData.address || 'Online Store',
          banner: shopData.banner_url || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&q=80',
          logo: shopData.logo_url || 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&q=80',
          isVerified: shopData.is_verified || false,
          description: shopData.description || 'Welcome to our shop!'
        });
      }

      // Fetch shop products
      const { data: productsData } = await supabase
        .from('products')
        .select(`
          id, title, price, compare_at_price, rating, status,
          product_images ( image_url )
        `)
        .eq('shop_id', id)
        .eq('status', 'published');

      if (productsData) {
        setProducts(productsData.map((p: any) => ({
          id: p.id,
          name: p.title,
          vendorName: shopData?.name || 'Unknown Vendor',
          price: Number(p.price),
          image: p.product_images?.[0]?.image_url || 'https://placehold.co/600x600/f9fafb/9ca3af.png?text=No+Image+Provided',
          rating: Number(p.rating) || 0,
          reviews: 0,
          status: 'In Stock' as const,
          discount: p.compare_at_price > p.price ? Math.round(((p.compare_at_price - p.price) / p.compare_at_price) * 100) : undefined
        })));
      }

      setIsLoading(false);
    }

    loadShopData();
  }, [id]);

  if (isLoading) {
    return <div className="w-full flex items-center justify-center min-h-[50vh]">Loading...</div>;
  }

  if (!shop) {
    return <div className="w-full flex items-center justify-center min-h-[50vh]">Shop not found.</div>;
  }

  return (
    <div className="w-full">
      {/* Banner */}
      <div className="h-64 sm:h-80 w-full relative">
        <img src={shop.banner} alt={shop.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Shop Info Container - overlapping banner */}
        <div className="relative -mt-24 mb-12 bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center">
          
          <div className="w-32 h-32 rounded-2xl border-4 border-white dark:border-gray-900 overflow-hidden bg-white flex-shrink-0 shadow-sm relative -mt-16 md:mt-0">
            <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                  {shop.name}
                  {shop.isVerified && <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
                </h1>
                <p className="text-indigo-600 dark:text-indigo-400 font-medium mt-1">{shop.category}</p>
                <p className="text-gray-500 mt-3 max-w-2xl leading-relaxed">{shop.description}</p>
              </div>

              <div className="flex gap-3">
                <button className="px-5 py-2.5 border-2 border-gray-200 dark:border-gray-800 rounded-xl font-bold hover:border-black dark:hover:border-white transition-colors flex items-center justify-center">
                  Follow
                </button>
                <button className="px-3 py-2.5 border-2 border-gray-200 dark:border-gray-800 rounded-xl font-bold hover:border-black dark:hover:border-white transition-colors flex items-center justify-center">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="font-bold text-gray-900 dark:text-white">{shop.rating}</span>
                <span className="text-gray-500">({shop.reviews} reviews)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <MapPin className="w-5 h-5" />
                <span>{shop.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Shop Products */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Products from {shop.name}</h2>
            <select className="bg-transparent text-sm font-medium focus:ring-0 cursor-pointer">
              <option>Recommended</option>
              <option>Newest</option>
              <option>Price: Low to High</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.length > 0 ? (
              products.map(product => (
                <ProductCard key={product.id} {...product} />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                This shop has no published products yet.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
