import type { StoryMap } from '../types/story';

export class StorageService {
  private static readonly STORY_MAPS_KEY = 'user_story_maps';
  private static readonly USER_PREFERENCES_KEY = 'user_preferences';
  private static readonly MAX_STORED_MAPS = 50;

  // Story Maps Storage
  static saveStoryMap(storyMap: StoryMap): void {
    try {
      const existingMaps = this.getStoryMaps();
      const updatedMaps = [storyMap, ...existingMaps].slice(0, this.MAX_STORED_MAPS);
      localStorage.setItem(this.STORY_MAPS_KEY, JSON.stringify(updatedMaps));
    } catch (error) {
      console.error('Failed to save story map:', error);
    }
  }

  static getStoryMaps(): StoryMap[] {
    try {
      const stored = localStorage.getItem(this.STORY_MAPS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get story maps:', error);
      return [];
    }
  }

  static getStoryMapById(id: string): StoryMap | null {
    const maps = this.getStoryMaps();
    return maps.find(map => map.id === id) || null;
  }

  static updateStoryMap(updatedMap: StoryMap): void {
    try {
      const maps = this.getStoryMaps();
      const index = maps.findIndex(map => map.id === updatedMap.id);
      if (index !== -1) {
        maps[index] = updatedMap;
        localStorage.setItem(this.STORY_MAPS_KEY, JSON.stringify(maps));
      }
    } catch (error) {
      console.error('Failed to update story map:', error);
    }
  }

  static deleteStoryMap(id: string): void {
    try {
      const maps = this.getStoryMaps();
      const filteredMaps = maps.filter(map => map.id !== id);
      localStorage.setItem(this.STORY_MAPS_KEY, JSON.stringify(filteredMaps));
    } catch (error) {
      console.error('Failed to delete story map:', error);
    }
  }

  static clearAllStoryMaps(): void {
    try {
      localStorage.removeItem(this.STORY_MAPS_KEY);
    } catch (error) {
      console.error('Failed to clear story maps:', error);
    }
  }

  // User Preferences Storage
  static saveUserPreferences(preferences: {
    language?: string;
    aiProvider?: string;
    theme?: string;
  }): void {
    try {
      const existing = this.getUserPreferences();
      const updated = { ...existing, ...preferences };
      localStorage.setItem(this.USER_PREFERENCES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to save user preferences:', error);
    }
  }

  static getUserPreferences(): {
    language?: string;
    aiProvider?: string;
    theme?: string;
  } {
    try {
      const stored = localStorage.getItem(this.USER_PREFERENCES_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to get user preferences:', error);
      return {};
    }
  }

  // Export/Import functionality
  static exportStoryMaps(): string {
    try {
      const maps = this.getStoryMaps();
      return JSON.stringify(maps, null, 2);
    } catch (error) {
      console.error('Failed to export story maps:', error);
      return '[]';
    }
  }

  static importStoryMaps(jsonData: string): boolean {
    try {
      const maps = JSON.parse(jsonData);
      if (Array.isArray(maps)) {
        localStorage.setItem(this.STORY_MAPS_KEY, JSON.stringify(maps));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to import story maps:', error);
      return false;
    }
  }

  // Utility methods
  static getStorageUsage(): { used: number; available: number } {
    try {
      const used = new Blob([JSON.stringify(this.getStoryMaps())]).size;
      const available = 5 * 1024 * 1024; // 5MB limit
      return { used, available };
    } catch (error) {
      return { used: 0, available: 0 };
    }
  }

  static isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }
} 