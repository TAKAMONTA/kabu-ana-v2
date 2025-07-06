import React from 'react';
import { TrendingUp, TrendingDown, Target, Brain, AlertTriangle, Building2, BarChart3, Calendar } from 'lucide-react';
import { AnalysisResult as AnalysisResultType, getRatingColor, getRatingText } from '../../types/stock';

interface AnalysisResultProps {
  result: AnalysisResultType;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ result }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStyleColor = (style: string) => {
    switch (style) {
      case 'short':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-blue-600 bg-blue-50';
      case 'long':
        return 'text-emerald-600 bg-emerald-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStyleText = (style: string) => {
    switch (style) {
      case 'short':
        return '短期投資';
      case 'medium':
        return '中期投資';
      case 'long':
        return '長期投資';
      default:
        return '投資スタイル';
    }
  };

  const getStylePeriod = (style: string) => {
    switch (style) {
      case 'short':
        return '数日〜数週間';
      case 'medium':
        return '数ヶ月〜1年';
      case 'long':
        return '1年以上';
      default:
        return '';
    }
  };
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-emerald-600 bg-emerald-50';
      case 'medium':
        return 'text-amber-600 bg-amber-50';
      case 'high':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getRiskText = (risk: string) => {
    switch (risk) {
      case 'low':
        return '低リスク';
      case 'medium':
        return '中リスク';
      case 'high':
        return '高リスク';
      default:
        return '不明';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 企業情報 */}
      {result.companyInfo && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">企業概要</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">基本情報</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">企業名:</span>
                  <span className="font-semibold">{result.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">証券コード:</span>
                  <span className="font-semibold">{result.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">業種:</span>
                  <span className="font-semibold">{result.companyInfo.sector}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">主力事業:</span>
                  <span className="font-semibold">{result.companyInfo.business}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">企業特徴</h3>
              <ul className="space-y-1 text-sm">
                {result.companyInfo.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">{result.companyInfo.description}</p>
          </div>
        </div>
      )}

      {/* AI総合判断 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {result.name} ({result.symbol})
            </h1>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStyleColor(result.investmentStyle)}`}>
              {getStyleText(result.investmentStyle)} ({getStylePeriod(result.investmentStyle)})
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Calendar className="h-4 w-4" />
              <span>分析日時</span>
            </div>
            <p className="text-sm font-semibold">{formatDate(result.analyzedAt)}</p>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-emerald-50 to-amber-50 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Brain className="h-8 w-8 text-emerald-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">AI総合判断 ({getStyleText(result.investmentStyle)})</h2>
              <p className="text-sm text-gray-600">
                {result.investmentStyle === 'short' 
                  ? 'テクニカル分析重視・短期売買最適化' 
                  : result.investmentStyle === 'medium'
                  ? 'テクニカル・ファンダメンタル分析バランス型'
                  : 'ファンダメンタル分析重視・長期投資最適化'
                }
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className={`inline-block px-4 py-2 rounded-full font-semibold ${getRatingColor(result.overallRating)}`}>
                {getRatingText(result.overallRating)}
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">信頼度</p>
              <div className="flex items-center justify-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${result.confidence}%` }}
                  ></div>
                </div>
                <span className="text-sm font-semibold">{result.confidence}%</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">リスクレベル</p>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getRiskColor(result.riskLevel)}`}>
                {getRiskText(result.riskLevel)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-3">
            {getStyleText(result.investmentStyle)}総合分析結果
          </h3>
          <ul className="space-y-2">
            {result.aiInsights.map((insight, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-blue-800">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                {insight}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* テクニカル分析 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">
            ①テクニカル分析 
            {result.investmentStyle === 'short' && <span className="text-sm text-red-600 ml-2">(重点分析)</span>}
            {result.investmentStyle === 'long' && <span className="text-sm text-gray-500 ml-2">(参考分析)</span>}
          </h2>
          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getRatingColor(result.technicalAnalysis.rating)}`}>
            {getRatingText(result.technicalAnalysis.rating)}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              チャートパターン分析
            </h3>
            <ul className="space-y-2">
              {result.technicalAnalysis.chartPatterns?.map((pattern, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                  {pattern}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              テクニカル指標
            </h3>
            <ul className="space-y-2">
              {result.technicalAnalysis.technicalIndicators?.map((indicator, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
                  {indicator}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">トレンド分析</h3>
          <ul className="space-y-2">
            {result.technicalAnalysis.trendAnalysis?.map((trend, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></span>
                {trend}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
            <span className="text-sm text-red-700">レジスタンス</span>
            <span className="font-semibold text-red-700">¥{result.technicalAnalysis.resistance.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
            <span className="text-sm text-emerald-700">サポート</span>
            <span className="font-semibold text-emerald-700">¥{result.technicalAnalysis.support.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">テクニカル分析結論</h3>
          <p className="text-sm text-blue-800 font-semibold">{result.technicalAnalysis.conclusion}</p>
        </div>
      </div>

      {/* ファンダメンタル分析 */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Target className="h-6 w-6 text-emerald-600" />
          <h2 className="text-xl font-bold text-gray-900">
            ②ファンダメンタル分析
            {result.investmentStyle === 'long' && <span className="text-sm text-emerald-600 ml-2">(重点分析)</span>}
            {result.investmentStyle === 'short' && <span className="text-sm text-gray-500 ml-2">(参考分析)</span>}
          </h2>
          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getRatingColor(result.fundamentalAnalysis.rating)}`}>
            {getRatingText(result.fundamentalAnalysis.rating)}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              強み
            </h3>
            <ul className="space-y-2">
              {result.fundamentalAnalysis.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="w-2 h-2 bg-emerald-600 rounded-full mt-2 flex-shrink-0"></span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              弱み
            </h3>
            <ul className="space-y-2">
              {result.fundamentalAnalysis.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></span>
                  {weakness}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">主要財務指標</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">PER</p>
              <p className="text-lg font-semibold">{result.fundamentalAnalysis.keyMetrics.pe.toFixed(0)}倍</p>
              <p className="text-xs text-gray-500">株価収益率</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">PBR</p>
              <p className="text-lg font-semibold">{result.fundamentalAnalysis.keyMetrics.pbr.toFixed(1)}倍</p>
              <p className="text-xs text-gray-500">株価純資産倍率</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">ROE</p>
              <p className="text-lg font-semibold">{result.fundamentalAnalysis.keyMetrics.roe.toFixed(0)}%</p>
              <p className="text-xs text-gray-500">自己資本利益率</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">配当利回り</p>
              <p className="text-lg font-semibold">{result.fundamentalAnalysis.keyMetrics.dividendYield}%</p>
              <p className="text-xs text-gray-500">年間配当/株価</p>
            </div>
          </div>
          
          <ul className="space-y-2">
            {result.fundamentalAnalysis.financialMetrics?.map((metric, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                {metric}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">直近決算分析</h3>
            <ul className="space-y-2">
              {result.fundamentalAnalysis.earningsAnalysis?.map((earning, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></span>
                  {earning}
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">市場ニュース・関連情報</h3>
            <ul className="space-y-2">
              {result.fundamentalAnalysis.marketNews?.map((news, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></span>
                  {news}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="bg-emerald-50 rounded-lg p-4">
          <h3 className="font-semibold text-emerald-900 mb-2">ファンダメンタル分析結論</h3>
          <p className="text-sm text-emerald-800 font-semibold">{result.fundamentalAnalysis.conclusion}</p>
        </div>
      </div>

      {/* 免責事項 */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold mb-1">投資に関する注意</p>
            <p>
              この分析結果は情報提供を目的としており、投資の勧誘や助言を意図するものではありません。
              投資に関する最終的な判断は、ご自身の責任において行ってください。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;