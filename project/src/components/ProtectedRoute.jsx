import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/authContexts';

const ProtectedRoute = () => {
  const { userlogin, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E7473C]"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!userlogin) {
    return <Navigate to="/" replace />;
  }

  // Render the protected content if authenticated
  return <Outlet />;
};

export default ProtectedRoute; 