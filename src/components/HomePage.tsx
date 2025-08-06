import React, { useState, useEffect } from 'react';
import { Sparkles, FileText, Map, ArrowRight, Brain, Zap, Clock, Download, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AIService, type AIProvider } from '../services/aiService';
import { StorageService } from '../services/storageService';
import { StoryMapDataManager } from '../services/storyMapDataManager';
import { GenerationProgress } from './GenerationProgress';
import type { StoryMap } from '../types/story';
import LanguageSwitcher from './LanguageSwitcher';

interface HomePageProps {
  onStoryMapGenerated: (storyMap: StoryMap) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onStoryMapGenerated }) => {
  const { t } = useTranslation();
  const [productDescription, setProductDescription] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('deepseek');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [generationProgress, setGenerationProgress] = useState({
    currentStep: 'initializing',
    progress: 0
  });
  const [availableProviders, setAvailableProviders] = useState<Array<{ provider: AIProvider; configured: boolean; name: string }>>([]);
  const [recentMaps, setRecentMaps] = useState<StoryMap[]>([]);
  const [showRecentMaps, setShowRecentMaps] = useState(false);
  const [inputMode, setInputMode] = useState<'simple' | 'structured'>('simple');
  const [structuredData, setStructuredData] = useState({
    productName: '包充满App',
    productPositioning: '为电车车主提供第一方和第三方公共充电服务的App',
    targetUsers: '豪华进口纯电/混动车主、国产电车品牌车主',
    productForm: '包括鸿蒙系统的原生移动App',
    mainStages: [
      '寻找充电桩',
      '预约',
      '充电准备',
      '充电',
      '充电结束',
      '完成充电订单'
    ],
    mainScenarios: [
      '查看地图，搜索充电站',
      '查看充电站',
      '充电预约',
      '停车/降锁/无地锁',
      '插枪/即插即充/启动充电',
      '充电中',
      '拔枪/结束充电',
      '支付充电费用',
      '支付停车费',
      '开票',
      '服务评价',
      '其他异常场景处理'
    ],
    keyTouchpoints: [
      '包充满App',
      '充电桩显示屏',
      '车主App'
    ],
    coreFeatures: [
      '查看充电站地图、导航、第一方尊享充电站和第三方站点支持',
      '充电预约/违约处理',
      '停车场地锁控制',
      '即插即充',
      '支付充电订单/停车费',
      '开票',
      '充电状态实时查询',
      '关键状态提醒和消息推送',
      '充电权益购买和使用抵扣'
    ],
    additionalDescription: '包含常规的安全需求'
  });

  useEffect(() => {
    const aiService = AIService.getInstance();
    const providers = aiService.getAvailableProviders();
    setAvailableProviders(providers);
    
    // Auto-select the first configured AI provider, or mock if none configured
    const configuredAIProvider = providers.find(p => p.configured && p.provider !== 'mock');
    if (configuredAIProvider) {
      setSelectedProvider(configuredAIProvider.provider);
    } else {
      setSelectedProvider('mock');
    }
    
    // 确保数据迁移并加载最近故事地图
    StoryMapDataManager.migrateFromLegacyData();
    const savedMaps = StoryMapDataManager.getRecentMaps(3); // 显示最近3个故事地图
    setRecentMaps(savedMaps);
  }, []);

  // Auto-fill charging pile description when mock demo is selected
  useEffect(() => {
    if (selectedProvider === 'mock' && !productDescription.trim()) {
      setProductDescription(t('homepage.chargingPileDescription'));
    }
  }, [selectedProvider, productDescription, t]);

  const handleGenerateStoryMap = async () => {
    let finalDescription = productDescription;
    
    if (inputMode === 'structured') {
      // Convert structured data to description
      const stages = structuredData.mainStages.filter(stage => stage.trim()).map((stage, index) => `${index + 1}. ${stage}`).join('\n');
      const scenarios = structuredData.mainScenarios.filter(scenario => scenario.trim()).map((scenario, index) => `${index + 1}. ${scenario}`).join('\n');
      const touchpoints = structuredData.keyTouchpoints.filter(touchpoint => touchpoint.trim()).map((touchpoint, index) => `${index + 1}. ${touchpoint}`).join('\n');
      const features = structuredData.coreFeatures.filter(feature => feature.trim()).map((feature, index) => `${index + 1}. ${feature}`).join('\n');
      
      finalDescription = `产品名称：${structuredData.productName}
产品定位：${structuredData.productPositioning}
目标用户：${structuredData.targetUsers}
产品形态：${structuredData.productForm}

用户旅程简述
主要阶段划分：
${stages}

主要场景/活动：
${scenarios}

关键触点：
${touchpoints}

核心功能：
${features}

其他补充描述：${structuredData.additionalDescription}`;
    }
    
    if (!finalDescription.trim()) {
      setError(t('homepage.enterDescription'));
      return;
    }

    setIsGenerating(true);
    setError('');
    setGenerationProgress({ currentStep: 'initializing', progress: 0 });

    try {
      console.log('🚀 开始生成故事地图，描述:', finalDescription.substring(0, 100) + '...');
      console.log('🚀 选择的AI提供商:', selectedProvider);
      
      // 初始化阶段
      setGenerationProgress({ currentStep: 'initializing', progress: 10 });
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const aiService = AIService.getInstance();
      console.log('🚀 AI服务实例创建成功');
      
      // 连接阶段
      setGenerationProgress({ currentStep: 'connecting', progress: 25 });
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // 生成阶段
      setGenerationProgress({ currentStep: 'generating', progress: 40 });
      const yamlData = await aiService.generateStoryMap(finalDescription, selectedProvider);
      console.log('🚀 YAML数据生成成功:', yamlData);
      
      // 处理阶段
      setGenerationProgress({ currentStep: 'processing', progress: 70 });
      const storyMap = aiService.convertYAMLToStoryMap(yamlData);
      console.log('🚀 故事地图转换成功:', storyMap.title);
      
      // 完成阶段
      setGenerationProgress({ currentStep: 'finalizing', progress: 90 });
      
      // 使用统一数据管理器保存故事地图
      StoryMapDataManager.addStoryMap(storyMap);
      console.log('🚀 故事地图已保存到统一数据源');
      
      // 更新最近故事地图列表
      const updatedMaps = StoryMapDataManager.getRecentMaps(3);
      setRecentMaps(updatedMaps);
      
      setGenerationProgress({ currentStep: 'finalizing', progress: 100 });
      await new Promise(resolve => setTimeout(resolve, 200));
      
      onStoryMapGenerated(storyMap);
      console.log('🚀 故事地图生成完成，已跳转到编辑页面');
    } catch (err) {
      console.error('❌ 生成故事地图时出错:', err);
      
      // 检查是否是超时错误
      if (err instanceof Error && err.message.includes('timeout')) {
        setError('AI服务响应超时，请重试。如果问题持续存在，请稍后再试。');
      } else {
        setError(t('errors.generationFailed'));
      }
    } finally {
      setIsGenerating(false);
      setGenerationProgress({ currentStep: 'initializing', progress: 0 });
    }
  };

  const handleLoadRecentMap = (storyMap: StoryMap) => {
    // 设置为当前故事地图
    StoryMapDataManager.setCurrentMap(storyMap.id);
    onStoryMapGenerated(storyMap);
  };

  const handleExportMaps = () => {
    const data = StoryMapDataManager.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'story-maps.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportMaps = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (StoryMapDataManager.importData(content)) {
          const savedMaps = StoryMapDataManager.getRecentMaps();
          setRecentMaps(savedMaps.slice(0, 5));
        }
      };
      reader.readAsText(file);
    }
  };

  const handleStructuredDataChange = (field: string, value: string | string[], index?: number) => {
    if (typeof value === 'string' && index !== undefined) {
      const newArray = [...structuredData[field as keyof typeof structuredData] as string[]];
      newArray[index] = value;
      setStructuredData({ ...structuredData, [field]: newArray });
    } else {
      setStructuredData({ ...structuredData, [field]: value });
    }
  };

  const addStructuredItem = (field: 'mainStages' | 'mainScenarios' | 'keyTouchpoints' | 'coreFeatures') => {
    const newArray = [...structuredData[field], ''];
    setStructuredData({ ...structuredData, [field]: newArray });
  };

  const removeStructuredItem = (field: 'mainStages' | 'mainScenarios' | 'keyTouchpoints' | 'coreFeatures', index: number) => {
    const newArray = structuredData[field].filter((_, i) => i !== index);
    setStructuredData({ ...structuredData, [field]: newArray });
  };

  const exportStructuredData = () => {
    const data = JSON.stringify(structuredData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'structured-requirements.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importStructuredData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const importedData = JSON.parse(content);
          setStructuredData(importedData);
        } catch (error) {
          setError(t('homepage.structuredInput.importStructuredDataError'));
        }
      };
      reader.readAsText(file);
    }
  };

  const getProviderIcon = (provider: AIProvider) => {
    switch (provider) {
      case 'deepseek':
        return <Brain className="w-5 h-5" />;
      case 'gemini':
        return <Zap className="w-5 h-5" />;
      case 'mock':
        return <Sparkles className="w-5 h-5" />;
      default:
        return <Sparkles className="w-5 h-5" />;
    }
  };

  const getProviderColor = (provider: AIProvider) => {
    switch (provider) {
      case 'deepseek':
        return 'border-blue-500 bg-blue-50';
      case 'gemini':
        return 'border-purple-500 bg-purple-50';
      case 'mock':
        return 'border-gray-500 bg-gray-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="story-map-container min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Sparkles className="w-12 h-12 text-blue-600 mr-3" />
              <h1 className="text-4xl font-bold text-gray-900">{t('homepage.title')}</h1>
            </div>
            <LanguageSwitcher />
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('homepage.subtitle')}
          </p>
        </div>

        {/* Recent Maps */}
        {recentMaps.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                {t('homepage.recentMaps')}
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={handleExportMaps}
                  className="flex items-center px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                >
                  <Download className="w-4 h-4 mr-1" />
                  {t('common.export')}
                </button>
                <label className="flex items-center px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 cursor-pointer">
                  <Upload className="w-4 h-4 mr-1" />
                  {t('common.import')}
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportMaps}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentMaps.map((map) => (
                <button
                  key={map.id}
                  onClick={() => handleLoadRecentMap(map)}
                  className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <h4 className="font-medium text-gray-900 truncate">{map.title}</h4>
                  <p className="text-sm text-gray-600 truncate">{map.description}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(map.createdAt).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          {/* Input Mode Selection */}
          <div className="mb-6">
            <label className="block text-lg font-semibold text-gray-900 mb-3">
              {t('homepage.inputMode')}
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() => setInputMode('simple')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  inputMode === 'simple'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('homepage.simpleMode')}
              </button>
              <button
                onClick={() => setInputMode('structured')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  inputMode === 'structured'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {t('homepage.structuredMode')}
              </button>
            </div>
          </div>

          {/* Simple Input Mode */}
          {inputMode === 'simple' && (
            <div className="mb-6">
              <label htmlFor="product-description" className="block text-lg font-semibold text-gray-900 mb-3">
                {t('homepage.productDescription')}
              </label>
              <textarea
                id="product-description"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder={t('homepage.productDescriptionPlaceholder')}
                className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isGenerating}
              />
            </div>
          )}

          {/* Structured Input Mode */}
          {inputMode === 'structured' && (
            <div className="space-y-6">
              {/* Import/Export Buttons */}
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <button
                    onClick={exportStructuredData}
                    className="flex items-center px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    {t('homepage.structuredInput.exportStructuredData')}
                  </button>
                  <label className="flex items-center px-3 py-2 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 cursor-pointer">
                    <Upload className="w-4 h-4 mr-1" />
                    {t('homepage.structuredInput.importStructuredData')}
                    <input
                      type="file"
                      accept=".json"
                      onChange={importStructuredData}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              {/* Product Overview */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('homepage.structuredInput.productOverview')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('homepage.structuredInput.productName')}
                    </label>
                    <input
                      type="text"
                      value={structuredData.productName}
                      onChange={(e) => handleStructuredDataChange('productName', e.target.value)}
                      placeholder={t('homepage.structuredInput.productNamePlaceholder')}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isGenerating}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('homepage.structuredInput.productForm')}
                    </label>
                    <input
                      type="text"
                      value={structuredData.productForm}
                      onChange={(e) => handleStructuredDataChange('productForm', e.target.value)}
                      placeholder={t('homepage.structuredInput.productFormPlaceholder')}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isGenerating}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('homepage.structuredInput.productPositioning')}
                    </label>
                    <textarea
                      value={structuredData.productPositioning}
                      onChange={(e) => handleStructuredDataChange('productPositioning', e.target.value)}
                      placeholder={t('homepage.structuredInput.productPositioningPlaceholder')}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={2}
                      disabled={isGenerating}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('homepage.structuredInput.targetUsers')}
                    </label>
                    <textarea
                      value={structuredData.targetUsers}
                      onChange={(e) => handleStructuredDataChange('targetUsers', e.target.value)}
                      placeholder={t('homepage.structuredInput.targetUsersPlaceholder')}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={2}
                      disabled={isGenerating}
                    />
                  </div>
                </div>
              </div>

              {/* User Journey */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('homepage.structuredInput.userJourney')}</h3>
                
                {/* Main Stages */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('homepage.structuredInput.mainStages')}
                  </label>
                  <div className="space-y-2">
                    {structuredData.mainStages.map((stage, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 w-6">{index + 1}.</span>
                        <input
                          type="text"
                          value={stage}
                          onChange={(e) => handleStructuredDataChange('mainStages', e.target.value, index)}
                          placeholder={t('homepage.structuredInput.mainStagesPlaceholder')}
                          className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={isGenerating}
                        />
                        {structuredData.mainStages.length > 1 && (
                          <button
                            onClick={() => removeStructuredItem('mainStages', index)}
                            className="text-red-500 hover:text-red-700"
                            disabled={isGenerating}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addStructuredItem('mainStages')}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                      disabled={isGenerating}
                    >
                      + 添加阶段
                    </button>
                  </div>
                </div>

                {/* Main Scenarios */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('homepage.structuredInput.mainScenarios')}
                  </label>
                  <div className="space-y-2">
                    {structuredData.mainScenarios.map((scenario, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 w-6">{index + 1}.</span>
                        <input
                          type="text"
                          value={scenario}
                          onChange={(e) => handleStructuredDataChange('mainScenarios', e.target.value, index)}
                          placeholder={t('homepage.structuredInput.mainScenariosPlaceholder')}
                          className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={isGenerating}
                        />
                        {structuredData.mainScenarios.length > 1 && (
                          <button
                            onClick={() => removeStructuredItem('mainScenarios', index)}
                            className="text-red-500 hover:text-red-700"
                            disabled={isGenerating}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addStructuredItem('mainScenarios')}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                      disabled={isGenerating}
                    >
                      + 添加场景
                    </button>
                  </div>
                </div>

                {/* Key Touchpoints */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('homepage.structuredInput.keyTouchpoints')}
                  </label>
                  <div className="space-y-2">
                    {structuredData.keyTouchpoints.map((touchpoint, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500 w-6">{index + 1}.</span>
                        <input
                          type="text"
                          value={touchpoint}
                          onChange={(e) => handleStructuredDataChange('keyTouchpoints', e.target.value, index)}
                          placeholder={t('homepage.structuredInput.keyTouchpointsPlaceholder')}
                          className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          disabled={isGenerating}
                        />
                        {structuredData.keyTouchpoints.length > 1 && (
                          <button
                            onClick={() => removeStructuredItem('keyTouchpoints', index)}
                            className="text-red-500 hover:text-red-700"
                            disabled={isGenerating}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addStructuredItem('keyTouchpoints')}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                      disabled={isGenerating}
                    >
                      + 添加触点
                    </button>
                  </div>
                </div>
              </div>

              {/* Core Features */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('homepage.structuredInput.coreFeatures')}</h3>
                <div className="space-y-2">
                  {structuredData.coreFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 w-6">{index + 1}.</span>
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleStructuredDataChange('coreFeatures', e.target.value, index)}
                        placeholder={t('homepage.structuredInput.coreFeaturesPlaceholder')}
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isGenerating}
                      />
                      {structuredData.coreFeatures.length > 1 && (
                        <button
                          onClick={() => removeStructuredItem('coreFeatures', index)}
                          className="text-red-500 hover:text-red-700"
                          disabled={isGenerating}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addStructuredItem('coreFeatures')}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                    disabled={isGenerating}
                  >
                    + 添加功能
                  </button>
                </div>
              </div>

              {/* Additional Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('homepage.structuredInput.additionalDescription')}
                </label>
                <textarea
                  value={structuredData.additionalDescription}
                  onChange={(e) => handleStructuredDataChange('additionalDescription', e.target.value)}
                  placeholder={t('homepage.structuredInput.additionalDescriptionPlaceholder')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  disabled={isGenerating}
                />
              </div>
            </div>
          )}

          {/* AI Provider Selection */}
          <div className="mb-6">
            <label className="block text-lg font-semibold text-gray-900 mb-3">
              {t('homepage.aiProvider')}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {availableProviders.map((provider) => (
                <button
                  key={provider.provider}
                  onClick={() => setSelectedProvider(provider.provider)}
                  disabled={!provider.configured || isGenerating}
                  className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                    selectedProvider === provider.provider
                      ? getProviderColor(provider.provider) + ' ring-2 ring-blue-500'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${!provider.configured ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center mb-2">
                    {getProviderIcon(provider.provider)}
                    <span className="ml-2 font-medium text-gray-900">{t(`aiProviders.${provider.provider}`)}</span>
                  </div>
                  {!provider.configured && (
                    <p className="text-sm text-gray-500">{t('errors.apiKeyMissing')}</p>
                  )}
                  {provider.configured && (
                    <p className="text-sm text-gray-600">{t('common.ready')}</p>
                  )}
                </button>
              ))}
            </div>
            {availableProviders.filter(p => !p.configured).length > 0 && (
              <p className="text-sm text-gray-500 mt-2">
                Configure API keys in environment variables to use DeepSeek or Gemini
              </p>
            )}
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <button
            onClick={handleGenerateStoryMap}
            disabled={isGenerating || !productDescription.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Generating Story Map...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                {t('homepage.generateStoryMap')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <Sparkles className="w-8 h-8 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">AI-Powered</h3>
            </div>
            <p className="text-gray-600">
              Advanced AI analyzes your product description and generates comprehensive user stories
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <FileText className="w-8 h-8 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">YAML Export</h3>
            </div>
            <p className="text-gray-600">
              Export your story maps in YAML format for easy integration with project management tools
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <Map className="w-8 h-8 text-purple-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Visual Mapping</h3>
            </div>
            <p className="text-gray-600">
              Interactive story map visualization with detailed views for each user story
            </p>
          </div>
        </div>

        {/* Example Descriptions */}
        <div className="mt-12 bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('homepage.tryTheseExamples')}</h3>
          <div className="grid md:grid-cols-1 gap-4">
            <button
              onClick={() => setProductDescription(t('homepage.chargingPileDescription'))}
              className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <h4 className="font-medium text-gray-900">{t('homepage.chargingPileService')}</h4>
              <p className="text-sm text-gray-600">{t('homepage.chargingPileDescription')}</p>
            </button>
          </div>
        </div>
      </div>
      
      {/* 生成进度条 */}
      <GenerationProgress 
        isVisible={isGenerating}
        currentStep={generationProgress.currentStep}
        progress={generationProgress.progress}
      />
    </div>
  );
}; 