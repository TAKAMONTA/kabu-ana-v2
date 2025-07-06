import React from 'react';
import { AnalysisResponse, GroundingSource } from '../types';
import ScoreChart from './ScoreChart';
import { ChartBarIcon, BookOpenIcon, ScaleIcon, LinkIcon } from './icons';

interface AnalysisDisplayProps {
  data: AnalysisResponse;
  sources: GroundingSource[];
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
        <div className="space-y-2 flex-grow">
            <div className="h-4 bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
            <div className="h-4 bg-gray-700 rounded w-full"></div>
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

    return (
      <div className="bg-gray-800/60 p-6 rounded-xl border border-gray-700 h-full flex flex-col">
        <div className="flex items-center mb-4">
          {icon}
          <h3 className="text-xl font-bold ml-3 text-gray-200">{title}</h3>
          <span className="ml-auto text-2xl font-bold text-blue-400">{score}<span className="text-base">/100</span></span>
        </div>
        <p className="text-gray-400 leading-relaxed flex-grow">{summary}</p>
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

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ data, sources }) => {
  const { priceInfo, technicalAnalysis, fundamentalAnalysis, overallJudgement, questionAnswer } = data;

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Price Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        {priceInfo ? (
            <>
                <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700">
                    <p className="text-sm text-gray-400">現在値</p>
                    <p className="text-2xl font-bold text-white">{priceInfo.price}</p>
                </div>
                <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700">
                    <p className="text-sm text-gray-400">前日比</p>
                    <p className={`text-2xl font-bold ${priceInfo.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{priceInfo.change}</p>
                </div>
                <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700">
                    <p className="text-sm text-gray-400">高値</p>
                    <p className="text-2xl font-bold text-white">{priceInfo.dayHigh}</p>
                </div>
                <div className="bg-gray-800/60 p-4 rounded-lg border border-gray-700">
                    <p className="text-sm text-gray-400">安値</p>
                    <p className="text-2xl font-bold text-white">{priceInfo.dayLow}</p>
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
        <div className="lg:col-span-2 bg-gray-800/60 p-6 rounded-xl border border-gray-700 flex flex-col justify-center items-center">
            <h3 className="text-xl font-bold mb-4 text-gray-200">スコアバランス</h3>
            {technicalAnalysis && fundamentalAnalysis ? (
                 <ScoreChart technicalScore={technicalAnalysis.score} fundamentalScore={fundamentalAnalysis.score} />
            ): (
                <div className="w-full h-64 md:h-80 flex items-center justify-center animate-pulse">
                    <div className="w-48 h-48 bg-gray-700 rounded-full"></div>
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
            <p className="text-gray-400 leading-relaxed mt-4">{overallJudgement.summary}</p>
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

      <SourceLinks sources={sources} />
    </div>
  );
};

export default AnalysisDisplay;
