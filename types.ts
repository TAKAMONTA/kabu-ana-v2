export enum InvestmentStyle {
  SHORT = "短期",
  MID = "中期",
  LONG = "長期",
}

export interface PriceInfo {
  price: string;
  dayHigh: string;

  dayLow: string;
  change: string;
}

export type RatingScore = 1 | 2 | 3 | 4 | 5;

export interface TechnicalDetailedRatings {
  trend: RatingScore;        // トレンド
  momentum: RatingScore;     // モメンタム
  volatility: RatingScore;   // ボラティリティ
  support: RatingScore;      // サポートレベル
  resistance: RatingScore;   // レジスタンスレベル
}

export interface FundamentalDetailedRatings {
  profitability: RatingScore;  // 収益性
  growth: RatingScore;         // 成長性
  valuation: RatingScore;      // バリュエーション
  financial: RatingScore;      // 財務健全性
  management: RatingScore;     // 経営陣・戦略
}

export interface AnalysisSectionData {
  score: number;
  summary: string;
  detailedRatings?: TechnicalDetailedRatings | FundamentalDetailedRatings;
}

export interface OverallJudgementData {
  decision: "買い" | "売り" | "様子見";
  summary: string;
}

export interface ChartImageData {
  url: string;
}

export interface AnalysisResponse {
  chartImage?: ChartImageData;
  priceInfo?: PriceInfo;
  technicalAnalysis?: AnalysisSectionData;
  fundamentalAnalysis?: AnalysisSectionData;
  overallJudgement?: OverallJudgementData;
  questionAnswer?: string | null;
}

export interface GroundingSource {
    web: {
        uri: string;
        title: string;
    }
}

export interface AnalysisHistoryItem {
  id: string;
  ticker: string;
  style: InvestmentStyle;
  timestamp: string;
  analysis: AnalysisResponse;
  sources: GroundingSource[];
}

export type AnalysisStreamChunk =
  | { type: 'chartImage'; data: ChartImageData }
  | { type: 'priceInfo'; data: PriceInfo }
  | { type: 'technicalAnalysis'; data: AnalysisSectionData }
  | { type: 'fundamentalAnalysis'; data: AnalysisSectionData }
  | { type: 'overallJudgement'; data: OverallJudgementData }
  | { type: 'questionAnswer'; data: string }
  | { type: 'sources'; data: GroundingSource[] };
