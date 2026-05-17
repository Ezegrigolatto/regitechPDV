import { Outlet, useNavigate } from 'react-router-dom';
import supabase from '../../../supabase-config';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useThemeStore } from '@/stores/theme.store';
import MainLoader from '@/components/main-loader';

interface AuthGuardProps {
  children?: React.ReactNode;
}

export const authListenerControl = { paused: false };

const AuthGuard = ({ children }: AuthGuardProps) => {
  const navigate = useNavigate();
  const { setUser, setProfile, setIsLoading, clear, isLoading } = useAuthStore();
  const { setTheme } = useThemeStore();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (authListenerControl.paused) return;

      if (!session?.user) {
        clear();
        navigate('/login');
        return;
      }

      try {
        setUser(session.user);

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setProfile(profile);
          if (profile.theme) setTheme(profile.theme);
        } else {
          setProfile(null);
        }

        if (
          (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') &&
          window.location.pathname === '/login'
        ) {
          navigate('/ventas');
        }
      } finally {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) return <MainLoader />;
  return children ? children : <Outlet />;
};

export default AuthGuard;
