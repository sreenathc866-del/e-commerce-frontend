import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, Shield, Loader2, Save, Upload, Banknote, Key } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

export default function VendorSettings() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      razorpayAccountId: ''
    }
  });

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      try {
        // Fetch profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        // Fetch vendor accounts for razorpay ID
        const { data: shop } = await supabase
          .from('shops')
          .select('id')
          .eq('vendor_id', user.id)
          .single();

        let vendorAccount = null;
        if (shop) {
          const { data } = await supabase
            .from('vendor_accounts')
            .select('razorpay_account_id')
            .eq('shop_id', shop.id)
            .single();
          vendorAccount = data;
        }

        reset({
          fullName: profile.full_name || '',
          email: profile.email || user.email || '',
          razorpayAccountId: vendorAccount?.razorpay_account_id || ''
        });

        if (profile.avatar_url) {
          setAvatarPreview(profile.avatar_url);
        }
      } catch (err: any) {
        console.error('Error loading profile:', err);
        toast.error('Failed to load settings');
      }
    }
    loadProfile();
  }, [user, reset]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploadingAvatar(true);
    const toastId = toast.loading('Uploading avatar...');
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`;

      // Upload to avatars bucket (or shop-logos if avatars bucket doesn't exist)
      const { error: uploadError } = await supabase.storage
        .from('shop-logos') // Reusing shop-logos bucket for vendor avatars to avoid creating new bucket
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('shop-logos')
        .getPublicUrl(fileName);

      setAvatarPreview(publicUrl);
      
      // Update profile with new avatar
      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      toast.success('Avatar updated successfully!', { id: toastId });
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to upload avatar', { id: toastId });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setIsResettingPassword(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: window.location.origin + '/dashboard/vendor/settings',
      });
      if (error) throw error;
      toast.success('Password reset email sent! Check your inbox.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const onSubmit = async (data: any) => {
    if (!user) return;
    setIsLoading(true);
    const toastId = toast.loading('Saving settings...');

    try {
      // 1. Update Profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: data.fullName,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // 2. Update Vendor Account (Razorpay ID)
      if (data.razorpayAccountId) {
        const { data: shop } = await supabase
          .from('shops')
          .select('id')
          .eq('vendor_id', user.id)
          .single();

        if (shop) {
          // Try to update, if no row exists, we might need to insert. Let's do an upsert
          const { error: vendorAccountError } = await supabase
            .from('vendor_accounts')
            .upsert({
              shop_id: shop.id,
              razorpay_account_id: data.razorpayAccountId,
              updated_at: new Date().toISOString()
            }, { onConflict: 'shop_id' });
          
          if (vendorAccountError) throw vendorAccountError;
        }
      }

      toast.success('Settings updated successfully!', { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to save settings', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <input type="file" ref={avatarInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Account Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your personal profile and security preferences.</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Security */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center">
            <div 
              onClick={() => !isUploadingAvatar && avatarInputRef.current?.click()} 
              className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-lg mb-4 overflow-hidden relative group cursor-pointer bg-gray-50 dark:bg-gray-800 flex items-center justify-center"
            >
              {isUploadingAvatar ? (
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              ) : avatarPreview ? (
                <>
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                </>
              ) : (
                <User className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Profile Picture</h3>
            <p className="text-xs text-gray-500 mt-1">Click image to upload a new avatar</p>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b pb-2 dark:border-gray-800"><Shield className="w-5 h-5 text-gray-400"/> Security</h3>
            <p className="text-sm text-gray-500 mb-4">Protect your account with a strong password.</p>
            <button 
              onClick={handlePasswordReset}
              disabled={isResettingPassword}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              {isResettingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              Send Password Reset
            </button>
          </div>
        </div>

        {/* Right Column: Details Form */}
        <div className="md:col-span-2 space-y-6">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            
            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b pb-2 dark:border-gray-800"><User className="w-5 h-5 text-gray-400"/> Personal Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <input type="text" {...register('fullName')} className="w-full rounded-xl border-gray-200 dark:border-gray-800 dark:bg-gray-900 px-4 py-2 focus:ring-black dark:focus:ring-white border" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                    <input type="email" {...register('email')} disabled className="w-full pl-10 rounded-xl border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 px-4 py-2 border text-gray-500 cursor-not-allowed" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Email address cannot be changed.</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 border-b pb-2 dark:border-gray-800"><Banknote className="w-5 h-5 text-gray-400"/> Payout Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Razorpay Account ID (Optional)</label>
                  <input type="text" {...register('razorpayAccountId')} className="w-full rounded-xl border-gray-200 dark:border-gray-800 dark:bg-gray-900 px-4 py-2 focus:ring-black dark:focus:ring-white border" placeholder="acc_xxxxxxxxxxxxxx" />
                  <p className="text-xs text-gray-500 mt-1">Enter your Razorpay Linked Account ID to receive automated payouts. Used for Route transfers.</p>
                </div>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
