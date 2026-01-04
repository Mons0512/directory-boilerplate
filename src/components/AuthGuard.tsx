import { Navigate, Outlet } from 'react-router-dom';
import AuthUtils from '../utils/auth';

interface AuthGuardProps {
  children?: React.ReactNode;
}

/**
 * Protected route component for admin pages
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const isAuthenticated = AuthUtils.isAuthenticated();

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" replace />;
  }

  // Render children or outlet if using nested routes
  return children || <Outlet />;
}
