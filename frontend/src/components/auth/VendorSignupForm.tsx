import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, User, Phone, Loader2, Store, MapPin, Hash, Building, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

const vendorSchema = z.object({
  // Owner Info
  ownerName: z.string().min(2, 'Owner name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  phone: z.string().min(5, 'Phone number is required'),
  
  // Business Info
  businessName: z.string().min(2, 'Business name is required'),
  shopName: z.string().min(2, 'Shop name is required'),
  address: z.string().min(5, 'Business Address is required'),
  state: z.string().min(2, 'State is required'),
  district: z.string().min(2, 'District is required'),
  pincode: z.string().min(4, 'Pincode is required'),

  // Optional
  gstNumber: z.string().optional(),

  // Terms
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the Terms & Conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type VendorFormValues = z.infer<typeof vendorSchema>;

export default function VendorSignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const checkSession = useAuthStore((state) => state.checkSession);
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
  });

  const onSubmit = async (data: VendorFormValues) => {
    setIsLoading(true);
    const id = toast.loading('Setting up your shop...');

    try {
      const emailParts = data.email.split('@');
      const vendorEmail = `${emailParts[0]}+vendor@${emailParts[1]}`;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: vendorEmail,
        password: data.password,
        options: {
          data: { 
            full_name: data.ownerName, 
            role: 'vendor',
            phone: data.phone,
            business_name: data.businessName,
            shop_name: data.shopName,
            address: data.address,
            state: data.state,
            district: data.district,
            pincode: data.pincode,
            gst_number: data.gstNumber
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // The database trigger automatically creates the profile (status: pending) and empty shop.
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      await checkSession();
      toast.success('Registration submitted for review!', { id });
      
      // Force sign out because they are pending
      await supabase.auth.signOut();
      useAuthStore.getState().setUser(null);
      
      navigate('/auth');
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign up', { id });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      
      {/* SECTION: Owner Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2 text-gray-900 dark:text-white dark:border-gray-800">Owner Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
            <div className="mt-1 relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input type="text" {...register('ownerName')} className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-black dark:focus:ring-white bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white sm:text-sm" placeholder="John Doe" />
            </div>
            {errors.ownerName && <p className="mt-1 text-sm text-red-500">{errors.ownerName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
            <div className="mt-1 relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input type="email" {...register('email')} className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-black dark:focus:ring-white bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white sm:text-sm" placeholder="john@example.com" />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <div className="mt-1 relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input type={showPassword ? "text" : "password"} {...register('password')} className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-black dark:focus:ring-white bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white sm:text-sm" placeholder="••••••••" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
            <div className="mt-1 relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input type={showConfirmPassword ? "text" : "password"} {...register('confirmPassword')} className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-black dark:focus:ring-white bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white sm:text-sm" placeholder="••••••••" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>}
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mobile Number</label>
            <div className="mt-1 relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input type="tel" {...register('phone')} className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-black dark:focus:ring-white bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white sm:text-sm" placeholder="+1 (555) 000-0000" />
            </div>
            {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>}
          </div>
        </div>
      </div>

      {/* SECTION: Business Info */}
      <div className="space-y-4 pt-4">
        <h3 className="text-lg font-semibold border-b pb-2 text-gray-900 dark:text-white dark:border-gray-800">Business Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Business Name</label>
            <div className="mt-1 relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Building className="h-5 w-5 text-gray-400" />
              </div>
              <input type="text" {...register('businessName')} className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-black dark:focus:ring-white bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white sm:text-sm" placeholder="Acme Corp LLC" />
            </div>
            {errors.businessName && <p className="mt-1 text-sm text-red-500">{errors.businessName.message}</p>}
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Shop Name</label>
            <div className="mt-1 relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Store className="h-5 w-5 text-gray-400" />
              </div>
              <input type="text" {...register('shopName')} className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-black dark:focus:ring-white bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white sm:text-sm" placeholder="Super Tech Store" />
            </div>
            {errors.shopName && <p className="mt-1 text-sm text-red-500">{errors.shopName.message}</p>}
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">GST Number (Optional)</label>
            <div className="mt-1 relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Hash className="h-5 w-5 text-gray-400" />
              </div>
              <input type="text" {...register('gstNumber')} className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-black dark:focus:ring-white bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white sm:text-sm" placeholder="22AAAAA0000A1Z5" />
            </div>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Business Address</label>
            <div className="mt-1 relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input type="text" {...register('address')} className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-black dark:focus:ring-white bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white sm:text-sm" placeholder="123 Commerce St" />
            </div>
            {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">State</label>
            <input type="text" {...register('state')} className="mt-1 block w-full px-3 py-2.5 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-black dark:focus:ring-white bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white sm:text-sm" placeholder="State" />
            {errors.state && <p className="mt-1 text-sm text-red-500">{errors.state.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">District</label>
            <input type="text" {...register('district')} className="mt-1 block w-full px-3 py-2.5 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-black dark:focus:ring-white bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white sm:text-sm" placeholder="District" />
            {errors.district && <p className="mt-1 text-sm text-red-500">{errors.district.message}</p>}
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pincode</label>
            <input type="text" {...register('pincode')} className="mt-1 block w-full px-3 py-2.5 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-black dark:focus:ring-white bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white sm:text-sm" placeholder="Zip" />
            {errors.pincode && <p className="mt-1 text-sm text-red-500">{errors.pincode.message}</p>}
          </div>
        </div>
      </div>

      <div className="flex items-center pt-4">
        <input 
          id="agreeTerms" 
          type="checkbox" 
          {...register('agreeTerms')} 
          className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded" 
        />
        <label htmlFor="agreeTerms" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
          I agree to the Terms & Conditions
        </label>
      </div>
      {errors.agreeTerms && <p className="mt-1 text-sm text-red-500">{errors.agreeTerms.message}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all active:scale-[0.98] mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : (
          <>
            Create Vendor Account
            <ArrowRight className="ml-2 h-5 w-5" />
          </>
        )}
      </button>
    </form>
  );
}
