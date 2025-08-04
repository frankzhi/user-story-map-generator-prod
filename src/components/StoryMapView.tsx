import React, { useState } from 'react';
import { ArrowLeft, Download, Eye, User, CheckCircle, Clock, Info, MapPin, Smartphone, CreditCard, Car, MessageSquare, Edit } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { StoryMap, UserStory, Task } from '../types/story';
import EnhancedStoryDetail from './EnhancedStoryDetail';
import { InlineStoryMapEditor } from './InlineStoryMapEditor';
import { FeedbackModal } from './FeedbackModal';
import { PriorityBadge, PrioritySelector, PriorityIcon, type Priority } from './PrioritySelector';

interface SupportingNeedWithAssociation {
  need: string;
  priority: Priority;
  associatedStoryId: string;
  associatedStoryTitle: string;
}

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
  const [showSupportingNeeds, setShowSupportingNeeds] = useState(() => {
    const saved = localStorage.getItem('showSupportingNeeds');
    return saved ? JSON.parse(saved) : true;
  });

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
        
        // Create supporting needs from AI-generated tasks
        const supportingNeedsWithAssociation = showSupportingNeeds ? 
          feature.tasks.map(task => ({
            need: task.title,
            priority: task.priority || 'medium',
            associatedStoryId: task.id,
            associatedStoryTitle: task.title
          })) : [];
        
        // No need to remove duplicates since these are AI-generated
        const uniqueSupportingNeeds = supportingNeedsWithAssociation;
        
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
    const taskTitle = task.title.toLowerCase();
    const taskDescription = task.description.toLowerCase();
    
    // 智能门锁应用触点
    if (taskTitle.includes('门锁') || taskTitle.includes('lock') || taskDescription.includes('门锁')) {
      if (taskTitle.includes('开锁') || taskTitle.includes('unlock') || taskTitle.includes('远程')) {
        return '移动APP/远程开锁页面';
      } else if (taskTitle.includes('状态') || taskTitle.includes('监控') || taskTitle.includes('status')) {
        return '移动APP/门锁状态页面';
      } else if (taskTitle.includes('记录') || taskTitle.includes('历史') || taskTitle.includes('record')) {
        return '移动APP/开锁记录页面';
      } else if (taskTitle.includes('设置') || taskTitle.includes('配置') || taskTitle.includes('config')) {
        return '移动APP/门锁设置页面';
      } else if (taskTitle.includes('权限') || taskTitle.includes('permission')) {
        return '移动APP/权限管理页面';
      } else if (taskTitle.includes('通知') || taskTitle.includes('notification')) {
        return '移动APP/通知设置页面';
      } else if (taskTitle.includes('日志') || taskTitle.includes('分析') || taskTitle.includes('log')) {
        return '移动APP/日志分析页面';
      }
    }
    
    // 充电桩管理应用触点 - 更具体的匹配
    else if (taskTitle.includes('充电') || taskTitle.includes('charging') || taskDescription.includes('充电')) {
      if (taskTitle.includes('固件') || taskTitle.includes('firmware') || taskTitle.includes('升级') || taskTitle.includes('update')) {
        return '移动APP/设备设置/固件升级页面';
      } else if (taskTitle.includes('配对') || taskTitle.includes('pair') || taskTitle.includes('绑定') || taskTitle.includes('bind')) {
        return '移动APP/设备管理/配对页面';
      } else if (taskTitle.includes('解绑') || taskTitle.includes('unbind') || taskTitle.includes('删除')) {
        return '移动APP/设备管理/解绑页面';
      } else if (taskTitle.includes('状态') || taskTitle.includes('status') || taskTitle.includes('监控') || taskTitle.includes('monitor')) {
        return '移动APP/设备状态/实时监控页面';
      } else if (taskTitle.includes('记录') || taskTitle.includes('record') || taskTitle.includes('历史') || taskTitle.includes('history')) {
        return '移动APP/充电记录/历史数据页面';
      } else if (taskTitle.includes('配置') || taskTitle.includes('config') || taskTitle.includes('设置') || taskTitle.includes('setting')) {
        return '移动APP/设备设置/参数配置页面';
      } else if (taskTitle.includes('权限') || taskTitle.includes('permission') || taskTitle.includes('管理') || taskTitle.includes('manage')) {
        return '移动APP/用户管理/权限设置页面';
      } else if (taskTitle.includes('通知') || taskTitle.includes('notification') || taskTitle.includes('提醒')) {
        return '移动APP/设置/通知偏好页面';
      } else if (taskTitle.includes('分析') || taskTitle.includes('统计') || taskTitle.includes('report') || taskTitle.includes('analytics')) {
        return '移动APP/数据分析/统计报告页面';
      } else if (taskTitle.includes('异常') || taskTitle.includes('error') || taskTitle.includes('故障') || taskTitle.includes('alarm')) {
        return '移动APP/设备状态/异常处理页面';
      } else if (taskTitle.includes('功率') || taskTitle.includes('power') || taskTitle.includes('电流') || taskTitle.includes('voltage')) {
        return '移动APP/设备状态/功率监控页面';
      } else if (taskTitle.includes('进度') || taskTitle.includes('progress') || taskTitle.includes('充电进度')) {
        return '移动APP/充电状态/进度详情页面';
      } else if (taskTitle.includes('查询') || taskTitle.includes('search') || taskTitle.includes('查找')) {
        return '移动APP/充电记录/查询筛选页面';
      } else if (taskTitle.includes('导出') || taskTitle.includes('export') || taskTitle.includes('下载')) {
        return '移动APP/充电记录/数据导出页面';
      } else if (taskTitle.includes('习惯') || taskTitle.includes('habit') || taskTitle.includes('模式')) {
        return '移动APP/数据分析/充电习惯页面';
      } else if (taskTitle.includes('费用') || taskTitle.includes('cost') || taskTitle.includes('计费')) {
        return '移动APP/充电记录/费用统计页面';
      }
    }
    
    // 租车应用触点 - 更具体的匹配
    else if (taskTitle.includes('租车') || taskTitle.includes('car') || taskTitle.includes('车') || taskDescription.includes('租车')) {
      if (taskTitle.includes('搜索') || taskTitle.includes('search') || taskTitle.includes('查找')) {
        return '微信小程序/车辆搜索页面';
      } else if (taskTitle.includes('浏览') || taskTitle.includes('browse') || taskTitle.includes('列表') || taskTitle.includes('list')) {
        return '微信小程序/车辆列表页面';
      } else if (taskTitle.includes('详情') || taskTitle.includes('detail') || taskTitle.includes('信息')) {
        return '微信小程序/车辆详情页面';
      } else if (taskTitle.includes('预订') || taskTitle.includes('booking') || taskTitle.includes('预约') || taskTitle.includes('reserve')) {
        return '微信小程序/车辆预订页面';
      } else if (taskTitle.includes('支付') || taskTitle.includes('payment') || taskTitle.includes('付款')) {
        return '微信小程序/支付确认页面';
      } else if (taskTitle.includes('取车') || taskTitle.includes('pickup') || taskTitle.includes('提车')) {
        return '车辆服务机构端小程序/交车确认页面';
      } else if (taskTitle.includes('用车') || taskTitle.includes('usage') || taskTitle.includes('使用')) {
        return '微信小程序/用车指南页面';
      } else if (taskTitle.includes('还车') || taskTitle.includes('return') || taskTitle.includes('归还')) {
        return '车辆服务机构端小程序/还车确认页面';
      } else if (taskTitle.includes('订单') || taskTitle.includes('order')) {
        return '微信小程序/订单管理页面';
      } else if (taskTitle.includes('发票') || taskTitle.includes('invoice')) {
        return '微信小程序/发票申请页面';
      }
    }
    
    // 电商应用触点 - 更具体的匹配
    else if (taskTitle.includes('电商') || taskTitle.includes('购物') || taskTitle.includes('商品') || taskDescription.includes('电商')) {
      if (taskTitle.includes('搜索') || taskTitle.includes('search')) {
        return '移动APP/商品搜索页面';
      } else if (taskTitle.includes('浏览') || taskTitle.includes('browse') || taskTitle.includes('列表')) {
        return '移动APP/商品列表页面';
      } else if (taskTitle.includes('详情') || taskTitle.includes('detail')) {
        return '移动APP/商品详情页面';
      } else if (taskTitle.includes('购物车') || taskTitle.includes('cart')) {
        return '移动APP/购物车页面';
      } else if (taskTitle.includes('支付') || taskTitle.includes('payment')) {
        return '移动APP/支付页面';
      } else if (taskTitle.includes('订单') || taskTitle.includes('order')) {
        return '移动APP/订单页面';
      }
    }
    
    // 社交应用触点 - 更具体的匹配
    else if (taskTitle.includes('社交') || taskTitle.includes('聊天') || taskTitle.includes('消息') || taskDescription.includes('社交')) {
      if (taskTitle.includes('聊天') || taskTitle.includes('chat') || taskTitle.includes('消息')) {
        return '移动APP/聊天页面';
      } else if (taskTitle.includes('好友') || taskTitle.includes('friend')) {
        return '移动APP/好友列表页面';
      } else if (taskTitle.includes('动态') || taskTitle.includes('post') || taskTitle.includes('发布')) {
        return '移动APP/动态发布页面';
      } else if (taskTitle.includes('个人') || taskTitle.includes('profile')) {
        return '移动APP/个人资料页面';
      } else if (taskTitle.includes('设置') || taskTitle.includes('setting')) {
        return '移动APP/设置页面';
      }
    }
    
    // 任务管理应用触点 - 更具体的匹配
    else if (taskTitle.includes('任务') || taskTitle.includes('项目') || taskTitle.includes('管理') || taskDescription.includes('任务')) {
      if (taskTitle.includes('创建') || taskTitle.includes('create')) {
        return '移动APP/任务创建页面';
      } else if (taskTitle.includes('列表') || taskTitle.includes('list')) {
        return '移动APP/任务列表页面';
      } else if (taskTitle.includes('详情') || taskTitle.includes('detail')) {
        return '移动APP/任务详情页面';
      } else if (taskTitle.includes('编辑') || taskTitle.includes('edit')) {
        return '移动APP/任务编辑页面';
      } else if (taskTitle.includes('统计') || taskTitle.includes('report')) {
        return '移动APP/任务统计页面';
      }
    }
    
    // 用户认证相关触点 - 更具体的匹配
    else if (taskTitle.includes('注册') || taskTitle.includes('登录') || taskTitle.includes('认证') || taskDescription.includes('注册') || taskDescription.includes('登录')) {
      if (taskTitle.includes('注册') || taskTitle.includes('register')) {
        return '移动APP/用户注册页面';
      } else if (taskTitle.includes('登录') || taskTitle.includes('login')) {
        return '移动APP/用户登录页面';
      } else if (taskTitle.includes('忘记密码') || taskTitle.includes('reset') || taskTitle.includes('重置')) {
        return '移动APP/密码重置页面';
      } else if (taskTitle.includes('个人') || taskTitle.includes('profile')) {
        return '移动APP/个人资料页面';
      }
    }
    
    // 支付相关触点 - 更具体的匹配
    else if (taskTitle.includes('支付') || taskTitle.includes('付款') || taskTitle.includes('订单') || taskDescription.includes('支付')) {
      if (taskTitle.includes('支付') || taskTitle.includes('payment')) {
        return '移动APP/支付确认页面';
      } else if (taskTitle.includes('订单') || taskTitle.includes('order')) {
        return '移动APP/订单管理页面';
      } else if (taskTitle.includes('发票') || taskTitle.includes('invoice')) {
        return '移动APP/发票申请页面';
      }
    }
    
    // 通知设置触点 - 更具体的匹配
    else if (taskTitle.includes('通知') || taskTitle.includes('消息') || taskTitle.includes('提醒') || taskDescription.includes('通知')) {
      return '移动APP/设置/通知偏好页面';
    }
    
    // 设置相关触点 - 更具体的匹配
    else if (taskTitle.includes('设置') || taskTitle.includes('配置') || taskTitle.includes('偏好') || taskDescription.includes('设置')) {
      return '移动APP/设置/应用配置页面';
    }
    
    // 默认触点 - 更智能的默认值
    if (taskTitle.includes('查看') || taskTitle.includes('显示') || taskTitle.includes('展示')) {
      return '移动APP/信息展示页面';
    } else if (taskTitle.includes('添加') || taskTitle.includes('创建') || taskTitle.includes('新建')) {
      return '移动APP/创建页面';
    } else if (taskTitle.includes('编辑') || taskTitle.includes('修改') || taskTitle.includes('更新')) {
      return '移动APP/编辑页面';
    } else if (taskTitle.includes('删除') || taskTitle.includes('移除')) {
      return '移动APP/删除确认页面';
    } else if (taskTitle.includes('搜索') || taskTitle.includes('查找')) {
      return '移动APP/搜索页面';
    } else if (taskTitle.includes('列表') || taskTitle.includes('管理')) {
      return '移动APP/列表管理页面';
    }
    
    return '移动APP/主页面';
  };

  // 从 AI 生成的故事地图数据中获取支撑性需求
  const generateSupportingNeeds = (task: UserStory) => {
    // 如果任务有支撑性需求，直接返回
    if (task.supportingRequirements && task.supportingRequirements.length > 0) {
      return task.supportingRequirements.map(requirement => {
        let needText = requirement.title;
        
        // 如果有技术规格信息，添加到显示文本中
        if (requirement.technical_specs) {
          const specs = requirement.technical_specs;
          const specParts = [];
          
          if (specs.version) specParts.push(`v${specs.version}`);
          if (specs.sdk_name) specParts.push(specs.sdk_name);
          if (specs.integration_type) specParts.push(specs.integration_type);
          
          if (specParts.length > 0) {
            needText += ` (${specParts.join(', ')})`;
          }
        }
        
        return {
          need: needText,
          priority: requirement.priority as Priority,
          type: requirement.type
        };
      });
    }
    
    // 如果没有支撑性需求，返回空数组
    return [];
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

  // Generate association colors based on user story ID to ensure each story has a unique color
  const getAssociationColor = (storyId: string) => {
    const colors = [
      'border-l-4 border-l-blue-600',
      'border-l-4 border-l-green-600', 
      'border-l-4 border-l-purple-600',
      'border-l-4 border-l-orange-600',
      'border-l-4 border-l-pink-600',
      'border-l-4 border-l-indigo-600',
      'border-l-4 border-l-teal-600',
      'border-l-4 border-l-red-600',
      'border-l-4 border-l-yellow-600',
      'border-l-4 border-l-cyan-600'
    ];
    
    // Use improved hash function for better color distribution
    let hash = 0;
    for (let i = 0; i < storyId.length; i++) {
      const char = storyId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Add additional entropy based on string length and position
    hash = hash ^ storyId.length;
    hash = hash ^ (storyId.charCodeAt(0) || 0);
    hash = hash ^ (storyId.charCodeAt(storyId.length - 1) || 0);
    
    const colorIndex = Math.abs(hash) % colors.length;
    const selectedColor = colors[colorIndex];
    
    console.log(`Story ID: ${storyId}, Hash: ${hash}, Color Index: ${colorIndex}, Color: ${selectedColor}`);
    
    return selectedColor;
  };

  // Get inline style for border color to ensure it's applied
  const getBorderStyle = (storyId: string) => {
    const colors = [
      '#dc2626', // red-600 - 红色 (高对比度)
      '#2563eb', // blue-600 - 蓝色 (高对比度)
      '#7c3aed', // violet-600 - 紫色 (中等对比度)
      '#ea580c', // orange-600 - 橙色 (高对比度)
      '#059669', // emerald-600 - 翠绿色 (中等对比度)
      '#0891b2', // cyan-600 - 青色 (中等对比度)
      '#be185d', // pink-600 - 粉色 (高对比度)
      '#16a34a', // green-600 - 绿色 (中等对比度)
      '#ca8a04', // yellow-600 - 黄色 (高对比度)
      '#9333ea'  // purple-600 - 深紫色 (中等对比度)
    ];
    
    const hash = storyId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const colorIndex = Math.abs(hash) % colors.length;
    return { borderLeftColor: colors[colorIndex], borderLeftWidth: '4px', borderLeftStyle: 'solid' as const };
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
    
    // Save the updated story map to localStorage immediately
    localStorage.setItem('currentStoryMap', JSON.stringify(updatedStoryMap));
  };

  const handleStoryMapUpdate = (updatedStoryMap: StoryMap) => {
    setCurrentStoryMap(updatedStoryMap);
    localStorage.setItem('currentStoryMap', JSON.stringify(updatedStoryMap));
    setShowEditor(false);
  };

  const handleFeedbackUpdate = (updatedStoryMap: StoryMap) => {
    // 检查是否所有tasks都被清空了（删除支撑性需求的标志）
    const hasNoTasks = updatedStoryMap.epics.every(epic => 
      epic.features.every(feature => feature.tasks.length === 0)
    );
    
    if (hasNoTasks) {
      // 如果所有tasks都被清空，说明是删除支撑性需求的指令
      setShowSupportingNeeds(false);
      localStorage.setItem('showSupportingNeeds', 'false');
    } else {
      // 否则正常更新故事地图
      setCurrentStoryMap(updatedStoryMap);
      localStorage.setItem('currentStoryMap', JSON.stringify(updatedStoryMap));
      // 如果有tasks，说明支撑性需求应该显示
      setShowSupportingNeeds(true);
      localStorage.setItem('showSupportingNeeds', 'true');
    }
    
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
                                  // Force priority to be a valid value if it's undefined or null
                                  const validPriority = story.priority || 'medium';
                                  
                                  // Use association color for left border based on story ID
                                  const associationColor = getAssociationColor(story.id);

                                  return (
                                    <div
                                      key={storyIndex}
                                      className="story-card cursor-pointer bg-white border-r border-t border-b border-gray-200 rounded-md p-2 shadow-sm hover:shadow-md transition-shadow flex-shrink-0 mx-1 relative"
                                      style={getBorderStyle(story.id)}
                                      onClick={() => handleStoryClick(story)}
                                    >
                                      <div className="flex items-start justify-between mb-1">
                                        <User className="w-4 h-4 text-gray-500" />
                                        {getStatusIcon(story.status)}
                                      </div>
                                      <p className="text-sm text-gray-700 leading-relaxed">
                                        {story.description}
                                      </p>
                                      {/* Priority icon in bottom-right corner */}
                                      <div className="absolute bottom-1 right-1">
                                        <PriorityIcon priority={validPriority} />
                                      </div>
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
                                  // Use association color based on the associated story ID
                                  const associationColor = getAssociationColor(item.associatedStoryId);

                                  return (
                                    <div
                                      key={needIndex}
                                      className="bg-white border-r border-t border-b border-gray-200 rounded-md p-2 shadow-sm flex-shrink-0 mx-1 relative"
                                      style={getBorderStyle(item.associatedStoryId)}
                                    >
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                          {t('storyMap.supportingNeed')}
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-700">{item.need}</p>
                                      {/* Priority icon in bottom-right corner */}
                                      <div className="absolute bottom-1 right-1">
                                        <PriorityIcon priority={item.priority} />
                                      </div>
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
            if (selectedStory) {
              const updatedStoryMap = { ...currentStoryMap };
              updatedStoryMap.epics = updatedStoryMap.epics.map(epic => ({
                ...epic,
                features: epic.features.map(feature => ({
                  ...feature,
                  tasks: feature.tasks.filter(task => task.id !== selectedStory.id)
                }))
              }));
              setCurrentStoryMap(updatedStoryMap);
              
              // Save the updated story map to localStorage immediately
              localStorage.setItem('currentStoryMap', JSON.stringify(updatedStoryMap));
            }
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