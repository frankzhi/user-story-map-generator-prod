import type { StoryMapYAML, Task, StoryMap } from '../types/story';
import { DeepSeekService } from './deepseekService';
import { GeminiService } from './geminiService';
import i18n from '../i18n';

export type AIProvider = 'deepseek' | 'gemini';

export class AIService {
  private static instance: AIService;
  private deepseekService: DeepSeekService;
  private geminiService: GeminiService;
  
  private constructor() {
    this.deepseekService = new DeepSeekService();
    this.geminiService = new GeminiService();
  }
  
  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async generateStoryMap(productDescription: string, provider: AIProvider = 'deepseek'): Promise<StoryMapYAML> {
    try {
      switch (provider) {
        case 'deepseek':
          if (this.deepseekService.isConfigured()) {
            return await this.deepseekService.generateStoryMap(productDescription);
          } else {
            console.warn('DeepSeek not configured, falling back to mock data');
            throw new Error('DeepSeek API not configured. Please add VITE_DEEPSEEK_API_KEY to your environment variables.');
          }
        
        case 'gemini':
          if (this.geminiService.isConfigured()) {
            return await this.geminiService.generateStoryMap(productDescription);
          } else {
            console.warn('Gemini not configured, falling back to mock data');
            throw new Error('Gemini API not configured. Please add VITE_GEMINI_API_KEY to your environment variables.');
          }
        
      }
    } catch (error) {
      console.error(`Error generating story map with ${provider}:`, error);
      // Fallback to generic story map if AI service fails
      return this.generateGenericStoryMap(productDescription);
    }
  }

  getAvailableProviders(): { provider: AIProvider; configured: boolean; name: string }[] {
    return [
      {
        provider: 'deepseek',
        configured: this.deepseekService.isConfigured(),
        name: 'DeepSeek (Recommended)'
      },
      {
        provider: 'gemini',
        configured: this.geminiService.isConfigured(),
        name: 'Google Gemini'
      }
    ];
  }








