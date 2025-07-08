
import React, { useState, useCallback } from 'react';
import { InvestmentStyle } from '../types';
import { UploadIcon } from './icons';
import LoadingSpinner from './LoadingSpinner';

interface InputFormProps {
  isLoading: boolean;
  canAskQuestions: boolean;
  onSubmit: (ticker: string, style: InvestmentStyle, imageBase64: string | null, question: string) => void;
}

const InputForm: React.FC<InputFormProps> = ({ isLoading, canAskQuestions, onSubmit }) => {
  const [ticker, setTicker] = useState<string>('');
  const [investmentStyle, setInvestmentStyle] = useState<InvestmentStyle>(InvestmentStyle.MID);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [question, setQuestion] = useState<string>('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker.trim()) {
      alert('銘柄名／コードを入力してください。');
      return;
    }

    if (imageFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        onSubmit(ticker.trim(), investmentStyle, base64String, question.trim());
      };
      reader.readAsDataURL(imageFile);
    } else {
      onSubmit(ticker.trim(), investmentStyle, null, question.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 md:p-8 space-y-6 border border-gray-700 shadow-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="ticker" className="block text-sm font-medium text-gray-300 mb-2">銘柄名／コード</label>
          <input
            type="text"
            id="ticker"
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            className="w-full bg-gray-900/70 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="例: AAPL, 7203 (トヨタ)"
            required
          />
        </div>
        <div>
          <label htmlFor="investment-style" className="block text-sm font-medium text-gray-300 mb-2">投資スタイル</label>
          <select
            id="investment-style"
            value={investmentStyle}
            onChange={(e) => setInvestmentStyle(e.target.value as InvestmentStyle)}
            className="w-full bg-gray-900/70 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          >
            {Object.values(InvestmentStyle).map(style => (
              <option key={style} value={style}>{style}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">チャート画像 (推奨)</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            {imagePreview ? (
              <img src={imagePreview} alt="チャートプレビュー" className="mx-auto h-24 w-auto rounded-md object-contain" />
            ) : (
              <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
            )}
            <div className="flex text-sm text-gray-400">
              <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-blue-400 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-blue-500 px-1">
                <span>ファイルをアップロード</span>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/png, image/jpeg" />
              </label>
              <p className="pl-1">またはドラッグ＆ドロップ</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG</p>
          </div>
        </div>
      </div>

      {canAskQuestions && (
        <div>
          <label htmlFor="question" className="block text-sm font-medium text-gray-300 mb-2">質問 (任意)</label>
          <textarea
            id="question"
            rows={2}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full bg-gray-900/70 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="例: このチャートは逆三尊ですか？"
          />
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-300"
        >
          {isLoading ? (
            <div className="flex items-center">
              <LoadingSpinner size="sm" className="mr-3" />
              分析中...
            </div>
          ) : '分析を開始'}
        </button>
      </div>
    </form>
  );
};

export default InputForm;
