import React from 'react';
import { AnalysisResponse, GroundingSource } from '../types';
import IntuitiveScoreDisplay from './IntuitiveScoreDisplay';
import JapaneseScoreDisplay from './JapaneseScoreDisplay';
import { ChartBarIcon, BookOpenIcon, ScaleIcon, LinkIcon } from './icons';
import { formatCurrency, formatPercentage } from '../utils/formatters';

interface AnalysisDisplayProps {
  data: AnalysisResponse;
  sources: GroundingSource[];
  ticker?: string;
  canQuestionAnalysis?: boolean;
  onQuestionAnalysis?: (question: string) => void;
}

const getDecisionClass = (decision?: string) => {
  switch (decision) {
    case '買い':
      return 'bg-green-500 text-white';
    case '売り':
      return 'bg-red-500 text-white';
    case '様子見':
      return 'bg-yellow-500 text-gray-900';
    default:
      return 'bg-gray-500 text-white';
  }
};

const SectionSkeleton: React.FC = () => (
    <div className="bg-gray-800/60 p-6 rounded-xl border border-gray-700 h-full flex flex-col animate-pulse">
        <div className="h-7 bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="space-y-3 flex-grow">
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-4/5"></div>
        </div>
    </div>
);

const AnalysisSection: React.FC<{
  icon: React.ReactNode;
  title: string;
  score?: number;
  summary?: string;
}> = ({ icon, title, score, summary }) => {
    if (score === undefined || summary === undefined) return <SectionSkeleton />;

    const formatSummaryAsBullets = (text: string) => {
        const sentences = text.split(/[。．]/);
        return sentences
            .filter(sentence => sentence.trim().length > 0)
            .map(sentence => sentence.trim())
            .filter(sentence => sentence.length > 0);
    };

    const bulletPoints = formatSummaryAsBullets(summary);

    return (
      <div className="bg-gray-800/60 p-6 rounded-xl border border-gray-700 h-full flex flex-col">
        <div className="flex items-center mb-4">
          {icon}
          <h3 className="text-xl font-bold ml-3 text-gray-200">{title}</h3>
          <div className="ml-auto">
            <JapaneseScoreDisplay score={score} type={title === 'テクニカル分析' ? 'technical' : 'fundamental'} />
          </div>
        </div>
        <ul className="text-gray-400 leading-relaxed flex-grow space-y-2">
          {bulletPoints.map((point, index) => (
            <li key={index} className="flex items-start">
              <span className="text-blue-400 mr-2 mt-1">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
    );
};

const SourceLinks: React.FC<{ sources: GroundingSource[] }> = ({ sources }) => {
    if (!sources || sources.length === 0) return null;

    return (
        <div className="mt-6 bg-gray-800/60 p-6 rounded-xl border border-gray-700">
            <div className="flex items-center mb-3">
                <LinkIcon className="h-6 w-6 text-gray-400" />
                <h4 className="text-lg font-semibold ml-2 text-gray-300">情報源</h4>
            </div>
            <ul className="space-y-2">
                {sources.map((source, index) => (
                    <li key={index}>
                        <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-500 hover:underline truncate block text-sm transition-colors">
                            {source.web.title || source.web.uri}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ data, sources, ticker, canQuestionAnalysis = false, onQuestionAnalysis }) => {
  const { priceInfo, technicalAnalysis, fundamentalAnalysis, overallJudgement, questionAnswer } = data;

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Price Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        {priceInfo ? (
            <>
                <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700 hover:bg-gray-700/60 transition-colors">
                    <p className="text-sm text-gray-400">現在値</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(priceInfo.price, ticker)}</p>
                </div>
                <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700 hover:bg-gray-700/60 transition-colors">
                    <p className="text-sm text-gray-400">前日比</p>
                    <p className={`text-2xl font-bold ${priceInfo.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{formatPercentage(priceInfo.change)}</p>
                </div>
                <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700 hover:bg-gray-700/60 transition-colors">
                    <p className="text-sm text-gray-400">高値</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(priceInfo.dayHigh, ticker)}</p>
                </div>
                <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700 hover:bg-gray-700/60 transition-colors">
                    <p className="text-sm text-gray-400">安値</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(priceInfo.dayLow, ticker)}</p>
                </div>
            </>
        ) : (
            [...Array(4)].map((_, i) => <div key={i} className="bg-gray-800/60 p-4 rounded-lg border border-gray-700 h-[88px] animate-pulse"></div>)
        )}
      </div>

      {/* Main Analysis Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnalysisSection icon={<ChartBarIcon className="h-8 w-8 text-blue-400"/>} title="テクニカル分析" score={technicalAnalysis?.score} summary={technicalAnalysis?.summary} />
          <AnalysisSection icon={<BookOpenIcon className="h-8 w-8 text-blue-400"/>} title="ファンダメンタル分析" score={fundamentalAnalysis?.score} summary={fundamentalAnalysis?.summary} />
        </div>
        <div className="lg:col-span-2">
            {technicalAnalysis && fundamentalAnalysis ? (
                 <IntuitiveScoreDisplay technicalScore={technicalAnalysis.score} fundamentalScore={fundamentalAnalysis.score} />
            ): (
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 shadow-2xl">
                    <h3 className="text-xl font-bold text-gray-200 mb-6 text-center">総合評価</h3>
                    <div className="space-y-6 animate-pulse">
                        <div className="h-16 bg-gray-700 rounded"></div>
                        <div className="h-16 bg-gray-700 rounded"></div>
                        <div className="h-20 bg-gray-700 rounded"></div>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Overall Judgement */}
       {overallJudgement ? (
        <div className="bg-gray-800/60 p-6 rounded-xl border border-gray-700">
            <div className="flex flex-col md:flex-row items-start md:items-center">
                <div className="flex items-center mb-4 md:mb-0">
                    <ScaleIcon className="h-8 w-8 text-blue-400"/>
                    <h3 className="text-xl font-bold ml-3 text-gray-200">総合判断</h3>
                </div>
                <span className={`ml-auto text-lg font-bold px-4 py-1 rounded-full ${getDecisionClass(overallJudgement.decision)}`}>{overallJudgement.decision}</span>
            </div>
            <ul className="text-gray-400 leading-relaxed mt-4 space-y-2">
              {overallJudgement.summary.split(/[。．]/).filter(point => point.trim().length > 0).map((point, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-400 mr-2 mt-1">•</span>
                  <span>{point.trim()}</span>
                </li>
              ))}
            </ul>
        </div>
      ) : (
        <div className="bg-gray-800/60 p-6 rounded-xl border border-gray-700 h-32 animate-pulse"></div>
      )}

      {/* Question Answer */}
      {questionAnswer && (
        <div className="bg-gray-800/60 p-6 rounded-xl border border-gray-700">
          <h4 className="text-lg font-semibold mb-2 text-gray-300">質問への回答</h4>
          <p className="text-gray-400 leading-relaxed">{questionAnswer}</p>
        </div>
      )}

      {canQuestionAnalysis && data && Object.keys(data).length > 0 && (
        <div className="bg-gray-800/60 p-6 rounded-xl border border-gray-700">
          <h4 className="text-lg font-semibold mb-4 text-gray-300">分析結果について質問する</h4>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="分析結果について質問してください..."
              className="flex-1 bg-gray-900/70 border border-gray-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim() && onQuestionAnalysis) {
                  onQuestionAnalysis(e.currentTarget.value.trim());
                  e.currentTarget.value = '';
                }
              }}
            />
            <button 
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                if (input && input.value.trim() && onQuestionAnalysis) {
                  onQuestionAnalysis(input.value.trim());
                  input.value = '';
                }
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              質問する
            </button>
          </div>
        </div>
      )}

      <SourceLinks sources={sources} />
      
      {/* Enhanced Disclaimer */}
      <div className="bg-red-900/20 border border-red-700/50 p-6 rounded-xl">
        <h4 className="text-lg font-bold text-red-400 mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          重要な免責事項
        </h4>
        <ul className="text-red-300 text-sm space-y-2 leading-relaxed">
          <li className="flex items-start">
            <span className="text-red-400 mr-2 mt-1">•</span>
            <span><strong>投資判断の責任:</strong> 本分析結果は情報提供のみを目的としており、投資の勧誘や助言ではありません。最終的な投資判断はお客様ご自身の責任で行ってください。</span>
          </li>
          <li className="flex items-start">
            <span className="text-red-400 mr-2 mt-1">•</span>
            <span><strong>損失リスク:</strong> 株式投資には元本割れのリスクがあります。投資額以上の損失が発生する可能性があることを十分ご理解ください。</span>
          </li>
          <li className="flex items-start">
            <span className="text-red-400 mr-2 mt-1">•</span>
            <span><strong>情報の正確性:</strong> 分析に使用される情報は第三者から取得したものであり、その正確性や完全性を保証するものではありません。</span>
          </li>
          <li className="flex items-start">
            <span className="text-red-400 mr-2 mt-1">•</span>
            <span><strong>AI分析の限界:</strong> 本分析はAIによる自動生成であり、市場の急激な変化や予期せぬ事象を完全に予測することはできません。</span>
          </li>
          <li className="flex items-start">
            <span className="text-red-400 mr-2 mt-1">•</span>
            <span><strong>過去実績と将来:</strong> 過去の実績や分析結果は将来の投資成果を保証するものではありません。</span>
          </li>
          <li className="flex items-start">
            <span className="text-red-400 mr-2 mt-1">•</span>
            <span><strong>専門家への相談:</strong> 重要な投資判断の際は、必ず金融の専門家や投資顧問にご相談することを強く推奨します。</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AnalysisDisplay;
