import { Outlet, useNavigate } from 'react-router-dom';
import supabase from '../../../supabase-config';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useThemeStore } from '@/stores/theme.store';

interface AuthGuardProps {
  children?: React.ReactNode;
}

export const authListenerControl = { paused: false };

const AuthGuard = ({ children }: AuthGuardProps) => {
  const navigate = useNavigate();
  const { setUser, setProfile, setIsLoading, clear, isLoading } = useAuthStore();
  const { setTheme } = useThemeStore();

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        if (!session?.user) {
          clear();
          navigate('/login');
        } else {
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

          if (window.location.pathname === '/login') navigate('/ventas');
        }
        setIsLoading(false);
      })
      .catch(() => {
        clear();
        navigate('/login');
        setIsLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (authListenerControl.paused) return;

      if (event === 'SIGNED_OUT' || !session?.user) {
        clear();
        navigate('/login');
        return;
      }

      if (session?.user) {
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

        if (event === 'SIGNED_IN' && window.location.pathname === '/login') {
          navigate('/ventas');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) return null;
  return children ? children : <Outlet />;
};

export default AuthGuard;
