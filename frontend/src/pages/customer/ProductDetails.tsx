import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Heart, Star, Truck, ShieldCheck, ChevronRight, Share2, Plus, Minus, Info } from 'lucide-react';
import { Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { useEffect } from 'react';





export default function ProductDetails() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('black');
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  
  const { addItem: addToCart, items: cartItems } = useCartStore();
  const { addItem: addToWishlist, items: wishlistItems } = useWishlistStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function loadProduct() {
      if (!id) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            id, title, description, price, rating,
            shops ( id, name, shipping_charge, tax_percentage ),
            product_images ( image_url ),
            product_3d_models ( model_url ),
            inventory ( stock_quantity )
          `)
          .eq('id', id)
          .single();

        if (data) {
          setProduct({
            id: data.id,
            name: data.title,
            vendorName: Array.isArray(data.shops) 
              ? (data.shops as any)[0]?.name 
              : (data.shops as any)?.name || 'Unknown Vendor',
            shopId: Array.isArray(data.shops)
              ? (data.shops as any)[0]?.id
              : (data.shops as any)?.id || '1',
            shippingCharge: Array.isArray(data.shops)
              ? (data.shops as any)[0]?.shipping_charge || 0
              : (data.shops as any)?.shipping_charge || 0,
            taxPercentage: Array.isArray(data.shops)
              ? (data.shops as any)[0]?.tax_percentage || 0
              : (data.shops as any)?.tax_percentage || 0,
            price: Number(data.price),
            rating: Number(data.rating) || 0,
            reviews: Math.floor(Math.random() * 150),
            description: data.description || 'No description available.',
            stock: Array.isArray(data.inventory) 
              ? (data.inventory as any)[0]?.stock_quantity || 0 
              : (data.inventory as any)?.stock_quantity || 0,
            modelUrl: data.product_3d_models?.[0]?.model_url || 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
            images: data.product_images?.length > 0 
              ? data.product_images.map((img: any) => img.image_url)
              : ['https://placehold.co/600x600/f9fafb/9ca3af.png?text=No+Image+Provided']
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <h2 className="text-xl font-bold">Product not found</h2>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link to="/" className="hover:text-black dark:hover:text-white">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/products" className="hover:text-black dark:hover:text-white">Home & Office</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 dark:text-gray-300 font-medium">{product.name}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
        
        {/* Left Column - Gallery */}
        <div className="w-full lg:w-1/2 space-y-4">
          <div className="aspect-square bg-gray-50 dark:bg-gray-950 rounded-[2.5rem] overflow-hidden border border-gray-200 dark:border-gray-800 relative">
            <img src={product.images[selectedImageIdx]} alt={product.name} className="w-full h-full object-cover" />
          </div>

          <div className="grid grid-cols-4 gap-4">
            {product.images.map((img: string, idx: number) => (
              <button 
                key={idx}
                onClick={() => setSelectedImageIdx(idx)}
                className={`aspect-square bg-gray-50 dark:bg-gray-950 rounded-2xl overflow-hidden border-2 transition-colors ${selectedImageIdx === idx ? 'border-indigo-600' : 'border-transparent hover:border-indigo-500'}`}
              >
                <img src={img} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column - Product Info */}
        <div className="w-full lg:w-1/2 flex flex-col pt-4">
          <div className="flex items-center justify-between mb-4">
            <Link to={`/customer/shops/${product.shopId || 1}`} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              {product.vendorName}
            </Link>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="font-semibold text-gray-900 dark:text-white">{product.rating}</span>
              <span className="text-gray-500 underline cursor-pointer">({product.reviews} reviews)</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4">
            {product.name}
          </h1>

          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            ₹{product.price.toFixed(2)}
          </div>

          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
            {product.description}
          </p>

          <div className="border-t border-gray-200 dark:border-gray-800 py-6 mb-8 space-y-6">
            
            {/* Color Selection */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Color</h3>
              <div className="flex items-center gap-3">
                {['black', 'white', 'gray'].map(color => (
                  <button 
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${selectedColor === color ? 'border-indigo-600 dark:border-indigo-400 scale-110' : 'border-transparent hover:scale-105'}`}
                  >
                    <span 
                      className="w-8 h-8 rounded-full shadow-sm border border-black/10 dark:border-white/10" 
                      style={{ backgroundColor: color }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center justify-between">
                Quantity
                <span className={`text-xs font-normal px-2 py-1 rounded-md ${
                  product.stock > 0 
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30' 
                    : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30'
                }`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </h3>
              <div className={`inline-flex items-center bg-gray-100 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-1 ${product.stock === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="p-2 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="p-2 text-gray-500 hover:text-black dark:hover:text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <button 
              onClick={() => {
                const isProductInCart = cartItems.some(item => item.productId === product.id);
                if (isProductInCart) {
                  navigate('/customer/cart');
                  return;
                }

                if (!user) {
                  navigate(`/auth?returnUrl=${location.pathname}`);
                  return;
                }
                addToCart({
                  id: Math.random().toString(36).substr(2, 9),
                  productId: product.id,
                  name: product.name,
                  vendorName: product.vendorName,
                  image: product.images[0],
                  price: product.price,
                  quantity,
                  stock: product.stock,
                  variant: selectedColor,
                  shopId: product.shopId,
                  shippingCharge: product.shippingCharge
                });
              }}
              disabled={product.stock === 0 && !cartItems.some(item => item.productId === product.id)}
              className={`flex-1 px-8 py-4 rounded-full font-bold transition-all flex items-center justify-center gap-2 ${
                product.stock === 0 && !cartItems.some(item => item.productId === product.id)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500 shadow-none'
                  : 'bg-black text-white dark:bg-white dark:text-black shadow-xl hover:scale-[1.02] active:scale-95'
              }`}
            >
              <ShoppingCart className="w-5 h-5" /> {cartItems.some(item => item.productId === product.id) ? 'Go to Cart' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
            <button 
              onClick={() => {
                addToWishlist({
                  productId: product.id,
                  name: product.name,
                  vendorName: product.vendorName,
                  image: product.images[0],
                  price: product.price,
                  status: product.stock > 0 ? 'In Stock' : 'Out of Stock'
                });
              }}
              className={`flex-none px-8 py-4 rounded-full font-bold border-2 transition-colors flex items-center justify-center gap-2 ${
                wishlistItems.find(i => i.productId === product.id) 
                  ? 'border-indigo-500 text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                  : 'border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white text-gray-900 dark:text-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${wishlistItems.find(i => i.productId === product.id) ? 'fill-indigo-500' : ''}`} />
            </button>
            <button className="flex-none px-8 py-4 rounded-full font-bold border-2 border-gray-200 dark:border-gray-800 hover:border-black dark:hover:border-white transition-colors flex items-center justify-center text-gray-900 dark:text-white">
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <Truck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Free worldwide shipping on orders over ₹150</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>30-day money-back guarantee</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
