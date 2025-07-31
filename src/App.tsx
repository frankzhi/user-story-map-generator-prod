import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { HomePage } from './components/HomePage';
import { StoryMapView } from './components/StoryMapView';
import type { StoryMap } from './types/story';

// Component to handle story map view with routing
const StoryMapViewWithRouting = ({ storyMap }: { storyMap: StoryMap }) => {
  const navigate = useNavigate();
  
  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <StoryMapView
      storyMap={storyMap}
      onBack={handleBackToHome}
    />
  );
};

// Main App component with routing
function AppContent() {
  const [currentStoryMap, setCurrentStoryMap] = useState<StoryMap | null>(null);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Load story map from localStorage on component mount
  useEffect(() => {
    const savedStoryMap = localStorage.getItem('currentStoryMap');
    if (savedStoryMap) {
      try {
        const parsedStoryMap = JSON.parse(savedStoryMap);
        setCurrentStoryMap(parsedStoryMap);
      } catch (e) {
        console.error('Failed to parse saved story map:', e);
        localStorage.removeItem('currentStoryMap');
      }
    }
  }, []);

  // Save story map to localStorage whenever it changes
  useEffect(() => {
    if (currentStoryMap) {
      localStorage.setItem('currentStoryMap', JSON.stringify(currentStoryMap));
    } else {
      localStorage.removeItem('currentStoryMap');
    }
  }, [currentStoryMap]);

  const handleStoryMapGenerated = (storyMap: StoryMap) => {
    setCurrentStoryMap(storyMap);
    navigate('/story-map');
  };

  const handleBackToHome = () => {
    setCurrentStoryMap(null);
    navigate('/');
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
        <StoryMapViewWithRouting storyMap={currentStoryMap} />
      ) : (
        <HomePage onStoryMapGenerated={handleStoryMapGenerated} />
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
