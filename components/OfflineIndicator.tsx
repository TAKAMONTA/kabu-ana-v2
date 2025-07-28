import React from 'react';
import { useOfflineStatus } from '../hooks/useOfflineStatus';
import { WifiIcon, ExclamationTriangleIcon } from './icons';

const OfflineIndicator: React.FC = () => {
  const { isOnline, isOffline, wasOffline } = useOfflineStatus();

  if (isOnline && !wasOffline) {
    return null; // Don't show anything when online and never was offline
  }

  return (
    <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
      isOffline ? 'translate-y-0' : 'translate-y-[-100px]'
    }`}>
      <div className={`rounded-lg px-4 py-2 shadow-lg flex items-center space-x-2 ${
        isOffline 
          ? 'bg-red-600 text-white' 
          : 'bg-green-600 text-white'
      }`}>
        {isOffline ? (
          <>
            <ExclamationTriangleIcon className="h-5 w-5" />
            <span className="text-sm font-medium">オフライン - キャッシュデータを表示中</span>
          </>
        ) : (
          <>
            <WifiIcon className="h-5 w-5" />
            <span className="text-sm font-medium">オンラインに復帰しました</span>
          </>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;
