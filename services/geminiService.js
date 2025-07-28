const { GoogleGenerativeAI } = require('@google/generative-ai');

// 環境変数からAPIキーを取得
const API_KEY = process.env.GEMINI_API_KEY || "AIzaSyCfXYwHZVsD1ImT10afpux8I-6dwwa8ZI4";

if (!API_KEY) {
    throw new Error("GEMINI_API_KEYが環境変数に設定されていません。");
}

const genAI = new GoogleGenerativeAI(API_KEY);

// 銘柄が米国株かどうかを判定する関数
function isUSStock(ticker) {
    const cleanTicker = ticker.toUpperCase().replace(/\s+/g, '');
    
    if (/^\d{4}(\.T)?$/.test(cleanTicker)) {
        return false; // 日本株
    }
    
    if (/[^\x00-\x7F]/.test(cleanTicker)) {
        return false; // 日本株
    }
    
    if (/^[A-Z]+(\.\w+)?$/.test(cleanTicker)) {
        return true; // 米国株
    }
    
    return false;
}

// 通貨記号を取得する関数
function getCurrencySymbol(ticker) {
    return isUSStock(ticker) ? '$' : '￥';
}

function buildPrompt(ticker, style, question) {
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

async function analyzeStock(ticker, style, imageBase64, question) {
    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-pro",
            generationConfig: {
                temperature: 0.7,
                topK: 1,
                topP: 1,
                maxOutputTokens: 2048,
            },
        });

        const prompt = buildPrompt(ticker, style, question || null);
        
        const parts = [{ text: prompt }];
        
        if (imageBase64) {
            parts.push({
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: imageBase64,
                },
            });
        }

        const result = await model.generateContent({
            contents: [{ role: "user", parts }],
            tools: [{
                googleSearchRetrieval: {},
            }],
        });

        const response = await result.response;
        const text = response.text();
        
        // レスポンスをパースして構造化
        const lines = text.split('\n').filter(line => line.trim());
        const analysisData = {
            priceInfo: null,
            technicalAnalysis: null,
            fundamentalAnalysis: null,
            overallJudgement: null,
            questionAnswer: null,
            chartImage: null
        };

        for (const line of lines) {
            try {
                const parsed = JSON.parse(line);
                if (parsed.type && parsed.data) {
                    analysisData[parsed.type] = parsed.data;
                }
            } catch (e) {
                console.warn("Failed to parse line:", line);
            }
        }

        // グラウンディングソースを取得
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

        return {
            analysis: analysisData,
            sources: sources
        };

    } catch (error) {
        console.error("Error analyzing stock:", error);
        throw new Error(`分析エラー: ${error.message || "AIによる分析中にエラーが発生しました。"}`);
    }
}

module.exports = {
    analyzeStock
};