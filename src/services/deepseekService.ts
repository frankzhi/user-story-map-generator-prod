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
    const languageContext = currentLang === 'zh' ? 'Please respond in Chinese (Simplified Chinese). All content including titles, descriptions, and acceptance criteria should be in Chinese.' : 'Please respond in English.';
    
    const systemPrompt = `You are an expert product manager and user story mapping specialist. 
    
Your task is to generate a comprehensive user story map from a product description. 
The response should be a valid JSON object with the following structure:

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
- Each feature should have 3-6 tasks
- Tasks should be specific, actionable, and testable
- Priority should be based on business value and user impact
- Effort should be realistic (1-5 days per task)
- Acceptance criteria should be clear and measurable
- Focus on user value and business outcomes

ENABLING STORIES (Supporting Requirements) - CRITICAL GUIDELINES:

🚨 CRITICAL: Supporting requirements are COMPLETELY DIFFERENT from user stories. They are technical infrastructure, dependencies, and integrations that enable user stories to be delivered.

❌ WRONG EXAMPLES (DO NOT DO THIS):
- User Story: "用户输入手机号获取验证码进行登录" 
- WRONG Supporting Requirement: "实现手机号验证码登录" (This is just rephrasing!)
- User Story: "扫描附近可用的智能手表设备"
- WRONG Supporting Requirement: "蓝牙设备搜索" (This is just rephrasing!)
- User Story: "在地图上显示宠物位置标记"
- WRONG Supporting Requirement: "宠物标记点渲染" (This is just rephrasing!)
- User Story: "设计并开发列表页面"
- WRONG Supporting Requirement: "实现宠物列表UI" (This is just rephrasing!)

✅ CORRECT EXAMPLES:
- User Story: "用户输入手机号获取验证码进行登录"
- CORRECT Supporting Requirements:
  * "集成阿里云短信服务 API v2.0 用于验证码发送"
  * "实现 Redis 7.0 用于临时验证码存储和验证"
  * "配置 SSL/TLS 1.3 加密用于安全数据传输"

- User Story: "扫描附近可用的智能手表设备"
- CORRECT Supporting Requirements:
  * "集成 React Native BLE SDK v2.0 用于设备发现"
  * "实现蓝牙低功耗 (BLE) 协议 v4.2+"
  * "配置 iOS 和 Android 设备权限处理"

- User Story: "在地图上显示宠物位置标记"
- CORRECT Supporting Requirements:
  * "集成高德地图 SDK v8.0 用于位置服务"
  * "实现自定义标记渲染与 MapKit"
  * "配置实时位置跟踪与 GPS"

- User Story: "设计并开发列表页面"
- CORRECT Supporting Requirements:
  * "集成 React Native FlatList 用于高效列表渲染"
  * "实现下拉刷新与 RefreshControl"
  * "配置大数据集虚拟滚动"

Supporting requirements MUST fall into these 4 categories and include technical specifications:

1. SOFTWARE DEPENDENCIES:
   - Specific third-party libraries, frameworks, and tools with exact versions
   - Development tools and build dependencies
   - Examples:
     * "集成 React Native 0.72.0 用于跨平台移动开发"
       - technical_specs: { version: "0.72.0", sdk_name: "React Native", integration_type: "Framework Integration" }
     * "实现 Spring Boot 3.1.0 与 Java 17 用于后端服务"
       - technical_specs: { version: "3.1.0", sdk_name: "Spring Boot", integration_type: "Backend Framework" }
     * "使用 MongoDB Atlas v6.0 用于云数据库管理"
       - technical_specs: { version: "6.0", sdk_name: "MongoDB Atlas", integration_type: "Cloud Database" }
     * "集成 Redux Toolkit 1.9.0 用于状态管理"
       - technical_specs: { version: "1.9.0", sdk_name: "Redux Toolkit", integration_type: "State Management" }

2. SERVICE INTEGRATIONS:
   - External APIs and third-party services with specific versions
   - Business domain integrations with clear protocols
   - Examples:
     * "集成微信开放平台 API v3.0 用于社交登录"
       - technical_specs: { version: "3.0", api_endpoint: "https://api.weixin.qq.com", sdk_name: "WeChat Open Platform API", integration_type: "Social Login" }
     * "连接 AWS S3 SDK v2.0 用于文件存储和 CDN"
       - technical_specs: { version: "2.0", api_endpoint: "https://s3.amazonaws.com", sdk_name: "AWS S3 SDK", integration_type: "Cloud Storage" }
     * "集成阿里云物联网平台 API v1.0 用于设备管理"
       - technical_specs: { version: "1.0", api_endpoint: "https://iot.cn-shanghai.aliyuncs.com", sdk_name: "Alibaba Cloud IoT API", integration_type: "IoT Platform" }
     * "连接腾讯云 COS SDK v5.0 用于媒体存储"
       - technical_specs: { version: "5.0", api_endpoint: "https://cos.myqcloud.com", sdk_name: "Tencent Cloud COS SDK", integration_type: "Media Storage" }

3. SECURITY & COMPLIANCE:
   - Authentication and authorization systems with specific protocols
   - Data protection and privacy compliance standards
   - Examples:
     * "实现 OAuth 2.0 与 JWT 令牌 (RFC 7519) 用于身份验证"
     * "设置符合 GDPR 的数据处理与静态加密"
     * "实现 PCI DSS Level 1 合规用于支付数据处理"
     * "配置 SSL/TLS 1.3 与证书固定用于安全通信"

4. PERFORMANCE REQUIREMENTS:
   - Scalability and performance solutions with specific technologies
   - Infrastructure and deployment requirements
   - Examples:
     * "实现 Redis 7.0 集群模式用于会话缓存"
     * "设置 CDN (Cloudflare) 边缘缓存用于静态资源"
     * "配置 AWS Auto Scaling 与负载均衡器用于动态扩展"
     * "实现数据库连接池与 HikariCP v5.0"

🚨 CRITICAL RULES:

1. EVERY supporting requirement MUST mention a specific technical component (SDK, API, Library, Framework, Protocol, etc.)
2. NEVER create supporting requirements that are just functional descriptions
3. ALWAYS include the technical component name and version when applicable
4. Supporting requirements should answer "What technical dependencies do we need?" not "How do we implement this feature?"
5. If you can't identify a specific technical component, don't create a supporting requirement

EXAMPLES OF WHAT TO AVOID:
- "实现手机号输入界面" → Should be: "集成 React Native TextInput 与验证"
- "验证码校验功能" → Should be: "实现短信验证与 Twilio API v3.0"
- "宠物标记点渲染" → Should be: "集成 MapKit 用于自定义标记渲染"
- "实现宠物列表UI" → Should be: "集成 React Native FlatList 用于列表渲染"
- NEVER create supporting requirements that are just rephrased user stories
- NEVER create supporting requirements that are task breakdowns
- NEVER use generic terms like "实现" (implement), "开发" (develop), "功能" (function)
- Each supporting requirement must be a specific technical dependency, integration, or infrastructure need
- Be extremely specific about technologies, versions, APIs, and technical specifications
- Focus on what the development team needs to procure, integrate, or configure
- Supporting requirements should answer "What technical dependencies do we need?" not "How do we implement this feature?"
- If you're tempted to write something like "实现X功能", STOP and think about the actual technical dependencies needed

🔍 VALIDATION CHECKLIST:
Before generating any supporting requirement, ask yourself:
1. Is this a specific technology, library, API, or infrastructure component?
2. Does it include exact versions, protocols, or technical specifications?
3. Is it something the development team needs to procure, integrate, or configure?
4. Is it NOT just a rephrased user story with "实现" or "开发"?
5. Does it belong to one of the 4 categories above?

If the answer to any of these questions is NO, DO NOT generate that supporting requirement.

Return ONLY the JSON object, no additional text or explanations.`;

    const userPrompt = `Generate a user story map for this product: ${productDescription}`;

    const messages: DeepSeekMessage[] = [
      { role: 'system', content: systemPrompt + '\n\n' + languageContext },
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
          temperature: 0.3,
          max_tokens: 4000
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

      const storyMap = JSON.parse(jsonMatch[0]);
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

    // Add language context to the prompt
    const currentLang = i18n.language;
    const languageContext = currentLang === 'zh' ? 'Please respond in Chinese (Simplified Chinese).' : 'Please respond in English.';
    
    const messages: DeepSeekMessage[] = [
      { role: 'system', content: systemPrompt + '\n\n' + languageContext },
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
          temperature: 0.3,
          max_tokens: 4000
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
          temperature: 0.3,
          max_tokens: 4000
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