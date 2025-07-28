import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Common/Header';
import Footer from '../components/Common/Footer';
import StockSearch from '../components/Dashboard/StockSearch';
import StockList from '../components/Dashboard/StockList';
import ChartImageUpload from '../components/Analysis/ChartImageUpload';
import ChartAnalysisResult from '../components/Analysis/ChartAnalysisResult';
import { Stock } from '../types/stock';

const HomePage: React.FC = () => {
  const [registeredStocks, setRegisteredStocks] = useState<Stock[]>([]);
  const [chartAnalysisResult, setChartAnalysisResult] = useState<any>(null);
  const [showChartAnalysis, setShowChartAnalysis] = useState(false);
  const navigate = useNavigate();

  const handleStockSelect = (stock: Stock) => {
    // 既に登録済みでない場合のみ追加
    if (!registeredStocks.find(s => s.symbol === stock.symbol)) {
      setRegisteredStocks(prev => [...prev, stock]);
    }
    
    // 分析ページに遷移
    navigate('/analysis', { state: { stock } });
  };

  const handleAnalyze = (stock: Stock) => {
    navigate('/analysis', { state: { stock } });
  };

  const handleImageAnalysis = (analysis: any) => {
    setChartAnalysisResult(analysis);
    setShowChartAnalysis(true);
  };

  const handleNewAnalysis = () => {
    setChartAnalysisResult(null);
    setShowChartAnalysis(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            株式分析プラットフォーム
          </h1>
          <p className="text-gray-600">
            銘柄を検索して、AIによる高度な分析を開始しましょう
          </p>
        </div>
        
        {showChartAnalysis && chartAnalysisResult ? (
          <ChartAnalysisResult 
            result={chartAnalysisResult} 
            onNewAnalysis={handleNewAnalysis}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <StockSearch onStockSelect={handleStockSelect} />
              <ChartImageUpload onImageAnalysis={handleImageAnalysis} />
            </div>
            
            <div className="lg:col-span-1">
              <StockList stocks={registeredStocks} onAnalyze={handleAnalyze} />
            </div>
          </div>
        )}
        
        {showChartAnalysis && (
          <div className="mt-8 text-center">
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default HomePage;