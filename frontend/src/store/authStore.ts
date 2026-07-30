import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useCartStore } from './cartStore';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  role: 'customer' | 'vendor' | 'admin';
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  dob?: string;
  gender?: string;
}

interface AuthState {
  user: (SupabaseUser & UserProfile) | null;
  isLoading: boolean;
  setUser: (user: (SupabaseUser & UserProfile) | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: async () => {
    set({ isLoading: true });
    await supabase.auth.signOut();
    useCartStore.getState().clearCart();
    localStorage.removeItem('guest_session');
    set({ user: null, isLoading: false });
  },
  checkSession: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Fetch profile to get the role
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        let userProfile = profile;

        if (!userProfile) {
          console.log('Profile not found, attempting auto-creation...');
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: session.user.id,
              email: session.user.email,
              full_name: session.user.user_metadata?.full_name || '',
              avatar_url: session.user.user_metadata?.avatar_url || ''
            })
            .select()
            .single();

          if (!insertError && newProfile) {
            userProfile = newProfile;
            console.log('Profile auto-created successfully');
          } else {
            console.error('Failed to auto-create profile:', insertError);
          }
        }

        if (userProfile) {
          // Compatibility layer for role vs roles (text vs text[])
          const role = userProfile.roles && userProfile.roles.length > 0 
            ? userProfile.roles[0] 
            : (userProfile.role || 'customer');
          set({ user: { ...session.user, ...userProfile, role } as any, isLoading: false });
          return;
        } else {
          // Fallback if trigger hasn't finished yet or profile missing
          console.warn('Profile fallback used');
          set({ 
            user: { ...session.user, role: 'customer', status: 'approved' } as any, 
            isLoading: false 
          });
          return;
        }
      }
      set({ user: null, isLoading: false });
    } catch (error) {
      console.error('Error checking session:', error);
      set({ user: null, isLoading: false });
    }
  },
  initializeAuth: () => {
    const { checkSession } = useAuthStore.getState();
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        checkSession();
      } else if (event === 'SIGNED_OUT') {
        useCartStore.getState().clearCart();
        localStorage.removeItem('guest_session');
        set({ user: null, isLoading: false });
      }
    });
  },
}));
