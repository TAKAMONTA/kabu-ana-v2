import React from 'react';

interface JapaneseScoreDisplayProps {
  score: number;
  type: 'technical' | 'fundamental';
}

const getJapaneseEvaluation = (score: number): { level: string; color: string; bgColor: string } => {
  if (score >= 80) return { level: '優秀', color: 'text-green-400', bgColor: 'bg-green-500/20' };
  if (score >= 65) return { level: '良好', color: 'text-blue-400', bgColor: 'bg-blue-500/20' };
  if (score >= 50) return { level: '普通', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' };
  if (score >= 35) return { level: '注意', color: 'text-orange-400', bgColor: 'bg-orange-500/20' };
  return { level: '危険', color: 'text-red-400', bgColor: 'bg-red-500/20' };
};

const JapaneseScoreDisplay: React.FC<JapaneseScoreDisplayProps> = ({ score, type }) => {
  const evaluation = getJapaneseEvaluation(score);
  
  return (
    <div className="flex items-center justify-between">
      <span className={`px-3 py-1 rounded-full text-sm font-bold ${evaluation.bgColor} ${evaluation.color}`}>
        {evaluation.level}
      </span>
      <span className="text-gray-400 text-sm">{score}/100</span>
    </div>
  );
};

export default JapaneseScoreDisplay;
