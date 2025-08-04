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
  * "Integrate Alibaba Cloud SMS API v2.0 for verification code delivery"
  * "Implement Redis 7.0 for temporary code storage and validation"
  * "Set up SSL/TLS 1.3 encryption for secure data transmission"

- User Story: "扫描附近可用的智能手表设备"
- CORRECT Supporting Requirements:
  * "Integrate React Native BLE SDK v2.0 for device discovery"
  * "Implement Bluetooth Low Energy (BLE) protocol v4.2+"
  * "Configure device permission handling for iOS and Android"

- User Story: "在地图上显示宠物位置标记"
- CORRECT Supporting Requirements:
  * "Integrate Gaode Map SDK v8.0 for location services"
  * "Implement custom marker rendering with MapKit"
  * "Configure real-time location tracking with GPS"

- User Story: "设计并开发列表页面"
- CORRECT Supporting Requirements:
  * "Integrate React Native FlatList for efficient list rendering"
  * "Implement pull-to-refresh with RefreshControl"
  * "Configure virtual scrolling for large datasets"

Supporting requirements MUST fall into these 4 categories and include technical specifications:

1. SOFTWARE DEPENDENCIES:
   - Specific third-party libraries, frameworks, and tools with exact versions
   - Development tools and build dependencies
   - Examples:
     * "Integrate React Native 0.72.0 for cross-platform mobile development"
       - technical_specs: { version: "0.72.0", sdk_name: "React Native", integration_type: "Framework Integration" }
     * "Implement Spring Boot 3.1.0 with Java 17 for backend services"
       - technical_specs: { version: "3.1.0", sdk_name: "Spring Boot", integration_type: "Backend Framework" }
     * "Use MongoDB Atlas v6.0 for cloud database management"
       - technical_specs: { version: "6.0", sdk_name: "MongoDB Atlas", integration_type: "Cloud Database" }
     * "Integrate Redux Toolkit 1.9.0 for state management"
       - technical_specs: { version: "1.9.0", sdk_name: "Redux Toolkit", integration_type: "State Management" }

2. SERVICE INTEGRATIONS:
   - External APIs and third-party services with specific versions
   - Business domain integrations with clear protocols
   - Examples:
     * "Integrate with WeChat Open Platform API v3.0 for social login"
       - technical_specs: { version: "3.0", api_endpoint: "https://api.weixin.qq.com", sdk_name: "WeChat Open Platform API", integration_type: "Social Login" }
     * "Connect to AWS S3 SDK v2.0 for file storage and CDN"
       - technical_specs: { version: "2.0", api_endpoint: "https://s3.amazonaws.com", sdk_name: "AWS S3 SDK", integration_type: "Cloud Storage" }
     * "Integrate with Alibaba Cloud IoT Platform API v1.0 for device management"
       - technical_specs: { version: "1.0", api_endpoint: "https://iot.cn-shanghai.aliyuncs.com", sdk_name: "Alibaba Cloud IoT API", integration_type: "IoT Platform" }
     * "Connect to Tencent Cloud COS SDK v5.0 for media storage"
       - technical_specs: { version: "5.0", api_endpoint: "https://cos.myqcloud.com", sdk_name: "Tencent Cloud COS SDK", integration_type: "Media Storage" }

3. SECURITY & COMPLIANCE:
   - Authentication and authorization systems with specific protocols
   - Data protection and privacy compliance standards
   - Examples:
     * "Implement OAuth 2.0 with JWT tokens (RFC 7519) for authentication"
     * "Set up GDPR-compliant data processing with encryption at rest"
     * "Implement PCI DSS Level 1 compliance for payment data handling"
     * "Configure SSL/TLS 1.3 with certificate pinning for secure communication"

4. PERFORMANCE REQUIREMENTS:
   - Scalability and performance solutions with specific technologies
   - Infrastructure and deployment requirements
   - Examples:
     * "Implement Redis 7.0 with cluster mode for session caching"
     * "Set up CDN (Cloudflare) with edge caching for static assets"
     * "Configure AWS Auto Scaling with load balancer for dynamic scaling"
     * "Implement database connection pooling with HikariCP v5.0"

🚨 CRITICAL RULES:

1. EVERY supporting requirement MUST mention a specific technical component (SDK, API, Library, Framework, Protocol, etc.)
2. NEVER create supporting requirements that are just functional descriptions
3. ALWAYS include the technical component name and version when applicable
4. Supporting requirements should answer "What technical dependencies do we need?" not "How do we implement this feature?"
5. If you can't identify a specific technical component, don't create a supporting requirement

EXAMPLES OF WHAT TO AVOID:
- "实现手机号输入界面" → Should be: "Integrate React Native TextInput with validation"
- "验证码校验功能" → Should be: "Implement SMS verification with Twilio API v3.0"
- "宠物标记点渲染" → Should be: "Integrate MapKit for custom marker rendering"
- "实现宠物列表UI" → Should be: "Integrate React Native FlatList for list rendering"
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
          temperature: 0.7,
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
              : ['Acceptance criteria not specified']
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
          temperature: 0.7,
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
          temperature: 0.7,
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