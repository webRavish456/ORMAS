import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAdmin } = useTheme();
  
  if (!isAdmin) {
    return <Navigate to="/administrator" replace />;
  }
  
  return <>{children}</>;
};
