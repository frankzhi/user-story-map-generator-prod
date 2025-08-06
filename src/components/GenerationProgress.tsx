import React from 'react';
import { useTranslation } from 'react-i18next';

interface GenerationProgressProps {
  isVisible: boolean;
  currentStep: string;
  progress: number;
}

export const GenerationProgress: React.FC<GenerationProgressProps> = ({
  isVisible,
  currentStep,
  progress
}) => {
  const { t } = useTranslation();

  if (!isVisible) return null;

  const steps = [
    { key: 'initializing', label: t('progress.initializing'), progress: 10 },
    { key: 'connecting', label: t('progress.connecting'), progress: 25 },
    { key: 'generating', label: t('progress.generating'), progress: 60 },
    { key: 'processing', label: t('progress.processing'), progress: 85 },
    { key: 'finalizing', label: t('progress.finalizing'), progress: 100 }
  ];

  const currentStepData = steps.find(step => step.key === currentStep) || steps[0];
  const currentProgress = Math.min(progress, currentStepData.progress);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center mb-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {t('progress.generatingStoryMap')}
          </h3>
          <p className="text-gray-600 text-sm">
            {currentStepData.label}
          </p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{t('progress.progress')}</span>
            <span>{Math.round(currentProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${currentProgress}%` }}
            ></div>
          </div>
        </div>

        <div className="space-y-2">
          {steps.map((step, index) => (
            <div 
              key={step.key}
              className={`flex items-center text-sm ${
                step.key === currentStep 
                  ? 'text-blue-600 font-medium' 
                  : index < steps.findIndex(s => s.key === currentStep)
                    ? 'text-green-600'
                    : 'text-gray-400'
              }`}
            >
              <div className={`w-4 h-4 rounded-full mr-3 flex items-center justify-center ${
                step.key === currentStep
                  ? 'bg-blue-600 text-white'
                  : index < steps.findIndex(s => s.key === currentStep)
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300'
              }`}>
                {step.key === currentStep ? (
                  <div className="animate-spin rounded-full h-2 w-2 border-b border-white"></div>
                ) : index < steps.findIndex(s => s.key === currentStep) ? (
                  <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              {step.label}
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            {t('progress.pleaseWait')}
          </p>
        </div>
      </div>
    </div>
  );
}; 