import React from 'react';
import ProgressBar from './ProgressBar';
import { CheckCircleIcon, ClockIcon } from './icons';

interface AnalysisStep {
  id: string;
  label: string;
  completed: boolean;
  current: boolean;
}

interface AnalysisProgressProps {
  steps: AnalysisStep[];
  progress: number;
}

const AnalysisProgress: React.FC<AnalysisProgressProps> = ({ steps, progress }) => {
  return (
    <div className="bg-gray-800/60 p-6 rounded-xl border border-gray-700 mb-6">
      <h3 className="text-lg font-semibold text-gray-200 mb-4">分析進行状況</h3>
      <ProgressBar progress={progress} className="mb-4" />
      <div className="space-y-2">
        {steps.map((step) => (
          <div key={step.id} className="flex items-center">
            {step.completed ? (
              <CheckCircleIcon className="h-5 w-5 text-green-400 mr-3" />
            ) : step.current ? (
              <ClockIcon className="h-5 w-5 text-blue-400 mr-3 animate-pulse" />
            ) : (
              <div className="h-5 w-5 border-2 border-gray-600 rounded-full mr-3"></div>
            )}
            <span className={`text-sm ${
              step.completed ? 'text-green-400' : 
              step.current ? 'text-blue-400' : 
              'text-gray-500'
            }`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnalysisProgress;
