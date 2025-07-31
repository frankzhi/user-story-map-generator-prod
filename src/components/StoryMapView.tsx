import React, { useState } from 'react';
import { ArrowLeft, Download, Eye, User, CheckCircle, Clock, Info, MapPin, Smartphone, CreditCard, Car, MessageSquare, Edit } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { StoryMap, UserStory, Task } from '../types/story';
import EnhancedStoryDetail from './EnhancedStoryDetail';
import { InlineStoryMapEditor } from './InlineStoryMapEditor';
import { FeedbackModal } from './FeedbackModal';

interface StoryMapViewProps {
  storyMap: StoryMap;
  onBack: () => void;
}

export const StoryMapView: React.FC<StoryMapViewProps> = ({ storyMap, onBack }) => {
  const { t } = useTranslation();
  const [selectedStory, setSelectedStory] = useState<UserStory | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentStoryMap, setCurrentStoryMap] = useState<StoryMap>(storyMap);

  const handleStoryClick = (story: UserStory) => {
    setSelectedStory(story);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedStory(null);
  };

  const downloadYAML = () => {
    const yamlContent = convertToYAML(currentStoryMap);
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

  // Transform epics into hierarchical map layout
  const transformToMapLayout = () => {
    return currentStoryMap.epics.map(epic => ({
      phase: {
        title: epic.title,
        description: epic.description
      },
      activities: epic.features.map(feature => {
        // Get unique touchpoints for this activity
        const uniqueTouchpoints = Array.from(new Set(
          feature.tasks.map(task => getTouchpointForTask(task))
        )).map(touchpoint => ({ touchpoint }));
        
        // Get all user stories for this activity
        const userStories = feature.tasks.map(task => ({
          ...task,
          touchpoint: getTouchpointForTask(task),
          supportingNeeds: generateSupportingNeeds(task)
        }));
        
        // Get unique supporting needs for this activity
        const allSupportingNeeds = feature.tasks.flatMap(task => generateSupportingNeeds(task));
        const uniqueSupportingNeeds = Array.from(new Set(allSupportingNeeds)).map(need => ({
          need,
          task: feature.tasks[0] // Use first task as reference
        }));
        
        return {
          title: feature.title,
          description: feature.description,
          touchpoints: uniqueTouchpoints,
          userStories: userStories,
          supportingNeeds: uniqueSupportingNeeds
        };
      })
    }));
  };

  const getTouchpointForTask = (task: UserStory) => {
    // Generate appropriate touchpoint based on task content
    // For charging pile management app
    if (task.title.includes('充电') || task.title.includes('charging')) {
      if (task.title.includes('状态') || task.title.includes('status') || task.title.includes('监控')) {
        return '移动APP/设备状态页面';
      } else if (task.title.includes('记录') || task.title.includes('record') || task.title.includes('历史')) {
        return '移动APP/充电记录页面';
      } else if (task.title.includes('配对') || task.title.includes('pair') || task.title.includes('绑定')) {
        return '移动APP/设备管理页面';
      } else if (task.title.includes('配置') || task.title.includes('config') || task.title.includes('设置')) {
        return '移动APP/设备配置页面';
      } else if (task.title.includes('权限') || task.title.includes('permission') || task.title.includes('管理')) {
        return '移动APP/权限管理页面';
      }
    }
    // For car rental app
    else if (task.title.includes('搜索') || task.title.includes('search')) {
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
    return '移动APP/主页面';
  };

  const generateSupportingNeeds = (task: UserStory) => {
    const needs: string[] = [];
    
    const taskTitle = task.title.toLowerCase();
    const taskDescription = task.description.toLowerCase();
    
    // 根据任务内容生成具体的业务相关需求
    // 充电桩相关业务需求
    if (taskTitle.includes('充电') || taskDescription.includes('充电')) {
      if (taskTitle.includes('状态') || taskTitle.includes('监控')) {
        needs.push('开发充电桩状态监控API接口');
        needs.push('集成WebSocket实时数据推送服务');
        needs.push('建立设备故障检测机制');
        needs.push('实现充电状态实时同步');
      } else if (taskTitle.includes('记录') || taskTitle.includes('record')) {
        needs.push('设计充电记录数据库表结构');
        needs.push('开发充电历史查询API接口');
        needs.push('实现数据统计分析功能');
        needs.push('建立数据导出服务');
      } else if (taskTitle.includes('配对') || taskTitle.includes('pair')) {
        needs.push('集成蓝牙BLE通信协议');
        needs.push('开发设备配对验证API接口');
        needs.push('实现设备安全认证机制');
        needs.push('建立设备管理平台');
      } else if (taskTitle.includes('配置') || taskTitle.includes('config')) {
        needs.push('开发设备参数设置API接口');
        needs.push('集成设备配置同步服务');
        needs.push('实现配置版本管理');
        needs.push('建立配置变更审计');
      } else if (taskTitle.includes('权限') || taskTitle.includes('permission')) {
        needs.push('开发用户权限管理API接口');
        needs.push('集成权限验证中间件服务');
        needs.push('实现角色权限分配机制');
        needs.push('建立权限变更通知');
      } else if (taskTitle.includes('电量') || taskTitle.includes('统计')) {
        needs.push('开发电量数据采集API接口');
        needs.push('集成数据可视化图表库');
        needs.push('实现电量数据统计分析');
        needs.push('建立数据导出CSV服务');
      } else if (taskTitle.includes('地图') || taskTitle.includes('位置')) {
        needs.push('集成高德地图API服务');
        needs.push('开发地理位置搜索接口');
        needs.push('实现实时位置更新');
        needs.push('建立位置缓存机制');
      } else if (taskTitle.includes('用户') || taskTitle.includes('登录')) {
        needs.push('开发用户认证API接口');
        needs.push('集成第三方登录服务');
        needs.push('实现用户信息管理');
        needs.push('建立用户会话管理');
      } else if (taskTitle.includes('通知') || taskTitle.includes('消息')) {
        needs.push('集成推送通知服务');
        needs.push('开发消息管理API接口');
        needs.push('实现消息模板管理');
        needs.push('建立消息发送队列');
      }
    }
    // 租车相关业务需求
    else if (taskTitle.includes('租车') || taskTitle.includes('car') || taskDescription.includes('租车')) {
      if (taskTitle.includes('搜索') || taskTitle.includes('search')) {
        needs.push('开发车辆搜索API接口');
        needs.push('集成Elasticsearch搜索引擎');
        needs.push('实现地理位置搜索');
        needs.push('建立搜索历史记录');
      } else if (taskTitle.includes('预订') || taskTitle.includes('booking')) {
        needs.push('开发订单管理API接口');
        needs.push('集成库存管理系统');
        needs.push('实现预订冲突检测');
        needs.push('建立订单状态跟踪');
      } else if (taskTitle.includes('支付') || taskTitle.includes('payment')) {
        needs.push('集成微信支付API接口');
        needs.push('开发订单支付状态同步服务');
        needs.push('实现支付安全验证');
        needs.push('建立退款处理机制');
      } else if (taskTitle.includes('取车') || taskTitle.includes('pickup')) {
        needs.push('开发取车验证API接口');
        needs.push('集成车辆状态管理系统');
        needs.push('实现取车码验证');
        needs.push('建立车辆交接流程');
      }
    }
    // 包充满App相关业务需求
    else if (taskTitle.includes('充电站') || taskTitle.includes('station') || taskDescription.includes('充电站')) {
      needs.push('集成地图服务API');
      needs.push('开发充电站搜索接口');
      needs.push('实现实时可用性查询');
      needs.push('建立充电站评价系统');
    } else if (taskTitle.includes('预约') || taskTitle.includes('reservation')) {
      needs.push('开发预约管理API');
      needs.push('集成时间槽位管理');
      needs.push('实现预约冲突检测');
      needs.push('建立预约提醒服务');
    } else if (taskTitle.includes('停车') || taskTitle.includes('parking')) {
      needs.push('集成停车场管理系统');
      needs.push('开发停车费计算接口');
      needs.push('实现车位状态查询');
      needs.push('建立停车费支付服务');
    }
    
    // 如果还没有足够的业务相关需求，添加一些通用的但仍然是业务相关的技术需求
    if (needs.length < 3) {
      const businessTechnicalNeeds = [
        '开发相关业务API接口',
        '实现数据同步机制',
        '建立业务监控告警',
        '实现业务日志记录'
      ];
      needs.push(...businessTechnicalNeeds.slice(0, 3 - needs.length));
    }
    
    // 只添加一个核心安全需求
    if (needs.length < 5) {
      needs.push('实现用户身份验证');
    }
    
    // 去重并返回，限制最多6个需求
    return [...new Set(needs)].slice(0, 6);
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

  const handleStoryMapUpdate = (updatedStoryMap: StoryMap) => {
    setCurrentStoryMap(updatedStoryMap);
    setShowEditor(false);
  };

  const handleFeedbackUpdate = (updatedStoryMap: StoryMap) => {
    setCurrentStoryMap(updatedStoryMap);
    setShowFeedback(false);
  };

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
                <h1 className="text-2xl font-bold text-gray-900">{currentStoryMap.title}</h1>
                <p className="text-gray-600 text-sm">{t('storyMap.doubleClickToEdit')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFeedback(true)}
                className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {t('storyMap.feedback')}
              </button>
              <button
                onClick={() => setShowEditor(true)}
                className="flex items-center bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                {t('storyMap.editStoryMap')}
              </button>
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
              {/* Hierarchical Map Layout with Clear Alignment */}
              <div className="overflow-x-auto">
                <div className="min-w-max">
                  {/* Phases Row */}
                  <div className="flex bg-gray-100 p-4 border-b">
                    <div className="w-24 flex-shrink-0 flex items-center justify-center font-semibold text-gray-700 bg-gray-200 rounded-l-lg">
                      {t('storyMap.phases')}
                    </div>
                    <div className="flex-1 flex">
                      {mapLayout.map((phaseGroup, phaseIndex) => {
                        // Calculate total width for this phase based on its activities
                        const totalActivities = phaseGroup.activities.length;
                        const phaseWidth = Math.max(250, totalActivities * 150); // Reduced minimum width and per-activity width
                        
                        return (
                          <div
                            key={phaseIndex}
                            className="bg-blue-600 text-white px-6 py-4 rounded-lg text-center font-semibold flex-shrink-0 border-r border-blue-500"
                            style={{ width: `${phaseWidth}px` }}
                          >
                            <div className="text-lg">{phaseGroup.phase.title}</div>
                            <div className="text-xs text-blue-100 mt-1">{phaseGroup.phase.description}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Activities Row */}
                  <div className="flex bg-gray-50 p-4 border-b">
                    <div className="w-24 flex-shrink-0 flex items-center justify-center font-semibold text-gray-700 bg-gray-200 rounded-l-lg">
                      {t('storyMap.activities')}
                    </div>
                    <div className="flex-1 flex">
                      {mapLayout.map((phaseGroup, phaseIndex) => {
                        const totalActivities = phaseGroup.activities.length;
                        const phaseWidth = Math.max(250, totalActivities * 150);
                        const activityWidth = phaseWidth / totalActivities;
                        
                        return (
                          <div key={phaseIndex} className="flex" style={{ width: `${phaseWidth}px` }}>
                            {phaseGroup.activities.map((activity, activityIndex) => (
                              <div
                                key={activityIndex}
                                className="bg-blue-500 text-white px-3 py-2 rounded-md text-sm font-medium text-center flex-shrink-0 border-r border-blue-400"
                                style={{ width: `${activityWidth}px` }}
                              >
                                <div className="text-sm">{activity.title}</div>
                                <div className="text-xs text-blue-100 mt-1">{activity.description}</div>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Touchpoints Row */}
                  <div className="flex bg-white p-4 border-b">
                    <div className="w-24 flex-shrink-0 flex items-center justify-center font-semibold text-gray-700 bg-gray-200 rounded-l-lg">
                      {t('storyMap.touchpoints')}
                    </div>
                    <div className="flex-1 flex">
                      {mapLayout.map((phaseGroup, phaseIndex) => {
                        const totalActivities = phaseGroup.activities.length;
                        const phaseWidth = Math.max(250, totalActivities * 150);
                        const activityWidth = phaseWidth / totalActivities;
                        
                        return (
                          <div key={phaseIndex} className="flex" style={{ width: `${phaseWidth}px` }}>
                            {phaseGroup.activities.map((activity, activityIndex) => (
                              <div 
                                key={activityIndex} 
                                className="flex flex-col gap-1 border-r border-gray-200"
                                style={{ width: `${activityWidth}px` }}
                              >
                                {activity.touchpoints.map((item, touchpointIndex) => (
                                  <div
                                    key={touchpointIndex}
                                    className="bg-white border border-gray-200 rounded-md p-2 shadow-sm flex-shrink-0 mx-1"
                                  >
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                        {t('storyMap.potentialCustomer')}
                                      </span>
                                      {getTouchpointIcon(item.touchpoint)}
                                    </div>
                                    <p className="text-xs text-gray-700">{item.touchpoint}</p>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* User Stories Row */}
                  <div className="flex bg-white p-4 border-b">
                    <div className="w-24 flex-shrink-0 flex items-center justify-center font-semibold text-gray-700 bg-gray-200 rounded-l-lg">
                      {t('storyMap.userStories')}
                    </div>
                    <div className="flex-1 flex">
                      {mapLayout.map((phaseGroup, phaseIndex) => {
                        const totalActivities = phaseGroup.activities.length;
                        const phaseWidth = Math.max(250, totalActivities * 150);
                        const activityWidth = phaseWidth / totalActivities;
                        
                        return (
                          <div key={phaseIndex} className="flex" style={{ width: `${phaseWidth}px` }}>
                            {phaseGroup.activities.map((activity, activityIndex) => (
                              <div 
                                key={activityIndex} 
                                className="flex flex-col gap-1 border-r border-gray-200"
                                style={{ width: `${activityWidth}px` }}
                              >
                                {activity.userStories.map((story, storyIndex) => (
                                  <div
                                    key={storyIndex}
                                    className="story-card cursor-pointer bg-white border border-gray-200 rounded-md p-2 shadow-sm hover:shadow-md transition-shadow flex-shrink-0 mx-1"
                                    onClick={() => handleStoryClick(story)}
                                  >
                                    <div className="flex items-start justify-between mb-1">
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
                        );
                      })}
                    </div>
                  </div>

                  {/* Supporting Needs Row */}
                  <div className="flex bg-white p-4">
                    <div className="w-24 flex-shrink-0 flex items-center justify-center font-semibold text-gray-700 bg-gray-200 rounded-l-lg">
                      {t('storyMap.supportingNeeds')}
                    </div>
                    <div className="flex-1 flex">
                      {mapLayout.map((phaseGroup, phaseIndex) => {
                        const totalActivities = phaseGroup.activities.length;
                        const phaseWidth = Math.max(250, totalActivities * 150);
                        const activityWidth = phaseWidth / totalActivities;
                        
                        return (
                          <div key={phaseIndex} className="flex" style={{ width: `${phaseWidth}px` }}>
                            {phaseGroup.activities.map((activity, activityIndex) => (
                              <div 
                                key={activityIndex} 
                                className="flex flex-col gap-1 border-r border-gray-200"
                                style={{ width: `${activityWidth}px` }}
                              >
                                {activity.supportingNeeds.map((item, needIndex) => (
                                  <div
                                    key={needIndex}
                                    className="bg-white border border-gray-200 rounded-md p-2 shadow-sm flex-shrink-0 mx-1"
                                  >
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                        {t('storyMap.supportingNeed')}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-700">{item.need}</p>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
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
          storyMap={currentStoryMap}
          onClose={closeModal}
          onUpdate={(updatedTask) => {
            // Update the story in the story map
            const updatedStoryMap = { ...currentStoryMap };
            updatedStoryMap.epics = updatedStoryMap.epics.map(epic => ({
              ...epic,
              features: epic.features.map(feature => ({
                ...feature,
                tasks: feature.tasks.map(task => 
                  task.id === updatedTask.id ? updatedTask as UserStory : task
                )
              }))
            }));
            setCurrentStoryMap(updatedStoryMap);
            closeModal();
          }}
          onDelete={() => {
            // Handle story deletion
            closeModal();
          }}
        />
      )}

      {/* Story Map Editor Modal */}
      {showEditor && (
        <InlineStoryMapEditor
          storyMap={currentStoryMap}
          onUpdate={handleStoryMapUpdate}
          onClose={() => setShowEditor(false)}
        />
      )}

      {/* Feedback Modal */}
      {showFeedback && (
        <FeedbackModal
          storyMap={currentStoryMap}
          onClose={() => setShowFeedback(false)}
          onUpdate={handleFeedbackUpdate}
        />
      )}
    </div>
  );
}; 