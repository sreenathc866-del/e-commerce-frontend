import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, User, Phone, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

const customerSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export default function CustomerSignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const checkSession = useAuthStore((state) => state.checkSession);
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
  });

  const onSubmit = async (data: CustomerFormValues) => {
    setIsLoading(true);
    const id = toast.loading('Creating your account...');

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { full_name: data.fullName, role: 'customer' }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // The database trigger automatically creates the profile.
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      await checkSession();
      toast.success('Account created successfully! Please check your email to verify if required.', { id });
      navigate('/dashboard/customer');
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign up', { id });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
        <div className="mt-1 relative rounded-xl shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            {...register('fullName')}
            className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-black focus:border-black dark:focus:ring-white dark:focus:border-white bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white sm:text-sm transition-colors ${errors.fullName ? 'border-red-500' : 'border-gray-200 dark:border-gray-800'}`}
            placeholder="John Doe"
          />
        </div>
        {errors.fullName && <p className="mt-1 text-sm text-red-500">{errors.fullName.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email address</label>
        <div className="mt-1 relative rounded-xl shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="email"
            {...register('email')}
            className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-black focus:border-black dark:focus:ring-white dark:focus:border-white bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white sm:text-sm transition-colors ${errors.email ? 'border-red-500' : 'border-gray-200 dark:border-gray-800'}`}
            placeholder="you@example.com"
          />
        </div>
        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
          <div className="mt-1 relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              {...register('password')}
              className={`block w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-black focus:border-black dark:focus:ring-white dark:focus:border-white bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white sm:text-sm transition-colors ${errors.password ? 'border-red-500' : 'border-gray-200 dark:border-gray-800'}`}
              placeholder="••••••••"
            />
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
            <input
              type={showConfirmPassword ? "text" : "password"}
              {...register('confirmPassword')}
              className={`block w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-black focus:border-black dark:focus:ring-white dark:focus:border-white bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white sm:text-sm transition-colors ${errors.confirmPassword ? 'border-red-500' : 'border-gray-200 dark:border-gray-800'}`}
              placeholder="••••••••"
            />
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
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number (Optional)</label>
        <div className="mt-1 relative rounded-xl shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Phone className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="tel"
            {...register('phone')}
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-black focus:border-black dark:focus:ring-white dark:focus:border-white bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white sm:text-sm transition-colors"
            placeholder="+1 (555) 000-0000"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all active:scale-[0.98] mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : (
          <>
            Create Customer Account
            <ArrowRight className="ml-2 h-5 w-5" />
          </>
        )}
      </button>
    </form>
  );
}
