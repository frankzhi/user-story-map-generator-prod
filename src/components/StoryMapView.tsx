import React, { useState } from 'react';
import { ArrowLeft, Download, Eye, User, CheckCircle, Clock, Info, MapPin, Smartphone, CreditCard, Car, MessageSquare, Edit, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { StoryMap, UserStory, Task } from '../types/story';
import EnhancedStoryDetail from './EnhancedStoryDetail';
import { InlineStoryMapEditor } from './InlineStoryMapEditor';
import { FeedbackModal } from './FeedbackModal';
import { PriorityBadge, PrioritySelector, PriorityIcon, type Priority } from './PrioritySelector';

interface SupportingNeedWithAssociation {
  need: string;
  priority: Priority;
  type?: string;
  associatedStoryId: string;
  associatedStoryTitle: string;
}

interface StoryMapViewProps {
  storyMap: StoryMap;
  onBack: () => void;
}

export const StoryMapView: React.FC<StoryMapViewProps> = ({ storyMap, onBack }) => {
  const { t } = useTranslation();
  const [currentStoryMap, setCurrentStoryMap] = useState<StoryMap>(storyMap);
  const [showModal, setShowModal] = useState(false);
  const [selectedStory, setSelectedStory] = useState<UserStory | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [sortByPriority, setSortByPriority] = useState(false);
  const [showSupportingNeeds, setShowSupportingNeeds] = useState(true);
  const [selectedSupportingRequirement, setSelectedSupportingRequirement] = useState<any>(null);
  const [showSupportingRequirementModal, setShowSupportingRequirementModal] = useState(false);

  const handleStoryClick = (story: UserStory) => {
    setSelectedStory(story);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedStory(null);
  };

  const handleSupportingRequirementClick = (requirement: any) => {
    setSelectedSupportingRequirement(requirement);
    setShowSupportingRequirementModal(true);
  };

  const closeSupportingRequirementModal = () => {
    setShowSupportingRequirementModal(false);
    setSelectedSupportingRequirement(null);
  };

  // 监听支撑性需求详情显示事件
  React.useEffect(() => {
    const handleShowSupportingRequirement = (event: CustomEvent) => {
      setSelectedSupportingRequirement(event.detail);
      setShowSupportingRequirementModal(true);
    };

    window.addEventListener('showSupportingRequirement', handleShowSupportingRequirement as EventListener);
    
    return () => {
      window.removeEventListener('showSupportingRequirement', handleShowSupportingRequirement as EventListener);
    };
  }, []);

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
          feature.tasks.flatMap(task => { 
            const supportingNeeds = generateSupportingNeeds(task); 
            return supportingNeeds.map(need => ({ 
              need: need.need, 
              priority: need.priority, 
              type: need.type,
              associatedStoryId: task.id, 
              associatedStoryTitle: task.title 
            })); 
          }) : [];        // No need to remove duplicates since these are AI-generated
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
    
    // 检测平台类型 - 根据任务内容智能判断
    const detectPlatform = () => {
      // 检查是否有明确的平台指示
      if (taskTitle.includes('web') || taskTitle.includes('网页') || taskTitle.includes('网站') || 
          taskDescription.includes('web') || taskDescription.includes('网页') || taskDescription.includes('网站')) {
        return 'Web平台';
      } else if (taskTitle.includes('小程序') || taskDescription.includes('小程序')) {
        return '微信小程序';
      } else if (taskTitle.includes('pc') || taskTitle.includes('桌面') || taskDescription.includes('pc') || taskDescription.includes('桌面')) {
        return 'PC客户端';
      } else if (taskTitle.includes('管理后台') || taskTitle.includes('后台') || taskTitle.includes('admin') || 
                 taskDescription.includes('管理后台') || taskDescription.includes('后台')) {
        return 'Web管理后台';
      } else {
        // 默认根据任务类型判断
        if (taskTitle.includes('管理') || taskTitle.includes('配置') || taskTitle.includes('设置') || 
            taskDescription.includes('管理') || taskDescription.includes('配置')) {
          return 'Web管理后台';
        } else {
          return 'Web平台'; // 默认使用Web平台而不是移动APP
        }
      }
    };
    
    // 检测用户类型
    const detectUserType = () => {
      if (taskTitle.includes('管理员') || taskTitle.includes('admin') || taskTitle.includes('管理') || 
          taskDescription.includes('管理员') || taskDescription.includes('admin')) {
        return '管理员';
      } else if (taskTitle.includes('用户') || taskTitle.includes('customer') || taskTitle.includes('客户') || 
                 taskDescription.includes('用户') || taskDescription.includes('customer')) {
        return '用户';
      } else if (taskTitle.includes('系统') || taskTitle.includes('system') || taskDescription.includes('系统')) {
        return '系统';
      } else {
        return '用户'; // 默认为普通用户
      }
    };
    
    const platform = detectPlatform();
    const userType = detectUserType();
    
    // 智能门锁应用触点
    if (taskTitle.includes('门锁') || taskTitle.includes('lock') || taskDescription.includes('门锁')) {
      if (taskTitle.includes('开锁') || taskTitle.includes('unlock') || taskTitle.includes('远程')) {
        return `${platform}/${userType}/远程开锁页面`;
      } else if (taskTitle.includes('状态') || taskTitle.includes('监控') || taskTitle.includes('status')) {
        return `${platform}/${userType}/门锁状态页面`;
      } else if (taskTitle.includes('记录') || taskTitle.includes('历史') || taskTitle.includes('record')) {
        return `${platform}/${userType}/开锁记录页面`;
      } else if (taskTitle.includes('设置') || taskTitle.includes('配置') || taskTitle.includes('config')) {
        return `${platform}/${userType}/门锁设置页面`;
      } else if (taskTitle.includes('权限') || taskTitle.includes('permission')) {
        return `${platform}/${userType}/权限管理页面`;
      } else if (taskTitle.includes('通知') || taskTitle.includes('notification')) {
        return `${platform}/${userType}/通知设置页面`;
      } else if (taskTitle.includes('日志') || taskTitle.includes('分析') || taskTitle.includes('log')) {
        return `${platform}/${userType}/日志分析页面`;
      }
    }
    
    // 充电桩管理应用触点 - 更具体的匹配
    else if (taskTitle.includes('充电') || taskTitle.includes('charging') || taskDescription.includes('充电')) {
      if (taskTitle.includes('固件') || taskTitle.includes('firmware') || taskTitle.includes('升级') || taskTitle.includes('update')) {
        return `${platform}/${userType}/设备设置/固件升级页面`;
      } else if (taskTitle.includes('配对') || taskTitle.includes('pair') || taskTitle.includes('绑定') || taskTitle.includes('bind')) {
        return `${platform}/${userType}/设备管理/配对页面`;
      } else if (taskTitle.includes('解绑') || taskTitle.includes('unbind') || taskTitle.includes('删除')) {
        return `${platform}/${userType}/设备管理/解绑页面`;
      } else if (taskTitle.includes('状态') || taskTitle.includes('status') || taskTitle.includes('监控') || taskTitle.includes('monitor')) {
        return `${platform}/${userType}/设备状态/实时监控页面`;
      } else if (taskTitle.includes('记录') || taskTitle.includes('record') || taskTitle.includes('历史') || taskTitle.includes('history')) {
        return `${platform}/${userType}/充电记录/历史数据页面`;
      } else if (taskTitle.includes('配置') || taskTitle.includes('config') || taskTitle.includes('设置') || taskTitle.includes('setting')) {
        return `${platform}/${userType}/设备设置/参数配置页面`;
      } else if (taskTitle.includes('权限') || taskTitle.includes('permission') || taskTitle.includes('管理') || taskTitle.includes('manage')) {
        return `${platform}/${userType}/用户管理/权限设置页面`;
      } else if (taskTitle.includes('通知') || taskTitle.includes('notification') || taskTitle.includes('提醒')) {
        return `${platform}/${userType}/设置/通知偏好页面`;
      } else if (taskTitle.includes('分析') || taskTitle.includes('统计') || taskTitle.includes('report') || taskTitle.includes('analytics')) {
        return `${platform}/${userType}/数据分析/统计报告页面`;
      } else if (taskTitle.includes('异常') || taskTitle.includes('error') || taskTitle.includes('故障') || taskTitle.includes('alarm')) {
        return `${platform}/${userType}/设备状态/异常处理页面`;
      } else if (taskTitle.includes('功率') || taskTitle.includes('power') || taskTitle.includes('电流') || taskTitle.includes('voltage')) {
        return `${platform}/${userType}/设备状态/功率监控页面`;
      } else if (taskTitle.includes('进度') || taskTitle.includes('progress') || taskTitle.includes('充电进度')) {
        return `${platform}/${userType}/充电状态/进度详情页面`;
      } else if (taskTitle.includes('查询') || taskTitle.includes('search') || taskTitle.includes('查找')) {
        return `${platform}/${userType}/充电记录/查询筛选页面`;
      } else if (taskTitle.includes('导出') || taskTitle.includes('export') || taskTitle.includes('下载')) {
        return `${platform}/${userType}/充电记录/数据导出页面`;
      } else if (taskTitle.includes('习惯') || taskTitle.includes('habit') || taskTitle.includes('模式')) {
        return `${platform}/${userType}/数据分析/充电习惯页面`;
      } else if (taskTitle.includes('费用') || taskTitle.includes('cost') || taskTitle.includes('计费')) {
        return `${platform}/${userType}/充电记录/费用统计页面`;
      }
    }
    
    // 租车应用触点 - 更具体的匹配
    else if (taskTitle.includes('租车') || taskTitle.includes('car') || taskTitle.includes('车') || taskDescription.includes('租车')) {
      if (taskTitle.includes('搜索') || taskTitle.includes('search') || taskTitle.includes('查找')) {
        return `${platform}/${userType}/车辆搜索页面`;
      } else if (taskTitle.includes('浏览') || taskTitle.includes('browse') || taskTitle.includes('列表') || taskTitle.includes('list')) {
        return `${platform}/${userType}/车辆列表页面`;
      } else if (taskTitle.includes('详情') || taskTitle.includes('detail') || taskTitle.includes('信息')) {
        return `${platform}/${userType}/车辆详情页面`;
      } else if (taskTitle.includes('预订') || taskTitle.includes('booking') || taskTitle.includes('预约') || taskTitle.includes('reserve')) {
        return `${platform}/${userType}/车辆预订页面`;
      } else if (taskTitle.includes('支付') || taskTitle.includes('payment') || taskTitle.includes('付款')) {
        return `${platform}/${userType}/支付确认页面`;
      } else if (taskTitle.includes('取车') || taskTitle.includes('pickup') || taskTitle.includes('提车')) {
        return `${platform}/${userType}/交车确认页面`;
      } else if (taskTitle.includes('用车') || taskTitle.includes('usage') || taskTitle.includes('使用')) {
        return `${platform}/${userType}/用车指南页面`;
      } else if (taskTitle.includes('还车') || taskTitle.includes('return') || taskTitle.includes('归还')) {
        return `${platform}/${userType}/还车确认页面`;
      } else if (taskTitle.includes('订单') || taskTitle.includes('order')) {
        return `${platform}/${userType}/订单管理页面`;
      } else if (taskTitle.includes('发票') || taskTitle.includes('invoice')) {
        return `${platform}/${userType}/发票申请页面`;
      }
    }
    
    // 电商应用触点 - 更具体的匹配
    else if (taskTitle.includes('电商') || taskTitle.includes('购物') || taskTitle.includes('商品') || taskDescription.includes('电商')) {
      if (taskTitle.includes('搜索') || taskTitle.includes('search')) {
        return `${platform}/${userType}/商品搜索页面`;
      } else if (taskTitle.includes('浏览') || taskTitle.includes('browse') || taskTitle.includes('列表')) {
        return `${platform}/${userType}/商品列表页面`;
      } else if (taskTitle.includes('详情') || taskTitle.includes('detail')) {
        return `${platform}/${userType}/商品详情页面`;
      } else if (taskTitle.includes('购物车') || taskTitle.includes('cart')) {
        return `${platform}/${userType}/购物车页面`;
      } else if (taskTitle.includes('支付') || taskTitle.includes('payment')) {
        return `${platform}/${userType}/支付页面`;
      } else if (taskTitle.includes('订单') || taskTitle.includes('order')) {
        return `${platform}/${userType}/订单页面`;
      }
    }
    
    // 社交应用触点 - 更具体的匹配
    else if (taskTitle.includes('社交') || taskTitle.includes('聊天') || taskTitle.includes('消息') || taskDescription.includes('社交')) {
      if (taskTitle.includes('聊天') || taskTitle.includes('chat') || taskTitle.includes('消息')) {
        return `${platform}/${userType}/聊天页面`;
      } else if (taskTitle.includes('好友') || taskTitle.includes('friend')) {
        return `${platform}/${userType}/好友列表页面`;
      } else if (taskTitle.includes('动态') || taskTitle.includes('post') || taskTitle.includes('发布')) {
        return `${platform}/${userType}/动态发布页面`;
      } else if (taskTitle.includes('个人') || taskTitle.includes('profile')) {
        return `${platform}/${userType}/个人资料页面`;
      } else if (taskTitle.includes('设置') || taskTitle.includes('setting')) {
        return `${platform}/${userType}/设置页面`;
      }
    }
    
    // 任务管理应用触点 - 更具体的匹配
    else if (taskTitle.includes('任务') || taskTitle.includes('项目') || taskTitle.includes('管理') || taskDescription.includes('任务')) {
      if (taskTitle.includes('创建') || taskTitle.includes('create')) {
        return `${platform}/${userType}/任务创建页面`;
      } else if (taskTitle.includes('列表') || taskTitle.includes('list')) {
        return `${platform}/${userType}/任务列表页面`;
      } else if (taskTitle.includes('详情') || taskTitle.includes('detail')) {
        return `${platform}/${userType}/任务详情页面`;
      } else if (taskTitle.includes('编辑') || taskTitle.includes('edit')) {
        return `${platform}/${userType}/任务编辑页面`;
      } else if (taskTitle.includes('统计') || taskTitle.includes('report')) {
        return `${platform}/${userType}/任务统计页面`;
      }
    }
    
    // 用户认证相关触点 - 更具体的匹配
    else if (taskTitle.includes('注册') || taskTitle.includes('登录') || taskTitle.includes('认证') || taskDescription.includes('注册') || taskDescription.includes('登录')) {
      if (taskTitle.includes('注册') || taskTitle.includes('register')) {
        return `${platform}/${userType}/用户注册页面`;
      } else if (taskTitle.includes('登录') || taskTitle.includes('login')) {
        return `${platform}/${userType}/用户登录页面`;
      } else if (taskTitle.includes('忘记密码') || taskTitle.includes('reset') || taskTitle.includes('重置')) {
        return `${platform}/${userType}/密码重置页面`;
      } else if (taskTitle.includes('个人') || taskTitle.includes('profile')) {
        return `${platform}/${userType}/个人资料页面`;
      }
    }
    
    // 支付相关触点 - 更具体的匹配
    else if (taskTitle.includes('支付') || taskTitle.includes('付款') || taskTitle.includes('订单') || taskDescription.includes('支付')) {
      if (taskTitle.includes('支付') || taskTitle.includes('payment')) {
        return `${platform}/${userType}/支付确认页面`;
      } else if (taskTitle.includes('订单') || taskTitle.includes('order')) {
        return `${platform}/${userType}/订单管理页面`;
      } else if (taskTitle.includes('发票') || taskTitle.includes('invoice')) {
        return `${platform}/${userType}/发票申请页面`;
      }
    }
    
    // 通知设置触点 - 更具体的匹配
    else if (taskTitle.includes('通知') || taskTitle.includes('消息') || taskTitle.includes('提醒') || taskDescription.includes('通知')) {
      return `${platform}/${userType}/设置/通知偏好页面`;
    }
    
    // 设置相关触点 - 更具体的匹配
    else if (taskTitle.includes('设置') || taskTitle.includes('配置') || taskTitle.includes('偏好') || taskDescription.includes('设置')) {
      return `${platform}/${userType}/设置/应用配置页面`;
    }
    
    // 默认触点 - 更智能的默认值
    if (taskTitle.includes('查看') || taskTitle.includes('显示') || taskTitle.includes('展示')) {
      return `${platform}/${userType}/信息展示页面`;
    } else if (taskTitle.includes('添加') || taskTitle.includes('创建') || taskTitle.includes('新建')) {
      return `${platform}/${userType}/创建页面`;
    } else if (taskTitle.includes('编辑') || taskTitle.includes('修改') || taskTitle.includes('更新')) {
      return `${platform}/${userType}/编辑页面`;
    } else if (taskTitle.includes('删除') || taskTitle.includes('移除')) {
      return `${platform}/${userType}/删除确认页面`;
    } else if (taskTitle.includes('搜索') || taskTitle.includes('查找')) {
      return `${platform}/${userType}/搜索页面`;
    } else if (taskTitle.includes('列表') || taskTitle.includes('管理')) {
      return `${platform}/${userType}/列表管理页面`;
    }
    
    return `${platform}/${userType}/主页面`;
  };

  // 从 AI 生成的故事地图数据中获取支撑性需求
  const generateSupportingNeeds = (task: UserStory) => {
    // 🔍 DEBUG: 添加调试日志
    console.log(`🔍 生成支撑性需求 - 任务: "${task.title}"`);
    console.log(`🔍 任务的支撑性需求数据:`, task.supportingRequirements);
    
    // 如果任务有支撑性需求，直接返回
    if (task.supportingRequirements && task.supportingRequirements.length > 0) {
      return task.supportingRequirements.map(requirement => {
        let needText = requirement.title;
        
        // 如果有技术规格信息，添加到显示文本中（移除版本号）
        if (requirement.technical_specs) {
          const specs = requirement.technical_specs;
          const specParts = [];
          
          // 只显示 SDK 名称和集成类型，不显示版本号
          if (specs.sdk_name) specParts.push(specs.sdk_name);
          if (specs.integration_type) specParts.push(specs.integration_type);
          
          if (specParts.length > 0) {
            needText += ` (${specParts.join(', ')})`;
          }
        }
        
        // 🔍 DEBUG: 添加调试日志
        console.log(`🔍 支撑性需求: "${requirement.title}" -> 显示文本: "${needText}"`);
        console.log(`🔍 支撑性需求类型: "${requirement.type}"`);
        console.log(`🔍 完整支撑性需求数据:`, requirement);
        
        return {
          need: needText,
          priority: requirement.priority as Priority,
          type: requirement.type,
          associatedStoryId: task.id,
          associatedStoryTitle: task.title
        };
      });
    }
    
    // 如果没有支撑性需求，返回空数组
    console.log(`🔍 任务 "${task.title}" 没有支撑性需求`);
    console.log(`🔍 任务 "${task.title}" 的完整数据:`, task);    return [];
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

  // 获取支撑性需求类型的中文标签
  const getSupportingRequirementTypeLabel = (type: string) => {
    switch (type) {
      case "software_dependency":
        return "软件依赖";
      case "service_integration":
        return "服务集成";
      case "security_compliance":
        return "安全合规";
      case "performance_requirement":
        return "性能需求";
      default:
        return "技术需求";
    }
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
  const getBorderStyle = (storyId: string, activityIndex?: number, storyIndex?: number) => {
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
    
    // 如果提供了活动索引和故事索引，使用它们来确保同一活动下的故事颜色不同
    if (activityIndex !== undefined && storyIndex !== undefined) {
      // 使用活动索引和故事索引的组合来生成颜色索引
      // 这样可以确保同一活动下的不同故事有不同的颜色
      const colorIndex = (activityIndex * 3 + storyIndex) % colors.length;
      console.log(`Activity: ${activityIndex}, Story: ${storyIndex}, Color Index: ${colorIndex}, Color: ${colors[colorIndex]}`);
      return { borderLeftColor: colors[colorIndex], borderLeftWidth: '4px', borderLeftStyle: 'solid' as const };
    }
    
    // 如果没有提供索引，使用原来的hash方法作为后备
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
                                {(() => {
                                  // 优化触点布局：去重并合并所有页面
                                  const uniquePages = new Set<string>();
                                  
                                  activity.touchpoints.forEach(item => {
                                    // 从触点字符串中提取页面信息
                                    const parts = item.touchpoint.split('/');
                                    if (parts.length >= 3) {
                                      const pageInfo = parts.slice(2).join('/'); // 页面信息
                                      uniquePages.add(pageInfo);
                                    }
                                  });
                                  
                                  // 如果只有一个页面，直接显示；如果有多个页面，合并显示
                                  if (uniquePages.size > 0) {
                                    return (
                                      <div className="bg-white border border-gray-200 rounded-md p-2 shadow-sm flex-shrink-0 mx-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          {getTouchpointIcon(activity.touchpoints[0]?.touchpoint || '')}
                                        </div>
                                        <div className="space-y-1">
                                          {Array.from(uniquePages).map((page, pageIndex) => (
                                            <p key={pageIndex} className="text-xs text-gray-700">
                                              {page}
                                            </p>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  }
                                  
                                  return null;
                                })()}
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
                                      style={getBorderStyle(story.id, activityIndex, storyIndex)}
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
                                  // 找到对应的故事索引
                                  const associatedStoryIndex = activity.userStories.findIndex(story => story.id === item.associatedStoryId);
                                  const storyIndex = associatedStoryIndex >= 0 ? associatedStoryIndex : needIndex;
                                  
                                  // Use association color based on the associated story ID
                                  const associationColor = getAssociationColor(item.associatedStoryId);

                                  return (
                                    <div
                                      key={needIndex}
                                      className="bg-white border-r border-t border-b border-gray-200 rounded-md p-2 shadow-sm flex-shrink-0 mx-1 relative cursor-pointer hover:shadow-md transition-shadow"
                                      style={getBorderStyle(item.associatedStoryId, activityIndex, storyIndex)}
                                      onClick={() => {
                                        // 找到对应的任务和支撑性需求
                                        const task = currentStoryMap.epics
                                          .flatMap(epic => epic.features)
                                          .flatMap(feature => feature.tasks)
                                          .find(task => task.id === item.associatedStoryId);
                                        
                                        if (task && task.supportingRequirements) {
                                          const supportingReq = task.supportingRequirements.find(req => 
                                            req.title === item.need.split(' (')[0] // 移除技术规格信息
                                          );
                                          if (supportingReq) {
                                            handleSupportingRequirementClick(supportingReq);
                                          }
                                        }
                                      }}
                                    >
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                          {item.type ? getSupportingRequirementTypeLabel(item.type) : t('storyMap.supportingNeed')}
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
            
            // Save the updated story map to localStorage immediately
            localStorage.setItem('currentStoryMap', JSON.stringify(updatedStoryMap));
            
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

      {/* Supporting Requirement Detail Modal */}
      {showSupportingRequirementModal && selectedSupportingRequirement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">支撑性需求详情</h2>
                <p className="text-sm text-gray-600 mt-1">技术依赖和集成需求</p>
              </div>
              <button
                onClick={closeSupportingRequirementModal}
                className="p-2 text-gray-600 hover:text-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-semibold mb-2">{selectedSupportingRequirement.title}</h3>
                <p className="text-gray-600 mb-4">{selectedSupportingRequirement.description}</p>
                
                {/* Priority and Type */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">优先级:</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      selectedSupportingRequirement.priority === 'high' ? 'bg-red-100 text-red-800' :
                      selectedSupportingRequirement.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {selectedSupportingRequirement.priority === 'high' ? '高' : 
                       selectedSupportingRequirement.priority === 'medium' ? '中' : '低'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">类型:</span>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      {selectedSupportingRequirement.type === 'software_dependency' ? '软件依赖' :
                       selectedSupportingRequirement.type === 'service_integration' ? '服务集成' :
                       selectedSupportingRequirement.type === 'security_compliance' ? '安全合规' : '性能需求'}
                    </span>
                  </div>
                </div>

                {/* Technical Specifications */}
                {selectedSupportingRequirement.technical_specs && (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="font-semibold mb-3 text-gray-800">技术规格</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedSupportingRequirement.technical_specs.version && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">版本:</span>
                          <p className="text-sm text-gray-600">{selectedSupportingRequirement.technical_specs.version}</p>
                        </div>
                      )}
                      {selectedSupportingRequirement.technical_specs.sdk_name && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">SDK名称:</span>
                          <p className="text-sm text-gray-600">{selectedSupportingRequirement.technical_specs.sdk_name}</p>
                        </div>
                      )}
                      {selectedSupportingRequirement.technical_specs.integration_type && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">集成类型:</span>
                          <p className="text-sm text-gray-600">{selectedSupportingRequirement.technical_specs.integration_type}</p>
                        </div>
                      )}
                      {selectedSupportingRequirement.technical_specs.api_endpoint && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">API端点:</span>
                          <p className="text-sm text-gray-600 break-all">{selectedSupportingRequirement.technical_specs.api_endpoint}</p>
                        </div>
                      )}
                      {selectedSupportingRequirement.technical_specs.documentation_url && (
                        <div>
                          <span className="text-sm font-medium text-gray-700">文档链接:</span>
                          <a 
                            href={selectedSupportingRequirement.technical_specs.documentation_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 break-all"
                          >
                            {selectedSupportingRequirement.technical_specs.documentation_url}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 