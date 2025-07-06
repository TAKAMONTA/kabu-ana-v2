import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import authService from '../../services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requirePremium?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requirePremium = false }) => {
  const location = useLocation();
  const isAuthenticated = authService.isAuthenticated();
  const canUsePremium = authService.canUsePremiumFeatures();

  // 未認証の場合はログインページにリダイレクト
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // プレミアム機能が必要だが利用できない場合
  if (requirePremium && !canUsePremium) {
    return <Navigate to="/upgrade" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;