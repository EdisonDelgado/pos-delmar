import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '@/hooks/useAppSelector';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  console.log('🔒 ProtectedRoute - isAuthenticated:', isAuthenticated, 'user:', user?.email);

  if (!isAuthenticated) {
    console.log('❌ No autenticado, redirigiendo a /login');
    return <Navigate to="/login" replace />;
  }

  // Check roles if required
  if (requiredRoles && requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.some((role) => user.roles?.includes(role));
    if (!hasRequiredRole) {
      console.log('❌ Usuario no tiene roles requeridos:', requiredRoles);
      return <Navigate to="/unauthorized" replace />;
    }
    console.log('✅ Usuario tiene roles requeridos');
  }

  console.log('✅ Acceso permitido a ruta protegida');
  return <>{children}</>;
}
