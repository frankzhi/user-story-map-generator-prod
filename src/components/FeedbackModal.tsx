import React, { useState } from 'react';
import { X, Send, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { StoryMap } from '../types/story';
import { AIService } from '../services/aiService';

interface FeedbackModalProps {
  storyMap: StoryMap;
  onClose: () => void;
  onUpdate: (updatedStoryMap: StoryMap) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ storyMap, onClose, onUpdate }) => {
  const { t } = useTranslation();
  const [feedback, setFeedback] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) return;

    setIsProcessing(true);
    try {
      const aiService = AIService.getInstance();
      
      // Simply pass the feedback and current story map to AI
      const modifiedStoryMap = await aiService.generateStoryMapWithFeedback(feedback, storyMap);
      
      // Convert the AI response back to StoryMap format
      const updatedStoryMap = aiService.convertYAMLToStoryMap(modifiedStoryMap);
      onUpdate(updatedStoryMap);
      onClose();
      
    } catch (error) {
      console.error('Error processing feedback:', error);
      alert('处理反馈时出现错误，请重试。');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{t('storyMap.feedback')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isProcessing}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('storyMap.feedbackPlaceholder')}
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={t('storyMap.feedbackPlaceholder')}
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={isProcessing}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">当前故事地图概览</h3>
            <div className="text-sm text-blue-800">
              <p><strong>标题：</strong>{storyMap.title}</p>
              <p><strong>描述：</strong>{storyMap.description}</p>
              <p><strong>阶段数量：</strong>{storyMap.epics.length}</p>
              <p><strong>总任务数量：</strong>{storyMap.epics.reduce((total, epic) => 
                total + epic.features.reduce((featureTotal, feature) => 
                  featureTotal + feature.tasks.length, 0), 0)}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={isProcessing}
          >
            {t('storyMap.cancel')}
          </button>
          <button
            onClick={handleSubmitFeedback}
            disabled={!feedback.trim() || isProcessing}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 flex items-center"
          >
            {isProcessing ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                {t('storyMap.feedbackSubmitted')}
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {t('storyMap.submitFeedback')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}; 