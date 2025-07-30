import type { StoryMapYAML } from '../types/story';
import { DeepSeekService } from './deepseekService';
import { GeminiService } from './geminiService';

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

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
} 