  private generateGenericStoryMap(productDescription: string): StoryMapYAML {
    return {
      title: "Product Application",
      description: productDescription,
      epics: [
        {
          title: "Core Features",
          description: "Essential functionality for the application",
          features: [
            {
              title: "User Interface",
              description: "Main user interface and navigation",
              tasks: [
                {
                  title: "Homepage Design",
                  description: "Create the main landing page",
                  priority: "high",
                  effort: "5 days",
                  acceptance_criteria: [
                    "Page loads quickly and is responsive",
                    "Navigation is intuitive and accessible",
                    "Content is well-organized and readable"
                  ],
                  supporting_requirements: [
                    {
                      title: "Integrate React 18.2.0 with TypeScript 5.0",
                      description: "Frontend development framework setup",
                      type: "software_dependency",
                      priority: "high",
                      technical_specs: {
                        version: "18.2.0",
                        sdk_name: "React",
                        integration_type: "Frontend Framework",
                        documentation_url: "https://react.dev"
                      }
                    },
                    {
                      title: "Set up Tailwind CSS v3.3.0 for styling",
                      description: "CSS framework for responsive design",
                      type: "software_dependency",
                      priority: "medium",
                      technical_specs: {
                        version: "3.3.0",
                        sdk_name: "Tailwind CSS",
                        integration_type: "CSS Framework",
                        documentation_url: "https://tailwindcss.com"
                      }
                    }
                  ]
                },
                {
                  title: "User Authentication",
                  description: "Implement user login and registration",
                  priority: "high",
                  effort: "4 days",
                  acceptance_criteria: [
                    "Users can register new accounts",
                    "Secure login functionality",
                    "Password reset capability"
                  ],
                  supporting_requirements: [
                    {
                      title: "Integrate Firebase Authentication v10.0.0",
                      description: "User authentication service",
                      type: "service_integration",
                      priority: "high",
                      technical_specs: {
                        version: "10.0.0",
                        sdk_name: "Firebase Auth",
                        integration_type: "Authentication Service",
                        api_endpoint: "https://firebase.google.com/docs/auth",
                        documentation_url: "https://firebase.google.com/docs/auth"
                      }
                    },
                    {
                      title: "Implement JWT token management",
                      description: "Secure token-based authentication",
                      type: "security_compliance",
                      priority: "high",
                      technical_specs: {
                        version: "9.0.0",
                        sdk_name: "jsonwebtoken",
                        integration_type: "Token Management",
                        documentation_url: "https://www.npmjs.com/package/jsonwebtoken"
                      }
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          title: "Data Management",
          description: "Handle data storage and retrieval",
          features: [
            {
              title: "Database Design",
              description: "Design and implement database structure",
              tasks: [
                {
                  title: "Schema Design",
                  description: "Create database schema for the application",
                  priority: "high",
                  effort: "3 days",
                  acceptance_criteria: [
                    "Database supports all required data types",
                    "Relationships are properly defined",
                    "Indexes are optimized for performance"
                  ]
                }
              ]
            }
          ]
        }
      ]
    };
  }

  convertYAMLToStoryMap(yamlData: StoryMapYAML): any {
    // Convert YAML structure to our internal StoryMap format
    const storyMap = {
      id: this.generateId(),
      title: yamlData.title,
      description: yamlData.description,
      epics: yamlData.epics.map((epic, epicIndex) => ({
        id: this.generateId(),
        title: epic.title,
        description: epic.description,
        order: epicIndex,
        features: epic.features.map((feature, featureIndex) => ({
          id: this.generateId(),
          title: feature.title,
          description: feature.description,
          order: featureIndex,
          tasks: feature.tasks.map(task => ({
            id: this.generateId(),
            title: task.title,
            description: task.description,
            type: 'task' as const,
            priority: task.priority as 'high' | 'medium' | 'low',
            status: 'todo' as const,
            acceptanceCriteria: task.acceptance_criteria,
            estimatedEffort: task.effort,
            supportingRequirements: task.supporting_requirements || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }))
        }))
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return storyMap;
  }

  async enhanceStory(task: Task, storyMapContext?: any): Promise<any> {
    try {
      const currentLang = i18n.language;
      const languageContext = currentLang === 'zh' ? 'Please respond in Chinese (Simplified Chinese).' : 'Please respond in English.';
      
      const systemPrompt = `你是一个专业的用户故事分析师和技术文档编写者。

你的任务是增强用户故事，包含以下详细内容：
- 完整的用户故事格式（As a... I want... so that...）- 明确具体用户角色
- 详细的验收标准
- 完成定义
- 技术注意事项和考虑
- 业务价值评估
- 故事点数估算
- 依赖关系和假设 - 考虑与其他故事的关联
- 风险评估
- 测试用例
- 结构化验收标准表格（Given-When-Then格式）

返回JSON对象，包含以下结构：
{
  "userStory": "完整的用户故事格式",
  "acceptanceCriteria": ["标准1", "标准2", ...],
  "definitionOfDone": ["完成项1", "完成项2", ...],
  "technicalNotes": "技术考虑和实现注意事项",
  "businessValue": "业务价值和影响评估",
  "storyPoints": 5,
  "dependencies": ["依赖1", "依赖2", ...],
  "assumptions": ["假设1", "假设2", ...],
  "constraints": ["约束1", "约束2", ...],
  "risks": ["风险1", "风险2", ...],
  "testCases": ["测试用例1", "测试用例2", ...],
  "structuredAcceptanceCriteria": [
    {
      "scenario": "场景描述",
      "acceptancePoint": "验收点",
      "givenWhenThen": "Given 条件，When 操作，Then 结果"
    }
  ]
}

专注于使故事更详细、可操作和全面。根据故事内容生成3-5个结构化验收标准场景。

${languageContext}`;

      // 构建包含上下文信息的用户提示
      let userPrompt = `增强这个用户故事：${task.title} - ${task.description}`;

      // 如果提供了故事地图上下文，添加相关信息
      if (storyMapContext) {
        userPrompt += `\n\n故事地图上下文：
标题：${storyMapContext.title}
描述：${storyMapContext.description}

相关阶段和活动：
${storyMapContext.epics?.map((epic: any, index: number) => 
  `${index + 1}. ${epic.title} - ${epic.description}
   活动：${epic.features?.map((feature: any) => feature.title).join(', ')}`
).join('\n')}

请考虑这个任务与其他故事的关系，确保生成的依赖关系和关联关系准确。`;
      }

      // Use DeepSeek if available, otherwise fall back to mock data
      if (this.deepseekService.isConfigured()) {
        const response = await this.deepseekService.generateEnhancedStory(userPrompt, systemPrompt);
        return response;
      } else {
        // Return mock enhanced data
        return this.generateMockEnhancedStory(task, storyMapContext);
      }
    } catch (error) {
      console.error('Error enhancing story:', error);
      return this.generateMockEnhancedStory(task, storyMapContext);
    }
  }


  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  async generateStoryMapWithFeedback(feedbackPrompt: string, currentStoryMap?: StoryMap): Promise<StoryMapYAML> {
    try {
      // 首先检查是否是删除支撑性需求的指令
      const feedbackLower = feedbackPrompt.toLowerCase();
      if (feedbackLower.includes('删除') && (feedbackLower.includes('支撑性需求') || feedbackLower.includes('supporting'))) {
        // 直接处理删除支撑性需求的逻辑，不调用AI
        return this.handleSupportingNeedsDeletion(currentStoryMap, feedbackPrompt);
      }
      
      if (this.deepseekService.isConfigured() && currentStoryMap) {
        // Use DeepSeek to process feedback and modify story map
        const response = await this.deepseekService.generateStoryMapWithFeedback(currentStoryMap, feedbackPrompt);
        return response;
      } else {
        // For mock mode or when no current story map, return a modified version based on feedback
        return this.generateModifiedStoryMapFromFeedback(feedbackPrompt, currentStoryMap);
      }
    } catch (error) {
      console.error('Error generating story map with feedback:', error);
      return this.generateModifiedStoryMapFromFeedback(feedbackPrompt, currentStoryMap);
    }
  }

  private handleSupportingNeedsDeletion(currentStoryMap?: StoryMap, feedbackPrompt?: string): StoryMapYAML {
    if (!currentStoryMap) {
      return this.generateChargingPileStoryMap();
    }

    const feedbackLower = feedbackPrompt?.toLowerCase() || '';
    
    // 检查是否是限制数量的指令
    const limitMatch = feedbackLower.match(/最多保留(\d+)个支撑性需求/);
    const maxCount = limitMatch ? parseInt(limitMatch[1]) : 0;
    
    if (maxCount > 0) {
      // 限制每个活动的支撑性需求数量
      return {
        title: currentStoryMap.title,
        description: currentStoryMap.description,
        epics: currentStoryMap.epics.map(epic => ({
          title: epic.title,
          description: epic.description,
          features: epic.features.map(feature => ({
            title: feature.title,
            description: feature.description,
            tasks: feature.tasks.slice(0, maxCount).map(task => ({
              title: task.title,
              description: task.description,
              priority: task.priority || 'medium',
              effort: task.estimatedEffort || '3 days',
              acceptance_criteria: task.acceptanceCriteria || ['Given 用户需求，When 功能实现，Then 应满足用户期望']
            }))
          }))
        }))
      };
    } else {
      // 完全删除所有支撑性需求
      return {
        title: currentStoryMap.title,
        description: currentStoryMap.description,
        epics: currentStoryMap.epics.map(epic => ({
          title: epic.title,
          description: epic.description,
          features: epic.features.map(feature => ({
            title: feature.title,
            description: feature.description,
            tasks: [] // 清空所有支撑性需求
          }))
        }))
      };
    }
  }

  private generateModifiedStoryMapFromFeedback(feedbackPrompt: string, currentStoryMap?: StoryMap): StoryMapYAML {
    const feedbackLower = feedbackPrompt.toLowerCase();
    
    // 如果有当前故事地图，基于它进行修改；否则根据反馈内容生成新的故事地图
    let baseStoryMap: StoryMapYAML;
    
    if (currentStoryMap) {
      // 基于当前故事地图进行修改
      baseStoryMap = {
        title: currentStoryMap.title,
        description: currentStoryMap.description,
        epics: currentStoryMap.epics.map(epic => ({
          title: epic.title,
          description: epic.description,
          features: epic.features.map(feature => ({
            title: feature.title,
            description: feature.description,
            tasks: feature.tasks.map(task => ({
              title: task.title,
              description: task.description,
              priority: task.priority || "medium",
              effort: task.estimatedEffort || "3 days",
              acceptance_criteria: task.acceptanceCriteria || [
                "Given 用户需求，When 功能实现，Then 应满足用户期望"
              ]
            }))
          }))
        }))
      };
      
      // 智能分析反馈内容并修改故事地图
      if (feedbackLower.includes('增加') || feedbackLower.includes('add') || feedbackLower.includes('新增')) {
        // 分析反馈中提到的具体功能
        let newEpicTitle = "新增功能模块";
        let newEpicDescription = "根据用户反馈新增的功能模块";
        
        if (feedbackLower.includes('阶段') || feedbackLower.includes('phase')) {
          newEpicTitle = "新增阶段";
          newEpicDescription = "根据用户反馈新增的产品阶段";
        } else if (feedbackLower.includes('设备') || feedbackLower.includes('device')) {
          newEpicTitle = "设备管理";
          newEpicDescription = "设备连接、配置和管理功能";
        } else if (feedbackLower.includes('用户') || feedbackLower.includes('user')) {
          newEpicTitle = "用户管理";
          newEpicDescription = "用户注册、登录和权限管理";
        } else if (feedbackLower.includes('数据') || feedbackLower.includes('data')) {
          newEpicTitle = "数据分析";
          newEpicDescription = "数据收集、分析和报告功能";
        } else if (feedbackLower.includes('通知') || feedbackLower.includes('notification')) {
          newEpicTitle = "通知系统";
          newEpicDescription = "消息推送和通知管理";
        }
        
        // 添加新的Epic
        baseStoryMap.epics.push({
          title: newEpicTitle,
          description: newEpicDescription,
          features: [{
            title: "核心功能",
            description: `${newEpicTitle}的核心功能实现`,
            tasks: [{
              title: `实现${newEpicTitle}基础功能`,
              description: `根据用户反馈实现${newEpicTitle}的基础功能`,
              priority: "high",
              effort: "5 days",
              acceptance_criteria: [
                "Given 用户需求明确，When 功能开发完成，Then 应满足基本使用要求",
                "Given 功能测试通过，When 用户使用，Then 应正常工作",
                "Given 用户反馈问题，When 系统修复，Then 应解决相关问题"
              ]
            }, {
              title: `优化${newEpicTitle}用户体验`,
              description: `基于用户反馈优化${newEpicTitle}的用户体验`,
              priority: "medium",
              effort: "3 days",
              acceptance_criteria: [
                "Given 用户使用反馈，When 界面优化，Then 应提升用户体验",
                "Given 性能问题存在，When 系统优化，Then 应提升响应速度",
                "Given 功能复杂，When 简化流程，Then 应降低使用门槛"
              ]
            }]
          }]
        });
      }
      
      if (feedbackLower.includes('补充') || feedbackLower.includes('完善') || feedbackLower.includes('complete')) {
        // 为现有阶段补充内容
        if (baseStoryMap.epics.length > 0) {
          const lastEpic = baseStoryMap.epics[baseStoryMap.epics.length - 1];
          
          // 检查是否需要补充活动
          if (feedbackLower.includes('活动') || feedbackLower.includes('activity')) {
            if (!lastEpic.features.some(f => f.title.includes('活动'))) {
              lastEpic.features.push({
                title: "用户活动管理",
                description: "管理用户的各种活动功能",
                tasks: [{
                  title: "实现活动创建功能",
                  description: "允许用户创建和管理活动",
                  priority: "high",
                  effort: "4 days",
                  acceptance_criteria: [
                    "Given 用户创建活动，When 填写信息，Then 应成功创建",
                    "Given 活动已创建，When 用户查看，Then 应显示完整信息",
                    "Given 活动需要修改，When 用户编辑，Then 应成功更新"
                  ]
                }, {
                  title: "实现活动参与功能",
                  description: "允许用户参与和跟踪活动",
                  priority: "medium",
                  effort: "3 days",
                  acceptance_criteria: [
                    "Given 用户参与活动，When 点击参与，Then 应成功加入",
                    "Given 活动进行中，When 用户查看，Then 应显示进度",
                    "Given 活动结束，When 用户查看，Then 应显示结果"
                  ]
                }]
              });
            }
          }
          
          // 检查是否需要补充触点
          if (feedbackLower.includes('触点') || feedbackLower.includes('touchpoint')) {
            if (!lastEpic.features.some(f => f.title.includes('触点'))) {
              lastEpic.features.push({
                title: "触点管理",
                description: "管理用户与产品的接触点",
                tasks: [{
                  title: "实现触点配置",
                  description: "配置和管理用户触点",
                  priority: "high",
                  effort: "3 days",
                  acceptance_criteria: [
                    "Given 触点需要配置，When 管理员设置，Then 应成功配置",
                    "Given 触点已配置，When 用户使用，Then 应正常工作",
                    "Given 触点需要调整，When 系统更新，Then 应及时生效"
                  ]
                }]
              });
            }
          }
          
          // 检查是否需要补充用户故事
          if (feedbackLower.includes('用户故事') || feedbackLower.includes('story')) {
            lastEpic.features.forEach(feature => {
              if (feature.tasks.length === 0) {
                feature.tasks.push({
                  title: "实现基础用户故事",
                  description: "根据用户反馈实现基础功能",
                  priority: "high",
                  effort: "3 days",
                  acceptance_criteria: [
                    "Given 用户需求明确，When 功能实现，Then 应满足用户期望",
                    "Given 功能完成，When 用户测试，Then 应正常工作",
                    "Given 用户反馈问题，When 系统修复，Then 应解决问题"
                  ]
                });
              }
            });
          }
          
          // 检查是否需要补充支撑性需求
          if (feedbackLower.includes('支撑性需求') || feedbackLower.includes('supporting')) {
            lastEpic.features.forEach(feature => {
              if (feature.tasks.length > 0) {
                feature.tasks.push({
                  title: "实现支撑性需求",
                  description: "实现支撑核心功能的辅助需求",
                  priority: "medium",
                  effort: "2 days",
                  acceptance_criteria: [
                    "Given 核心功能需要支撑，When 支撑功能实现，Then 应提供必要支持",
                    "Given 支撑功能完成，When 系统运行，Then 应稳定可靠",
                    "Given 支撑功能需要优化，When 系统改进，Then 应提升性能"
                  ]
                });
              }
            });
          }
        }
      }
      
      if (feedbackLower.includes('修改') || feedbackLower.includes('change') || feedbackLower.includes('调整')) {
        // 修改现有内容
        if (baseStoryMap.epics.length > 0) {
          const firstEpic = baseStoryMap.epics[0];
          firstEpic.title = "修改后的" + firstEpic.title;
          firstEpic.description += "（根据用户反馈进行了修改）";
          
          // 为修改的Epic添加更多详细内容
          if (firstEpic.features.length === 0) {
            firstEpic.features.push({
              title: "优化功能",
              description: "根据用户反馈优化的功能",
              tasks: [{
                title: "实现功能优化",
                description: "基于用户反馈优化现有功能",
                priority: "high",
                effort: "4 days",
                acceptance_criteria: [
                  "Given 用户反馈问题，When 功能优化，Then 应解决问题",
                  "Given 优化完成，When 用户使用，Then 应体验更好",
                  "Given 新需求出现，When 功能扩展，Then 应满足需求"
                ]
              }]
            });
          }
        }
      }
      
      if (feedbackLower.includes('删除') || feedbackLower.includes('remove')) {
        // 智能删除逻辑
        if (feedbackLower.includes('支撑性需求') || feedbackLower.includes('supporting') || feedbackLower.includes('需求')) {
          // 删除所有支撑性需求（tasks）
          baseStoryMap.epics = baseStoryMap.epics.map(epic => ({
            ...epic,
            features: epic.features.map(feature => ({
              ...feature,
              tasks: [] // 清空所有支撑性需求
            }))
          }));
        } else if (feedbackLower.includes('活动') || feedbackLower.includes('activity') || feedbackLower.includes('feature')) {
          // 删除所有活动（features）
          baseStoryMap.epics = baseStoryMap.epics.map(epic => ({
            ...epic,
            features: [] // 清空所有活动
          }));
        } else if (feedbackLower.includes('阶段') || feedbackLower.includes('phase') || feedbackLower.includes('epic')) {
          // 删除所有阶段
          baseStoryMap.epics = [];
        } else if (feedbackLower.includes('所有') || feedbackLower.includes('all')) {
          // 删除所有内容
          baseStoryMap.epics = [];
        } else {
          // 默认删除最后一个阶段
          if (baseStoryMap.epics.length > 1) {
            baseStoryMap.epics.pop();
          }
        }
      }
    } else {
      // 根据反馈内容判断应该生成什么类型的故事地图
      if (feedbackLower.includes('充电') || feedbackLower.includes('charging')) {
        baseStoryMap = this.generateChargingPileStoryMap();
      } else if (feedbackLower.includes('租车') || feedbackLower.includes('car rental')) {
        baseStoryMap = this.generateCarRentalStoryMap();
      } else if (feedbackLower.includes('电商') || feedbackLower.includes('e-commerce')) {
        baseStoryMap = this.generateEcommerceStoryMap();
      } else if (feedbackLower.includes('社交') || feedbackLower.includes('social')) {
        baseStoryMap = this.generateSocialNetworkStoryMap();
      } else if (feedbackLower.includes('任务') || feedbackLower.includes('task')) {
        baseStoryMap = this.generateTaskManagementStoryMap();
      } else {
        // 默认生成一个通用的故事地图
        baseStoryMap = {
          title: "基于反馈的产品故事地图",
          description: "根据用户反馈生成的产品功能规划",
          epics: [{
            title: "核心功能模块",
            description: "产品的主要功能模块",
            features: [{
              title: "基础功能",
              description: "产品的基础功能实现",
              tasks: [{
                title: "实现核心功能",
                description: "根据用户反馈实现核心功能",
                priority: "high",
                effort: "5 days",
                acceptance_criteria: [
                  "Given 用户需求，When 功能实现，Then 应满足用户期望",
                  "Given 功能完成，When 用户测试，Then 应正常工作",
                  "Given 用户反馈，When 系统更新，Then 应体现改进"
                ]
              }]
            }]
          }]
        };
      }
    }
    
    return baseStoryMap;
  }

  convertStoryMapToYAML(storyMap: StoryMap): string {
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
  }
} 