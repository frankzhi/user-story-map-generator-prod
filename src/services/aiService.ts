import type { StoryMapYAML, Task } from '../types/story';
import { DeepSeekService } from './deepseekService';
import { GeminiService } from './geminiService';
import i18n from '../i18n';

export type AIProvider = 'deepseek' | 'gemini' | 'mock';

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

  async generateStoryMap(productDescription: string, provider: AIProvider = 'mock'): Promise<StoryMapYAML> {
    try {
      switch (provider) {
        case 'deepseek':
          if (this.deepseekService.isConfigured()) {
            return await this.deepseekService.generateStoryMap(productDescription);
          } else {
            console.warn('DeepSeek not configured, falling back to mock data');
            return this.generateMockStoryMap(productDescription);
          }
        
        case 'gemini':
          if (this.geminiService.isConfigured()) {
            return await this.geminiService.generateStoryMap(productDescription);
          } else {
            console.warn('Gemini not configured, falling back to mock data');
            return this.generateMockStoryMap(productDescription);
          }
        
        case 'mock':
        default:
          // Simulate AI processing delay
          await new Promise(resolve => setTimeout(resolve, 2000));
          return this.generateMockStoryMap(productDescription);
      }
    } catch (error) {
      console.error(`Error generating story map with ${provider}:`, error);
      // Fallback to mock data if AI service fails
      return this.generateMockStoryMap(productDescription);
    }
  }

  getAvailableProviders(): { provider: AIProvider; configured: boolean; name: string }[] {
    return [
      {
        provider: 'deepseek',
        configured: this.deepseekService.isConfigured(),
        name: 'DeepSeek'
      },
      {
        provider: 'gemini',
        configured: this.geminiService.isConfigured(),
        name: 'Google Gemini'
      },
      {
        provider: 'mock',
        configured: true,
        name: 'Mock Data (Demo)'
      }
    ];
  }

  private generateMockStoryMap(productDescription: string): StoryMapYAML {
    const keywords = productDescription.toLowerCase();
    
    // Generate different story maps based on keywords
    if (keywords.includes('ecommerce') || keywords.includes('shop') || keywords.includes('store')) {
      return this.generateEcommerceStoryMap();
    } else if (keywords.includes('social') || keywords.includes('network')) {
      return this.generateSocialNetworkStoryMap();
    } else if (keywords.includes('task') || keywords.includes('todo')) {
      return this.generateTaskManagementStoryMap();
    } else if (keywords.includes('charging') || keywords.includes('station')) {
      return this.generateChargingStationStoryMap();
    } else {
      return this.generateGenericStoryMap(productDescription);
    }
  }

  private generateEcommerceStoryMap(): StoryMapYAML {
    return {
      title: "E-commerce Platform",
      description: "A comprehensive e-commerce platform for online retail",
      epics: [
        {
          title: "User Management",
          description: "Core user account and authentication functionality",
          features: [
            {
              title: "User Registration",
              description: "Allow users to create accounts",
              tasks: [
                {
                  title: "Registration Form",
                  description: "Create user registration form with validation",
                  priority: "high",
                  effort: "3 days",
                  acceptance_criteria: [
                    "Form includes email, password, and name fields",
                    "Email validation is implemented",
                    "Password strength requirements are enforced"
                  ]
                },
                {
                  title: "Email Verification",
                  description: "Send verification email to new users",
                  priority: "medium",
                  effort: "2 days",
                  acceptance_criteria: [
                    "Verification email is sent upon registration",
                    "Email contains secure verification link",
                    "Account is activated upon email verification"
                  ]
                }
              ]
            },
            {
              title: "User Authentication",
              description: "Login and session management",
              tasks: [
                {
                  title: "Login System",
                  description: "Implement secure login functionality",
                  priority: "high",
                  effort: "2 days",
                  acceptance_criteria: [
                    "Users can login with email and password",
                    "Failed login attempts are tracked",
                    "Session tokens are securely generated"
                  ]
                }
              ]
            }
          ]
        },
        {
          title: "Product Catalog",
          description: "Product browsing and search functionality",
          features: [
            {
              title: "Product Listing",
              description: "Display products in a searchable catalog",
              tasks: [
                {
                  title: "Product Grid",
                  description: "Create responsive product grid layout",
                  priority: "high",
                  effort: "4 days",
                  acceptance_criteria: [
                    "Products display in responsive grid",
                    "Each product shows image, title, and price",
                    "Grid adapts to different screen sizes"
                  ]
                },
                {
                  title: "Search Functionality",
                  description: "Implement product search with filters",
                  priority: "medium",
                  effort: "3 days",
                  acceptance_criteria: [
                    "Users can search products by name",
                    "Filter by category, price, and rating",
                    "Search results update in real-time"
                  ]
                }
              ]
            }
          ]
        },
        {
          title: "Shopping Cart",
          description: "Cart management and checkout process",
          features: [
            {
              title: "Cart Management",
              description: "Add, remove, and update cart items",
              tasks: [
                {
                  title: "Add to Cart",
                  description: "Allow users to add products to cart",
                  priority: "high",
                  effort: "2 days",
                  acceptance_criteria: [
                    "Users can add products to cart",
                    "Cart quantity is updated",
                    "Cart persists across sessions"
                  ]
                },
                {
                  title: "Cart Review",
                  description: "Display cart contents and totals",
                  priority: "medium",
                  effort: "3 days",
                  acceptance_criteria: [
                    "Cart shows all added items",
                    "Subtotal, tax, and total are calculated",
                    "Users can modify quantities or remove items"
                  ]
                }
              ]
            }
          ]
        }
      ]
    };
  }

  private generateSocialNetworkStoryMap(): StoryMapYAML {
    return {
      title: "Social Network Platform",
      description: "A social networking platform for connecting people",
      epics: [
        {
          title: "User Profiles",
          description: "User profile creation and management",
          features: [
            {
              title: "Profile Creation",
              description: "Users can create and edit their profiles",
              tasks: [
                {
                  title: "Profile Setup",
                  description: "Create profile setup wizard",
                  priority: "high",
                  effort: "4 days",
                  acceptance_criteria: [
                    "Users can upload profile picture",
                    "Bio and personal information can be added",
                    "Profile is publicly viewable"
                  ]
                }
              ]
            }
          ]
        },
        {
          title: "Content Sharing",
          description: "Post and share content with connections",
          features: [
            {
              title: "Post Creation",
              description: "Create and share posts with text and media",
              tasks: [
                {
                  title: "Text Posts",
                  description: "Allow users to create text-based posts",
                  priority: "high",
                  effort: "3 days",
                  acceptance_criteria: [
                    "Users can write and publish text posts",
                    "Posts support basic formatting",
                    "Posts appear in user's feed"
                  ]
                }
              ]
            }
          ]
        }
      ]
    };
  }

  private generateTaskManagementStoryMap(): StoryMapYAML {
    return {
      title: "Task Management System",
      description: "A comprehensive task and project management platform",
      epics: [
        {
          title: "Task Creation",
          description: "Create and manage individual tasks",
          features: [
            {
              title: "Task Setup",
              description: "Create new tasks with details and assignments",
              tasks: [
                {
                  title: "Task Form",
                  description: "Create task creation form with all fields",
                  priority: "high",
                  effort: "3 days",
                  acceptance_criteria: [
                    "Form includes title, description, and due date",
                    "Users can assign tasks to team members",
                    "Priority levels can be set"
                  ]
                }
              ]
            }
          ]
        },
        {
          title: "Project Organization",
          description: "Organize tasks into projects and categories",
          features: [
            {
              title: "Project Management",
              description: "Create and manage project structures",
              tasks: [
                {
                  title: "Project Creation",
                  description: "Allow users to create new projects",
                  priority: "high",
                  effort: "2 days",
                  acceptance_criteria: [
                    "Users can create new projects",
                    "Projects can have multiple tasks",
                    "Project progress is tracked"
                  ]
                }
              ]
            }
          ]
        }
      ]
    };
  }

  private generateChargingStationStoryMap(): StoryMapYAML {
    return {
      title: "充电桩设备配对功能需求分析",
      description: "充电桩用户移动应用的设备管理模块，支持设备配对和管理功能",
      epics: [
        {
          title: "设备管理模块",
          description: "充电桩设备的注册、配对、管理和监控功能",
          features: [
            {
              title: "设备配对功能",
              description: "通过QR码扫描实现设备配对和用户绑定",
              tasks: [
                {
                  title: "QR码扫描功能",
                  description: "实现设备QR码扫描和识别功能",
                  priority: "high",
                  effort: "5 days",
                  acceptance_criteria: [
                    "Given 有效设备QR码，When 用户扫描成功，Then 系统应识别设备信息",
                    "Given 无效QR码，When 用户扫描，Then 应显示适当错误信息",
                    "Given 扫描请求，When 处理完成，Then 扫描过程应在5秒内完成",
                    "Given 不同格式QR码，When 系统处理，Then 应支持多种QR码格式和加密内容"
                  ]
                },
                {
                  title: "设备验证流程",
                  description: "验证设备可用性和绑定状态",
                  priority: "high",
                  effort: "4 days",
                  acceptance_criteria: [
                    "Given 设备ID，When 系统验证，Then 应返回设备详细信息",
                    "Given 已注册设备，When 检查绑定状态，Then 应确认设备可用性",
                    "Given 设备验证请求，When API处理，Then 响应时间应小于2秒",
                    "Given 设备状态检查，When 系统查询，Then 应返回准确的设备状态"
                  ]
                },
                {
                  title: "用户设备绑定",
                  description: "创建用户与设备的绑定关系",
                  priority: "high",
                  effort: "3 days",
                  acceptance_criteria: [
                    "Given 可用设备，When 用户确认绑定，Then 应创建绑定记录",
                    "Given 绑定请求，When 系统处理，Then 应使用事务处理确保数据一致性",
                    "Given 绑定操作，When 完成处理，Then 成功率应大于99.5%",
                    "Given 绑定记录，When 用户查询，Then 应支持记录的查询和管理"
                  ]
                },
                {
                  title: "绑定成功通知",
                  description: "向用户显示绑定成功信息和后续操作指引",
                  priority: "medium",
                  effort: "2 days",
                  acceptance_criteria: [
                    "Given 绑定成功，When 系统响应，Then 应显示确认信息",
                    "Given 新绑定设备，When 用户查看，Then 应提供使用指南",
                    "Given 绑定完成，When 用户操作，Then 应支持返回设备列表",
                    "Given 通知信息，When 用户阅读，Then 应清晰易懂"
                  ]
                }
              ]
            },
            {
              title: "设备管理功能",
              description: "已绑定设备的管理和监控功能",
              tasks: [
                {
                  title: "设备列表显示",
                  description: "显示用户绑定的所有设备",
                  priority: "medium",
                  effort: "3 days",
                  acceptance_criteria: [
                    "列表显示设备基本信息和状态",
                    "支持设备搜索和筛选",
                    "设备信息实时更新",
                    "列表加载时间小于1秒"
                  ]
                },
                {
                  title: "设备状态监控",
                  description: "实时监控设备运行状态",
                  priority: "medium",
                  effort: "4 days",
                  acceptance_criteria: [
                    "显示设备在线/离线状态",
                    "监控设备充电状态和功率",
                    "异常状态及时告警",
                    "状态更新频率可配置"
                  ]
                }
              ]
            }
          ]
        },
        {
          title: "用户账户管理",
          description: "用户账户相关的功能模块",
          features: [
            {
              title: "用户认证",
              description: "用户登录和身份验证功能",
              tasks: [
                {
                  title: "用户登录",
                  description: "实现安全的用户登录功能",
                  priority: "high",
                  effort: "3 days",
                  acceptance_criteria: [
                    "支持用户名/密码登录",
                    "支持手机验证码登录",
                    "登录失败时显示友好错误信息",
                    "登录状态保持和自动续期"
                  ]
                }
              ]
            }
          ]
        }
      ]
    };
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

  async enhanceStory(task: Task): Promise<any> {
    try {
      const systemPrompt = `You are an expert user story analyst and technical writer. 
      
Your task is to enhance a user story with comprehensive details including:
- Complete user story format (As a... I want... so that...)
- Detailed acceptance criteria
- Definition of Done
- Technical notes and considerations
- Business value assessment
- Story point estimation
- Dependencies and assumptions
- Risk assessment
- Test cases

Return a JSON object with the following structure:
{
  "userStory": "Complete user story in proper format",
  "acceptanceCriteria": ["Criteria 1", "Criteria 2", ...],
  "definitionOfDone": ["DoD item 1", "DoD item 2", ...],
  "technicalNotes": "Technical considerations and implementation notes",
  "businessValue": "Business value and impact assessment",
  "storyPoints": 5,
  "dependencies": ["Dependency 1", "Dependency 2", ...],
  "assumptions": ["Assumption 1", "Assumption 2", ...],
  "constraints": ["Constraint 1", "Constraint 2", ...],
  "risks": ["Risk 1", "Risk 2", ...],
  "testCases": ["Test case 1", "Test case 2", ...]
}

Focus on making the story more detailed, actionable, and comprehensive.`;

      const userPrompt = `Enhance this user story: ${task.title} - ${task.description}`;

      // Use DeepSeek if available, otherwise fall back to mock data
      if (this.deepseekService.isConfigured()) {
        const response = await this.deepseekService.generateEnhancedStory(userPrompt, systemPrompt);
        return response;
      } else {
        // Return mock enhanced data
        return this.generateMockEnhancedStory(task);
      }
    } catch (error) {
      console.error('Error enhancing story:', error);
      return this.generateMockEnhancedStory(task);
    }
  }

  private generateMockEnhancedStory(task: Task): any {
    const currentLang = i18n.language;
    
    if (currentLang === 'zh') {
      return {
        userStory: `作为${task.title.toLowerCase().includes('用户') ? '用户' : '利益相关者'}，我希望${task.description.toLowerCase()}，以便实现更好的结果并提高效率。`,
        acceptanceCriteria: [
          `Given ${task.title}，When 功能实现时，Then 应该按描述工作`,
          `Given 用户与功能交互，When 他们执行操作时，Then 应该产生预期结果`,
          `Given 系统处理请求，When 验证通过时，Then 操作应该成功完成`
        ],
        definitionOfDone: [
          "代码已编写并通过审查",
          "单元测试已实现并通过",
          "集成测试已实现并通过",
          "文档已更新",
          "功能已部署到测试环境"
        ],
        technicalNotes: "此功能需要适当的错误处理、日志记录和监控。考虑性能影响和安全最佳实践。",
        businessValue: "此功能将改善用户体验并提高运营效率，为整体业务目标做出贡献。",
        storyPoints: 5,
        dependencies: [
          "用户认证系统",
          "数据库架构更新",
          "API端点开发"
        ],
        assumptions: [
          "用户具备基本技术知识",
          "系统具备足够的性能容量",
          "无需重大基础设施变更"
        ],
        constraints: [
          "必须在现有系统架构内工作",
          "预算和时间限制适用",
          "必须遵守安全政策"
        ],
        risks: [
          "可能对现有功能产生性能影响",
          "用户采用可能比预期慢",
          "与现有系统的集成复杂性"
        ],
        testCases: [
          "测试主要工作流程的成功完成",
          "测试无效输入的错误处理",
          "测试正常负载下的性能",
          "测试与依赖系统的集成"
        ]
      };
    } else {
      return {
        userStory: `As a ${task.title.toLowerCase().includes('user') ? 'user' : 'stakeholder'}, I want ${task.description.toLowerCase()} so that I can achieve better outcomes and improve efficiency.`,
        acceptanceCriteria: [
          `Given ${task.title}, When the feature is implemented, Then it should work as described`,
          `Given the user interacts with the feature, When they perform the action, Then the expected result should occur`,
          `Given the system processes the request, When validation passes, Then the operation should complete successfully`
        ],
        definitionOfDone: [
          "Code is written and reviewed",
          "Unit tests are implemented and passing",
          "Integration tests are implemented and passing",
          "Documentation is updated",
          "Feature is deployed to staging environment"
        ],
        technicalNotes: "This feature requires proper error handling, logging, and monitoring. Consider performance implications and security best practices.",
        businessValue: "This feature will improve user experience and increase operational efficiency, contributing to overall business goals.",
        storyPoints: 5,
        dependencies: [
          "User authentication system",
          "Database schema updates",
          "API endpoint development"
        ],
        assumptions: [
          "Users have basic technical knowledge",
          "System has sufficient performance capacity",
          "No major infrastructure changes required"
        ],
        constraints: [
          "Must work within existing system architecture",
          "Budget and timeline constraints apply",
          "Must comply with security policies"
        ],
        risks: [
          "Potential performance impact on existing features",
          "User adoption may be slower than expected",
          "Integration complexity with existing systems"
        ],
        testCases: [
          "Test successful completion of the main workflow",
          "Test error handling for invalid inputs",
          "Test performance under normal load",
          "Test integration with dependent systems"
        ]
      };
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
} 