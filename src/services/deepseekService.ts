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
    const startTime = Date.now();
    console.log('🔧 DeepSeek服务 - 开始生成故事地图');
    console.log('🔧 API密钥状态:', this.apiKey ? '已配置' : '未配置');
    console.log('⏱️ 开始时间:', new Date().toISOString());
    
    if (!this.apiKey) {
      throw new Error('DeepSeek API key not found. Please add VITE_DEEPSEEK_API_KEY to your environment variables.');
    }

    const currentLang = i18n.language;
    const languageContext = currentLang === 'zh' ? 'MANDATORY: You MUST respond in Chinese (Simplified Chinese). All content including titles, descriptions, and task names must be in Chinese.' : 'Please respond in English.';
    
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
- "实现宠物详情页" (This is still a user story!)

CRITICAL: You MUST return ONLY a valid JSON object. Do NOT include any markdown formatting, code blocks, or additional text. Do NOT wrap your response in code blocks.

Return ONLY this JSON structure:

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
- MANDATORY: If you generate fewer than 4 tasks per feature, you are not following the requirements
- Each task MUST have at least 1-2 supporting requirements (MANDATORY: Every task needs technical infrastructure)
- Supporting requirements should cover the main technical dependencies for each task
- Think about what technical components are needed to implement each user story
- MANDATORY: Break down each feature comprehensively - do not create generic tasks

TASK GENERATION STRATEGY:
- CRITICAL: Focus on essential user workflows
- Consider primary user scenarios
- Include basic error handling
- Think about core functionality
- Include fundamental data management
- Focus on key technical requirements

EXAMPLES OF COMPREHENSIVE TASK BREAKDOWN:
For a "User Registration" feature, break it down into:
- 用户填写注册表单
- 用户验证手机号

For a "Product Search" feature, break it down into:
- 用户输入搜索关键词
- 用户查看搜索结果

- Tasks should be specific, actionable, and testable
- Priority should be based on business value and user impact
- Effort should be realistic (1-3 days per task)
- Acceptance criteria should be clear and measurable
- Focus on user value and business outcomes
- IMPORTANT: Keep tasks focused and essential
- Each task should represent a distinct user action
- Avoid overly complex breakdowns
${languageContext}`;

    const userPrompt = `Generate a user story map for this product: ${productDescription}. 

CRITICAL REQUIREMENTS:
1. MANDATORY: For each feature, break it down into at least 3-4 specific user tasks
2. MANDATORY: If you generate fewer than 3 tasks per feature, you are not following the requirements
3. Focus on essential user workflows
4. Include basic error handling scenarios
5. Think about core functionality
6. Include fundamental data management
7. MANDATORY: Do not create generic tasks like "用户注册" - break them down into specific actions

EXAMPLES OF TASK BREAKDOWN:
For a "User Registration" feature, break it down into:
- 用户填写注册表单
- 用户验证手机号
- 用户设置密码

For a "Product Search" feature, break it down into:
- 用户输入搜索关键词
- 用户查看搜索结果
- 用户应用筛选条件

IMPORTANT: Every task must have supporting requirements that describe the technical infrastructure needed to implement it. Think about APIs, databases, SDKs, and other technical dependencies for each user story.

CRITICAL: Each supporting requirement MUST have a valid "type" field with one of these values:
- "software_dependency" for libraries, frameworks, SDKs
- "service_integration" for APIs, external services
- "security_compliance" for authentication, encryption, compliance
- "performance_requirement" for caching, optimization, scalability

