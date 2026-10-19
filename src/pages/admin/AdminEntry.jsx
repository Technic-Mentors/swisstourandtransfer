import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/admin/AdminLayout';
import { Spinner } from '../../components/ui';
import Login from './Login';
import Dashboard from './Dashboard';

/**
 * /admin is a single entry point that branches on auth state:
 * the login screen when signed out, the dashboard when signed in.
 * There is no separate login URL to bookmark or get stuck on.
 */
export default function AdminEntry() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--navy)' }}>
        <Spinner label="Checking your session" />
      </div>
    );
  }

  if (!isAuthenticated) return <Login />;

  return (
    <AdminLayout>
      <Dashboard />
    </AdminLayout>
  );
}
