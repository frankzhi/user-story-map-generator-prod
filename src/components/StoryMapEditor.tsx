import React, { useState } from 'react';
import { X, Plus, Edit, Trash2, Save, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { StoryMap, Epic, Feature, UserStory } from '../types/story';

interface StoryMapEditorProps {
  storyMap: StoryMap;
  onSave: (updatedStoryMap: StoryMap) => void;
  onClose: () => void;
}

export const StoryMapEditor: React.FC<StoryMapEditorProps> = ({ storyMap, onSave, onClose }) => {
  const { t } = useTranslation();
  const [editedStoryMap, setEditedStoryMap] = useState<StoryMap>({ ...storyMap });
  const [editingElement, setEditingElement] = useState<{
    type: 'epic' | 'feature' | 'task';
    epicIndex?: number;
    featureIndex?: number;
    taskIndex?: number;
    data: any;
  } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{
    type: 'epic' | 'feature' | 'task';
    epicIndex?: number;
    featureIndex?: number;
    taskIndex?: number;
  } | null>(null);

  const handleAddEpic = () => {
    const newEpic: Epic = {
      id: `epic-${Date.now()}`,
      title: '',
      description: '',
      features: [],
      order: editedStoryMap.epics.length
    };
    setEditedStoryMap({
      ...editedStoryMap,
      epics: [...editedStoryMap.epics, newEpic]
    });
    setEditingElement({
      type: 'epic',
      epicIndex: editedStoryMap.epics.length,
      data: newEpic
    });
  };

  const handleAddFeature = (epicIndex: number) => {
    const newFeature: Feature = {
      id: `feature-${Date.now()}`,
      title: '',
      description: '',
      tasks: [],
      order: editedStoryMap.epics[epicIndex].features.length
    };
    const updatedEpics = [...editedStoryMap.epics];
    updatedEpics[epicIndex].features.push(newFeature);
    setEditedStoryMap({ ...editedStoryMap, epics: updatedEpics });
    setEditingElement({
      type: 'feature',
      epicIndex,
      featureIndex: updatedEpics[epicIndex].features.length - 1,
      data: newFeature
    });
  };

  const handleAddTask = (epicIndex: number, featureIndex: number) => {
    const newTask: UserStory = {
      id: `task-${Date.now()}`,
      title: '',
      description: '',
      priority: 'medium',
      estimatedEffort: '2 days',
      acceptanceCriteria: [],
      status: 'todo',
      type: 'task',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const updatedEpics = [...editedStoryMap.epics];
    updatedEpics[epicIndex].features[featureIndex].tasks.push(newTask);
    setEditedStoryMap({ ...editedStoryMap, epics: updatedEpics });
    setEditingElement({
      type: 'task',
      epicIndex,
      featureIndex,
      taskIndex: updatedEpics[epicIndex].features[featureIndex].tasks.length - 1,
      data: newTask
    });
  };

  const handleEditElement = (type: 'epic' | 'feature' | 'task', epicIndex: number, featureIndex?: number, taskIndex?: number) => {
    let data;
    if (type === 'epic') {
      data = editedStoryMap.epics[epicIndex];
    } else if (type === 'feature') {
      data = editedStoryMap.epics[epicIndex].features[featureIndex!];
    } else {
      data = editedStoryMap.epics[epicIndex].features[featureIndex!].tasks[taskIndex!];
    }
    setEditingElement({ type, epicIndex, featureIndex, taskIndex, data });
  };

  const handleDeleteElement = (type: 'epic' | 'feature' | 'task', epicIndex: number, featureIndex?: number, taskIndex?: number) => {
    setShowDeleteConfirm({ type, epicIndex, featureIndex, taskIndex });
  };

  const confirmDelete = () => {
    if (!showDeleteConfirm) return;

    const { type, epicIndex, featureIndex, taskIndex } = showDeleteConfirm;
    const updatedEpics = [...editedStoryMap.epics];

    if (type === 'epic') {
      updatedEpics.splice(epicIndex!, 1);
    } else if (type === 'feature') {
      updatedEpics[epicIndex!].features.splice(featureIndex!, 1);
    } else {
      updatedEpics[epicIndex!].features[featureIndex!].tasks.splice(taskIndex!, 1);
    }

    setEditedStoryMap({ ...editedStoryMap, epics: updatedEpics });
    setShowDeleteConfirm(null);
  };

  const handleSaveElement = () => {
    if (!editingElement) return;

    const { type, epicIndex, featureIndex, taskIndex, data } = editingElement;
    const updatedEpics = [...editedStoryMap.epics];

    if (type === 'epic') {
      updatedEpics[epicIndex!] = { ...updatedEpics[epicIndex!], ...data };
    } else if (type === 'feature') {
      updatedEpics[epicIndex!].features[featureIndex!] = { ...updatedEpics[epicIndex!].features[featureIndex!], ...data };
    } else {
      updatedEpics[epicIndex!].features[featureIndex!].tasks[taskIndex!] = { ...updatedEpics[epicIndex!].features[featureIndex!].tasks[taskIndex!], ...data };
    }

    setEditedStoryMap({ ...editedStoryMap, epics: updatedEpics });
    setEditingElement(null);
  };

  const handleSaveStoryMap = () => {
    onSave(editedStoryMap);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{t('storyMap.editStoryMap')}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Epics */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">阶段 (Epics)</h3>
              <button
                onClick={handleAddEpic}
                className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                {t('storyMap.addEpic')}
              </button>
            </div>

            {editedStoryMap.epics.map((epic, epicIndex) => (
              <div key={epic.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{epic.title || `阶段 ${epicIndex + 1}`}</h4>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditElement('epic', epicIndex)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteElement('epic', epicIndex)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Features */}
                <div className="ml-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium text-gray-700">活动 (Features)</h5>
                    <button
                      onClick={() => handleAddFeature(epicIndex)}
                      className="flex items-center px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {t('storyMap.addFeature')}
                    </button>
                  </div>

                  {epic.features.map((feature, featureIndex) => (
                    <div key={feature.id} className="border border-gray-200 rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h6 className="text-sm font-medium text-gray-800">{feature.title || `活动 ${featureIndex + 1}`}</h6>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleEditElement('feature', epicIndex, featureIndex)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteElement('feature', epicIndex, featureIndex)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Tasks */}
                      <div className="ml-4 space-y-2">
                                                 <div className="flex items-center justify-between">
                           <h6 className="text-xs font-medium text-gray-600">任务 (Tasks)</h6>
                          <button
                            onClick={() => handleAddTask(epicIndex, featureIndex)}
                            className="flex items-center px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            {t('storyMap.addTask')}
                          </button>
                        </div>

                        {feature.tasks.map((task, taskIndex) => (
                          <div key={task.id} className="border border-gray-200 rounded p-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-700">{task.title || `任务 ${taskIndex + 1}`}</span>
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => handleEditElement('task', epicIndex, featureIndex, taskIndex)}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteElement('task', epicIndex, featureIndex, taskIndex)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {t('storyMap.cancel')}
          </button>
          <button
            onClick={handleSaveStoryMap}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {t('storyMap.save')}
          </button>
        </div>

        {/* Edit Element Modal */}
        {editingElement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingElement.type === 'epic' && t('storyMap.editEpic')}
                  {editingElement.type === 'feature' && t('storyMap.editFeature')}
                  {editingElement.type === 'task' && t('storyMap.editTask')}
                </h3>
                <button
                  onClick={() => setEditingElement(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {editingElement.type === 'epic' && t('storyMap.epicTitle')}
                    {editingElement.type === 'feature' && t('storyMap.featureTitle')}
                    {editingElement.type === 'task' && t('storyMap.taskTitle')}
                  </label>
                  <input
                    type="text"
                    value={editingElement.data.title}
                    onChange={(e) => setEditingElement({
                      ...editingElement,
                      data: { ...editingElement.data, title: e.target.value }
                    })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {editingElement.type === 'epic' && t('storyMap.epicDescription')}
                    {editingElement.type === 'feature' && t('storyMap.featureDescription')}
                    {editingElement.type === 'task' && t('storyMap.taskDescription')}
                  </label>
                  <textarea
                    value={editingElement.data.description}
                    onChange={(e) => setEditingElement({
                      ...editingElement,
                      data: { ...editingElement.data, description: e.target.value }
                    })}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>

                {editingElement.type === 'task' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('storyMap.taskPriority')}
                        </label>
                        <select
                          value={editingElement.data.priority}
                          onChange={(e) => setEditingElement({
                            ...editingElement,
                            data: { ...editingElement.data, priority: e.target.value }
                          })}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="high">高</option>
                          <option value="medium">中</option>
                          <option value="low">低</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('storyMap.taskEffort')}
                        </label>
                        <input
                          type="text"
                          value={editingElement.data.estimatedEffort}
                          onChange={(e) => setEditingElement({
                            ...editingElement,
                            data: { ...editingElement.data, estimatedEffort: e.target.value }
                          })}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex items-center justify-end space-x-3 p-4 border-t">
                <button
                  onClick={() => setEditingElement(null)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  {t('storyMap.cancel')}
                </button>
                <button
                  onClick={handleSaveElement}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {t('storyMap.save')}
                </button>
              </div>
            </div>
          </div>
        )}

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