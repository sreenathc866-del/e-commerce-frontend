import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';
import { useNavigate, useSearchParams } from 'react-router-dom';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const checkSession = useAuthStore((state) => state.checkSession);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');

  const { register, handleSubmit, getValues, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    const id = toast.loading('Signing in...');

    try {
      const emailParts = data.email.split('@');
      const vendorEmail = `${emailParts[0]}+vendor@${emailParts[1]}`;

      const { error } = await supabase.auth.signInWithPassword({
        email: vendorEmail,
        password: data.password,
      });

      if (error) throw error;

      await checkSession();
      
      const sessionUser = useAuthStore.getState().user;
      
      if (sessionUser?.role === 'vendor' && (sessionUser as any).status === 'pending') {
        await supabase.auth.signOut();
        useAuthStore.getState().setUser(null);
        toast.error('Your account is under review.', { id });
        return;
      }

      toast.success('Successfully logged in!', { id });
      
      if (returnUrl) {
        navigate(returnUrl);
      } else {
        navigate(`/dashboard/${sessionUser?.role || 'customer'}`);
      }
      
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in', { id });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    const email = getValues('email');
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address first');
      return;
    }
    
    const id = toast.loading('Sending reset link...');
    try {
      const emailParts = email.split('@');
      const vendorEmail = `${emailParts[0]}+vendor@${emailParts[1]}`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(vendorEmail, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      
      if (error) throw error;
      toast.success('Password reset link sent to your email!', { id });
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset link', { id });
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
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

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
        <div className="mt-1 relative rounded-xl shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
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

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded" />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Remember me</label>
        </div>
        <div className="text-sm">
          <button 
            type="button" 
            onClick={handleResetPassword}
            className="font-medium text-black hover:text-gray-700 dark:text-white dark:hover:text-gray-300"
          >
            Forgot your password?
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-900 dark:bg-white dark:text-black dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : (
          <>
            Sign in
            <ArrowRight className="ml-2 h-5 w-5" />
          </>
        )}
      </button>
    </form>
  );
}
