// Test script to check AI service configuration
import { AIService } from './src/services/aiService.js';
import { DeepSeekService } from './src/services/deepseekService.js';
import { GeminiService } from './src/services/geminiService.js';

console.log('🧪 Testing AI Service Configuration...\n');

// Check environment variables
console.log('Environment Variables:');
console.log('VITE_DEEPSEEK_API_KEY:', process.env.VITE_DEEPSEEK_API_KEY ? '✅ Configured' : '❌ Not Configured');
console.log('VITE_GEMINI_API_KEY:', process.env.VITE_GEMINI_API_KEY ? '✅ Configured' : '❌ Not Configured');
console.log('VITE_DEEPSEEK_API_URL:', process.env.VITE_DEEPSEEK_API_URL || 'https://api.deepseek.com/v1/chat/completions');
console.log('VITE_GEMINI_API_URL:', process.env.VITE_GEMINI_API_URL || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent');

// Check service configuration
const deepseekService = new DeepSeekService();
const geminiService = new GeminiService();
const aiService = AIService.getInstance();

console.log('\nService Configuration:');
console.log('DeepSeek Service:', deepseekService.isConfigured() ? '✅ Configured' : '❌ Not Configured');
console.log('Gemini Service:', geminiService.isConfigured() ? '✅ Configured' : '❌ Not Configured');

// Check available providers
const providers = aiService.getAvailableProviders();
console.log('\nAvailable Providers:');
providers.forEach(provider => {
  const status = provider.configured ? '✅ Configured' : '❌ Not Configured';
  console.log(`  ${provider.name}: ${status}`);
});

// Test with mock provider
console.log('\n📝 Testing with Mock Provider...');
try {
  const testDescription = 'A mobile app for food delivery';
  console.log(`Product Description: "${testDescription}"`);
  
  const result = await aiService.generateStoryMap(testDescription, 'mock');
  console.log('✅ Mock service working correctly');
  console.log(`Generated ${result.epics.length} epics`);
  
  // Check if infrastructure epic exists
  const hasInfrastructureEpic = result.epics.some(epic => 
    epic.title.toLowerCase().includes('infrastructure') || 
    epic.title.toLowerCase().includes('technical')
  );
  
  if (hasInfrastructureEpic) {
    console.log('✅ Infrastructure & Technical epic found');
  } else {
    console.log('⚠️  No Infrastructure & Technical epic found');
  }
  
} catch (error) {
  console.error('❌ Error testing mock service:', error.message);
}

console.log('\n💡 To use real AI services:');
console.log('1. Copy .env.example to .env.local');
console.log('2. Add your API keys to .env.local');
console.log('3. Restart the development server'); 