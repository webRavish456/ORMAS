import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiresAdmin?: boolean;
  requiresDataAccess?: boolean;
}

export const ProtectedRoute = ({ 
  children, 
  requiresAdmin = false, 
  requiresDataAccess = false 
}: ProtectedRouteProps) => {
  const { isAdmin, isDataUser } = useTheme();
  
  // Admin-only routes
  if (requiresAdmin && !isAdmin) {
    return <Navigate to="/administrator" replace />;
  }
  
  // Data access routes (admin or data user)
  if (requiresDataAccess && !isAdmin && !isDataUser) {
    return <Navigate to="/data" replace />;
  }
  
  return <>{children}</>;
};
