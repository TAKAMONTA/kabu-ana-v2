import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TrendingUp, Home, BarChart, Image } from 'lucide-react';
import authService from '../../services/authService';
import UserMenu from './UserMenu';

const Header: React.FC = () => {
  const location = useLocation();
  const user = authService.getCurrentUser();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-emerald-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">株穴</span>
            <span className="ml-2 text-sm text-gray-500">AI株式分析</span>
          </div>
          
          <nav className="flex space-x-8">
            <Link
              to="/"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/') 
                  ? 'text-emerald-600 bg-emerald-50' 
                  : 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              <Home className="h-4 w-4 mr-2" />
              ホーム
            </Link>
            <Link
              to="/"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/chart') 
                  ? 'text-emerald-600 bg-emerald-50' 
                  : 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              <Image className="h-4 w-4 mr-2" />
              チャート分析
            </Link>
            <Link
              to="/analysis"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/analysis') 
                  ? 'text-emerald-600 bg-emerald-50' 
                  : 'text-gray-700 hover:text-emerald-600 hover:bg-emerald-50'
              }`}
            >
              <BarChart className="h-4 w-4 mr-2" />
              分析結果
            </Link>
          </nav>
          
          {/* ユーザーメニュー */}
          <div className="flex items-center">
            {user ? (
              <UserMenu user={user} />
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                ログイン
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;