import React, { useState, useCallback, useEffect, useRef } from 'react';
import InputForm from './components/InputForm';
import AnalysisDisplay from './components/AnalysisDisplay';
import AuthScreen from './components/auth/AuthScreen';
import { useAuth } from './contexts/AuthContext';
import { analyzeStockStream } from './services/geminiService';
import type { AnalysisResponse, InvestmentStyle, GroundingSource, AnalysisHistoryItem, AnalysisStreamChunk } from './types';
import { ChartBarIcon, HistoryIcon, StopCircleIcon } from './components/icons';

const App: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('stockAnalysisHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.error("Could not load history from localStorage", e);
    }
  }, []);

  useEffect(() => {
    try {
        localStorage.setItem('stockAnalysisHistory', JSON.stringify(history));
    } catch (e) {
        console.error("Could not save history to localStorage", e);
    }
  }, [history]);

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      setError("分析がキャンセルされました。");
    }
  };

  const handleAnalyze = useCallback(async (ticker: string, style: InvestmentStyle, imageBase64: string | null, question: string) => {
    if (isLoading) return;

    setIsLoading(true);
    setError(null);
    setAnalysisResult({}); // Reset to an empty object for streaming
    setSources([]);
    abortControllerRef.current = new AbortController();

    const fullAnalysisResponse: AnalysisResponse = {};
    const finalSources: GroundingSource[] = [];

    try {
      const stream = analyzeStockStream(ticker, style, imageBase64, question, abortControllerRef.current.signal);

      for await (const chunk of stream) {
          if (chunk.type !== 'sources') {
            const key = chunk.type as keyof Omit<AnalysisStreamChunk, 'type'>;
            // @ts-ignore
            fullAnalysisResponse[key] = chunk.data;
             setAnalysisResult(prev => ({ ...prev, [key]: chunk.data }));
          } else {
             finalSources.push(...chunk.data);
             setSources(prev => [...prev, ...chunk.data]);
          }
      }

      // Check if analysis was cancelled or produced no result
       if (Object.keys(fullAnalysisResponse).length > 0) {
            const newHistoryItem: AnalysisHistoryItem = {
                id: new Date().toISOString() + ticker,
                ticker: ticker,
                style: style,
                timestamp: new Date().toLocaleString('ja-JP'),
                analysis: fullAnalysisResponse,
                sources: finalSources,
            };
            setHistory(prevHistory => [newHistoryItem, ...prevHistory.slice(0, 9)]);
       } else if (!abortControllerRef.current.signal.aborted) {
           setError("AIから有効な応答が得られませんでした。");
       }

    } catch (e: any) {
       if (e.name !== 'AbortError') {
         setError(e.message || "不明なエラーが発生しました。");
       }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [isLoading]);

  const handleSelectHistory = useCallback((item: AnalysisHistoryItem) => {
    setAnalysisResult(item.analysis);
    setSources(item.sources);
    setError(null);
    setIsLoading(false);
    if(abortControllerRef.current) {
        abortControllerRef.current.abort();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white">読み込み中...</div>
    </div>;
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-900 bg-gradient-to-br from-gray-900 to-gray-800 text-white font-sans">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="text-center mb-12">
            <div className="inline-flex items-center justify-center bg-blue-600/20 p-4 rounded-full mb-4 border border-blue-500/30">
                 <ChartBarIcon className="h-10 w-10 text-blue-400" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
            AI株式アナリスト【株穴】
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">
            銘柄を入力して、AIによるテクニカル＆ファンダメンタル分析を瞬時に取得します。
          </p>
          <div className="mt-4">
            <button
              onClick={() => logout()}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              ログアウト
            </button>
          </div>
        </header>

        <div className="max-w-4xl mx-auto">
          <InputForm isLoading={isLoading} onSubmit={handleAnalyze} />
          
          {error && (
            <div className="mt-8 bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-center animate-fade-in-up" role="alert">
              <p className="font-bold">エラー</p>
              <p>{error}</p>
            </div>
          )}

          {(isLoading || (analysisResult && Object.keys(analysisResult).length > 0)) && !error && (
            <div className="mt-10">
                {isLoading && (
                    <div className="flex justify-end mb-4">
                        <button 
                            onClick={handleCancel}
                            className="flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500"
                        >
                            <StopCircleIcon className="h-5 w-5 mr-2" />
                            分析をキャンセル
                        </button>
                    </div>
                )}
              <AnalysisDisplay data={analysisResult || {}} sources={sources} />
            </div>
          )}
        </div>

        {history.length > 0 && (
            <div className="mt-16 max-w-4xl mx-auto animate-fade-in-up">
                <div className="flex items-center mb-4">
                    <HistoryIcon className="h-7 w-7 text-gray-400"/>
                    <h2 className="text-2xl font-bold text-gray-300 ml-3">分析履歴</h2>
                </div>
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-gray-700 space-y-3 shadow-2xl">
                    {history.map(item => (
                        <button
                            key={item.id}
                            onClick={() => handleSelectHistory(item)}
                            className="w-full text-left p-4 bg-gray-900/70 rounded-lg hover:bg-gray-700/80 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
                        >
                            <div className="flex flex-wrap justify-between items-center gap-2">
                                <div className="flex items-center">
                                    <span className="font-bold text-lg text-white">{item.ticker}</span>
                                    <span className="ml-4 text-sm bg-blue-900/50 text-blue-300 px-2 py-1 rounded">{item.style}</span>
                                </div>
                                <span className="text-xs text-gray-500">{item.timestamp}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        )}
      </main>
       <footer className="text-center py-6 text-gray-500 text-sm">
        <p>これはAIによって生成された分析であり、投資助言ではありません。ご自身の判断で投資を行ってください。</p>
        <p>&copy; 2024 AI株式アナリスト【株穴】. Powered by Google Gemini.</p>
      </footer>
    </div>
  );
};

export default App;
