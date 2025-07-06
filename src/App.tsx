import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AnalysisPage from './pages/AnalysisPage';
import LoginPage from './pages/LoginPage';
import ErrorBoundary from './components/Common/ErrorBoundary';
import ProtectedRoute from './components/Common/ProtectedRoute';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          <Route path="/analysis" element={
            <ProtectedRoute>
              <AnalysisPage />
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">分析履歴</h1>
                  <p className="text-gray-600">準備中です。近日公開予定！</p>
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">設定</h1>
                  <p className="text-gray-600">準備中です。近日公開予定！</p>
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">ダッシュボード</h1>
                  <p className="text-gray-600">準備中です。近日公開予定！</p>
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">プロフィール</h1>
                  <p className="text-gray-600">準備中です。近日公開予定！</p>
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/upgrade" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">プレミアムプラン</h1>
                  <p className="text-gray-600">準備中です。近日公開予定！</p>
                </div>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/about" element={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">サービスについて</h1>
                <p className="text-gray-600">準備中です。近日公開予定！</p>
              </div>
            </div>
          } />
          <Route path="/privacy" element={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">プライバシーポリシー</h1>
                <p className="text-gray-600">準備中です。近日公開予定！</p>
              </div>
            </div>
          } />
          <Route path="/terms" element={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">利用規約</h1>
                <p className="text-gray-600">準備中です。近日公開予定！</p>
              </div>
            </div>
          } />
          <Route path="/contact" element={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">お問い合わせ</h1>
                <p className="text-gray-600">準備中です。近日公開予定！</p>
              </div>
            </div>
          } />
          <Route path="/help" element={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">ヘルプ</h1>
                <p className="text-gray-600">準備中です。近日公開予定！</p>
              </div>
            </div>
          } />
          <Route path="/faq" element={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">よくある質問</h1>
                <p className="text-gray-600">準備中です。近日公開予定！</p>
              </div>
            </div>
          } />
          {/* 404 Not Found */}
          <Route path="*" element={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-gray-600 mb-6">お探しのページが見つかりません</p>
                <a 
                  href="/" 
                  className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  ホームに戻る
                </a>
              </div>
            </div>
          } />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;