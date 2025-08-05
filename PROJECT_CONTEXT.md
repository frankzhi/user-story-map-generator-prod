# 用户故事地图生成器项目上下文

## 项目基本信息

### 项目路径
- **项目根目录**: `/Users/franktianmuzhi/user-story-map-prod/`
- **Git 仓库**: `https://github.com/frankzhi/user-story-map-generator-prod.git`
- **生产环境 URL**: `https://user-story-map-prod-7duj6ocor-freedomztm-7943s-projects.vercel.app`

### 技术栈
- **前端框架**: React + TypeScript + Vite
- **UI 框架**: Tailwind CSS
- **AI 服务**: DeepSeek API, Google Gemini API
- **部署平台**: Vercel
- **国际化**: i18n

## 标准化流程

### 代码更新、打包和部署流程

#### 1. 进入项目目录
```bash
cd /Users/franktianmuzhi/user-story-map-prod
```

#### 2. 检查当前状态
```bash
git status
git log --oneline -5
```

#### 3. 进行代码修改
- 使用 `sed` 命令进行批量替换
- 或直接编辑文件
- 确保修改符合 TypeScript 语法

#### 4. 构建项目
```bash
npm run build
```

#### 5. 提交代码到 Git
```bash
git add .
git commit -m "描述性提交信息"
```

#### 6. 推送到 GitHub
```bash
git push origin main
```

#### 7. 部署到 Vercel
```bash
vercel --prod
```

#### 8. 验证部署
- 访问新的部署 URL
- 测试相关功能

#### 9. 更新项目上下文文档
```bash
# 更新文档中的部署信息
# 更新当前状态和最新提交信息
# 提交文档更新
git add PROJECT_CONTEXT.md
git commit -m "Update project context with latest deployment info"
git push origin main
```

## 当前状态

- **Commit**: `879c04d`
- **提交信息**: "Enhance AI prompt with critical distinction between user stories and technical requirements"
- **状态**: 已推送到 GitHub 和部署到 Vercel
- **部署时间**: 2025-08-04 08:13:57 UTC
- **生产环境 URL**: https://user-story-map-prod-bjc6ew1js-freedomztm-7943s-projects.vercel.app

### 最新提交
- **Commit**: `aef6493`
- **提交信息**: "Optimize AI prompts to generate more comprehensive user stories with better task breakdown"
- **状态**: 已推送到 GitHub 和部署到 Vercel
- **部署时间**: 2025-08-05 03:16:25 UTC
- **生产环境 URL**: https://user-story-map-prod-3cku8ov5r-freedomztm-7943s-projects.vercel.app

### 用户故事数量优化
1. **问题识别**：
   - 用户反馈每个活动下的用户故事数量偏少
   - 可能导致遗漏关键的业务场景和功能点
   - 需要更全面的任务分解来确保功能完整性

2. **优化策略**：
   - **任务数量要求**：从3-6个增加到4-8个任务/功能
   - **AI参数调整**：temperature从0.7增加到0.8，max_tokens从6000增加到8000
   - **提示词强化**：添加了详细的任务分解策略和示例

3. **任务分解策略**：
   - 考虑完整的用户旅程，不仅仅是基本操作
   - 包含不同用户角色（新用户、高级用户、管理员）
   - 包含边缘情况和错误场景
   - 考虑不同设备和平台
   - 包含离线/在线场景
   - 包含数据管理和隐私功能
   - 考虑性能和可扩展性要求
   - 考虑与其他系统的集成
   - 包含通知和通信功能
   - 考虑分析和报告需求

4. **具体示例**：
   - **用户注册**：从单一任务分解为8个具体任务
   - **产品搜索**：从单一任务分解为8个具体任务
   - 确保每个功能都有全面的任务覆盖

### 版本回退说明
1. **回退原因**：
   - 用户反馈最新版本出现空白页面问题
   - 用户确认 https://user-story-map-prod-r6vnjqw4q-freedomztm-7943s-projects.vercel.app 版本可用
   - 需要回退到用户验证过的工作版本

2. **回退操作**：
   - 回退到提交 `433856a`：用户确认的工作版本
   - 强制更新 main 分支
   - 重新部署到生产环境

