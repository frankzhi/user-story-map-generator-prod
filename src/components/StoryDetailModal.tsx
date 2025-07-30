import React from 'react';
import { X, Calendar, User, Target, Clock } from 'lucide-react';
import type { UserStory } from '../types/story';

interface StoryDetailModalProps {
  story: UserStory;
  onClose: () => void;
}

export const StoryDetailModal: React.FC<StoryDetailModalProps> = ({ story, onClose }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'todo':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="story-detail-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{story.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Story Details */}
        <div className="space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">{story.description}</p>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <Target className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <span className="text-sm text-gray-500">Priority</span>
                <div className="flex items-center mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(story.priority)}`}>
                    {story.priority}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <Clock className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <span className="text-sm text-gray-500">Estimated Effort</span>
                <p className="text-gray-900 font-medium">{story.estimatedEffort}</p>
              </div>
            </div>

            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <span className="text-sm text-gray-500">Status</span>
                <div className="flex items-center mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(story.status)}`}>
                    {story.status}
                  </span>
                </div>
              </div>
            </div>

            {story.assignee && (
              <div className="flex items-center">
                <User className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <span className="text-sm text-gray-500">Assignee</span>
                  <p className="text-gray-900 font-medium">{story.assignee}</p>
                </div>
              </div>
            )}
          </div>

          {/* Acceptance Criteria */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Acceptance Criteria</h3>
            <div className="space-y-2">
              {story.acceptanceCriteria.map((criteria, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-gray-700">{criteria}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Dependencies */}
          {story.dependencies && story.dependencies.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Dependencies</h3>
              <div className="space-y-2">
                {story.dependencies.map((dependency, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <p className="text-gray-700">{dependency}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
              <div>
                <span>Created:</span>
                <span className="ml-2 text-gray-700">
                  {new Date(story.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span>Updated:</span>
                <span className="ml-2 text-gray-700">
                  {new Date(story.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}; 