import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Sparkles, Save, Edit, Trash2 } from 'lucide-react';
import type { Task, UserStory } from '../types/story';
import { AIService } from '../services/aiService';
import i18n from '../i18n';
import { PrioritySelector, type Priority } from './PrioritySelector';

interface EnhancedStoryDetailProps {
  task: UserStory;
  storyMap?: any; // 添加故事地图上下文
  onClose: () => void;
  onUpdate: (updatedTask: UserStory) => void;
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
  structuredAcceptanceCriteria?: {
    scenario: string;
    acceptancePoint: string;
    givenWhenThen: string;
  }[];
}

const EnhancedStoryDetail: React.FC<EnhancedStoryDetailProps> = ({
  task,
  storyMap,
  onClose,
  onUpdate,
  onDelete
}) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [enhancedData, setEnhancedData] = useState<EnhancedStoryData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableData, setEditableData] = useState<EnhancedStoryData | null>(null);

  // Load cached enhanced story data
  useEffect(() => {
    const cachedStories = JSON.parse(localStorage.getItem('enhancedStories') || '{}');
    const cachedStory = cachedStories[task.id];
    if (cachedStory) {
      setEnhancedData(cachedStory);
      setEditableData(cachedStory);
    }
  }, [task.id]);

  const polishWithAI = async () => {
    setIsLoading(true);
    try {
      const aiService = AIService.getInstance();
      const enhancedStory = await aiService.enhanceStory(task as Task, storyMap);
      
      // Preserve the original priority when enhancing with AI
      const enhancedStoryWithPriority = {
        ...enhancedStory,
        priority: task.priority // Ensure priority is preserved
      };
      
      // Translate the enhanced story based on current language
      const currentLang = i18n.language;
      if (currentLang === 'zh') {
        enhancedStoryWithPriority.userStory = enhancedStoryWithPriority.userStory.replace(/As a (.+?), I want (.+?) so that (.+?)/, '作为$1，我希望$2，以便$3');
        enhancedStoryWithPriority.acceptanceCriteria = enhancedStoryWithPriority.acceptanceCriteria.map((criteria: string) => 
          criteria.replace(/Given (.+?), When (.+?), Then (.+?)/, 'Given $1，When $2，Then $3')
        );
        enhancedStoryWithPriority.definitionOfDone = enhancedStoryWithPriority.definitionOfDone.map((item: string) => {
          if (item.includes('Code is written')) return '代码已编写并通过审查';
          if (item.includes('Unit tests')) return '单元测试已实现并通过';
          if (item.includes('Integration tests')) return '集成测试已实现并通过';
          if (item.includes('Documentation')) return '文档已更新';
          if (item.includes('Feature is deployed')) return '功能已部署到测试环境';
          return item;
        });
        enhancedStoryWithPriority.technicalNotes = enhancedStoryWithPriority.technicalNotes.replace(
          'This feature requires proper error handling, logging, and monitoring.',
          '此功能需要适当的错误处理、日志记录和监控。'
        );
        enhancedStoryWithPriority.businessValue = enhancedStoryWithPriority.businessValue.replace(
          'This feature will improve user experience and increase operational efficiency',
          '此功能将改善用户体验并提高运营效率'
        );
        enhancedStoryWithPriority.dependencies = enhancedStoryWithPriority.dependencies.map((dep: string) => {
          if (dep.includes('User authentication')) return '用户认证系统';
          if (dep.includes('Database schema')) return '数据库架构更新';
          if (dep.includes('API endpoint')) return 'API端点开发';
          return dep;
        });
        enhancedStoryWithPriority.assumptions = enhancedStoryWithPriority.assumptions.map((assumption: string) => {
          if (assumption.includes('Users have basic')) return '用户具备基本技术知识';
          if (assumption.includes('System has sufficient')) return '系统具备足够的性能容量';
          if (assumption.includes('No major infrastructure')) return '无需重大基础设施变更';
          return assumption;
        });
        enhancedStoryWithPriority.constraints = enhancedStoryWithPriority.constraints.map((constraint: string) => {
          if (constraint.includes('existing system architecture')) return '必须在现有系统架构内工作';
          if (constraint.includes('Budget and timeline')) return '预算和时间限制适用';
          if (constraint.includes('security policies')) return '必须遵守安全政策';
          return constraint;
        });
        enhancedStoryWithPriority.risks = enhancedStoryWithPriority.risks.map((risk: string) => {
          if (risk.includes('performance impact')) return '可能对现有功能产生性能影响';
          if (risk.includes('User adoption')) return '用户采用可能比预期慢';
          if (risk.includes('Integration complexity')) return '与现有系统的集成复杂性';
          return risk;
        });
        enhancedStoryWithPriority.testCases = enhancedStoryWithPriority.testCases.map((testCase: string) => {
          if (testCase.includes('successful completion')) return '测试主要工作流程的成功完成';
          if (testCase.includes('error handling')) return '测试无效输入的错误处理';
          if (testCase.includes('performance under normal')) return '测试正常负载下的性能';
          if (testCase.includes('integration with dependent')) return '测试与依赖系统的集成';
          return testCase;
        });
      }
      
      setEnhancedData(enhancedStoryWithPriority);
      setEditableData(enhancedStoryWithPriority);
      
      // Cache the enhanced story
      const cachedStories = JSON.parse(localStorage.getItem('enhancedStories') || '{}');
      cachedStories[task.id] = enhancedStoryWithPriority;
      localStorage.setItem('enhancedStories', JSON.stringify(cachedStories));
    } catch (error) {
      console.error('Failed to enhance story:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (editableData) {
      const updatedTask: UserStory = {
        ...task,
        description: editableData.userStory,
        acceptanceCriteria: editableData.acceptanceCriteria
      };
      
      // Update cache with edited data
      const cachedStories = JSON.parse(localStorage.getItem('enhancedStories') || '{}');
      cachedStories[task.id] = editableData;
      localStorage.setItem('enhancedStories', JSON.stringify(cachedStories));
      
      setEnhancedData(editableData);
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
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b bg-white sticky top-0 z-10">
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

        {/* Content - Scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
            <p className="text-gray-600 mb-3">{task.description}</p>
            
            {/* Status and Priority Section */}
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">状态:</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  task.status === 'done' ? 'bg-green-100 text-green-800' :
                  task.status === 'in-progress' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {task.status === 'done' ? '已完成' : 
                   task.status === 'in-progress' ? '进行中' : '待开始'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">优先级:</span>
                <PrioritySelector
                  priority={task.priority}
                  onPriorityChange={(newPriority) => {
                    const updatedTask = { ...task, priority: newPriority };
                    onUpdate(updatedTask);
                  }}
                />
              </div>
            </div>

            {/* Original Acceptance Criteria */}
            {task.acceptanceCriteria && task.acceptanceCriteria.length > 0 && !enhancedData && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2 text-gray-800">验收标准</h4>
                <ul className="list-disc list-inside space-y-1">
                  {task.acceptanceCriteria.map((criteria, index) => (
                    <li key={index} className="text-sm text-gray-700">{criteria}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Supporting Requirements */}
            {task.supportingRequirements && task.supportingRequirements.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold mb-2 text-gray-800">支撑性需求</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {task.supportingRequirements.map((req, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 p-3 rounded-md border border-gray-200 hover:border-blue-300 cursor-pointer transition-colors"
                      onClick={() => {
                        // 触发支撑性需求详情显示
                        const event = new CustomEvent('showSupportingRequirement', {
                          detail: req
                        });
                        window.dispatchEvent(event);
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-800">{req.title}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          req.priority === 'high' ? 'bg-red-100 text-red-800' :
                          req.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {req.priority === 'high' ? '高' : 
                           req.priority === 'medium' ? '中' : '低'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                          {req.type === 'software_dependency' ? '软件依赖' :
                           req.type === 'service_integration' ? '服务集成' :
                           req.type === 'security_compliance' ? '安全合规' : '性能需求'}
                        </span>
                        {req.technical_specs && (
                          <span className="text-xs text-gray-500">
                            {req.technical_specs.sdk_name && `${req.technical_specs.sdk_name}`}
                            {req.technical_specs.integration_type && ` • ${req.technical_specs.integration_type}`}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Data */}
          {enhancedData && (
            <div className="space-y-6">
              {/* User Story */}
              <div>
                <h4 className="font-semibold mb-2">{t('storyDetail.userStory')}</h4>
                <div className="bg-gray-50 p-4 rounded-md">
                  {isEditing && editableData ? (
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-sm">{t('storyDetail.asA')}</span>
                        <input
                          type="text"
                          value={editableData.userStory}
                          onChange={(e) => {
                            const updated = { ...editableData };
                            updated.userStory = e.target.value;
                            setEditableData(updated);
                          }}
                          className="w-full mt-1 px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Complete user story..."
                        />
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm">
                        <span className="font-medium">{t('storyDetail.asA')}</span> {enhancedData.userStory.includes('作为') ? 
                          enhancedData.userStory.split('作为')[1]?.split('，我希望')[0]?.trim() || enhancedData.userStory.split('As a')[1]?.split('I want')[0]?.trim() || '' :
                          enhancedData.userStory.split('As a')[1]?.split('I want')[0]?.trim() || ''}
                      </p>
                      <p className="text-sm mt-1">
                        <span className="font-medium">{t('storyDetail.iWant')}</span> {enhancedData.userStory.includes('我希望') ? 
                          enhancedData.userStory.split('，我希望')[1]?.split('，以便')[0]?.trim() || enhancedData.userStory.split('I want')[1]?.split('so that')[0]?.trim() || '' :
                          enhancedData.userStory.split('I want')[1]?.split('so that')[0]?.trim() || ''}
                      </p>
                      <p className="text-sm mt-1">
                        <span className="font-medium">{t('storyDetail.soThat')}</span> {enhancedData.userStory.includes('以便') ? 
                          enhancedData.userStory.split('，以便')[1]?.trim() || enhancedData.userStory.split('so that')[1]?.trim() || '' :
                          enhancedData.userStory.split('so that')[1]?.trim() || ''}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Acceptance Criteria */}
              <div>
                <h4 className="font-semibold mb-2">{t('storyDetail.acceptanceCriteria')}</h4>
                {isEditing && editableData ? (
                  <div className="space-y-2 mb-4">
                    {editableData.acceptanceCriteria.map((criteria, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-sm text-gray-500 mt-1">•</span>
                        <input
                          type="text"
                          value={criteria}
                          onChange={(e) => {
                            const updated = { ...editableData };
                            updated.acceptanceCriteria[index] = e.target.value;
                            setEditableData(updated);
                          }}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Acceptance criteria..."
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="list-disc list-inside space-y-1 mb-4">
                    {enhancedData.acceptanceCriteria.map((criteria, index) => (
                      <li key={index} className="text-sm text-gray-700">{criteria}</li>
                    ))}
                  </ul>
                )}
                
                {/* Structured Acceptance Criteria Table */}
                {enhancedData.structuredAcceptanceCriteria && enhancedData.structuredAcceptanceCriteria.length > 0 && (
                  <div className="mt-6">
                    <h5 className="font-semibold mb-3 text-gray-800">{t('storyDetail.structuredAcceptanceCriteria')}</h5>
                    <div className="overflow-x-auto">
                      <table className="min-w-full border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">场景</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">验收点</th>
                            <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">Given-When-Then</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white">
                          {enhancedData.structuredAcceptanceCriteria.map((criteria, index) => (
                            <tr key={index} className="border-b">
                              <td className="px-4 py-2 text-sm text-gray-700">
                                {isEditing && editableData ? (
                                  <input
                                    type="text"
                                    value={editableData.structuredAcceptanceCriteria?.[index]?.scenario || ''}
                                    onChange={(e) => {
                                      const updated = { ...editableData };
                                      if (updated.structuredAcceptanceCriteria) {
                                        updated.structuredAcceptanceCriteria[index].scenario = e.target.value;
                                        setEditableData(updated);
                                      }
                                    }}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  />
                                ) : (
                                  criteria.scenario
                                )}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-700">
                                {isEditing && editableData ? (
                                  <input
                                    type="text"
                                    value={editableData.structuredAcceptanceCriteria?.[index]?.acceptancePoint || ''}
                                    onChange={(e) => {
                                      const updated = { ...editableData };
                                      if (updated.structuredAcceptanceCriteria) {
                                        updated.structuredAcceptanceCriteria[index].acceptancePoint = e.target.value;
                                        setEditableData(updated);
                                      }
                                    }}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  />
                                ) : (
                                  criteria.acceptancePoint
                                )}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-700">
                                {isEditing && editableData ? (
                                  <textarea
                                    value={editableData.structuredAcceptanceCriteria?.[index]?.givenWhenThen || ''}
                                    onChange={(e) => {
                                      const updated = { ...editableData };
                                      if (updated.structuredAcceptanceCriteria) {
                                        updated.structuredAcceptanceCriteria[index].givenWhenThen = e.target.value;
                                        setEditableData(updated);
                                      }
                                    }}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm resize-none"
                                    rows={2}
                                  />
                                ) : (
                                  criteria.givenWhenThen
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    

                  </div>
                )}
              </div>

              {/* Definition of Done */}
              <div>
                <h4 className="font-semibold mb-2">{t('storyDetail.definitionOfDone')}</h4>
                {isEditing && editableData ? (
                  <div className="space-y-2">
                    {editableData.definitionOfDone.map((item, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-sm text-gray-500 mt-1">•</span>
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const updated = { ...editableData };
                            updated.definitionOfDone[index] = e.target.value;
                            setEditableData(updated);
                          }}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Definition of Done item..."
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="list-disc list-inside space-y-1">
                    {enhancedData.definitionOfDone.map((item, index) => (
                      <li key={index} className="text-sm text-gray-700">{item}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Technical Notes */}
              <div>
                <h4 className="font-semibold mb-2">{t('storyDetail.technicalNotes')}</h4>
                {isEditing && editableData ? (
                  <textarea
                    value={editableData.technicalNotes}
                    onChange={(e) => {
                      const updated = { ...editableData };
                      updated.technicalNotes = e.target.value;
                      setEditableData(updated);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
                    rows={3}
                    placeholder="Technical notes..."
                  />
                ) : (
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md">
                    {enhancedData.technicalNotes}
                  </p>
                )}
              </div>

              {/* Business Value */}
              <div>
                <h4 className="font-semibold mb-2">{t('storyDetail.businessValue')}</h4>
                {isEditing && editableData ? (
                  <input
                    type="text"
                    value={editableData.businessValue}
                    onChange={(e) => {
                      const updated = { ...editableData };
                      updated.businessValue = e.target.value;
                      setEditableData(updated);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Business value..."
                  />
                ) : (
                  <p className="text-sm text-gray-700">{enhancedData.businessValue}</p>
                )}
              </div>

              {/* Story Points */}
              <div>
                <h4 className="font-semibold mb-2">{t('storyDetail.storyPoints')}</h4>
                {isEditing && editableData ? (
                  <input
                    type="number"
                    value={editableData.storyPoints}
                    onChange={(e) => {
                      const updated = { ...editableData };
                      updated.storyPoints = parseInt(e.target.value) || 0;
                      setEditableData(updated);
                    }}
                    className="w-24 px-3 py-1 border border-gray-300 rounded-md text-sm"
                    min="1"
                    max="13"
                  />
                ) : (
                  <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {enhancedData.storyPoints} points
                  </span>
                )}
              </div>

              {/* Dependencies */}
              <div>
                <h4 className="font-semibold mb-2">{t('storyDetail.dependencies')}</h4>
                {isEditing && editableData ? (
                  <div className="space-y-2">
                    {editableData.dependencies.map((dep, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-sm text-gray-500 mt-1">•</span>
                        <input
                          type="text"
                          value={dep}
                          onChange={(e) => {
                            const updated = { ...editableData };
                            updated.dependencies[index] = e.target.value;
                            setEditableData(updated);
                          }}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Dependency..."
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="list-disc list-inside space-y-1">
                    {enhancedData.dependencies.map((dep, index) => (
                      <li key={index} className="text-sm text-gray-700">{dep}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Assumptions */}
              <div>
                <h4 className="font-semibold mb-2">{t('storyDetail.assumptions')}</h4>
                {isEditing && editableData ? (
                  <div className="space-y-2">
                    {editableData.assumptions.map((assumption, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-sm text-gray-500 mt-1">•</span>
                        <input
                          type="text"
                          value={assumption}
                          onChange={(e) => {
                            const updated = { ...editableData };
                            updated.assumptions[index] = e.target.value;
                            setEditableData(updated);
                          }}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Assumption..."
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="list-disc list-inside space-y-1">
                    {enhancedData.assumptions.map((assumption, index) => (
                      <li key={index} className="text-sm text-gray-700">{assumption}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Constraints */}
              <div>
                <h4 className="font-semibold mb-2">{t('storyDetail.constraints')}</h4>
                {isEditing && editableData ? (
                  <div className="space-y-2">
                    {editableData.constraints.map((constraint, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-sm text-gray-500 mt-1">•</span>
                        <input
                          type="text"
                          value={constraint}
                          onChange={(e) => {
                            const updated = { ...editableData };
                            updated.constraints[index] = e.target.value;
                            setEditableData(updated);
                          }}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Constraint..."
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="list-disc list-inside space-y-1">
                    {enhancedData.constraints.map((constraint, index) => (
                      <li key={index} className="text-sm text-gray-700">{constraint}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Risks */}
              <div>
                <h4 className="font-semibold mb-2">{t('storyDetail.risks')}</h4>
                {isEditing && editableData ? (
                  <div className="space-y-2">
                    {editableData.risks.map((risk, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-sm text-gray-500 mt-1">•</span>
                        <input
                          type="text"
                          value={risk}
                          onChange={(e) => {
                            const updated = { ...editableData };
                            updated.risks[index] = e.target.value;
                            setEditableData(updated);
                          }}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Risk..."
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="list-disc list-inside space-y-1">
                    {enhancedData.risks.map((risk, index) => (
                      <li key={index} className="text-sm text-gray-700">{risk}</li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Test Cases */}
              <div>
                <h4 className="font-semibold mb-2">{t('storyDetail.testCases')}</h4>
                {isEditing && editableData ? (
                  <div className="space-y-2">
                    {editableData.testCases.map((testCase, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <span className="text-sm text-gray-500 mt-1">•</span>
                        <input
                          type="text"
                          value={testCase}
                          onChange={(e) => {
                            const updated = { ...editableData };
                            updated.testCases[index] = e.target.value;
                            setEditableData(updated);
                          }}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Test case..."
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="list-disc list-inside space-y-1">
                    {enhancedData.testCases.map((testCase, index) => (
                      <li key={index} className="text-sm text-gray-700">{testCase}</li>
                    ))}
                  </ul>
                )}
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