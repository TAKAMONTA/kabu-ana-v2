import React from 'react';
import { TrendingUp, TrendingDown, Target, BarChart3, Image, Calendar, AlertTriangle } from 'lucide-react';

interface ChartAnalysisResult {
  imageUrl: string;
  fileName: string;
  analysis: {
    chartType: string;
    timeframe: string;
    trendDirection: 'bullish' | 'bearish' | 'neutral';
    keyLevels: {
      support: number[];
      resistance: number[];
    };
    technicalPatterns: string[];
    indicators: string[];
    priceAction: string[];
    recommendation: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
    confidence: number;
    insights: string[];
  };
  analyzedAt: string;
}

interface ChartAnalysisResultProps {
  result: ChartAnalysisResult;
  onNewAnalysis: () => void;
}

export const ChartAnalysisResult: React.FC<ChartAnalysisResultProps> = ({ result, onNewAnalysis }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRatingColor = (rating: string) => {
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

  const getRatingText = (rating: string) => {
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

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'bullish':
        return 'text-emerald-600';
      case 'bearish':
        return 'text-red-600';
      default:
        return 'text-amber-600';
    }
  };

  const getTrendText = (trend: string) => {
    switch (trend) {
      case 'bullish':
        return '上昇トレンド';
      case 'bearish':
        return '下降トレンド';
      default:
        return '横ばいトレンド';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'bullish':
        return <TrendingUp className="h-5 w-5" />;
      case 'bearish':
        return <TrendingDown className="h-5 w-5" />;
      default:
        return <Target className="h-5 w-5" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-purple-600" />
            チャート画像分析結果
          </h1>
          <div className="text-right">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Calendar className="h-4 w-4" />
              <span>分析日時</span>
            </div>
            <p className="text-sm font-semibold">{formatDate(result.analyzedAt)}</p>
          </div>
        </div>

        {/* アップロード画像の表示 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Image className="h-5 w-5 text-gray-600" />
            <span className="font-semibold text-gray-900">分析対象画像</span>
            <span className="text-sm text-gray-500">({result.fileName})</span>
          </div>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <img
              src={result.imageUrl}
              alt="分析対象チャート"
              className="w-full h-auto max-h-80 object-contain bg-gray-50"
            />
          </div>
        </div>

        {/* 総合判断 */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">AI総合判断</p>
              <div className={`inline-block px-4 py-2 rounded-full font-semibold ${getRatingColor(result.analysis.recommendation)}`}>
                {getRatingText(result.analysis.recommendation)}
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">トレンド方向</p>
              <div className={`flex items-center justify-center gap-2 font-semibold ${getTrendColor(result.analysis.trendDirection)}`}>
                {getTrendIcon(result.analysis.trendDirection)}
                {getTrendText(result.analysis.trendDirection)}
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">分析信頼度</p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${result.analysis.confidence}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold">{result.analysis.confidence}%</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">チャート種類:</span>
              <span className="ml-2 font-semibold">{result.analysis.chartType}</span>
            </div>
            <div>
              <span className="text-gray-600">時間軸:</span>
              <span className="ml-2 font-semibold">{result.analysis.timeframe}</span>
            </div>
          </div>
        </div>
      </div>

      {/* テクニカルパターン分析 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="h-6 w-6 text-emerald-600" />
          <h2 className="text-xl font-bold text-gray-900">チャートパターン分析</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">認識されたパターン</h3>
            <ul className="space-y-2">
              {result.analysis.technicalPatterns.map((pattern, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0"></span>
                  {pattern}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3">価格アクション</h3>
            <ul className="space-y-2">
              {result.analysis.priceAction.map((action, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                  {action}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* テクニカル指標分析 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">テクニカル指標分析</h2>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">指標の状況</h3>
            <ul className="space-y-2">
              {result.analysis.indicators.map((indicator, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></span>
                  {indicator}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-600" />
                サポートレベル
              </h3>
              <div className="space-y-2">
                {result.analysis.keyLevels.support.map((level, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-red-50 rounded">
                    <span className="text-sm text-red-700">サポート {index + 1}</span>
                    <span className="font-semibold text-red-700">¥{level.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                レジスタンスレベル
              </h3>
              <div className="space-y-2">
                {result.analysis.keyLevels.resistance.map((level, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-emerald-50 rounded">
                    <span className="text-sm text-emerald-700">レジスタンス {index + 1}</span>
                    <span className="font-semibold text-emerald-700">¥{level.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI分析インサイト */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Target className="h-6 w-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900">AI分析インサイト</h2>
        </div>

        <div className="bg-purple-50 rounded-lg p-4">
          <h3 className="font-semibold text-purple-900 mb-3">投資判断の根拠</h3>
          <ul className="space-y-2">
            {result.analysis.insights.map((insight, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-purple-800">
                <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></span>
                {insight}
              </li>
            ))}
          </ul>
        </div>
        
        {/* 具体的な価格エリア推奨 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <h4 className="font-semibold text-emerald-900">エントリーゾーン</h4>
            </div>
            <div className="space-y-2">
              <div className="text-center p-3 bg-emerald-100 rounded-lg">
                <p className="text-sm text-emerald-700 mb-1">推奨エントリー価格</p>
                <p className="text-lg font-bold text-emerald-900">
                  ¥2,850 - ¥2,950
                </p>
              </div>
              <p className="text-xs text-emerald-800">
                現在価格から5%下まで。分割投資推奨。
              </p>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-5 w-5 text-blue-600" />
              <h4 className="font-semibold text-blue-900">押し目買いゾーン</h4>
            </div>
            <div className="space-y-2">
              <div className="text-center p-3 bg-blue-100 rounded-lg">
                <p className="text-sm text-blue-700 mb-1">押し目買い価格</p>
                <p className="text-lg font-bold text-blue-900">
                  ¥2,750 - ¥2,850
                </p>
              </div>
              <p className="text-xs text-blue-800">
                25日線付近。絶好の買い場。
              </p>
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown className="h-5 w-5 text-red-600" />
              <h4 className="font-semibold text-red-900">損切りライン</h4>
            </div>
            <div className="space-y-2">
              <div className="text-center p-3 bg-red-100 rounded-lg">
                <p className="text-sm text-red-700 mb-1">ストップロス</p>
                <p className="text-lg font-bold text-red-900">
                  ¥2,650以下
                </p>
              </div>
              <p className="text-xs text-red-800">
                25日線サポート破綻時。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onNewAnalysis}
            className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
          >
            <Image className="h-5 w-5" />
            新しい画像を分析
          </button>
          
          <button
            onClick={() => window.print()}
            className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            分析結果を印刷
          </button>
        </div>
      </div>

      {/* 免責事項 */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold mb-1">チャート画像分析に関する注意</p>
            <p>
              この分析結果は画像認識技術に基づく参考情報であり、投資の勧誘や助言を意図するものではありません。
              実際の投資判断は、より詳細なデータと分析に基づいて行ってください。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChartAnalysisResult;