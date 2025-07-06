import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, Crown, ChevronDown, BarChart3, History } from 'lucide-react';
import authService, { User as UserType } from '../../services/authService';
import { analytics } from '../../utils/analytics';

interface UserMenuProps {
  user: UserType;
}

const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // メニュー外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      analytics.trackEvent('auth', 'logout_success');
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      analytics.trackEvent('auth', 'logout_error');
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'premium':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
            <Crown className="h-3 w-3" />
            Premium
          </span>
        );
      case 'pro':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
            <Crown className="h-3 w-3" />
            Pro
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
            Free
          </span>
        );
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* ユーザーアバター・ボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 bg-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {getInitials(user.name)}
            </div>
          )}
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <div className="flex items-center gap-2">
              {getPlanBadge(user.subscription?.plan || 'free')}
            </div>
          </div>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* ドロップダウンメニュー */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
          {/* ユーザー情報 */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {getInitials(user.name)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                <div className="mt-1">
                  {getPlanBadge(user.subscription?.plan || 'free')}
                </div>
              </div>
            </div>
          </div>

          {/* メニュー項目 */}
          <div className="py-1">
            <Link
              to="/dashboard"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              ダッシュボード
            </Link>
            
            <Link
              to="/history"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <History className="h-4 w-4" />
              分析履歴
            </Link>
            
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <User className="h-4 w-4" />
              プロフィール
            </Link>
            
            <Link
              to="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Settings className="h-4 w-4" />
              設定
            </Link>
          </div>

          {/* プレミアム機能 */}
          {user.subscription?.plan === 'free' && (
            <div className="border-t border-gray-100 py-1">
              <Link
                to="/upgrade"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
              >
                <Crown className="h-4 w-4" />
                プレミアムにアップグレード
              </Link>
            </div>
          )}

          {/* ログアウト */}
          <div className="border-t border-gray-100 py-1">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              ログアウト
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;