3. **当前状态**：
   - 应用已回退到用户验证的稳定工作版本
   - 所有功能保持完整
   - 应用可以正常加载和运行

### 支撑性需求优化
1. **强制要求**：每个任务必须至少有1-2个支撑性需求
2. **技术覆盖**：支撑性需求应该覆盖每个任务的主要技术依赖
3. **调试日志**：添加了详细的任务数据日志，便于排查问题
4. **提示词强化**：
   - 明确要求每个任务都需要技术基础设施
   - 强调考虑API、数据库、SDK等技术依赖
   - 要求为每个用户故事生成相应的技术组件

### AI参数优化
1. **Temperature调整**：从0.3增加到0.7，提高AI创造性
2. **Max tokens增加**：从4000增加到6000，允许生成更多内容
3. **提示词强化**：
   - 添加了强制要求：每个feature至少生成3个任务
   - 增加了任务分解指导
   - 强调考虑不同用户场景和用例
4. **用户提示优化**：添加了具体的任务分解示例和指导

### 已修复的问题
1. ✅ **验收标准重复问题** - 只在没有AI优化数据时显示原始验收标准
2. ✅ **支撑性需求点击功能** - 实现了真正的点击功能，可以查看详细信息
3. ✅ **操作栏固定** - 对话框头部现在固定在顶部，不会在滚动时消失
4. ✅ **支撑性需求卡片优化** - 移除了描述文本，只显示标题和类型信息
5. ✅ **AI生成任务数量优化** - 调整参数和提示词，确保生成更多任务
6. ✅ **支撑性需求覆盖优化** - 强制要求每个任务都有支撑性需求

### 待解决的问题
1. **测试支撑性需求生成效果** - 验证新的强制要求是否能确保每个任务都有支撑性需求
2. **验证任务质量** - 确认生成的任务是否更加具体和全面
3. **监控生成稳定性** - 确保AI生成的内容质量稳定
4. **前端显示优化** - 在界面上展示技术规格信息
5. **配置生产环境 API 密钥** - 在 Vercel 中设置环境变量

## 核心问题与需求

### 主要问题：支撑性需求生成质量

#### 当前问题
1. **支撑性需求与用户故事过于相似**
   - 用户故事："用户通过扫描设备上的二维码将贩卖机绑定到平台"
   - 支撑性需求："扫描设备二维码进行绑定" （只是简化表述）

2. **缺少技术具体性**
   - 没有包含具体的技术版本号
   - 没有明确的 API 或 SDK 集成
   - 没有具体的技术依赖关系

3. **分类不够清晰**
   - 没有明确体现四种技术分类
   - 支撑性需求更像是功能描述而不是技术依赖

#### 期望的支撑性需求类型
1. **软件依赖 (Software Dependencies)**
   - 第三方库、框架（React、Spring Boot等）
   - 具体版本和集成要求
   - 示例："集成React 18.2.0与TypeScript 5.0进行前端开发"

2. **服务集成 (Service Integrations)**
   - 第一方和第三方服务集成
   - 具体业务领域的服务
   - 示例："集成微信支付API v3.0进行移动支付"

3. **安全与合规 (Security & Compliance)**
   - 数据安全和合规要求
   - 行业特定法规
   - 示例："实现OAuth 2.0与JWT令牌进行认证"

4. **性能需求 (Performance Requirements)**
   - 匹配业务场景的性能要求
   - 技术解决方案
   - 示例："实现Redis 7.0进行会话缓存和数据存储"

## 数据结构

### 当前数据结构 (StoryMapYAML)
```typescript
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
        supporting_requirements?: {
          title: string;
          description: string;
          type: 'software_dependency' | 'service_integration' | 'security_compliance' | 'performance_requirement';
          priority: string;
        }[];
      }[];
    }[];
  }[];
}
```

### 期望的数据结构改进
```typescript
supporting_requirements: {
  title: string;                    // 例如："集成微信支付API v3.0"
  description: string;              // 例如："集成微信支付API进行移动支付"
  type: 'software_dependency' | 'service_integration' | 'security_compliance' | 'performance_requirement';
  priority: string;                 // 优先级
  technical_specs?: {               // 技术规格（已实现）
    version: string;                // 版本号
    api_endpoint?: string;          // API端点
    sdk_name?: string;              // SDK名称
    integration_type: string;       // 集成类型
    documentation_url?: string;     // 文档URL
  };
}
```

