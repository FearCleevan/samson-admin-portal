import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function ProtectedRoute({ children, superAdminOnly = false }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/" replace />;
  if (superAdminOnly && user?.role !== 'super_admin') return <Navigate to="/dashboard" replace />;

  return children;
}