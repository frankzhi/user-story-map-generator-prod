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
    
    // 通用的功能类型识别和对应的支撑性需求
    const functionTypeNeeds = {
      // 数据相关功能
      'data': {
        keywords: ['数据', '记录', '历史', '统计', '分析', '报表', '导出', '导入', '同步', '备份'],
        needs: [
          '设计数据表结构',
          '开发数据查询API接口',
          '实现数据统计分析功能',
          '建立数据导出服务',
          '实现数据同步机制',
          '建立数据备份策略'
        ]
      },
      // 用户相关功能
      'user': {
        keywords: ['用户', '登录', '注册', '认证', '权限', '角色', '个人', '账户', '密码'],
        needs: [
          '开发用户认证API接口',
          '集成第三方登录服务',
          '实现用户信息管理',
          '建立用户会话管理',
          '开发权限控制接口',
          '实现角色权限分配'
        ]
      },
      // 搜索相关功能
      'search': {
        keywords: ['搜索', '查找', '查询', '筛选', '过滤', '排序', '推荐'],
        needs: [
          '开发搜索API接口',
          '集成搜索引擎服务',
          '实现智能推荐算法',
          '建立搜索历史记录',
          '实现搜索结果缓存',
          '开发搜索建议功能'
        ]
      },
      // 支付相关功能
      'payment': {
        keywords: ['支付', '付款', '订单', '交易', '发票', '退款', '结算', '账单'],
        needs: [
          '集成支付网关服务',
          '开发订单管理API接口',
          '实现支付状态同步',
          '建立退款处理机制',
          '开发发票生成服务',
          '实现交易安全验证'
        ]
      },
      // 通知相关功能
      'notification': {
        keywords: ['通知', '消息', '提醒', '推送', '邮件', '短信', '公告'],
        needs: [
          '集成推送通知服务',
          '开发消息管理API接口',
          '实现消息模板管理',
          '建立消息发送队列',
          '实现消息状态跟踪',
          '开发消息过滤机制'
        ]
      },
      // 地图位置相关功能
      'location': {
        keywords: ['地图', '位置', '地址', '导航', '定位', '地理', '坐标'],
        needs: [
          '集成地图服务API',
          '开发地理位置搜索接口',
          '实现实时位置更新',
          '建立位置缓存机制',
          '开发路径规划服务',
          '实现地理围栏功能'
        ]
      },
      // 文件上传下载功能
      'file': {
        keywords: ['文件', '上传', '下载', '图片', '视频', '文档', '附件'],
        needs: [
          '开发文件上传API接口',
          '集成云存储服务',
          '实现文件格式验证',
          '建立文件访问控制',
          '开发文件压缩服务',
          '实现文件预览功能'
        ]
      },
      // 实时通信功能
      'realtime': {
        keywords: ['实时', '直播', '聊天', '消息', 'socket', '推送', '在线'],
        needs: [
          '集成WebSocket服务',
          '开发实时通信API接口',
          '实现消息推送机制',
          '建立连接状态管理',
          '开发消息历史记录',
          '实现在线状态跟踪'
        ]
      },
      // 配置管理功能
      'config': {
        keywords: ['配置', '设置', '参数', '选项', '偏好', '自定义'],
        needs: [
          '开发配置管理API接口',
          '实现配置版本控制',
          '建立配置变更审计',
          '开发配置同步服务',
          '实现配置模板管理',
          '建立配置备份机制'
        ]
      },
      // 监控告警功能
      'monitor': {
        keywords: ['监控', '告警', '状态', '性能', '日志', '错误', '故障'],
        needs: [
          '建立系统监控服务',
          '开发告警通知机制',
          '实现性能指标收集',
          '建立日志分析系统',
          '开发故障诊断工具',
          '实现监控面板展示'
        ]
      }
    };
    
    // 根据任务内容识别功能类型并生成相应的支撑性需求
    const matchedTypes: string[] = [];
    
    for (const [type, config] of Object.entries(functionTypeNeeds)) {
      const hasKeyword = config.keywords.some(keyword => 
        taskTitle.includes(keyword) || taskDescription.includes(keyword)
      );
      if (hasKeyword) {
        matchedTypes.push(type);
        // 为每个匹配的功能类型添加2-3个相关需求
        const selectedNeeds = config.needs.slice(0, 3);
        needs.push(...selectedNeeds);
      }
    }
    
    // 如果没有匹配到特定功能类型，根据任务的一般性质生成需求
    if (matchedTypes.length === 0) {
      // 分析任务的一般性质
      if (taskTitle.includes('管理') || taskDescription.includes('管理')) {
        needs.push('开发管理后台API接口');
        needs.push('实现数据管理功能');
        needs.push('建立操作审计日志');
      } else if (taskTitle.includes('查看') || taskDescription.includes('查看')) {
        needs.push('开发数据展示API接口');
        needs.push('实现数据缓存机制');
        needs.push('建立访问权限控制');
      } else if (taskTitle.includes('创建') || taskDescription.includes('创建')) {
        needs.push('开发数据创建API接口');
        needs.push('实现数据验证机制');
        needs.push('建立创建权限控制');
      } else if (taskTitle.includes('编辑') || taskDescription.includes('编辑')) {
        needs.push('开发数据编辑API接口');
        needs.push('实现数据变更追踪');
        needs.push('建立编辑权限控制');
      } else if (taskTitle.includes('删除') || taskDescription.includes('删除')) {
        needs.push('开发数据删除API接口');
        needs.push('实现软删除机制');
        needs.push('建立删除权限控制');
      } else {
        // 通用业务需求
        needs.push('开发相关业务API接口');
        needs.push('实现数据持久化服务');
        needs.push('建立业务逻辑处理');
      }
    }
    
    // 添加核心安全需求（如果还没有的话）
    if (!needs.some(need => need.includes('认证') || need.includes('权限'))) {
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