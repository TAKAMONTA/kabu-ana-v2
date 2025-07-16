
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AnalysisResponse, GroundingSource, InvestmentStyle, AnalysisStreamChunk } from "../types";
import { RobustApiClient, RetryConfig, ApiError, createRetryConfig } from "./apiUtils";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "your-gemini-api-key";

const GEMINI_RETRY_CONFIG: RetryConfig = createRetryConfig({
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  retryableErrors: ['RATE_LIMIT_EXCEEDED', 'INTERNAL_ERROR', 'TIMEOUT', 'NETWORK_ERROR', 'API key not valid']
});

const apiClient = new RobustApiClient();

if (!API_KEY || API_KEY === "your-gemini-api-key") {
    console.warn("Gemini API key not configured properly");
}

const genAI = new GoogleGenerativeAI(API_KEY);

async function validateApiKey(): Promise<boolean> {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent("Test");
        return true;
    } catch (error: any) {
        if (error.message?.includes('API key not valid') || error.message?.includes('API_KEY_INVALID')) {
            console.error('Gemini API key is invalid or expired');
            return false;
        }
        return true;
    }
}

async function getHealthyModel(): Promise<any> {
    const isValid = await validateApiKey();
    if (!isValid) {
        throw new ApiError('Gemini API key is invalid. Please update your API key.', 401, false);
    }
    return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
}

function buildPrompt(ticker: string, style: InvestmentStyle, question: string | null): string {
    return `あなたはプロの株式アナリストです。以下の情報に基づいて、包括的な株式分析レポートを生成してください。

**銘柄:** ${ticker}
**投資スタイル:** ${style}

**指示:**
分析の各セクションを、個別のJSONオブジェクトとして、1行ずつストリーミング形式で出力してください。説明や前置きは一切含めず、JSONオブジェクトのストリームのみを返してください。各JSONオブジェクトは必ず1行で完結させてください。

1.  **株価情報:** Web検索ツールで最新情報を取得し、以下の形式で出力:
    {"type": "priceInfo", "data": {"price": "...", "dayHigh": "...", "dayLow": "...", "change": "..."}}

2.  **会社概要:** Web検索ツールで企業情報を取得し、事業内容、業界、主要事業、特徴を簡潔にまとめて以下の形式で出力:
    {"type": "companyOverview", "data": "企業の事業内容。業界での位置づけ。主要な製品・サービス。"}

3.  **テクニカル分析:** チャート画像（あれば）と検索情報を基に分析し、100点満点で採点し、要約を箇条書き形式で記述。各要点は句点（。）で区切って記述。以下の形式で出力:
    {"type": "technicalAnalysis", "data": {"score": 0, "summary": "要点1の内容。要点2の内容。要点3の内容。"}}

4.  **ファンダメンタル分析:** 財務指標やニュースを調査し、100点満点で採点し、要約を箇条書き形式で記述。各要点は句点（。）で区切って記述。以下の形式で出力:
    {"type": "fundamentalAnalysis", "data": {"score": 0, "summary": "要点1の内容。要点2の内容。要点3の内容。"}}

5.  **総合判断:** 全てを統合し、投資判断（「買い」「売り」「様子見」）と理由を箇条書き形式で記述。各要点は句点（。）で区切って記述。以下の形式で出力:
    {"type": "overallJudgement", "data": {"decision": "買い", "summary": "判断理由1。判断理由2。判断理由3。"}}

${question ? `6. **追加の質問:** 「${question}」に回答。以下の形式で出力:\n{"type": "questionAnswer", "data": "..."}` : ''}

**出力順序:**
必ず priceInfo, companyOverview, technicalAnalysis, fundamentalAnalysis, overallJudgement, questionAnswer (あれば) の順で出力してください。
`;
}


