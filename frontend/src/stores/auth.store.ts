import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: 'admin' | 'cajero' | 'vendedor';
  branch_id: string | null;
  is_active: boolean;
  theme: 'light' | 'dark';
}

interface AuthStore {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setIsLoading: (isLoading) => set({ isLoading }),
  clear: () => set({ user: null, profile: null, isLoading: false }),
}));