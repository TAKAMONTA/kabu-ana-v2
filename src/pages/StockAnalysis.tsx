import React, { useState } from 'react';
import InputForm from '../../components/InputForm';
import AnalysisDisplay from '../../components/AnalysisDisplay';
import AnalysisProgress from '../../components/AnalysisProgress';
import { InvestmentStyle, AnalysisResponse, GroundingSource } from '../../types';
import { useAuth } from '../contexts/AuthContext';

const StockAnalysis: React.FC = () => {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [analysisSteps, setAnalysisSteps] = useState([
    { id: 'fetch', label: '銘柄情報を取得中...', completed: false, current: false },
    { id: 'technical', label: 'テクニカル分析を実行中...', completed: false, current: false },
    { id: 'fundamental', label: 'ファンダメンタル分析を実行中...', completed: false, current: false },
    { id: 'overall', label: '総合判断を生成中...', completed: false, current: false }
  ]);
  const [progress, setProgress] = useState(0);

  const handleAnalyze = async (ticker: string, style: InvestmentStyle, image: string | null, question: string) => {
    setIsLoading(true);
    setAnalysisData(null);
    setSources([]);
    setProgress(0);
    
    // Reset steps
    setAnalysisSteps([
      { id: 'fetch', label: '銘柄情報を取得中...', completed: false, current: true },
      { id: 'technical', label: 'テクニカル分析を実行中...', completed: false, current: false },
      { id: 'fundamental', label: 'ファンダメンタル分析を実行中...', completed: false, current: false },
      { id: 'overall', label: '総合判断を生成中...', completed: false, current: false }
    ]);

    try {
      // Simulate analysis steps
      setTimeout(() => {
        setAnalysisSteps(prev => prev.map(step => 
          step.id === 'fetch' ? { ...step, completed: true, current: false } :
          step.id === 'technical' ? { ...step, current: true } :
          step
        ));
        setProgress(25);
      }, 1000);

      setTimeout(() => {
        setAnalysisSteps(prev => prev.map(step => 
          step.id === 'technical' ? { ...step, completed: true, current: false } :
          step.id === 'fundamental' ? { ...step, current: true } :
          step
        ));
        setProgress(50);
      }, 2000);

      setTimeout(() => {
        setAnalysisSteps(prev => prev.map(step => 
          step.id === 'fundamental' ? { ...step, completed: true, current: false } :
          step.id === 'overall' ? { ...step, current: true } :
          step
        ));
        setProgress(75);
      }, 3000);

      // TODO: Replace with actual API call
      const response = await fetch('http://localhost:3001/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.uid}` // Firebase auth token
        },
        body: JSON.stringify({
          ticker,
          investmentStyle: style,
          image,
          question
        })
      });

      if (!response.ok) {
        throw new Error('分析に失敗しました');
      }

      const data = await response.json();
      
      // Complete all steps
      setAnalysisSteps(prev => prev.map(step => ({ ...step, completed: true, current: false })));
      setProgress(100);
      
      setAnalysisData(data.analysis);
      setSources(data.sources || []);
    } catch (error) {
      console.error('Analysis error:', error);
      alert('分析中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionAnalysis = async (question: string) => {
    if (!analysisData) return;
    
    // TODO: Implement follow-up question functionality
    console.log('Follow-up question:', question);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            AI株式アナリスト【株穴】
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">{user?.email}</span>
            <button
              onClick={logout}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              ログアウト
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto">
          {/* Input Form */}
          <div className="mb-8">
            <InputForm
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              canAskQuestions={true}
            />
          </div>

          {/* Analysis Progress */}
          {isLoading && (
            <AnalysisProgress
              steps={analysisSteps}
              progress={progress}
            />
          )}

          {/* Analysis Results */}
          {analysisData && !isLoading && (
            <AnalysisDisplay
              data={analysisData}
              sources={sources}
              canQuestionAnalysis={true}
              onQuestionAnalysis={handleQuestionAnalysis}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default StockAnalysis;