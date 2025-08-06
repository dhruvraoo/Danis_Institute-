import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredUserType?: 'student' | 'faculty' | 'principal' | 'admin' | string[] | string;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredUserType,
  redirectTo = '/login' 
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check if user type matches requirement
  if (requiredUserType) {
    const allowedTypes = Array.isArray(requiredUserType) ? requiredUserType : [requiredUserType];
    
    if (!allowedTypes.includes(user.user_type)) {
      // Redirect to appropriate dashboard based on user type
      const dashboardMap: Record<string, string> = {
        student: '/student-dashboard',
        faculty: '/teacher-dashboard',
        principal: '/principal-dashboard',
        admin: '/dashboard/admin',
      };
      
      return <Navigate to={dashboardMap[user.user_type] || '/'} replace />;
    }
  }

  // User is authenticated and has correct permissions
  return <>{children}</>;
};

export default ProtectedRoute;