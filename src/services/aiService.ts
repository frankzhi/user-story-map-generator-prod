import type { StoryMapYAML, Task, StoryMap } from '../types/story';
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
    // For mock demo, always return charging pile service
    // For other cases, generate based on product description
    if (productDescription.toLowerCase().includes('充电') || 
        productDescription.toLowerCase().includes('charging') ||
        productDescription.toLowerCase().includes('充电桩') ||
        productDescription.toLowerCase().includes('家用')) {
      return this.generateChargingPileStoryMap();
    } else if (productDescription.toLowerCase().includes('租车') || 
               productDescription.toLowerCase().includes('car rental') ||
               productDescription.toLowerCase().includes('vehicle') ||
               productDescription.toLowerCase().includes('车')) {
      return this.generateCarRentalStoryMap();
    } else if (productDescription.toLowerCase().includes('电商') || 
               productDescription.toLowerCase().includes('e-commerce') ||
               productDescription.toLowerCase().includes('shopping')) {
      return this.generateEcommerceStoryMap();
    } else if (productDescription.toLowerCase().includes('社交') || 
               productDescription.toLowerCase().includes('social')) {
      return this.generateSocialNetworkStoryMap();
    } else if (productDescription.toLowerCase().includes('任务') || 
               productDescription.toLowerCase().includes('task') ||
               productDescription.toLowerCase().includes('project')) {
      return this.generateTaskManagementStoryMap();
    } else {
      // Generate a generic story map based on the product description
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

  private generateCarRentalStoryMap(): StoryMapYAML {
    return {
      title: "租车服务需求描述",
      description: "在线租车平台，提供便捷的车辆租赁服务",
      epics: [
        {
          title: "用户管理模块",
          description: "用户注册、登录和个人信息管理功能",
          features: [
            {
              title: "用户注册功能",
              description: "新用户注册和账户创建",
              tasks: [
                {
                  title: "用户注册",
                  description: "实现用户注册功能，包括基本信息填写和验证",
                  priority: "high",
                  effort: "3 days",
                  acceptance_criteria: [
                    "Given 用户访问注册页面，When 填写完整信息并提交，Then 应成功创建账户",
                    "Given 用户输入无效信息，When 提交注册，Then 应显示相应错误提示",
                    "Given 用户使用已存在邮箱，When 尝试注册，Then 应提示邮箱已被使用"
                  ]
                },
                {
                  title: "邮箱验证",
                  description: "注册后发送验证邮件确认用户身份",
                  priority: "medium",
                  effort: "2 days",
                  acceptance_criteria: [
                    "Given 用户完成注册，When 系统发送验证邮件，Then 用户应收到验证链接",
                    "Given 用户点击验证链接，When 验证成功，Then 账户状态应更新为已验证"
                  ]
                }
              ]
            },
            {
              title: "用户登录功能",
              description: "已注册用户的登录和身份验证",
              tasks: [
                {
                  title: "用户登录",
                  description: "实现安全的用户登录功能",
                  priority: "high",
                  effort: "2 days",
                  acceptance_criteria: [
                    "Given 用户输入正确凭据，When 点击登录，Then 应成功登录并跳转到主页",
                    "Given 用户输入错误密码，When 尝试登录，Then 应显示密码错误提示",
                    "Given 用户连续登录失败，When 超过限制次数，Then 应临时锁定账户"
                  ]
                }
              ]
            }
          ]
        },
        {
          title: "车辆管理模块",
          description: "车辆信息管理和展示功能",
          features: [
            {
              title: "车辆展示功能",
              description: "展示可用车辆信息和详情",
              tasks: [
                {
                  title: "车辆列表展示",
                  description: "展示所有可用车辆的列表信息",
                  priority: "high",
                  effort: "4 days",
                  acceptance_criteria: [
                    "Given 用户浏览车辆列表，When 页面加载完成，Then 应显示所有可用车辆",
                    "Given 用户选择筛选条件，When 应用筛选，Then 应显示符合条件的车辆",
                    "Given 用户点击车辆详情，When 查看详情页面，Then 应显示完整的车辆信息"
                  ]
                },
                {
                  title: "车辆搜索功能",
                  description: "根据条件搜索特定车辆",
                  priority: "medium",
                  effort: "3 days",
                  acceptance_criteria: [
                    "Given 用户输入搜索关键词，When 执行搜索，Then 应返回相关车辆结果",
                    "Given 用户选择高级搜索选项，When 应用多个条件，Then 应返回精确匹配的车辆"
                  ]
                }
              ]
            }
          ]
        },
        {
          title: "订单管理模块",
          description: "租车订单的创建和管理功能",
          features: [
            {
              title: "订单创建功能",
              description: "用户创建租车订单",
              tasks: [
                {
                  title: "选择租车时间",
                  description: "用户选择租车的开始和结束时间",
                  priority: "high",
                  effort: "3 days",
                  acceptance_criteria: [
                    "Given 用户选择车辆，When 设置租车时间，Then 应显示可用时间段",
                    "Given 用户选择无效时间，When 尝试预订，Then 应提示时间冲突"
                  ]
                },
                {
                  title: "订单确认",
                  description: "确认订单信息并完成支付",
                  priority: "high",
                  effort: "4 days",
                  acceptance_criteria: [
                    "Given 用户确认订单信息，When 完成支付，Then 应创建订单并发送确认邮件",
                    "Given 支付失败，When 系统处理，Then 应保留订单并提示重新支付"
                  ]
                }
              ]
            }
          ]
        }
      ]
    };
  }

  private generateChargingPileStoryMap(): StoryMapYAML {
    return {
      title: "家用充电桩管理APP",
      description: "一款帮助用户查看家用充电桩设备状态、历史充电记录、配对/解绑设备、更改设备配置、管理充电权限的移动应用",
      epics: [
        {
          title: "设备状态监控",
          description: "实时查看充电桩的工作状态和充电情况",
          features: [
            {
              title: "实时状态显示",
              description: "展示充电桩当前的工作状态",
              tasks: [
                {
                  title: "显示充电桩连接状态",
                  description: "实时显示充电桩是否在线",
                  priority: "high",
                  effort: "2 days",
                  acceptance_criteria: [
                    "Given 在线状态每30秒自动更新，When 用户查看，Then 应显示最新状态",
                    "Given 断网时显示离线状态，When 网络恢复，Then 应自动更新为在线",
                    "Given 支持手动刷新状态，When 用户下拉刷新，Then 应立即更新状态"
                  ]
                },
                {
                  title: "显示当前充电功率",
                  description: "实时显示当前充电功率数据",
                  priority: "high",
                  effort: "3 days",
                  acceptance_criteria: [
                    "Given 功率数据每10秒更新一次，When 用户查看，Then 应显示实时功率",
                    "Given 显示单位为kW，When 用户查看，Then 应清楚显示单位",
                    "Given 异常功率值有警示标识，When 功率异常，Then 应显示红色警告"
                  ]
                },
                {
                  title: "显示充电进度",
                  description: "展示当前充电进度百分比",
                  priority: "medium",
                  effort: "2 days",
                  acceptance_criteria: [
                    "Given 进度条可视化显示，When 用户查看，Then 应看到进度条",
                    "Given 显示已充电量和剩余时间，When 充电中，Then 应显示准确信息",
                    "Given 支持点击查看详情，When 用户点击进度，Then 应显示详细充电信息"
                  ]
                }
              ]
            },
            {
              title: "异常状态提醒",
              description: "充电桩出现异常时及时通知用户",
              tasks: [
                {
                  title: "实现异常状态检测",
                  description: "监测充电桩异常状态",
                  priority: "high",
                  effort: "3 days",
                  acceptance_criteria: [
                    "Given 能检测过载、过热等常见异常，When 异常发生，Then 应立即检测到",
                    "Given 异常发生时记录日志，When 异常发生，Then 应保存详细日志",
                    "Given 异常分类明确，When 用户查看，Then 应清楚显示异常类型"
                  ]
                },
                {
                  title: "推送异常通知",
                  description: "异常发生时推送通知给用户",
                  priority: "medium",
                  effort: "2 days",
                  acceptance_criteria: [
                    "Given 支持APP内通知和手机推送，When 异常发生，Then 应同时发送两种通知",
                    "Given 通知包含异常类型和解决建议，When 用户收到通知，Then 应看到详细信息",
                    "Given 用户可设置通知静音时段，When 在静音时段，Then 应不发送通知"
                  ]
                }
              ]
            }
          ]
        },
        {
          title: "充电记录管理",
          description: "查看和分析历史充电数据",
          features: [
            {
              title: "充电记录列表",
              description: "展示历史充电记录",
              tasks: [
                {
                  title: "实现记录查询功能",
                  description: "按时间查询充电记录",
                  priority: "high",
                  effort: "3 days",
                  acceptance_criteria: [
                    "Given 支持按日/周/月筛选，When 用户选择时间范围，Then 应显示对应记录",
                    "Given 默认显示最近30条记录，When 用户打开应用，Then 应显示默认记录",
                    "Given 下拉加载更多历史记录，When 用户下拉，Then 应加载更多记录"
                  ]
                },
                {
                  title: "设计记录展示样式",
                  description: "设计充电记录列表UI",
                  priority: "medium",
                  effort: "2 days",
                  acceptance_criteria: [
                    "Given 每条记录显示日期、时长、电量，When 用户查看，Then 应清楚显示信息",
                    "Given 支持列表和日历两种视图，When 用户切换视图，Then 应正确显示",
                    "Given 点击可查看详情，When 用户点击记录，Then 应显示详细信息"
                  ]
                }
              ]
            },
            {
              title: "充电数据分析",
              description: "提供充电数据统计和分析",
              tasks: [
                {
                  title: "实现月度用电统计",
                  description: "统计每月充电数据",
                  priority: "medium",
                  effort: "3 days",
                  acceptance_criteria: [
                    "Given 显示月度总用电量和费用，When 用户查看统计，Then 应显示准确数据",
                    "Given 支持与上月数据对比，When 用户查看，Then 应显示对比结果",
                    "Given 可导出Excel报表，When 用户导出，Then 应生成完整报表"
                  ]
                },
                {
                  title: "实现充电习惯分析",
                  description: "分析用户充电习惯",
                  priority: "low",
                  effort: "4 days",
                  acceptance_criteria: [
                    "Given 识别高频充电时段，When 分析完成，Then 应显示时段统计",
                    "Given 提供节能建议，When 用户查看，Then 应显示个性化建议",
                    "Given 支持自定义分析周期，When 用户设置周期，Then 应按周期分析"
                  ]
                }
              ]
            }
          ]
        },
        {
          title: "设备管理",
          description: "充电桩设备的配对、解绑和配置",
          features: [
            {
              title: "设备配对与解绑",
              description: "管理充电桩设备连接",
              tasks: [
                {
                  title: "实现蓝牙配对功能",
                  description: "通过蓝牙连接新设备",
                  priority: "high",
                  effort: "4 days",
                  acceptance_criteria: [
                    "Given 支持扫描附近设备，When 用户开始配对，Then 应扫描到设备",
                    "Given 配对过程有明确引导，When 配对中，Then 应显示步骤指引",
                    "Given 配对成功后有确认提示，When 配对成功，Then 应显示成功提示"
                  ]
                },
                {
                  title: "实现设备解绑功能",
                  description: "解除已配对的设备",
                  priority: "medium",
                  effort: "2 days",
                  acceptance_criteria: [
                    "Given 解绑前需二次确认，When 用户解绑，Then 应弹出确认对话框",
                    "Given 解绑后清除本地缓存，When 解绑成功，Then 应清除相关数据",
                    "Given 支持远程解绑，When 远程操作，Then 应成功解绑设备"
                  ]
                }
              ]
            },
            {
              title: "设备配置管理",
              description: "修改充电桩参数设置",
              tasks: [
                {
                  title: "实现基本参数设置",
                  description: "修改充电桩基本配置",
                  priority: "high",
                  effort: "3 days",
                  acceptance_criteria: [
                    "Given 可设置充电功率上限，When 用户设置，Then 应保存设置",
                    "Given 可修改设备名称，When 用户修改，Then 应更新显示",
                    "Given 设置保存后有反馈，When 保存成功，Then 应显示成功提示"
                  ]
                },
                {
                  title: "实现定时充电功能",
                  description: "设置预约充电时间",
                  priority: "medium",
                  effort: "4 days",
                  acceptance_criteria: [
                    "Given 支持设置多个时间段，When 用户设置，Then 应保存所有时间段",
                    "Given 可启用/禁用定时功能，When 用户切换，Then 应正确启用或禁用",
                    "Given 设置冲突时有提示，When 时间冲突，Then 应显示冲突警告"
                  ]
                }
              ]
            }
          ]
        },
        {
          title: "充电权限管理",
          description: "管理可使用充电桩的人员权限",
          features: [
            {
              title: "用户权限设置",
              description: "管理可访问充电桩的用户",
              tasks: [
                {
                  title: "实现用户添加功能",
                  description: "添加新授权用户",
                  priority: "high",
                  effort: "3 days",
                  acceptance_criteria: [
                    "Given 支持通过手机号添加，When 用户输入手机号，Then 应验证并添加",
                    "Given 可设置权限有效期，When 用户设置，Then 应保存有效期",
                    "Given 添加成功发送通知，When 添加成功，Then 应发送通知给新用户"
                  ]
                },
                {
                  title: "实现权限管理界面",
                  description: "管理现有用户权限",
                  priority: "medium",
                  effort: "2 days",
                  acceptance_criteria: [
                    "Given 列表显示所有授权用户，When 用户查看，Then 应显示完整列表",
                    "Given 支持修改权限和有效期，When 用户修改，Then 应保存修改",
                    "Given 可一键撤销权限，When 用户撤销，Then 应立即生效"
                  ]
                }
              ]
            },
            {
              title: "充电限制设置",
              description: "设置不同用户的充电限制",
              tasks: [
                {
                  title: "实现充电量限制",
                  description: "设置用户最大充电量",
                  priority: "medium",
                  effort: "3 days",
                  acceptance_criteria: [
                    "Given 可按度数或百分比设置，When 用户设置，Then 应保存限制值",
                    "Given 达到限制后自动停止，When 达到限制，Then 应自动停止充电",
                    "Given 接近限制时有提醒，When 接近限制，Then 应发送提醒通知"
                  ]
                },
                {
                  title: "实现时间段限制",
                  description: "限制用户可使用时段",
                  priority: "low",
                  effort: "4 days",
                  acceptance_criteria: [
                    "Given 支持设置多个允许时段，When 用户设置，Then 应保存所有时段",
                    "Given 非允许时段无法启动充电，When 非允许时段，Then 应阻止启动",
                    "Given 时段冲突时有提示，When 时段冲突，Then 应显示冲突提示"
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
- Structured acceptance criteria table with Given-When-Then format

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
  "testCases": ["Test case 1", "Test case 2", ...],
  "structuredAcceptanceCriteria": [
    {
      "scenario": "Scenario name",
      "acceptancePoint": "Acceptance point name", 
      "givenWhenThen": "Given [condition], When [action], Then [expected result]"
    }
  ]
}

Focus on making the story more detailed, actionable, and comprehensive. Generate 3-5 structured acceptance criteria scenarios based on the story content.`;

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
        ],
        structuredAcceptanceCriteria: [
          {
            scenario: "功能实现",
            acceptancePoint: "基本功能",
            givenWhenThen: "Given 用户访问功能，When 功能实现时，Then 应该按描述工作"
          },
          {
            scenario: "用户交互",
            acceptancePoint: "用户操作",
            givenWhenThen: "Given 用户与功能交互，When 他们执行操作时，Then 应该产生预期结果"
          },
          {
            scenario: "系统处理",
            acceptancePoint: "系统响应",
            givenWhenThen: "Given 系统处理请求，When 验证通过时，Then 操作应该成功完成"
          }
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
        ],
        structuredAcceptanceCriteria: [
          {
            scenario: "Feature Implementation",
            acceptancePoint: "Basic Functionality",
            givenWhenThen: "Given the user accesses the feature, When the feature is implemented, Then it should work as described"
          },
          {
            scenario: "User Interaction",
            acceptancePoint: "User Operation",
            givenWhenThen: "Given the user interacts with the feature, When they perform the action, Then the expected result should occur"
          },
          {
            scenario: "System Processing",
            acceptancePoint: "System Response",
            givenWhenThen: "Given the system processes the request, When validation passes, Then the operation should complete successfully"
          }
        ]
      };
    }
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  async generateStoryMapWithFeedback(feedbackPrompt: string): Promise<StoryMapYAML> {
    try {
      if (this.deepseekService.isConfigured()) {
        // Use DeepSeek to process feedback and modify story map
        const response = await this.deepseekService.generateStoryMapWithFeedback(feedbackPrompt);
        return response;
      } else {
        // For mock mode, return a modified version of charging pile story map
        const baseStoryMap = this.generateChargingPileStoryMap();
        // Modify based on feedback keywords
        if (feedbackPrompt.toLowerCase().includes('增加') || feedbackPrompt.toLowerCase().includes('add')) {
          // Add a new epic
          baseStoryMap.epics.push({
            title: "新增功能模块",
            description: "根据用户反馈新增的功能模块",
            features: [{
              title: "反馈功能",
              description: "基于用户反馈实现的功能",
              tasks: [{
                title: "实现反馈处理",
                description: "处理用户反馈并更新系统",
                priority: "high",
                effort: "3 days",
                acceptance_criteria: [
                  "Given 用户提交反馈，When 系统处理，Then 应记录反馈内容",
                  "Given 反馈处理完成，When 用户查看，Then 应显示处理结果",
                  "Given 反馈涉及功能修改，When 系统更新，Then 应通知相关用户"
                ]
              }]
            }]
          });
        }
        return baseStoryMap;
      }
    } catch (error) {
      console.error('Error generating story map with feedback:', error);
      return this.generateMockStoryMap('');
    }
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