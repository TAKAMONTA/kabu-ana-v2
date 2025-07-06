import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, TrendingUp, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import authService from '../services/authService';
import { analytics } from '../utils/analytics';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    acceptTerms: false
  });

  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // エラーをクリア
    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.email || !formData.password) {
      setError('メールアドレスとパスワードを入力してください');
      return false;
    }

    if (!isLogin) {
      if (!formData.name) {
        setError('お名前を入力してください');
        return false;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('パスワードが一致しません');
        return false;
      }
      
      if (formData.password.length < 8) {
        setError('パスワードは8文字以上で入力してください');
        return false;
      }
      
      if (!formData.acceptTerms) {
        setError('利用規約に同意してください');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // ログイン処理
        const result = await authService.login(formData.email, formData.password);
        analytics.trackEvent('auth', 'login_success', formData.email);
        
        setSuccess('ログインしました');
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        // サインアップ処理
        const result = await authService.signup({
          email: formData.email,
          password: formData.password,
          name: formData.name
        });
        analytics.trackEvent('auth', 'signup_success', formData.email);
        
        setSuccess('アカウントを作成しました。ログインしてください。');
        setTimeout(() => {
          setIsLogin(true);
          setFormData(prev => ({ ...prev, password: '', confirmPassword: '', name: '' }));
        }, 2000);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'エラーが発生しました';
      setError(errorMessage);
      analytics.trackEvent('auth', isLogin ? 'login_error' : 'signup_error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await authService.loginWithGoogle();
      analytics.trackEvent('auth', 'google_login_success');
      navigate('/');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Googleログインに失敗しました';
      setError(errorMessage);
      analytics.trackEvent('auth', 'google_login_error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* ヘッダー */}
        <div className="text-center">
          <div className="flex justify-center items-center mb-6">
            <div className="bg-emerald-600 p-3 rounded-full">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            株穴
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            AI株式分析プラットフォーム
          </p>
          <h3 className="text-xl font-semibold text-gray-800">
            {isLogin ? 'ログイン' : 'アカウント作成'}
          </h3>
          <p className="text-sm text-gray-600 mt-2">
            {isLogin 
              ? 'アカウントにログインして分析を開始' 
              : '無料でアカウントを作成して分析を開始'
            }
          </p>
        </div>

        {/* メインフォーム */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* エラー・成功メッセージ */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-emerald-600">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 名前フィールド（サインアップ時のみ） */}
            {!isLogin && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  お名前
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="山田太郎"
                  />
                </div>
              </div>
            )}

            {/* メールアドレス */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                メールアドレス
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="example@email.com"
                />
              </div>
            </div>

            {/* パスワード */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                パスワード
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder={isLogin ? "パスワードを入力" : "8文字以上のパスワード"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* パスワード確認（サインアップ時のみ） */}
            {!isLogin && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  パスワード確認
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="パスワードを再入力"
                  />
                </div>
              </div>
            )}

            {/* 利用規約同意（サインアップ時のみ） */}
            {!isLogin && (
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="acceptTerms"
                    name="acceptTerms"
                    type="checkbox"
                    checked={formData.acceptTerms}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="acceptTerms" className="text-gray-700">
                    <Link to="/terms" className="text-emerald-600 hover:text-emerald-500">
                      利用規約
                    </Link>
                    および
                    <Link to="/privacy" className="text-emerald-600 hover:text-emerald-500">
                      プライバシーポリシー
                    </Link>
                    に同意します
                  </label>
                </div>
              </div>
            )}

            {/* ログインボタン */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {isLogin ? 'ログイン中...' : 'アカウント作成中...'}
                </div>
              ) : (
                isLogin ? 'ログイン' : 'アカウント作成'
              )}
            </button>

            {/* 区切り線 */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">または</span>
              </div>
            </div>

            {/* Googleログイン */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-3 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Googleでログイン
            </button>
          </form>

          {/* フォーム切り替え */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isLogin ? 'アカウントをお持ちでない方は' : '既にアカウントをお持ちの方は'}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                  setSuccess(null);
                  setFormData({
                    email: '',
                    password: '',
                    confirmPassword: '',
                    name: '',
                    acceptTerms: false
                  });
                }}
                className="ml-1 text-emerald-600 hover:text-emerald-500 font-medium"
              >
                {isLogin ? 'アカウント作成' : 'ログイン'}
              </button>
            </p>
          </div>
        </div>

        {/* セキュリティ情報 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-6 w-6 text-emerald-600" />
            <h3 className="text-lg font-semibold text-gray-900">安全・安心</h3>
          </div>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>SSL暗号化通信でデータを保護</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>個人情報は厳重に管理・保護</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>投資情報の提供のみ、勧誘は一切なし</span>
            </div>
          </div>
        </div>

        {/* フッターリンク */}
        <div className="text-center text-sm text-gray-500">
          <Link to="/" className="hover:text-emerald-600 transition-colors">
            ホームに戻る
          </Link>
          <span className="mx-2">•</span>
          <Link to="/help" className="hover:text-emerald-600 transition-colors">
            ヘルプ
          </Link>
          <span className="mx-2">•</span>
          <Link to="/contact" className="hover:text-emerald-600 transition-colors">
            お問い合わせ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;