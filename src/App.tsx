import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import StockAnalysis from './pages/StockAnalysis';
import Pricing from './pages/Pricing';
import PaymentSuccess from './pages/PaymentSuccess';

// プライベートルートコンポーネント
const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
};

// ログインページのラッパーコンポーネント
const LoginPage = () => {
  const navigate = useNavigate();
  return <Login onLoginSuccess={() => navigate('/')} />;
};

// サインアップページのラッパーコンポーネント
const SignupPage = () => {
  const navigate = useNavigate();
  return <Signup onSignupSuccess={() => navigate('/')} />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/" element={
            <PrivateRoute>
              <StockAnalysis />
            </PrivateRoute>
          } />
          <Route path="/pricing" element={
            <PrivateRoute>
              <Pricing />
            </PrivateRoute>
          } />
          <Route path="/payment-success" element={
            <PrivateRoute>
              <PaymentSuccess />
            </PrivateRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};