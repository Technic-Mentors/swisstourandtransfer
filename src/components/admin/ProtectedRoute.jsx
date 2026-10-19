import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../ui';
import AdminLayout from './AdminLayout';

/**
 * Guards the deeper admin routes.
 *
 * Unauthenticated visitors are sent to /admin, which renders the login
 * screen - there is no separate /admin/login URL to get stranded on.
 */
export default function ProtectedRoute({ children, counts }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--admin-bg)' }}>
        <Spinner label="Checking your session" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/admin" replace />;

  return <AdminLayout counts={counts}>{children}</AdminLayout>;
}
