export interface UserStory {
  id: string;
  title: string;
  description: string;
  type: 'epic' | 'feature' | 'task';
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in-progress' | 'done';
  acceptanceCriteria: string[];
  estimatedEffort: string;
  assignee?: string;
  dependencies?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StoryMap {
  id: string;
  title: string;
  description: string;
  epics: Epic[];
  createdAt: string;
  updatedAt: string;
}

export interface Epic {
  id: string;
  title: string;
  description: string;
  features: Feature[];
  order: number;
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  tasks: UserStory[];
  order: number;
}

export interface StoryMapYAML {
  title: string;
  description: string;
  epics: {
    title: string;
    description: string;
    features: {
      title: string;
      description: string;
      tasks: {
        title: string;
        description: string;
        priority: string;
        effort: string;
        acceptance_criteria: string[];
      }[];
    }[];
  }[];
} 