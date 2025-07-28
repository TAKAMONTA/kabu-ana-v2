import React from 'react';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { Stock } from '../../types/stock';

interface StockListProps {
  stocks: Stock[];
  onAnalyze: (stock: Stock) => void;
}

export const StockList: React.FC<StockListProps> = ({ stocks, onAnalyze }) => {
  const formatPrice = (price: number, symbol: string) => {
    const isJapanese = /^\d{4}$/.test(symbol);
    const currency = isJapanese ? '¥' : '$';
    return `${currency}${price.toLocaleString()}`;
  };

  if (stocks.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">ウォッチリスト</h2>
        <div className="text-center py-12">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">まだ銘柄が登録されていません。</p>
          <p className="text-gray-500 text-sm mt-2">
            左側の検索機能を使って銘柄を検索・分析してください。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        ウォッチリスト ({stocks.length}件)
      </h2>
      
      <div className="space-y-4">
        {stocks.map((stock) => (
          <div
            key={stock.symbol}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{stock.name}</h3>
                    <p className="text-sm text-gray-500">{stock.symbol} • {stock.sector}</p>
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
                
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">出来高</p>
                    <p className="font-semibold">{(stock.volume / 1000).toFixed(0)}K</p>
                  </div>
                  <div>
                    <p className="text-gray-500">PER</p>
                    <p className="font-semibold">{stock.pe > 0 ? stock.pe.toFixed(1) : 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => onAnalyze(stock)}
                className="ml-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                分析
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StockList;