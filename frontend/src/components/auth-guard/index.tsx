import { Outlet, useNavigate } from 'react-router-dom';

interface AuthGuardProps {
  children?: React.ReactNode;
}
import supabase from '../../../supabase-config';
import { useEffect } from 'react';

const AuthGuard = ({ children }: AuthGuardProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!session?.user) {
          navigate('/login');
        } else {
          const path = window.location.pathname;
          if (path === '/login') {
            navigate('/');
          }
        }
      })
      .catch((error) => {
        console.error('Error fetching session:', error);
        navigate('/login');
      });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        navigate('/login');
      } else {
        const path = window.location.pathname;
        if (path === '/login') {
          navigate('/');
        }
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  return children ? children : <Outlet />;
};

export default AuthGuard;