Examples of correct type assignments:
- MySQL database → "software_dependency"
- REST API → "service_integration" 
- JWT authentication → "security_compliance"
- Redis caching → "performance_requirement"`;

    const messages: DeepSeekMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    try {
      // 创建超时控制器
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60秒超时
      
      console.log('⏱️ 准备发送API请求...');
      const requestStartTime = Date.now();
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages,
          temperature: 0.7,
          max_tokens: 8000  // 恢复原来的token数量，保持内容完整性
        }),
        signal: controller.signal
      });
      
      const requestEndTime = Date.now();
      const requestDuration = requestEndTime - requestStartTime;
      console.log('⏱️ API请求完成，耗时:', requestDuration, 'ms');
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
      }

      const apiResponseParseStartTime = Date.now();
      
      // 为 response.json() 添加超时保护
      const responseParseTimeout = 10000; // 10秒超时
      const responseParseWithTimeout = () => {
        return new Promise<DeepSeekResponse>((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error('API response parsing timeout'));
          }, responseParseTimeout);
          
          response.json()
            .then((data) => {
              clearTimeout(timeoutId);
              resolve(data);
            })
            .catch((error) => {
              clearTimeout(timeoutId);
              reject(error);
            });
        });
      };
      
      let data: DeepSeekResponse;
      try {
        data = await responseParseWithTimeout();
        const apiResponseParseEndTime = Date.now();
        console.log('⏱️ API响应解析耗时:', apiResponseParseEndTime - apiResponseParseStartTime, 'ms');
      } catch (parseError) {
        if (parseError instanceof Error && parseError.message === 'API response parsing timeout') {
          console.error('⏱️ API响应解析超时，耗时超过10秒');
          throw new Error('API response parsing timeout: Response took too long to parse');
        }
        throw parseError;
      }
      
      const content = data.choices[0]?.message?.content;

      // 🔍 DEBUG: 添加调试日志
      console.log('🔍 AI 原始响应:', content);

      if (!content) {
        throw new Error('No response content from DeepSeek API');
      }

            // Try to extract JSON from the response with better error handling and timeout protection
      const jsonExtractStartTime = Date.now();
      let storyMap;
      
      // 深度内容分析和分段解析策略
      try {
        // 1. 内容预检
        console.log('🔧 开始内容预检...');
        console.log('🔧 响应内容长度:', content.length);
        
        // 2. 检查内容特征
        const hasLongStrings = content.includes('"') && content.match(/"[^"]{100,}"/g);
        const hasSpecialChars = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(content);
        const hasUnicode = /[\u{10000}-\u{10FFFF}]/u.test(content);
        
        if (hasLongStrings) {
          console.warn('🔧 检测到超长字符串，可能影响解析性能');
        }
        if (hasSpecialChars) {
          console.warn('🔧 检测到特殊控制字符');
        }
        if (hasUnicode) {
          console.warn('🔧 检测到扩展Unicode字符');
        }
        
        // 3. 检查JSON结构完整性
        const openBraces = (content.match(/\{/g) || []).length;
        const closeBraces = (content.match(/\}/g) || []).length;
        const openBrackets = (content.match(/\[/g) || []).length;
        const closeBrackets = (content.match(/\]/g) || []).length;
        
        console.log('🔧 JSON结构检查: 大括号', openBraces, ':', closeBraces, '方括号', openBrackets, ':', closeBrackets);
        
        if (openBraces !== closeBraces || openBrackets !== closeBrackets) {
          console.warn('🔧 JSON结构不完整，可能被截断');
        }
        
        // 4. 智能内容预处理
        console.log('🔧 开始智能内容预处理...');
        let processedContent = content;
        
        // 移除可能的markdown格式
        processedContent = processedContent
          .replace(/```json\s*/g, '')
          .replace(/```\s*/g, '')
          .replace(/^["']*json["']*\s*/, '')
          .trim();
        
        // 5. 快速解析策略
        console.log('🔧 开始快速解析...');
        
        // 第一段：预处理后解析（带超时保护）
        try {
          const parseStartTime = Date.now();
          console.log('🔧 尝试预处理后解析...');
          
          // 使用超时保护，减少到3秒
          const jsonParseTimeout = 3000; // 3秒JSON解析超时
          
          const parseWithTimeout = () => {
            return new Promise((resolve, reject) => {
              const timeoutId = setTimeout(() => {
                reject(new Error('JSON parsing timeout'));
              }, jsonParseTimeout);
              
              try {
                const result = JSON.parse(processedContent);
                clearTimeout(timeoutId);
                resolve(result);
              } catch (parseError) {
                clearTimeout(timeoutId);
                reject(parseError);
              }
            });
          };
          
          storyMap = await parseWithTimeout();
          const parseEndTime = Date.now();
          console.log('🔧 预处理后解析成功，耗时:', parseEndTime - parseStartTime, 'ms');
          
        } catch (parseError) {
          if (parseError instanceof Error && parseError.message === 'JSON parsing timeout') {
            console.error('⏱️ JSON解析超时，耗时超过3秒');
            throw new Error('JSON parsing timeout: AI response took too long to parse');
          }
          
          console.warn('🔧 预处理后解析失败，尝试原始内容解析:', parseError instanceof Error ? parseError.message : 'Unknown error');
          
          // 第二段：原始内容解析
          try {
            const rawParseStartTime = Date.now();
            console.log('🔧 尝试原始内容解析...');
            storyMap = JSON.parse(content);
            const rawParseEndTime = Date.now();
            console.log('🔧 原始内容解析成功，耗时:', rawParseEndTime - rawParseStartTime, 'ms');
          } catch (rawError) {
            console.warn('🔧 原始内容解析失败，尝试JSON提取:', rawError instanceof Error ? rawError.message : 'Unknown error');
            
            // 第三段：JSON提取
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              try {
                const extractParseStartTime = Date.now();
                console.log('🔧 尝试JSON提取解析...');
                storyMap = JSON.parse(jsonMatch[0]);
                const extractParseEndTime = Date.now();
                console.log('🔧 JSON提取解析成功，耗时:', extractParseEndTime - extractParseStartTime, 'ms');
              } catch (extractError) {
                console.error('🔧 JSON提取解析失败:', extractError instanceof Error ? extractError.message : 'Unknown error');
                console.error('🔧 提取的内容长度:', jsonMatch[0].length);
                console.error('🔧 提取的内容前500字符:', jsonMatch[0].substring(0, 500));
                throw new Error('Failed to parse extracted JSON content');
              }
            } else {
              throw new Error('No valid JSON structure found in response');
            }
          }
        }
        
        console.log('🔧 快速解析完成');
        
      } catch (error) {
        console.error('🔧 JSON解析最终失败:', error instanceof Error ? error.message : 'Unknown error');
        console.error('🔧 原始内容长度:', content.length);
        console.error('🔧 原始内容前1000字符:', content.substring(0, 1000));
        throw error;
      }

      const jsonExtractEndTime = Date.now();
      console.log('⏱️ JSON提取和解析总耗时:', jsonExtractEndTime - jsonExtractStartTime, 'ms');

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

      const validationStartTime = Date.now();
      const result = this.validateAndTransformResponse(storyMap);
      const validationEndTime = Date.now();
      console.log('⏱️ 数据验证和转换耗时:', validationEndTime - validationStartTime, 'ms');
      
      const totalTime = Date.now() - startTime;
      console.log('⏱️ 总耗时:', totalTime, 'ms');
      console.log('⏱️ 结束时间:', new Date().toISOString());
      
      return result;

    } catch (error) {
      const errorTime = Date.now() - startTime;
      console.error('❌ DeepSeek API error (耗时:', errorTime, 'ms):', error);
      
      // 检查是否是超时错误
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('⏱️ 请求超时，总耗时:', errorTime, 'ms');
        throw new Error('Request timeout: AI service took too long to respond (60 seconds). Please try again.');
      }
      
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