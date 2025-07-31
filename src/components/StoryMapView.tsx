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
    
    // 根据用户故事内容生成具体的业务相关支撑性需求
    // 这些需求应该直接支持用户故事的功能实现
    
    // 搜索和查询相关
    if (taskTitle.includes('搜索') || taskTitle.includes('查找') || taskDescription.includes('搜索') || taskDescription.includes('查找')) {
      needs.push('实现智能搜索算法优化');
      needs.push('建立搜索索引数据库');
      needs.push('开发搜索建议和自动完成功能');
      needs.push('实现搜索结果排序和过滤机制');
    }
    
    // 用户认证和权限
    if (taskTitle.includes('登录') || taskTitle.includes('注册') || taskTitle.includes('认证') || taskDescription.includes('登录') || taskDescription.includes('注册')) {
      needs.push('实现多因子身份验证系统');
      needs.push('建立用户权限分级管理');
      needs.push('开发第三方登录集成服务');
      needs.push('实现会话管理和安全控制');
    }
    
    // 支付和交易
    if (taskTitle.includes('支付') || taskTitle.includes('付款') || taskTitle.includes('订单') || taskDescription.includes('支付') || taskDescription.includes('订单')) {
      needs.push('实现PCI DSS合规的支付处理系统');
      needs.push('建立订单状态跟踪机制');
      needs.push('开发退款和争议处理流程');
      needs.push('实现支付安全审计和监控');
    }
    
    // 数据管理和分析
    if (taskTitle.includes('数据') || taskTitle.includes('统计') || taskTitle.includes('分析') || taskDescription.includes('数据') || taskDescription.includes('统计')) {
      needs.push('建立实时数据采集和处理管道');
      needs.push('实现数据可视化和报表生成');
      needs.push('开发数据导出和API接口');
      needs.push('建立数据备份和恢复机制');
    }
    
    // 通知和消息
    if (taskTitle.includes('通知') || taskTitle.includes('消息') || taskTitle.includes('提醒') || taskDescription.includes('通知') || taskDescription.includes('消息')) {
      needs.push('实现多渠道消息推送系统');
      needs.push('建立消息模板和个性化引擎');
      needs.push('开发消息发送状态跟踪');
      needs.push('实现消息过滤和防垃圾机制');
    }
    
    // 地图和位置服务
    if (taskTitle.includes('地图') || taskTitle.includes('位置') || taskTitle.includes('导航') || taskDescription.includes('地图') || taskDescription.includes('位置')) {
      needs.push('集成高德地图API和地理编码服务');
      needs.push('实现实时位置追踪和路径规划');
      needs.push('建立地理围栏和位置缓存机制');
      needs.push('开发位置数据分析和可视化');
    }
    
    // 文件处理
    if (taskTitle.includes('文件') || taskTitle.includes('上传') || taskTitle.includes('下载') || taskDescription.includes('文件') || taskDescription.includes('上传')) {
      needs.push('实现文件上传和云存储集成');
      needs.push('建立文件格式验证和安全扫描');
      needs.push('开发文件压缩和优化处理');
      needs.push('实现文件访问权限控制');
    }
    
    // 实时通信
    if (taskTitle.includes('实时') || taskTitle.includes('聊天') || taskTitle.includes('直播') || taskDescription.includes('实时') || taskDescription.includes('聊天')) {
      needs.push('实现WebSocket实时通信服务');
      needs.push('建立消息队列和推送机制');
      needs.push('开发在线状态和用户活跃度跟踪');
      needs.push('实现消息历史记录和搜索');
    }
    
    // 配置和设置
    if (taskTitle.includes('配置') || taskTitle.includes('设置') || taskTitle.includes('参数') || taskDescription.includes('配置') || taskDescription.includes('设置')) {
      needs.push('实现配置管理和版本控制');
      needs.push('建立配置变更审计和回滚机制');
      needs.push('开发配置模板和批量操作');
      needs.push('实现配置同步和备份策略');
    }
    
    // 监控和告警
    if (taskTitle.includes('监控') || taskTitle.includes('告警') || taskTitle.includes('状态') || taskDescription.includes('监控') || taskDescription.includes('告警')) {
      needs.push('建立系统性能监控和指标收集');
      needs.push('实现智能告警和故障诊断');
      needs.push('开发监控面板和报表展示');
      needs.push('建立日志分析和异常检测');
    }
    
    // 管理功能
    if (taskTitle.includes('管理') || taskDescription.includes('管理')) {
      needs.push('实现管理后台和权限控制');
      needs.push('建立操作审计和日志记录');
      needs.push('开发数据导入导出和批量操作');
      needs.push('实现系统配置和参数管理');
    }
    
    // 查看和展示
    if (taskTitle.includes('查看') || taskTitle.includes('显示') || taskDescription.includes('查看') || taskDescription.includes('显示')) {
      needs.push('实现数据展示和可视化组件');
      needs.push('建立数据缓存和加载优化');
      needs.push('开发响应式界面和用户体验优化');
      needs.push('实现数据分页和搜索过滤');
    }
    
    // 创建和添加
    if (taskTitle.includes('创建') || taskTitle.includes('添加') || taskDescription.includes('创建') || taskDescription.includes('添加')) {
      needs.push('实现数据验证和业务规则检查');
      needs.push('建立创建权限和审批流程');
      needs.push('开发数据关联和依赖处理');
      needs.push('实现创建成功通知和状态更新');
    }
    
    // 编辑和修改
    if (taskTitle.includes('编辑') || taskTitle.includes('修改') || taskDescription.includes('编辑') || taskDescription.includes('修改')) {
      needs.push('实现数据变更追踪和版本控制');
      needs.push('建立编辑权限和并发控制');
      needs.push('开发数据同步和冲突解决');
      needs.push('实现变更通知和状态同步');
    }
    
    // 删除和移除
    if (taskTitle.includes('删除') || taskTitle.includes('移除') || taskDescription.includes('删除') || taskDescription.includes('移除')) {
      needs.push('实现软删除和数据归档机制');
      needs.push('建立删除权限和确认流程');
      needs.push('开发关联数据清理和依赖处理');
      needs.push('实现删除审计和恢复机制');
    }
    
    // 如果没有匹配到特定功能，生成通用的业务相关需求
    if (needs.length === 0) {
      needs.push('实现核心业务逻辑处理');
      needs.push('建立数据持久化和缓存机制');
      needs.push('开发API接口和前端交互');
      needs.push('实现用户权限和访问控制');
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