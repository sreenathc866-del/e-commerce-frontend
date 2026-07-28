import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, MoreVertical, Package, ArrowUpDown, LayoutGrid, List as ListIcon, Edit, Trash2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

export default function ProductsList() {
  const { user } = useAuthStore();
  const [view, setView] = useState<'grid' | 'table'>('table');
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      if (!user) return;
      try {
        const { data: shop } = await supabase.from('shops').select('id').eq('vendor_id', user.id).single();
        if (!shop) return;

        const { data } = await supabase
          .from('products')
          .select(`
            id,
            title,
            price,
            status,
            categories ( name ),
            inventory ( stock_quantity )
          `)
          .eq('shop_id', shop.id)
          .order('created_at', { ascending: false });

        if (data) {
          const formatted = data.map(p => ({
            id: p.id,
            name: p.title,
            category: Array.isArray(p.categories) 
              ? (p.categories as any)[0]?.name 
              : (p.categories as any)?.name || 'Uncategorized',
            price: p.price,
            stock: Array.isArray(p.inventory) 
              ? (p.inventory as any)[0]?.stock_quantity 
              : (p.inventory as any)?.stock_quantity || 0,
            status: p.status === 'published' ? 'Published' : p.status === 'draft' ? 'Draft' : 'Archived',
          }));
          setProducts(formatted);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await supabase.from('products').delete().eq('id', id);
      setProducts(products.filter(p => p.id !== id));
    } catch (e) {
      console.error(e);
      alert("Failed to delete product");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Package className="w-6 h-6" /> Products
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your product catalog and inventory.</p>
        </div>
        <Link 
          to="/dashboard/vendor/products/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-xl font-medium shadow-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          Add New Product
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex w-full sm:w-auto gap-4">
          <div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input 
              type="text" 
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-black dark:focus:ring-white bg-gray-50 dark:bg-gray-950 text-sm"
              placeholder="Search products..."
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm font-medium">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button 
              onClick={() => setView('table')}
              className={`p-1.5 rounded-md transition-colors ${view === 'table' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500'}`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setView('grid')}
              className={`p-1.5 rounded-md transition-colors ${view === 'grid' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Product List/Table View */}
      {view === 'table' ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="bg-gray-50 dark:bg-gray-950/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><div className="flex items-center gap-1">Price <ArrowUpDown className="w-3 h-3"/></div></th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"><div className="flex items-center gap-1">Stock <ArrowUpDown className="w-3 h-3"/></div></th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {isLoading ? (
                  <tr><td colSpan={6} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" /></td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-500">No products found. Start by adding one!</td></tr>
                ) : products.map((product) => (
                  <motion.tr 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={product.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center text-xl">
                          📦
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{product.name}</div>
                          <div className="text-sm text-gray-500">ID: {product.id.substring(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">₹{product.price.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock} units</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${product.status === 'Published' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 
                          product.stock === 0 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                        {product.stock === 0 && product.status === 'Published' ? 'Out of Stock' : product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/dashboard/vendor/products/edit/${product.id}`} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"><Edit className="w-4 h-4"/></Link>
                      <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"><Trash2 className="w-4 h-4"/></button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <div className="col-span-full py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
          ) : products.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-500">No products found. Start by adding one!</div>
          ) : products.map((product) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={product.id} 
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col group"
            >
              <div className="h-48 bg-gray-100 dark:bg-gray-800 relative flex items-center justify-center text-5xl">
                📦
                <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm">
                  {product.stock === 0 && product.status === 'Published' ? 'Out of Stock' : product.status}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-1">{product.category}</div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{product.name}</h3>
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <div className="text-lg font-bold">₹{product.price.toFixed(2)}</div>
                  <div className="text-sm text-gray-500">{product.stock} left</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

    </div>
  );
}
