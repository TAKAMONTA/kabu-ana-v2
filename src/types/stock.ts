export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  pe: number;
  dividendYield: number;
  sector: string;
  // 追加のテクニカルデータ
  ma5?: number;
  ma20?: number;
  avgVolume?: number;
  high52Week?: number;
  low52Week?: number;
  prices?: number[];
  volumes?: number[];
  // 投資スタイル
  investmentStyle?: 'short' | 'medium' | 'long';
}

export interface AnalysisResult {
  symbol: string;
  name: string;
  investmentStyle: 'short' | 'medium' | 'long';
  companyInfo?: {
    sector: string;
    business: string;
    features: string[];
    description: string;
  };
  overallRating: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
  confidence: number;
  fundamentalAnalysis: {
    rating: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
    strengths: string[];
    weaknesses: string[];
    financialMetrics: string[];
    earningsAnalysis: string[];
    marketNews: string[];
    conclusion: string;
    keyMetrics: {
      pe: number;
      pbr: number;
      roe: number;
      dividendYield: number;
    };
  };
  technicalAnalysis: {
    rating: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
    chartPatterns: string[];
    technicalIndicators: string[];
    trendAnalysis: string[];
    conclusion: string;
    signals: string[];
    resistance: number;
    support: number;
    trend: 'bullish' | 'bearish' | 'neutral';
  };
  aiInsights: string[];
  riskLevel: 'low' | 'medium' | 'high';
  analyzedAt: string;
}

export const getRatingColor = (rating: string): string => {
  switch (rating) {
    case 'strong_buy':
      return 'text-emerald-600 bg-emerald-50';
    case 'buy':
      return 'text-emerald-500 bg-emerald-50';
    case 'hold':
      return 'text-amber-600 bg-amber-50';
    case 'sell':
      return 'text-red-500 bg-red-50';
    case 'strong_sell':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

export const getRatingText = (rating: string): string => {
  switch (rating) {
    case 'strong_buy':
      return '強い買い';
    case 'buy':
      return '買い';
    case 'hold':
      return '保有';
    case 'sell':
      return '売り';
    case 'strong_sell':
      return '強い売り';
    default:
      return '評価なし';
  }
};