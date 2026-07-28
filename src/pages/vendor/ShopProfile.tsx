import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Store, MapPin, Globe, Loader2, Save, Upload, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

export default function ShopProfile() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [shopId, setShopId] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      shopName: '',
      description: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      country: '',
      postalCode: '',
      website: '',
      instagram: '',
      isVisible: true,
    }
  });

  const isVisible = watch('isVisible');

  // Load shop data
  useEffect(() => {
    async function loadShop() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('shops')
          .select('*')
          .eq('vendor_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          setShopId(data.id);
          reset({
            shopName: data.name || '',
            description: data.description || '',
            phone: data.phone || '',
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            country: data.country || '',
            postalCode: data.postal_code || '',
            website: data.website || '',
            instagram: data.instagram || '',
            isVisible: data.is_visible !== false,
            shippingCharge: data.shipping_charge || 0,
            taxPercentage: data.tax_percentage || 0
          });
          setLogoPreview(data.logo_url);
          setBannerPreview(data.banner_url);
        }
      } catch (err: any) {
        console.error('Error loading shop profile:', err);
        toast.error('Failed to load shop details');
      }
    }
    loadShop();
  }, [user, reset]);

  // Handle Logo Upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploadingLogo(true);
    const toastId = toast.loading('Uploading logo...');
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/logo-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('shop-logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('shop-logos')
        .getPublicUrl(fileName);

      setLogoPreview(publicUrl);
      toast.success('Logo uploaded successfully!', { id: toastId });
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to upload logo', { id: toastId });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // Handle Banner Upload
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploadingBanner(true);
    const toastId = toast.loading('Uploading banner...');
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/banner-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('shop-banners')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('shop-banners')
        .getPublicUrl(fileName);

      setBannerPreview(publicUrl);
      toast.success('Banner uploaded successfully!', { id: toastId });
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to upload banner', { id: toastId });
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const onSubmit = async (data: any) => {
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading('Saving shop profile...');

    try {
      const shopPayload = {
        name: data.shopName,
        description: data.description,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        postal_code: data.postalCode,
        website: data.website,
        instagram: data.instagram,
        is_visible: data.isVisible,
        shipping_charge: data.shippingCharge,
        tax_percentage: data.taxPercentage,
        logo_url: logoPreview,
        banner_url: bannerPreview,
        updated_at: new Date().toISOString()
      };

      let error;
      if (shopId) {
        const { error: updateError } = await supabase
          .from('shops')
          .update(shopPayload)
          .eq('id', shopId);
        error = updateError;
      } else {
        const { data: newShop, error: insertError } = await supabase
          .from('shops')
          .insert({
            ...shopPayload,
            vendor_id: user.id
          })
          .select()
          .single();
        error = insertError;
        if (newShop) setShopId(newShop.id);
      }

      if (error) throw error;
      toast.success('Shop profile updated successfully!', { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to save shop profile', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <input type="file" ref={logoInputRef} onChange={handleLogoUpload} className="hidden" accept="image/*" />
      <input type="file" ref={bannerInputRef} onChange={handleBannerUpload} className="hidden" accept="image/*" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shop Profile</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your storefront appearance and details.</p>
        </div>
        <button 
          onClick={handleSubmit(onSubmit)}
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2.5 bg-black text-white dark:bg-white dark:text-black rounded-xl font-medium shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Branding</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Shop Logo</label>
                <div onClick={() => !isUploadingLogo && logoInputRef.current?.click()} className="h-32 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer overflow-hidden relative group">
                  {isUploadingLogo ? <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" /> : logoPreview ? <>
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                    </> : <>
                      <Upload className="w-6 h-6 text-gray-400 mb-2" />
                      <span className="text-xs text-gray-500">Click to upload logo</span>
                    </>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Shop Banner</label>
                <div onClick={() => !isUploadingBanner && bannerInputRef.current?.click()} className="h-32 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer overflow-hidden relative group">
                  {isUploadingBanner ? <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" /> : bannerPreview ? <>
                      <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="w-6 h-6 text-white" />
                      </div>
                    </> : <>
                      <Upload className="w-6 h-6 text-gray-400 mb-2" />
                      <span className="text-xs text-gray-500">Click to upload banner (1200x400)</span>
                    </>}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isVisible ? <Eye className="w-4 h-4 text-emerald-500" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Shop Visibility</label>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" {...register('isVisible')} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-black/20 dark:peer-focus:ring-white/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-black dark:peer-checked:bg-white"></div>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {isVisible ? 'Your shop is visible to all customers.' : 'Your shop is hidden from customers.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b pb-2 dark:border-gray-800"><Store className="w-5 h-5 text-gray-400"/> Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shop Name</label>
                    <input type="text" {...register('shopName')} className="w-full rounded-xl border-gray-200 dark:border-gray-800 dark:bg-gray-900 px-4 py-2 focus:ring-black dark:focus:ring-white border" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea rows={3} {...register('description')} className="w-full rounded-xl border-gray-200 dark:border-gray-800 dark:bg-gray-900 px-4 py-2 focus:ring-black dark:focus:ring-white border" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Phone</label>
                    <input type="text" {...register('phone')} className="w-full rounded-xl border-gray-200 dark:border-gray-800 dark:bg-gray-900 px-4 py-2 focus:ring-black dark:focus:ring-white border" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b pb-2 dark:border-gray-800"><MapPin className="w-5 h-5 text-gray-400"/> Location Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                    <input type="text" {...register('address')} className="w-full rounded-xl border-gray-200 dark:border-gray-800 dark:bg-gray-900 px-4 py-2 focus:ring-black dark:focus:ring-white border" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                    <input type="text" {...register('city')} className="w-full rounded-xl border-gray-200 dark:border-gray-800 dark:bg-gray-900 px-4 py-2 focus:ring-black dark:focus:ring-white border" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State / Province</label>
                    <input type="text" {...register('state')} className="w-full rounded-xl border-gray-200 dark:border-gray-800 dark:bg-gray-900 px-4 py-2 focus:ring-black dark:focus:ring-white border" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                    <input type="text" {...register('country')} className="w-full rounded-xl border-gray-200 dark:border-gray-800 dark:bg-gray-900 px-4 py-2 focus:ring-black dark:focus:ring-white border" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Postal Code</label>
                    <input type="text" {...register('postalCode')} className="w-full rounded-xl border-gray-200 dark:border-gray-800 dark:bg-gray-900 px-4 py-2 focus:ring-black dark:focus:ring-white border" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b pb-2 dark:border-gray-800"><Globe className="w-5 h-5 text-gray-400"/> Social Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</label>
                    <input type="url" {...register('website')} className="w-full rounded-xl border-gray-200 dark:border-gray-800 dark:bg-gray-900 px-4 py-2 focus:ring-black dark:focus:ring-white border" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instagram</label>
                    <input type="url" {...register('instagram')} className="w-full rounded-xl border-gray-200 dark:border-gray-800 dark:bg-gray-900 px-4 py-2 focus:ring-black dark:focus:ring-white border" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Store Rates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Shipping Charge (Flat Rate)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                    <input type="number" step="0.01" {...register('shippingCharge')} className="block w-full pl-8 pr-3 py-2 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-black dark:focus:ring-white bg-gray-50 dark:bg-gray-950 text-sm" />
                  </div>
                  {errors.shippingCharge && <p className="text-red-500 text-xs mt-1">{errors.shippingCharge.message as string}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tax Percentage (%)</label>
                  <div className="relative">
                    <input type="number" step="0.1" {...register('taxPercentage')} className="block w-full pr-8 pl-3 py-2 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-black dark:focus:ring-white bg-gray-50 dark:bg-gray-950 text-sm" />
                    <span className="absolute right-3 top-2.5 text-gray-500">%</span>
                  </div>
                  {errors.taxPercentage && <p className="text-red-500 text-xs mt-1">{errors.taxPercentage.message as string}</p>}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
