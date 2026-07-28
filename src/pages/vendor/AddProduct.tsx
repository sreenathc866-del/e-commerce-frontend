import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, DollarSign, Box, Image as ImageIcon, 
  Wand2, FileText, LayoutList, Truck, Search,
  CheckCircle2, ChevronRight, ChevronLeft, Upload, Save, Loader2, X
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { useNavigate, useParams } from 'react-router-dom';

const STEPS = [
  { id: 1, title: 'Basic Info', icon: Package },
  { id: 2, title: 'Pricing', icon: DollarSign },
  { id: 3, title: 'Inventory', icon: Box },
  { id: 4, title: 'Images', icon: ImageIcon },
];

export default function AddProduct() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditing);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    compare_at_price: '',
    stock_quantity: '0',
  });

  const [images, setImages] = useState<{file: File | null, preview: string, isExisting?: boolean}[]>([]);

  useEffect(() => {
    async function fetchProduct() {
      if (!isEditing || !id) return;
      try {
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            inventory (stock_quantity),
            product_images (image_url)
          `)
          .eq('id', id)
          .single();
          
        if (error) throw error;
        if (data) {
          setFormData({
            title: data.title,
            description: data.description || '',
            price: data.price.toString(),
            compare_at_price: data.compare_at_price ? data.compare_at_price.toString() : '',
            stock_quantity: Array.isArray(data.inventory) ? data.inventory[0]?.stock_quantity.toString() : (data.inventory as any)?.stock_quantity?.toString() || '0'
          });
          
          if (data.product_images && data.product_images.length > 0) {
            const existingImages = data.product_images.map((img: any) => ({
              file: null,
              preview: img.image_url,
              isExisting: true
            }));
            setImages(existingImages);
          }
        }
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProduct();
  }, [id, isEditing]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file)
      }));
      setImages(prev => [...prev, ...newFiles]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const renderStepContent = () => {
    switch(currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Product Name *</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full rounded-xl border-gray-200 dark:border-gray-800 dark:bg-gray-900 px-4 py-2 border focus:ring-2 focus:ring-black dark:focus:ring-white outline-none" 
                  placeholder="Premium Headphones" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  rows={4} 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full rounded-xl border-gray-200 dark:border-gray-800 dark:bg-gray-900 px-4 py-2 border focus:ring-2 focus:ring-black dark:focus:ring-white outline-none" 
                  placeholder="Detailed description..." 
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Pricing</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Price (₹) *</label>
                <input 
                  type="number" 
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full rounded-xl border-gray-200 dark:border-gray-800 dark:bg-gray-900 px-4 py-2 border focus:ring-2 focus:ring-black outline-none" 
                  placeholder="99.99" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Compare at Price (₹)</label>
                <input 
                  type="number" 
                  min="0"
                  step="0.01"
                  value={formData.compare_at_price}
                  onChange={(e) => setFormData({...formData, compare_at_price: e.target.value})}
                  className="w-full rounded-xl border-gray-200 dark:border-gray-800 dark:bg-gray-900 px-4 py-2 border focus:ring-2 focus:ring-black outline-none" 
                  placeholder="129.99" 
                />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Inventory</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Initial Stock Quantity *</label>
              <input 
                type="number" 
                min="0"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({...formData, stock_quantity: e.target.value.replace(/^0+/, '') || '0'})}
                className="w-full rounded-xl border-gray-200 dark:border-gray-800 dark:bg-gray-900 px-4 py-2 border focus:ring-2 focus:ring-black outline-none" 
                placeholder="100" 
              />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Product Images</h3>
            <label className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-3xl p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <Upload className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">Drag and drop your images here or click to browse</p>
              <p className="text-sm text-gray-500">Supports JPG, PNG, WEBP (Max 5MB each)</p>
              <input type="file" className="hidden" multiple accept="image/jpeg, image/png, image/webp" onChange={handleImageChange} />
            </label>

            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                {images.map((img, index) => (
                  <div key={index} className="relative group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 aspect-square bg-gray-50 dark:bg-gray-900">
                    <img src={img.preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      default:
        return (
          <div className="py-12 text-center text-gray-500">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Step {currentStep}: {STEPS.find(s => s.id === currentStep)?.title}</h3>
            <p>Form fields for this section go here.</p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{isEditing ? 'Edit Product' : 'Add New Product'}</h1>
          <p className="text-sm text-gray-500 mt-1">Complete the steps below to list a new item.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-xl font-medium shadow-sm hover:opacity-90">
          <Save className="w-4 h-4" /> Save as Draft
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Steps */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
            {STEPS.map((step, index) => {
              const isCompleted = currentStep > step.id;
              const isActive = currentStep === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isActive ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' :
                    isCompleted ? 'text-gray-900 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800' :
                    'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${isActive ? 'bg-white/20 dark:bg-black/10' : 'bg-gray-100 dark:bg-gray-800'}`}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <step.icon className="w-4 h-4" />}
                  </div>
                  <span className="font-medium text-sm text-left">{step.title}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8 min-h-[500px] flex flex-col">
            
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <>
                <div className="flex-1">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      {renderStepContent()}
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="flex justify-between mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                    disabled={currentStep === 1}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>
                  
                  {currentStep < STEPS.length ? (
                    <button
                      onClick={() => setCurrentStep(prev => Math.min(STEPS.length, prev + 1))}
                      className="flex items-center gap-2 px-5 py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-xl font-medium shadow-sm hover:opacity-90 transition-opacity"
                    >
                      Next Step <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button 
                      onClick={async () => {
                        if (!user || !formData.title || !formData.price) {
                          alert("Please fill out Title and Price.");
                          return;
                        }
                        setIsSaving(true);
                        try {
                          // 1. Get Shop ID
                          const { data: shop } = await supabase.from('shops').select('id').eq('vendor_id', user.id).single();
                          if (!shop) throw new Error("Shop not found");

                          let productId = id;

                          if (isEditing) {
                            const { error } = await supabase.from('products').update({
                              title: formData.title,
                              description: formData.description,
                              price: parseFloat(formData.price),
                              compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
                            }).eq('id', productId);
                            
                            if (error) throw error;

                            if (formData.stock_quantity) {
                               const { data: inv } = await supabase.from('inventory').select('id').eq('product_id', productId).maybeSingle();
                               if (inv) {
                                 const { error: invErr } = await supabase.from('inventory').update({ stock_quantity: parseInt(formData.stock_quantity) }).eq('id', inv.id);
                                 if (invErr) console.error("Error updating inventory:", invErr);
                               } else {
                                 const { error: invErr } = await supabase.from('inventory').insert({ product_id: productId, stock_quantity: parseInt(formData.stock_quantity) });
                                 if (invErr) console.error("Error inserting inventory:", invErr);
                               }
                            }
                          } else {
                            // 2. Insert Product
                            const { data: product, error: productError } = await supabase.from('products').insert({
                              shop_id: shop.id,
                              title: formData.title,
                              description: formData.description,
                              price: parseFloat(formData.price),
                              compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
                              status: 'published'
                            }).select().single();
                            
                            if (productError) throw productError;
                            productId = product.id;

                            // 3. Update Inventory
                            if (formData.stock_quantity) {
                               const { data: inv } = await supabase.from('inventory').select('id').eq('product_id', productId).maybeSingle();
                               if (inv) {
                                 const { error: invErr } = await supabase.from('inventory').update({ stock_quantity: parseInt(formData.stock_quantity) }).eq('id', inv.id);
                                 if (invErr) console.error("Error updating inventory:", invErr);
                               } else {
                                 const { error: invErr } = await supabase.from('inventory').insert({ product_id: productId, stock_quantity: parseInt(formData.stock_quantity) });
                                 if (invErr) console.error("Error inserting inventory:", invErr);
                               }
                            }
                          }
                          
                          // 4. Upload Images & Insert into product_images
                          const newImages = images.filter(img => !img.isExisting && img.file);
                          if (newImages.length > 0) {
                            const imagePromises = newImages.map(async (img, index) => {
                              const fileExt = img.file!.name.split('.').pop();
                              const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
                              const filePath = `${user.id}/${productId}/${fileName}`;
                              
                              const { error: uploadError } = await supabase.storage
                                .from('product-images')
                                .upload(filePath, img.file!);
                                
                              if (uploadError) throw uploadError;
                              
                              const { data: { publicUrl } } = supabase.storage
                                .from('product-images')
                                .getPublicUrl(filePath);
                                
                              const { error: dbError } = await supabase.from('product_images').insert({
                                product_id: productId,
                                image_url: publicUrl,
                                is_primary: index === 0,
                                display_order: index
                              });
                              if (dbError) throw dbError;
                            });
                            
                            await Promise.all(imagePromises);
                          }
                          
                          navigate('/dashboard/vendor/products');
                        } catch (e: any) {
                          console.error(e);
                          alert(e.message);
                        } finally {
                          setIsSaving(false);
                        }
                      }}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-medium shadow-sm hover:bg-emerald-600 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                      {isEditing ? 'Update Product' : 'Publish Product'}
                    </button>
                  )}
                </div>
              </>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
