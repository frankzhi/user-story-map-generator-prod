import { useState } from 'react';
import { HomePage } from './components/HomePage';
import { StoryMapView } from './components/StoryMapView';
import type { StoryMap } from './types/story';

function App() {
  const [currentStoryMap, setCurrentStoryMap] = useState<StoryMap | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStoryMapGenerated = (storyMap: StoryMap) => {
    setCurrentStoryMap(storyMap);
  };

  const handleBackToHome = () => {
    setCurrentStoryMap(null);
  };

  // Simple error boundary
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {currentStoryMap ? (
        <StoryMapView
          storyMap={currentStoryMap}
          onBack={handleBackToHome}
        />
      ) : (
        <HomePage onStoryMapGenerated={handleStoryMapGenerated} />
      )}
    </div>
  );
}

export default App;
