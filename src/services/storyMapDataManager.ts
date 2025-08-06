import type { StoryMap } from '../types/story';

// 统一的数据状态
export interface StoryMapState {
  maps: StoryMap[];           // 所有故事地图
  currentMapId: string | null; // 当前编辑的故事地图ID
  lastUpdated: number;        // 最后更新时间戳
}

// 统一的数据管理器
export class StoryMapDataManager {
  private static readonly STORAGE_KEY = 'story_maps_unified';
  
  // 获取完整状态
  static getState(): StoryMapState {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : { maps: [], currentMapId: null, lastUpdated: Date.now() };
    } catch (error) {
      console.error('Failed to get story map state:', error);
      return { maps: [], currentMapId: null, lastUpdated: Date.now() };
    }
  }
  
  // 保存完整状态
  static setState(state: StoryMapState): void {
    try {
      const stateWithTimestamp = { ...state, lastUpdated: Date.now() };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stateWithTimestamp));
      console.log('💾 保存统一数据状态:', stateWithTimestamp);
    } catch (error) {
      console.error('Failed to save story map state:', error);
    }
  }
  
  // 获取当前编辑的故事地图
  static getCurrentMap(): StoryMap | null {
    const state = this.getState();
    const currentMap = state.maps.find(map => map.id === state.currentMapId);
    console.log('🔍 获取当前故事地图:', currentMap?.title || 'null');
    return currentMap || null;
  }
  
  // 设置当前编辑的故事地图
  static setCurrentMap(mapId: string): void {
    const state = this.getState();
    this.setState({ ...state, currentMapId: mapId });
    console.log('🎯 设置当前故事地图ID:', mapId);
  }
  
  // 添加新的故事地图
  static addStoryMap(storyMap: StoryMap): void {
    const state = this.getState();
    const updatedMaps = [storyMap, ...state.maps].slice(0, 50); // 保持最多50个
    this.setState({ ...state, maps: updatedMaps, currentMapId: storyMap.id });
    console.log('➕ 添加新故事地图:', storyMap.title);
  }
  
  // 更新故事地图
  static updateStoryMap(updatedMap: StoryMap): void {
    const state = this.getState();
    const updatedMaps = state.maps.map(map => 
      map.id === updatedMap.id ? updatedMap : map
    );
    this.setState({ ...state, maps: updatedMaps });
    console.log('🔄 更新故事地图:', updatedMap.title);
  }
  
  // 删除故事地图
  static deleteStoryMap(mapId: string): void {
    const state = this.getState();
    const updatedMaps = state.maps.filter(map => map.id !== mapId);
    const newCurrentMapId = state.currentMapId === mapId ? null : state.currentMapId;
    this.setState({ ...state, maps: updatedMaps, currentMapId: newCurrentMapId });
    console.log('🗑️ 删除故事地图:', mapId);
  }
  
  // 获取最近的故事地图（用于首页显示）
  static getRecentMaps(count: number = 5): StoryMap[] {
    const state = this.getState();
    const recentMaps = state.maps.slice(0, count);
    console.log('📋 获取最近故事地图:', recentMaps.length, '个');
    return recentMaps;
  }
  
  // 导出所有数据
  static exportData(): string {
    const state = this.getState();
    return JSON.stringify(state, null, 2);
  }
  
  // 导入数据
  static importData(jsonData: string): boolean {
    try {
      const importedState = JSON.parse(jsonData);
      if (importedState.maps && Array.isArray(importedState.maps)) {
        this.setState(importedState);
        console.log('📥 导入故事地图数据成功');
        return true;
      }
      console.error('导入数据格式无效');
      return false;
    } catch (error) {
      console.error('Failed to import story map data:', error);
      return false;
    }
  }
  
  // 数据迁移：从旧的双数据源迁移到统一数据源
  static migrateFromLegacyData(): void {
    try {
      // 检查是否已经迁移过
      const currentState = this.getState();
      if (currentState.maps.length > 0) {
        console.log('✅ 数据已迁移，跳过迁移步骤');
        return;
      }
      
      // 从旧的数据源读取数据
      const legacyMaps = localStorage.getItem('user_story_maps');
      const currentMap = localStorage.getItem('currentStoryMap');
      
      let maps: StoryMap[] = [];
      
      // 迁移历史故事地图
      if (legacyMaps) {
        try {
          maps = JSON.parse(legacyMaps);
          console.log('📦 迁移历史故事地图:', maps.length, '个');
        } catch (error) {
          console.error('迁移历史故事地图失败:', error);
        }
      }
      
      // 迁移当前故事地图
      if (currentMap) {
        try {
          const currentStoryMap = JSON.parse(currentMap);
          // 如果当前故事地图不在历史列表中，添加它
          if (!maps.find(map => map.id === currentStoryMap.id)) {
            maps.unshift(currentStoryMap);
            console.log('📦 迁移当前故事地图:', currentStoryMap.title);
          }
        } catch (error) {
          console.error('迁移当前故事地图失败:', error);
        }
      }
      
      // 保存到新的统一数据源
      if (maps.length > 0) {
        const newState: StoryMapState = {
          maps: maps.slice(0, 50), // 限制最多50个
          currentMapId: maps[0]?.id || null,
          lastUpdated: Date.now()
        };
        this.setState(newState);
        console.log('✅ 数据迁移完成');
        
        // 清理旧数据
        localStorage.removeItem('user_story_maps');
        localStorage.removeItem('currentStoryMap');
        console.log('🧹 清理旧数据完成');
      }
    } catch (error) {
      console.error('数据迁移失败:', error);
    }
  }
}
