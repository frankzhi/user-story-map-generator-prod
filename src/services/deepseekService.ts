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
- For supporting needs generation, focus on specific technical requirements related to the business domain, avoid generic infrastructure needs like "ensure system stability", "optimize response time", "implement load balancing" unless they are specifically relevant to the business context

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

  async generateStoryMapWithFeedback(feedbackPrompt: string): Promise<any> {
    try {
      if (!this.apiKey) {
        throw new Error('DeepSeek API key not found.');
      }

      const currentLang = i18n.language;
      const languageContext = currentLang === 'zh' ? 'Please respond in Chinese (Simplified Chinese).' : 'Please respond in English.';
      
      const systemPrompt = `你是一个专业的用户故事地图分析师。请根据用户提供的反馈意见，修改现有的用户故事地图。

请确保：
1. 保持原有的故事地图结构
2. 根据用户反馈调整相关的内容
3. 确保修改后的故事地图更加符合用户需求
4. 返回完整的修改后的JSON格式故事地图

请直接返回修改后的JSON格式故事地图，不要包含其他解释文字。JSON格式应该包含：
- title: 故事地图标题
- description: 故事地图描述
- epics: 阶段数组，每个阶段包含features数组，每个feature包含tasks数组

${languageContext}`;

      const messages: DeepSeekMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: feedbackPrompt }
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
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data: DeepSeekResponse = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from DeepSeek API');
      }

      return content;
    } catch (error) {
      console.error('Error generating story map with feedback:', error);
      throw error;
    }
  }
} 