
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface ScoreChartProps {
  technicalScore: number;
  fundamentalScore: number;
}

const ScoreChart: React.FC<ScoreChartProps> = ({ technicalScore, fundamentalScore }) => {
  const data = [
    { subject: 'テクニカル', score: technicalScore, fullMark: 100 },
    { subject: 'ファンダメンタル', score: fundamentalScore, fullMark: 100 },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 65) return '#3b82f6';
    if (score >= 50) return '#f59e0b';
    if (score >= 35) return '#f97316';
    return '#ef4444';
  };

  return (
    <div className="w-full h-64 md:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <defs>
            <radialGradient id="scoreGradient">
              <stop offset="5%" stopColor={getScoreColor(Math.max(technicalScore, fundamentalScore))} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={getScoreColor(Math.max(technicalScore, fundamentalScore))} stopOpacity={0.2}/>
            </radialGradient>
          </defs>
          <PolarGrid stroke="#4a5568" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#cbd5e0', fontSize: 14, fontWeight: 'bold' }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <Radar name="Score" dataKey="score" stroke={getScoreColor(Math.max(technicalScore, fundamentalScore))} fill="url(#scoreGradient)" fillOpacity={0.6} strokeWidth={2} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(31, 41, 55, 0.9)',
              borderColor: '#4a5568',
              borderRadius: '0.5rem',
              color: '#e5e7eb'
            }}
            labelStyle={{ color: '#e5e7eb', fontWeight: 'bold' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreChart;
