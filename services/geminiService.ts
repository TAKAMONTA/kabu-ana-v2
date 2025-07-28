
import { GoogleGenAI } from "@google/genai";
import { AnalysisResponse, GroundingSource, InvestmentStyle, AnalysisStreamChunk } from "../types";

// 環境変数からAPIキーを取得するか、.env.localファイルから読み込む
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyCfXYwHZVsD1ImT10afpux8I-6dwwa8ZI4";

if (!API_KEY) {
    throw new Error("API_KEYが環境変数に設定されていません。");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// 銘柄が米国株かどうかを判定する関数
function isUSStock(ticker: string): boolean {
    // 前処理: 空白除去・大文字化
    const cleanTicker = ticker.toUpperCase().replace(/\s+/g, '');

    // 1) 日本株の典型パターン（4桁数字、または数字.T）
    if (/^\d{4}(\.T)?$/.test(cleanTicker)) {
        return false; // 日本株
    }

    // 2) 非ASCII文字（例: 企業名を日本語で入力）の場合は日本株扱い
    if (/[^\x00-\x7F]/.test(cleanTicker)) {
        return false; // 日本株
    }

    // 3) 英字のみ、もしくは英字+ピリオドの場合は米国株扱い
    if (/^[A-Z]+(\.\w+)?$/.test(cleanTicker)) {
        return true; // 米国株
    }

    // 4) それ以外は日本株とする（安全側）
    return false;
}

// 通貨記号を取得する関数
function getCurrencySymbol(ticker: string): string {
    return isUSStock(ticker) ? '$' : '￥';
}

function buildPrompt(ticker: string, style: InvestmentStyle, question: string | null): string {
    const currencySymbol = getCurrencySymbol(ticker);
    const marketType = isUSStock(ticker) ? '米国株' : '日本株';
    return `あなたはプロの株式アナリストです。以下の情報に基づいて、包括的な株式分析レポートを生成してください。

**銘柄:** ${ticker} (${marketType})
**投資スタイル:** ${style}
**通貨:** ${currencySymbol}

**絶対に守るべき重要な指示:**
- この銘柄は${marketType}です。
- ${marketType === '米国株' ? '米国株には、すべての価格は必ずドル記号「$」で表示してください。円記号「￥」は絶対に使用しないでください。' : '日本株なので、すべての価格は必ず円記号「￥」で表示してください。'}
- 価格を表示する際は、必ず「${currencySymbol}」記号を先頭に付けてください。
- 分析の各セクションを、個別のJSONオブジェクトとして、1行ずつストリーミング形式で出力してください。
- 説明や前置きは一切含めず、JSONオブジェクトのストリームのみを返してください。
- 各JSONオブジェクトは必ず1行で完結させてください。

0.  **日足チャート:** 「${ticker} 株価 今日のチャート」をGoogle検索し、最新の日足チャート画像のURLを取得してください。以下の形式で出力:
    {"type": "chartImage", "data": {"url": "チャート画像のURL"}}

1.  **株価情報:** Web検索ツールで最新情報を取得し、価格は必ず「${currencySymbol}」で表示。${marketType === '米国株' ? 'ドル記号「$」を使用' : '円記号「￥」を使用'}。以下の形式で出力:
    {"type": "priceInfo", "data": {"price": "${currencySymbol}...", "dayHigh": "${currencySymbol}...", "dayLow": "${currencySymbol}...", "change": "..."}}

2.  **テクニカル分析:** チャート画像（あれば）と検索情報を基に分析し、100点満点で採点し、要約を箇条書き形式で記述。価格言及時は必ず「${currencySymbol}」を使用。${marketType === '米国株' ? 'ドル記号「$」のみ使用、円記号「￥」は禁止' : '円記号「￥」を使用'}。各要点は句点（。）で区切って記述。また、以下の5つの要素を1〜5の5段階で評価してください。以下の形式で出力:
    {"type": "technicalAnalysis", "data": {"score": 0, "summary": "要点1の内容。要点2の内容。要点3の内容。", "detailedRatings": {"trend": 3, "momentum": 3, "volatility": 3, "support": 3, "resistance": 3}}}

3.  **ファンダメンタル分析:** 財務指標やニュースを調査し、100点満点で採点し、要約を箇条書き形式で記述。価格言及時は必ず「${currencySymbol}」を使用。${marketType === '米国株' ? 'ドル記号「$」のみ使用、円記号「￥」は禁止' : '円記号「￥」を使用'}。各要点は句点（。）で区切って記述。また、以下の5つの要素を1〜5の5段階で評価してください。以下の形式で出力:
    {"type": "fundamentalAnalysis", "data": {"score": 0, "summary": "要点1の内容。要点2の内容。要点3の内容。", "detailedRatings": {"profitability": 3, "growth": 3, "valuation": 3, "financial": 3, "management": 3}}}

4.  **総合判断:** 全てを統合し、投資判断（「買い」「売り」「様子見」）と理由を箇条書き形式で記述。価格言及時は必ず「${currencySymbol}」を使用。${marketType === '米国株' ? 'ドル記号「$」のみ使用、円記号「￥」は禁止' : '円記号「￥」を使用'}。各要点は句点（。）で区切って記述。以下の形式で出力:
    {"type": "overallJudgement", "data": {"decision": "買い", "summary": "判断理由1。判断理由2。判断理由3。"}}

${question ? `5. **追加の質問:** 「${question}」に回答。以下の形式で出力:\n{"type": "questionAnswer", "data": "..."}` : ''}

**出力順序:**
必ず chartImage, priceInfo, technicalAnalysis, fundamentalAnalysis, overallJudgement, questionAnswer (あれば) の順で出力してください。
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
            model: "gemini-1.5-pro",
            contents: { parts: contentParts },
            config: {
                tools: [{ googleSearchRetrieval: {} }],
            },
            safetySettings: [
                {
                    category: "HARM_CATEGORY_HATE_SPEECH",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                },
                {
                    category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                    threshold: "BLOCK_MEDIUM_AND_ABOVE"
                }
            ]
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
                        console.log('Parsed chunk:', JSON.stringify(parsed));
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
