import React, { useState } from 'react';
import { ArrowLeft, Download, Eye, User, CheckCircle, Clock, Info, MapPin, Smartphone, CreditCard, Car } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { StoryMap, UserStory, Task } from '../types/story';
import EnhancedStoryDetail from './EnhancedStoryDetail';

interface StoryMapViewProps {
  storyMap: StoryMap;
  onBack: () => void;
}

export const StoryMapView: React.FC<StoryMapViewProps> = ({ storyMap, onBack }) => {
  const { t } = useTranslation();
  const [selectedStory, setSelectedStory] = useState<UserStory | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleStoryClick = (story: UserStory) => {
    setSelectedStory(story);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedStory(null);
  };

  const downloadYAML = () => {
    const yamlContent = convertToYAML(storyMap);
    const blob = new Blob([yamlContent], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${storyMap.title.toLowerCase().replace(/\s+/g, '-')}-story-map.yaml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const convertToYAML = (storyMap: StoryMap): string => {
    const yamlData = {
      title: storyMap.title,
      description: storyMap.description,
      epics: storyMap.epics.map(epic => ({
        title: epic.title,
        description: epic.description,
        features: epic.features.map(feature => ({
          title: feature.title,
          description: feature.description,
          tasks: feature.tasks.map(task => ({
            title: task.title,
            description: task.description,
            priority: task.priority,
            effort: task.estimatedEffort,
            acceptance_criteria: task.acceptanceCriteria
          }))
        }))
      }))
    };

    return `# ${yamlData.title}
# ${yamlData.description}

${yamlData.epics.map(epic => `## ${epic.title}
${epic.description}

${epic.features.map(feature => `### ${feature.title}
${feature.description}

${feature.tasks.map(task => `#### ${task.title}
- **Description:** ${task.description}
- **Priority:** ${task.priority}
- **Effort:** ${task.effort}
- **Acceptance Criteria:**
${task.acceptance_criteria.map(criteria => `  - ${criteria}`).join('\n')}

`).join('')}`).join('')}`).join('\n')}`;
  };

  // Transform epics into phases/activities for map layout
  const transformToMapLayout = () => {
    return storyMap.epics.map(epic => ({
      phase: epic.title,
      activities: epic.features.map(feature => ({
        title: feature.title,
        description: feature.description,
        userStories: feature.tasks.map(task => ({
          ...task,
          touchpoint: getTouchpointForTask(task),
          supportingNeeds: generateSupportingNeeds(task)
        }))
      }))
    }));
  };

  const getTouchpointForTask = (task: UserStory) => {
    // Generate appropriate touchpoint based on task content
    if (task.title.includes('搜索') || task.title.includes('search')) {
      return '微信小程序/搜索页面';
    } else if (task.title.includes('浏览') || task.title.includes('browse')) {
      return '微信小程序/车辆列表页';
    } else if (task.title.includes('预订') || task.title.includes('booking')) {
      return '微信小程序/预订页面';
    } else if (task.title.includes('支付') || task.title.includes('payment')) {
      return '微信小程序/支付页面';
    } else if (task.title.includes('取车') || task.title.includes('pickup')) {
      return '车辆服务机构端小程序/交车页面';
    } else if (task.title.includes('用车') || task.title.includes('usage')) {
      return '微信小程序/用车指南页';
    }
    return '微信小程序/主页面';
  };

  const generateSupportingNeeds = (task: UserStory) => {
    // Generate supporting needs based on task content
    const needs = [];
    if (task.title.includes('搜索') || task.title.includes('search')) {
      needs.push('实现微信小程序搜索优化');
      needs.push('建立车辆信息数据库');
    } else if (task.title.includes('预订') || task.title.includes('booking')) {
      needs.push('实现基于地理位置的服务');
      needs.push('开发预订系统API');
    } else if (task.title.includes('支付') || task.title.includes('payment')) {
      needs.push('实现PCI DSS合规的支付处理系统');
      needs.push('集成第三方支付网关');
    } else if (task.title.includes('取车') || task.title.includes('pickup')) {
      needs.push('开发微信小程序与车辆服务机构端小程序的数据同步');
      needs.push('实现车辆状态远程监控系统');
    }
    return needs.length > 0 ? needs : ['开发相关API接口', '实现数据同步机制'];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-orange-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getTouchpointIcon = (touchpoint: string) => {
    if (touchpoint.includes('搜索') || touchpoint.includes('search')) {
      return <MapPin className="w-4 h-4" />;
    } else if (touchpoint.includes('支付') || touchpoint.includes('payment')) {
      return <CreditCard className="w-4 h-4" />;
    } else if (touchpoint.includes('用车') || touchpoint.includes('car')) {
      return <Car className="w-4 h-4" />;
    }
    return <Smartphone className="w-4 h-4" />;
  };

  const mapLayout = transformToMapLayout();

  return (
    <div className="story-map-container min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={onBack}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                {t('common.back')}
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{storyMap.title}</h1>
                <p className="text-gray-600 text-sm">{t('storyMap.doubleClickToEdit')}</p>
              </div>
            </div>
            <button
              onClick={downloadYAML}
              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              {t('common.export')} YAML
            </button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Map Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4">
            <h2 className="text-xl font-semibold">{storyMap.title}</h2>
            <p className="text-blue-100 text-sm mt-1">{storyMap.description}</p>
          </div>

          {/* Map Content */}
          <div className="overflow-x-auto">
            <div className="min-w-max">
              {/* Phases Row */}
              <div className="flex bg-gray-100 p-4 border-b">
                <div className="w-24 flex-shrink-0 flex items-center justify-center font-semibold text-gray-700 bg-gray-200 rounded-l-lg">
                  {t('storyMap.phases')}
                </div>
                <div className="flex-1 grid grid-cols-12 gap-2">
                  {mapLayout.map((phase, phaseIndex) => (
                    <div
                      key={phaseIndex}
                      className="col-span-3 bg-blue-600 text-white px-4 py-3 rounded-lg text-center font-semibold"
                    >
                      {phase.phase}
                    </div>
                  ))}
                </div>
              </div>

              {/* Activities Row */}
              <div className="flex bg-gray-50 p-4 border-b">
                <div className="w-24 flex-shrink-0 flex items-center justify-center font-semibold text-gray-700 bg-gray-200 rounded-l-lg">
                  {t('storyMap.activities')}
                </div>
                <div className="flex-1 grid grid-cols-12 gap-2">
                  {mapLayout.map((phase, phaseIndex) => (
                    <div key={phaseIndex} className="col-span-3">
                      <div className="flex flex-wrap gap-2">
                        {phase.activities.map((activity, activityIndex) => (
                          <div
                            key={activityIndex}
                            className="bg-blue-500 text-white px-3 py-2 rounded-md text-sm font-medium text-center flex-shrink-0"
                          >
                            {activity.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Touchpoints Row */}
              <div className="flex bg-white p-4 border-b">
                <div className="w-24 flex-shrink-0 flex items-center justify-center font-semibold text-gray-700 bg-gray-200 rounded-l-lg">
                  {t('storyMap.touchpoints')}
                </div>
                <div className="flex-1 grid grid-cols-12 gap-2">
                  {mapLayout.map((phase, phaseIndex) => (
                    <div key={phaseIndex} className="col-span-3">
                      <div className="space-y-2">
                        {phase.activities.map((activity, activityIndex) => (
                          <div key={activityIndex} className="space-y-1">
                            {activity.userStories.map((story, storyIndex) => (
                              <div
                                key={storyIndex}
                                className="bg-white border border-gray-200 rounded-md p-2 shadow-sm"
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                    {t('storyMap.potentialCustomer')}
                                  </span>
                                  {getTouchpointIcon(story.touchpoint)}
                                </div>
                                <p className="text-xs text-gray-700">{story.touchpoint}</p>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* User Stories Row */}
              <div className="flex bg-white p-4 border-b">
                <div className="w-24 flex-shrink-0 flex items-center justify-center font-semibold text-gray-700 bg-gray-200 rounded-l-lg">
                  {t('storyMap.userStories')}
                </div>
                <div className="flex-1 grid grid-cols-12 gap-2">
                  {mapLayout.map((phase, phaseIndex) => (
                    <div key={phaseIndex} className="col-span-3">
                      <div className="space-y-2">
                        {phase.activities.map((activity, activityIndex) => (
                          <div key={activityIndex} className="space-y-1">
                            {activity.userStories.map((story, storyIndex) => (
                              <div
                                key={storyIndex}
                                className="story-card cursor-pointer bg-white border border-gray-200 rounded-md p-3 shadow-sm hover:shadow-md transition-shadow"
                                onClick={() => handleStoryClick(story)}
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <User className="w-4 h-4 text-gray-500" />
                                  {getStatusIcon(story.status)}
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  {story.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Supporting Needs Row */}
              <div className="flex bg-white p-4">
                <div className="w-24 flex-shrink-0 flex items-center justify-center font-semibold text-gray-700 bg-gray-200 rounded-l-lg">
                  {t('storyMap.supportingNeeds')}
                </div>
                <div className="flex-1 grid grid-cols-12 gap-2">
                  {mapLayout.map((phase, phaseIndex) => (
                    <div key={phaseIndex} className="col-span-3">
                      <div className="space-y-2">
                        {phase.activities.map((activity, activityIndex) => (
                          <div key={activityIndex} className="space-y-1">
                            {activity.userStories.map((story, storyIndex) => (
                              <div key={storyIndex} className="space-y-1">
                                {story.supportingNeeds.map((need, needIndex) => (
                                  <div
                                    key={needIndex}
                                    className="bg-white border border-gray-200 rounded-md p-2 shadow-sm"
                                  >
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                        {t('storyMap.supportingNeed')}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-700">{need}</p>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Story Detail Modal */}
      {showModal && selectedStory && (
        <EnhancedStoryDetail
          task={selectedStory as Task}
          onClose={closeModal}
          onUpdate={(updatedTask) => {
            // Update the story in the story map
            const updatedStoryMap = { ...storyMap };
            updatedStoryMap.epics = updatedStoryMap.epics.map(epic => ({
              ...epic,
              features: epic.features.map(feature => ({
                ...feature,
                tasks: feature.tasks.map(task => 
                  task.id === updatedTask.id ? updatedTask as UserStory : task
                )
              }))
            }));
            // You could add a callback to update the parent component
            closeModal();
          }}
          onDelete={() => {
            // Handle story deletion
            closeModal();
          }}
        />
      )}
    </div>
  );
}; 