export async function* analyzeStockStream(
    ticker: string,
    style: InvestmentStyle,
    imageBase64: string | null,
    question: string,
    signal: AbortSignal
): AsyncGenerator<AnalysisStreamChunk> {
    try {
        const operation = async () => {
            if (signal.aborted) {
                throw new Error('AbortError');
            }

            const model = await getHealthyModel();
            const prompt = buildPrompt(ticker, style, question || null);
            const contentParts: any[] = [{ text: prompt }];

            if (imageBase64) {
                contentParts.push({
                    inlineData: {
                        mimeType: 'image/jpeg',
                        data: imageBase64,
                    },
                });
            }

            return await model.generateContentStream(contentParts);
        };

        const responseGenerator = await apiClient.executeWithRetry(
            operation,
            GEMINI_RETRY_CONFIG,
            'gemini-analysis'
        );
        
        let buffer = '';
        const allSources: GroundingSource[] = [];

        for await (const chunk of responseGenerator.stream) {
            if (signal.aborted) {
                return;
            }

            const sourcesInChunk = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
            if (sourcesInChunk?.length) {
                allSources.push(...sourcesInChunk as GroundingSource[]);
            }

            const chunkText = chunk.text || '';
            buffer += chunkText;
            
            let newlineIndex;
            while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
                const line = buffer.slice(0, newlineIndex).trim();
                buffer = buffer.slice(newlineIndex + 1);
                if (line) {
                    try {
                        const parsed = JSON.parse(line) as AnalysisStreamChunk;
                        yield parsed;
                    } catch (e) {
                        console.warn("Failed to parse a streamed line:", line, e);
                    }
                }
            }
        }
        
        if (buffer.trim()) {
            try {
                const parsed = JSON.parse(buffer.trim()) as AnalysisStreamChunk;
                yield parsed;
            } catch (e) {
                 console.warn("Failed to parse remaining buffer:", buffer.trim(), e);
            }
        }

        if (allSources.length > 0) {
            const uniqueSources = Array.from(new Map(allSources.map(s => [s.web.uri, s])).values());
            if (uniqueSources.length > 0) {
                yield { type: 'sources', data: uniqueSources };
            }
        }

    } catch (error: any) {
        if (error.name === 'AbortError' || signal.aborted) {
            console.log("Stream aborted by user.");
            return;
        }
        
        console.error("Error analyzing stock:", error);
        
        if (error instanceof ApiError && !error.isRetryable) {
            yield* handleAnalysisError(error, ticker);
        } else {
            const errorMessage = error.message || "AIによる分析中にエラーが発生しました。";
            throw new ApiError(`分析エラー: ${errorMessage}`, error.statusCode, error.isRetryable, error);
        }
    }
};

async function* handleAnalysisError(error: ApiError, ticker: string): AsyncGenerator<AnalysisStreamChunk> {
    console.warn(`Providing fallback analysis for ${ticker} due to API error:`, error.message);
    
    yield {
        type: 'priceInfo',
        data: {
            price: 'データ取得不可',
            dayHigh: 'N/A',
            dayLow: 'N/A',
            change: 'N/A'
        }
    };
    
    yield {
        type: 'companyOverview',
        data: `${ticker}の詳細分析は現在利用できません。APIサービスに問題が発生しています。しばらく時間をおいて再度お試しください。エラー: ${error.message}`
    };
    
    yield {
        type: 'technicalAnalysis',
        data: {
            score: 0,
            summary: 'テクニカル分析は現在利用できません。APIサービスの復旧をお待ちください。'
        }
    };
    
    yield {
        type: 'fundamentalAnalysis',
        data: {
            score: 0,
            summary: 'ファンダメンタル分析は現在利用できません。APIサービスの復旧をお待ちください。'
        }
    };
    
    yield {
        type: 'overallJudgement',
        data: {
            decision: '様子見',
            summary: 'APIサービスの問題により、現在正確な投資判断を提供できません。サービス復旧後に再度分析をお試しください。'
        }
    };
}
