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

export interface AnalysisSectionData {
  score: number;
  summary: string;
}

export interface OverallJudgementData {
  decision: "買い" | "売り" | "様子見";
  summary: string;
}

export interface AnalysisResponse {
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
  | { type: 'priceInfo'; data: PriceInfo }
  | { type: 'technicalAnalysis'; data: AnalysisSectionData }
  | { type: 'fundamentalAnalysis'; data: AnalysisSectionData }
  | { type: 'overallJudgement'; data: OverallJudgementData }
  | { type: 'questionAnswer'; data: string }
  | { type: 'sources'; data: GroundingSource[] };
