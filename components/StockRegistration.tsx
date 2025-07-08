import React, { useState } from 'react';
import { useSubscription } from '../hooks/useSubscription';
import { StarIcon, TrashIcon } from './icons';

const StockRegistration: React.FC = () => {
  const { registeredStocks, addRegisteredStock, getCurrentPlan } = useSubscription();
  const [newStock, setNewStock] = useState('');
  const currentPlan = getCurrentPlan();

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStock.trim()) return;
    
    await addRegisteredStock(newStock.trim().toUpperCase());
    setNewStock('');
  };

  const canAddMoreStocks = currentPlan.features.maxStocks === -1 || 
    registeredStocks.length < currentPlan.features.maxStocks;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-2xl">
      <div className="flex items-center mb-4">
        <StarIcon className="h-6 w-6 text-yellow-400" />
        <h3 className="text-xl font-bold ml-3 text-gray-200">登録銘柄</h3>
        <span className="ml-auto text-sm text-gray-400">
          {registeredStocks.length}/{currentPlan.features.maxStocks === -1 ? '無制限' : currentPlan.features.maxStocks}
        </span>
      </div>

      {canAddMoreStocks && (
        <form onSubmit={handleAddStock} className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newStock}
              onChange={(e) => setNewStock(e.target.value.toUpperCase())}
              placeholder="銘柄コードを入力 (例: AAPL, 7203)"
              className="flex-1 bg-gray-900/70 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
            <button
              type="submit"
              disabled={!newStock.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white rounded-lg transition-colors"
            >
              追加
            </button>
          </div>
        </form>
      )}

      {registeredStocks.length > 0 ? (
        <div className="space-y-2">
          {registeredStocks.map((stock, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-900/50 rounded-lg px-3 py-2">
              <span className="font-medium text-white">{stock}</span>
              <button
                onClick={() => {
                  console.log('Remove stock:', stock);
                }}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center py-4">登録された銘柄はありません</p>
      )}
    </div>
  );
};

export default StockRegistration;
