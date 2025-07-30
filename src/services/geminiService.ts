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