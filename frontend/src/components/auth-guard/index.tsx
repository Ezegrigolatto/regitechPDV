import { Outlet } from 'react-router-dom';

interface AuthGuardProps {
  children?: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  return children ? children : <Outlet />;
};

export default AuthGuard;
