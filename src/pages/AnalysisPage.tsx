import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import Header from '../components/Common/Header';
import Footer from '../components/Common/Footer';
import AnalysisResult from '../components/Analysis/AnalysisResult';
import { Stock, AnalysisResult as AnalysisResultType } from '../types/stock';
import { AnalysisService } from '../services/analysisService';

export const AnalysisPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stock = location.state?.stock as Stock;

  const performAnalysis = async () => {
    if (!stock) {
      navigate('/');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // 投資スタイルが設定されていない場合はデフォルトを設定
      const stockWithStyle = {
        ...stock,
        investmentStyle: stock.investmentStyle || 'medium'
      };
      
      const result = await AnalysisService.analyzeStock(stockWithStyle);
      setAnalysisResult(result);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(
        err instanceof Error 
          ? `分析エラー: ${err.message}` 
          : '分析中にエラーが発生しました。時間をおいて再度お試しください。'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    performAnalysis();
  }, [stock, navigate]);

  const handleRetry = () => {
    performAnalysis();
  };

  if (!stock) {
    return null;
  }

  const formatPrice = (price: number, symbol: string) => {
    const isJapanese = /^\d{4}$/.test(symbol);
    const currency = isJapanese ? '¥' : '$';
    return `${currency}${price.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            ホームに戻る
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                分析結果
              </h1>
              <p className="text-gray-600">
                {stock.name} ({stock.symbol}) - {formatPrice(stock.price, stock.symbol)}
              </p>
            </div>
            
            {!isLoading && (
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                再分析
              </button>
            )}
          </div>
        </div>
        
        {isLoading ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              AI分析中...
            </h2>
            <p className="text-gray-600 mb-6">
              {stock.name} ({stock.symbol}) の包括的な分析を実行しています
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></div>
                <span>リアルタイム株価データを取得中</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse delay-100"></div>
                <span>ファンダメンタル指標を計算中</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse delay-200"></div>
                <span>テクニカル分析を実行中</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse delay-300"></div>
                <span>AI投資判断を生成中</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse delay-500"></div>
                <span>結果を統合中</span>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              分析エラー
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleRetry}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                再試行
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                ホームに戻る
              </button>
            </div>
          </div>
        ) : analysisResult ? (
          <AnalysisResult result={analysisResult} />
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-500">分析結果を取得できませんでした。</p>
            <button
              onClick={handleRetry}
              className="mt-4 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              再試行
            </button>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default AnalysisPage;