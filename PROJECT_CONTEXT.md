# 用户故事地图生成器 - 项目上下文

## 项目概述
这是一个基于AI的用户故事地图生成器，使用DeepSeek API来生成结构化的用户故事地图。项目部署在Vercel上，支持中英文双语界面。

## 最新部署
- **生产环境URL**: https://user-story-map-prod-g82i4kij2-freedomztm-7943s-projects.vercel.app
- **GitHub仓库**: https://github.com/frankzhi/user-story-map-generator-prod.git
- **最后更新**: 2025-08-06 10:24 (UTC+8)

## 最近修复和改进

### 2025-08-06 数据持久化问题修复
**问题**: 用户删除用户故事后，数据没有正确持久化。用户从主页重新进入时，删除的用户故事会重新出现。

**根本原因**: StoryMapView 组件只使用传入的 `storyMap` 作为初始值，不会从 localStorage 重新加载最新数据。

**解决方案**:
1. **修改 StoryMapView 初始化逻辑**: 使用 `useState` 的函数初始化形式，从 localStorage 加载最新数据
2. **添加错误处理**: 如果 localStorage 数据解析失败，回退到传入的 storyMap
3. **保持数据一致性**: 确保组件始终使用最新的 localStorage 数据

**技术实现**:
```typescript
const [currentStoryMap, setCurrentStoryMap] = useState<StoryMap>(() => {
  const savedStoryMap = localStorage.getItem('currentStoryMap');
  if (savedStoryMap) {
    try {
      return JSON.parse(savedStoryMap);
    } catch (e) {
      console.error('Failed to parse saved story map:', e);
      return storyMap;
    }
  }
  return storyMap;
});
```

**修复效果**:
- ✅ 用户删除故事后，数据正确保存到 localStorage
- ✅ 返回主页时，不清除 localStorage 数据
- ✅ 重新进入时，从 localStorage 加载最新数据
- ✅ 删除的用户故事不再重新出现

### 2025-08-05 触点生成优化
**问题**: 触点（Touchpoints）存在两个主要问题：
1. 平台类型不匹配：用户要求web平台，但触点显示移动APP
2. 用户类型固定：所有触点都显示"潜在客户"，没有根据实际用户类型区分

**解决方案**:
1. **动态平台检测**: 添加了`detectPlatform()`函数，根据任务内容智能判断平台类型
   - 检测关键词：web、网页、网站、小程序、PC、桌面、管理后台等
   - 默认使用Web平台而不是移动APP
   - 管理类任务自动识别为Web管理后台

2. **用户类型识别**: 添加了`detectUserType()`函数，根据任务内容识别用户角色
   - 管理员：包含"管理员"、"admin"、"管理"关键词
   - 用户：包含"用户"、"customer"、"客户"关键词  
   - 系统：包含"系统"、"system"关键词
   - 默认为普通用户

3. **触点格式优化**: 触点格式从`平台/页面`改为`平台/用户类型/页面`
   - 示例：`Web平台/用户/用户注册页面`
   - 示例：`Web管理后台/管理员/权限管理页面`

**技术实现**:
- 修改了`getTouchpointForTask()`函数
- 添加了智能检测逻辑
- 保持了原有的具体业务场景匹配
- 所有触点现在都使用动态生成的平台和用户类型

### 2025-08-05 颜色重复问题修复
**问题**: 同一活动下的用户故事出现颜色重复，影响视觉区分

**解决方案**:
- 修改了`getBorderStyle()`函数，添加`activityIndex`和`storyIndex`参数
- 使用公式：`(activityIndex * 3 + storyIndex) % colors.length`
- 确保同一活动下的不同故事有不同的边缘颜色
- 支撑性需求卡片与对应故事颜色保持一致

### 2025-08-05 支撑性需求标签修复
**问题**: 支撑性需求卡片显示"支撑性需求"而不是具体类型

**解决方案**:
- 修复了`transformToMapLayout()`函数中`type`字段丢失的问题
- 确保AI生成的`type`字段正确传递到前端
- 添加了`getSupportingRequirementTypeLabel()`函数进行类型标签转换
- 支撑性需求现在显示具体类型：软件依赖、服务集成、安全合规、性能需求

## 核心功能
1. **AI生成用户故事地图**: 基于产品描述自动生成完整的用户故事地图
2. **多语言支持**: 支持中文和英文界面
3. **故事地图可视化**: 以网格形式展示用户故事、活动和支撑性需求
4. **交互式编辑**: 支持修改优先级、状态等属性
5. **YAML导出**: 支持导出标准格式的用户故事地图
6. **本地存储**: 自动保存生成的故事地图

## 技术栈
- **前端**: React + TypeScript + Vite
- **UI框架**: Tailwind CSS
- **AI服务**: DeepSeek API
- **部署**: Vercel
- **国际化**: react-i18next

## 文件结构
```
src/
├── components/
│   ├── StoryMapView.tsx      # 故事地图视图组件
│   ├── EnhancedStoryDetail.tsx # 故事详情对话框
│   ├── HomePage.tsx          # 首页组件
│   └── LanguageSwitcher.tsx  # 语言切换器
├── services/
│   ├── aiService.ts          # AI服务接口
│   ├── deepseekService.ts    # DeepSeek API实现
│   └── storageService.ts     # 本地存储服务
├── types/
│   └── story.ts              # 类型定义
└── i18n/                     # 国际化配置
```

## 待办事项
- [x] 修复数据持久化问题 - StoryMapView 组件现在正确从 localStorage 加载最新数据
- [ ] 测试数据持久化修复效果 - 验证删除操作是否正确保存
- [ ] 测试触点生成效果 - 验证平台类型和用户类型识别是否正确
- [ ] 优化AI提示词 - 确保生成的任务包含更多平台相关信息
- [ ] 添加更多平台类型支持 - 如桌面应用、API等
- [ ] 改进用户类型识别 - 支持更多用户角色
- [ ] 配置生产环境API密钥 - 在Vercel中设置环境变量

## 已知问题
- 暂无

## 部署历史
- 2025-08-05 14:22: 触点生成优化，支持动态平台检测和用户类型识别
- 2025-08-05 13:56: 修复颜色重复问题，确保同一活动下故事颜色唯一
- 2025-08-05 13:30: 修复支撑性需求标签显示问题
- 2025-08-05 12:45: AI参数调优，增加任务数量和支撑性需求
- 2025-08-05 12:15: UI优化，修复对话框和支撑性需求显示 