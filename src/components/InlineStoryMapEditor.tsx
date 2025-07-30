import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { StoryMap, Epic, Feature, UserStory } from '../types/story';

interface InlineStoryMapEditorProps {
  storyMap: StoryMap;
  onUpdate: (updatedStoryMap: StoryMap) => void;
  onClose: () => void;
}

export const InlineStoryMapEditor: React.FC<InlineStoryMapEditorProps> = ({ storyMap, onUpdate, onClose }) => {
  const { t } = useTranslation();
  const [currentStoryMap, setCurrentStoryMap] = useState<StoryMap>({ ...storyMap });
  const [editingElement, setEditingElement] = useState<{
    type: 'epic' | 'feature' | 'task';
    epicIndex: number;
    featureIndex?: number;
    taskIndex?: number;
    field: 'title' | 'description';
  } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{
    type: 'epic' | 'feature' | 'task';
    epicIndex: number;
    featureIndex?: number;
    taskIndex?: number;
  } | null>(null);

  const handleInlineEdit = (type: 'epic' | 'feature' | 'task', epicIndex: number, field: 'title' | 'description', featureIndex?: number, taskIndex?: number) => {
    setEditingElement({ type, epicIndex, featureIndex, taskIndex, field });
  };

  const handleSaveEdit = (value: string) => {
    if (!editingElement) return;

    const { type, epicIndex, featureIndex, taskIndex, field } = editingElement;
    const updatedStoryMap = { ...currentStoryMap };
    const updatedEpics = [...updatedStoryMap.epics];

    if (type === 'epic') {
      updatedEpics[epicIndex] = { ...updatedEpics[epicIndex], [field]: value };
    } else if (type === 'feature') {
      updatedEpics[epicIndex].features[featureIndex!] = { 
        ...updatedEpics[epicIndex].features[featureIndex!], 
        [field]: value 
      };
    } else {
      updatedEpics[epicIndex].features[featureIndex!].tasks[taskIndex!] = { 
        ...updatedEpics[epicIndex].features[featureIndex!].tasks[taskIndex!], 
        [field]: value 
      };
    }

    setCurrentStoryMap({ ...updatedStoryMap, epics: updatedEpics });
    setEditingElement(null);
  };

  const handleAddEpic = () => {
    const newEpic: Epic = {
      id: `epic-${Date.now()}`,
      title: '新阶段',
      description: '新阶段描述',
      features: [],
      order: currentStoryMap.epics.length
    };
    setCurrentStoryMap({
      ...currentStoryMap,
      epics: [...currentStoryMap.epics, newEpic]
    });
  };

  const handleAddFeature = (epicIndex: number) => {
    const newFeature: Feature = {
      id: `feature-${Date.now()}`,
      title: '新活动',
      description: '新活动描述',
      tasks: [],
      order: currentStoryMap.epics[epicIndex].features.length
    };
    const updatedEpics = [...currentStoryMap.epics];
    updatedEpics[epicIndex].features.push(newFeature);
    setCurrentStoryMap({ ...currentStoryMap, epics: updatedEpics });
  };

  const handleAddTask = (epicIndex: number, featureIndex: number) => {
    const newTask: UserStory = {
      id: `task-${Date.now()}`,
      title: '新任务',
      description: '新任务描述',
      priority: 'medium',
      estimatedEffort: '2 days',
      acceptanceCriteria: [],
      status: 'todo',
      type: 'task',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updatedEpics = [...currentStoryMap.epics];
    updatedEpics[epicIndex].features[featureIndex].tasks.push(newTask);
    setCurrentStoryMap({ ...currentStoryMap, epics: updatedEpics });
  };

  const handleDeleteElement = (type: 'epic' | 'feature' | 'task', epicIndex: number, featureIndex?: number, taskIndex?: number) => {
    setShowDeleteConfirm({ type, epicIndex, featureIndex, taskIndex });
  };

  const confirmDelete = () => {
    if (!showDeleteConfirm) return;

    const { type, epicIndex, featureIndex, taskIndex } = showDeleteConfirm;
    const updatedEpics = [...currentStoryMap.epics];

    if (type === 'epic') {
      updatedEpics.splice(epicIndex, 1);
    } else if (type === 'feature') {
      updatedEpics[epicIndex].features.splice(featureIndex!, 1);
    } else {
      updatedEpics[epicIndex].features[featureIndex!].tasks.splice(taskIndex!, 1);
    }

    setCurrentStoryMap({ ...currentStoryMap, epics: updatedEpics });
    setShowDeleteConfirm(null);
  };

  const handleSave = () => {
    onUpdate(currentStoryMap);
  };

  const renderEditableText = (
    text: string,
    type: 'epic' | 'feature' | 'task',
    epicIndex: number,
    field: 'title' | 'description',
    className: string,
    featureIndex?: number,
    taskIndex?: number
  ) => {
    const isEditing = editingElement && 
      editingElement.type === type && 
      editingElement.epicIndex === epicIndex && 
      editingElement.featureIndex === featureIndex && 
      editingElement.taskIndex === taskIndex && 
      editingElement.field === field;

    if (isEditing) {
      return (
        <div className="flex items-center space-x-2">
          <input
            type="text"
            defaultValue={text}
            className={`${className} border border-blue-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            onBlur={(e) => handleSaveEdit(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSaveEdit(e.currentTarget.value);
              }
            }}
            autoFocus
          />
          <button
            onClick={() => setEditingElement(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center group">
        <span className={className}>{text}</span>
        <button
                     onClick={() => handleInlineEdit(type, epicIndex, field, featureIndex, taskIndex)}
          className="ml-2 opacity-0 group-hover:opacity-100 text-blue-600 hover:text-blue-800 transition-opacity"
        >
          <Edit className="w-3 h-3" />
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-900">内联编辑故事地图</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {t('storyMap.save')}
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-12 gap-4 min-w-max">
            {/* Labels */}
            <div className="col-span-2 space-y-4">
              <div className="h-16 flex items-center font-medium text-gray-700">阶段</div>
              <div className="h-16 flex items-center font-medium text-gray-700">活动</div>
              <div className="h-16 flex items-center font-medium text-gray-700">触点</div>
              <div className="h-16 flex items-center font-medium text-gray-700">用户故事</div>
              <div className="h-16 flex items-center font-medium text-gray-700">支撑性需求</div>
            </div>

            {/* Epics */}
            {currentStoryMap.epics.map((epic, epicIndex) => (
              <div key={epic.id} className="col-span-2 border border-gray-200 rounded-lg p-4 bg-blue-50">
                <div className="flex items-center justify-between mb-2">
                                     {renderEditableText(
                     epic.title,
                     'epic',
                     epicIndex,
                     'title',
                     'font-medium text-gray-900'
                   )}
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleAddFeature(epicIndex)}
                      className="text-green-600 hover:text-green-800"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteElement('epic', epicIndex)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                                 {renderEditableText(
                   epic.description,
                   'epic',
                   epicIndex,
                   'description',
                   'text-sm text-gray-600'
                 )}

                {/* Features */}
                <div className="mt-4 space-y-3">
                  {epic.features.map((feature, featureIndex) => (
                    <div key={feature.id} className="border border-gray-200 rounded p-3 bg-green-50">
                      <div className="flex items-center justify-between mb-2">
                                                 {renderEditableText(
                           feature.title,
                           'feature',
                           epicIndex,
                           'title',
                           'font-medium text-gray-800',
                           featureIndex
                         )}
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleAddTask(epicIndex, featureIndex)}
                            className="text-green-600 hover:text-green-800"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteElement('feature', epicIndex, featureIndex)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                                             {renderEditableText(
                         feature.description,
                         'feature',
                         epicIndex,
                         'description',
                         'text-xs text-gray-600',
                         featureIndex
                       )}

                      {/* Tasks */}
                      <div className="mt-2 space-y-2">
                        {feature.tasks.map((task, taskIndex) => (
                          <div key={task.id} className="border border-gray-200 rounded p-2 bg-purple-50">
                            <div className="flex items-center justify-between">
                                                           {renderEditableText(
                               task.title,
                               'task',
                               epicIndex,
                               'title',
                               'text-xs text-gray-700',
                               featureIndex,
                               taskIndex
                             )}
                              <button
                                onClick={() => handleDeleteElement('task', epicIndex, featureIndex, taskIndex)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                                                         {renderEditableText(
                               task.description,
                               'task',
                               epicIndex,
                               'description',
                               'text-xs text-gray-500',
                               featureIndex,
                               taskIndex
                             )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Add Epic Button */}
            <div className="col-span-2 flex items-center justify-center">
              <button
                onClick={handleAddEpic}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                添加阶段
              </button>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4">
              <div className="flex items-center p-4 border-b">
                <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">{t('storyMap.confirmDelete')}</h3>
              </div>

              <div className="p-4">
                <p className="text-gray-700">{t('storyMap.deleteConfirmMessage')}</p>
              </div>

              <div className="flex items-center justify-end space-x-3 p-4 border-t">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {t('storyMap.cancel')}
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  {t('storyMap.deleteElement')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 