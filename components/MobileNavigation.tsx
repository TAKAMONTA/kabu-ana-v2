import React, { useState } from 'react';
import { ChartBarIcon, HistoryIcon, CreditCardIcon } from './icons';

interface MobileNavigationProps {
  onAnalyzeClick: () => void;
  onHistoryClick: () => void;
  onSubscriptionClick: () => void;
  currentView?: 'analyze' | 'history' | 'subscription';
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  onAnalyzeClick,
  onHistoryClick,
  onSubscriptionClick,
  currentView = 'analyze'
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavClick = (action: () => void, view: string) => {
    action();
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <header className="md:hidden bg-gray-800/90 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-2">
            <ChartBarIcon className="h-8 w-8 text-blue-400" />
            <h1 className="text-xl font-bold text-white">株分析AI</h1>
          </div>
          
          {/* Hamburger Menu Button */}
          <button
            onClick={toggleMenu}
            className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            aria-label="メニューを開く"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="border-t border-gray-700 bg-gray-800">
            <nav className="px-4 py-2 space-y-1">
              <button
                onClick={() => handleNavClick(onAnalyzeClick, 'analyze')}
                className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'analyze'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <ChartBarIcon className="h-5 w-5 mr-3" />
                株式分析
              </button>
              
              <button
                onClick={() => handleNavClick(onHistoryClick, 'history')}
                className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'history'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <HistoryIcon className="h-5 w-5 mr-3" />
                分析履歴
              </button>
              
              <button
                onClick={() => handleNavClick(onSubscriptionClick, 'subscription')}
                className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'subscription'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <CreditCardIcon className="h-5 w-5 mr-3" />
                サブスクリプション
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Bottom Navigation Bar (Alternative mobile navigation) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800/95 backdrop-blur-sm border-t border-gray-700 z-40">
        <div className="flex items-center justify-around py-2">
          <button
            onClick={onAnalyzeClick}
            className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors ${
              currentView === 'analyze'
                ? 'text-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
            aria-label="株式分析"
          >
            <ChartBarIcon className="h-6 w-6 mb-1" />
            <span className="text-xs font-medium">分析</span>
          </button>
          
          <button
            onClick={onHistoryClick}
            className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors ${
              currentView === 'history'
                ? 'text-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
            aria-label="分析履歴"
          >
            <HistoryIcon className="h-6 w-6 mb-1" />
            <span className="text-xs font-medium">履歴</span>
          </button>
          
          <button
            onClick={onSubscriptionClick}
            className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors ${
              currentView === 'subscription'
                ? 'text-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
            aria-label="サブスクリプション"
          >
            <CreditCardIcon className="h-6 w-6 mb-1" />
            <span className="text-xs font-medium">プラン</span>
          </button>
        </div>
      </nav>

      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-30 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
};

export default MobileNavigation;
