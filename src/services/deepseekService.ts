import type { StoryMapYAML } from '../types/story';
import i18n from '../i18n';

interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class DeepSeekService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    try {
      this.apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || '';
      this.apiUrl = import.meta.env.VITE_DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions';
    } catch (error) {
      console.warn('Failed to initialize DeepSeek service:', error);
      this.apiKey = '';
      this.apiUrl = 'https://api.deepseek.com/v1/chat/completions';
    }
  }

  async generateStoryMap(productDescription: string): Promise<StoryMapYAML> {
    if (!this.apiKey) {
      throw new Error('DeepSeek API key not found. Please add VITE_DEEPSEEK_API_KEY to your environment variables.');
    }

    const currentLang = i18n.language;
    const languageContext = currentLang === 'zh' ? 'Please respond in Chinese (Simplified Chinese).' : 'Please respond in English.';
    
    const systemPrompt = `You are an expert product manager and user story mapping specialist. 

Your task is to generate a comprehensive user story map from a product description. 

CRITICAL: Supporting requirements are technical dependencies, integrations, and infrastructure needs - NOT functional descriptions or rephrased user stories.

🚨 CRITICAL DISTINCTION:

USER STORIES describe WHAT users want to achieve:
- "用户想要查看宠物详情"
- "用户想要购买食物"
- "用户想要查看投喂记录"

SUPPORTING REQUIREMENTS describe WHAT TECHNICAL INFRASTRUCTURE is needed:
- "需要 MySQL 数据库存储宠物信息"
- "需要支付网关处理交易"
- "需要地图 SDK 显示位置"
- "需要 Redis 缓存提升性能"

NEVER write supporting requirements like "实现宠物详情页" - that is still a user story!

Supporting requirements MUST include:
- Specific technical components (SDKs, APIs, Libraries, Frameworks)
- Version numbers when applicable
- API endpoints when applicable
- SDK names when applicable

Examples of CORRECT supporting requirements:
- "Integrate Firebase Authentication for user authentication"
- "Implement Bluetooth Low Energy (BLE) protocol for device communication"
- "Use React Native for cross-platform mobile development"
- "Connect to AWS S3 for file storage"
- "Create MySQL database for user data storage"
- "Implement RESTful API for data communication"

Examples of WRONG supporting requirements (DO NOT DO THIS):
- "实现手机号验证码登录" (This is just rephrasing the user story!)
- "扫描附近可用的智能手表设备" (This is functional description!)
- "设备配对流程" (This is task breakdown!)
- "实现宠物详情页" (This is still a user story!)- "实现手机号验证码登录" (This is just rephrasing the user story!)
- "扫描附近可用的智能手表设备" (This is functional description!)
- "设备配对流程" (This is task breakdown!)

Return ONLY a valid JSON object with the following structure:

{
  "title": "Product Title",
  "description": "Product Description",
  "epics": [
    {
      "title": "Epic Title",
      "description": "Epic Description",
      "features": [
        {
          "title": "Feature Title",
          "description": "Feature Description",
          "tasks": [
            {
              "title": "Task Title",
              "description": "Task Description",
              "priority": "high|medium|low",
              "effort": "X days",
              "acceptance_criteria": [
                "Criteria 1",
                "Criteria 2",
                "Criteria 3"
              ],
              "supporting_requirements": [
                {
                  "title": "Supporting Requirement Title",
                  "description": "Supporting Requirement Description",
                  "type": "software_dependency|service_integration|security_compliance|performance_requirement",
                  "priority": "high|medium|low",
                  "technical_specs": {
                    "version": "Specific version number",
                    "api_endpoint": "API endpoint URL (if applicable)",
                    "sdk_name": "SDK name (if applicable)",
                    "integration_type": "Type of integration",
                    "documentation_url": "Documentation URL (if applicable)"
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}

Guidelines:
- Create 3-5 epics that cover the main functional areas
- Each epic should have 2-4 features
- Each feature should have 4-8 tasks (MANDATORY: Generate at least 4 tasks per feature to ensure comprehensive coverage)
- Each task MUST have at least 1-2 supporting requirements (MANDATORY: Every task needs technical infrastructure)
- Supporting requirements should cover the main technical dependencies for each task
- Think about what technical components are needed to implement each user story

TASK GENERATION STRATEGY:
- CRITICAL: Think about COMPLETE user journeys, not just basic actions
- Consider different user personas (new users, power users, admin users)
- Include edge cases and error scenarios
- Think about different devices and platforms
- Consider offline/online scenarios
- Include data management and privacy features
- Think about performance and scalability requirements
- Consider integration with other systems
- Include notification and communication features
- Think about analytics and reporting needs

EXAMPLES OF COMPREHENSIVE TASK BREAKDOWN:
For a "User Registration" feature, don't just create "用户注册" - break it down into:
- 用户填写注册表单
- 用户验证手机号
- 用户设置密码
- 用户同意服务条款
- 用户上传头像
- 用户完善个人资料
- 用户选择偏好设置
- 用户完成邮箱验证

For a "Product Search" feature, don't just create "搜索产品" - break it down into:
- 用户输入搜索关键词
- 用户应用筛选条件
- 用户查看搜索结果
- 用户排序搜索结果
- 用户保存搜索历史
- 用户设置搜索提醒
- 用户分享搜索结果
- 用户导出搜索结果

- Tasks should be specific, actionable, and testable
- Priority should be based on business value and user impact
- Effort should be realistic (1-5 days per task)
- Acceptance criteria should be clear and measurable
- Focus on user value and business outcomes
- IMPORTANT: Break down each feature into multiple specific tasks to ensure comprehensive coverage
- Each task should represent a distinct user action or system behavior
- Avoid generic tasks - be specific about what users want to accomplish
- Think about different user scenarios, edge cases, and user journeys
- Consider different user roles, personas, and use cases for each feature
${languageContext}`;

    const userPrompt = `Generate a user story map for this product: ${productDescription}. 

CRITICAL REQUIREMENTS:
1. For each feature, break it down into at least 4-8 specific user tasks to ensure comprehensive coverage
2. Think about COMPLETE user journeys, not just basic actions
3. Consider different user personas (new users, power users, admin users)
4. Include edge cases, error scenarios, and data management features
5. Think about different devices, platforms, and offline/online scenarios
6. Include notification, communication, analytics, and reporting features
7. Consider integration with other systems and scalability requirements

EXAMPLES OF COMPREHENSIVE BREAKDOWN:
- Don't just create "用户注册" - break it into: 填写表单、验证手机号、设置密码、同意条款、上传头像、完善资料、选择偏好、邮箱验证
- Don't just create "搜索产品" - break it into: 输入关键词、应用筛选、查看结果、排序结果、保存历史、设置提醒、分享结果、导出结果

IMPORTANT: Every task must have supporting requirements that describe the technical infrastructure needed to implement it. Think about APIs, databases, SDKs, and other technical dependencies for each user story.`;

    const messages: DeepSeekMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages,
          temperature: 0.8,
          max_tokens: 8000
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
      }

      const data: DeepSeekResponse = await response.json();
      const content = data.choices[0]?.message?.content;

      // 🔍 DEBUG: 添加调试日志
      console.log('🔍 AI 原始响应:', content);

      if (!content) {
        throw new Error('No response content from DeepSeek API');
      }

      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in DeepSeek response');
      }

      const storyMap = JSON.parse(jsonMatch[0]);

      // 🔍 DEBUG: 添加调试日志
      console.log('🔍 解析后的 JSON:', JSON.stringify(storyMap, null, 2));

      // 🔍 DEBUG: 检查支撑性需求
      if (storyMap.epics) {
        storyMap.epics.forEach((epic: any, epicIndex: number) => {
          if (epic.features) {
            epic.features.forEach((feature: any, featureIndex: number) => {
              if (feature.tasks) {
                feature.tasks.forEach((task: any, taskIndex: number) => {
                  if (task.supporting_requirements) {
                    console.log(`🔍 Epic ${epicIndex}, Feature ${featureIndex}, Task ${taskIndex} 的支撑性需求:`, task.supporting_requirements);
                  }
                });
              }
            });
          }
        });
      }

      return this.validateAndTransformResponse(storyMap);

    } catch (error) {
      console.error('DeepSeek API error:', error);
      throw new Error(`Failed to generate story map: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private validateAndTransformResponse(response: any): StoryMapYAML {
    // Basic validation
    if (!response.title || !response.description || !Array.isArray(response.epics)) {
      throw new Error('Invalid response structure from DeepSeek API');
    }

    // Transform and validate the response
    const transformed: StoryMapYAML = {
      title: response.title,
      description: response.description,
      epics: response.epics.map((epic: any) => ({
        title: epic.title || 'Untitled Epic',
        description: epic.description || '',
        features: (epic.features || []).map((feature: any) => ({
          title: feature.title || 'Untitled Feature',
          description: feature.description || '',
                      tasks: (feature.tasks || []).map((task: any) => ({
              title: task.title || 'Untitled Task',
              description: task.description || '',
              priority: task.priority || 'medium',
              effort: task.effort || '2 days',
              acceptance_criteria: Array.isArray(task.acceptance_criteria) 
                ? task.acceptance_criteria 
                : ['Acceptance criteria not specified'],
              supporting_requirements: Array.isArray(task.supporting_requirements)
                ? task.supporting_requirements.map((req: any) => ({
                    title: req.title || 'Untitled Supporting Requirement',
                    description: req.description || '',
                    type: req.type || 'software_dependency',
                    priority: req.priority || 'medium',
                    technical_specs: req.technical_specs ? {
                      version: req.technical_specs.version || '',
                      api_endpoint: req.technical_specs.api_endpoint || '',
                      sdk_name: req.technical_specs.sdk_name || '',
                      integration_type: req.technical_specs.integration_type || '',
                      documentation_url: req.technical_specs.documentation_url || ''
                    } : undefined
                  }))
                : []
            }))
        }))
      }))
    };

    return transformed;
  }

  async generateEnhancedStory(userPrompt: string, systemPrompt: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('DeepSeek API key not found. Please add VITE_DEEPSEEK_API_KEY to your environment variables.');
    }

    const messages: DeepSeekMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages,
          temperature: 0.8,
          max_tokens: 8000
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
      }

      const data: DeepSeekResponse = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response content from DeepSeek API');
      }

      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in DeepSeek response');
      }

      return JSON.parse(jsonMatch[0]);

    } catch (error) {
      console.error('DeepSeek API error:', error);
      throw new Error(`Failed to enhance story: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  isConfigured(): boolean {
    try {
      return !!this.apiKey;
    } catch (error) {
      console.warn('Error checking DeepSeek configuration:', error);
      return false;
    }
  }

  async generateStoryMapWithFeedback(currentStoryMap: any, feedbackPrompt: string): Promise<StoryMapYAML> {
    try {
      if (!this.apiKey) {
        throw new Error('DeepSeek API key not found.');
      }

      const currentLang = i18n.language;
      const languageContext = currentLang === 'zh' ? 'Please respond in Chinese (Simplified Chinese). All content including titles, descriptions, and acceptance criteria should be in Chinese.' : 'Please respond in English.';
      
      const systemPrompt = `You are an expert product manager and user story mapping specialist. 

Your task is to modify an existing user story map based on user feedback. 

IMPORTANT: Return ONLY a valid JSON object with the following structure, no additional text or explanations:

{
  "title": "Product Title",
  "description": "Product Description", 
  "epics": [
    {
      "title": "Epic Title",
      "description": "Epic Description",
      "features": [
        {
          "title": "Feature Title", 
          "description": "Feature Description",
          "tasks": [
            {
              "title": "Task Title",
              "description": "Task Description", 
              "priority": "high|medium|low",
              "effort": "X days",
              "acceptance_criteria": [
                "Criteria 1",
                "Criteria 2", 
                "Criteria 3"
              ]
            }
          ]
        }
      ]
    }
  ]
}

Guidelines for modification:
- Understand the user's feedback and modify the story map accordingly
- If user wants to add new stages/epics, create them with complete features and tasks
- If user wants to modify existing content, update it based on feedback
- If user wants to complete missing content (activities, touchpoints, user stories, supporting needs), add them appropriately
- If user wants to DELETE content:
  * "删除所有支撑性需求" or "remove all supporting needs" - Remove all tasks from all features
  * "删除所有活动" or "remove all activities" - Remove all features from all epics
  * "删除所有阶段" or "remove all phases" - Remove all epics
  * "删除所有内容" or "remove all content" - Clear the entire story map
- Maintain the overall structure and quality of the story map
- Ensure all tasks have proper priority, effort estimates, and acceptance criteria
- For supporting needs, focus on specific technical requirements that are directly related to the user stories and business functionality
- Each supporting need should be specific to the business domain and provide concrete technical know-how

${languageContext}`;

      // Convert current story map to a readable format for AI
      const currentStoryMapText = JSON.stringify(currentStoryMap, null, 2);

      const userPrompt = `Current User Story Map:
${currentStoryMapText}

User Feedback:
${feedbackPrompt}

Please modify the story map based on the user feedback and return the complete updated story map in JSON format.`;

      const messages: DeepSeekMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ];

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: messages,
          temperature: 0.8,
          max_tokens: 8000
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
      }

      const data: DeepSeekResponse = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('No response content from DeepSeek API');
      }

      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in DeepSeek response');
      }

      return JSON.parse(jsonMatch[0]);

    } catch (error) {
      console.error('Error generating story map with feedback:', error);
      throw error;
    }
  }
} 