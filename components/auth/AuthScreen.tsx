import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import { ChartBarIcon } from '../icons';

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gray-900 bg-gradient-to-br from-gray-900 to-gray-800 text-white font-sans flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center bg-blue-600/20 p-4 rounded-full mb-4 border border-blue-500/30">
            <ChartBarIcon className="h-10 w-10 text-blue-400" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
            AI株式アナリスト
          </h1>
          <p className="mt-2 text-gray-400">
            {isLogin ? 'アカウントにログインしてください' : '新しいアカウントを作成してください'}
          </p>
        </div>
        
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-gray-700 shadow-2xl">
          {isLogin ? (
            <LoginForm onToggleMode={() => setIsLogin(false)} />
          ) : (
            <SignupForm onToggleMode={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
