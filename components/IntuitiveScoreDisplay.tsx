import React from 'react';
import JapaneseScoreDisplay from './JapaneseScoreDisplay';

interface IntuitiveScoreDisplayProps {
  technicalScore: number;
  fundamentalScore: number;
}

const IntuitiveScoreDisplay: React.FC<IntuitiveScoreDisplayProps> = ({ 
  technicalScore, 
  fundamentalScore 
}) => {
  const getScoreWidth = (score: number) => `${score}%`;
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 65) return 'bg-blue-500';
    if (score >= 50) return 'bg-yellow-500';
    if (score >= 35) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-600 to-green-400';
    if (score >= 65) return 'from-blue-600 to-blue-400';
    if (score >= 50) return 'from-yellow-600 to-yellow-400';
    if (score >= 35) return 'from-orange-600 to-orange-400';
    return 'from-red-600 to-red-400';
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-2xl">
      <h3 className="text-xl font-bold text-gray-200 mb-6 text-center">総合評価</h3>
      
      <div className="space-y-6">
        {/* Technical Analysis */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-semibold text-gray-300">テクニカル分析</span>
            <JapaneseScoreDisplay score={technicalScore} type="technical" />
          </div>
          <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${getScoreGradient(technicalScore)} transition-all duration-1000 ease-out`}
              style={{ width: getScoreWidth(technicalScore) }}
            />
          </div>
        </div>

        {/* Fundamental Analysis */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-semibold text-gray-300">ファンダメンタル分析</span>
            <JapaneseScoreDisplay score={fundamentalScore} type="fundamental" />
          </div>
          <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${getScoreGradient(fundamentalScore)} transition-all duration-1000 ease-out`}
              style={{ width: getScoreWidth(fundamentalScore) }}
            />
          </div>
        </div>

        {/* Overall Assessment */}
        <div className="mt-8 pt-6 border-t border-gray-600">
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-2">総合スコア</div>
            <div className="text-3xl font-bold text-white">
              {Math.round((technicalScore + fundamentalScore) / 2)}
              <span className="text-lg text-gray-400 ml-1">/100</span>
            </div>
            <div className="mt-2">
              <JapaneseScoreDisplay 
                score={Math.round((technicalScore + fundamentalScore) / 2)} 
                type="technical" 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntuitiveScoreDisplay;
