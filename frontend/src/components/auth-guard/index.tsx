import { Outlet, useNavigate } from 'react-router-dom';
import supabase from '../../../supabase-config';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';

interface AuthGuardProps {
  children?: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const navigate = useNavigate();
  const { setUser, setProfile, setIsLoading, clear, isLoading } = useAuthStore();

  useEffect(() => {
    // Verificar sesión inicial
    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        if (!session?.user) {
          clear();
          navigate('/login');
        } else {
          setUser(session.user);

          // Cargar perfil desde la tabla profiles
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          setProfile(profile ?? null);

          if (window.location.pathname === '/login') {
            navigate('/');
          }
        }
        setIsLoading(false);
      })
      .catch(() => {
        clear();
        navigate('/login');
        setIsLoading(false);
      });

    // Escuchar cambios de sesión
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
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

        setProfile(profile ?? null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) return null;

  return children ? children : <Outlet />;
};

export default AuthGuard;
