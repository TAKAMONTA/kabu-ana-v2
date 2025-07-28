import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface ResponsiveChartProps {
  data: Array<{
    date: string;
    price: number;
    volume?: number;
  }>;
  title?: string;
  showVolume?: boolean;
  height?: number;
}

const ResponsiveChart: React.FC<ResponsiveChartProps> = ({
  data,
  title = '株価チャート',
  showVolume = false,
  height
}) => {
  const [chartHeight, setChartHeight] = useState(300);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      if (height) {
        setChartHeight(height);
      } else {
        // Responsive height based on screen size
        if (mobile) {
          setChartHeight(250);
        } else if (window.innerWidth < 1024) {
          setChartHeight(350);
        } else {
          setChartHeight(400);
        }
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [height]);

  // Custom tooltip for mobile optimization
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm mb-1">{`日付: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey === 'price' ? '株価' : '出来高'}: ${
                entry.dataKey === 'price' 
                  ? `¥${entry.value.toLocaleString()}` 
                  : entry.value.toLocaleString()
              }`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className="w-full bg-gray-800/60 rounded-lg border border-gray-700 flex items-center justify-center" style={{ height: chartHeight }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-2"></div>
          <p className="text-gray-400 text-sm">チャートデータを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-800/60 rounded-lg border border-gray-700 p-4">
      {title && (
        <h3 className="text-lg font-semibold text-white mb-4 text-center md:text-left">
          {title}
        </h3>
      )}
      
      <div className="w-full" style={{ height: chartHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: isMobile ? 5 : 30,
              left: isMobile ? 5 : 20,
              bottom: 5,
            }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#374151" 
              opacity={0.3}
            />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF"
              fontSize={isMobile ? 10 : 12}
              tick={{ fill: '#9CA3AF' }}
              tickLine={{ stroke: '#9CA3AF' }}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={isMobile ? 10 : 12}
              tick={{ fill: '#9CA3AF' }}
              tickLine={{ stroke: '#9CA3AF' }}
              tickFormatter={(value) => `¥${value.toLocaleString()}`}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ stroke: '#60A5FA', strokeWidth: 1 }}
            />
            <Legend 
              wrapperStyle={{ color: '#9CA3AF' }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#60A5FA"
              strokeWidth={isMobile ? 2 : 3}
              dot={{ fill: '#60A5FA', strokeWidth: 2, r: isMobile ? 3 : 4 }}
              activeDot={{ r: isMobile ? 5 : 6, stroke: '#60A5FA', strokeWidth: 2 }}
              name="株価"
            />
            {showVolume && (
              <Line
                type="monotone"
                dataKey="volume"
                stroke="#10B981"
                strokeWidth={isMobile ? 1 : 2}
                dot={{ fill: '#10B981', strokeWidth: 1, r: isMobile ? 2 : 3 }}
                name="出来高"
                yAxisId="volume"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Chart controls for mobile */}
      {isMobile && (
        <div className="flex justify-center mt-3 space-x-2">
          <button className="px-3 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors">
            1日
          </button>
          <button className="px-3 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors">
            1週間
          </button>
          <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded">
            1ヶ月
          </button>
          <button className="px-3 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors">
            3ヶ月
          </button>
        </div>
      )}
    </div>
  );
};

export default ResponsiveChart;
