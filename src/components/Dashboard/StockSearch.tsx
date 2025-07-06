import React, { useState } from 'react';
import { Search, Plus, Loader2, AlertCircle, TrendingUp, TrendingDown, ExternalLink, X, Clock, Calendar, CalendarDays } from 'lucide-react';
import { Stock } from '../../types/stock';
import { StockService } from '../../services/stockService';

interface StockSearchProps {
  onStockSelect: (stock: Stock) => void;
}

export const StockSearch: React.FC<StockSearchProps> = ({ onStockSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGoogleSearch, setShowGoogleSearch] = useState(false);
  const [googleSearchQuery, setGoogleSearchQuery] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<'short' | 'medium' | 'long'>('medium');

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    setShowResults(true);
    setError(null);
    
    try {
      const results = await StockService.searchStocks(searchTerm);
      setSearchResults(results);
      if (results.length === 0) {
        setError('検索結果が見つかりませんでした。別のキーワードをお試しください。');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '検索中にエラーが発生しました');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleGoogleSearch = () => {
    if (!searchTerm.trim()) return;
    
    // 日本株・米国株を判定して適切な検索クエリを生成
    const isJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(searchTerm) || /^\d{4}$/.test(searchTerm);
    
    let query = '';
    if (isJapanese) {
      query = `"${searchTerm}" 株価 銘柄コード 証券コード site:yahoo.co.jp OR site:kabutan.jp OR site:minkabu.jp`;
    } else {
      query = `"${searchTerm}" stock price ticker symbol site:yahoo.com OR site:marketwatch.com OR site:finance.yahoo.com`;
    }
    
    setGoogleSearchQuery(query);
    setShowGoogleSearch(true);
  };

  const closeGoogleSearch = () => {
    setShowGoogleSearch(false);
    setGoogleSearchQuery('');
  };

  const handleStockSelect = (stock: Stock) => {
    const stockWithStyle = { ...stock, investmentStyle: selectedStyle };
    onStockSelect(stockWithStyle);
    setSearchTerm('');
    setShowResults(false);
  };

  const formatPrice = (price: number, symbol: string) => {
    const isJapanese = /^\d{4}$/.test(symbol);
    const currency = isJapanese ? '¥' : '$';
    return `${currency}${price.toLocaleString()}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">銘柄検索</h2>
      
      {/* 投資スタイル選択 */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">投資スタイルを選択</h3>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setSelectedStyle('short')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedStyle === 'short'
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <Clock className="h-6 w-6" />
              <div className="text-center">
                <p className="font-semibold">短期投資</p>
                <p className="text-xs text-gray-600">数日〜数週間</p>
                <p className="text-xs text-gray-500">テクニカル重視</p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => setSelectedStyle('medium')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedStyle === 'medium'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <Calendar className="h-6 w-6" />
              <div className="text-center">
                <p className="font-semibold">中期投資</p>
                <p className="text-xs text-gray-600">数ヶ月〜1年</p>
                <p className="text-xs text-gray-500">バランス重視</p>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => setSelectedStyle('long')}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedStyle === 'long'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <CalendarDays className="h-6 w-6" />
              <div className="text-center">
                <p className="font-semibold">長期投資</p>
                <p className="text-xs text-gray-600">1年以上</p>
                <p className="text-xs text-gray-500">ファンダメンタル重視</p>
              </div>
            </div>
          </button>
        </div>
        
        {/* 選択されたスタイルの詳細説明 */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          {selectedStyle === 'short' && (
            <div className="text-sm">
              <h4 className="font-semibold text-red-700 mb-2">📈 短期投資スタイル</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• <strong>投資期間</strong>：数日〜数週間</li>
                <li>• <strong>分析重点</strong>：テクニカル分析・チャートパターン・出来高</li>
                <li>• <strong>判断基準</strong>：RSI・移動平均・ボリンジャーバンド</li>
                <li>• <strong>リスク</strong>：高ボラティリティ・短期変動に敏感</li>
              </ul>
            </div>
          )}
          
          {selectedStyle === 'medium' && (
            <div className="text-sm">
              <h4 className="font-semibold text-blue-700 mb-2">⚖️ 中期投資スタイル</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• <strong>投資期間</strong>：数ヶ月〜1年</li>
                <li>• <strong>分析重点</strong>：テクニカル・ファンダメンタルのバランス</li>
                <li>• <strong>判断基準</strong>：業績トレンド・株価トレンド・セクター動向</li>
                <li>• <strong>リスク</strong>：中程度・市場環境変化に対応</li>
              </ul>
            </div>
          )}
          
          {selectedStyle === 'long' && (
            <div className="text-sm">
              <h4 className="font-semibold text-emerald-700 mb-2">🌱 長期投資スタイル</h4>
              <ul className="space-y-1 text-gray-700">
                <li>• <strong>投資期間</strong>：1年以上</li>
                <li>• <strong>分析重点</strong>：ファンダメンタル分析・企業価値</li>
                <li>• <strong>判断基準</strong>：PER・ROE・成長性・配当・競争優位性</li>
                <li>• <strong>リスク</strong>：低〜中程度・長期的な企業価値重視</li>
              </ul>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            placeholder="銘柄名または証券コードを入力（例：7203、トヨタ、AAPL、Apple）"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={isSearching || !searchTerm.trim()}
          className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isSearching ? (
            <Loader2 className="animate-spin h-5 w-5" />
          ) : (
            <Search className="h-5 w-5" />
          )}
        </button>
        <button
          onClick={handleGoogleSearch}
          disabled={!searchTerm.trim()}
          className="px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          title="Google検索で銘柄情報を確認"
        >
          <ExternalLink className="h-5 w-5" />
        </button>
      </div>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">検索のヒント</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">🔍 検索方法</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>日本株</strong>：証券コード（7203）、会社名（トヨタ）</li>
              <li>• <strong>米国株</strong>：ティッカー（AAPL）、会社名（Apple）</li>
              <li>• <strong>部分一致</strong>：「ソニー」「Sony」「6758」</li>
              <li>• <strong>マイナー銘柄</strong>：Google検索で自動検出</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-900 mb-2">🌐 見つからない場合</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 右側の<ExternalLink className="h-4 w-4 inline mx-1" />ボタンでGoogle検索</li>
              <li>• 検索結果から正確な銘柄コードを確認</li>
              <li>• 銘柄コードを入力して再検索</li>
              <li>• 複数のキーワードで検索を試行</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
            <div className="text-sm text-green-800">
              <p className="font-semibold">Google Custom Search API統合済み</p>
              <p>マイナー銘柄や新規上場銘柄も自動的に検索・検出します。通常の検索で見つからない場合、Google検索結果から銘柄情報を自動抽出します。</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Google検索結果の埋め込み表示 */}
      {showGoogleSearch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-5/6 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <ExternalLink className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Google検索結果：「{searchTerm}」
                </h3>
              </div>
              <button
                onClick={closeGoogleSearch}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="flex-1 p-4">
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-semibold mb-1">検索結果の確認方法</p>
                    <ul className="space-y-1">
                      <li>• 企業名と銘柄コード（例：トヨタ自動車(7203)）を確認</li>
                      <li>• 正確な銘柄コードをメモして、上記の検索欄に入力</li>
                      <li>• 複数の情報源で銘柄コードを照合することを推奨</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="h-full border border-gray-300 rounded-lg overflow-hidden">
                <iframe
                  src={`https://www.google.com/search?igu=1&q=${encodeURIComponent(googleSearchQuery)}`}
                  className="w-full h-full"
                  title="Google検索結果"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                />
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  銘柄コードが見つかったら、上記の検索欄に入力して分析を開始してください
                </p>
                <button
                  onClick={closeGoogleSearch}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showResults && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            検索結果 ({searchResults.length}件)
          </h3>
          
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}
          
          {isSearching ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-4" />
              <p className="text-gray-500">検索中...</p>
            </div>
          ) : searchResults.length === 0 && !error ? (
            <p className="text-gray-500 text-center py-8">
              検索結果が見つかりませんでした。
            </p>
          ) : (
            <div className="space-y-3">
              {searchResults.map((stock) => (
                <div
                  key={stock.symbol}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{stock.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{stock.symbol}</span>
                          <span>•</span>
                          <span>{stock.sector}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatPrice(stock.price, stock.symbol)}
                        </p>
                        <div className={`flex items-center gap-1 text-sm ${stock.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {stock.change >= 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500">出来高</p>
                        <p className="font-semibold">{(stock.volume / 1000).toFixed(0)}K</p>
                      </div>
                      <div>
                        <p className="text-gray-500">PER</p>
                        <p className="font-semibold">{stock.pe > 0 ? stock.pe.toFixed(1) : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">配当利回り</p>
                        <p className="font-semibold">{stock.dividendYield.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-gray-500">時価総額</p>
                        <p className="font-semibold">
                          {stock.marketCap > 0 ? 
                            (stock.marketCap / (/^\d{4}$/.test(stock.symbol) ? 1000000000000 : 1000000000)).toFixed(1) + 
                            (/^\d{4}$/.test(stock.symbol) ? '兆円' : 'B') : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleStockSelect(stock)}
                    className={`ml-4 px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2 ${
                      selectedStyle === 'short' 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : selectedStyle === 'medium'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                    {selectedStyle === 'short' ? '短期分析' : selectedStyle === 'medium' ? '中期分析' : '長期分析'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StockSearch;