import React from 'react';
import { RatingScore } from '../types';

interface RatingStarsProps {
  score: RatingScore;
  label: string;
  description?: string;
}

const getDescriptionText = (score: RatingScore, category: string): string => {
  const descriptions: Record<string, Record<RatingScore, string>> = {
    // テクニカル分析の説明
    trend: {
      1: '強い下降トレンド',
      2: '弱い下降トレンド',
      3: 'トレンドなし・横ばい',
      4: '弱い上昇トレンド',
      5: '強い上昇トレンド'
    },
    momentum: {
      1: '非常に弱い',
      2: '弱い',
      3: '中程度',
      4: '強い',
      5: '非常に強い'
    },
    volatility: {
      1: '非常に低い',
      2: '低い',
      3: '中程度',
      4: '高い',
      5: '非常に高い'
    },
    support: {
      1: '非常に弱い',
      2: '弱い',
      3: '中程度',
      4: '強い',
      5: '非常に強い'
    },
    resistance: {
      1: '非常に弱い',
      2: '弱い',
      3: '中程度',
      4: '強い',
      5: '非常に強い'
    },
    // ファンダメンタル分析の説明
    profitability: {
      1: '非常に低い',
      2: '低い',
      3: '平均的',
      4: '高い',
      5: '非常に高い'
    },
    growth: {
      1: '非常に低い',
      2: '低い',
      3: '平均的',
      4: '高い',
      5: '非常に高い'
    },
    valuation: {
      1: '割高',
      2: 'やや割高',
      3: '適正',
      4: 'やや割安',
      5: '割安'
    },
    financial: {
      1: '非常に弱い',
      2: '弱い',
      3: '平均的',
      4: '強い',
      5: '非常に強い'
    },
    management: {
      1: '非常に弱い',
      2: '弱い',
      3: '平均的',
      4: '強い',
      5: '非常に強い'
    }
  };

  const key = category.toLowerCase();
  if (descriptions[key] && descriptions[key][score]) {
    return descriptions[key][score];
  }
  
  // デフォルトの説明
  switch (score) {
    case 1: return '非常に悪い';
    case 2: return '悪い';
    case 3: return '普通';
    case 4: return '良い';
    case 5: return '非常に良い';
  }
};

const RatingStars: React.FC<RatingStarsProps> = ({ score, label, description }) => {
  const descriptionText = description || getDescriptionText(score, label);
  
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center">
        <span className="text-gray-300 w-28 text-sm">{label}</span>
        <div className="flex ml-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <svg
              key={star}
              className={`w-5 h-5 ${
                star <= score ? 'text-yellow-400' : 'text-gray-600'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              />
            </svg>
          ))}
        </div>
      </div>
      <span className="text-gray-400 text-xs">{descriptionText}</span>
    </div>
  );
};

export default RatingStars;
