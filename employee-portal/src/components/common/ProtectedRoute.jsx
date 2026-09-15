import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * ProtectedRoute - Guards routes based on authentication and role
 */
export default function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-page">
        <div className="spinner spinner-lg"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to appropriate login page
    if (requiredRole === 'admin') {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/employee/login" replace />;
  }

  // Check role access
  if (requiredRole && userProfile?.role !== requiredRole) {
    if (userProfile?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/employee/dashboard" replace />;
  }

  // Check if user is active
  if (!userProfile?.is_active) {
    return <Navigate to="/employee/login" replace />;
  }

  return children;
}