### 最新优化内容
- **强化 AI 提示词**: 添加了具体规则避免功能描述
- **关键规则**: 要求每个支撑性需求必须提及具体的技术组件
- **错误示例**: 提供了具体的转换示例
- **验证机制**: 如果无法识别具体技术组件，则不创建支撑性需求

## 关键文件位置

### 核心服务文件
- **AI 服务**: `src/services/aiService.ts`
- **DeepSeek 服务**: `src/services/deepseekService.ts`
- **Gemini 服务**: `src/services/geminiService.ts`

### 类型定义
- **故事地图类型**: `src/types/story.ts`

### 前端组件
- **主页面**: `src/components/HomePage.tsx`
- **故事地图视图**: `src/components/StoryMapView.tsx`

## 当前状态

- **Commit**: `879c04d`
- **提交信息**: "Enhance AI prompt with critical distinction between user stories and technical requirements"
- **状态**: 已推送到 GitHub 和部署到 Vercel
- **部署时间**: 2025-08-04 08:13:57 UTC
- **生产环境 URL**: https://user-story-map-prod-bjc6ew1js-freedomztm-7943s-projects.vercel.app

### 最新提交
- **Commit**: `5620ccb`
- **提交信息**: "Strengthen AI prompts: add specific rules to avoid functional descriptions and require technical components"
- **状态**: 已推送到 GitHub 和部署到 Vercel
- **部署时间**: 2025-08-04 14:20:35 UTC
- **生产环境 URL**: https://user-story-map-prod-ip42z9ovy-freedomztm-7943s-projects.vercel.app

### 待解决的问题
1. **完全移除 mock 功能** - 部分 mock 代码仍然存在
2. **验证 AI 生成质量** - 测试强化后的提示词是否能避免功能描述
3. **前端显示优化** - 在界面上展示技术规格信息
4. **持续监控生成质量** - 确保支撑性需求都包含具体的技术组件

## 环境变量配置

### 必需的 API 密钥
```bash
VITE_DEEPSEEK_API_KEY=your_deepseek_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 环境变量文件
- **示例文件**: `.env.example`
- **本地配置**: `.env.local`

## 测试建议

### 测试场景
1. **输入**: "一个电动汽车充电服务平台"
2. **输入**: "一个移动电商应用"
3. **输入**: "一个企业级客户关系管理系统"
4. **输入**: "一个社交媒体平台"

### 验证要点
1. **支撑性需求技术化**: 检查是否包含具体的技术规格
2. **业务一致性**: 确认支撑性需求与用户故事的业务关联
3. **避免重复**: 验证相同的依赖/集成只出现一次
4. **分类正确**: 确认支撑性需求属于四种分类之一

## 文档更新指南

### 部署时文档更新清单
每次部署后，需要更新以下信息：

1. **更新最新提交信息**
   - Commit hash
   - 提交信息
   - 部署时间

2. **更新生产环境 URL**
   - 新的 Vercel 部署 URL

3. **更新当前状态**
   - 待解决的问题进展
   - 新发现的问题

4. **更新测试结果**
   - 最新的测试发现
   - 验证要点更新

### 文档更新命令
```bash
# 更新文档后提交
git add PROJECT_CONTEXT.md
git commit -m "Update project context: [具体更新内容]"
git push origin main
```

## 常见问题解决
```bash
# 恢复文件
git checkout -- filename

# 重新构建
npm run build
```

### 部署失败
```bash
# 检查 Vercel 配置
cat vercel.json

# 重新部署
vercel --prod
```

### AI 服务配置问题
```bash
# 检查环境变量
cat .env.local

# 测试 AI 配置
node test-ai-config.js
```

## 项目目标

### 短期目标
1. 完全移除 mock 数据功能
2. 更新 AI 提示词，生成真正的技术化支撑性需求
3. 验证 AI 生成质量

### 长期目标
1. 支持更多 AI 提供者
2. 改进用户界面和体验
3. 添加更多故事地图模板
4. 支持故事地图的导入导出

---

**注意**: 此文档应定期更新，确保与项目当前状态保持一致。 