import React, { useState } from 'react';
import { ArrowLeft, Download, Eye, User, CheckCircle, Clock, Info, MapPin, Smartphone, CreditCard, Car, MessageSquare, Edit } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { StoryMap, UserStory, Task } from '../types/story';
import EnhancedStoryDetail from './EnhancedStoryDetail';
import { InlineStoryMapEditor } from './InlineStoryMapEditor';
import { FeedbackModal } from './FeedbackModal';
import { PriorityBadge, PrioritySelector, type Priority } from './PrioritySelector';

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
  const [sortByPriority, setSortByPriority] = useState(true);

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
        const uniqueSupportingNeeds = allSupportingNeeds.filter((need, index, self) => 
          index === self.findIndex(n => n.need === need.need)
        );
        
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
    const needs: Array<{ need: string; priority: Priority }> = [];
    
    const taskTitle = task.title.toLowerCase();
    const taskDescription = task.description.toLowerCase();
    
    // 根据用户故事内容生成具体的业务相关支撑性需求
    // 这些需求应该提供未知的技术知识，直接支持用户故事的功能实现
    
    // 设备连接和管理相关
    if (taskTitle.includes('连接') || taskTitle.includes('设备') || taskTitle.includes('蓝牙') || taskTitle.includes('wifi') || taskDescription.includes('连接') || taskDescription.includes('设备')) {
      needs.push({ need: '实现BLE设备发现和配对协议', priority: 'high' });
      needs.push({ need: '建立Wi-Fi设备连接状态管理', priority: 'high' });
      needs.push({ need: '开发设备固件版本检测和升级机制', priority: 'medium' });
      needs.push({ need: '实现设备分组和批量管理功能', priority: 'medium' });
    }
    
    // 地图和位置服务
    if (taskTitle.includes('地图') || taskTitle.includes('位置') || taskTitle.includes('区域') || taskTitle.includes('清扫') || taskDescription.includes('地图') || taskDescription.includes('位置')) {
      needs.push({ need: '建立SLAM算法地图构建和定位系统', priority: 'high' });
      needs.push({ need: '实现地理围栏和虚拟墙技术', priority: 'high' });
      needs.push({ need: '开发路径规划和避障算法', priority: 'medium' });
      needs.push({ need: '建立地图数据压缩和同步机制', priority: 'medium' });
    }
    
    // 清扫控制相关
    if (taskTitle.includes('清扫') || taskTitle.includes('吸力') || taskTitle.includes('控制') || taskDescription.includes('清扫') || taskDescription.includes('控制')) {
      needs.push({ need: '实现多档位吸力控制系统', priority: 'high' });
      needs.push({ need: '建立清扫模式智能切换算法', priority: 'medium' });
      needs.push({ need: '开发清扫面积和效率统计', priority: 'medium' });
      needs.push({ need: '实现清扫路径优化算法', priority: 'medium' });
    }
    
    // 任务调度和计划
    if (taskTitle.includes('任务') || taskTitle.includes('计划') || taskTitle.includes('定时') || taskDescription.includes('任务') || taskDescription.includes('计划')) {
      needs.push({ need: '实现多任务优先级调度系统', priority: 'high' });
      needs.push({ need: '建立任务冲突检测和解决机制', priority: 'medium' });
      needs.push({ need: '开发任务执行状态实时监控', priority: 'medium' });
      needs.push({ need: '实现任务历史记录和回放功能', priority: 'low' });
    }
    
    // 电量管理
    if (taskTitle.includes('电量') || taskTitle.includes('电池') || taskDescription.includes('电量') || taskDescription.includes('电池')) {
      needs.push({ need: '实现电池健康度监测算法', priority: 'high' });
      needs.push({ need: '建立智能充电策略和电池保护', priority: 'high' });
      needs.push({ need: '开发电量预测和低电量提醒', priority: 'medium' });
      needs.push({ need: '实现充电桩自动对接和充电管理', priority: 'medium' });
    }
    
    // 耗材管理
    if (taskTitle.includes('耗材') || taskTitle.includes('滤网') || taskTitle.includes('边刷') || taskDescription.includes('耗材') || taskDescription.includes('滤网')) {
      needs.push({ need: '建立耗材使用量智能监测系统', priority: 'medium' });
      needs.push({ need: '实现耗材寿命预测算法', priority: 'medium' });
      needs.push({ need: '开发耗材更换提醒和购买推荐', priority: 'low' });
      needs.push({ need: '建立耗材真伪识别和防伪验证', priority: 'low' });
    }
    
    // 故障诊断和告警
    if (taskTitle.includes('故障') || taskTitle.includes('告警') || taskTitle.includes('错误') || taskDescription.includes('故障') || taskDescription.includes('告警')) {
      needs.push({ need: '实现设备故障自诊断系统', priority: 'high' });
      needs.push({ need: '建立故障代码分类和处理机制', priority: 'high' });
      needs.push({ need: '开发远程故障诊断和修复功能', priority: 'medium' });
      needs.push({ need: '实现故障预测和预防性维护', priority: 'medium' });
    }
    
    // 实时监控和状态
    if (taskTitle.includes('监控') || taskTitle.includes('状态') || taskTitle.includes('实时') || taskDescription.includes('监控') || taskDescription.includes('状态')) {
      needs.push({ need: '实现设备状态实时同步机制', priority: 'high' });
      needs.push({ need: '建立传感器数据采集和处理管道', priority: 'medium' });
      needs.push({ need: '开发设备工作模式智能识别', priority: 'medium' });
      needs.push({ need: '实现异常状态检测和自动处理', priority: 'medium' });
    }
    
    // 用户界面和交互
    if (taskTitle.includes('界面') || taskTitle.includes('显示') || taskTitle.includes('按钮') || taskDescription.includes('界面') || taskDescription.includes('显示')) {
      needs.push({ need: '实现响应式UI组件和动画效果', priority: 'medium' });
      needs.push({ need: '建立手势识别和触摸控制', priority: 'medium' });
      needs.push({ need: '开发语音控制和智能助手集成', priority: 'low' });
      needs.push({ need: '实现多语言界面和本地化支持', priority: 'low' });
    }
    
    // 数据同步和备份
    if (taskTitle.includes('同步') || taskTitle.includes('备份') || taskTitle.includes('数据') || taskDescription.includes('同步') || taskDescription.includes('备份')) {
      needs.push({ need: '实现云端数据同步和冲突解决', priority: 'high' });
      needs.push({ need: '建立本地数据加密和隐私保护', priority: 'high' });
      needs.push({ need: '开发数据迁移和版本兼容性', priority: 'medium' });
      needs.push({ need: '实现多设备数据一致性保证', priority: 'medium' });
    }
    
    // 安全和隐私
    if (taskTitle.includes('安全') || taskTitle.includes('隐私') || taskTitle.includes('加密') || taskDescription.includes('安全') || taskDescription.includes('隐私')) {
      needs.push({ need: '实现设备身份认证和授权机制', priority: 'high' });
      needs.push({ need: '建立数据传输加密和完整性校验', priority: 'high' });
      needs.push({ need: '开发用户隐私数据保护策略', priority: 'medium' });
      needs.push({ need: '实现安全审计和合规性检查', priority: 'medium' });
    }
    
    // 如果没有匹配到特定功能，根据任务内容生成更具体的需求
    if (needs.length === 0) {
      // 分析任务的具体内容，生成相关的技术需求
      if (taskTitle.includes('验证') || taskTitle.includes('status') || taskDescription.includes('验证') || taskDescription.includes('status')) {
        needs.push({ need: '实现用户状态验证和权限检查机制', priority: 'high' });
        needs.push({ need: '建立会员等级和权益管理系统', priority: 'medium' });
        needs.push({ need: '开发实时状态同步和缓存策略', priority: 'medium' });
      } else if (taskTitle.includes('引导') || taskTitle.includes('guide') || taskDescription.includes('引导') || taskDescription.includes('guide')) {
        needs.push({ need: '实现用户引导流程和进度跟踪', priority: 'medium' });
        needs.push({ need: '建立新手教程和帮助文档系统', priority: 'low' });
        needs.push({ need: '开发个性化引导和推荐算法', priority: 'medium' });
      } else if (taskTitle.includes('更新') || taskTitle.includes('update') || taskDescription.includes('更新') || taskDescription.includes('update')) {
        needs.push({ need: '实现数据变更追踪和版本控制', priority: 'high' });
        needs.push({ need: '建立用户信息验证和更新机制', priority: 'medium' });
        needs.push({ need: '开发实时数据同步和冲突解决', priority: 'medium' });
      } else if (taskTitle.includes('重置') || taskTitle.includes('reset') || taskDescription.includes('重置') || taskDescription.includes('reset')) {
        needs.push({ need: '实现安全密码重置和验证流程', priority: 'high' });
        needs.push({ need: '建立多因子身份验证机制', priority: 'high' });
        needs.push({ need: '开发密码强度检测和安全策略', priority: 'medium' });
      } else if (taskTitle.includes('过滤') || taskTitle.includes('filter') || taskDescription.includes('过滤') || taskDescription.includes('filter')) {
        needs.push({ need: '实现智能搜索和过滤算法', priority: 'high' });
        needs.push({ need: '建立多维度数据索引和查询优化', priority: 'medium' });
        needs.push({ need: '开发实时过滤和动态排序功能', priority: 'medium' });
      } else if (taskTitle.includes('显示') || taskTitle.includes('show') || taskDescription.includes('显示') || taskDescription.includes('show')) {
        needs.push({ need: '实现数据展示和可视化组件', priority: 'medium' });
        needs.push({ need: '建立数据缓存和加载优化机制', priority: 'medium' });
        needs.push({ need: '开发响应式界面和用户体验优化', priority: 'low' });
      } else if (taskTitle.includes('组织') || taskTitle.includes('organize') || taskDescription.includes('组织') || taskDescription.includes('organize')) {
        needs.push({ need: '实现数据分类和标签管理系统', priority: 'medium' });
        needs.push({ need: '建立智能推荐和排序算法', priority: 'medium' });
        needs.push({ need: '开发批量操作和批量管理功能', priority: 'low' });
      } else if (taskTitle.includes('突出') || taskTitle.includes('highlight') || taskDescription.includes('突出') || taskDescription.includes('highlight')) {
        needs.push({ need: '实现优先级显示和突出展示机制', priority: 'medium' });
        needs.push({ need: '建立时间敏感内容管理系统', priority: 'medium' });
        needs.push({ need: '开发智能提醒和过期处理功能', priority: 'low' });
      } else if (taskTitle.includes('积分') || taskTitle.includes('points') || taskDescription.includes('积分') || taskDescription.includes('points')) {
        needs.push({ need: '实现积分计算和兑换规则引擎', priority: 'high' });
        needs.push({ need: '建立积分历史记录和审计系统', priority: 'medium' });
        needs.push({ need: '开发积分过期和清理机制', priority: 'low' });
      } else if (taskTitle.includes('兑换') || taskTitle.includes('redeem') || taskDescription.includes('兑换') || taskDescription.includes('redeem')) {
        needs.push({ need: '实现权益兑换和库存管理系统', priority: 'high' });
        needs.push({ need: '建立兑换验证和防欺诈机制', priority: 'high' });
        needs.push({ need: '开发兑换流程和状态跟踪', priority: 'medium' });
      } else if (taskTitle.includes('通知') || taskTitle.includes('notify') || taskDescription.includes('通知') || taskDescription.includes('notify')) {
        needs.push({ need: '实现多渠道消息推送系统', priority: 'high' });
        needs.push({ need: '建立消息模板和个性化引擎', priority: 'medium' });
        needs.push({ need: '开发消息发送状态跟踪和重试机制', priority: 'medium' });
      } else if (taskTitle.includes('管理') || taskTitle.includes('manage') || taskDescription.includes('管理') || taskDescription.includes('manage')) {
        needs.push({ need: '实现用户偏好设置和个性化配置', priority: 'medium' });
        needs.push({ need: '建立权限控制和访问管理', priority: 'high' });
        needs.push({ need: '开发批量操作和批量管理功能', priority: 'low' });
      } else if (taskTitle.includes('发送') || taskTitle.includes('send') || taskDescription.includes('发送') || taskDescription.includes('send')) {
        needs.push({ need: '实现智能消息调度和发送引擎', priority: 'high' });
        needs.push({ need: '建立消息队列和负载均衡机制', priority: 'medium' });
        needs.push({ need: '开发消息发送失败处理和重试策略', priority: 'medium' });
      } else {
        // 根据任务标题和描述的关键词生成更具体的需求
        const keywords = [...taskTitle.split(' '), ...taskDescription.split(' ')].filter(word => word.length > 2);
        const uniqueKeywords = [...new Set(keywords)];
        
        if (uniqueKeywords.length > 0) {
          // 基于关键词生成相关的技术需求
          const keyword = uniqueKeywords[0];
          needs.push({ need: `实现${keyword}相关的业务逻辑处理`, priority: 'high' });
          needs.push({ need: `建立${keyword}数据模型和关系管理`, priority: 'medium' });
          needs.push({ need: `开发${keyword}相关的API接口和集成服务`, priority: 'medium' });
        } else {
          // 最后的fallback，生成通用的但更具体的需求
          needs.push({ need: '实现核心业务逻辑和数据处理', priority: 'high' });
          needs.push({ need: '建立数据持久化和缓存机制', priority: 'medium' });
          needs.push({ need: '开发用户界面和交互功能', priority: 'low' });
        }
      }
    }
    
    // 去重并返回，限制最多6个需求
    return needs.slice(0, 6);
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

  const sortByPriorityOrder = (a: UserStory, b: UserStory) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  };

  const handlePriorityChange = (taskId: string, newPriority: Priority) => {
    const updatedStoryMap = { ...currentStoryMap };
    
    updatedStoryMap.epics = updatedStoryMap.epics.map(epic => ({
      ...epic,
      features: epic.features.map(feature => ({
        ...feature,
        tasks: feature.tasks.map(task => 
          task.id === taskId ? { ...task, priority: newPriority } : task
        )
      }))
    }));
    
    setCurrentStoryMap(updatedStoryMap);
  };

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
              <label className="flex items-center space-x-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={sortByPriority}
                  onChange={(e) => setSortByPriority(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>按优先级排序</span>
              </label>
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
                                {(sortByPriority ? activity.userStories.sort(sortByPriorityOrder) : activity.userStories).map((story, storyIndex) => {
                                  const getPriorityBorderColor = (priority: Priority) => {
                                    switch (priority) {
                                      case 'high':
                                        return 'border-red-400';
                                      case 'medium':
                                        return 'border-yellow-400';
                                      case 'low':
                                        return 'border-green-400';
                                      default:
                                        return 'border-gray-200';
                                    }
                                  };

                                  return (
                                    <div
                                      key={storyIndex}
                                      className={`story-card cursor-pointer bg-white border-2 ${getPriorityBorderColor(story.priority)} rounded-md p-2 shadow-sm hover:shadow-md transition-shadow flex-shrink-0 mx-1`}
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
                                  );
                                })}
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
                                {(sortByPriority ? activity.supportingNeeds.sort((a, b) => {
                                  const priorityOrder = { high: 3, medium: 2, low: 1 };
                                  return priorityOrder[b.priority] - priorityOrder[a.priority];
                                }) : activity.supportingNeeds).map((item, needIndex) => {
                                  const getPriorityBorderColor = (priority: Priority) => {
                                    switch (priority) {
                                      case 'high':
                                        return 'border-red-400';
                                      case 'medium':
                                        return 'border-yellow-400';
                                      case 'low':
                                        return 'border-green-400';
                                      default:
                                        return 'border-gray-200';
                                    }
                                  };

                                  return (
                                    <div
                                      key={needIndex}
                                      className={`bg-white border-2 ${getPriorityBorderColor(item.priority)} rounded-md p-2 shadow-sm flex-shrink-0 mx-1`}
                                    >
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                          {t('storyMap.supportingNeed')}
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-700">{item.need}</p>
                                    </div>
                                  );
                                })}
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