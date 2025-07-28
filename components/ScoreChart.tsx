
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface ScoreMetrics {
  trend: number;
  volatility: number;
  liquidity: number;
  profitability: number;
  growth: number;
  valuation: number;
}

interface ScoreChartProps {
  metrics: ScoreMetrics;
}

const ScoreChart: React.FC<ScoreChartProps> = ({ metrics }) => {
  const data = [
    { subject: 'トレンド', score: metrics.trend, fullMark: 100 },
    { subject: 'ボラティリティ', score: metrics.volatility, fullMark: 100 },
    { subject: '流動性', score: metrics.liquidity, fullMark: 100 },
    { subject: '収益性', score: metrics.profitability, fullMark: 100 },
    { subject: '成長性', score: metrics.growth, fullMark: 100 },
    { subject: '割安度', score: metrics.valuation, fullMark: 100 },
  ];

  return (
    <div className="w-full h-64 md:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <defs>
            <radialGradient id="scoreGradient">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0.2}/>
            </radialGradient>
          </defs>
          <PolarGrid stroke="#4a5568" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#cbd5e0', fontSize: 14 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'transparent' }} />
          <Radar name="Score" dataKey="score" stroke="#3b82f6" fill="url(#scoreGradient)" fillOpacity={0.8} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(31, 41, 55, 0.8)',
              borderColor: '#4a5568',
              borderRadius: '0.5rem',
            }}
            labelStyle={{ color: '#e5e7eb' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreChart;
