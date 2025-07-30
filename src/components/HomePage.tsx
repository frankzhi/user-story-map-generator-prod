import React, { useState, useEffect } from 'react';
import { Sparkles, FileText, Map, ArrowRight, Brain, Zap } from 'lucide-react';
import { AIService, type AIProvider } from '../services/aiService';
import type { StoryMap } from '../types/story';

interface HomePageProps {
  onStoryMapGenerated: (storyMap: StoryMap) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onStoryMapGenerated }) => {
  const [productDescription, setProductDescription] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('mock');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [availableProviders, setAvailableProviders] = useState<Array<{ provider: AIProvider; configured: boolean; name: string }>>([]);

  useEffect(() => {
    const aiService = AIService.getInstance();
    setAvailableProviders(aiService.getAvailableProviders());
  }, []);

  const handleGenerateStoryMap = async () => {
    if (!productDescription.trim()) {
      setError('Please enter a product description');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const aiService = AIService.getInstance();
      const yamlData = await aiService.generateStoryMap(productDescription, selectedProvider);
      const storyMap = aiService.convertYAMLToStoryMap(yamlData);
      onStoryMapGenerated(storyMap);
    } catch (err) {
      setError('Failed to generate story map. Please try again.');
      console.error('Error generating story map:', err);
    } finally {
      setIsGenerating(false);
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
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-12 h-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">User Story Map Generator</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your product ideas into comprehensive user story maps with AI-powered generation
          </p>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="mb-6">
            <label htmlFor="product-description" className="block text-lg font-semibold text-gray-900 mb-3">
              Describe Your Product
            </label>
            <textarea
              id="product-description"
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              placeholder="Describe your product or feature idea. For example: 'An e-commerce platform for selling handmade crafts' or 'A social networking app for pet owners'"
              className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={isGenerating}
            />
          </div>

          {/* AI Provider Selection */}
          <div className="mb-6">
            <label className="block text-lg font-semibold text-gray-900 mb-3">
              Choose AI Provider
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
                    <span className="ml-2 font-medium text-gray-900">{provider.name}</span>
                  </div>
                  {!provider.configured && (
                    <p className="text-sm text-gray-500">Not configured</p>
                  )}
                  {provider.configured && (
                    <p className="text-sm text-gray-600">Ready to use</p>
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
                Generate Story Map
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Try These Examples:</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => setProductDescription('An e-commerce platform for selling handmade crafts and artisanal products')}
              className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <h4 className="font-medium text-gray-900">E-commerce Platform</h4>
              <p className="text-sm text-gray-600">Handmade crafts marketplace</p>
            </button>
            <button
              onClick={() => setProductDescription('A social networking app for pet owners to connect and share pet photos')}
              className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <h4 className="font-medium text-gray-900">Social Pet Network</h4>
              <p className="text-sm text-gray-600">Pet owner community app</p>
            </button>
            <button
              onClick={() => setProductDescription('A task management system for remote teams with project tracking')}
              className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <h4 className="font-medium text-gray-900">Task Management</h4>
              <p className="text-sm text-gray-600">Remote team collaboration</p>
            </button>
            <button
              onClick={() => setProductDescription('A fitness tracking app with workout plans and progress monitoring')}
              className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <h4 className="font-medium text-gray-900">Fitness Tracker</h4>
              <p className="text-sm text-gray-600">Workout and progress tracking</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 