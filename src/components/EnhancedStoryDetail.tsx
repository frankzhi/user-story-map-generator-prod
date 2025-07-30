import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Sparkles, Save, Edit, Trash2 } from 'lucide-react';
import type { Task } from '../types/story';
import { AIService } from '../services/aiService';

interface EnhancedStoryDetailProps {
  task: Task;
  onClose: () => void;
  onUpdate: (updatedTask: Task) => void;
  onDelete: () => void;
}

interface EnhancedStoryData {
  userStory: string;
  acceptanceCriteria: string[];
  definitionOfDone: string[];
  technicalNotes: string;
  businessValue: string;
  storyPoints: number;
  dependencies: string[];
  assumptions: string[];
  constraints: string[];
  risks: string[];
  testCases: string[];
}

const EnhancedStoryDetail: React.FC<EnhancedStoryDetailProps> = ({
  task,
  onClose,
  onUpdate,
  onDelete
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [enhancedData, setEnhancedData] = useState<EnhancedStoryData | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const polishWithAI = async () => {
    setIsLoading(true);
    try {
      const aiService = AIService.getInstance();
      const enhancedStory = await aiService.enhanceStory(task);
      setEnhancedData(enhancedStory);
    } catch (error) {
      console.error('Failed to enhance story:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (enhancedData) {
      const updatedTask: Task = {
        ...task,
        description: enhancedData.userStory,
        acceptanceCriteria: enhancedData.acceptanceCriteria,
        // Add enhanced data to task metadata
        metadata: {
          ...task.metadata,
          enhancedData
        }
      };
      onUpdate(updatedTask);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm(t('storyDetail.deleteConfirm'))) {
      onDelete();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {t('storyDetail.title')}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={polishWithAI}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? t('storyDetail.generating') : t('storyDetail.polishWithAI')}</span>
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 text-gray-600 hover:text-gray-800"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-red-600 hover:text-red-800"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
            <p className="text-gray-600">{task.description}</p>
          </div>

          {/* Enhanced Data */}
          {enhancedData && (
            <div className="space-y-6">
              {/* User Story */}
              <div>
                <h4 className="font-semibold mb-2">{t('storyDetail.userStory')}</h4>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm">
                    <span className="font-medium">{t('storyDetail.asA')}</span> {enhancedData.userStory.split('As a')[1]?.split('I want')[0]?.trim() || ''}
                  </p>
                  <p className="text-sm mt-1">
                    <span className="font-medium">{t('storyDetail.iWant')}</span> {enhancedData.userStory.split('I want')[1]?.split('so that')[0]?.trim() || ''}
                  </p>
                  <p className="text-sm mt-1">
                    <span className="font-medium">{t('storyDetail.soThat')}</span> {enhancedData.userStory.split('so that')[1]?.trim() || ''}
                  </p>
                </div>
              </div>

              {/* Acceptance Criteria */}
              <div>
                <h4 className="font-semibold mb-2">{t('storyDetail.acceptanceCriteria')}</h4>
                <ul className="list-disc list-inside space-y-1">
                  {enhancedData.acceptanceCriteria.map((criteria, index) => (
                    <li key={index} className="text-sm text-gray-700">{criteria}</li>
                  ))}
                </ul>
              </div>

              {/* Definition of Done */}
              <div>
                <h4 className="font-semibold mb-2">{t('storyDetail.definitionOfDone')}</h4>
                <ul className="list-disc list-inside space-y-1">
                  {enhancedData.definitionOfDone.map((item, index) => (
                    <li key={index} className="text-sm text-gray-700">{item}</li>
                  ))}
                </ul>
              </div>

              {/* Technical Notes */}
              <div>
                <h4 className="font-semibold mb-2">{t('storyDetail.technicalNotes')}</h4>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                  {enhancedData.technicalNotes}
                </p>
              </div>

              {/* Business Value */}
              <div>
                <h4 className="font-semibold mb-2">{t('storyDetail.businessValue')}</h4>
                <p className="text-sm text-gray-700">{enhancedData.businessValue}</p>
              </div>

              {/* Story Points */}
              <div>
                <h4 className="font-semibold mb-2">{t('storyDetail.storyPoints')}</h4>
                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {enhancedData.storyPoints} points
                </span>
              </div>

              {/* Dependencies */}
              <div>
                <h4 className="font-semibold mb-2">{t('storyDetail.dependencies')}</h4>
                <ul className="list-disc list-inside space-y-1">
                  {enhancedData.dependencies.map((dep, index) => (
                    <li key={index} className="text-sm text-gray-700">{dep}</li>
                  ))}
                </ul>
              </div>

              {/* Assumptions */}
              <div>
                <h4 className="font-semibold mb-2">{t('storyDetail.assumptions')}</h4>
                <ul className="list-disc list-inside space-y-1">
                  {enhancedData.assumptions.map((assumption, index) => (
                    <li key={index} className="text-sm text-gray-700">{assumption}</li>
                  ))}
                </ul>
              </div>

              {/* Constraints */}
              <div>
                <h4 className="font-semibold mb-2">{t('storyDetail.constraints')}</h4>
                <ul className="list-disc list-inside space-y-1">
                  {enhancedData.constraints.map((constraint, index) => (
                    <li key={index} className="text-sm text-gray-700">{constraint}</li>
                  ))}
                </ul>
              </div>

              {/* Risks */}
              <div>
                <h4 className="font-semibold mb-2">{t('storyDetail.risks')}</h4>
                <ul className="list-disc list-inside space-y-1">
                  {enhancedData.risks.map((risk, index) => (
                    <li key={index} className="text-sm text-gray-700">{risk}</li>
                  ))}
                </ul>
              </div>

              {/* Test Cases */}
              <div>
                <h4 className="font-semibold mb-2">{t('storyDetail.testCases')}</h4>
                <ul className="list-disc list-inside space-y-1">
                  {enhancedData.testCases.map((testCase, index) => (
                    <li key={index} className="text-sm text-gray-700">{testCase}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Save Button */}
          {enhancedData && isEditing && (
            <div className="flex justify-end pt-4 border-t">
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Save className="w-4 h-4" />
                <span>{t('common.save')}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedStoryDetail; 