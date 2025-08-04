import type { StoryMapYAML } from '../types/story';



interface GeminiRequest {
  contents: Array<{
    role: 'user';
    parts: Array<{
      text: string;
    }>;
  }>;
  generationConfig: {
    temperature: number;
    maxOutputTokens: number;
  };
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export class GeminiService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    try {
      this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
      this.apiUrl = import.meta.env.VITE_GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    } catch (error) {
      console.warn('Failed to initialize Gemini service:', error);
      this.apiKey = '';
      this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    }
  }

  async generateStoryMap(productDescription: string): Promise<StoryMapYAML> {
    if (!this.apiKey) {
      throw new Error('Gemini API key not found. Please add VITE_GEMINI_API_KEY to your environment variables.');
    }

    const prompt = `You are an expert product manager and user story mapping specialist.

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

Supporting requirements MUST fall into these 4 categories:

1. SOFTWARE DEPENDENCIES:
   - Specific third-party libraries, frameworks, and tools with exact versions
   - Development tools and build dependencies
   - Examples:
     * "Integrate React Native 0.72.0 for cross-platform mobile development"
     * "Implement Spring Boot 3.1.0 with Java 17 for backend services"
     * "Use MongoDB Atlas v6.0 for cloud database management"
     * "Integrate Redux Toolkit 1.9.0 for state management"

2. SERVICE INTEGRATIONS:
   - External APIs and third-party services with specific versions
   - Business domain integrations with clear protocols
   - Examples:
     * "Integrate with WeChat Open Platform API v3.0 for social login"
     * "Connect to AWS S3 SDK v2.0 for file storage and CDN"
     * "Integrate with Alibaba Cloud IoT Platform API v1.0 for device management"
     * "Connect to Tencent Cloud COS SDK v5.0 for media storage"

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
     * "Configure AWS Auto Scaling with load balancer for dynamic scaling"
     * "Implement database connection pooling with HikariCP v5.0"

🚨 CRITICAL RULES:
- NEVER create supporting requirements that are just rephrased user stories
- NEVER create supporting requirements that are task breakdowns
- NEVER use generic terms like "实现" (implement), "开发" (develop), "功能" (function)
- Each supporting requirement must be a specific technical dependency, integration, or infrastructure need
- Be extremely specific about technologies, versions, APIs, and technical specifications
- Focus on what the development team needs to procure, integrate, or configure
- Supporting requirements should answer "What technical dependencies do we need?" not "How do we implement this feature?"
- If you're tempted to write something like "实现X功能", STOP and think about the actual technical dependencies needed

Generate a user story map for this product: ${productDescription}

Return ONLY the JSON object, no additional text or explanations.`;

    const requestBody: GeminiRequest = {
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4000
      }
    };

    try {
      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data: GeminiResponse = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!content) {
        throw new Error('No response content from Gemini API');
      }

      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in Gemini response');
      }

      const storyMap = JSON.parse(jsonMatch[0]);
      return this.validateAndTransformResponse(storyMap);

    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error(`Failed to generate story map: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private validateAndTransformResponse(response: any): StoryMapYAML {
    // Basic validation
    if (!response.title || !response.description || !Array.isArray(response.epics)) {
      throw new Error('Invalid response structure from Gemini API');
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

  isConfigured(): boolean {
    try {
      return !!this.apiKey;
    } catch (error) {
      console.warn('Error checking Gemini configuration:', error);
      return false;
    }
  }
} 