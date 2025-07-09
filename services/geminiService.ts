
import { GoogleGenAI } from "@google/genai";
import { AnalysisResponse, GroundingSource, InvestmentStyle, AnalysisStreamChunk } from "../types";

const API_KEY = import.meta.env?.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    throw new Error("API_KEYが環境変数に設定されていません。");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

function buildPrompt(ticker: string, style: InvestmentStyle, question: string | null): string {
    return `あなたはプロの株式アナリストです。以下の情報に基づいて、包括的な株式分析レポートを生成してください。

**銘柄:** ${ticker}
**投資スタイル:** ${style}

**指示:**
分析の各セクションを、個別のJSONオブジェクトとして、1行ずつストリーミング形式で出力してください。説明や前置きは一切含めず、JSONオブジェクトのストリームのみを返してください。各JSONオブジェクトは必ず1行で完結させてください。

1.  **株価情報:** Web検索ツールで最新情報を取得し、以下の形式で出力:
    {"type": "priceInfo", "data": {"price": "...", "dayHigh": "...", "dayLow": "...", "change": "..."}}

2.  **テクニカル分析:** チャート画像（あれば）と検索情報を基に分析し、100点満点で採点し、要約を箇条書き形式で記述。各要点は句点（。）で区切って記述。以下の形式で出力:
    {"type": "technicalAnalysis", "data": {"score": 0, "summary": "要点1の内容。要点2の内容。要点3の内容。"}}

3.  **ファンダメンタル分析:** 財務指標やニュースを調査し、100点満点で採点し、要約を箇条書き形式で記述。各要点は句点（。）で区切って記述。以下の形式で出力:
    {"type": "fundamentalAnalysis", "data": {"score": 0, "summary": "要点1の内容。要点2の内容。要点3の内容。"}}

4.  **総合判断:** 全てを統合し、投資判断（「買い」「売り」「様子見」）と理由を箇条書き形式で記述。各要点は句点（。）で区切って記述。以下の形式で出力:
    {"type": "overallJudgement", "data": {"decision": "買い", "summary": "判断理由1。判断理由2。判断理由3。"}}

${question ? `5. **追加の質問:** 「${question}」に回答。以下の形式で出力:\n{"type": "questionAnswer", "data": "..."}` : ''}

**出力順序:**
必ず priceInfo, technicalAnalysis, fundamentalAnalysis, overallJudgement, questionAnswer (あれば) の順で出力してください。
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

        const responseGenerator = await ai.models.generateContentStream({
            model: "gemini-2.5-flash-preview-04-17",
            contents: { parts: contentParts },
            config: {
                tools: [{ googleSearch: {} }],
            },
        });
        
        let buffer = '';
        const allSources: GroundingSource[] = [];

        for await (const chunk of responseGenerator) {
            if (signal.aborted) {
                return;
            }

            const sourcesInChunk = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
            if (sourcesInChunk?.length) {
                allSources.push(...sourcesInChunk as GroundingSource[]);
            }

            buffer += chunk.text;
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
        // Process any remaining data in the buffer
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
        if (error.name === 'AbortError') {
            console.log("Stream aborted by user.");
            return;
        }
        console.error("Error analyzing stock:", error);
        const errorMessage = error.message || "AIによる分析中にエラーが発生しました。";
        throw new Error(`分析エラー: ${errorMessage}`);
    }
};
